import { FormEvent, useEffect, useState } from "react";
import {
  currentDeletionSession,
  deletionFlowConfigured,
  DeletionApiError,
  type DeletionReceipt,
  sendDeletionSignInLink,
  signOutOfDeletionFlow,
  submitDeletionRequest,
} from "../deleteAccountApi";

type State = "loading" | "signed-out" | "sending-link" | "link-sent" | "signed-in" | "submitting" | "submitted" | "error";

function message(error: unknown): string {
  return error instanceof DeletionApiError
    ? error.message
    : "Something went wrong. No deletion has been confirmed. Please try again later.";
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString();
}

export function DeleteAccountFlow() {
  const configured = deletionFlowConfigured();
  const [state, setState] = useState<State>(configured ? "loading" : "signed-out");
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<DeletionReceipt | null>(null);

  useEffect(() => {
    if (!configured) return;
    currentDeletionSession()
      .then(session => setState(session ? "signed-in" : "signed-out"))
      .catch(failure => {
        setError(message(failure));
        setState("error");
      });
  }, [configured]);

  async function requestLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setState("sending-link");
    try {
      await sendDeletionSignInLink(email);
      setState("link-sent");
    } catch (failure) {
      setError(message(failure));
      setState("error");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirmed) return;
    setError("");
    setState("submitting");
    try {
      const result = await submitDeletionRequest();
      setReceipt(result);
      await signOutOfDeletionFlow();
      setState("submitted");
    } catch (failure) {
      setError(message(failure));
      setState("error");
    }
  }

  if (!configured) {
    return <div className="rounded-card border border-attention/40 bg-paper p-5 text-ink">
      <p className="font-semibold">Authenticated web deletion is not configured yet.</p>
      <p className="mt-2 text-ink-soft">Do not send account details by email. Use the account-deletion option in the app or contact Aeyron support to confirm the available process.</p>
    </div>;
  }

  if (state === "loading") return <p aria-live="polite">Checking your secure sign-in link…</p>;

  if (state === "submitted" && receipt) {
    return <div className="rounded-card border border-vital/40 bg-paper p-5 text-ink" role="status">
      <p className="font-semibold">Deletion request submitted.</p>
      <p className="mt-2 text-ink-soft">Your request was submitted on {formatDate(receipt.requested_at)}. It is not confirmation that deletion has completed. We signed this browser out.</p>
    </div>;
  }

  if (state === "signed-in" || state === "submitting") {
    return <form className="rounded-card border border-line bg-paper p-5" onSubmit={submit}>
      <p className="font-semibold">You are signed in.</p>
      <p className="mt-2 text-ink-soft">Submitting a request starts Aeyron’s deletion process. It does not delete data instantly, and we will not ask for a password here.</p>
      <label className="mt-5 flex items-start gap-3 text-sm text-ink">
        <input checked={confirmed} className="mt-1 size-4" onChange={event => setConfirmed(event.target.checked)} type="checkbox" />
        <span>I understand this requests permanent account and cloud-data deletion, subject to any legally required retention.</span>
      </label>
      <button className="mt-5 min-h-11 rounded-full bg-ink px-5 font-semibold text-mist disabled:cursor-not-allowed disabled:opacity-50" disabled={!confirmed || state === "submitting"} type="submit">
        {state === "submitting" ? "Submitting request…" : "Request account deletion"}
      </button>
    </form>;
  }

  return <form className="rounded-card border border-line bg-paper p-5" onSubmit={requestLink}>
    <label className="block font-semibold" htmlFor="deletion-email">Sign in to continue</label>
    <p className="mt-2 text-ink-soft">Enter the email for the Aeyron account you want to delete. We will send a one-time sign-in link. We do not display whether an account exists.</p>
    <input autoComplete="email" className="mt-4 min-h-11 w-full rounded-lg border border-line-strong bg-canvas px-3 text-ink" disabled={state === "sending-link"} id="deletion-email" onChange={event => setEmail(event.target.value)} required type="email" value={email} />
    <button className="mt-4 min-h-11 rounded-full bg-signal px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={state === "sending-link"} type="submit">
      {state === "sending-link" ? "Sending secure link…" : "Send secure sign-in link"}
    </button>
    {state === "link-sent" && <p className="mt-4 text-sm text-ink-soft" role="status">If this email can sign in to Aeyron, a secure link is on its way. Open it in this browser to continue.</p>}
    {state === "error" && <p className="mt-4 text-sm text-ink" role="alert">{error}</p>}
  </form>;
}
