import type { Product } from "../types/product";

import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import { useToastStore } from "../store/toastStore";

export function useShopActions() {
  const addToCart = useCartStore(
    (state) => state.addToCart,
  );

  const toggleWishlist = useWishlistStore(
    (state) => state.toggleWishlist,
  );

  const isInWishlist = useWishlistStore(
    (state) => state.isInWishlist,
  );

  const showToast = useToastStore(
    (state) => state.showToast,
  );

  const handleAddToCart = (product: Product) => {
    addToCart(product);

    showToast(
      `${product.title} added to cart!`,
    );
  };

  const handleToggleWishlist = (
    product: Product,
  ) => {
    const alreadyInWishlist =
      isInWishlist(product.id);

    toggleWishlist(product);

    if (alreadyInWishlist) {
      showToast(
        `${product.title} removed from wishlist.`,
      );
    } else {
      showToast(
        `${product.title} added to wishlist!`,
      );
    }
  };

  return {
    handleAddToCart,
    handleToggleWishlist,
    isInWishlist,
  };
}