import { describe, it, expect } from "vitest";
import { t } from "@/shared/lib/i18n";

describe("i18n", () => {
  it("returns translation for known key", () => {
    expect(t("chat.newChat")).toBe("New Chat");
    expect(t("settings.title")).toBe("Settings");
  });

  it("returns key itself for unknown key", () => {
    expect(t("unknown.key")).toBe("unknown.key");
  });
});
