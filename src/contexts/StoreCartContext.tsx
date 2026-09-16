import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* =========================================================
   TYPES
   ========================================================= */

export interface StoreCartItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;

  boutiqueId: string;
  boutiqueName: string;
  boutiqueSlug?: string;
  boutiqueUrl?: string;
}

export interface StoreCartBoutiqueGroup {
  boutiqueId: string;
  boutiqueName: string;
  boutiqueSlug?: string;
  boutiqueUrl?: string;
  items: StoreCartItem[];
  totalItems: number;
  totalPrice: number;
}

interface StoreCartContextType {
  items: StoreCartItem[];

  addItem: (
    item: Omit<StoreCartItem, "quantity">,
    quantity?: number,
  ) => void;

  removeItem: (
    productId: string,
    boutiqueId: string,
  ) => void;

  updateQuantity: (
    productId: string,
    boutiqueId: string,
    quantity: number,
  ) => void;

  clearCart: () => void;

  clearBoutique: (boutiqueId: string) => void;

  getItemQuantity: (
    productId: string,
    boutiqueId: string,
  ) => number;

  totalItems: number;
  totalPrice: number;

  boutiqueGroups: StoreCartBoutiqueGroup[];

  isEmpty: boolean;
}

/* =========================================================
   CONSTANTS
   ========================================================= */

const STORAGE_KEY = "bib-store-cart";

/* =========================================================
   CONTEXT
   ========================================================= */

const StoreCartContext =
  createContext<StoreCartContextType | undefined>(
    undefined,
  );

/* =========================================================
   PROVIDER
   ========================================================= */

export function StoreCartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<StoreCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  /* =======================================================
     INITIALISATION
     ======================================================= */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        setHydrated(true);
        return;
      }

      const parsed: unknown = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        setHydrated(true);
        return;
      }

      const validItems = parsed.filter(
        (item): item is StoreCartItem => {
          if (!item || typeof item !== "object") {
            return false;
          }

          const value = item as Record<string, unknown>;

          const validBoutiqueSlug =
            value.boutiqueSlug === undefined ||
            typeof value.boutiqueSlug === "string";

          const validBoutiqueUrl =
            value.boutiqueUrl === undefined ||
            typeof value.boutiqueUrl === "string";

          return (
            typeof value.productId === "string" &&
            typeof value.productName === "string" &&
            typeof value.productImage === "string" &&
            typeof value.price === "number" &&
            Number.isFinite(value.price) &&
            value.price >= 0 &&
            typeof value.quantity === "number" &&
            Number.isFinite(value.quantity) &&
            value.quantity > 0 &&
            value.quantity <= 99 &&
            typeof value.boutiqueId === "string" &&
            typeof value.boutiqueName === "string" &&
            validBoutiqueSlug &&
            validBoutiqueUrl
          );
        },
      ).map((item) => ({
        ...item,
        quantity: Math.min(
          99,
          Math.max(1, Math.floor(item.quantity)),
        ),
      }));

      setItems(validItems);
    } catch {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // localStorage indisponible.
      }
    } finally {
      setHydrated(true);
    }
  }, []);

  /* =======================================================
     PERSISTENCE
     ======================================================= */

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items),
      );
    } catch {
      // Le panier reste fonctionnel en mémoire
      // si localStorage n'est pas disponible.
    }
  }, [items, hydrated]);

  /* =======================================================
     AJOUT
     ======================================================= */

  const addItem = useCallback(
    (
      item: Omit<StoreCartItem, "quantity">,
      quantity = 1,
    ) => {
      const safeQuantity = Math.max(
        1,
        Math.min(99, Math.floor(quantity)),
      );

      setItems((current) => {
        const existingIndex = current.findIndex(
          (existing) =>
            existing.productId === item.productId &&
            existing.boutiqueId === item.boutiqueId,
        );

        if (existingIndex === -1) {
          return [
            ...current,
            {
              ...item,
              quantity: safeQuantity,
            },
          ];
        }

        return current.map((existing, index) => {
          if (index !== existingIndex) {
            return existing;
          }

          return {
            ...existing,
            ...item,
            quantity: Math.min(
              99,
              existing.quantity + safeQuantity,
            ),
          };
        });
      });
    },
    [],
  );

  /* =======================================================
     SUPPRESSION
     ======================================================= */

  const removeItem = useCallback(
    (
      productId: string,
      boutiqueId: string,
    ) => {
      setItems((current) =>
        current.filter(
          (item) =>
            !(
              item.productId === productId &&
              item.boutiqueId === boutiqueId
            ),
        ),
      );
    },
    [],
  );

  /* =======================================================
     QUANTITÉ
     ======================================================= */

  const updateQuantity = useCallback(
    (
      productId: string,
      boutiqueId: string,
      quantity: number,
    ) => {
      const safeQuantity = Math.floor(quantity);

      if (safeQuantity <= 0) {
        setItems((current) =>
          current.filter(
            (item) =>
              !(
                item.productId === productId &&
                item.boutiqueId === boutiqueId
              ),
          ),
        );

        return;
      }

      setItems((current) =>
        current.map((item) => {
          if (
            item.productId !== productId ||
            item.boutiqueId !== boutiqueId
          ) {
            return item;
          }

          return {
            ...item,
            quantity: Math.min(99, safeQuantity),
          };
        }),
      );
    },
    [],
  );

  /* =======================================================
     VIDER LE PANIER
     ======================================================= */

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /* =======================================================
     VIDER UNE BOUTIQUE
     ======================================================= */

  const clearBoutique = useCallback(
    (boutiqueId: string) => {
      setItems((current) =>
        current.filter(
          (item) => item.boutiqueId !== boutiqueId,
        ),
      );
    },
    [],
  );

  /* =======================================================
     QUANTITÉ D'UN PRODUIT
     ======================================================= */

  const getItemQuantity = useCallback(
    (
      productId: string,
      boutiqueId: string,
    ): number => {
      const item = items.find(
        (current) =>
          current.productId === productId &&
          current.boutiqueId === boutiqueId,
      );

      return item?.quantity ?? 0;
    },
    [items],
  );

  /* =======================================================
     TOTAUX
     ======================================================= */

  const totalItems = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
    [items],
  );

  const totalPrice = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.price * item.quantity,
        0,
      ),
    [items],
  );

  /* =======================================================
     REGROUPEMENT PAR BOUTIQUE
     ======================================================= */

  const boutiqueGroups = useMemo<
    StoreCartBoutiqueGroup[]
  >(() => {
    const groups = new Map<
      string,
      StoreCartBoutiqueGroup
    >();

    for (const item of items) {
      const existing = groups.get(item.boutiqueId);

      if (existing) {
        existing.items.push(item);
        existing.totalItems += item.quantity;
        existing.totalPrice +=
          item.price * item.quantity;
        continue;
      }

      groups.set(item.boutiqueId, {
        boutiqueId: item.boutiqueId,
        boutiqueName: item.boutiqueName,
        boutiqueSlug: item.boutiqueSlug,
        boutiqueUrl: item.boutiqueUrl,
        items: [item],
        totalItems: item.quantity,
        totalPrice: item.price * item.quantity,
      });
    }

    return Array.from(groups.values());
  }, [items]);

  /* =======================================================
     VALEUR DU CONTEXTE
     ======================================================= */

  const value = useMemo<StoreCartContextType>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      clearBoutique,
      getItemQuantity,
      totalItems,
      totalPrice,
      boutiqueGroups,
      isEmpty: items.length === 0,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      clearBoutique,
      getItemQuantity,
      totalItems,
      totalPrice,
      boutiqueGroups,
    ],
  );

  return (
    <StoreCartContext.Provider value={value}>
      {children}
    </StoreCartContext.Provider>
  );
}

/* =========================================================
   HOOK
   ========================================================= */

export function useStoreCart() {
  const context = useContext(StoreCartContext);

  if (!context) {
    throw new Error(
      "useStoreCart must be used within StoreCartProvider",
    );
  }

  return context;
}
