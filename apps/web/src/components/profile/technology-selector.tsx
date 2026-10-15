"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const TECHNOLOGY_GROUPS = [
  {
    name: "Languages",
    options: ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "Ruby", "PHP", "Swift"],
  },
  {
    name: "Frontend",
    options: ["React", "Next.js", "Vue", "Angular", "Svelte", "Tailwind CSS", "HTML", "CSS"],
  },
  {
    name: "Backend",
    options: ["Node.js", "Express", "NestJS", "Django", "FastAPI", "Spring", "Ruby on Rails", "Laravel"],
  },
  {
    name: "Database",
    options: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Elasticsearch"],
  },
  {
    name: "DevOps / Tools",
    options: ["Docker", "Kubernetes", "GitHub Actions", "AWS", "GCP", "Azure", "Terraform", "Linux"],
  },
];

interface TechnologySelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function TechnologySelector({ 
  selected, 
  onChange,
  placeholder = "Select technologies..."
}: TechnologySelectorProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addCustomTech = (tech: string) => {
    const trimmed = tech.trim();
    if (!trimmed) return;
    if (!selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        addCustomTech(query);
      }
    } else if (e.key === "Backspace" && !query && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  };

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== option));
  };

  const filteredGroups = TECHNOLOGY_GROUPS.map((group) => ({
    ...group,
    options: group.options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase())),
  })).filter((group) => group.options.length > 0);

  const exactMatchExists = TECHNOLOGY_GROUPS.some(group => 
    group.options.some(opt => opt.toLowerCase() === query.trim().toLowerCase())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Selected Tags Area */}
      <div 
        className={cn(
          "min-h-10 w-full rounded-md border border-border/60 bg-background/50 px-3 py-1.5 text-xs transition-colors focus-within:border-foreground/40 cursor-text flex flex-wrap gap-1.5 items-center",
          isOpen && "border-foreground/40 ring-1 ring-foreground/10"
        )}
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 mr-1" />
        {selected.length > 0 ? (
          selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-muted text-foreground border border-border/50"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={(e) => removeOption(item, e)}
                className="hover:text-destructive p-0.5 transition-colors cursor-pointer"
              >
                <X className="h-2.5 w-2.5" />
                <span className="sr-only">Remove {item}</span>
              </button>
            </span>
          ))
        ) : (
          <span className="text-muted-foreground/60 select-none text-xs">{placeholder}</span>
        )}
        <input
          type="text"
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/40 min-w-[120px] text-xs text-foreground font-mono"
          placeholder={selected.length > 0 ? "Type to search..." : ""}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-full mt-1.5 max-h-[300px] overflow-y-auto rounded-md border border-border bg-card shadow-md animate-in fade-in-0 zoom-in-95">
          {query.trim() && !exactMatchExists && !selected.includes(query.trim()) && (
            <div className="p-2 border-b border-border">
              <button
                type="button"
                onClick={() => addCustomTech(query)}
                className="w-full text-left px-2.5 py-1.5 text-xs rounded-sm bg-primary/10 hover:bg-primary/20 text-primary font-medium flex items-center justify-between transition-colors"
              >
                <span>Add &quot;{query.trim()}&quot;</span>
                <span className="text-[10px] text-muted-foreground">Press Enter</span>
              </button>
            </div>
          )}

          {filteredGroups.length === 0 ? (
            !query.trim() ? (
              <div className="p-4 text-center text-xs text-muted-foreground">No technologies found.</div>
            ) : null
          ) : (
            <div className="p-2 space-y-3">
              {filteredGroups.map((group) => (
                <div key={group.name}>
                  <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.name}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                    {group.options.map((option) => {
                      const isSelected = selected.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleOption(option)}
                          className={cn(
                            "flex items-center justify-between w-full px-2 py-1.5 text-xs rounded-sm text-left transition-colors cursor-pointer",
                            isSelected ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                          )}
                        >
                          {option}
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
