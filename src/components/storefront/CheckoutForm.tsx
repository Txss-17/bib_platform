import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, MapPin } from "lucide-react";
import { StorefrontEmbeddedCheckout } from "@/components/payments/StorefrontEmbeddedCheckout";

interface CheckoutFormProps {
  boutiqueId: string;
  boutiqueName: string;
  primaryColor: string;
  onBack: () => void;
}

function getSavedProfile() {
  try {
    const raw =
      localStorage.getItem("bib_customer_profile") ||
      localStorage.getItem("linksy_customer_profile");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveProfile(data: Record<string, string>) {
  try {
    localStorage.setItem("bib_customer_profile", JSON.stringify(data));
  } catch {}
}

export function CheckoutForm({ boutiqueId, boutiqueName, primaryColor, onBack }: CheckoutFormProps) {
  const { items, totalPrice } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("France");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"info" | "shipping" | "pay">("info");

  useEffect(() => {
    const saved = getSavedProfile();
    if (saved) {
      setName(saved.name || "");
      setEmail(saved.email || "");
      setPhone(saved.phone || "");
      setAddress(saved.address || "");
      setCity(saved.city || "");
      setPostalCode(saved.postalCode || "");
      setCountry(saved.country || "France");
    }
  }, []);

  function goToPayment(e: React.FormEvent) {
    e.preventDefault();
    saveProfile({ name, email, phone, address, city, postalCode, country });
    setStep("pay");
  }

  const boutiqueSlug = window.location.pathname.split("/boutique/")[1]?.split("/")[0] || "";

  if (step === "pay") {
    const returnUrl = `${window.location.origin}/boutique/${boutiqueSlug}/order-tracking?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}`;
    return (
      <div className="py-4">
        <button type="button" onClick={() => setStep("shipping")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="w-4 h-4" /> Modifier mes infos
        </button>
        <StorefrontEmbeddedCheckout
          boutiqueId={boutiqueId}
          boutiqueName={boutiqueName}
          items={items.map((it) => ({
            productId: it.id,
            name: it.name,
            amount: Math.round(it.price * 100),
            quantity: it.quantity,
            imageUrl: it.image_url ?? undefined,
          }))}
          customerEmail={email.toLowerCase().trim()}
          customerName={name}
          customerPhone={phone}
          shipping={{ address, city, postalCode, country }}
          notes={notes}
          returnUrl={returnUrl}
        />
      </div>
    );
  }

  return (
    <form onSubmit={goToPayment} className="py-4 space-y-5">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Retour au panier
      </button>

      {/* Order summary */}
      <div className="p-4 rounded-lg bg-gray-50 space-y-2">
        <h4 className="font-medium text-gray-900 text-sm">Récapitulatif</h4>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-600">{item.name} × {item.quantity}</span>
            <span className="font-medium">{(item.price * item.quantity).toFixed(2)} €</span>
          </div>
        ))}
        <div className="border-t border-gray-200 pt-2 flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-bold" style={{ color: primaryColor }}>{totalPrice.toFixed(2)} €</span>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStep("info")}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${step === "info" ? "text-white" : "bg-gray-100 text-gray-600"}`}
          style={step === "info" ? { backgroundColor: primaryColor } : {}}
        >
          1. Informations
        </button>
        <button
          type="button"
          onClick={() => setStep("shipping")}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${step === "shipping" ? "text-white" : "bg-gray-100 text-gray-600"}`}
          style={step === "shipping" ? { backgroundColor: primaryColor } : {}}
        >
          2. Livraison
        </button>
      </div>

      {step === "info" && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="checkout-name">Nom complet</Label>
            <Input id="checkout-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Dupont" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="checkout-email">Email</Label>
            <Input id="checkout-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jean@exemple.com" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="checkout-phone">Téléphone</Label>
            <Input id="checkout-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" className="mt-1" />
          </div>
          <Button
            type="button"
            className="w-full text-white"
            style={{ backgroundColor: primaryColor }}
            onClick={() => setStep("shipping")}
            disabled={!name || !email}
          >
            Continuer vers la livraison
          </Button>
        </div>
      )}

      {step === "shipping" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4" />
            Adresse de livraison
          </div>
          <div>
            <Label htmlFor="checkout-address">Adresse</Label>
            <Input id="checkout-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="12 rue de la Paix" required className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="checkout-city">Ville</Label>
              <Input id="checkout-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Paris" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="checkout-postal">Code postal</Label>
              <Input id="checkout-postal" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="75001" required className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="checkout-country">Pays</Label>
            <Input id="checkout-country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="France" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="checkout-notes">Notes de livraison (optionnel)</Label>
            <Textarea id="checkout-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Code d'accès, étage, etc." className="mt-1" rows={2} />
          </div>

          <Button type="submit" className="w-full text-white" style={{ backgroundColor: primaryColor }} disabled={!address || !city || !postalCode}>
            Continuer vers le paiement — {totalPrice.toFixed(2)} €
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Livraison incluse • Paiement sécurisé via Brand-In-A-Box
          </p>
        </div>
      )}
    </form>
  );
}
