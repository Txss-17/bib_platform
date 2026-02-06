import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface StorefrontAboutProps {
  title: string;
  description: string;
  boutiqueName: string;
  primaryColor: string;
}

export function StorefrontAbout({ title, description, boutiqueName, primaryColor }: StorefrontAboutProps) {
  return (
    <section id="about" className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text content */}
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
              {title}
            </h2>
            <p className="text-gray-600 mb-2">
              Chez {boutiqueName}, {description.toLowerCase().startsWith('nous') ? description : `nous ${description.toLowerCase()}`}
            </p>
            <p className="text-gray-600 mb-2">
              Logistique et recyclage gérés par LINKSY.
            </p>
            <p className="text-gray-600 mb-6">
              Simple, responsable, sans surprise.
            </p>
            <Button
              variant="outline"
              className="gap-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
            >
              EN SAVOIR PLUS
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Placeholder image */}
          <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <span className="text-gray-400 text-sm">Image de la boutique</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
