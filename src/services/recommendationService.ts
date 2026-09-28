import type { Product } from "../types/product";

import type {
  RecommendedProduct,
  RecommendationEngineSignal,
  RecommendationPreference,
} from "../types/recommendation";

interface RecommendationOptions {
  products: Product[];
  currentProduct?: Product;
  wishlistProducts?: Product[];
  cartProducts?: Product[];
  recentlyViewedProducts?: Product[];
  purchasedProducts?: Product[];
  preference?: RecommendationPreference;
  limit?: number;
}

const DEFAULT_LIMIT = 6;

const getPriceDifferenceScore = (
  productPrice: number,
  targetPrice: number,
): number => {
  if (targetPrice <= 0) {
    return 0;
  }

  const difference = Math.abs(
    productPrice - targetPrice,
  );

  const percentageDifference =
    difference / targetPrice;

  return Math.max(
    0,
    1 - percentageDifference,
  );
};

const getRatingScore = (
  rating: number,
): number => {
  return Math.min(
    Math.max(rating / 5, 0),
    1,
  );
};

/*
 * Create recommendation signals.
 *
 * These are internal engine signals.
 * They are different from RecommendationSignal
 * stored in localStorage.
 */
const createSignals = (
  product: Product,
  allProducts: Product[],
  currentProduct?: Product,
  wishlistProducts: Product[] = [],
  cartProducts: Product[] = [],
  recentlyViewedProducts: Product[] = [],
  purchasedProducts: Product[] = [],
): RecommendationEngineSignal[] => {
  const signals: RecommendationEngineSignal[] = [];

  // --------------------------------------------------
  // 1. CATEGORY STRATEGY
  // --------------------------------------------------

  if (
    currentProduct &&
    product.category === currentProduct.category
  ) {
    signals.push({
      strategy: "category",
      weight: 4,
      reason: `Similar category: ${product.category}`,
    });
  }

  // --------------------------------------------------
  // 2. SIMILAR PRODUCT STRATEGY
  // --------------------------------------------------

  if (
    currentProduct &&
    product.brand === currentProduct.brand
  ) {
    signals.push({
      strategy: "similar",
      weight: 3,
      reason: `Same brand: ${product.brand}`,
    });
  }

  // --------------------------------------------------
  // 3. PRICE STRATEGY
  // --------------------------------------------------

  if (currentProduct) {
    const priceScore =
      getPriceDifferenceScore(
        product.price,
        currentProduct.price,
      );

    if (priceScore > 0.5) {
      signals.push({
        strategy: "price",
        weight: 2 * priceScore,
        reason: "Similar price range",
      });
    }
  }

  // --------------------------------------------------
  // 4. RATING STRATEGY
  // --------------------------------------------------

  const ratingScore =
    getRatingScore(product.rating);

  if (ratingScore >= 0.8) {
    signals.push({
      strategy: "rating",
      weight: 2 * ratingScore,
      reason: "Highly rated product",
    });
  }

  // --------------------------------------------------
  // 5. WISHLIST STRATEGY
  // --------------------------------------------------

  const isInWishlist =
    wishlistProducts.some(
      (wishlistProduct) =>
        wishlistProduct.id === product.id,
    );

  if (isInWishlist) {
    signals.push({
      strategy: "wishlist",
      weight: 5,
      reason: "Based on your wishlist",
    });
  }

  // --------------------------------------------------
  // 6. CART STRATEGY
  // --------------------------------------------------

  const isInCart =
    cartProducts.some(
      (cartProduct) =>
        cartProduct.id === product.id,
    );

  if (isInCart) {
    signals.push({
      strategy: "cart",
      weight: 4,
      reason: "Based on your cart",
    });
  }

  // --------------------------------------------------
  // 7. RECENTLY VIEWED STRATEGY
  // --------------------------------------------------

  const isRecentlyViewed =
    recentlyViewedProducts.some(
      (recentProduct) =>
        recentProduct.id === product.id,
    );

  if (isRecentlyViewed) {
    signals.push({
      strategy: "recently-viewed",
      weight: 3,
      reason: "Recently viewed by you",
    });
  }

  // --------------------------------------------------
  // 8. PURCHASE STRATEGY
  // --------------------------------------------------

  const isPurchased =
    purchasedProducts.some(
      (purchasedProduct) =>
        purchasedProduct.category === product.category ||
        purchasedProduct.brand === product.brand,
    );

  if (isPurchased) {
    signals.push({
      strategy: "purchase",
      weight: 4,
      reason: "Based on your previous purchases",
    });
  }

  // --------------------------------------------------
  // 9. POPULAR STRATEGY
  // --------------------------------------------------
  //
  // Since this project uses local/mock product data,
  // rating + review-like popularity is approximated
  // using product rating and stock availability.
  //
  // Higher-rated products receive a popularity signal.
  // --------------------------------------------------

  const averageRating =
    allProducts.reduce(
      (total, item) =>
        total + item.rating,
      0,
    ) / Math.max(allProducts.length, 1);

  if (
    product.rating >= averageRating &&
    product.rating >= 4
  ) {
    signals.push({
      strategy: "popular",
      weight: 2.5,
      reason: "Popular choice among shoppers",
    });
  }

  return signals;
};

export const getRecommendations = ({
  products,
  currentProduct,
  wishlistProducts = [],
  cartProducts = [],
  recentlyViewedProducts = [],
  purchasedProducts = [],
  preference = "personalized",
  limit = DEFAULT_LIMIT,
}: RecommendationOptions): RecommendedProduct[] => {
  const scoredProducts = products
    .filter((product) => {
      if (!currentProduct) {
        return true;
      }

      return product.id !== currentProduct.id;
    })
    .map((product) => {
      const signals = createSignals(
        product,
        products,
        currentProduct,
        wishlistProducts,
        cartProducts,
        recentlyViewedProducts,
        purchasedProducts,
      );

      let score = 0;

      // ----------------------------------------------
      // PERSONALIZED MODE
      // ----------------------------------------------

      if (preference === "personalized") {
        score = signals.reduce(
          (total, signal) =>
            total + signal.weight,
          0,
        );
      }

      // ----------------------------------------------
      // POPULAR MODE
      // ----------------------------------------------

      if (preference === "popular") {
        score = signals
          .filter(
            (signal) =>
              signal.strategy === "popular" ||
              signal.strategy === "rating",
          )
          .reduce(
            (total, signal) =>
              total + signal.weight,
            0,
          );
      }

      // ----------------------------------------------
      // RECENT MODE
      // ----------------------------------------------

      if (preference === "recent") {
        score = signals
          .filter(
            (signal) =>
              signal.strategy ===
                "recently-viewed" ||
              signal.strategy === "category" ||
              signal.strategy === "similar",
          )
          .reduce(
            (total, signal) =>
              total + signal.weight,
            0,
          );
      }

      const reason =
        signals.length > 0
          ? [...signals].sort(
              (a, b) =>
                b.weight - a.weight,
            )[0].reason
          : "Popular choice for you";

      return {
        product,
        score,
        reason,
      };
    });

  return scoredProducts
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (
        b.product.rating -
        a.product.rating
      );
    })
    .slice(0, limit);
};