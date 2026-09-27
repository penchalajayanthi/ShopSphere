import { products } from "../data/products";
import type {
  AssistantFilters,
  AssistantIntent,
} from "../types/assistant";
import type { Product } from "../types/product";

interface AssistantResult {
  intent: AssistantIntent;
  message: string;
  products: Product[];
  filters: AssistantFilters;
}

const normalize = (value: string) => value.toLowerCase().trim();

const extractPrice = (text: string): number | undefined => {
  const normalized = normalize(text);

  const match = normalized.match(
    /(?:₹|rs\.?|rs|under|below|less than|upto|up to)\s*([\d,]+)/
  );

  if (!match) {
    return undefined;
  }

  const price = Number(match[1].replace(/,/g, ""));

  return Number.isNaN(price) ? undefined : price;
};

const extractCategory = (text: string): string | undefined => {
  const normalized = normalize(text);

  const categories = [
    ...new Set(products.map((product) => product.category)),
  ];

  return categories.find((category) =>
    normalized.includes(normalize(category)),
  );
};

const getRatingFilter = (text: string): number | undefined => {
  const normalized = normalize(text);

  if (
    normalized.includes("5 star") ||
    normalized.includes("five star") ||
    normalized.includes("top rated") ||
    normalized.includes("highly rated")
  ) {
    return 4.5;
  }

  if (
    normalized.includes("4 star") ||
    normalized.includes("four star") ||
    normalized.includes("good rating")
  ) {
    return 4;
  }

  return undefined;
};

const filterProducts = (
  source: Product[],
  filters: AssistantFilters,
): Product[] => {
  let result = [...source];

  if (filters.category) {
    result = result.filter(
      (product) =>
        normalize(product.category) ===
        normalize(filters.category!),
    );
  }

  if (filters.maxPrice !== undefined) {
    result = result.filter(
      (product) => product.price <= filters.maxPrice!,
    );
  }

  if (filters.minPrice !== undefined) {
    result = result.filter(
      (product) => product.price >= filters.minPrice!,
    );
  }

  if (filters.minRating !== undefined) {
    result = result.filter(
      (product) => product.rating >= filters.minRating!,
    );
  }

  if (filters.sortBy === "price-low") {
    result.sort((a, b) => a.price - b.price);
  }

  if (filters.sortBy === "price-high") {
    result.sort((a, b) => b.price - a.price);
  }

  if (filters.sortBy === "rating") {
    result.sort((a, b) => b.rating - a.rating);
  }

  return result.slice(0, 6);
};

const findSimilarProducts = (
  text: string,
): Product[] => {
  const normalized = normalize(text);

  const mentionedProduct = products.find((product) =>
    normalized.includes(normalize(product.title)),
  );

  if (!mentionedProduct) {
    return [...products]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }

  return products
    .filter((product) => product.id !== mentionedProduct.id)
    .sort((a, b) => {
      const aScore =
        (a.category === mentionedProduct.category ? 3 : 0) +
        (a.brand === mentionedProduct.brand ? 2 : 0) +
        Math.max(0, 2 - Math.abs(a.price - mentionedProduct.price) / 1000);

      const bScore =
        (b.category === mentionedProduct.category ? 3 : 0) +
        (b.brand === mentionedProduct.brand ? 2 : 0) +
        Math.max(0, 2 - Math.abs(b.price - mentionedProduct.price) / 1000);

      return bScore - aScore;
    })
    .slice(0, 6);
};

export const askAssistant = (
  text: string,
  previousFilters: AssistantFilters = {},
): AssistantResult => {
  const normalized = normalize(text);

  if (!normalized) {
    return {
      intent: "help",
      message:
        "Tell me what you're looking for. For example: “Show phones under ₹20,000” or “Show highly rated products”.",
      products: [],
      filters: previousFilters,
    };
  }

  // Similar products
  if (
    normalized.includes("similar") ||
    normalized.includes("like this") ||
    normalized.includes("same like")
  ) {
    return {
      intent: "similar",
      message:
        "Here are some products that are similar to what you're looking for.",
      products: findSimilarProducts(normalized),
      filters: previousFilters,
    };
  }

  // Cheaper products
  if (
    normalized.includes("cheaper") ||
    normalized.includes("less expensive") ||
    normalized.includes("lower price")
  ) {
    const currentMaxPrice =
      previousFilters.maxPrice ??
      Math.max(...products.map((product) => product.price));

    const newMaxPrice = Math.round(currentMaxPrice * 0.8);

    const filters: AssistantFilters = {
      ...previousFilters,
      maxPrice: newMaxPrice,
      sortBy: "price-low",
    };

    const result = filterProducts(products, filters);

    return {
      intent: "cheaper",
      message: `Sure! I found options around ₹${newMaxPrice.toLocaleString(
        "en-IN",
      )} or less.`,
      products: result,
      filters,
    };
  }

  // Better rated
  if (
    normalized.includes("better rated") ||
    normalized.includes("higher rated") ||
    normalized.includes("best rated")
  ) {
    const filters: AssistantFilters = {
      ...previousFilters,
      minRating: Math.max(previousFilters.minRating ?? 4, 4.5),
      sortBy: "rating",
    };

    const result = filterProducts(products, filters);

    return {
      intent: "better-rated",
      message:
        "Here are the higher-rated options matching your request.",
      products: result,
      filters,
    };
  }

  const price = extractPrice(normalized);
  const category = extractCategory(normalized);
  const rating = getRatingFilter(normalized);

  const filters: AssistantFilters = {
    ...previousFilters,
  };

  if (price !== undefined) {
    filters.maxPrice = price;
  }

  if (category) {
    filters.category = category;
  }

  if (rating !== undefined) {
    filters.minRating = rating;
    filters.sortBy = "rating";
  }

  // Price/category/rating search
  if (
    price !== undefined ||
    category !== undefined ||
    rating !== undefined
  ) {
    const result = filterProducts(products, filters);

    let message = "I found these products for you.";

    if (category && price !== undefined) {
      message = `Here are ${category} products under ₹${price.toLocaleString(
        "en-IN",
      )}.`;
    } else if (category) {
      message = `Here are some ${category} products for you.`;
    } else if (price !== undefined) {
      message = `Here are products under ₹${price.toLocaleString(
        "en-IN",
      )}.`;
    } else if (rating !== undefined) {
      message = "Here are some highly rated products.";
    }

    return {
      intent:
        category !== undefined
          ? "category"
          : price !== undefined
            ? "price"
            : "rating",
      message:
        result.length > 0
          ? message
          : "I couldn't find products matching those filters. Try increasing the price range or changing the category.",
      products: result,
      filters,
    };
  }

  // Search by product name, brand, or category
  const searchTerms = normalized
    .replace(
      /\b(show|find|search|give|me|some|products|product|please|want|need|for|the|a|an)\b/g,
      "",
    )
    .trim();

  const searchResults = products
    .filter((product) => {
      const searchableText = [
        product.title,
        product.description,
        product.category,
        product.brand,
      ]
        .join(" ")
        .toLowerCase();

      return searchTerms
        .split(/\s+/)
        .filter(Boolean)
        .some((term) =>
          searchableText.includes(term),
        );
    })
    .slice(0, 6);

  if (searchResults.length > 0) {
    return {
      intent: "search",
      message: `I found ${searchResults.length} product${
        searchResults.length === 1 ? "" : "s"
      } that may match your search.`,
      products: searchResults,
      filters: previousFilters,
    };
  }

  return {
    intent: "help",
    message:
      "I couldn't find an exact match. Try something like “electronics under ₹20,000”, “highly rated products”, “cheaper”, or “show similar products”.",
    products: [],
    filters: previousFilters,
  };
};