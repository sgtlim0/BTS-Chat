import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RelatedQuestions } from "@/widgets/related-questions/RelatedQuestions";

describe("RelatedQuestions", () => {
  it("renders nothing when questions empty", () => {
    const { container } = render(
      <RelatedQuestions questions={[]} onQuestionClick={vi.fn()} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders question buttons", () => {
    const questions = [{ text: "What is TypeScript?" }, { text: "How does React work?" }];
    render(<RelatedQuestions questions={questions} onQuestionClick={vi.fn()} />);
    expect(screen.getByText("What is TypeScript?")).toBeDefined();
    expect(screen.getByText("How does React work?")).toBeDefined();
  });

  it("calls onQuestionClick when clicked", () => {
    const onClick = vi.fn();
    render(
      <RelatedQuestions
        questions={[{ text: "What is TypeScript?" }]}
        onQuestionClick={onClick}
      />
    );
    fireEvent.click(screen.getByText("What is TypeScript?"));
    expect(onClick).toHaveBeenCalledWith("What is TypeScript?");
  });
});
