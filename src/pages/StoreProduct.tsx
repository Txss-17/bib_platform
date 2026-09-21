import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const LEGACY_PRODUCT_STORAGE_KEY =
  "linksy-favorites";

const GUEST_PRODUCT_STORAGE_KEY =
  "bib-store-favorites:guest";

const GUEST_BOUTIQUE_STORAGE_KEY =
  "bib-store-boutique-favorites:guest";

/**
 * Les tables customer_*_favorites peuvent ne pas encore
 * être présentes dans les types Supabase générés localement.
 *
 * Le schéma SQL et les politiques RLS restent la source
 * d'autorité côté base.
 */
const favoritesDb = supabase as any;

type FavoriteStorageMode =
  | "guest"
  | "account";

function normalizeId(
  value: string,
): string {
  return value.trim();
}

function uniqueIds(
  values: string[],
): string[] {
  return Array.from(
    new Set(
      values
        .map(normalizeId)
        .filter(Boolean),
    ),
  );
}

/* ============================================================
   LOCAL STORAGE — PRODUITS
   ============================================================ */

function readGuestProductFavorites(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const current =
      localStorage.getItem(
        GUEST_PRODUCT_STORAGE_KEY,
      );

    if (current) {
      const parsed = JSON.parse(
        current,
      );

      if (Array.isArray(parsed)) {
        return uniqueIds(
          parsed.filter(
            (
              value,
            ): value is string =>
              typeof value ===
                "string" &&
              value.trim().length > 0,
          ),
        );
      }
    }

    /*
     * Migration de l'ancienne clé Linksy.
     */
    const legacy =
      localStorage.getItem(
        LEGACY_PRODUCT_STORAGE_KEY,
      );

    if (!legacy) {
      return [];
    }

    const parsed = JSON.parse(
      legacy,
    );

    if (!Array.isArray(parsed)) {
      return [];
    }

    const migrated =
      uniqueIds(
        parsed.filter(
          (
            value,
          ): value is string =>
            typeof value ===
              "string" &&
            value.trim().length > 0,
        ),
      );

    if (migrated.length > 0) {
      localStorage.setItem(
        GUEST_PRODUCT_STORAGE_KEY,
        JSON.stringify(
          migrated,
        ),
      );
    }

    return migrated;
  } catch {
    return [];
  }
}

function writeGuestProductFavorites(
  favorites: string[],
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      GUEST_PRODUCT_STORAGE_KEY,
      JSON.stringify(
        uniqueIds(favorites),
      ),
    );
  } catch {
    // Le stockage local peut être indisponible.
  }
}

/* ============================================================
   LOCAL STORAGE — BOUTIQUES
   ============================================================ */

function readGuestBoutiqueFavorites(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value =
      localStorage.getItem(
        GUEST_BOUTIQUE_STORAGE_KEY,
      );

    if (!value) {
      return [];
    }

    const parsed = JSON.parse(
      value,
    );

    if (!Array.isArray(parsed)) {
      return [];
    }

    return uniqueIds(
      parsed.filter(
        (
          item,
        ): item is string =>
          typeof item ===
            "string" &&
          item.trim().length > 0,
      ),
    );
  } catch {
    return [];
  }
}

function writeGuestBoutiqueFavorites(
  favorites: string[],
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      GUEST_BOUTIQUE_STORAGE_KEY,
      JSON.stringify(
        uniqueIds(favorites),
      ),
    );
  } catch {
    // Le stockage local peut être indisponible.
  }
}

/* ============================================================
   HOOK
   ============================================================ */

export function useFavorites() {
  const { user } = useAuth();

  const userId =
    user?.id ?? null;

  const storageMode: FavoriteStorageMode =
    useMemo(
      () =>
        userId
          ? "account"
          : "guest",
      [userId],
    );

  const [
    favorites,
    setFavorites,
  ] = useState<string[]>(() =>
    userId
      ? []
      : readGuestProductFavorites(),
  );

  const [
    boutiqueFavorites,
    setBoutiqueFavorites,
  ] = useState<string[]>(() =>
    userId
      ? []
      : readGuestBoutiqueFavorites(),
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(
    Boolean(userId),
  );

  /* ==========================================================
     CHARGEMENT DU COMPTE
     ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadAccountFavorites() {
      if (!userId) {
        setFavorites(
          readGuestProductFavorites(),
        );

        setBoutiqueFavorites(
          readGuestBoutiqueFavorites(),
        );

        setIsLoading(false);

        return;
      }

      setIsLoading(true);

      try {
        const [
          productResult,
          boutiqueResult,
        ] = await Promise.all([
          favoritesDb
            .from(
              "customer_product_favorites",
            )
            .select(
              "product_id",
            )
            .eq(
              "user_id",
              userId,
            )
            .order(
              "created_at",
              {
                ascending: false,
              },
            ),

          favoritesDb
            .from(
              "customer_boutique_favorites",
            )
            .select(
              "boutique_id",
            )
            .eq(
              "user_id",
              userId,
            )
            .order(
              "created_at",
              {
                ascending: false,
              },
            ),
        ]);

        if (productResult.error) {
          throw productResult.error;
        }

        if (boutiqueResult.error) {
          throw boutiqueResult.error;
        }

        const accountProducts =
          uniqueIds(
            (
              productResult.data ??
              []
            )
              .map(
                (row: {
                  product_id?: unknown;
                }) =>
                  row.product_id,
              )
              .filter(
                (
                  value: unknown,
                ): value is string =>
                  typeof value ===
                    "string" &&
                  value.trim()
                    .length > 0,
              ),
          );

        const accountBoutiques =
          uniqueIds(
            (
              boutiqueResult.data ??
              []
            )
              .map(
                (row: {
                  boutique_id?: unknown;
                }) =>
                  row.boutique_id,
              )
              .filter(
                (
                  value: unknown,
                ): value is string =>
                  typeof value ===
                    "string" &&
                  value.trim()
                    .length > 0,
              ),
          );

        /*
         * ======================================================
         * MIGRATION DES FAVORIS PRODUITS INVITÉS
         * ======================================================
         */

        const guestProducts =
          readGuestProductFavorites();

        const missingProducts =
          guestProducts.filter(
            (productId) =>
              !accountProducts.includes(
                productId,
              ),
          );

        if (
          missingProducts.length >
          0
        ) {
          const rows =
            missingProducts.map(
              (productId) => ({
                user_id:
                  userId,
                product_id:
                  productId,
              }),
            );

          const {
            error:
              insertProductsError,
          } = await favoritesDb
            .from(
              "customer_product_favorites",
            )
            .upsert(
              rows,
              {
                onConflict:
                  "user_id,product_id",
                ignoreDuplicates:
                  true,
              },
            );

          if (insertProductsError) {
            throw insertProductsError;
          }

          accountProducts.push(
            ...missingProducts,
          );
        }

        /*
         * ======================================================
         * MIGRATION DES FAVORIS BOUTIQUES INVITÉS
         * ======================================================
         */

        const guestBoutiques =
          readGuestBoutiqueFavorites();

        const missingBoutiques =
          guestBoutiques.filter(
            (boutiqueId) =>
              !accountBoutiques.includes(
                boutiqueId,
              ),
          );

        if (
          missingBoutiques.length >
          0
        ) {
          const rows =
            missingBoutiques.map(
              (boutiqueId) => ({
                user_id:
                  userId,
                boutique_id:
                  boutiqueId,
              }),
            );

          const {
            error:
              insertBoutiquesError,
          } = await favoritesDb
            .from(
              "customer_boutique_favorites",
            )
            .upsert(
              rows,
              {
                onConflict:
                  "user_id,boutique_id",
                ignoreDuplicates:
                  true,
              },
            );

          if (insertBoutiquesError) {
            throw insertBoutiquesError;
          }

          accountBoutiques.push(
            ...missingBoutiques,
          );
        }

        /*
         * Les favoris invités ont maintenant été transférés
         * dans le compte.
         */
        if (
          missingProducts.length >
            0 ||
          guestProducts.length === 0
        ) {
          writeGuestProductFavorites(
            [],
          );
        }

        if (
          missingBoutiques.length >
            0 ||
          guestBoutiques.length === 0
        ) {
          writeGuestBoutiqueFavorites(
            [],
          );
        }

        /*
         * Nettoyage de l'ancienne clé Linksy.
         */
        if (
          typeof window !==
          "undefined"
        ) {
          try {
            localStorage.removeItem(
              LEGACY_PRODUCT_STORAGE_KEY,
            );
          } catch {
            // Rien à faire.
          }
        }

        if (!cancelled) {
          setFavorites(
            uniqueIds(
              accountProducts,
            ),
          );

          setBoutiqueFavorites(
            uniqueIds(
              accountBoutiques,
            ),
          );
        }
      } catch (error) {
        console.error(
          "Impossible de charger les favoris BIB Store.",
          error,
        );

        /*
         * On conserve les éventuels favoris locaux
         * plutôt que de présenter une liste vide.
         */
        if (!cancelled) {
          setFavorites(
            readGuestProductFavorites(),
          );

          setBoutiqueFavorites(
            readGuestBoutiqueFavorites(),
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadAccountFavorites();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  /* ==========================================================
     PRODUITS
     ========================================================== */

  const toggleFavorite =
    useCallback(
      async (
        productId: string,
      ) => {
        const normalizedId =
          normalizeId(
            productId,
          );

        if (!normalizedId) {
          return;
        }

        const currentlyFavorite =
          favorites.includes(
            normalizedId,
          );

        /*
         * Visiteur.
         */
        if (!userId) {
          setFavorites(
            (current) => {
              const next =
                current.includes(
                  normalizedId,
                )
                  ? current.filter(
                      (id) =>
                        id !==
                        normalizedId,
                    )
                  : [
                      ...current,
                      normalizedId,
                    ];

              writeGuestProductFavorites(
                next,
              );

              return next;
            },
          );

          return;
        }

        /*
         * Compte connecté — ajout.
         */
        if (!currentlyFavorite) {
          setFavorites(
            (current) =>
              current.includes(
                normalizedId,
              )
                ? current
                : [
                    ...current,
                    normalizedId,
                  ],
          );

          const {
            error,
          } = await favoritesDb
            .from(
              "customer_product_favorites",
            )
            .upsert(
              {
                user_id:
                  userId,
                product_id:
                  normalizedId,
              },
              {
                onConflict:
                  "user_id,product_id",
                ignoreDuplicates:
                  true,
              },
            );

          if (error) {
            console.error(
              "Impossible d'ajouter le produit aux favoris.",
              error,
            );

            setFavorites(
              (current) =>
                current.filter(
                  (id) =>
                    id !==
                    normalizedId,
                ),
            );
          }

          return;
        }

        /*
         * Compte connecté — suppression.
         */
        setFavorites(
          (current) =>
            current.filter(
              (id) =>
                id !== normalizedId,
            ),
        );

        const {
          error,
        } = await favoritesDb
          .from(
            "customer_product_favorites",
          )
          .delete()
          .eq(
            "user_id",
            userId,
          )
          .eq(
            "product_id",
            normalizedId,
          );

        if (error) {
          console.error(
            "Impossible de supprimer le produit des favoris.",
            error,
          );

          setFavorites(
            (current) =>
              current.includes(
                normalizedId,
              )
                ? current
                : [
                    ...current,
                    normalizedId,
                  ],
          );
        }
      },
      [
        favorites,
        userId,
      ],
    );

  const isFavorite =
    useCallback(
      (productId: string) =>
        favorites.includes(
          normalizeId(
            productId,
          ),
        ),
      [favorites],
    );

  const removeFavorite =
    useCallback(
      async (
        productId: string,
      ) => {
        const normalizedId =
          normalizeId(
            productId,
          );

        if (!normalizedId) {
          return;
        }

        if (
          !favorites.includes(
            normalizedId,
          )
        ) {
          return;
        }

        setFavorites(
          (current) =>
            current.filter(
              (id) =>
                id !== normalizedId,
            ),
        );

        if (!userId) {
          writeGuestProductFavorites(
            favorites.filter(
              (id) =>
                id !==
                normalizedId,
            ),
          );

          return;
        }

        const {
          error,
        } = await favoritesDb
          .from(
            "customer_product_favorites",
          )
          .delete()
          .eq(
            "user_id",
            userId,
          )
          .eq(
            "product_id",
            normalizedId,
          );

        if (error) {
          console.error(
            "Impossible de supprimer le produit des favoris.",
            error,
          );

          setFavorites(
            (current) =>
              current.includes(
                normalizedId,
              )
                ? current
                : [
                    ...current,
                    normalizedId,
                  ],
          );
        }
      },
      [
        favorites,
        userId,
      ],
    );

  const clearFavorites =
    useCallback(
      async () => {
        const previous =
          favorites;

        setFavorites([]);

        if (!userId) {
          writeGuestProductFavorites(
            [],
          );

          return;
        }

        const {
          error,
        } = await favoritesDb
          .from(
            "customer_product_favorites",
          )
          .delete()
          .eq(
            "user_id",
            userId,
          );

        if (error) {
          console.error(
            "Impossible de supprimer les favoris produits.",
            error,
          );

          setFavorites(
            previous,
          );
        }
      },
      [
        favorites,
        userId,
      ],
    );

  /* ==========================================================
     BOUTIQUES
     ========================================================== */

  const toggleBoutiqueFavorite =
    useCallback(
      async (
        boutiqueId: string,
      ) => {
        const normalizedId =
          normalizeId(
            boutiqueId,
          );

        if (!normalizedId) {
          return;
        }

        const currentlyFavorite =
          boutiqueFavorites.includes(
            normalizedId,
          );

        /*
         * Visiteur.
         */
        if (!userId) {
          setBoutiqueFavorites(
            (current) => {
              const next =
                current.includes(
                  normalizedId,
                )
                  ? current.filter(
                      (id) =>
                        id !==
                        normalizedId,
                    )
                  : [
                      ...current,
                      normalizedId,
                    ];

              writeGuestBoutiqueFavorites(
                next,
              );

              return next;
            },
          );

          return;
        }

        /*
         * Compte connecté — ajout.
         */
        if (!currentlyFavorite) {
          setBoutiqueFavorites(
            (current) =>
              current.includes(
                normalizedId,
              )
                ? current
                : [
                    ...current,
                    normalizedId,
                  ],
          );

          const {
            error,
          } = await favoritesDb
            .from(
              "customer_boutique_favorites",
            )
            .upsert(
              {
                user_id:
                  userId,
                boutique_id:
                  normalizedId,
              },
              {
                onConflict:
                  "user_id,boutique_id",
                ignoreDuplicates:
                  true,
              },
            );

          if (error) {
            console.error(
              "Impossible d'ajouter la boutique aux favoris.",
              error,
            );

            setBoutiqueFavorites(
              (current) =>
                current.filter(
                  (id) =>
                    id !==
                    normalizedId,
                ),
            );
          }

          return;
        }

        /*
         * Compte connecté — suppression.
         */
        setBoutiqueFavorites(
          (current) =>
            current.filter(
              (id) =>
                id !== normalizedId,
            ),
        );

        const {
          error,
        } = await favoritesDb
          .from(
            "customer_boutique_favorites",
          )
          .delete()
          .eq(
            "user_id",
            userId,
          )
          .eq(
            "boutique_id",
            normalizedId,
          );

        if (error) {
          console.error(
            "Impossible de supprimer la boutique des favoris.",
            error,
          );

          setBoutiqueFavorites(
            (current) =>
              current.includes(
                normalizedId,
              )
                ? current
                : [
                    ...current,
                    normalizedId,
                  ],
          );
        }
      },
      [
        boutiqueFavorites,
        userId,
      ],
    );

  const isBoutiqueFavorite =
    useCallback(
      (boutiqueId: string) =>
        boutiqueFavorites.includes(
          normalizeId(
            boutiqueId,
          ),
        ),
      [boutiqueFavorites],
    );

  const removeBoutiqueFavorite =
    useCallback(
      async (
        boutiqueId: string,
      ) => {
        const normalizedId =
          normalizeId(
            boutiqueId,
          );

        if (!normalizedId) {
          return;
        }

        if (
          !boutiqueFavorites.includes(
            normalizedId,
          )
        ) {
          return;
        }

        setBoutiqueFavorites(
          (current) =>
            current.filter(
              (id) =>
                id !== normalizedId,
            ),
        );

        if (!userId) {
          writeGuestBoutiqueFavorites(
            boutiqueFavorites.filter(
              (id) =>
                id !==
                normalizedId,
            ),
          );

          return;
        }

        const {
          error,
        } = await favoritesDb
          .from(
            "customer_boutique_favorites",
          )
          .delete()
          .eq(
            "user_id",
            userId,
          )
          .eq(
            "boutique_id",
            normalizedId,
          );

        if (error) {
          console.error(
            "Impossible de supprimer la boutique des favoris.",
            error,
          );

          setBoutiqueFavorites(
            (current) =>
              current.includes(
                normalizedId,
              )
                ? current
                : [
                    ...current,
                    normalizedId,
                  ],
          );
        }
      },
      [
        boutiqueFavorites,
        userId,
      ],
    );

  const clearBoutiqueFavorites =
    useCallback(
      async () => {
        const previous =
          boutiqueFavorites;

        setBoutiqueFavorites([]);

        if (!userId) {
          writeGuestBoutiqueFavorites(
            [],
          );

          return;
        }

        const {
          error,
        } = await favoritesDb
          .from(
            "customer_boutique_favorites",
          )
          .delete()
          .eq(
            "user_id",
            userId,
          );

        if (error) {
          console.error(
            "Impossible de supprimer les favoris boutiques.",
            error,
          );

          setBoutiqueFavorites(
            previous,
          );
        }
      },
      [
        boutiqueFavorites,
        userId,
      ],
    );

  /* ==========================================================
     RESET GLOBAL
     ========================================================== */

  const clearAllFavorites =
    useCallback(
      async () => {
        const previousProducts =
          favorites;

        const previousBoutiques =
          boutiqueFavorites;

        setFavorites([]);

        setBoutiqueFavorites([]);

        if (!userId) {
          writeGuestProductFavorites(
            [],
          );

          writeGuestBoutiqueFavorites(
            [],
          );

          return;
        }

        const [
          productResult,
          boutiqueResult,
        ] = await Promise.all([
          favoritesDb
            .from(
              "customer_product_favorites",
            )
            .delete()
            .eq(
              "user_id",
              userId,
            ),

          favoritesDb
            .from(
              "customer_boutique_favorites",
            )
            .delete()
            .eq(
              "user_id",
              userId,
            ),
        ]);

        if (
          productResult.error ||
          boutiqueResult.error
        ) {
          console.error(
            "Impossible de supprimer tous les favoris.",
            productResult.error ??
              boutiqueResult.error,
          );

          setFavorites(
            previousProducts,
          );

          setBoutiqueFavorites(
            previousBoutiques,
          );
        }
      },
      [
        favorites,
        boutiqueFavorites,
        userId,
      ],
    );

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
    storageMode,
  };
}
