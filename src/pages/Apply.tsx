import { useState, useEffect, useCallback, useRef } from "react";
import { useReferral } from "../hooks/useReferral";
import type { ToastType } from "../hooks/useToast";

const X_PROFILE = import.meta.env.VITE_X_PROFILE || "https://x.com/JokerzETH";
const X_POST = import.meta.env.VITE_X_POST || "https://x.com/JokerzETH/";
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://jokerz.lol";

/* ── Validation ── */
const validate: Record<string, (v: string) => boolean> = {
  x_username: (v) => /^[a-zA-Z0-9_]{1,15}$/.test(v.replace("@", "")),
  comment_link: (v) => /^https:\/\/(x|twitter)\.com\/[a-zA-Z0-9_]+\/status\/\d+/.test(v),
  post_link: (v) => /^https:\/\/(x|twitter)\.com\/[a-zA-Z0-9_]+\/status\/\d+/.test(v),
  quote_link: (v) => /^https:\/\/(x|twitter)\.com\/[a-zA-Z0-9_]+\/status\/\d+/.test(v),
  wallet: (v) => /^0x[a-fA-F0-9]{40}$/.test(v),
};

const hints: Record<string, string> = {
  x_username: "your_username (no @)",
  comment_link: "https://x.com/.../status/...",
  post_link: "https://x.com/.../status/...",
  quote_link: "https://x.com/.../status/...",
  wallet: "0x...",
};

interface Task {
  id: string;
  num: string;
  title: string;
  desc: string;
  taunt: string;
  url: string;
  field: string;
  fieldLabel: string;
  doneMsg: string;
}

const TASKS: Task[] = [
  {
    id: "follow",
    num: "01",
    title: "FOLLOW THE RINGMASTER",
    desc: "Follow @JokerzETH on X. The circus needs to know your face.",
    taunt: "Go. Follow. Come back. We'll know.",
    url: X_PROFILE,
    field: "x_username",
    fieldLabel: "Drop your X username",
    doneMsg: "You're on the radar now",
  },
  {
    id: "like_rt",
    num: "02",
    title: "SPREAD THE MADNESS",
    desc: "Like & Retweet the post. Show the timeline what's coming.",
    taunt: "Smash that like. RT it. You know the drill.",
    url: X_POST,
    field: "post_link",
    fieldLabel: "Paste the post link",
    doneMsg: "The madness spreads",
  },
  {
    id: "comment",
    num: "03",
    title: "SAY SOMETHING UNHINGED",
    desc: "Drop a comment. Make it weird. Make it memorable.",
    taunt: "Don't be boring. The clowns are watching.",
    url: X_POST,
    field: "comment_link",
    fieldLabel: "Paste your comment link",
    doneMsg: "The clowns approve",
  },
  {
    id: "quote",
    num: "04",
    title: "QUOTE THE CHAOS",
    desc: "Quote the post with your own twist. Add to the noise.",
    taunt: "Put your spin on it. Make some noise.",
    url: X_POST,
    field: "quote_link",
    fieldLabel: "Paste your quote link",
    doneMsg: "Chaos amplified",
  },
  {
    id: "wallet",
    num: "05",
    title: "SHOW YOUR WALLET",
    desc: "Drop your EVM address. This is where the ticket lands.",
    taunt: "No wallet, no entry. Simple.",
    url: "",
    field: "wallet",
    fieldLabel: "Your EVM wallet address",
    doneMsg: "Wallet locked and loaded",
  },
];

type Phase = "action" | "verifying" | "input" | "done";

interface ApplyProps {
  toast: (msg: string, type?: ToastType) => number;
}

export function Apply({ toast }: ApplyProps) {
  const referrer = useReferral();
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>("action");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [values, setValues] = useState<string[]>(Array(TASKS.length).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [refCopied, setRefCopied] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (referrer) toast(`Referred by @${referrer} — noted`, "info");
  }, [referrer, toast]);

  useEffect(() => {
    if (phase === "input" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  const task = TASKS[current];
  const isWallet = task.id === "wallet";

  const goToX = () => {
    if (task.url) window.open(task.url, "_blank", "noopener");
    setPhase("verifying");
    setTimeout(() => setPhase("input"), 3000);
  };

  const submitField = () => {
    const raw = value.trim();
    const clean = task.field === "x_username" ? raw.replace("@", "") : raw;

    if (!clean) {
      setError("Can't leave this empty, freak");
      return;
    }
    if (!validate[task.field](clean)) {
      setError("That doesn't look right. Check the format.");
      toast("Invalid format", "error");
      return;
    }

    // Save value
    const next = [...values];
    next[current] = clean;
    setValues(next);
    setPhase("done");
    toast(task.doneMsg, "success");
  };

  const nextStep = () => {
    if (current + 1 >= TASKS.length) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent((c) => c + 1);
      setPhase(TASKS[current + 1].url ? "action" : "action");
      setValue("");
      setError("");
      setTransitioning(false);
    }, 350);
  };

  const handleFinalSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const payload = {
      x_username: values[0],
      post_link: values[1],
      comment_link: values[2],
      quote_link: values[3],
      wallet_address: values[4],
      referred_by: referrer || null,
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "Submission failed", "error");
        setSubmitting(false);
        return;
      }

      setRefCode(data.ref_code || payload.x_username);
      setSubmitted(true);
      toast("You're in — welcome to the circus", "success");
      spawnConfetti();
    } catch {
      toast("Network error — try again", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const copyRefLink = () => {
    const link = `${SITE_URL}?ref=${refCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setRefCopied(true);
      toast("Referral link copied", "info");
      setTimeout(() => setRefCopied(false), 2000);
    });
  };

  /* ── Submitted success screen ── */
  if (submitted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-5 pt-12">
        <div className="w-full max-w-sm text-center card-enter">
          <div className="text-5xl sm:text-6xl mb-5">🎪</div>
          <h1 className="font-[family-name:var(--font-pixel)] text-xs sm:text-sm text-bone mb-3 leading-relaxed">
            YOU'RE IN, FREAK
          </h1>
          <p className="font-[family-name:var(--font-retro)] text-lg sm:text-xl text-fog/60 mb-8 leading-relaxed">
            Application submitted. Spread the chaos — every referral boosts your odds.
          </p>

          <div className="bg-slab border border-smoke/30 p-5 text-left mb-5">
            <p className="font-[family-name:var(--font-pixel)] text-[7px] text-fog/40 tracking-[3px] mb-3">
              YOUR REFERRAL LINK
            </p>
            <p className="font-[family-name:var(--font-retro)] text-base text-fog/70 break-all mb-4 leading-relaxed">
              {SITE_URL}?ref={refCode}
            </p>
            <button onClick={copyRefLink} className="btn-torn w-full">
              {refCopied ? "COPIED ✦" : "COPY LINK"}
            </button>
          </div>

          <p className="font-[family-name:var(--font-retro)] text-sm text-fog/30">
            Each referral = +1 point
          </p>
        </div>
      </div>
    );
  }

  /* ── Main wizard ── */
  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      {/* ── Background images ── */}
      <img
        src="/joker-1.png"
        alt=""
        className="
          pixel-img absolute float-chaotic
          w-44 h-44 sm:w-64 sm:h-64
          -right-8 sm:right-[5%] top-[10%]
          opacity-[0.07] sm:opacity-[0.09]
          rotate-12
          pointer-events-none select-none
        "
      />
      <img
        src="/joker-2.png"
        alt=""
        className="
          pixel-img absolute float-drift
          w-36 h-36 sm:w-52 sm:h-52
          -left-6 sm:left-[4%] bottom-[8%]
          opacity-[0.05] sm:opacity-[0.07]
          -rotate-12
          pointer-events-none select-none
        "
      />

      {/* ── Scattered HA HA ── */}
      <span className="absolute font-[family-name:var(--font-pixel)] text-[8px] text-blood/[0.06] left-[8%] top-[20%] -rotate-12 pointer-events-none select-none hidden lg:block" style={{ animation: "float-chaotic 7s ease-in-out infinite" }}>
        HA HA HA
      </span>
      <span className="absolute font-[family-name:var(--font-pixel)] text-[6px] text-grape/[0.06] right-[12%] bottom-[30%] rotate-6 pointer-events-none select-none hidden lg:block" style={{ animation: "float-chaotic 9s ease-in-out 2s infinite" }}>
        HA HA HA HA
      </span>

      {/* ── Top bar with teeth progress ── */}
      <div className="fixed top-12 left-0 right-0 z-50 bg-void/80 backdrop-blur-md border-b border-smoke/20">
        <div className="w-full mx-auto px-6 sm:px-10 py-3 flex items-center justify-center gap-5 sm:gap-8">
          <p className="font-[family-name:var(--font-pixel)] text-[7px] sm:text-[8px] text-fog/40 tracking-[2px] shrink-0">
            WHITELIST
          </p>
          {/* Teeth progress */}
          <div className="flex items-end gap-[3px]">
            {TASKS.map((_, i) => (
              <div
                key={i}
                className={`tooth ${i < current ? "done" : i === current ? "active" : ""}`}
              />
            ))}
          </div>
          <p className="font-[family-name:var(--font-retro)] text-sm text-fog/30 shrink-0">
            {current + 1}/{TASKS.length}
          </p>
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="flex-1 flex items-center justify-center px-5 pt-28 pb-8">
        <div
          className={`w-full max-w-md ${transitioning ? "card-exit" : "card-enter"}`}
          key={current}
        >
          {/* Step number + title */}
          <div className="mb-6 sm:mb-8">
            <span className="font-[family-name:var(--font-pixel)] text-[9px] text-blood/60 tracking-[3px]">
              STEP {task.num}
            </span>
            <h2 className="font-[family-name:var(--font-pixel)] text-[11px] sm:text-sm text-bone mt-2 leading-relaxed">
              {task.title}
            </h2>
            <p className="font-[family-name:var(--font-retro)] text-lg sm:text-xl text-fog/50 mt-2 leading-relaxed">
              {task.desc}
            </p>
          </div>

          {/* ── Phase: ACTION ── */}
          {phase === "action" && (
            <div className="fade-up">
              <p className="font-[family-name:var(--font-retro)] text-base text-fog/30 italic mb-5">
                "{task.taunt}"
              </p>

              {isWallet ? (
                /* Wallet goes straight to input */
                <div>
                  <label className="font-[family-name:var(--font-retro)] text-sm text-fog/40 block mb-2">
                    {task.fieldLabel}
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => { setValue(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && submitField()}
                    placeholder={hints[task.field]}
                    className={`pixel-input mb-3 ${error ? "has-error" : ""}`}
                  />
                  {error && (
                    <p className="font-[family-name:var(--font-retro)] text-sm text-blood mb-3">{error}</p>
                  )}
                  <button onClick={submitField} className="btn-torn w-full">
                    LOCK IT IN
                  </button>
                </div>
              ) : (
                <button onClick={goToX} className="btn-torn">
                  GO TO X →
                </button>
              )}
            </div>
          )}

          {/* ── Phase: VERIFYING ── */}
          {phase === "verifying" && (
            <div className="fade-up flex flex-col items-center py-6">
              <div className="flex gap-2 mb-4">
                <span className="w-2 h-2 bg-blood rounded-none animate-pulse" />
                <span className="w-2 h-2 bg-yolk rounded-none animate-pulse" style={{ animationDelay: "0.2s" }} />
                <span className="w-2 h-2 bg-grape rounded-none animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
              <p className="font-[family-name:var(--font-retro)] text-xl text-fog/50">
                Verifying<span className="loading-dots" />
              </p>
              <p className="font-[family-name:var(--font-retro)] text-sm text-fog/20 mt-2">
                The clowns are checking...
              </p>
            </div>
          )}

          {/* ── Phase: INPUT ── */}
          {phase === "input" && (
            <div className="fade-up">
              <label className="font-[family-name:var(--font-retro)] text-sm text-fog/40 block mb-2">
                {task.fieldLabel}
              </label>
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && submitField()}
                placeholder={hints[task.field]}
                className={`pixel-input mb-3 ${error ? "has-error" : ""}`}
              />
              {error && (
                <p className="font-[family-name:var(--font-retro)] text-sm text-blood mb-3">{error}</p>
              )}
              <button onClick={submitField} className="btn-torn w-full">
                SUBMIT
              </button>
            </div>
          )}

          {/* ── Phase: DONE ── */}
          {phase === "done" && (
            <div className="text-center py-4">
              {/* Stamp */}
              <div className="stamp-in inline-block mb-5">
                <div className="border-[3px] border-toxic px-5 py-2 rotate-[-3deg]">
                  <span className="font-[family-name:var(--font-pixel)] text-[11px] sm:text-sm text-toxic tracking-[4px]">
                    GRABBED
                  </span>
                </div>
              </div>

              <p className="font-[family-name:var(--font-retro)] text-xl text-fog/50 mb-6">
                {task.doneMsg}
              </p>

              {current + 1 < TASKS.length ? (
                <button onClick={nextStep} className="btn-torn">
                  NEXT STEP →
                </button>
              ) : (
                <button
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="btn-torn"
                >
                  {submitting ? "SUBMITTING..." : "SUBMIT APPLICATION"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom referral note ── */}
      {referrer && (
        <div className="fixed bottom-0 left-0 right-0 bg-grape/[0.06] border-t border-grape/15 py-2 text-center z-50">
          <p className="font-[family-name:var(--font-retro)] text-sm text-grape/60">
            🎪 Referred by @{referrer}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Confetti burst ── */
function spawnConfetti() {
  const colors = ["#e81c2e", "#2bff2b", "#a435f0", "#ffd600", "#00e5ff", "#ffffff"];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = `${Math.random() * 100}vw`;
    el.style.top = `${-10 + Math.random() * 10}px`;
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = `${Math.random() * 0.5}s`;
    el.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
    el.style.width = `${4 + Math.random() * 6}px`;
    el.style.height = `${4 + Math.random() * 6}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
}
