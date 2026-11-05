import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail } from "lucide-react";
import { MarketingSubscriptionForm } from "@/components/privacy/MarketingSubscriptionForm";

interface StorefrontNewsletterProps {
  primaryColor: string;
  boutiqueName: string;
  boutiqueId?: string;
  preview?: boolean;
}

export function StorefrontNewsletter({
  primaryColor,
  boutiqueName,
  boutiqueId,
  preview,
}: StorefrontNewsletterProps) {
  useLanguage();
  return (
    <section
      className="py-12 md:py-16"
      style={{ backgroundColor: `${primaryColor}08` }}
    >
      <div className="mx-auto max-w-xl px-4 text-center sm:px-6 lg:px-8">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Mail
            className="h-6 w-6"
            style={{ color: primaryColor }}
            aria-hidden="true"
          />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">
          {translateUi("Restez informé")}
        </h2>
        <p className="mb-6 text-gray-600">
          {translateUi("Offres et nouveautés de")} {boutiqueName}.
        </p>
        <MarketingSubscriptionForm
          scope={{ kind: "boutique", boutiqueId: boutiqueId ?? "" }}
          preview={preview || !boutiqueId}
        />
      </div>
    </section>
  );
}
