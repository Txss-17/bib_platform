import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const LEGACY_STORAGE_KEY = "linksy-favorites";
const GUEST_STORAGE_KEY = "bib-store-favorites:guest";

/**
 * Les tables ajoutées par la migration customer_favorites
 * peuvent ne pas encore être présentes dans les types Supabase
 * générés localement.
 *
 * On conserve donc le client Supabase comme source d'exécution
 * pour cette nouvelle couche, sans dépendre immédiatement d'une
 * régénération manuelle de types.
 */
const favoritesDb = supabase as any;

function readLocalFavorites(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const current = localStorage.getItem(
      GUEST_STORAGE_KEY,
    );

    if (current) {
      const parsed = JSON.parse(current);

      if (Array.isArray(parsed)) {
        return parsed.filter(
          (value): value is string =>
            typeof value === "string" &&
            value.trim().length > 0,
        );
      }
    }

    const legacy = localStorage.getItem(
      LEGACY_STORAGE_KEY,
    );

    if (!legacy) {
      return [];
    }

    const parsed = JSON.parse(legacy);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const migrated = parsed.filter(
      (value): value is string =>
        typeof value === "string" &&
        value.trim().length > 0,
    );

    if (migrated.length > 0) {
      localStorage.setItem(
        GUEST_STORAGE_KEY,
        JSON.stringify(migrated),
      );
    }

    return migrated;
  } catch {
    return [];
  }
}

function writeLocalFavorites(
  favorites: string[],
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      GUEST_STORAGE_KEY,
      JSON.stringify(favorites),
    );
  } catch {
    // localStorage peut être indisponible ou saturé.
  }
}

/**
 * Gestion des favoris produits du BIB Store.
 *
 * Architecture :
 *
 * - visiteur non connecté :
 *     persistance locale temporaire ;
 *
 * - utilisateur connecté :
 *     persistance Supabase dans
 *     customer_product_favorites ;
 *
 * - la clé user_id correspond à auth.users.id ;
 *
 * - les politiques RLS Supabase garantissent qu'un utilisateur
 *   ne peut lire/modifier que ses propres favoris.
 *
 * L'API publique du hook reste compatible avec les composants
 * existants du projet.
 */
export function useFavorites() {
  const { user } = useAuth();

  const userId = user?.id ?? null;

  const [favorites, setFavorites] = useState<string[]>(() =>
    userId
      ? []
      : readLocalFavorites(),
  );

  const [isLoading, setIsLoading] = useState(
    !!userId,
  );

  const storageMode = useMemo(
    () => (userId ? "account" : "guest"),
    [userId],
  );

  /**
   * Charge les favoris depuis Supabase lorsqu'un compte
   * authentifié est disponible.
   *
   * Lorsqu'un utilisateur se connecte, les éventuels favoris
   * visiteurs sont également fusionnés dans son compte.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      if (!userId) {
        setFavorites(readLocalFavorites());
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const {
          data,
          error,
        } = await favoritesDb
          .from("customer_product_favorites")
          .select("product_id")
          .eq("user_id", userId)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        const accountFavorites = (
          data ?? []
        )
          .map(
            (row: {
              product_id?: unknown;
            }) => row.product_id,
          )
          .filter(
            (value: unknown): value is string =>
              typeof value === "string" &&
              value.trim().length > 0,
          );

        /*
         * Migration douce des favoris locaux.
         *
         * Elle permet à un visiteur de commencer à enregistrer
         * des produits avant sa connexion, puis de retrouver
         * ces favoris dans son compte.
         */
        const localFavorites =
          readLocalFavorites();

        const missingLocalFavorites =
          localFavorites.filter(
            (productId) =>
              !accountFavorites.includes(
                productId,
              ),
          );

        if (
          missingLocalFavorites.length > 0
        ) {
          const rows =
            missingLocalFavorites.map(
              (productId) => ({
                user_id: userId,
                product_id: productId,
              }),
            );

          const {
            error: insertError,
          } = await favoritesDb
            .from(
              "customer_product_favorites",
            )
            .upsert(rows, {
              onConflict:
                "user_id,product_id",
              ignoreDuplicates: true,
            });

          if (insertError) {
            throw insertError;
          }

          accountFavorites.push(
            ...missingLocalFavorites,
          );

          /*
           * Les favoris ont été transférés au compte.
           * On peut donc supprimer la copie locale.
           */
          if (
            typeof window !== "undefined"
          ) {
            try {
              localStorage.removeItem(
                GUEST_STORAGE_KEY,
              );
              localStorage.removeItem(
                LEGACY_STORAGE_KEY,
              );
            } catch {
              // Rien à faire si le stockage local
              // n'est pas accessible.
            }
          }
        }

        if (!cancelled) {
          setFavorites(
            Array.from(
              new Set(accountFavorites),
            ),
          );
        }
      } catch (error) {
        console.error(
          "Impossible de charger les favoris BIB Store.",
          error,
        );

        /*
         * En cas d'erreur réseau temporaire, on conserve
         * l'état local déjà disponible plutôt que d'effacer
         * visuellement les favoris de l'utilisateur.
         */
        if (!cancelled) {
          setFavorites(
            readLocalFavorites(),
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

  /**
   * Ajoute ou retire un produit des favoris.
   *
   * Visiteur :
   *   -> localStorage
   *
   * Compte connecté :
   *   -> Supabase
   */
  const toggleFavorite = useCallback(
    async (productId: string) => {
      const normalizedId =
        productId.trim();

      if (!normalizedId) {
        return;
      }

      const currentlyFavorite =
        favorites.includes(normalizedId);

      /*
       * Visiteur non connecté.
       */
      if (!userId) {
        setFavorites((current) => {
          const next =
            current.includes(normalizedId)
              ? current.filter(
                  (id) =>
                    id !== normalizedId,
                )
              : [
                  ...current,
                  normalizedId,
                ];

          writeLocalFavorites(next);

          return next;
        });

        return;
      }

      /*
       * Compte connecté : ajout.
       */
      if (!currentlyFavorite) {
        setFavorites((current) => [
          ...current,
          normalizedId,
        ]);

        const {
          error,
        } = await favoritesDb
          .from(
            "customer_product_favorites",
          )
          .upsert(
            {
              user_id: userId,
              product_id: normalizedId,
            },
            {
              onConflict:
                "user_id,product_id",
              ignoreDuplicates: true,
            },
          );

        if (error) {
          console.error(
            "Impossible d'ajouter le favori.",
            error,
          );

          setFavorites((current) =>
            current.filter(
              (id) =>
                id !== normalizedId,
            ),
          );
        }

        return;
      }

      /*
       * Compte connecté : suppression.
       */
      setFavorites((current) =>
        current.filter(
          (id) => id !== normalizedId,
        ),
      );

      const {
        error,
      } = await favoritesDb
        .from(
          "customer_product_favorites",
        )
        .delete()
        .eq("user_id", userId)
        .eq(
          "product_id",
          normalizedId,
        );

      if (error) {
        console.error(
          "Impossible de supprimer le favori.",
          error,
        );

        /*
         * Restauration optimiste en cas d'échec.
         */
        setFavorites((current) =>
          current.includes(normalizedId)
            ? current
            : [
                ...current,
                normalizedId,
              ],
        );
      }
    },
    [favorites, userId],
  );

  /**
   * Vérifie si un produit est actuellement favori.
   */
  const isFavorite = useCallback(
    (productId: string) =>
      favorites.includes(
        productId.trim(),
      ),
    [favorites],
  );

  /**
   * Retire explicitement un produit des favoris.
   */
  const removeFavorite = useCallback(
    async (productId: string) => {
      const normalizedId =
        productId.trim();

      if (!normalizedId) {
        return;
      }

      const wasFavorite =
        favorites.includes(
          normalizedId,
        );

      if (!wasFavorite) {
        return;
      }

      setFavorites((current) =>
        current.filter(
          (id) => id !== normalizedId,
        ),
      );

      /*
       * Visiteur : uniquement local.
       */
      if (!userId) {
        const next = favorites.filter(
          (id) => id !== normalizedId,
        );

        writeLocalFavorites(next);
        return;
      }

      /*
       * Compte : suppression Supabase.
       */
      const {
        error,
      } = await favoritesDb
        .from(
          "customer_product_favorites",
        )
        .delete()
        .eq("user_id", userId)
        .eq(
          "product_id",
          normalizedId,
        );

      if (error) {
        console.error(
          "Impossible de supprimer le favori.",
          error,
        );

        setFavorites((current) =>
          current.includes(normalizedId)
            ? current
            : [
                ...current,
                normalizedId,
              ],
        );
      }
    },
    [favorites, userId],
  );

  /**
   * Supprime tous les favoris du contexte courant.
   */
  const clearFavorites =
    useCallback(async () => {
      const previousFavorites =
        favorites;

      setFavorites([]);

      /*
       * Visiteur.
       */
      if (!userId) {
        writeLocalFavorites([]);
        return;
      }

      /*
       * Compte connecté.
       */
      const {
        error,
      } = await favoritesDb
        .from(
          "customer_product_favorites",
        )
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error(
          "Impossible de supprimer les favoris.",
          error,
        );

        setFavorites(
          previousFavorites,
        );
      }
    }, [favorites, userId]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    removeFavorite,
    clearFavorites,
    isLoading,
    storageMode,
  };
}
