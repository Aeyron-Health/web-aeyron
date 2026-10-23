import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

export type DeletionRequestStatus =
  | "submitted"
  | "processing"
  | "completed"
  | "rejected"
  | "cancelled";

export type DeletionReceipt = Readonly<{
  request_id: string;
  request_type: "deletion";
  status: DeletionRequestStatus;
  requested_at: string;
  due_at: string;
  completed_at: string | null;
  replayed?: boolean;
}>;

export type DeletionApiErrorCode =
  | "configuration"
  | "authentication"
  | "rate_limit"
  | "unavailable"
  | "conflict"
  | "contract"
  | "network";

export class DeletionApiError extends Error {
  constructor(
    message: string,
    readonly code: DeletionApiErrorCode,
  ) {
    super(message);
    this.name = "DeletionApiError";
  }
}

type RuntimeConfiguration = Readonly<{
  supabaseUrl: string;
  publishableKey: string;
  apiBaseUrl: string;
}>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const REQUEST_KEY = "aeyron-delete-request-idempotency-key-v1";

function httpsURL(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password
      ? parsed.origin
      : null;
  } catch {
    return null;
  }
}

function configuration(): RuntimeConfiguration | null {
  const supabaseUrl = httpsURL(import.meta.env.VITE_SUPABASE_URL);
  const apiBaseUrl = httpsURL(import.meta.env.VITE_AEYRON_API_BASE_URL);
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !apiBaseUrl || !publishableKey || /\s/.test(publishableKey)) {
    return null;
  }
  return { supabaseUrl, apiBaseUrl, publishableKey };
}

let configuredClient: SupabaseClient | null = null;

/** True only when the public, browser-safe deletion settings are complete. */
export function deletionFlowConfigured(): boolean {
  return configuration() !== null;
}

function client(): SupabaseClient {
  const config = configuration();
  if (!config) {
    throw new DeletionApiError(
      "Account deletion is not configured on this website yet.",
      "configuration",
    );
  }
  if (configuredClient) return configuredClient;
  configuredClient = createClient(config.supabaseUrl, config.publishableKey, {
    auth: {
      storage: window.sessionStorage,
      storageKey: "aeyron-delete-session-v1",
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: true,
      // A magic link may open in another browser tab. The implicit return keeps
      // the short-lived exchange self-contained, whereas PKCE needs a verifier
      // saved in the originating tab's session storage.
      flowType: "implicit",
    },
  });
  return configuredClient;
}

function validReceipt(value: unknown, replayedExpected: boolean): value is DeletionReceipt {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  const exactKeys = [
    "request_id", "request_type", "status", "requested_at", "due_at", "completed_at",
    ...(replayedExpected ? ["replayed"] : []),
  ];
  if (Object.keys(item).length !== exactKeys.length || !exactKeys.every(key => key in item)) return false;
  return UUID.test(String(item.request_id)) &&
    item.request_type === "deletion" &&
    ["submitted", "processing", "completed", "rejected", "cancelled"].includes(String(item.status)) &&
    typeof item.requested_at === "string" && TIMESTAMP.test(item.requested_at) &&
    typeof item.due_at === "string" && TIMESTAMP.test(item.due_at) &&
    (item.completed_at === null || (typeof item.completed_at === "string" && TIMESTAMP.test(item.completed_at))) &&
    (!replayedExpected || typeof item.replayed === "boolean");
}

async function checkedSession(): Promise<Session> {
  const { data, error } = await client().auth.getSession();
  if (error || !data.session?.access_token) {
    throw new DeletionApiError("Please sign in with the email link before continuing.", "authentication");
  }
  const verified = await client().auth.getUser(data.session.access_token);
  if (verified.error || !verified.data.user || verified.data.user.id !== data.session.user.id) {
    throw new DeletionApiError("Your sign-in link has expired. Request a new one.", "authentication");
  }
  return data.session;
}

export async function sendDeletionSignInLink(email: string): Promise<void> {
  const normalized = email.trim();
  if (!/^\S+@\S+\.\S+$/.test(normalized)) {
    throw new DeletionApiError("Enter a valid email address.", "contract");
  }
  const { error } = await client().auth.signInWithOtp({
    email: normalized,
    // Never create an account from the deletion page: an unknown address must
    // not become a new sign-in user.
    options: { emailRedirectTo: `${window.location.origin}/delete`, shouldCreateUser: false },
  });
  // With sign-ups disabled for OTP, Supabase rejects unknown addresses (422).
  // Treat that like success so the page never reveals whether an account exists.
  if (error && error.status !== 422) {
    if (error.status === 429) {
      throw new DeletionApiError(
        "Too many sign-in links were requested. Please wait before trying again.",
        "rate_limit",
      );
    }
    throw new DeletionApiError("We could not send a sign-in link. Please try again later.", "unavailable");
  }
}

export async function currentDeletionSession(): Promise<Session | null> {
  try {
    return await checkedSession();
  } catch (error) {
    if (error instanceof DeletionApiError && error.code === "authentication") return null;
    throw error;
  }
}

function idempotencyKey(): string {
  const stored = window.sessionStorage.getItem(REQUEST_KEY);
  if (stored && UUID.test(stored)) return stored;
  const generated = window.crypto?.randomUUID?.();
  if (!generated || !UUID.test(generated)) {
    throw new DeletionApiError("Your browser cannot securely create this request. Use the app or contact support.", "contract");
  }
  window.sessionStorage.setItem(REQUEST_KEY, generated);
  return generated;
}

function requestFailure(status: number): DeletionApiError {
  if (status === 401) return new DeletionApiError("Your sign-in link has expired. Request a new one.", "authentication");
  if (status === 404) return new DeletionApiError("This account cannot submit a deletion request on the website yet. Use the app or contact support.", "unavailable");
  if (status === 409) return new DeletionApiError("A deletion request is already open for this account. You can follow it, or cancel it while it waits for review, in the app.", "conflict");
  if (status === 422) return new DeletionApiError("The deletion request could not be verified. Please try again later.", "contract");
  return new DeletionApiError("The deletion service is temporarily unavailable. Please try again later.", "unavailable");
}

export async function submitDeletionRequest(): Promise<DeletionReceipt> {
  const config = configuration();
  if (!config) {
    throw new DeletionApiError("Account deletion is not configured on this website yet.", "configuration");
  }
  const session = await checkedSession();
  const body = JSON.stringify({ request_type: "deletion", idempotency_key: idempotencyKey() });
  let response: Response;
  try {
    response = await fetch(`${config.apiBaseUrl}/v1/data-subject-requests`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body,
    });
  } catch {
    throw new DeletionApiError("The deletion service could not be reached. Check your connection and try again.", "network");
  }
  if (!response.ok) throw requestFailure(response.status);
  const receipt: unknown = await response.json().catch(() => null);
  if (!validReceipt(receipt, true)) {
    throw new DeletionApiError("The deletion service returned an invalid confirmation. No completion has been confirmed.", "contract");
  }
  window.sessionStorage.removeItem(REQUEST_KEY);
  return receipt;
}

export async function signOutOfDeletionFlow(): Promise<void> {
  window.sessionStorage.removeItem(REQUEST_KEY);
  if (!deletionFlowConfigured()) return;
  await client().auth.signOut({ scope: "local" });
}
