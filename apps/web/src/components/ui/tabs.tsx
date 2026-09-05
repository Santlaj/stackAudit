"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  badge?: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
  tabListClassName?: string;
  contentClassName?: string;
  onChange?: (tabId: string) => void;
}

export function Tabs({
  tabs,
  defaultTab,
  className,
  tabListClassName,
  contentClassName,
  onChange,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]?.id || "");

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      handleTabChange(tabs[nextIndex].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      handleTabChange(tabs[prevIndex].id);
    }
  };

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={cn("w-full flex flex-col space-y-4", className)}>
      {/* Tab Header Bar */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        className={cn(
          "flex items-center gap-1 border-b border-border/60 pb-px overflow-x-auto no-scrollbar",
          tabListClassName
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              type="button"
              className={cn(
                "relative px-3.5 py-2 text-xs font-medium transition-colors flex items-center gap-2 rounded-t-sm whitespace-nowrap outline-none focus-visible:ring-1 focus-visible:ring-foreground/20",
                isActive
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground/80 hover:bg-secondary/20"
              )}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded border",
                    isActive
                      ? "border-border bg-secondary/80 text-foreground"
                      : "border-border/40 text-muted-foreground"
                  )}
                >
                  {tab.badge}
                </span>
              )}

              {/* Active Tab Underline Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <div 
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        className={cn("w-full outline-none", contentClassName)}
      >
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {activeContent}
        </motion.div>
      </div>
    </div>
  );
}
