import type { Product } from "../types/product";
import type {
  AssistantFilters,
  AssistantIntent,
} from "../types/assistant";
import { products } from "../data/products";

export interface AssistantResult {
  message: string;
  products: Product[];
  filters: AssistantFilters;
}

/* ----------------------------------------
   Helpers
----------------------------------------- */

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

/* ----------------------------------------
   Price detection
----------------------------------------- */

function detectPrice(
  text: string,
): number | undefined {
  const match = text.match(
    /(?:under|below|less than|upto|up to|max|maximum|within)\s*₹?\s*(\d+(?:\.\d+)?)\s*(k|thousand|lakh)?/i,
  );

  if (!match) {
    return undefined;
  }

  let value = Number(match[1]);

  const unit = match[2]?.toLowerCase();

  if (unit === "k" || unit === "thousand") {
    value *= 1000;
  }

  if (unit === "lakh") {
    value *= 100000;
  }

  return value;
}

/* ----------------------------------------
   Rating detection
----------------------------------------- */

function detectRating(
  text: string,
): number | undefined {
  const match = text.match(
    /(?:rating|rated|ratings?)\s*(?:above|over|at least|of)?\s*(\d(?:\.\d)?)/i,
  );

  if (!match) {
    return undefined;
  }

  return Number(match[1]);
}

/* ----------------------------------------
   Category detection
----------------------------------------- */

function detectCategory(
  text: string,
): string | undefined {
  const value = normalize(text);

  const aliases: Record<string, string> = {
    phone: "smartphones",
    phones: "smartphones",
    mobile: "smartphones",
    mobiles: "smartphones",

    laptop: "laptops",
    laptops: "laptops",
    computer: "laptops",
    computers: "laptops",

    perfume: "fragrances",
    perfumes: "fragrances",
    fragrance: "fragrances",
    fragrances: "fragrances",

    skincare: "skincare",
    "skin care": "skincare",
    skin: "skincare",

    beauty: "beauty",
  };

  for (const [keyword, category] of Object.entries(
    aliases,
  )) {
    if (value.includes(keyword)) {
      return category;
    }
  }

  const matchingCategory = products.find(
    (product) =>
      value.includes(
        product.category.toLowerCase(),
      ),
  );

  return matchingCategory?.category;
}

/* ----------------------------------------
   Intent parser
----------------------------------------- */

export function parseAssistantIntent(
  text: string,
): AssistantIntent {
  const value = normalize(text);

  const maxPrice = detectPrice(value);
  const minRating = detectRating(value);
  const category = detectCategory(value);

  /* Cheaper refinement */

  if (
    value.includes("cheaper") ||
    value.includes("less expensive") ||
    value.includes("lower price")
  ) {
    return {
      type: "refine",
      query: text,
      category,
      maxPrice,
      minRating,
      refinement: "cheaper",
    };
  }

  /* Better rated refinement */

  if (
    value.includes("better rated") ||
    value.includes("higher rated") ||
    value.includes("best rated")
  ) {
    return {
      type: "refine",
      query: text,
      category,
      maxPrice,
      minRating,
      refinement: "better-rated",
    };
  }

  /* Similar products */

  if (
    value.includes("similar") ||
    value.includes("like this")
  ) {
    return {
      type: "similar",
      query: text,
      category,
      maxPrice,
      minRating,
      refinement: "similar",
    };
  }

  /* Help */

  if (
    value.includes("help") ||
    value.includes("what can you do")
  ) {
    return {
      type: "help",
      query: text,
    };
  }

  /* Search */

  if (
    category ||
    maxPrice !== undefined ||
    minRating !== undefined
  ) {
    return {
      type: "search",
      query: text,
      category,
      maxPrice,
      minRating,
    };
  }

  return {
    type: "unknown",
    query: text,
  };
}

/* ----------------------------------------
   Product search
----------------------------------------- */

export function searchAssistantProducts(
  intent: AssistantIntent,
  previousProducts: Product[] = [],
): Product[] {
  let result = [...products];

  /* Category */

  if (intent.category) {
    result = result.filter(
      (product) =>
        product.category.toLowerCase() ===
        intent.category!.toLowerCase(),
    );
  }

  /* Maximum price */

  if (intent.maxPrice !== undefined) {
    result = result.filter(
      (product) =>
        product.price <= intent.maxPrice!,
    );
  }

  /* Minimum rating */

  if (intent.minRating !== undefined) {
    result = result.filter(
      (product) =>
        product.rating >= intent.minRating!,
    );
  }

  /* Cheaper than previous results */

  if (
    intent.refinement === "cheaper" &&
    previousProducts.length > 0
  ) {
    const previousMinimumPrice =
      Math.min(
        ...previousProducts.map(
          (product) => product.price,
        ),
      );

    result = result.filter(
      (product) =>
        product.price < previousMinimumPrice,
    );

    result.sort(
      (a, b) => a.price - b.price,
    );
  }

  /* Better rated than previous results */

  else if (
    intent.refinement === "better-rated" &&
    previousProducts.length > 0
  ) {
    const previousMaximumRating =
      Math.max(
        ...previousProducts.map(
          (product) => product.rating,
        ),
      );

    result = result.filter(
      (product) =>
        product.rating > previousMaximumRating,
    );

    result.sort(
      (a, b) => b.rating - a.rating,
    );
  }

  /* Similar products */

  else if (
    intent.refinement === "similar" &&
    previousProducts.length > 0
  ) {
    const previousCategories =
      new Set(
        previousProducts.map(
          (product) => product.category,
        ),
      );

    const previousBrands =
      new Set(
        previousProducts.map(
          (product) => product.brand,
        ),
      );

    result = result.filter(
      (product) =>
        previousCategories.has(
          product.category,
        ) ||
        previousBrands.has(product.brand),
    );

    result.sort(
      (a, b) => b.rating - a.rating,
    );
  }

  /* Default sorting */

  else {
    result.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }

      return a.price - b.price;
    });
  }

  return result.slice(0, 6);
}

/* ----------------------------------------
   Assistant response
----------------------------------------- */

export function getAssistantReply(
  intent: AssistantIntent,
  productCount: number,
): string {
  if (intent.type === "help") {
    return "I can help you find products by category, price, rating, or shopping preferences. Try asking something like \"Show laptops under ₹50,000\".";
  }

  if (intent.type === "unknown") {
    return "I can help you find products. Try asking for a category, price, or rating, such as \"Show smartphones under ₹30,000\".";
  }

  if (productCount === 0) {
    return "I couldn't find products matching those preferences. Try increasing your budget or changing the category.";
  }

  if (intent.refinement === "cheaper") {
    return "Here are some cheaper options you may like.";
  }

  if (intent.refinement === "better-rated") {
    return "Here are some better-rated options you may like.";
  }

  if (intent.refinement === "similar") {
    return "Here are some similar products you may like.";
  }

  return `I found ${productCount} product${
    productCount === 1 ? "" : "s"
  } that match your request.`;
}

/* ----------------------------------------
   Combined assistant function
----------------------------------------- */

export function askAssistant(
  text: string,
  filters: AssistantFilters = {},
): AssistantResult {
  const intent =
    parseAssistantIntent(text);

  const combinedIntent: AssistantIntent = {
    ...intent,
    category:
      intent.category ?? filters.category,
    maxPrice:
      intent.maxPrice ?? filters.maxPrice,
    minRating:
      intent.minRating ?? filters.minRating,
  };

  const resultProducts =
    searchAssistantProducts(
      combinedIntent,
    );

  const message =
    getAssistantReply(
      combinedIntent,
      resultProducts.length,
    );

  return {
    message,
    products: resultProducts,
    filters: {
      category: combinedIntent.category,
      maxPrice: combinedIntent.maxPrice,
      minRating: combinedIntent.minRating,
    },
  };
}