import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
const LEGACY_PRODUCT_STORAGE_KEY = "linksy-favorites";
const GUEST_PRODUCT_STORAGE_KEY = "bib-store-favorites:guest";
const GUEST_BOUTIQUE_STORAGE_KEY = "bib-store-boutique-favorites:guest";
const favoritesDb = supabase;
function sanitizeIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return Array.from(
    new Set(
      value.filter(
        (item) => typeof item === "string" && item.trim().length > 0
      )
    )
  );
}
function readStorageIds(key) {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    return sanitizeIds(JSON.parse(raw));
  } catch {
    return [];
  }
}
function writeStorageIds(key, ids) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(
      key,
      JSON.stringify(
        Array.from(new Set(ids))
      )
    );
  } catch {
  }
}
function removeStorageKey(key) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch {
  }
}
function readGuestProductFavorites() {
  const current = readStorageIds(
    GUEST_PRODUCT_STORAGE_KEY
  );
  if (current.length > 0) {
    return current;
  }
  const legacy = readStorageIds(
    LEGACY_PRODUCT_STORAGE_KEY
  );
  if (legacy.length > 0) {
    writeStorageIds(
      GUEST_PRODUCT_STORAGE_KEY,
      legacy
    );
    removeStorageKey(
      LEGACY_PRODUCT_STORAGE_KEY
    );
  }
  return legacy;
}
function writeGuestProductFavorites(ids) {
  writeStorageIds(
    GUEST_PRODUCT_STORAGE_KEY,
    ids
  );
}
function readGuestBoutiqueFavorites() {
  return readStorageIds(
    GUEST_BOUTIQUE_STORAGE_KEY
  );
}
function writeGuestBoutiqueFavorites(ids) {
  writeStorageIds(
    GUEST_BOUTIQUE_STORAGE_KEY,
    ids
  );
}
function clearGuestFavorites() {
  removeStorageKey(
    GUEST_PRODUCT_STORAGE_KEY
  );
  removeStorageKey(
    LEGACY_PRODUCT_STORAGE_KEY
  );
  removeStorageKey(
    GUEST_BOUTIQUE_STORAGE_KEY
  );
}
function useFavorites() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [favorites, setFavorites] = useState(
    () => userId ? [] : readGuestProductFavorites()
  );
  const [
    boutiqueFavorites,
    setBoutiqueFavorites
  ] = useState(
    () => userId ? [] : readGuestBoutiqueFavorites()
  );
  const [isLoading, setIsLoading] = useState(!!userId);
  const storageMode = useMemo(
    () => userId ? "account" : "guest",
    [userId]
  );
  useEffect(() => {
    let cancelled = false;
    async function loadFavorites() {
      if (!userId) {
        setFavorites(
          readGuestProductFavorites()
        );
        setBoutiqueFavorites(
          readGuestBoutiqueFavorites()
        );
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [
          productResult,
          boutiqueResult
        ] = await Promise.all([
          favoritesDb.from(
            "customer_product_favorites"
          ).select("product_id").eq("user_id", userId).order("created_at", {
            ascending: false
          }),
          favoritesDb.from(
            "customer_boutique_favorites"
          ).select("boutique_id").eq("user_id", userId).order("created_at", {
            ascending: false
          })
        ]);
        if (productResult.error) {
          throw productResult.error;
        }
        if (boutiqueResult.error) {
          throw boutiqueResult.error;
        }
        const accountProductFavorites = sanitizeIds(
          (productResult.data ?? []).map(
            (row) => row.product_id
          )
        );
        const accountBoutiqueFavorites = sanitizeIds(
          (boutiqueResult.data ?? []).map(
            (row) => row.boutique_id
          )
        );
        const guestProductFavorites = readGuestProductFavorites();
        const guestBoutiqueFavorites = readGuestBoutiqueFavorites();
        const missingProducts = guestProductFavorites.filter(
          (productId) => !accountProductFavorites.includes(
            productId
          )
        );
        const missingBoutiques = guestBoutiqueFavorites.filter(
          (boutiqueId) => !accountBoutiqueFavorites.includes(
            boutiqueId
          )
        );
        if (missingProducts.length > 0) {
          const rows = missingProducts.map(
            (productId) => ({
              user_id: userId,
              product_id: productId
            })
          );
          const {
            error: insertError
          } = await favoritesDb.from(
            "customer_product_favorites"
          ).upsert(rows, {
            onConflict: "user_id,product_id",
            ignoreDuplicates: true
          });
          if (insertError) {
            throw insertError;
          }
          accountProductFavorites.push(
            ...missingProducts
          );
        }
        if (missingBoutiques.length > 0) {
          const rows = missingBoutiques.map(
            (boutiqueId) => ({
              user_id: userId,
              boutique_id: boutiqueId
            })
          );
          const {
            error: insertError
          } = await favoritesDb.from(
            "customer_boutique_favorites"
          ).upsert(rows, {
            onConflict: "user_id,boutique_id",
            ignoreDuplicates: true
          });
          if (insertError) {
            throw insertError;
          }
          accountBoutiqueFavorites.push(
            ...missingBoutiques
          );
        }
        clearGuestFavorites();
        if (!cancelled) {
          setFavorites(
            Array.from(
              new Set(
                accountProductFavorites
              )
            )
          );
          setBoutiqueFavorites(
            Array.from(
              new Set(
                accountBoutiqueFavorites
              )
            )
          );
        }
      } catch (error) {
        console.error(
          "Impossible de charger les favoris BIB Store.",
          error
        );
        if (!cancelled) {
          setFavorites(
            readGuestProductFavorites()
          );
          setBoutiqueFavorites(
            readGuestBoutiqueFavorites()
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    void loadFavorites();
    return () => {
      cancelled = true;
    };
  }, [userId]);
  const toggleFavorite = useCallback(
    async (productId) => {
      const normalizedId = productId.trim();
      if (!normalizedId) {
        return;
      }
      const currentlyFavorite = favorites.includes(normalizedId);
      if (!userId) {
        setFavorites((current) => {
          const next = current.includes(normalizedId) ? current.filter(
            (id) => id !== normalizedId
          ) : [
            ...current,
            normalizedId
          ];
          writeGuestProductFavorites(
            next
          );
          return next;
        });
        return;
      }
      if (!currentlyFavorite) {
        setFavorites(
          (current) => current.includes(normalizedId) ? current : [
            ...current,
            normalizedId
          ]
        );
        const {
          error: error2
        } = await favoritesDb.from(
          "customer_product_favorites"
        ).upsert(
          {
            user_id: userId,
            product_id: normalizedId
          },
          {
            onConflict: "user_id,product_id",
            ignoreDuplicates: true
          }
        );
        if (error2) {
          console.error(
            "Impossible d'ajouter le favori produit.",
            error2
          );
          setFavorites(
            (current) => current.filter(
              (id) => id !== normalizedId
            )
          );
        }
        return;
      }
      setFavorites(
        (current) => current.filter(
          (id) => id !== normalizedId
        )
      );
      const {
        error
      } = await favoritesDb.from(
        "customer_product_favorites"
      ).delete().eq("user_id", userId).eq(
        "product_id",
        normalizedId
      );
      if (error) {
        console.error(
          "Impossible de supprimer le favori produit.",
          error
        );
        setFavorites(
          (current) => current.includes(normalizedId) ? current : [
            ...current,
            normalizedId
          ]
        );
      }
    },
    [favorites, userId]
  );
  const isFavorite = useCallback(
    (productId) => favorites.includes(
      productId.trim()
    ),
    [favorites]
  );
  const removeFavorite = useCallback(
    async (productId) => {
      const normalizedId = productId.trim();
      if (!normalizedId) {
        return;
      }
      if (!userId) {
        setFavorites((current) => {
          const next = current.filter(
            (id) => id !== normalizedId
          );
          writeGuestProductFavorites(
            next
          );
          return next;
        });
        return;
      }
      const wasFavorite = favorites.includes(normalizedId);
      if (!wasFavorite) {
        return;
      }
      setFavorites(
        (current) => current.filter(
          (id) => id !== normalizedId
        )
      );
      const {
        error
      } = await favoritesDb.from(
        "customer_product_favorites"
      ).delete().eq("user_id", userId).eq(
        "product_id",
        normalizedId
      );
      if (error) {
        console.error(
          "Impossible de supprimer le favori produit.",
          error
        );
        setFavorites(
          (current) => current.includes(normalizedId) ? current : [
            ...current,
            normalizedId
          ]
        );
      }
    },
    [favorites, userId]
  );
  const clearFavorites = useCallback(async () => {
    const previousFavorites = favorites;
    if (!userId) {
      setFavorites([]);
      writeGuestProductFavorites([]);
      return;
    }
    setFavorites([]);
    const {
      error
    } = await favoritesDb.from(
      "customer_product_favorites"
    ).delete().eq("user_id", userId);
    if (error) {
      console.error(
        "Impossible de supprimer les favoris produits.",
        error
      );
      setFavorites(
        previousFavorites
      );
    }
  }, [favorites, userId]);
  const toggleBoutiqueFavorite = useCallback(
    async (boutiqueId) => {
      const normalizedId = boutiqueId.trim();
      if (!normalizedId) {
        return;
      }
      const currentlyFavorite = boutiqueFavorites.includes(
        normalizedId
      );
      if (!userId) {
        setBoutiqueFavorites(
          (current) => {
            const next = current.includes(
              normalizedId
            ) ? current.filter(
              (id) => id !== normalizedId
            ) : [
              ...current,
              normalizedId
            ];
            writeGuestBoutiqueFavorites(
              next
            );
            return next;
          }
        );
        return;
      }
      if (!currentlyFavorite) {
        setBoutiqueFavorites(
          (current) => current.includes(
            normalizedId
          ) ? current : [
            ...current,
            normalizedId
          ]
        );
        const {
          error: error2
        } = await favoritesDb.from(
          "customer_boutique_favorites"
        ).upsert(
          {
            user_id: userId,
            boutique_id: normalizedId
          },
          {
            onConflict: "user_id,boutique_id",
            ignoreDuplicates: true
          }
        );
        if (error2) {
          console.error(
            "Impossible d'ajouter la boutique aux favoris.",
            error2
          );
          setBoutiqueFavorites(
            (current) => current.filter(
              (id) => id !== normalizedId
            )
          );
        }
        return;
      }
      setBoutiqueFavorites(
        (current) => current.filter(
          (id) => id !== normalizedId
        )
      );
      const {
        error
      } = await favoritesDb.from(
        "customer_boutique_favorites"
      ).delete().eq("user_id", userId).eq(
        "boutique_id",
        normalizedId
      );
      if (error) {
        console.error(
          "Impossible de supprimer la boutique des favoris.",
          error
        );
        setBoutiqueFavorites(
          (current) => current.includes(
            normalizedId
          ) ? current : [
            ...current,
            normalizedId
          ]
        );
      }
    },
    [boutiqueFavorites, userId]
  );
  const isBoutiqueFavorite = useCallback(
    (boutiqueId) => boutiqueFavorites.includes(
      boutiqueId.trim()
    ),
    [boutiqueFavorites]
  );
  const removeBoutiqueFavorite = useCallback(
    async (boutiqueId) => {
      const normalizedId = boutiqueId.trim();
      if (!normalizedId) {
        return;
      }
      if (!userId) {
        setBoutiqueFavorites(
          (current) => {
            const next = current.filter(
              (id) => id !== normalizedId
            );
            writeGuestBoutiqueFavorites(
              next
            );
            return next;
          }
        );
        return;
      }
      const wasFavorite = boutiqueFavorites.includes(
        normalizedId
      );
      if (!wasFavorite) {
        return;
      }
      setBoutiqueFavorites(
        (current) => current.filter(
          (id) => id !== normalizedId
        )
      );
      const {
        error
      } = await favoritesDb.from(
        "customer_boutique_favorites"
      ).delete().eq("user_id", userId).eq(
        "boutique_id",
        normalizedId
      );
      if (error) {
        console.error(
          "Impossible de supprimer la boutique des favoris.",
          error
        );
        setBoutiqueFavorites(
          (current) => current.includes(
            normalizedId
          ) ? current : [
            ...current,
            normalizedId
          ]
        );
      }
    },
    [boutiqueFavorites, userId]
  );
  const clearBoutiqueFavorites = useCallback(async () => {
    const previousFavorites = boutiqueFavorites;
    if (!userId) {
      setBoutiqueFavorites([]);
      writeGuestBoutiqueFavorites(
        []
      );
      return;
    }
    setBoutiqueFavorites([]);
    const {
      error
    } = await favoritesDb.from(
      "customer_boutique_favorites"
    ).delete().eq("user_id", userId);
    if (error) {
      console.error(
        "Impossible de supprimer les favoris boutiques.",
        error
      );
      setBoutiqueFavorites(
        previousFavorites
      );
    }
  }, [boutiqueFavorites, userId]);
  const clearAllFavorites = useCallback(async () => {
    const previousProducts = favorites;
    const previousBoutiques = boutiqueFavorites;
    if (!userId) {
      setFavorites([]);
      setBoutiqueFavorites([]);
      clearGuestFavorites();
      return;
    }
    setFavorites([]);
    setBoutiqueFavorites([]);
    const [
      productResult,
      boutiqueResult
    ] = await Promise.all([
      favoritesDb.from(
        "customer_product_favorites"
      ).delete().eq("user_id", userId),
      favoritesDb.from(
        "customer_boutique_favorites"
      ).delete().eq("user_id", userId)
    ]);
    if (productResult.error || boutiqueResult.error) {
      console.error(
        "Impossible de supprimer tous les favoris.",
        productResult.error ?? boutiqueResult.error
      );
      setFavorites(
        previousProducts
      );
      setBoutiqueFavorites(
        previousBoutiques
      );
    }
  }, [
    favorites,
    boutiqueFavorites,
    userId
  ]);
  return {
    /*
     * Produits
     */
    favorites,
    toggleFavorite,
    isFavorite,
    removeFavorite,
    clearFavorites,
    /*
     * Boutiques
     */
    boutiqueFavorites,
    toggleBoutiqueFavorite,
    isBoutiqueFavorite,
    removeBoutiqueFavorite,
    clearBoutiqueFavorites,
    /*
     * Global
     */
    clearAllFavorites,
    /*
     * État
     */
    isLoading,
    storageMode
  };
}
export {
  useFavorites
};
