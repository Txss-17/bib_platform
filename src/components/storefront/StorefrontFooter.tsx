import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useParams } from "react-router-dom";

interface StorefrontFooterProps {
  primaryColor: string;
}

export function StorefrontFooter({ primaryColor }: StorefrontFooterProps) {
  useLanguage();
  const { slug } = useParams<{ slug: string }>();

  const footerLinks = slug
    ? [
        { label: translateUi("À propos"), href: `/boutique/${slug}/about` },
        { label: "FAQ", href: `/boutique/${slug}/faq` },
        { label: "CGV", href: `/boutique/${slug}/cgv` },
        { label: "CGU", href: `/boutique/${slug}/cgu` },
      ]
    : [
        { label: translateUi("About"), href: "#about" },
        { label: "FAQ", href: "#faq" },
        { label: "CGV", href: "#cgv" },
        { label: translateUi("Mentions Légales"), href: "#legal" },
      ];

  return (
    <footer className="py-6 border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {translateUi("Powered by")}
            </span>
            <span className="font-bold text-gray-900">Brand-In-A-Box</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {footerLinks.map((link) =>
              slug && !link.href.startsWith("#") ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </a>
              ),
            )}
          </nav>
        </div>
      </div>
    </footer>
  );
}
