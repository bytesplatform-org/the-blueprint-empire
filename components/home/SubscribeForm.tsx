"use client";

import { useActionState, useState, type FormEvent, type ReactNode } from "react";
import { subscribe, type SubscribeResult } from "@/app/actions/subscribe";
import { contact, insider } from "@/lib/content/site";
import { EMAIL } from "@/lib/forms";

/** The Empire Insider List signup; says "on the list" only when the server confirms. */
export default function SubscribeForm() {
  const [result, action, pending] = useActionState<SubscribeResult | null, FormData>(subscribe, null);
  const [invalid, setInvalid] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    const bad = !EMAIL.test(email);
    setInvalid(bad);
    if (bad) e.preventDefault();
  };

  let message: ReactNode = null;
  if (invalid || (result && !result.ok && result.reason === "invalid")) message = insider.invalid;
  else if (result?.ok) message = insider.sent;
  else if (result && !result.ok) {
    const mailto = `mailto:${contact.email}?subject=${encodeURIComponent("Join the Empire Insider List")}`;
    message = (
      <>
        {insider.fallback} <a href={mailto}>{insider.openDraft}</a>
      </>
    );
  }

  return (
    <form className="sub-form" action={action} onSubmit={onSubmit} noValidate>
      <label htmlFor="s-email">{insider.field}</label>
      <div className="sub-row">
        <input id="s-email" name="email" type="email" autoComplete="email" placeholder={insider.field} required />
        <button className="btn" type="submit" disabled={pending}>
          {insider.submit}
        </button>
      </div>
      <p className="sub-msg" role="status" aria-live="polite" hidden={!message}>
        {message}
      </p>
    </form>
  );
}
