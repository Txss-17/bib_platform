import { Link, useParams } from "react-router-dom";

interface StorefrontFooterProps {
  primaryColor: string;
}

export function StorefrontFooter({ primaryColor }: StorefrontFooterProps) {
  const { slug } = useParams<{ slug: string }>();

  const footerLinks = [
    { label: "About", href: "#about" },
    { label: "FAQ", href: "#faq" },
    { label: "CGV", href: "#cgv" },
    { label: "Mentions Légales", href: "#legal" },
  ];

  return (
    <footer className="py-6 border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Powered by</span>
            <span className="font-bold text-gray-900">LINKSY</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {slug && (
              <Link
                to={`/boutique/${slug}/order-tracking`}
                className="text-sm font-medium hover:text-gray-900 transition-colors"
                style={{ color: primaryColor }}
              >
                Suivre ma commande
              </Link>
            )}
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
