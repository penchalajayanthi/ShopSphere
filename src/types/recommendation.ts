import type { Product } from "./product";

export type RecommendationStrategy =
  | "category"
  | "price"
  | "rating"
  | "wishlist"
  | "cart"
  | "recently-viewed"
  | "similar";

export interface RecommendationSignal {
  strategy: RecommendationStrategy;
  weight: number;
  reason: string;
}

export interface RecommendedProduct {
  product: Product;
  score: number;
  reason: string;
}