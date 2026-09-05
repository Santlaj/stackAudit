import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContributionGuide } from "../contribution-guide";

const mockContext = {
  graphify: {
    architectureContext: "Test architecture overview.",
    relevantFiles: [
      { file: "src/api/controller.ts", role: "primary", source: "graphify" },
      { file: "src/utils/parser.ts", role: "supporting", source: "codebase-analysis" },
    ],
  },
  synthesis: {
    whyFilesMatter: "Controller handles incoming payload validation.",
    whatToUnderstandFirst: "Examine HTTP request lifecycle and router.",
    implementationApproach: "1. Reproduce issue with test\n2. Trace controller validation\n3. Add guard condition\n4. Write integration test\n5. Verify build",
    knowledgeGaps: [],
  },
};

describe("ContributionGuide Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the 5 named phases in the stepper", () => {
    render(<ContributionGuide matchId="test-guide-match-1" context={mockContext} />);

    expect(screen.getByText("Understand")).toBeInTheDocument();
    expect(screen.getByText("Trace")).toBeInTheDocument();
    expect(screen.getByText("Identify")).toBeInTheDocument();
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Validate")).toBeInTheDocument();
  });

  it("expands Step 1 by default and shows objective and questions", () => {
    render(<ContributionGuide matchId="test-guide-match-1" context={mockContext} />);

    // Step 1 title and objective
    expect(screen.getByText(/understand the problem & system architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/grasp what the issue is reporting/i)).toBeInTheDocument();
    expect(screen.getByText(/key questions to answer/i)).toBeInTheDocument();
  });

  it("advances active step on 'Next' button click and persists to localStorage", () => {
    render(<ContributionGuide matchId="test-guide-match-1" context={mockContext} />);

    const nextBtn = screen.getByRole("button", { name: /next: trace/i });
    fireEvent.click(nextBtn);

    // Active step indicator updates
    expect(screen.getByText(/step 2 of 5/i)).toBeInTheDocument();
    expect(localStorage.getItem("stackaudit-guide-step-test-guide-match-1")).toBe("2");
  });

  it("allows clicking prior or upcoming steps to expand in place without lock", () => {
    render(<ContributionGuide matchId="test-guide-match-1" context={mockContext} />);

    // Click step 3 accordion header
    const step3Header = screen.getByText(/identify the required change/i);
    fireEvent.click(step3Header);

    // Step 3 content becomes visible
    expect(screen.getByText(/isolate the exact condition/i)).toBeInTheDocument();
  });

  it("toggles step hint on demand", () => {
    render(<ContributionGuide matchId="test-guide-match-1" context={mockContext} />);

    const hintBtn = screen.getByRole("button", { name: /need a hint for this step\?/i });
    fireEvent.click(hintBtn);

    expect(screen.getByText("Test architecture overview.")).toBeInTheDocument();
  });

  it("renders independently generated guideSteps with distinct mentoring content", () => {
    const structuredContext = {
      graphify: {
        architectureContext: "Explainer UI architecture",
        relevantFiles: [
          { file: "assets/explainers-ui.js", role: "primary", source: "graphify" },
        ],
      },
      synthesis: {
        whyFilesMatter: "Handles explainer rendering",
        whatToUnderstandFirst: "Understand table markdown parsing",
        implementationApproach: "1. Understand\n2. Trace\n3. Identify\n4. Plan\n5. Validate",
        knowledgeGaps: [],
        guideSteps: {
          understand: {
            title: "Understand the issue",
            guidance: "This issue is about how markdown tables fail to render when separator formatting varies.",
            goal: "Understand the difference between the markdown received and expected table output.",
            investigationQuestion: "What is the difference between what the document provides and what the parser expects?",
          },
          trace: {
            title: "Trace the behavior",
            guidance: "Start with assets/explainers-ui.js and follow parseTable().",
            goal: "Follow execution from markdown input into table row validation.",
            investigationQuestion: "Which condition checks row validation?",
            evidence: ["assets/explainers-ui.js -> parseTable()", "Separator row validation rule"],
          },
          identify: {
            title: "Identify the failure",
            guidance: "Compare the separator regex expectation against the document syntax.",
            goal: "Explain the assumption mismatch causing valid markdown to be rejected.",
            investigationQuestion: "Does the parser enforce stricter syntax than CommonMark requires?",
            evidence: ["Input row format vs parser regex"],
          },
          plan: {
            title: "Plan the change",
            guidance: "Determine the smallest behavioral change to safely accept the separator format.",
            goal: "Formulate a safe minimal change without breaking other tables.",
            investigationQuestions: [
              "What is the smallest behavior that needs to change?",
              "Does the explainer build need to be regenerated?",
            ],
          },
          validate: {
            title: "Validate your contribution",
            guidance: "Rebuild the explainer assets and run the test suite.",
            goal: "Prove table rendering works and passes existing checks.",
            commands: ["make build-explainers", "npm test"],
            doneCriteria: [
              "Affected table renders correctly in preview",
              "Existing tests pass without regressions",
              "PR description answers what was broken and how it was validated",
            ],
          },
        },
      },
    };

    render(<ContributionGuide matchId="test-guide-match-structured" context={structuredContext} />);

    // Step 1 check
    expect(screen.getByText("Understand the issue")).toBeInTheDocument();
    expect(screen.getByText(/this issue is about how markdown tables fail to render/i)).toBeInTheDocument();
    expect(screen.getByText(/what is the difference between what the document provides/i)).toBeInTheDocument();

    // Step 2 check (expand Step 2)
    const step2Header = screen.getByText("Trace the behavior");
    fireEvent.click(step2Header);
    expect(screen.getByText(/start with assets\/explainers-ui\.js and follow parsetable/i)).toBeInTheDocument();
    expect(screen.getByText("assets/explainers-ui.js -> parseTable()")).toBeInTheDocument();

    // Step 5 check (expand Step 5)
    const step5Header = screen.getByText("Validate your contribution");
    fireEvent.click(step5Header);
    expect(screen.getByText("make build-explainers")).toBeInTheDocument();
    expect(screen.getByText("npm test")).toBeInTheDocument();
    expect(screen.getByText("Affected table renders correctly in preview")).toBeInTheDocument();
  });
});

