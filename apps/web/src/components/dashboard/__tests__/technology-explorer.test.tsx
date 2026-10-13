import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TechnologyExplorer } from "../technology-explorer";
import { TechnologyStat } from "@/lib/api";

describe("TechnologyExplorer Component", () => {
  const mockTechs: TechnologyStat[] = [
    { name: "All", repoCount: 20, openIssueCount: 85, matchedIssueCount: 42 },
    { name: "TypeScript", repoCount: 12, openIssueCount: 45, matchedIssueCount: 28 },
    { name: "JavaScript", repoCount: 8, openIssueCount: 30, matchedIssueCount: 15 },
    { name: "Python", repoCount: 6, openIssueCount: 20, matchedIssueCount: 8 },
    { name: "React", repoCount: 5, openIssueCount: 18, matchedIssueCount: 12 },
    { name: "Node.js", repoCount: 4, openIssueCount: 14, matchedIssueCount: 9 },
    { name: "Go", repoCount: 3, openIssueCount: 10, matchedIssueCount: 4 },
    { name: "Rust", repoCount: 2, openIssueCount: 6, matchedIssueCount: 2 },
    { name: "Java", repoCount: 2, openIssueCount: 5, matchedIssueCount: 1 },
    { name: "C++", repoCount: 1, openIssueCount: 3, matchedIssueCount: 1 },
    { name: "SQL", repoCount: 1, openIssueCount: 2, matchedIssueCount: 0 },
  ];

  it("renders primary technology chips with truthful counts", () => {
    const onSelect = vi.fn();
    render(
      <TechnologyExplorer
        technologies={mockTechs}
        selectedTechnology="All"
        onSelectTechnology={onSelect}
        totalRepos={20}
        totalIssues={85}
      />
    );

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText("Rust")).toBeInTheDocument();

    // Verify totals in header
    expect(screen.getByText(/20 repositories · 85 open issues/i)).toBeInTheDocument();
  });

  it("calls onSelectTechnology when a chip is clicked", () => {
    const onSelect = vi.fn();
    render(
      <TechnologyExplorer
        technologies={mockTechs}
        selectedTechnology="All"
        onSelectTechnology={onSelect}
        totalRepos={20}
        totalIssues={85}
      />
    );

    const tsChip = screen.getByRole("button", { name: /typescript/i });
    fireEvent.click(tsChip);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("TypeScript");
  });

  it("supports overflow menu for additional technologies", () => {
    const onSelect = vi.fn();
    render(
      <TechnologyExplorer
        technologies={mockTechs}
        selectedTechnology="All"
        onSelectTechnology={onSelect}
        totalRepos={20}
        totalIssues={85}
      />
    );

    // Overflow button should be visible with count of remaining technologies
    const overflowBtn = screen.getByRole("button", { name: /\+3 more/i });
    expect(overflowBtn).toBeInTheDocument();

    fireEvent.click(overflowBtn);

    // Should reveal Java, C++, SQL in dropdown
    expect(screen.getByRole("button", { name: /java/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /c\+\+/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sql/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /java/i }));
    expect(onSelect).toHaveBeenCalledWith("Java");
  });
});
