"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

/**
 * Copies `value` to the clipboard. The write happens inside the click
 * handler (clipboard access needs the user gesture); where it isn't allowed,
 * the text just before the button is selected instead so it can be copied by hand.
 */
export default function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [text, setText] = useState(label);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const done = (t: string) => {
      setText(t);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setText(label), 1600);
    };
    const select = () => {
      const el = button.previousElementSibling;
      const selection = window.getSelection();
      if (el && selection) {
        const range = document.createRange();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      done("Selected");
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(value).then(() => done("Copied"), select);
    else select();
  };

  return (
    <button type="button" className="copy" onClick={onClick} aria-live="polite">
      {text}
    </button>
  );
}
