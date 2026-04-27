import type { Toast as ToastT } from "../hooks/useToast";

const accents: Record<string, string> = {
  success: "border-l-toxic",
  error: "border-l-blood",
  info: "border-l-grape",
};

const icons: Record<string, string> = {
  success: "🃏",
  error: "💀",
  info: "🎪",
};

export function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: ToastT[];
  dismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-3 sm:right-5 z-[10000] flex flex-col gap-2 w-[min(320px,calc(100vw-24px))]">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`
            ${t.exiting ? "toast-exit" : "toast-enter"}
            ${accents[t.type]}
            border-l-[3px] px-4 py-3 cursor-pointer
            bg-slab/95 backdrop-blur-sm
          `}
        >
          <span className="mr-2">{icons[t.type]}</span>
          <span className="font-[family-name:var(--font-retro)] text-lg text-bone/90">
            {t.message}
          </span>
        </div>
      ))}
    </div>
  );
}
