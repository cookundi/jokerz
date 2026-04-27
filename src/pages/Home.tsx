import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

/*
  DROP YOUR ART:
  Put 2 images in /public as joker-1.png and joker-2.png
  These float in the background of the hero and apply pages
*/

const MARQUEE =
  "HA HA HA ◆ THE CIRCUS AWAITS ◆ NO RULES ◆ JUST CHAOS ◆ HA HA HA ◆ THE CIRCUS AWAITS ◆ NO RULES ◆ JUST CHAOS ◆ ";

export function Home() {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* ═══ Hero ═══ */}
      <section className="flex-1 relative flex items-center justify-center overflow-hidden px-5">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-smoke) 1px, transparent 1px), linear-gradient(90deg, var(--color-smoke) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Radial glow center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,28,46,0.06)_0%,transparent_60%)]" />

        {/* ── Floating clown images ── */}
        <img
          src="/joker-1.png"
          alt=""
          className="
            pixel-img absolute float-drift pulse-glow
            w-32 h-32 sm:w-48 sm:h-48 lg:w-56 lg:h-56
            -left-4 sm:left-[8%] top-[18%] sm:top-[15%]
            opacity-20 sm:opacity-25
            -rotate-6
            pointer-events-none select-none
          "
        />
        <img
          src="/joker-2.png"
          alt=""
          className="
            pixel-img absolute float-slow
            w-28 h-28 sm:w-40 sm:h-40 lg:w-52 lg:h-52
            -right-2 sm:right-[8%] bottom-[15%] sm:bottom-[12%]
            opacity-15 sm:opacity-20
            rotate-6
            pointer-events-none select-none
          "
        />

        {/* ── Scattered HA HAs ── */}
        <HaText className="left-[12%] top-[30%] text-[10px] sm:text-xs" delay={0} />
        <HaText className="right-[15%] top-[22%] text-[8px] sm:text-[10px]" delay={1.5} />
        <HaText className="left-[20%] bottom-[25%] text-[9px]" delay={3} />
        <HaText className="right-[10%] bottom-[35%] text-[7px]" delay={2.2} />

        {/* ── Center content ── */}
        <div
          className={`
            relative z-10 text-center max-w-xl mx-auto
            transition-all duration-[800ms] ease-out
            ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          <h1
            className="glitch-text font-[family-name:var(--font-pixel)] text-[28px] sm:text-[42px] lg:text-[52px] text-bone leading-none mb-3"
            data-text="JOKERZ"
          >
            JOKERZ
          </h1>

          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-6 sm:w-10 h-[2px] bg-blood" />
            <span className="font-[family-name:var(--font-pixel)] text-[7px] sm:text-[8px] text-fog/60 tracking-[4px]">
              NFT
            </span>
            <span className="w-6 sm:w-10 h-[2px] bg-blood" />
          </div>

          <p
            className={`
              font-[family-name:var(--font-retro)] text-lg sm:text-2xl text-fog/60 leading-relaxed max-w-md mx-auto mb-10
              transition-all duration-[800ms] delay-200 ease-out
              ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
            `}
          >
            Unhinged pixel clowns living on-chain.
          </p>

          <div
            className={`
              flex flex-col sm:flex-row items-center justify-center gap-3
              transition-all duration-[800ms] delay-[400ms] ease-out
              ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
            `}
          >
            <Link to="/apply" className="btn-torn">
              JOIN THE CIRCUS
            </Link>
            <Link to="/check" className="btn-torn-ghost">
              CHECK WALLET
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Marquee strip ═══ */}
      <div className="overflow-hidden border-t border-blood/15 py-2 bg-blood/[0.03]">
        <div className="marquee-track">
          <span className="font-[family-name:var(--font-pixel)] text-[7px] sm:text-[8px] tracking-[3px] text-blood/40">
            {MARQUEE}
          </span>
          <span className="font-[family-name:var(--font-pixel)] text-[7px] sm:text-[8px] tracking-[3px] text-blood/40">
            {MARQUEE}
          </span>
        </div>
      </div>
    </div>
  );
}

function HaText({ className, delay }: { className: string; delay: number }) {
  return (
    <span
      className={`
        absolute font-[family-name:var(--font-pixel)] text-blood/[0.08]
        pointer-events-none select-none hidden sm:block
        ${className}
      `}
      style={{
        animation: `float-chaotic 6s ease-in-out ${delay}s infinite`,
      }}
    >
      HA HA HA
    </span>
  );
}
