"use server";

import { contact } from "@/lib/content/site";
import { ATTACH, EMAIL } from "@/lib/forms";

export type InquiryResult =
  | { ok: true }
  | {
      ok: false;
      reason: "invalid" | "too-big" | "not-configured" | "failed";
      /** the inquiry as plain text, so the visitor can send it themselves */
      draft?: string;
      /** files were attached (an email draft can't carry them) */
      attached?: boolean;
    };

const text =(v: FormDataEntryValue | null, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Receives the contact form. Validates name and email, then delivers through
 * Resend when it is configured, with any attached files (up to ATTACH limits):
 *
 *   RESEND_API_KEY   Resend API key
 *   INQUIRY_TO       where inquiries go (e.g. the team inbox)
 *   INQUIRY_FROM     a sender on a domain verified with Resend
 *
 * TODO(client): choose and configure the email provider. Until then this
 * returns { ok: false, reason: "not-configured" } and the form shows the
 * address to write to instead. It reports ok only when delivery succeeded.
 */
export async function submitInquiry(_prev: InquiryResult | null, formData: FormData): Promise<InquiryResult> {
  const name = text(formData.get("name"), 200);
  const email = text(formData.get("email"), 320);
  if (!name || !EMAIL.test(email)) return { ok: false, reason: "invalid" };

  const org = text(formData.get("org"), 200);
  const types = contact.form.inquiryTypes;
  const rawType = text(formData.get("type"), 100);
  const type = types.includes(rawType) ? rawType : types[0];
  const known = new Set(contact.form.programs.map(p => p.value));
  const programs = formData.getAll("programs").filter((p): p is string => typeof p === "string" && known.has(p));
  const message = text(formData.get("msg"), 5000);
  const files = formData
    .getAll("files")
    .filter((f): f is File => typeof f === "object" && f !== null && "arrayBuffer" in f && f.size > 0)
    .slice(0, ATTACH.maxFiles);
  const attached = files.length > 0;

  const draft = `Inquiry: ${type}\nName: ${name}\nOrganization: ${org || "—"}\nEmail: ${email}\nPrograms: ${programs.join(", ") || "Not specified"}${
    attached ? `\nAttachments: ${files.map(f => f.name).join(", ")}` : ""
  }\n\n${message}`;

  if (files.reduce((n, f) => n + f.size, 0) > ATTACH.maxBytes) return { ok: false, reason: "too-big", draft, attached };

  const key = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO;
  const from = process.env.INQUIRY_FROM;
  if (!key || !to || !from) return { ok: false, reason: "not-configured", draft, attached };

  try {
    const attachments = await Promise.all(
      files.map(async f => ({ filename: f.name.slice(0, 200) || "attachment", content: Buffer.from(await f.arrayBuffer()).toString("base64") })),
    );
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `${type} inquiry from ${name}${org ? ` (${org})` : ""}`,
        text: draft,
        ...(attachments.length ? { attachments } : {}),
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return { ok: false, reason: "failed", draft, attached };
    return { ok: true };
  } catch {
    return { ok: false, reason: "failed", draft, attached };
  }
}
