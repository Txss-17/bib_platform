import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Check } from "lucide-react";

interface StorefrontNewsletterProps {
  primaryColor: string;
  boutiqueName: string;
}

export function StorefrontNewsletter({ primaryColor, boutiqueName }: StorefrontNewsletterProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-12 md:py-16" style={{ backgroundColor: `${primaryColor}08` }}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Mail className="w-6 h-6" style={{ color: primaryColor }} />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Restez informé
        </h2>
        <p className="text-gray-600 mb-6">
          Inscrivez-vous pour recevoir nos offres exclusives et nouveautés de {boutiqueName}.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="font-medium">Merci pour votre inscription !</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="bg-white"
            />
            <Button type="submit" style={{ backgroundColor: primaryColor }} className="text-white shrink-0">
              S'inscrire
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
