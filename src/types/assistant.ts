export type AssistantIntentType =
  | "search"
  | "refine"
  | "similar"
  | "help"
  | "unknown";

export interface AssistantFilters {
  category?: string;
  maxPrice?: number;
  minRating?: number;
}

export interface AssistantIntent {
  type: AssistantIntentType;
  query: string;
  category?: string;
  maxPrice?: number;
  minRating?: number;
  refinement?: "cheaper" | "better-rated" | "similar";
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  productIds?: number[];
  createdAt: string;
}