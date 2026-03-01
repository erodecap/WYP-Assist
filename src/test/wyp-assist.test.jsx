import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WYPAssist from "../wyp-assist.jsx";

describe("WYPAssist — app rendering", () => {
  it("renders the app title", () => {
    render(<WYPAssist />);
    expect(screen.getByText("WYP ASSIST")).toBeInTheDocument();
  });

  it("renders all four navigation tabs", () => {
    render(<WYPAssist />);
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
    expect(nav.textContent).toMatch(/Point Load/);
    expect(nav.textContent).toMatch(/Pull Sheet/);
    expect(nav.textContent).toMatch(/Bridle Calc/);
    expect(nav.textContent).toMatch(/Markout/);
  });

  it("renders language toggle button", () => {
    render(<WYPAssist />);
    expect(screen.getByText("EN")).toBeInTheDocument();
    // Language is now a single toggle button (EN ▾ / ES ▾)
    const langBtn = screen.getByText("EN").closest("button");
    expect(langBtn).toBeInTheDocument();
  });

  it("shows Point Load tab content by default", () => {
    render(<WYPAssist />);
    expect(screen.getByText("Rigging Configuration")).toBeInTheDocument();
  });

  it("renders the disclaimer", () => {
    render(<WYPAssist />);
    expect(screen.getByText(/All calculations are estimates/)).toBeInTheDocument();
  });
});

describe("WYPAssist — tab navigation", () => {
  it("switches to Pull Sheet tab", async () => {
    const user = userEvent.setup();
    render(<WYPAssist />);
    await user.click(screen.getByText(/Pull Sheet/));
    expect(screen.getByText("Chain Hoist System")).toBeInTheDocument();
  });

  it("switches to Bridle tab", async () => {
    const user = userEvent.setup();
    render(<WYPAssist />);
    await user.click(screen.getByText(/Bridle Calc/));
    expect(screen.getByText("Bridle Type")).toBeInTheDocument();
  });

  it("switches to Markout tab", async () => {
    const user = userEvent.setup();
    render(<WYPAssist />);
    await user.click(screen.getByText(/Markout/));
    expect(screen.getByText("Markout Generator")).toBeInTheDocument();
  });
});

describe("WYPAssist — language toggle", () => {
  it("switches to Spanish when language toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<WYPAssist />);
    // Language toggle is now a single button showing current lang; clicking toggles to the other
    const langBtn = screen.getByText("EN").closest("button");
    await user.click(langBtn);
    expect(screen.getByText(/Herramientas de Aparejo/)).toBeInTheDocument();
  });
});
