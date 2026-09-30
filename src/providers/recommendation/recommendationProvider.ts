import type { Product } from "../../types/product";
import type { Order } from "../../types/order";
import type {
  RecommendationSignal,
  RecommendedProduct,
} from "../../types/recommendation";

/*
 * =========================================================
 * RECOMMENDATION STRATEGY
 * =========================================================
 */

export type RecommendationStrategy =
  | "recently-viewed"
  | "similar-products"
  | "category-based"
  | "price-based"
  | "wishlist-based"
  | "cart-based"
  | "frequently-bought-together"
  | "trending"
  | "personalized";

/*
 * =========================================================
 * PROVIDER CONTEXT
 * =========================================================
 */

export interface RecommendationProviderContext {
  products: Product[];

  currentProduct?: Product | null;

  signals: RecommendationSignal[];

  wishlistProductIds: number[];

  cartProductIds: number[];

  purchasedProductIds: number[];

  orders: Order[];

  limit: number;
}

/*
 * =========================================================
 * IMPORTANT
 * =========================================================
 *
 * RecommendationCandidate MUST have this shape:
 *
 * {
 *   product,
 *   score,
 *   reason
 * }
 *
 * because RecommendationCard expects RecommendedProduct.
 * =========================================================
 */

export type RecommendationCandidate =
  RecommendedProduct;

/*
 * =========================================================
 * PROVIDER CONTRACT
 * =========================================================
 */

export interface RecommendationProvider {
  getRecommendations(
    strategy: RecommendationStrategy,
    context: RecommendationProviderContext,
  ): RecommendationCandidate[];
}