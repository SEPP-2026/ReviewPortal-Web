import { render, screen } from "@testing-library/react";
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

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Prevent the component from actually hitting the backend during tests
jest.mock("@/lib/api/categories", () => ({
  getFeaturedCategories: () => Promise.resolve([]),
  toCategorySlug: (name: string) => name.toLowerCase().replace(/\s+/g, "-"),
}));

describe("Hero", () => {
  it("renders the main heading and search form", () => {
    render(<Hero />);

    expect(
      screen.getByRole("heading", { name: /rent quality tools/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /search/i })
    ).toBeInTheDocument();
  });
});