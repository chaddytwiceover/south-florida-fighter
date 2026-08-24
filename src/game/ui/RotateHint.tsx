import { useEffect, useState } from "react";

export function RotateHint() {
  const [landscape, setLandscape] = useState(false);

  useEffect(() => {
    const check = () => {
      const wide = window.innerWidth > window.innerHeight * 1.12;
      const phone = Math.min(window.innerWidth, window.innerHeight) < 820;
      setLandscape(wide && phone);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  if (!landscape) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex justify-center p-[max(0.4rem,env(safe-area-inset-top))]">
      <p className="rounded-full border border-sand/30 bg-ink/80 px-3 py-1 font-sans text-[0.7rem] font-bold uppercase tracking-[0.16em] text-sand">
        Rotate to portrait
      </p>
    </div>
  );
}
