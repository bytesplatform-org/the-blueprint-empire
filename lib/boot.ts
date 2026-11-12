/**
 * Page boot: the loader waits on the tasks registered here (fonts, window
 * load, the hero's glyph atlas, …) and calls finishBoot() as it leaves.
 *
 * Keyed tasks are idempotent, so StrictMode's double mount (or a remount after
 * navigation) can register the same task again without counting it twice:
 * the newest promise for a key replaces an older one still pending. Once the
 * page has booted, it stays booted for the rest of the session.
 */

type Entry = { done: boolean; token: number };

const tasks = new Map<string, Entry>();
const callbacks = new Set<() => void>();
let anonymous = 0;
let token = 0;
let finished = false;

/** Registers something the loader should wait for. Rejections count as settled. */
export function bootTask(promise: PromiseLike<unknown>, key = `task-${anonymous++}`) {
  if (finished) return;
  const existing = tasks.get(key);
  if (existing?.done) return;
  const mine = ++token;
  tasks.set(key, { done: false, token: mine });
  Promise.resolve(promise)
    .catch(() => {})
    .finally(() => {
      const entry = tasks.get(key);
      if (entry && entry.token === mine) entry.done = true;
    });
}

export function bootProgress() {
  let settled = 0;
  tasks.forEach(t => { if (t.done) settled++; });
  return { total: tasks.size, settled };
}

/** Runs cb once the page has booted (at once if it already has). Returns the unsubscribe. */
export function onBootDone(cb: () => void): () => void {
  if (finished) {
    cb();
    return () => {};
  }
  callbacks.add(cb);
  return () => { callbacks.delete(cb); };
}

export function isBooted() {
  return finished;
}

/** Marks the page booted: releases html[data-site-loading] (so introsReady() resolves) and runs the callbacks. */
export function finishBoot() {
  if (finished) return;
  finished = true;
  const root = document.documentElement;
  root.removeAttribute("data-site-loading");
  root.classList.add("booted");
  const pending = [...callbacks];
  callbacks.clear();
  for (const cb of pending) {
    try {
      cb();
    } catch (error) {
      console.error(error);
    }
  }
}
