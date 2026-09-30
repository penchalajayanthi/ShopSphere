import { products } from "../data/products";

import { useCartStore } from "../store/cartStore";

import { useWishlistStore } from "../store/wishlistStore";

import { recommendationStorage } from "../utils/recommendationStorage";

import { storage } from "../utils/storage";

import type { Product } from "../types/product";

import type { Order } from "../types/order";

import type { RecommendationSignal } from "../types/recommendation";

import type {
  RecommendationCandidate,
  RecommendationStrategy,
} from "../providers/recommendation/recommendationProvider";

import {
  mockRecommendationProvider,
} from "../providers/recommendation/mockRecommendationProvider";

const ORDERS_KEY = "shopsphere_orders";


const strategyOrder: RecommendationStrategy[] = [
  "personalized",
  "recently-viewed",
  "similar-products",
  "category-based",
  "price-based",
  "wishlist-based",
  "cart-based",
  "frequently-bought-together",
  "trending",
];


export interface GetRecommendationsParams {
  currentProduct?: Product | null;

  userId?: number;

  limit?: number;

  strategy?: RecommendationStrategy;
}

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

/*
 * Remove duplicate products while preserving the
 * first recommendation candidate returned.
 */
const uniqueByProductId = (
  items: RecommendationCandidate[],
): RecommendationCandidate[] => {
  const seen = new Set<number>();

  return items.filter((item) => {
    const productId = item.product.id;

    if (seen.has(productId)) {
      return false;
    }

    seen.add(productId);

    return true;
  });
};

/*
 * Read locally stored order history.
 */
const getOrderData = (): Order[] => {
  return storage.get<Order[]>(ORDERS_KEY, []);
};

/*
 * Read recommendation signals for the current user.
 */
const getSignals = (
  userId?: number,
): RecommendationSignal[] => {
  if (typeof userId !== "number") {
    return [];
  }

  return recommendationStorage.getUserSignals(userId);
};

/*
 * =========================================================
 * RECOMMENDATION SERVICE
 * =========================================================
 */

export const recommendationService = {
  getRecommendations({
    currentProduct = null,
    userId,
    limit = 4,
    strategy,
  }: GetRecommendationsParams): RecommendationCandidate[] {
    /*
     * Keep the requested limit within a safe range.
     */
    const safeLimit = Math.max(
      1,
      Math.min(limit, 20),
    );

    /*
     * -----------------------------------------------------
     * Read Zustand client state
     * -----------------------------------------------------
     */

    const cartItems = useCartStore.getState().items;

    const wishlistItems =
      useWishlistStore.getState().items;

    const cartProductIds = cartItems.map(
      (item) => item.product.id,
    );

    const wishlistProductIds = wishlistItems.map(
      (item) => item.id,
    );

    /*
     * -----------------------------------------------------
     * Read purchase/order history
     * -----------------------------------------------------
     */

    const orders = getOrderData();

    const purchasedProductIds = orders.flatMap(
      (order) =>
        order.items.map(
          (item) => item.product.id,
        ),
    );

    /*
     * -----------------------------------------------------
     * Read recommendation signals
     * -----------------------------------------------------
     */

    const signals = getSignals(userId);

    /*
     * -----------------------------------------------------
     * Provider context
     * -----------------------------------------------------
     */

    const context = {
      products,

      currentProduct,

      signals,

      wishlistProductIds,

      cartProductIds,

      purchasedProductIds,

      orders,

      limit: safeLimit,
    };

    /*
     * -----------------------------------------------------
     * Explicit strategy
     * -----------------------------------------------------
     *
     * Used when the caller wants one specific strategy.
     *
     * Example:
     * recommendationService.getByStrategy("popular")
     *
     * -----------------------------------------------------
     */

    if (strategy) {
      const recommendations =
        mockRecommendationProvider.getRecommendations(
          strategy,
          context,
        );

      /*
       * Never recommend the current PDP product itself.
       */
      return recommendations
        .filter(
          (item) =>
            item.product.id !== currentProduct?.id,
        )
        .slice(0, safeLimit);
    }

    /*
     * -----------------------------------------------------
     * Combined personalized recommendation rail
     * -----------------------------------------------------
     *
     * Run all strategies and merge their results.
     * The provider applies the individual strategy scores.
     *
     * -----------------------------------------------------
     */

    const candidates =
      strategyOrder.flatMap(
        (strategyName) =>
          mockRecommendationProvider.getRecommendations(
            strategyName,
            context,
          ),
      );

    /*
     * Remove duplicate products.
     */
    const unique =
      uniqueByProductId(candidates);

    /*
     * Never recommend the current product itself.
     */
    const withoutCurrent =
      unique.filter(
        (item) =>
          item.product.id !== currentProduct?.id,
      );

    /*
     * Highest recommendation score first.
     *
     * IMPORTANT:
     * The candidate uses `score`, not
     * `recommendationScore`.
     */
    return withoutCurrent
      .sort(
        (a, b) => b.score - a.score,
      )
      .slice(0, safeLimit);
  },

  /*
   * =======================================================
   * GET ONE SPECIFIC STRATEGY
   * =======================================================
   *
   * Useful for:
   * - testing individual strategies
   * - analytics
   * - admin recommendation controls
   * - strategy demos
   *
   * =======================================================
   */

  getByStrategy(
    strategy: RecommendationStrategy,
    params: Omit<
      GetRecommendationsParams,
      "strategy"
    > = {},
  ): RecommendationCandidate[] {
    return this.getRecommendations({
      ...params,
      strategy,
    });
  },
};

/*
 * Re-export provider types for modules that already
 * import them from the recommendation service.
 */
export type {
  RecommendationCandidate,
  RecommendationStrategy,
};