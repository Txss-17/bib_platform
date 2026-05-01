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
    const { data, error } = await supabase.functions.invoke("create-storefront-checkout", {
      body: { ...props, environment: getStripeEnvironment() },
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