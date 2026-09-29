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

/* =========================================================
   BASIC HELPERS
========================================================= */

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[?!.!,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueProducts(items: Product[]): Product[] {
  return Array.from(
    new Map(items.map((product) => [product.id, product])).values(),
  );
}

/* =========================================================
   PRICE DETECTION
========================================================= */
function detectPrice(text: string): number | undefined {
  const value = normalize(text);

  const patterns = [
    // under 30000, below 30000, under ₹30000, under 30000 rupees
    /(?:under|below|less than|upto|up to|max|maximum|within)\s*₹?\s*(\d[\d,]*(?:\.\d+)?)\s*(k|thousand|lakh)?\s*(?:rupees?|rs\.?)?/i,

    // ₹30,000 / ₹30000
    /₹\s*(\d[\d,]*(?:\.\d+)?)\s*(k|thousand|lakh)?/i,

    // 30000 rupees / 30,000 rupees
    /(\d[\d,]*(?:\.\d+)?)\s*(k|thousand|lakh)?\s*rupees?/i,

    // 30k / 30 thousand / 1.5 lakh
    /(\d+(?:\.\d+)?)\s*(k|thousand|lakh)/i,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);

    if (!match) {
      continue;
    }

    // Remove commas before converting to number
    let amount = Number(
      match[1].replace(/,/g, ""),
    );

    const unit = match[2]?.toLowerCase();

    if (unit === "k" || unit === "thousand") {
      amount *= 1000;
    }

    if (unit === "lakh") {
      amount *= 100000;
    }

    if (Number.isFinite(amount) && amount > 0) {
      return amount;
    }
  }

  return undefined;
}

/* =========================================================
   RATING DETECTION
========================================================= */

function detectRating(text: string): number | undefined {
  const value = normalize(text);

  const match = value.match(
    /(?:rating|rated|ratings?)\s*(?:above|over|at least|of|greater than)?\s*(\d(?:\.\d)?)/i,
  );

  if (match) {
    return Number(match[1]);
  }

  if (
    value.includes("highly rated") ||
    value.includes("best rated") ||
    value.includes("top rated") ||
    value.includes("good rating")
  ) {
    return 4;
  }

  return undefined;
}

/* =========================================================
   CATEGORY DETECTION
========================================================= */

function detectCategory(text: string): string | undefined {
  const value = normalize(text);

  /*
   * First check the actual categories that exist
   * inside products.ts.
   */
  const actualCategories = Array.from(
    new Set(products.map((product) => product.category)),
  );

  for (const category of actualCategories) {
    const categoryName = normalize(category);

    if (
      value.includes(categoryName) ||
      value.includes(categoryName.replace(/s$/, ""))
    ) {
      return category;
    }
  }

  /*
   * Common shopping aliases.
   */
  const aliases: Record<string, string[]> = {
    smartphones: [
      "phone",
      "phones",
      "mobile",
      "mobiles",
      "smartphone",
      "smartphones",
      "cell phone",
      "cellphone",
    ],

    laptops: [
      "laptop",
      "laptops",
      "notebook",
      "notebooks",
      "computer",
      "computers",
    ],

    electronics: [
      "electronic",
      "electronics",
      "gadgets",
      "gadget",
      "tech",
      "technology",
    ],

    utensils: [
      "utensil",
      "utensils",
      "kitchen",
      "cookware",
      "cooking",
      "pan",
      "pans",
      "pots",
      "pot",
    ],

    shoes: [
      "shoe",
      "shoes",
      "sneaker",
      "sneakers",
      "footwear",
      "running shoes",
      "sports shoes",
      "formal shoes",
    ],

    chappals: [
      "chappal",
      "chappals",
      "slipper",
      "slippers",
      "sandal",
      "sandals",
      "flip flop",
      "flip flops",
    ],

    dresses: [
      "dress",
      "dresses",
      "clothes",
      "clothing",
      "fashion",
      "outfit",
      "outfits",
      "wear",
      "women wear",
      "womens wear",
    ],

    watches: [
      "watch",
      "watches",
      "smart watch",
      "smartwatch",
      "timepiece",
    ],

    beauty: [
      "beauty",
      "makeup",
      "cosmetics",
      "cosmetic",
    ],

    skincare: [
      "skincare",
      "skin care",
      "skin",
    ],

    fragrances: [
      "fragrance",
      "fragrances",
      "perfume",
      "perfumes",
      "scent",
      "scents",
    ],

    home: [
      "home",
      "home decor",
      "home decoration",
      "household",
      "living",
    ],
  };

  for (const [category, keywords] of Object.entries(aliases)) {
    if (
      keywords.some((keyword) =>
        value.includes(keyword),
      )
    ) {
      const matchingActualCategory = actualCategories.find(
        (actualCategory) =>
          normalize(actualCategory) === normalize(category),
      );

      if (matchingActualCategory) {
        return matchingActualCategory;
      }

      /*
       * Return the category alias when it exists
       * in the product data.
       */
      return category;
    }
  }

  return undefined;
}


/* =========================================================
   INTENT DETECTION
========================================================= */

export function parseAssistantIntent(
  text: string,
): AssistantIntent {
  const value = normalize(text);

  const category = detectCategory(value);
  const maxPrice = detectPrice(value);
  const minRating = detectRating(value);

  /*
   * CHEAPER
   */
  if (
    value.includes("cheaper") ||
    value.includes("less expensive") ||
    value.includes("lower price") ||
    value.includes("lower priced") ||
    value.includes("more affordable") ||
    value.includes("affordable")
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

  /*
   * BETTER RATED
   */
  if (
    value.includes("better rated") ||
    value.includes("higher rated") ||
    value.includes("best rated") ||
    value.includes("top rated") ||
    value.includes("highly rated")
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

  /*
   * SIMILAR
   */
  if (
    value.includes("similar") ||
    value.includes("like this") ||
    value.includes("something similar") ||
    value.includes("similar products")
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

  /*
   * HELP
   */
  if (
    value.includes("help") ||
    value.includes("what can you do") ||
    value.includes("how can you help") ||
    value.includes("what do you do")
  ) {
    return {
      type: "help",
      query: text,
    };
  }

  /*
   * GREETINGS
   */
  if (
    value === "hi" ||
    value === "hello" ||
    value === "hey" ||
    value.includes("hello there") ||
    value.includes("good morning") ||
    value.includes("good evening")
  ) {
    return {
      type: "help",
      query: text,
    };
  }

  /*
   * SEARCH
   */
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

  /*
   * GENERAL PRODUCT SEARCH
   *
   * Questions like:
   * "What products do you have?"
   * "Show me products"
   * "What can I buy?"
   */
  if (
    value.includes("show products") ||
    value.includes("show me products") ||
    value.includes("what products") ||
    value.includes("what do you have") ||
    value.includes("what can i buy") ||
    value.includes("products available") ||
    value.includes("available products") ||
    value.includes("shop products") ||
    value.includes("browse products")
  ) {
    return {
      type: "search",
      query: text,
    };
  }

  return {
    type: "unknown",
    query: text,
  };
}

/* =========================================================
   SEARCH PRODUCTS
========================================================= */

export function searchAssistantProducts(
  intent: AssistantIntent,
  previousProducts: Product[] = [],
): Product[] {
  let result = [...products];

  /*
   * CATEGORY
   */
  if (intent.category) {
    result = result.filter(
      (product) =>
        normalize(product.category) ===
        normalize(intent.category!),
    );
  }

  /*
   * PRICE
   */
  if (intent.maxPrice !== undefined) {
    result = result.filter(
      (product) =>
        product.price <= intent.maxPrice!,
    );
  }

  /*
   * RATING
   */
  if (intent.minRating !== undefined) {
    result = result.filter(
      (product) =>
        product.rating >= intent.minRating!,
    );
  }

  /*
   * CHEAPER THAN PREVIOUS RESULTS
   */
  if (
    intent.refinement === "cheaper" &&
    previousProducts.length > 0
  ) {
    const minimumPreviousPrice = Math.min(
      ...previousProducts.map(
        (product) => product.price,
      ),
    );

    result = result.filter(
      (product) =>
        product.price < minimumPreviousPrice,
    );

    result.sort(
      (a, b) => a.price - b.price,
    );
  }

  /*
   * BETTER RATED THAN PREVIOUS RESULTS
   */
  else if (
    intent.refinement === "better-rated" &&
    previousProducts.length > 0
  ) {
    const maximumPreviousRating = Math.max(
      ...previousProducts.map(
        (product) => product.rating,
      ),
    );

    result = result.filter(
      (product) =>
        product.rating > maximumPreviousRating,
    );

    result.sort(
      (a, b) => b.rating - a.rating,
    );
  }

  /*
   * SIMILAR PRODUCTS
   */
  else if (
    intent.refinement === "similar" &&
    previousProducts.length > 0
  ) {
    const previousCategories = new Set(
      previousProducts.map(
        (product) => product.category,
      ),
    );

    const previousBrands = new Set(
      previousProducts.map(
        (product) => product.brand,
      ),
    );

    result = result.filter(
      (product) =>
        previousCategories.has(
          product.category,
        ) ||
        previousBrands.has(
          product.brand,
        ),
    );

    /*
     * Don't show the exact same products.
     */
    const previousIds = new Set(
      previousProducts.map(
        (product) => product.id,
      ),
    );

    result = result.filter(
      (product) =>
        !previousIds.has(product.id),
    );

    result.sort(
      (a, b) => b.rating - a.rating,
    );
  }

  /*
   * NORMAL SEARCH
   *
   * Best rated first, then cheaper.
   */
  else {
    result.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }

      return a.price - b.price;
    });
  }

  return uniqueProducts(result).slice(0, 6);
}

/* =========================================================
   NATURAL ANSWERS
========================================================= */

export function getAssistantReply(
  intent: AssistantIntent,
  resultProducts: Product[],
): string {
  const count = resultProducts.length;

  if (intent.type === "help") {
    return (
      "Hi! 👋 I can help you shop on ShopSphere. " +
      "You can ask me about mobiles, laptops, shoes, chappals, dresses, utensils, watches and more. " +
      "You can also give me a budget or rating. " +
      'For example: "Show laptops under ₹50,000" or "Find shoes rated above 4".'
    );
  }

  if (intent.type === "unknown") {
    return (
      "I didn't quite understand that. 🤔 " +
      "Try asking me what you want to shop for, your budget, or your preferred rating. " +
      'For example: "Show mobiles under ₹30,000".'
    );
  }

  if (count === 0) {
    if (intent.category && intent.maxPrice) {
      return (
        `I couldn't find any ${intent.category} under ₹${intent.maxPrice.toLocaleString("en-IN")}. ` +
        "Try increasing your budget or choosing another category."
      );
    }

    if (intent.category) {
      return (
        `I couldn't find any products in the ${intent.category} category right now.`
      );
    }

    if (intent.maxPrice) {
      return (
        `I couldn't find products within ₹${intent.maxPrice.toLocaleString("en-IN")}. ` +
        "Try increasing your budget."
      );
    }

    return (
      "I couldn't find matching products. " +
      "Try changing your category, budget or rating."
    );
  }

  if (intent.refinement === "cheaper") {
    return `Here are ${count} more affordable options you may like. 💰`;
  }

  if (intent.refinement === "better-rated") {
    return `Here are ${count} highly rated options you may like. ⭐`;
  }

  if (intent.refinement === "similar") {
    return `Here are ${count} similar products you may like. ✨`;
  }

  if (intent.category && intent.maxPrice) {
    return (
      `I found ${count} ${intent.category} ` +
      `within your budget of ₹${intent.maxPrice.toLocaleString("en-IN")}. 🛍️`
    );
  }

  if (intent.category && intent.minRating) {
    return (
      `I found ${count} ${intent.category} ` +
      `with a rating of ${intent.minRating}+ stars. ⭐`
    );
  }

  if (intent.category) {
    return (
      `Here are ${count} ${intent.category} products you may like. 🛍️`
    );
  }

  if (intent.maxPrice) {
    return (
      `Here are ${count} products within ₹${intent.maxPrice.toLocaleString("en-IN")}. 💰`
    );
  }

  if (intent.minRating) {
    return (
      `Here are ${count} highly rated products. ⭐`
    );
  }

  return `I found ${count} products you may like. 🛍️`;
}

/* =========================================================
   MAIN ASSISTANT FUNCTION
========================================================= */

export function askAssistant(
  text: string,
  filters: AssistantFilters = {},
  previousProducts: Product[] = [],
): AssistantResult {
  const intent = parseAssistantIntent(text);

  /*
   * Only keep previous filters when the new
   * question is actually a refinement.
   *
   * This prevents old filters from affecting
   * completely new questions.
   */
  const isRefinement =
    intent.type === "refine" ||
    intent.type === "similar";

  const combinedIntent: AssistantIntent = {
    ...intent,

    category:
      intent.category ??
      (isRefinement
        ? filters.category
        : undefined),

    maxPrice:
      intent.maxPrice ??
      (isRefinement
        ? filters.maxPrice
        : undefined),

    minRating:
      intent.minRating ??
      (isRefinement
        ? filters.minRating
        : undefined),
  };

  const resultProducts =
    searchAssistantProducts(
      combinedIntent,
      previousProducts,
    );

  const message =
    getAssistantReply(
      combinedIntent,
      resultProducts,
    );

  return {
    message,
    products: resultProducts,

    filters: {
      category:
        combinedIntent.category,

      maxPrice:
        combinedIntent.maxPrice,

      minRating:
        combinedIntent.minRating,
    },
  };
}