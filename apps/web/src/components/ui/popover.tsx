"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  openDelay?: number;
  closeDelay?: number;
}

/**
 * Accessible Popover primitive conforming to StackAudit Spec Section 4 & 18.
 *
 * Supports:
 * - Hover with configurable open/close delay (default: 150ms open, 200ms close)
 * - Keyboard focus & Escape key dismissal with focus restoration
 * - Touch tap-toggle for mobile devices
 * - Portaled rendering with collision-aware positioning
 * - ARIA attributes (role="dialog", aria-expanded, aria-haspopup)
 */
export function Popover({
  children,
  content,
  className,
  align = "end",
  sideOffset = 8,
  openDelay = 150,
  closeDelay = 200,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 360; // Max width target for developer popovers
    const popoverHeight = 320; // Estimated height

    let top = triggerRect.bottom + window.scrollY + sideOffset;
    let left = triggerRect.right + window.scrollX - popoverWidth;

    // Flip above if overflowing bottom of viewport
    if (triggerRect.bottom + popoverHeight > window.innerHeight && triggerRect.top > popoverHeight) {
      top = triggerRect.top + window.scrollY - popoverHeight - sideOffset;
    }

    // Keep within horizontal bounds
    if (left < 16) {
      left = 16;
    } else if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16;
    }

    setCoords({ top, left });
  }, [sideOffset]);

  const handleOpen = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    openTimerRef.current = setTimeout(() => {
      updatePosition();
      setIsOpen(true);
    }, openDelay);
  }, [openDelay, updatePosition]);

  const handleClose = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, closeDelay);
  }, [closeDelay]);

  const toggleTap = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsOpen((prev) => {
      if (!prev) updatePosition();
      return !prev;
    });
  }, [updatePosition]);

  // Outside click and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  return (
    <>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        onBlur={handleClose}
        onClick={toggleTap}
        className="inline-flex items-center outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md"
      >
        {children}
      </div>

      {mounted && isOpen && createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="false"
          tabIndex={-1}
          onMouseEnter={() => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
          }}
          onMouseLeave={handleClose}
          style={{
            position: "absolute",
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: "var(--z-popover, 60)",
          }}
          className={cn(
            "w-[340px] md:w-[380px] rounded-lg border border-border bg-card p-4 shadow-md text-foreground animate-in fade-in-50 zoom-in-95 duration-150",
            className
          )}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}
