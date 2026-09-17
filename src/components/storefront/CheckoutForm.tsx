import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useCart } from "@/contexts/CartContext";
import { StorefrontEmbeddedCheckout } from "@/components/payments/StorefrontEmbeddedCheckout";

interface CheckoutFormProps {
  boutiqueId: string;
  boutiqueName: string;
  primaryColor: string;
  onBack: () => void;
}

interface SavedCustomerProfile {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

type CheckoutStep =
  | "info"
  | "shipping"
  | "pay";

function getSavedProfile(): SavedCustomerProfile | null {
  try {
    const raw =
      localStorage.getItem(
        "bib_customer_profile",
      ) ||
      localStorage.getItem(
        "linksy_customer_profile",
      );

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function saveProfile(
  data: SavedCustomerProfile,
) {
  try {
    localStorage.setItem(
      "bib_customer_profile",
      JSON.stringify(data),
    );
  } catch {
    // Local storage is optional.
  }
}

export function CheckoutForm({
  boutiqueId,
  boutiqueName,
  primaryColor,
  onBack,
}: CheckoutFormProps) {
  const { slug } = useParams<{
    slug: string;
  }>();

  const {
    items,
    totalPrice,
  } = useCart();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [city, setCity] =
    useState("");

  const [postalCode, setPostalCode] =
    useState("");

  const [country, setCountry] =
    useState("France");

  const [notes, setNotes] =
    useState("");

  const [step, setStep] =
    useState<CheckoutStep>("info");

  /*
   * --------------------------------------------------------------------------
   * Restore customer information
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    const saved =
      getSavedProfile();

    if (!saved) {
      return;
    }

    setName(saved.name ?? "");
    setEmail(saved.email ?? "");
    setPhone(saved.phone ?? "");
    setAddress(saved.address ?? "");
    setCity(saved.city ?? "");
    setPostalCode(
      saved.postalCode ?? "",
    );
    setCountry(
      saved.country ?? "France",
    );
  }, []);

  /*
   * --------------------------------------------------------------------------
   * Validation
   * --------------------------------------------------------------------------
   */

  const hasCustomerInfo = useMemo(
    () =>
      name.trim().length > 0 &&
      email.trim().length > 0,
    [name, email],
  );

  const hasShippingInfo = useMemo(
    () =>
      address.trim().length > 0 &&
      city.trim().length > 0 &&
      postalCode.trim().length > 0 &&
      country.trim().length > 0,
    [
      address,
      city,
      postalCode,
      country,
    ],
  );

  /*
   * --------------------------------------------------------------------------
   * Steps
   * --------------------------------------------------------------------------
   */

  const goToShipping = () => {
    if (!hasCustomerInfo) {
      return;
    }

    setStep("shipping");
  };

  const goToPayment = (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!hasCustomerInfo) {
      setStep("info");
      return;
    }

    if (!hasShippingInfo) {
      setStep("shipping");
      return;
    }

    saveProfile({
      name: name.trim(),
      email: email
        .trim()
        .toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode:
        postalCode.trim(),
      country: country.trim(),
    });

    setStep("pay");
  };

  /*
   * --------------------------------------------------------------------------
   * Empty cart protection
   * --------------------------------------------------------------------------
   */

  if (items.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Votre panier est vide.
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={onBack}
        >
          Retour au panier
        </Button>
      </div>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * Payment
   * --------------------------------------------------------------------------
   */

  if (step === "pay") {
    const boutiqueSlug =
      slug?.trim() || "";

    const returnUrl =
      `${window.location.origin}` +
      `/boutique/${encodeURIComponent(boutiqueSlug)}` +
      `/order-tracking` +
      `?session_id={CHECKOUT_SESSION_ID}` +
      `&email=${encodeURIComponent(
        email.trim().toLowerCase(),
      )}`;

    return (
      <div className="py-4">
        <button
          type="button"
          onClick={() =>
            setStep("shipping")
          }
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft
            className="w-4 h-4"
            aria-hidden="true"
          />

          Modifier mes informations
        </button>

        <StorefrontEmbeddedCheckout
          boutiqueId={boutiqueId}
          boutiqueName={boutiqueName}
          items={items.map((item) => ({
            productId: item.id,
            name: item.name,
            amount: Math.round(
              item.price * 100,
            ),
            quantity: item.quantity,
            imageUrl:
              item.image_url ??
              undefined,
          }))}
          customerEmail={email
            .trim()
            .toLowerCase()}
          customerName={name.trim()}
          customerPhone={phone.trim()}
          shipping={{
            address: address.trim(),
            city: city.trim(),
            postalCode:
              postalCode.trim(),
            country: country.trim(),
          }}
          notes={notes.trim()}
          returnUrl={returnUrl}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={goToPayment}
      className="py-4 space-y-5"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Back                                                               */}
      {/* ------------------------------------------------------------------ */}

      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft
          className="w-4 h-4"
          aria-hidden="true"
        />

        Retour au panier
      </button>

      {/* ------------------------------------------------------------------ */}
      {/* Order summary                                                      */}
      {/* ------------------------------------------------------------------ */}

      <div className="p-4 rounded-lg bg-gray-50 space-y-2">
        <h4 className="font-medium text-gray-900 text-sm">
          Récapitulatif
        </h4>

        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between gap-4 text-sm"
          >
            <span className="text-gray-600 min-w-0">
              <span className="line-clamp-2">
                {item.name}
              </span>

              <span className="text-xs text-gray-400">
                × {item.quantity}
              </span>
            </span>

            <span className="font-medium shrink-0">
              {(
                item.price *
                item.quantity
              ).toFixed(2)}{" "}
              €
            </span>
          </div>
        ))}

        <div className="border-t border-gray-200 pt-2 flex justify-between">
          <span className="font-semibold">
            Total
          </span>

          <span
            className="font-bold"
            style={{
              color: primaryColor,
            }}
          >
            {totalPrice.toFixed(2)} €
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Step indicators                                                    */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="flex gap-2"
        aria-label="Étapes de commande"
      >
        <button
          type="button"
          onClick={() =>
            setStep("info")
          }
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
            step === "info"
              ? "text-white"
              : "bg-gray-100 text-gray-600"
          }`}
          style={
            step === "info"
              ? {
                  backgroundColor:
                    primaryColor,
                }
              : undefined
          }
        >
          1. Informations
        </button>

        <button
          type="button"
          onClick={() => {
            if (hasCustomerInfo) {
              setStep("shipping");
            }
          }}
          disabled={!hasCustomerInfo}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            step === "shipping"
              ? "text-white"
              : "bg-gray-100 text-gray-600"
          }`}
          style={
            step === "shipping"
              ? {
                  backgroundColor:
                    primaryColor,
                }
              : undefined
          }
        >
          2. Livraison
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Customer information                                               */}
      {/* ------------------------------------------------------------------ */}

      {step === "info" && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="checkout-name">
              Nom complet
            </Label>

            <Input
              id="checkout-name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="Jean Dupont"
              autoComplete="name"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="checkout-email">
              Email
            </Label>

            <Input
              id="checkout-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="jean@exemple.com"
              autoComplete="email"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="checkout-phone">
              Téléphone
            </Label>

            <Input
              id="checkout-phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value,
                )
              }
              placeholder="+33 6 12 34 56 78"
              autoComplete="tel"
              className="mt-1"
            />
          </div>

          <Button
            type="button"
            className="w-full text-white"
            style={{
              backgroundColor:
                primaryColor,
            }}
            onClick={
              goToShipping
            }
            disabled={!hasCustomerInfo}
          >
            Continuer vers la livraison
          </Button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Shipping                                                            */}
      {/* ------------------------------------------------------------------ */}

      {step === "shipping" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin
              className="w-4 h-4"
              aria-hidden="true"
            />

            Adresse de livraison
          </div>

          <div>
            <Label htmlFor="checkout-address">
              Adresse
            </Label>

            <Input
              id="checkout-address"
              value={address}
              onChange={(event) =>
                setAddress(
                  event.target.value,
                )
              }
              placeholder="12 rue de la Paix"
              autoComplete="street-address"
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="checkout-city">
                Ville
              </Label>

              <Input
                id="checkout-city"
                value={city}
                onChange={(event) =>
                  setCity(
                    event.target.value,
                  )
                }
                placeholder="Paris"
                autoComplete="address-level2"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="checkout-postal">
                Code postal
              </Label>

              <Input
                id="checkout-postal"
                value={postalCode}
                onChange={(event) =>
                  setPostalCode(
                    event.target.value,
                  )
                }
                placeholder="75001"
                autoComplete="postal-code"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="checkout-country">
              Pays
            </Label>

            <Input
              id="checkout-country"
              value={country}
              onChange={(event) =>
                setCountry(
                  event.target.value,
                )
              }
              placeholder="France"
              autoComplete="country-name"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="checkout-notes">
              Notes de livraison
              (optionnel)
            </Label>

            <Textarea
              id="checkout-notes"
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value,
                )
              }
              placeholder="Code d'accès, étage, etc."
              rows={2}
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            className="w-full text-white"
            style={{
              backgroundColor:
                primaryColor,
            }}
            disabled={
              !hasShippingInfo
            }
          >
            Continuer vers le paiement —{" "}
            {totalPrice.toFixed(2)} €
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Livraison incluse • Paiement
            sécurisé via Brand-In-A-Box
          </p>
        </div>
      )}
    </form>
  );
}}
