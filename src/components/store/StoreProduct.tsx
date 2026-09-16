import { useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Store,
  ShieldCheck,
} from "lucide-react";

import {
  useStoreProduct,
  type StoreProduct as StoreProductData,
} from "@/hooks/useStore";
import { useStoreCart } from "@/contexts/StoreCartContext";
import { Logo } from "@/components/Logo";
import { useSEO } from "@/hooks/useSEO";

/* =========================================================
   HELPERS
   ========================================================= */

function getProductImages(
  product: StoreProductData,
): string[] {
  if (
    typeof product.image_url === "string" &&
    product.image_url.trim().length > 0
  ) {
    return [product.image_url];
  }

  return ["/placeholder.svg"];
}

function getProductDescription(
  product: StoreProductData,
): string {
  if (
    typeof product.description === "string" &&
    product.description.trim().length > 0
  ) {
    return product.description;
  }

  return "Découvrez ce produit proposé par une boutique référencée dans le réseau BIB.";
}
