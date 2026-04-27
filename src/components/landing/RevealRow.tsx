import { ReactNode } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface RevealRowProps {
  side: "left" | "right";
  eyebrow?: string;
  title: ReactNode;
  description: ReactNode;
  bullets?: { icon?: ReactNode; label: string }[];
  visual: ReactNode;
  tone?: "ivory" | "marine-soft" | "gold-soft";
}

const toneClass: Record<NonNullable<RevealRowProps["tone"]>, string> = {
  ivory: "bg-bib-ivory",
  "marine-soft": "bg-bib-marine/[0.04]",
  "gold-soft": "bg-bib-gold/[0.06]",
};

export function RevealRow({ side, eyebrow, title, description, bullets = [], visual, tone = "ivory" }: RevealRowProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  const fromX = side === "left" ? "-translate-x-16" : "translate-x-16";
  const visualFromX = side === "left" ? "translate-x-16" : "-translate-x-16";
  const order = side === "left" ? "lg:order-1" : "lg:order-2";
  const visualOrder = side === "left" ? "lg:order-2" : "lg:order-1";

  return (
    <section ref={ref} className={`py-20 lg:py-28 ${toneClass[tone]}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className={`${order} transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-x-0" : `opacity-0 ${fromX}`}`}>
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bib-marine/8 border border-bib-marine/15 mb-5">
                <span className="text-xs font-semibold text-bib-marine uppercase tracking-[0.18em]">{eyebrow}</span>
              </div>
            )}
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-bib-marine leading-[1.1] mb-5">{title}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">{description}</p>
            {bullets.length > 0 && (
              <ul className="space-y-3">
                {bullets.map((b, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{ transitionDelay: visible ? `${250 + i * 120}ms` : "0ms" }}
                  >
                    <span className="mt-1 inline-flex items-center justify-center w-6 h-6 rounded-md bg-bib-gold/15 text-bib-gold shrink-0">
                      {b.icon ?? (
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="text-bib-marine font-medium">{b.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={`${visualOrder} transition-all duration-1000 ease-out delay-150 ${visible ? "opacity-100 translate-x-0" : `opacity-0 ${visualFromX}`}`}>
            {visual}
          </div>
        </div>
      </div>
    </section>
  );
}

export default RevealRow;
