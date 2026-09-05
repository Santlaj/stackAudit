"use client";

import React, { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { sendHeartbeat } from "@/lib/api";

const HEARTBEAT_INTERVAL_MS = 30_000;
const TICK_MS = 1_000;

/**
 * Global application-level active-time tracker.
 * Only contributes active time when:
 * 1. User is authenticated (session?.user?.id exists)
 * 2. document.visibilityState === "visible"
 * 3. document.hasFocus() === true
 */
export function ActiveTimeTracker() {
  const { data: session } = useSession();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedMsRef = useRef<number>(0);
  const isSendingRef = useRef<boolean>(false);

  useEffect(() => {
    // Only track authenticated users
    if (!session?.user?.id) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      accumulatedMsRef.current = 0;
      return;
    }

    const checkIsActive = (): boolean => {
      if (typeof document === "undefined") return false;
      return document.visibilityState === "visible" && document.hasFocus();
    };

    const triggerHeartbeat = async () => {
      if (!checkIsActive() || isSendingRef.current) return;
      try {
        isSendingRef.current = true;
        const res = await sendHeartbeat();
        if (res && res.accepted && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("stackaudit:activity-updated", { detail: res }));
        }
      } catch {
        // Silent, non-disruptive failure per spec
      } finally {
        isSendingRef.current = false;
      }
    };

    const isTest = typeof process !== "undefined" && process.env.NODE_ENV === "test";
    let initialHeartbeatFired = false;

    // Ticker running every 1,000ms: only accumulates active time when strictly visible & focused
    const handleTick = () => {
      if (!checkIsActive()) {
        return;
      }

      accumulatedMsRef.current += TICK_MS;

      // In browser usage, trigger initial heartbeat after 1s of confirmed active presence
      if (!isTest && !initialHeartbeatFired && accumulatedMsRef.current >= 1_000) {
        initialHeartbeatFired = true;
        accumulatedMsRef.current = 0;
        triggerHeartbeat();
        return;
      }

      if (accumulatedMsRef.current >= HEARTBEAT_INTERVAL_MS) {
        accumulatedMsRef.current = 0;
        triggerHeartbeat();
      }
    };

    timerRef.current = setInterval(handleTick, TICK_MS);

    // Event listeners to handle focus, blur, visibility and direct user interaction
    const handleInteraction = () => {
      // Direct user action (click/key) confirms active interaction
      if (checkIsActive() && accumulatedMsRef.current >= HEARTBEAT_INTERVAL_MS) {
        accumulatedMsRef.current = 0;
        triggerHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", handleInteraction);
    window.addEventListener("focus", handleInteraction);
    window.addEventListener("blur", handleInteraction);
    window.addEventListener("pointerdown", handleInteraction, { passive: true });
    window.addEventListener("keydown", handleInteraction, { passive: true });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      accumulatedMsRef.current = 0;
      document.removeEventListener("visibilitychange", handleInteraction);
      window.removeEventListener("focus", handleInteraction);
      window.removeEventListener("blur", handleInteraction);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [session?.user?.id]);

  return null;
}
