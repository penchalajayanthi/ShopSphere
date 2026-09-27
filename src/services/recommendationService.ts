import type { Product } from "../types/product";
import type {
  RecommendedProduct,
  RecommendationSignal,
} from "../types/recommendation";

interface RecommendationOptions {
  products: Product[];
  currentProduct?: Product;
  wishlistProducts?: Product[];
  cartProducts?: Product[];
  recentlyViewedProducts?: Product[];
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

  const difference = Math.abs(productPrice - targetPrice);
  const percentageDifference = difference / targetPrice;

  return Math.max(0, 1 - percentageDifference);
};

const getRatingScore = (rating: number): number => {
  return Math.min(Math.max(rating / 5, 0), 1);
};

const createSignals = (
  product: Product,
  currentProduct?: Product,
  wishlistProducts: Product[] = [],
  cartProducts: Product[] = [],
  recentlyViewedProducts: Product[] = [],
): RecommendationSignal[] => {
  const signals: RecommendationSignal[] = [];

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

  if (currentProduct) {
    const priceScore = getPriceDifferenceScore(
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

  const ratingScore = getRatingScore(product.rating);

  if (ratingScore >= 0.8) {
    signals.push({
      strategy: "rating",
      weight: 2 * ratingScore,
      reason: "Highly rated product",
    });
  }

  const isInWishlist = wishlistProducts.some(
    (wishlistProduct) => wishlistProduct.id === product.id,
  );

  if (isInWishlist) {
    signals.push({
      strategy: "wishlist",
      weight: 5,
      reason: "Based on your wishlist",
    });
  }

  const isInCart = cartProducts.some(
    (cartProduct) => cartProduct.id === product.id,
  );

  if (isInCart) {
    signals.push({
      strategy: "cart",
      weight: 4,
      reason: "Based on your cart",
    });
  }

  const isRecentlyViewed = recentlyViewedProducts.some(
    (recentProduct) => recentProduct.id === product.id,
  );

  if (isRecentlyViewed) {
    signals.push({
      strategy: "recently-viewed",
      weight: 3,
      reason: "Recently viewed by you",
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
        currentProduct,
        wishlistProducts,
        cartProducts,
        recentlyViewedProducts,
      );

      const score = signals.reduce(
        (total, signal) => total + signal.weight,
        0,
      );

      const reason =
        signals.length > 0
          ? signals
              .sort((a, b) => b.weight - a.weight)[0]
              .reason
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

      return b.product.rating - a.product.rating;
    })
    .slice(0, limit);
};