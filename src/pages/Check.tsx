import { useState, useEffect, useCallback } from "react";
import type { ToastType } from "../hooks/useToast";

interface Entry {
  x_username: string;
  wallet_address: string;
  ref_points: number;
  is_whitelisted: boolean;
}

interface CheckProps {
  toast: (msg: string, type?: ToastType) => number;
}

export function Check({ toast }: CheckProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searched, setSearched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchEntries = useCallback(
    async (query = "", silent = false) => {
      setLoading(true);
      try {
        const url = query ? `/api/entries?q=${encodeURIComponent(query)}` : "/api/entries";
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setEntries(data.entries || []);
      } catch {
        // Only show toast on user-triggered searches, not initial page load
        if (!silent) toast("Failed to load entries", "error");
        setEntries([]);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [toast]
  );

  useEffect(() => { fetchEntries("", true); }, [fetchEntries]);

  const handleSearch = () => {
    const q = search.trim();
    setSearched(!!q);
    fetchEntries(q);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center pt-12 px-5 pb-10">
      <div className="w-full max-w-2xl pt-10 sm:pt-16">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="font-[family-name:var(--font-pixel)] text-[7px] sm:text-[8px] text-blood/60 tracking-[3px]">
            WALLET CHECKER
          </span>
          <h1 className="font-[family-name:var(--font-pixel)] text-xs sm:text-sm text-bone mt-2 leading-relaxed">
            THE GUEST LIST
          </h1>
          <p className="font-[family-name:var(--font-retro)] text-lg text-fog/50 mt-1">
            Search by wallet or username.
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-8 max-w-lg mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="wallet or username..."
            className="pixel-input flex-1 min-w-0"
          />
          <button onClick={handleSearch} className="btn-torn shrink-0">
            SEARCH
          </button>
        </div>

        {searched && (
          <button
            onClick={() => { setSearch(""); setSearched(false); fetchEntries("", true); }}
            className="font-[family-name:var(--font-retro)] text-sm text-fog/40 hover:text-bone transition-colors mb-4 block mx-auto"
          >
            ← Clear search
          </button>
        )}

        {/* Table */}
        <div className="border border-smoke/20 overflow-x-auto">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto] sm:grid-cols-[1fr_1.5fr_auto_auto] gap-3 sm:gap-4 px-4 py-3 bg-slab/40 border-b border-smoke/20 min-w-[340px]">
            <span className="font-[family-name:var(--font-pixel)] text-[7px] text-fog/30 tracking-wider">USER</span>
            <span className="font-[family-name:var(--font-pixel)] text-[7px] text-fog/30 tracking-wider hidden sm:block">WALLET</span>
            <span className="font-[family-name:var(--font-pixel)] text-[7px] text-fog/30 tracking-wider text-center w-12">REFS</span>
            <span className="font-[family-name:var(--font-pixel)] text-[7px] text-fog/30 tracking-wider text-right w-16">STATUS</span>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blood animate-pulse" />
                <span className="w-2 h-2 bg-yolk animate-pulse" style={{ animationDelay: "0.15s" }} />
                <span className="w-2 h-2 bg-grape animate-pulse" style={{ animationDelay: "0.3s" }} />
              </div>
              <span className="font-[family-name:var(--font-retro)] text-base text-fog/40">Loading...</span>
            </div>
          )}

          {!loading && entries.length === 0 && (
            <div className="text-center py-16">
              <p className="font-[family-name:var(--font-retro)] text-lg text-fog/30">
                {searched ? "No matches. Try another search." : "No entries yet."}
              </p>
            </div>
          )}

          {!loading && entries.map((entry, i) => (
            <div
              key={entry.wallet_address + i}
              className="grid grid-cols-[1fr_1fr_auto_auto] sm:grid-cols-[1fr_1.5fr_auto_auto] gap-3 sm:gap-4 px-4 py-3 border-b border-smoke/10 last:border-0 hover:bg-slab/20 transition-colors min-w-[340px]"
            >
              <span className="font-[family-name:var(--font-retro)] text-base text-bone truncate">
                @{entry.x_username}
              </span>
              <span className="font-[family-name:var(--font-retro)] text-base text-fog/40 truncate hidden sm:block">
                {entry.wallet_address.slice(0, 6)}...{entry.wallet_address.slice(-4)}
              </span>
              <span className={`font-[family-name:var(--font-retro)] text-base text-center w-12 ${entry.ref_points > 0 ? "text-yolk" : "text-fog/20"}`}>
                {entry.ref_points}
              </span>
              <span className="w-16 text-right">
                {entry.is_whitelisted ? (
                  <span className="font-[family-name:var(--font-pixel)] text-[7px] text-toxic tracking-wider">WL ✦</span>
                ) : (
                  <span className="font-[family-name:var(--font-pixel)] text-[7px] text-fog/20 tracking-wider">PENDING</span>
                )}
              </span>
            </div>
          ))}
        </div>

        {!loading && entries.length > 0 && (
          <p className="font-[family-name:var(--font-retro)] text-sm text-fog/20 mt-3 text-right">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        )}
      </div>
    </div>
  );
}
