import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SourceCards } from "@/widgets/sources/SourceCards";

describe("SourceCards", () => {
  it("renders nothing when sources empty", () => {
    const { container } = render(<SourceCards sources={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders source cards", () => {
    const sources = [
      { url: "https://example.com", title: "Example Site", domain: "example.com", snippet: "A test" },
      { url: "https://test.org", title: "Test Org", domain: "test.org", snippet: "Another test" },
    ];
    render(<SourceCards sources={sources} />);
    expect(screen.getByText("Example Site")).toBeDefined();
    expect(screen.getByText("Test Org")).toBeDefined();
    expect(screen.getByText("example.com")).toBeDefined();
  });

  it("renders links with correct href", () => {
    const sources = [
      { url: "https://example.com/page", title: "Page", domain: "example.com", snippet: "Snippet" },
    ];
    render(<SourceCards sources={sources} />);
    const link = screen.getByText("Page").closest("a");
    expect(link?.getAttribute("href")).toBe("https://example.com/page");
    expect(link?.getAttribute("target")).toBe("_blank");
  });
});
