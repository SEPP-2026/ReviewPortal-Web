import { render, screen } from "@testing-library/react";
import { describe, expect, it, jest } from "@jest/globals";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { Hero } from "@/components/sections/Hero";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Hero", () => {
  it("renders the main heading and browse CTA", () => {
    render(<Hero />);

    expect(
      screen.getByRole("heading", { name: /rent quality tools/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /browse available equipment/i })
    ).toHaveAttribute("href", "/equipment");
  });
});