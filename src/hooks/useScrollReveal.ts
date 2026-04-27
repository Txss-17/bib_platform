import { useEffect, useRef, useState } from "react";

/**
 * Triggers `visible=true` once the element enters the viewport.
 * Used for slide-in / fade-up reveals on scroll.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.18 }
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      options
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, visible } as const;
}
