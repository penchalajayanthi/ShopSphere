import type { Product } from "../../types/product";
import type { Order } from "../../types/order";
import type {
  RecommendationSignal,
  RecommendedProduct,
} from "../../types/recommendation";


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

export type RecommendationCandidate =
  RecommendedProduct;

export interface RecommendationProvider {
  getRecommendations(
    strategy: RecommendationStrategy,
    context: RecommendationProviderContext,
  ): RecommendationCandidate[];
}