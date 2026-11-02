import { createClient } from "@supabase/supabase-js";
const volatile = new Map();
const memoryAuthStorage = {
  getItem: key => volatile.get(key) ?? null,
  setItem: (key,value) => { volatile.set(key,value); },
  removeItem: key => { volatile.delete(key); }
};
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: memoryAuthStorage,
    persistSession: true,
    autoRefreshToken: true
  }
});
export {
  supabase
};
