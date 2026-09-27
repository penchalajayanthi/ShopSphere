import type { Product } from "./product";

export type AssistantIntent =
  | "search"
  | "category"
  | "price"
  | "rating"
  | "cheaper"
  | "better-rated"
  | "similar"
  | "help";

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  products?: Product[];
}

export interface AssistantFilters {
  category?: string;
  maxPrice?: number;
  minPrice?: number;
  minRating?: number;
  sortBy?: "price-low" | "price-high" | "rating";
}