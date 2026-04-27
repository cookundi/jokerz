import { useState, useEffect } from "react";

const REF_KEY = "jokerz_ref";

export function useReferral() {
  const [referrer, setReferrer] = useState<string | null>(null);

  useEffect(() => {
    // Check URL params
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (ref) {
      const clean = ref.toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (clean) {
        sessionStorage.setItem(REF_KEY, clean);
        setReferrer(clean);
        // Clean URL without reload
        const url = new URL(window.location.href);
        url.searchParams.delete("ref");
        window.history.replaceState({}, "", url.toString());
        return;
      }
    }

    // Check session storage
    const stored = sessionStorage.getItem(REF_KEY);
    if (stored) setReferrer(stored);
  }, []);

  return referrer;
}
