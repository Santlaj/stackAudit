import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { PipelineProgress } from "../pipeline-progress";

describe("PipelineProgress Component", () => {
  it("renders pipeline stage headers and target repository information", () => {
    render(
      <PipelineProgress
        status="REPOSITORY_LOADING"
        repositoryFullName="facebook/react"
        stars={220000}
        openIssues={350}
      />
    );

    expect(screen.getByText("ANALYSIS PIPELINE")).toBeInTheDocument();
    expect(screen.getByText("facebook/react")).toBeInTheDocument();
    expect(screen.getByText(/220,000 Stars/i)).toBeInTheDocument();
    expect(screen.getByText(/350 Issues/i)).toBeInTheDocument();
  });

  it("shows in-progress badge on current stage and descriptions", () => {
    render(
      <PipelineProgress
        status="GRAPH_BUILDING"
        repositoryFullName="owner/repo"
      />
    );

    expect(screen.getByText("Inspecting architecture")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("WHAT WE ARE DOING")).toBeInTheDocument();
  });
});
