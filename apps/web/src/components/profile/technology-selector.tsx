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
}

export function TechnologySelector({ selected, onChange }: TechnologySelectorProps) {
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

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Selected Tags Area */}
      <div 
        className={cn(
          "min-h-10 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm ring-offset-background transition-colors focus-within:ring-1 focus-within:ring-ring cursor-text flex flex-wrap gap-1.5 items-center",
          isOpen && "border-muted-foreground/50"
        )}
        onClick={() => setIsOpen(true)}
      >
        {selected.length > 0 ? (
          selected.map((item) => (
            <Badge key={item} variant="secondary" className="px-2 py-0.5 text-xs font-normal gap-1 pr-1 bg-secondary hover:bg-secondary/80">
              {item}
              <button
                type="button"
                onClick={(e) => removeOption(item, e)}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {item}</span>
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground/60 select-none">Select technologies...</span>
        )}
        <input
          type="text"
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/50 min-w-[80px]"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-full mt-1.5 max-h-[300px] overflow-y-auto rounded-md border border-border bg-card shadow-md animate-in fade-in-0 zoom-in-95">
          {filteredGroups.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No technologies found.</div>
          ) : (
            <div className="p-2 space-y-3">
              {filteredGroups.map((group) => (
                <div key={group.name}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                            "flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-sm text-left transition-colors",
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
