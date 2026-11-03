import { createClient } from "@supabase/supabase-js";
// Supabase persists its session for refreshes, new tabs and full-page Stripe redirects.
// The browser origin scopes localStorage; Supabase rotates refresh tokens and removes
// the stored session on sign-out. This does not protect tokens against same-origin XSS:
// maintain a strict CSP, sanitize user content and enforce RLS on every data path.
// Use process memory only if browser storage is unavailable (e.g. privacy restrictions).
const fallbackSessions = new Map();
const persistentAuthStorage = {
  getItem: (key) => {
    try {
      return typeof window === 'undefined'
        ? fallbackSessions.get(key) ?? null
        : window.localStorage.getItem(key);
    } catch {
      return fallbackSessions.get(key) ?? null;
    }
  },
  setItem: (key, value) => {
    fallbackSessions.set(key, value);
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
    } catch {
      // Non-persistent fallback; authentication remains functional in this tab.
    }
  },
  removeItem: (key) => {
    fallbackSessions.delete(key);
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(key);
    } catch {
      // Browser storage unavailable.
    }
  },
};
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: persistentAuthStorage,
    persistSession: true,
    autoRefreshToken: true
  }
});
export {
  supabase
};
