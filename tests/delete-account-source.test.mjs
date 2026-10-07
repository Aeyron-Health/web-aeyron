import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/deleteAccountApi.ts", import.meta.url), "utf8");
const packageJSON = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

test("deletion page uses authenticated backend request API, not Supabase table access", () => {
  assert.match(source, /\/v1\/data-subject-requests/);
  assert.match(source, /Authorization: `Bearer \$\{session\.access_token\}`/);
  assert.doesNotMatch(source, /\/rest\/v1\//);
  assert.doesNotMatch(source, /service_role|sb_secret|database password/i);
});

test("deletion browser configuration only uses intentionally public values", () => {
  assert.match(source, /VITE_SUPABASE_URL/);
  assert.match(source, /VITE_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(source, /VITE_AEYRON_API_BASE_URL/);
  assert.match(source, /storage: window\.sessionStorage/);
  assert.match(source, /flowType: "implicit"/);
  assert.equal(packageJSON.dependencies["@supabase/supabase-js"], "2.116.0");
});
