import { useEffect, useRef, useState } from "react";
function useScrollReveal(options = { threshold: 0.18 }) {
  const ref = useRef(null);
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
  return { ref, visible };
}
export {
  useScrollReveal
};
