import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  productId: string;
  name: string;
  amount: number;
  quantity: number;
  imageUrl?: string;
}

interface Props {
  boutiqueId: string;
  boutiqueName: string;
  items: CartItem[];
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shipping: { address: string; city: string; postalCode: string; country: string };
  notes?: string;
  returnUrl: string;
  onOrderNumbers?: (numbers: string[]) => void;
}

export function StorefrontEmbeddedCheckout(props: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    // Attribution: include the last scene the user viewed before checkout.
    let lastScene: { sceneId?: string; sceneType?: string; at?: number } | null = null;
    try {
      const raw = window.sessionStorage.getItem("bib_last_scene");
      if (raw) lastScene = JSON.parse(raw);
    } catch { /* ignore */ }
    const sessionId = window.sessionStorage.getItem("bib_scene_session") ?? undefined;

    const { data, error } = await supabase.functions.invoke("create-storefront-checkout", {
      body: {
        ...props,
        environment: getStripeEnvironment(),
        attribution: { lastScene, sessionId },
      },
    });
    if (error || !data?.clientSecret) {
      throw new Error(error?.message || "Failed to create checkout");
    }
    if (data.orderNumbers && props.onOrderNumbers) {
      props.onOrderNumbers(data.orderNumbers);
    }
    return data.clientSecret as string;
  };

  return (
    <div id="storefront-checkout" className="min-h-[600px]">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}