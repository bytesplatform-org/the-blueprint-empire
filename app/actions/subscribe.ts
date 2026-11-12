"use server";

import { EMAIL } from "@/lib/forms";

export type SubscribeResult = { ok: true } | { ok: false; reason: "invalid" | "not-configured" | "failed" };

/**
 * The Empire Insider List signup. Validates the address, then sends it to the
 * team inbox through Resend, the same provider and settings as the inquiry
 * form (RESEND_API_KEY, INQUIRY_TO, INQUIRY_FROM).
 *
 * TODO(client): if the list lives in a mailing tool (Mailchimp, Klaviyo, a
 * Resend audience…), add the contact there instead. Until delivery is
 * configured this returns "not-configured" and the form offers an email.
 */
export async function subscribe(_prev: SubscribeResult | null, formData: FormData): Promise<SubscribeResult> {
  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim().slice(0, 320) : "";
  if (!EMAIL.test(email)) return { ok: false, reason: "invalid" };

  const key = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO;
  const from = process.env.INQUIRY_FROM;
  if (!key || !to || !from) return { ok: false, reason: "not-configured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: "Empire Insider List signup",
        text: `Add to the Empire Insider List: ${email}`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok ? { ok: true } : { ok: false, reason: "failed" };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
