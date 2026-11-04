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

test("deletion sign-in reports email rate limits without exposing account existence", () => {
  assert.match(source, /error\.status === 429/);
  assert.match(source, /Too many sign-in links were requested/);
  assert.doesNotMatch(source, /user not found|account does not exist/i);
});

test("deletion sign-in never creates an account and hides unknown addresses", () => {
  assert.match(source, /shouldCreateUser: false/);
  assert.match(source, /error\.status !== 422/);
});

test("deletion page does not promise a completion notice it cannot send", () => {
  const page = readFileSync(new URL("../src/sections/PublicInformationPage.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /tells you when processing is complete/);
  assert.doesNotMatch(page, /properly configured deletion service/);
});

test("deletion copy says a request is reviewed first and nothing is deleted on submit", () => {
  const page = readFileSync(new URL("../src/sections/PublicInformationPage.tsx", import.meta.url), "utf8");
  const flow = readFileSync(new URL("../src/components/DeleteAccountFlow.tsx", import.meta.url), "utf8");
  const copy = readFileSync(new URL("../src/content/deletionCopy.ts", import.meta.url), "utf8");
  assert.match(copy, /We review requests within 7 days\. After approval, your data is deleted promptly and backups are removed within 30 days\./);
  assert.match(copy, /Nothing is deleted until we approve it\./);
  assert.match(copy, /If you signed in with Apple, you may be asked to allow Aeyron again next time\./);
  assert.match(page, /REVIEW_TIMELINE/);
  assert.match(page, /APPLE_CANCEL_NOTE/);
  assert.match(flow, /Request received\. We’ll confirm within 7 days\./);
  assert.doesNotMatch(page, /You can delete your Aeyron account and the data linked to it at any time/);
  assert.doesNotMatch(flow, /starts Aeyron’s deletion process/);
});

test("cancel says contact support until the in-app cancel build ships; in-app variant is ready", () => {
  const copy = readFileSync(new URL("../src/content/deletionCopy.ts", import.meta.url), "utf8");
  assert.match(copy, /export const IN_APP_CANCEL_AVAILABLE = false;/);
  assert.match(copy, /CANCEL_HOW = IN_APP_CANCEL_AVAILABLE \? CANCEL_IN_APP : CANCEL_BY_SUPPORT/);
  assert.match(copy, /To cancel the request while it waits for review, contact support/);
  assert.match(copy, /You can cancel the request in the app \(Your account\) while it waits for review\./);
  for (const file of ["../src/sections/PublicInformationPage.tsx", "../src/components/DeleteAccountFlow.tsx", "../src/deleteAccountApi.ts"]) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(source, /cancel it (there|in the app) while it waits/);
  }
});
