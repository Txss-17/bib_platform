import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";

const LEGACY_STORAGE_KEY = "linksy-favorites";
const STORAGE_KEY_PREFIX = "bib-store-favorites";

function getStorageKey(userId?: string | null) {
  if (userId) {
    return `${STORAGE_KEY_PREFIX}:${userId}`;
  }

  return `${STORAGE_KEY_PREFIX}:guest`;
}

function readFavorites(storageKey: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (value): value is string =>
        typeof value === "string" &&
        value.trim().length > 0,
    );
  } catch {
    return [];
  }
}

function migrateLegacyFavorites(
  storageKey: string,
): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  const existing = readFavorites(storageKey);

  if (existing.length > 0) {
    return existing;
  }

  try {
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
        storageKey,
        JSON.stringify(migrated),
      );
    }

    return migrated;
  } catch {
    return [];
  }
}

/**
 * Gestion des favoris produits du BIB Store.
 *
 * Cette version conserve temporairement la persistance locale.
 *
 * - Les visiteurs non connectés utilisent un espace "guest".
 * - Les utilisateurs connectés disposent d'un espace propre à
 *   leur compte.
 * - L'ancien stockage Linksy est migré automatiquement.
 *
 * La persistance Supabase pourra ensuite remplacer cette couche
 * sans modifier les composants consommateurs du hook.
 */
export function useFavorites() {
  const { user } = useAuth();

  const storageKey = useMemo(
    () => getStorageKey(user?.id),
    [user?.id],
  );

  const [favorites, setFavorites] = useState<string[]>(
    () => migrateLegacyFavorites(storageKey),
  );

  /**
   * Recharge les favoris lorsque le compte courant change.
   *
   * Cela évite qu'un utilisateur connecté récupère les favoris
   * d'un autre compte restés en mémoire dans le composant.
   */
  useEffect(() => {
    setFavorites(
      migrateLegacyFavorites(storageKey),
    );
  }, [storageKey]);

  /**
   * Persiste les favoris pour le contexte courant.
   */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(favorites),
      );
    } catch {
      // localStorage peut être indisponible ou saturé.
    }
  }, [favorites, storageKey]);

  /**
   * Ajoute ou retire un produit des favoris.
   */
  const toggleFavorite = useCallback(
    (productId: string) => {
      const normalizedId = productId.trim();

      if (!normalizedId) {
        return;
      }

      setFavorites((current) =>
        current.includes(normalizedId)
          ? current.filter(
              (id) => id !== normalizedId,
            )
          : [...current, normalizedId],
      );
    },
    [],
  );

  /**
   * Vérifie si un produit est dans les favoris.
   */
  const isFavorite = useCallback(
    (productId: string) =>
      favorites.includes(productId),
    [favorites],
  );

  /**
   * Retire explicitement un produit des favoris.
   */
  const removeFavorite = useCallback(
    (productId: string) => {
      const normalizedId = productId.trim();

      if (!normalizedId) {
        return;
      }

      setFavorites((current) =>
        current.filter(
          (id) => id !== normalizedId,
        ),
      );
    },
    [],
  );

  /**
   * Vide tous les favoris du contexte courant.
   */
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    removeFavorite,
    clearFavorites,
  };
}
