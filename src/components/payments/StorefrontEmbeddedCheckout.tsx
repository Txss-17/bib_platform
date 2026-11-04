import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface CartItem {
  productId: string;
  name: string;
  amount: number;
  quantity: number;
  imageUrl?: string;
}

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Attribution {
  lastScene?: {
    sceneId?: string;
    sceneType?: string;
    at?: number;
  } | null;
  sessionId?: string;
}

interface StorefrontCheckoutProps {
  boutiqueId: string;
  boutiqueName: string;
  items: CartItem[];
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shipping: ShippingAddress;
  notes?: string;
  returnUrl: string;
  legalAgreement: { bundleHash: string; accepted: true; statement: 'storefront-legal-v1' };
  onOrderNumbers?: (numbers: string[]) => void;
  onComplete?: () => void;
}

export function StorefrontEmbeddedCheckout({
  boutiqueId,
  boutiqueName,
  items,
  customerEmail,
  customerName,
  customerPhone,
  shipping,
  notes,
  returnUrl,
  legalAgreement,
  onOrderNumbers,
  onComplete,
}: StorefrontCheckoutProps) {
  const [checkoutKey] = useState(() => crypto.randomUUID());
  const fetchClientSecret = async (): Promise<string> => {
    if (!boutiqueId) {
      throw new Error("Boutique manquante.");
    }

    if (!items.length) {
      throw new Error("Le panier est vide.");
    }

    const invalidItem = items.find(
      (item) =>
        !item.productId ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
    );

    if (invalidItem) {
      throw new Error("Le panier contient un article invalide.");
    }

    // No browser-persisted scene or session identifiers.
    // Any conversion attribution must be computed from server events.
    const lastScene: Attribution["lastScene"] = null;
    const sessionId: string | undefined = undefined;

    const payload = {
      checkoutKey,
      legalAgreement,
      boutiqueId,
      boutiqueName,
      items: items.map((item) => ({
        /*
         * amount est transmis uniquement pour conserver le contrat
         * frontend/backend actuel.
         *
         * IMPORTANT :
         * l'Edge Function NE DOIT PAS faire confiance à cette valeur.
         * Elle doit récupérer le prix réel depuis Supabase.
         */
        productId: item.productId,
        name: item.name,
        amount: item.amount,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      })),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerName: customerName.trim(),
      customerPhone: customerPhone?.trim() || undefined,
      shipping,
      notes: notes?.trim() || undefined,
      returnUrl,
      environment: getStripeEnvironment(),
      attribution: {
        lastScene,
        sessionId,
      },
    };

    const { data, error } = await supabase.functions.invoke(
      "create-storefront-checkout",
      {
        body: payload,
      }
    );

    if (error) {
      throw new Error(
        error.message || "Impossible de créer la session de paiement."
      );
    }

    if (!data?.clientSecret) {
      throw new Error(
        "La session de paiement n'a pas retourné de clientSecret."
      );
    }

    if (Array.isArray(data.orderNumbers) && onOrderNumbers) {
      onOrderNumbers(data.orderNumbers);
    }

    return data.clientSecret as string;
  };

  return (
    <div id="storefront-checkout" className="min-h-[600px]">
      <EmbeddedCheckoutProvider
        stripe={getStripe()}
        options={{
          fetchClientSecret,
          onComplete,
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
