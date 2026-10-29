export type WaitlistEntry = Readonly<{
  name: string;
  email: string;
  role: string;
  needs: string[];
  note: string;
}>;

export class WaitlistError extends Error {
  constructor(
    message: string,
    readonly code: "configuration" | "rejected" | "network",
  ) {
    super(message);
    this.name = "WaitlistError";
  }
}

/** utm_source / utm_campaign / ref from the landing URL, so we know which outreach worked. */
export function landingSource(search: string = window.location.search): string | null {
  const params = new URLSearchParams(search);
  const parts = ["utm_source", "utm_medium", "utm_campaign", "ref"]
    .map(key => {
      const value = params.get(key)?.trim();
      return value ? `${key}=${value}` : null;
    })
    .filter(Boolean);
  return parts.length ? parts.join("&").slice(0, 200) : null;
}

/**
 * Adds one row through the insert-only `join_waitlist` function. The browser
 * key can call that function and nothing else on the list; it cannot read it.
 */
export async function joinWaitlist(entry: WaitlistEntry): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!supabaseUrl || !publishableKey) {
    throw new WaitlistError("The early-access list is not configured.", "configuration");
  }

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/rest/v1/rpc/join_waitlist`, {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_email: entry.email.trim(),
        p_role: entry.role,
        p_name: entry.name.trim() || null,
        p_needs: entry.needs,
        p_note: entry.note.trim() || null,
        p_source: landingSource(),
      }),
    });
  } catch {
    throw new WaitlistError("We couldn't reach the server.", "network");
  }
  if (!response.ok) {
    throw new WaitlistError("The list didn't accept that entry.", "rejected");
  }
}
