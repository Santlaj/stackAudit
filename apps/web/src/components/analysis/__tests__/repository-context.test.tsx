import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RepositoryContext } from "../repository-context";
import { IssueMatch } from "@/lib/api";

const mockMatch: IssueMatch = {
  id: "test-match-1",
  repository: "owner/test-repo",
  issueNumber: 42,
  issueTitle: "Test Issue Title",
  issueUrl: "https://github.com/owner/test-repo/issues/42",
  technologies: ["TypeScript", "React", "Node.js"],
  complexity: "Good First Issue",
  matchScore: 88,
  status: "DISCOVERED",
};

const mockContext = {
  graphify: {
    architectureContext: "This is a modular monolithic architecture built with Next.js and Express.",
    relevantFiles: [
      { file: "src/server/index.ts", role: "primary", source: "graphify" },
      { file: "src/client/App.tsx", role: "supporting", source: "codebase-analysis" },
    ],
  },
  synthesis: {
    whyFilesMatter: "Files manage entry points.",
    whatToUnderstandFirst: "Check server routing.",
    implementationApproach: "1. Step one\n2. Step two",
    knowledgeGaps: [],
  },
};

describe("RepositoryContext Component", () => {
  it("renders with tablist and accessible tab controls", () => {
    render(<RepositoryContext match={mockMatch} context={mockContext} />);
    
    // Check tablist exists
    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();

    // Check tabs exist
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBe(3);
    expect(screen.getByRole("tab", { name: /architecture/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /tech stack/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /key directories/i })).toBeInTheDocument();
  });

  it("displays architecture text when available", () => {
    render(<RepositoryContext match={mockMatch} context={mockContext} />);
    expect(screen.getByText(/modular monolithic architecture/i)).toBeInTheDocument();
  });

  it("switches to Tech Stack tab on click and renders technologies", () => {
    render(<RepositoryContext match={mockMatch} context={mockContext} />);
    
    const techTab = screen.getByRole("tab", { name: /tech stack/i });
    fireEvent.click(techTab);

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
  });

  it("switches to Key Directories tab and displays extracted directory groupings", () => {
    render(<RepositoryContext match={mockMatch} context={mockContext} />);
    
    const dirsTab = screen.getByRole("tab", { name: /key directories/i });
    fireEvent.click(dirsTab);

    expect(screen.getByText(/src\/server/i)).toBeInTheDocument();
    expect(screen.getByText(/src\/client/i)).toBeInTheDocument();
  });

  it("renders truthful empty state when architecture is missing", () => {
    render(<RepositoryContext match={mockMatch} context={null} />);
    expect(screen.getByText(/architecture not yet determined/i)).toBeInTheDocument();
  });
});
