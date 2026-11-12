"use client";

import { Fragment, useActionState, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { submitInquiry, type InquiryResult } from "@/app/actions/inquiry";
import { contact } from "@/lib/content/site";

const EMAIL = /^\S+@\S+\.\S+$/;

/**
 * The inquiry form posts to the submitInquiry Server Action. It says "sent"
 * only when the server confirms delivery; otherwise it gives the address to
 * write to (and the inquiry as a ready-made email).
 */
export default function InquiryForm() {
  const [result, action, pending] = useActionState<InquiryResult | null, FormData>(submitInquiry, null);
  const [invalid, setInvalid] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const { form } = contact;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const name = nameRef.current?.value.trim() ?? "";
    const email = emailRef.current?.value.trim() ?? "";
    if (!name || !EMAIL.test(email)) {
      e.preventDefault();
      setInvalid(true);
      (name ? emailRef : nameRef).current?.focus();
      return;
    }
    setInvalid(false);
  };

  let message: ReactNode = null;
  if (invalid || (result && !result.ok && result.reason === "invalid")) message = form.invalid;
  else if (result?.ok) message = form.sent;
  else if (result && !result.ok) {
    const mailto = `mailto:${contact.email}?subject=${encodeURIComponent("Program inquiry")}&body=${encodeURIComponent(result.draft ?? "")}`;
    message = (
      <>
        {form.fallback} <a href={mailto}>{form.openDraft}</a>
      </>
    );
  }

  return (
    <form className="inq" action={action} onSubmit={onSubmit} noValidate data-reveal="settle" style={{ "--i": 1 } as CSSProperties}>
      <div className="f2">
        <label htmlFor="f-name">
          Name
          <input id="f-name" name="name" autoComplete="name" required ref={nameRef} />
        </label>
        <label htmlFor="f-org">
          Agency / organization
          <input id="f-org" name="org" autoComplete="organization" />
        </label>
      </div>
      <div className="f2">
        <label htmlFor="f-email">
          Email
          <input id="f-email" name="email" type="email" autoComplete="email" required ref={emailRef} />
        </label>
        <label htmlFor="f-type">
          Inquiry type
          <select id="f-type" name="type" defaultValue={form.inquiryTypes[0]}>
            {form.inquiryTypes.map(t => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <fieldset>
        <legend>Programs of interest</legend>
        <div className="chips">
          {form.programs.map((p, i) => (
            <Fragment key={p.value}>
              <input type="checkbox" id={`c${i + 1}`} name="programs" value={p.value} />
              <label htmlFor={`c${i + 1}`}>{p.label}</label>
            </Fragment>
          ))}
        </div>
      </fieldset>
      <label htmlFor="f-msg">
        Project details
        <textarea id="f-msg" name="msg" placeholder={form.detailsPlaceholder} />
      </label>
      <div className="form-msg" role="status" aria-live="polite" hidden={!message}>
        {message}
      </div>
      <button className="btn" type="submit" disabled={pending}>
        {form.submit}
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
    </form>
  );
}
