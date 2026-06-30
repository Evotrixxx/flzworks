// @vitest-environment jsdom
import { it, expect } from "vitest";

it("verifies window is defined", () => {
  expect(window).toBeDefined();
  expect(document).toBeDefined();
});
