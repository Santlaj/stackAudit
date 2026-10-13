import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResultsToolbar } from "../results-toolbar";

describe("ResultsToolbar Component", () => {
  it("allows switching between Repositories and Issues view modes", () => {
    const onViewChange = vi.fn();
    render(
      <ResultsToolbar
        viewMode="repositories"
        onViewModeChange={onViewChange}
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        difficulty="all"
        onDifficultyChange={vi.fn()}
        goodFirstIssueOnly={false}
        onGoodFirstIssueChange={vi.fn()}
        sortBy="match"
        onSortChange={vi.fn()}
        savedOnly={false}
        onToggleSavedOnly={vi.fn()}
        repoCount={12}
        issueCount={45}
        savedCount={3}
      />
    );

    const issuesTab = screen.getByRole("button", { name: /issues/i });
    fireEvent.click(issuesTab);

    expect(onViewChange).toHaveBeenCalledWith("issues");
  });

  it("handles search query input and clear button", () => {
    const onSearchChange = vi.fn();
    const { rerender } = render(
      <ResultsToolbar
        viewMode="repositories"
        onViewModeChange={vi.fn()}
        searchQuery=""
        onSearchQueryChange={onSearchChange}
        difficulty="all"
        onDifficultyChange={vi.fn()}
        goodFirstIssueOnly={false}
        onGoodFirstIssueChange={vi.fn()}
        sortBy="match"
        onSortChange={vi.fn()}
        savedOnly={false}
        onToggleSavedOnly={vi.fn()}
        repoCount={12}
        issueCount={45}
        savedCount={3}
      />
    );

    const input = screen.getByPlaceholderText(/search repositories/i);
    fireEvent.change(input, { target: { value: "react" } });
    expect(onSearchChange).toHaveBeenCalledWith("react");

    // Rerender with active search query
    rerender(
      <ResultsToolbar
        viewMode="repositories"
        onViewModeChange={vi.fn()}
        searchQuery="react"
        onSearchQueryChange={onSearchChange}
        difficulty="all"
        onDifficultyChange={vi.fn()}
        goodFirstIssueOnly={false}
        onGoodFirstIssueChange={vi.fn()}
        sortBy="match"
        onSortChange={vi.fn()}
        savedOnly={false}
        onToggleSavedOnly={vi.fn()}
        repoCount={12}
        issueCount={45}
        savedCount={3}
      />
    );

    // Click clear button (X icon)
    const clearBtn = input.nextElementSibling;
    if (clearBtn) {
      fireEvent.click(clearBtn);
      expect(onSearchChange).toHaveBeenCalledWith("");
    }
  });

  it("toggles saved only filter", () => {
    const onToggleSaved = vi.fn();
    render(
      <ResultsToolbar
        viewMode="repositories"
        onViewModeChange={vi.fn()}
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        difficulty="all"
        onDifficultyChange={vi.fn()}
        goodFirstIssueOnly={false}
        onGoodFirstIssueChange={vi.fn()}
        sortBy="match"
        onSortChange={vi.fn()}
        savedOnly={false}
        onToggleSavedOnly={onToggleSaved}
        repoCount={12}
        issueCount={45}
        savedCount={3}
      />
    );

    const savedBtn = screen.getByRole("button", { name: /saved/i });
    fireEvent.click(savedBtn);

    expect(onToggleSaved).toHaveBeenCalledTimes(1);
  });
});
