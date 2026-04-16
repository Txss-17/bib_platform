import { useEffect, useRef, type ReactNode } from "react";

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxSection({ children, speed = 0.3, className = "" }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      const visible = rect.top < viewH && rect.bottom > 0;
      if (visible) {
        const progress = (viewH - rect.top) / (viewH + rect.height);
        const offset = (progress - 0.5) * speed * 100;
        el.style.transform = `translateY(${offset}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export function TiltCard({ children, className = "", intensity = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(800px) rotateY(0) rotateX(0) scale3d(1,1,1)";
  };

  return (
    <div
      ref={ref}
      className={`transition-transform duration-300 ease-out ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

interface FloatingElementProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FloatingElement({ children, delay = 0, className = "" }: FloatingElementProps) {
  return (
    <div
      className={`animate-float ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: "3s",
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
      }}
    >
      {children}
    </div>
  );
}

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  primaryColor?: string;
}

export function GlassCard({ children, className = "", primaryColor }: GlassCardProps) {
  return (
    <div
      className={`backdrop-blur-md border border-white/20 rounded-2xl shadow-xl ${className}`}
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
        boxShadow: primaryColor
          ? `0 8px 32px ${primaryColor}15, 0 0 0 1px rgba(255,255,255,0.1)`
          : undefined,
      }}
    >
      {children}
    </div>
  );
}

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "left" | "right" | "scale";
}

export function ScrollReveal({ children, className = "", direction = "up" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("storefront-3d-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const directionClass = {
    up: "storefront-3d-reveal-up",
    left: "storefront-3d-reveal-left",
    right: "storefront-3d-reveal-right",
    scale: "storefront-3d-reveal-scale",
  }[direction];

  return (
    <div ref={ref} className={`${directionClass} ${className}`}>
      {children}
    </div>
  );
}
