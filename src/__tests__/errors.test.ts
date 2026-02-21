import { describe, it, expect } from "vitest";
import { ApiError, NetworkError, ValidationError } from "@/shared/lib/errors";

describe("Error types", () => {
  it("creates ApiError with status", () => {
    const err = new ApiError("Not found", 404);
    expect(err.name).toBe("ApiError");
    expect(err.message).toBe("Not found");
    expect(err.status).toBe(404);
    expect(err instanceof Error).toBe(true);
  });

  it("creates NetworkError", () => {
    const err = new NetworkError("Connection failed");
    expect(err.name).toBe("NetworkError");
    expect(err.message).toBe("Connection failed");
  });

  it("creates ValidationError with fields", () => {
    const err = new ValidationError("Invalid input", { email: ["Required"] });
    expect(err.name).toBe("ValidationError");
    expect(err.fields?.email).toEqual(["Required"]);
  });
});
