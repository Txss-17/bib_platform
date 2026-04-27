import { createContext, useContext, ReactNode } from "react";

interface StorefrontContextValue {
  boutiqueId: string;
  boutiqueName: string;
  boutiqueSlug?: string;
}

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

/**
 * Wraps every public storefront page so that boutiqueId is always available
 * to nested components (CartDrawer, StorefrontProducts, …). This avoids
 * prop-drilling and guarantees that analytics events (add_to_cart,
 * checkout_start) are attributed to the right boutique without hacky
 * conditional signatures.
 */
export function StorefrontProvider({
  boutiqueId,
  boutiqueName,
  boutiqueSlug,
  children,
}: StorefrontContextValue & { children: ReactNode }) {
  return (
    <StorefrontContext.Provider value={{ boutiqueId, boutiqueName, boutiqueSlug }}>
      {children}
    </StorefrontContext.Provider>
  );
}

/** Returns the active storefront context, or null when outside a public boutique. */
export function useStorefrontContext(): StorefrontContextValue | null {
  return useContext(StorefrontContext);
}

/** Same as useStorefrontContext but throws — for components that strictly require it. */
export function useStorefrontContextStrict(): StorefrontContextValue {
  const ctx = useContext(StorefrontContext);
  if (!ctx) {
    throw new Error(
      "useStorefrontContextStrict must be used inside a <StorefrontProvider>",
    );
  }
  return ctx;
}
