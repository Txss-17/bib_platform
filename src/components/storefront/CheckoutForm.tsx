import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle, Loader2, MapPin } from "lucide-react";

interface CheckoutFormProps {
  boutiqueId: string;
  boutiqueName: string;
  primaryColor: string;
  onBack: () => void;
}

function getSavedProfile() {
  try {
    const raw = localStorage.getItem("linksy_customer_profile");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveProfile(data: Record<string, string>) {
  try {
    localStorage.setItem("linksy_customer_profile", JSON.stringify(data));
  } catch {}
}

export function CheckoutForm({ boutiqueId, boutiqueName, primaryColor, onBack }: CheckoutFormProps) {
  const { items, totalPrice, clearCart, setIsOpen } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("France");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"info" | "shipping">("info");

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

  const generateOrderNumber = () => {
    const prefix = "LNK";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const orderPromises = items.map((item) => {
        const num = generateOrderNumber();
        setOrderNumber(num);
        return supabase.from("orders").insert({
          order_number: num,
          boutique_id: boutiqueId,
          product_id: item.id,
          customer_name: name,
          customer_email: email,
          amount: item.price * item.quantity,
        });
      });

      const results = await Promise.all(orderPromises);
      const hasError = results.find((r) => r.error);
      if (hasError?.error) throw hasError.error;

      saveProfile({ name, email, phone, address, city, postalCode, country });

      setSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const boutiqueSlug = window.location.pathname.split("/boutique/")[1]?.split("/")[0] || "";

  if (success) {
    return (
      <div className="py-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
          <CheckCircle className="w-8 h-8" style={{ color: primaryColor }} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Commande confirmée !</h3>
        <p className="text-gray-600">
          Merci pour votre commande chez <strong>{boutiqueName}</strong>.
        </p>
        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">Numéro de commande</p>
          <p className="font-mono font-semibold text-gray-900">{orderNumber}</p>
        </div>
        <p className="text-sm text-gray-500">
          Un email de confirmation sera envoyé à <strong>{email}</strong>.
        </p>
        <div className="flex flex-col gap-2 mt-4">
          {boutiqueSlug && (
            <a
              href={`/boutique/${boutiqueSlug}/order-tracking`}
              className="text-sm font-medium hover:underline"
              style={{ color: primaryColor }}
            >
              Suivre ma commande →
            </a>
          )}
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fermer
          </Button>
        </div>

        {/* Opt-in account creation */}
        <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5 text-left">
          <p className="text-sm font-semibold text-gray-900">Créez votre compte Brand-In-A-Box</p>
          <p className="mt-1 text-xs text-gray-600">
            Retrouvez toutes vos commandes (toutes boutiques), gagnez des cartes cadeaux en recyclant vos cartons (1 point = 0,10 €).
          </p>
          <a
            href={`/signup?next=/mon-compte&email=${encodeURIComponent(email)}`}
            className="mt-3 inline-flex items-center justify-center w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            Activer mon compte client
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="py-4 space-y-5">
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

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

          <Button type="submit" className="w-full text-white" style={{ backgroundColor: primaryColor }} disabled={loading || !address || !city || !postalCode}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Confirmer la commande — {totalPrice.toFixed(2)} €
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Livraison incluse • Paiement sécurisé via Brand-In-A-Box
          </p>
        </div>
      )}
    </form>
  );
}
