"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  highlightLines?: number[];
  className?: string;
}

export function CodeBlock({
  code,
  language = "typescript",
  filename,
  highlightLines = [],
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy code", e);
    }
  };

  const lines = code.trim().split("\n");

  return (
    <div
      className={cn(
        "rounded border border-border/60 bg-[#090a0c] text-xs font-mono overflow-hidden shadow-sm",
        className
      )}
    >
      {/* File Header */}
      {(filename || language) && (
        <div className="flex items-center justify-between px-3 py-2 bg-[#121316] border-b border-border/40 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" />
            {filename ? (
              <span className="text-foreground font-medium">{filename}</span>
            ) : (
              <span className="uppercase text-[10px] tracking-wider font-semibold">
                {language}
              </span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary/40"
            title="Copy code"
            type="button"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-[10px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="text-[10px]">Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Code Lines */}
      <div className="p-3 overflow-x-auto selection:bg-zinc-800">
        <pre className="leading-relaxed">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = highlightLines.includes(lineNum);
            return (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-4 px-1 rounded-sm",
                  isHighlighted && "bg-zinc-800/40 border-l-2 border-emerald-500/80 -ml-1 pl-2"
                )}
              >
                <span className="select-none text-zinc-600 text-right w-6 shrink-0 text-[10px]">
                  {lineNum}
                </span>
                <span className="text-zinc-300 font-mono whitespace-pre flex-1">
                  {line}
                </span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
