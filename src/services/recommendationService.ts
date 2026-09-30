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

const getOrderData = (): Order[] => {
  return storage.get<Order[]>(ORDERS_KEY, []);
};


const getSignals = (
  userId?: number,
): RecommendationSignal[] => {
  if (typeof userId !== "number") {
    return [];
  }

  return recommendationStorage.getUserSignals(userId);
};


export const recommendationService = {
  getRecommendations({
    currentProduct = null,
    userId,
    limit = 4,
    strategy,
  }: GetRecommendationsParams): RecommendationCandidate[] {
   
    const safeLimit = Math.max(
      1,
      Math.min(limit, 20),
    );

    const cartItems = useCartStore.getState().items;

    const wishlistItems =
      useWishlistStore.getState().items;

    const cartProductIds = cartItems.map(
      (item) => item.product.id,
    );

    const wishlistProductIds = wishlistItems.map(
      (item) => item.id,
    );

    const orders = getOrderData();

    const purchasedProductIds = orders.flatMap(
      (order) =>
        order.items.map(
          (item) => item.product.id,
        ),
    );


    const signals = getSignals(userId);

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

    if (strategy) {
      const recommendations =
        mockRecommendationProvider.getRecommendations(
          strategy,
          context,
        );

  
      return recommendations
        .filter(
          (item) =>
            item.product.id !== currentProduct?.id,
        )
        .slice(0, safeLimit);
    }

    const candidates =
      strategyOrder.flatMap(
        (strategyName) =>
          mockRecommendationProvider.getRecommendations(
            strategyName,
            context,
          ),
      );

    const unique =
      uniqueByProductId(candidates);


    const withoutCurrent =
      unique.filter(
        (item) =>
          item.product.id !== currentProduct?.id,
      );

    return withoutCurrent
      .sort(
        (a, b) => b.score - a.score,
      )
      .slice(0, safeLimit);
  },

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

export type {
  RecommendationCandidate,
  RecommendationStrategy,
};