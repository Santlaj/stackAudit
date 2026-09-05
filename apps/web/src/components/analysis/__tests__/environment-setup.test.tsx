import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EnvironmentSetup } from "../environment-setup";

describe("EnvironmentSetup Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders OS selector with macOS/Linux and Windows options", () => {
    render(<EnvironmentSetup repositoryFullName="test/repo" />);

    expect(screen.getByRole("radio", { name: /macos \/ linux/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /windows/i })).toBeInTheDocument();
  });

  it("toggles OS selection and stores in localStorage", () => {
    render(<EnvironmentSetup repositoryFullName="test/repo" />);

    const windowsRadio = screen.getByRole("radio", { name: /windows/i });
    fireEvent.click(windowsRadio);

    expect(windowsRadio).toHaveAttribute("aria-checked", "true");
    expect(localStorage.getItem("stackaudit-env-os")).toBe("windows");
  });

  it("renders honest unscanned state without fake clone command", () => {
    render(<EnvironmentSetup repositoryFullName="test/repo" />);

    expect(screen.getByText(/setup instructions have not yet been extracted/i)).toBeInTheDocument();
    expect(screen.getByText(/runtime detection/i)).toBeInTheDocument();
    expect(screen.queryByText(/git clone/i)).not.toBeInTheDocument();
  });
});
