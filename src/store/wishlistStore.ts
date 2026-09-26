import { create } from "zustand";
import type { Product } from "../types/product";
import { storage } from "../utils/storage";

interface WishlistState {
  items: Product[];

  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>(
  (set, get) => ({
    items: storage.get<Product[]>(
      "shopsphere_wishlist",
      [],
    ),

    addToWishlist: (product) => {
      const currentItems = get().items;

      const alreadyExists = currentItems.some(
        (item) => item.id === product.id,
      );

      if (alreadyExists) {
        return;
      }

      const updatedItems = [
        ...currentItems,
        product,
      ];

      storage.set(
        "shopsphere_wishlist",
        updatedItems,
      );

      set({
        items: updatedItems,
      });
    },

    removeFromWishlist: (productId) => {
      const updatedItems = get().items.filter(
        (item) => item.id !== productId,
      );

      storage.set(
        "shopsphere_wishlist",
        updatedItems,
      );

      set({
        items: updatedItems,
      });
    },

    toggleWishlist: (product) => {
      const currentItems = get().items;

      const alreadyExists = currentItems.some(
        (item) => item.id === product.id,
      );

      if (alreadyExists) {
        const updatedItems = currentItems.filter(
          (item) => item.id !== product.id,
        );

        storage.set(
          "shopsphere_wishlist",
          updatedItems,
        );

        set({
          items: updatedItems,
        });

        return;
      }

      const updatedItems = [
        ...currentItems,
        product,
      ];

      storage.set(
        "shopsphere_wishlist",
        updatedItems,
      );

      set({
        items: updatedItems,
      });
    },

    isInWishlist: (productId) => {
      return get().items.some(
        (item) => item.id === productId,
      );
    },

    clearWishlist: () => {
      storage.set(
        "shopsphere_wishlist",
        [],
      );

      set({
        items: [],
      });
    },
  }),
);