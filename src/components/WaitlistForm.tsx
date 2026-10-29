import { type FormEvent, useEffect, useState } from "react";
import { brand } from "../content/site";
import { links, roles, worryOptions, type RoleId } from "../content/home";
import { joinWaitlist, WaitlistError } from "../waitlistApi";

type Status = "idle" | "sending" | "done" | "error";

const field =
  "w-full rounded-xl border border-line-strong bg-paper px-4 py-3 text-base text-ink " +
  "placeholder:text-ink-faint focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/25";

/** Reads #join?role=clinician style links so section buttons can preselect a role. */
function roleFromHash(): RoleId | null {
  const match = window.location.hash.match(/role=([a-z_]+)/);
  const found = roles.find(r => r.id === match?.[1]);
  return found ? found.id : null;
}

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleId>(roleFromHash() ?? "caregiver");
  const [needs, setNeeds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, hidden from people
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    // "#join?role=clinician" is not a real element id, so scroll to the form ourselves.
    const onHash = () => {
      if (!window.location.hash.startsWith("#join")) return;
      const fromHash = roleFromHash();
      if (fromHash) setRole(fromHash);
      document.getElementById("join")?.scrollIntoView({ block: "start" });
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function toggleNeed(id: string) {
    setNeeds(current => (current.includes(id) ? current.filter(n => n !== id) : [...current, id]));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (website) {
      setStatus("done");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      await joinWaitlist({ name, email, role, needs, note });
      setStatus("done");
      requestAnimationFrame(() => document.getElementById("join-done")?.scrollIntoView({ block: "center" }));
    } catch (caught) {
      setStatus("error");
      setError(
        caught instanceof WaitlistError && caught.code === "rejected"
          ? "Please check your email address and try again."
          : "Something went wrong on our side.",
      );
    }
  }

  if (status === "done") {
    return (
      <div id="join-done" className="rounded-[var(--radius-card)] border border-line bg-paper p-6 sm:p-8" role="status">
        <p className="text-sm font-semibold uppercase tracking-wide text-signal-deep">You're on the list</p>
        <h3 className="mt-2 text-2xl text-ink">Thank you. We'll be in touch soon.</h3>
        <p className="mt-3 text-ink-soft">Don't want to wait? You can start today.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a className="btn btn-primary" href={links.testflight} target="_blank" rel="noopener noreferrer">
            Get the iPhone app
          </a>
          <a className="btn btn-ghost" href={links.bookCall}>
            Book a 15-minute call
          </a>
        </div>
      </div>
    );
  }

  const isClinician = role === "clinician";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[var(--radius-card)] border border-line bg-paper p-5 shadow-[0_24px_60px_-40px_oklch(0.3_0.08_255/0.45)] sm:p-8"
    >
      <fieldset>
        <legend className="text-base font-semibold text-ink">Which describes you?</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {roles.map(option => (
            <label
              key={option.id}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[0.95rem] transition-colors ${
                role === option.id ? "border-signal bg-signal-tint text-ink" : "border-line-strong text-ink-soft hover:border-signal/60"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={option.id}
                checked={role === option.id}
                onChange={() => setRole(option.id)}
                className="h-4 w-4 accent-[var(--color-signal)]"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">First name</span>
          <input className={`${field} mt-1.5`} value={name} onChange={e => setName(e.target.value)} autoComplete="given-name" maxLength={120} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            className={`${field} mt-1.5`}
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            maxLength={254}
          />
        </label>
      </div>

      {!isClinician && (
        <fieldset className="mt-6">
          <legend className="text-base font-semibold text-ink">
            What worries you most? <span className="font-normal text-ink-soft">Pick any</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {worryOptions.map(option => {
              const on = needs.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleNeed(option.id)}
                  className={`min-h-11 rounded-full border px-4 text-[0.95rem] transition-colors ${
                    on ? "border-signal bg-signal text-white" : "border-line-strong bg-paper text-ink hover:border-signal/60"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <label className="mt-6 block">
        <span className="text-sm font-medium text-ink">
          {isClinician ? "Your clinic or practice, and what you'd want to see" : "Anything you'd like us to know?"}{" "}
          <span className="font-normal text-ink-soft">Optional</span>
        </span>
        <textarea className={`${field} mt-1.5 min-h-24`} value={note} onChange={e => setNote(e.target.value)} maxLength={1000} rows={3} />
      </label>

      <label className="absolute -left-[9999px]" aria-hidden="true">
        Website
        <input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
      </label>

      {status === "error" && (
        <p className="mt-4 rounded-xl bg-attention/15 px-4 py-3 text-[0.95rem] text-ink" role="alert">
          {error} You can also email{" "}
          <a className="font-medium text-signal-deep underline underline-offset-4" href={links.email}>
            {brand.contactEmail}
          </a>
          .
        </p>
      )}

      <button className="btn btn-primary mt-6 w-full sm:w-auto" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Joining..." : "Join the waitlist"}
      </button>
      <p className="mt-3 text-sm text-ink-soft">
        Everything is free right now. We only use this to contact you about Aeyron.{" "}
        <a className="underline underline-offset-4 hover:text-ink" href="/privacy">
          Privacy
        </a>
      </p>
    </form>
  );
}
