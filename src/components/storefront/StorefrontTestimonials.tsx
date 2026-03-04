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

const defaultTestimonials: Testimonial[] = [
  { name: "Marie L.", rating: 5, text: "Livraison rapide et produit conforme. Je recommande vivement !" },
  { name: "Thomas D.", rating: 4, text: "Très satisfait de ma commande. Le service client est au top." },
  { name: "Sophie M.", rating: 5, text: "Qualité exceptionnelle, je reviendrai sans hésiter." },
];

export function StorefrontTestimonials({ primaryColor, testimonials }: StorefrontTestimonialsProps) {
  const items = testimonials?.length ? testimonials : defaultTestimonials;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-8">
          Ce que disent nos clients
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-gray-100 bg-gray-50 opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 150}ms`, animationFillMode: "forwards" }}
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
