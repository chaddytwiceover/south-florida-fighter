export function RotateHint() {
  return (
    <div className="rotate-hint hidden pointer-events-none absolute inset-x-0 top-0 z-40 justify-center p-[max(0.4rem,env(safe-area-inset-top))]">
      <p className="rounded-full border border-sand/30 bg-ink/80 px-3 py-1 font-sans text-[0.7rem] font-bold uppercase tracking-[0.16em] text-sand">
        Rotate to portrait
      </p>
    </div>
  );
}
