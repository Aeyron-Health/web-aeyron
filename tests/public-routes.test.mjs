import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

const publicRoutes = ["privacy", "terms", "support", "delete"];

for (const route of publicRoutes) {
  test(`${route} has a deployable static entry point`, () => {
    assert.equal(
      existsSync(new URL(`../dist/${route}/index.html`, import.meta.url)),
      true,
    );
  });
}
