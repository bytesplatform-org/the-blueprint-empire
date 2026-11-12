/** Limits for files attached to the inquiry form, shared by the form and its Server Action. */
export const ATTACH = {
  maxFiles: 5,
  /** in total; keep under serverActions.bodySizeLimit in next.config.ts */
  maxBytes: 4 * 1024 * 1024,
  accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.heic,.webp",
};

export const EMAIL = /^\S+@\S+\.\S+$/;
