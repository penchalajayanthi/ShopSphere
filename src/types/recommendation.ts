import type { Product } from "./product";

export type RecommendationPreference =
  | "personalized"
  | "popular"
  | "recent";

export type RecommendationSignalType =
  | "viewed"
  | "wishlist"
  | "cart"
  | "purchase"
  | "category"
  | "price";

export type RecommendationStrategy =
  | "category"
  | "similar"
  | "price"
  | "rating"
  | "wishlist"
  | "cart"
  | "recently-viewed"
  | "popular"
  | "purchase";

export interface RecommendationEngineSignal {
  strategy: RecommendationStrategy;
  weight: number;
  reason: string;
}

export interface RecommendationSignal {
  id: string;
  userId: number;
  type: RecommendationSignalType;
  label: string;
  value?: string;
  weight: number;
  createdAt: string;
}

export interface RecommendedProduct {
  product: Product;
  score: number;
  reason: string;
}

export interface RecommendationPreferences {
  userId: number;
  mode: RecommendationPreference;
  useBrowsingHistory: boolean;
  useWishlist: boolean;
  useCart: boolean;
  usePurchaseHistory: boolean;
  updatedAt: string;
}