import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  rating: number;
  text: string;
}

interface StorefrontTestimonialsProps {
  primaryColor: string;
  testimonials?: Testimonial[];
}

export function StorefrontTestimonials({
  primaryColor,
  testimonials,
}: StorefrontTestimonialsProps) {
  useLanguage();
  const items = testimonials ?? [];
  if (!items.length) return null;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-8">
          {translateUi("Ce que disent nos clients")}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-gray-100 bg-gray-50 opacity-0 animate-fade-up"
              style={{
                animationDelay: `${i * 150}ms`,
                animationFillMode: "forwards",
              }}
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className="w-4 h-4"
                    style={{ color: si < t.rating ? primaryColor : "#d1d5db" }}
                    fill={si < t.rating ? primaryColor : "none"}
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-3">"{t.text}"</p>
              <p className="text-sm font-semibold text-gray-900">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
