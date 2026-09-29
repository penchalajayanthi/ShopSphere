import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Star,
} from "lucide-react";

import type { RecommendedProduct } from "../../types/recommendation";

import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

import Toast from "../../components/ui/Toast";

interface RecommendationCardProps {
  recommendation: RecommendedProduct;
}

function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const { product, reason } = recommendation;

  /*
   * =====================================
   * TOAST
   * =====================================
   */
  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  /*
   * =====================================
   * CART
   * =====================================
   */
  const addToCart = useCartStore(
    (state) => state.addToCart,
  );

  const handleAddToCart = () => {
    addToCart(product);

    setToastMessage(
      `${product.title} added to cart!`,
    );
  };

  /*
   * =====================================
   * WISHLIST
   * =====================================
   */
  const toggleWishlist = useWishlistStore(
    (state) => state.toggleWishlist,
  );

  const isInWishlist = useWishlistStore(
    (state) => state.isInWishlist(product.id),
  );

  const handleToggleWishlist = () => {
    const alreadyInWishlist =
      isInWishlist;

    toggleWishlist(product);

    if (alreadyInWishlist) {
      setToastMessage(
        `${product.title} removed from wishlist.`,
      );
    } else {
      setToastMessage(
        `${product.title} added to wishlist!`,
      );
    }
  };

  /*
   * =====================================
   * AUTOMATICALLY HIDE TOAST
   * =====================================
   */
  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [toastMessage]);

  return (
    <>
      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() =>
            setToastMessage(null)
          }
        />
      )}

      <article className="group overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative">

          {/* Product Image */}
          <Link
            to={`/products/${product.id}`}
          >
            <img
              src={product.thumbnail}
              alt={product.title}
              loading="lazy"
              className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Wishlist */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={
              isInWishlist
                ? `Remove ${product.title} from wishlist`
                : `Add ${product.title} to wishlist`
            }
            aria-pressed={isInWishlist}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110"
          >
            <Heart
              size={19}
              className={
                isInWishlist
                  ? "fill-[#ec4899] text-[#ec4899]"
                  : "text-[#8b5cf6]"
              }
            />
          </button>

          {/* AI Pick */}
          <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#8b5cf6] shadow">
            AI Pick
          </div>
        </div>

        <div className="p-4">

          {/* Recommendation Reason */}
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#d97706]">
            {reason}
          </p>

          {/* Product Title */}
          <Link
            to={`/products/${product.id}`}
          >
            <h3 className="line-clamp-2 min-h-[48px] text-base font-bold text-[#29221b] hover:text-[#d97706]">
              {product.title}
            </h3>
          </Link>

          {/* Price + Rating */}
          <div className="mt-3 flex items-center justify-between">

            <p className="text-xl font-extrabold text-[#d97706]">
              ₹
              {product.price.toLocaleString(
                "en-IN",
              )}
            </p>

            <div className="flex items-center gap-1 text-sm font-semibold text-[#29221b]">
              <Star
                size={16}
                className="fill-[#f59e0b] text-[#f59e0b]"
              />

              {product.rating}
            </div>

          </div>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart size={18} />

            {product.stock > 0
              ? "Add to Cart"
              : "Out of Stock"}
          </button>

        </div>
      </article>
    </>
  );
}

export default RecommendationCard;