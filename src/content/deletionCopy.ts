import { brand } from "./site";

/**
 * Deletion copy (aeyron-tech-demo migration 20261025000000): a deletion is a
 * request the Aeyron team reviews; nothing is deleted until it is approved.
 *
 * IN_APP_CANCEL_AVAILABLE stays false until the app build with the
 * "Cancel deletion request" button is live for everyone. Until then the pages
 * tell people to contact support to cancel. Flip it to true in the same
 * release that ships that build; the in-app wording below is ready.
 */
export const IN_APP_CANCEL_AVAILABLE = false;

export const REVIEW_TIMELINE =
  "We review requests within 7 days. After approval, your data is deleted promptly and backups are removed within 30 days.";

export const NOTHING_BEFORE_APPROVAL = "Nothing is deleted until we approve it.";

export const CANCEL_IN_APP =
  "You can cancel the request in the app (Your account) while it waits for review.";
export const CANCEL_BY_SUPPORT =
  `To cancel the request while it waits for review, contact support at ${brand.contactEmail}.`;
export const CANCEL_HOW = IN_APP_CANCEL_AVAILABLE ? CANCEL_IN_APP : CANCEL_BY_SUPPORT;

export const APPLE_CANCEL_NOTE =
  "If you signed in with Apple, you may be asked to allow Aeyron again next time.";
