import { useMemo } from "react";
import { products } from "../data/products";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import { storage } from "../utils/storage";
import { getRecommendations } from "../services/recommendationService";
import type { Product } from "../types/product";

const RECENTLY_VIEWED_KEY = "shopsphere_recently_viewed";

interface UseRecommendationsOptions {
  currentProduct?: Product;
  limit?: number;
}

export const useRecommendations = ({
  currentProduct,
  limit = 6,
}: UseRecommendationsOptions = {}) => {
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);

  const recentlyViewed = storage.get<Product[]>(
    RECENTLY_VIEWED_KEY,
    [],
  );

  const cartProducts = useMemo(
    () => cartItems.map((item) => item.product),
    [cartItems],
  );

  const recommendations = useMemo(() => {
    return getRecommendations({
      products,
      currentProduct,
      wishlistProducts: wishlistItems,
      cartProducts,
      recentlyViewedProducts: recentlyViewed,
      limit,
    });
  }, [
    currentProduct,
    wishlistItems,
    cartProducts,
    recentlyViewed,
    limit,
  ]);

  return {
    recommendations,
  };
};