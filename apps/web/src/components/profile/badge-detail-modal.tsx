"use client";

import React, { useRef, useCallback } from "react";
import Image from "next/image";
import { X, Download, Link2, Check, Share2 } from "lucide-react";
import { BadgeRegistryEntry } from "./badge-registry";
import { BadgeArtwork } from "./badge-artwork";
import { cn } from "@/lib/utils";

interface BadgeDetailModalProps {
  badge: BadgeRegistryEntry;
  earnedAt: string | null;
  userName: string;
  onClose: () => void;
}

export function BadgeDetailModal({
  badge,
  earnedAt,
  userName,
  onClose,
}: BadgeDetailModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);

  const formattedDate = earnedAt
    ? new Date(earnedAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  /**
   * Generates a shareable badge card image using Canvas API.
   * Draws: dark background → badge image → text metadata → StackAudit branding.
   * Returns a Blob of the final PNG.
   */
  const generateShareCard = useCallback(async (): Promise<Blob | null> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const width = 800;
    const height = 960;
    canvas.width = width;
    canvas.height = height;

    // ── Background ──
    ctx.fillStyle = "#0D0E12";
    ctx.fillRect(0, 0, width, height);

    // ── Subtle border ──
    ctx.strokeStyle = "#272B35";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // ── Load and draw badge image ──
    try {
      if (badge.imagePath) {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Image load failed"));
          img.src = encodeURI(badge.imagePath!);
        });

        // Center the badge image in the top area
        const imgSize = 480;
        const imgX = (width - imgSize) / 2;
        const imgY = 60;
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
      }
    } catch {
      // If image fails, continue without it
    }

    // ── Achievement Title ──
    ctx.fillStyle = "#EDEDEE";
    ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(badge.achievementTitle, width / 2, 600);

    // ── Achievement Description ──
    ctx.fillStyle = "#949AA6";
    ctx.font = "15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    
    // Word wrap the description
    const words = badge.achievementDescription.split(" ");
    let line = "";
    let y = 640;
    const maxWidth = 600;
    
    for (const word of words) {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== "") {
        ctx.fillText(line.trim(), width / 2, y);
        line = word + " ";
        y += 24;
      } else {
        line = testLine;
      }
    }
    if (line.trim()) {
      ctx.fillText(line.trim(), width / 2, y);
    }

    // ── Divider line ──
    const dividerY = y + 40;
    ctx.strokeStyle = "#272B35";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, dividerY);
    ctx.lineTo(width - 100, dividerY);
    ctx.stroke();

    // ── User name and date ──
    const metaY = dividerY + 35;
    ctx.fillStyle = "#949AA6";
    ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    
    let metaText = userName;
    if (formattedDate) {
      metaText += `  ·  ${formattedDate}`;
    }
    ctx.fillText(metaText, width / 2, metaY);

    // ── StackAudit Branding ──
    ctx.fillStyle = "rgba(148, 154, 166, 0.4)";
    ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("STACKAUDIT", width / 2, height - 30);

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
    });
  }, [badge, userName, formattedDate]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = await generateShareCard();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `stackaudit-${badge.id.toLowerCase().replace(/_/g, "-")}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Download failed:", err);
      if (badge.imagePath) {
        const link = document.createElement("a");
        link.download = `stackaudit-badge-${badge.id.toLowerCase()}.png`;
        link.href = badge.imagePath;
        link.click();
      }
    } finally {
      setDownloading(false);
    }
  }, [badge, generateShareCard]);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/profile?badge=${badge.id.toLowerCase()}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [badge.id]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Card */}
        <div className="relative rounded-lg overflow-hidden bg-[#0D0E12] border border-[#272B35] shadow-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-30 p-1.5 rounded-md text-[#949AA6] hover:text-[#EDEDEE] hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close badge detail"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badge Image / Artwork */}
          <div className="relative w-full aspect-square bg-[#0D0E12] flex items-center justify-center p-10">
            {badge.imagePath ? (
              <Image
                src={badge.imagePath}
                alt={badge.achievementTitle}
                width={360}
                height={360}
                unoptimized
                className="object-contain w-full h-full"
                priority
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center">
                <BadgeArtwork
                  type={badge.id}
                  earned={true}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="px-5 pb-5 space-y-3">
            <div className="space-y-1">
              <h3 className="text-[15px] font-semibold text-[#EDEDEE] tracking-tight">
                {badge.achievementTitle}
              </h3>
              <p className="text-xs text-[#949AA6] leading-relaxed">
                {badge.achievementDescription}
              </p>
            </div>

            {/* Meta Row */}
            <div className="flex items-center justify-between pt-2 border-t border-[#272B35]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#949AA6]">
                  {userName}
                </span>
                {formattedDate && (
                  <>
                    <span className="text-[#272B35]">·</span>
                    <span className="text-[11px] font-mono text-[#949AA6]">
                      {formattedDate}
                    </span>
                  </>
                )}
              </div>
              <span className="text-[10px] font-semibold tracking-wider text-[#949AA6]/50 uppercase">
                StackAudit
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5",
              "rounded-md text-xs font-medium",
              "bg-card border border-border text-foreground",
              "hover:bg-secondary transition-colors cursor-pointer",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? "Generating..." : "Download"}
          </button>

          <button
            onClick={handleCopyLink}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5",
              "rounded-md text-xs font-medium",
              "bg-card border border-border text-foreground",
              "hover:bg-secondary transition-colors cursor-pointer",
              copied && "text-emerald-500 border-emerald-500/30"
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5" />
                Share Link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
