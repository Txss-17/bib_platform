import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface StorefrontFAQProps {
  primaryColor: string;
  items?: FAQItem[];
}

const defaultFAQ: FAQItem[] = [
  { question: "Quels sont les délais de livraison ?", answer: "Nous livrons en 3 à 5 jours ouvrés en France métropolitaine. Les frais de livraison sont inclus dans le prix." },
  { question: "Comment retourner un produit ?", answer: "Vous disposez de 14 jours pour retourner votre commande. Contactez-nous par email pour obtenir une étiquette de retour gratuite." },
  { question: "Les paiements sont-ils sécurisés ?", answer: "Oui, tous nos paiements sont sécurisés via Stripe. Vos données bancaires ne sont jamais stockées sur nos serveurs." },
  { question: "Comment suivre ma commande ?", answer: "Après votre achat, vous recevez un email avec votre numéro de commande. Utilisez-le sur notre page de suivi pour connaître l'état de votre colis." },
];

export function StorefrontFAQ({ primaryColor, items }: StorefrontFAQProps) {
  const faqItems = items?.length ? items : defaultFAQ;

  return (
    <section id="faq" className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-8">
          Questions Fréquentes
        </h2>
        <Accordion type="single" collapsible className="space-y-3">
          {faqItems.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-white rounded-lg border border-gray-100 px-6 data-[state=open]:shadow-sm transition-shadow"
            >
              <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
