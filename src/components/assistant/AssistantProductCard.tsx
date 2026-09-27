import {
  Heart,
  ShoppingCart,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import type { Product } from "../../types/product";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import Toast from "../ui/Toast";

interface AssistantProductCardProps {
  product: Product;
}

function AssistantProductCard({
  product,
}: AssistantProductCardProps) {
  const addToCart = useCartStore(
    (state) => state.addToCart,
  );

  const toggleWishlist = useWishlistStore(
    (state) => state.toggleWishlist,
  );

  const isInWishlist = useWishlistStore((state) =>
    state.isInWishlist(product.id),
  );

  const [toastMessage, setToastMessage] = useState("");

  const handleAddToCart = () => {
    addToCart(product);

    setToastMessage(
      `${product.title} added to cart!`,
    );
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
        {/* Product Image */}
        <div className="relative">
          <Link to={`/products/${product.id}`}>
            <img
              src={product.thumbnail}
              alt={product.title}
              className="h-36 w-full object-cover"
            />
          </Link>

          {/* Wishlist */}
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            aria-label={
              isInWishlist
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow"
          >
            <Heart
              size={16}
              className={
                isInWishlist
                  ? "fill-[#ec4899] text-[#ec4899]"
                  : "text-[#8b5cf6]"
              }
            />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-3">
          <Link to={`/products/${product.id}`}>
            <h4 className="line-clamp-2 min-h-[40px] text-sm font-bold text-[#29221b] hover:text-[#d97706]">
              {product.title}
            </h4>
          </Link>

          <div className="mt-2 flex items-center justify-between">
            <span className="font-extrabold text-[#d97706]">
              ₹{product.price.toLocaleString("en-IN")}
            </span>

            <span className="flex items-center gap-1 text-xs font-semibold">
              <Star
                size={14}
                className="fill-[#f59e0b] text-[#f59e0b]"
              />
              {product.rating}
            </span>
          </div>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-3 py-2 text-xs font-bold text-white transition hover:shadow-md"
          >
            <ShoppingCart size={15} />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage("")}
        />
      )}
    </>
  );
}

export default AssistantProductCard;