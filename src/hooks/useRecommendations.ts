import {
  useEffect,
  useState,
} from "react";

import type { Product } from "../types/product";

import {
  recommendationService,
} from "../services/recommendationService";

import type {
  RecommendationCandidate,
  RecommendationStrategy,
} from "../providers/recommendation/recommendationProvider";

interface UseRecommendationsOptions {
  currentProduct?: Product | null;

  userId?: number;

  limit?: number;

  strategy?: RecommendationStrategy;

  enabled?: boolean;
}

interface UseRecommendationsResult {
  recommendations:
    RecommendationCandidate[];

  loading: boolean;

  error: string | null;

  retry: () => void;
}

export function useRecommendations({
  currentProduct = null,
  userId,
  limit = 4,
  strategy,
  enabled = true,
}: UseRecommendationsOptions): UseRecommendationsResult {
  const [
    recommendations,
    setRecommendations,
  ] = useState<
    RecommendationCandidate[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(
    enabled,
  );

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setRecommendations(
        [],
      );

      setLoading(false);

      setError(null);

      return;
    }

    let cancelled =
      false;

    const loadRecommendations =
      () => {
        try {
          setLoading(true);

          setError(null);
          const timer =
            window.setTimeout(
              () => {
                if (
                  cancelled
                ) {
                  return;
                }

                try {
                  const result =
                    recommendationService.getRecommendations(
                      {
                        currentProduct,
                        userId,
                        limit,
                        strategy,
                      },
                    );

                  setRecommendations(
                    result,
                  );
                } catch {
                  setRecommendations(
                    [],
                  );

                  setError(
                    "Recommendations could not be loaded. Please try again.",
                  );
                } finally {
                  setLoading(
                    false,
                  );
                }
              },
              100,
            );

          return () => {
            window.clearTimeout(
              timer,
            );
          };
        } catch {
          if (
            cancelled
          ) {
            return;
          }

          setRecommendations(
            [],
          );

          setError(
            "Recommendations could not be loaded. Please try again.",
          );

          setLoading(false);

          return undefined;
        }
      };

    const cleanup =
      loadRecommendations();

    return () => {
      cancelled = true;

      cleanup?.();
    };
  }, [
    currentProduct,
    userId,
    limit,
    strategy,
    enabled,
    refreshKey,
  ]);

  const retry = () => {
    setRefreshKey(
      (value) =>
        value + 1,
    );
  };

  return {
    recommendations,

    loading,

    error,

    retry,
  };
}