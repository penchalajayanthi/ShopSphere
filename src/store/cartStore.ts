import { create } from "zustand";
import type { CartItem } from "../types/cart";
import type { Product } from "../types/product";
import { storage } from "../utils/storage";

interface CartState {
  items: CartItem[];

  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>(
  (set, get) => ({
    items: storage.get<CartItem[]>(
      "shopsphere_cart",
      [],
    ),

    addToCart: (product) => {
      const currentItems = get().items;

      const existingItem = currentItems.find(
        (item) => item.product.id === product.id,
      );

      let updatedItems: CartItem[];

      if (existingItem) {
        updatedItems = currentItems.map(
          (item) =>
            item.product.id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item,
        );
      } else {
        updatedItems = [
          ...currentItems,
          {
            product,
            quantity: 1,
          },
        ];
      }

      storage.set(
        "shopsphere_cart",
        updatedItems,
      );

      set({
        items: updatedItems,
      });
    },

    removeFromCart: (productId) => {
      const updatedItems = get().items.filter(
        (item) => item.product.id !== productId,
      );

      storage.set(
        "shopsphere_cart",
        updatedItems,
      );

      set({
        items: updatedItems,
      });
    },

    increaseQuantity: (productId) => {
      const updatedItems = get().items.map(
        (item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
      );

      storage.set(
        "shopsphere_cart",
        updatedItems,
      );

      set({
        items: updatedItems,
      });
    },

    decreaseQuantity: (productId) => {
      const updatedItems = get()
        .items.map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0);

      storage.set(
        "shopsphere_cart",
        updatedItems,
      );

      set({
        items: updatedItems,
      });
    },

    clearCart: () => {
      storage.set("shopsphere_cart", []);

      set({
        items: [],
      });
    },

    getTotal: () => {
      return get().items.reduce(
        (total, item) =>
          total +
          item.product.price * item.quantity,
        0,
      );
    },
  }),
);