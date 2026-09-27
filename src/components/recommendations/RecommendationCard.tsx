import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import type { RecommendedProduct } from "../../types/recommendation";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

interface RecommendationCardProps {
  recommendation: RecommendedProduct;
}

function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const { product, reason } = recommendation;

  const addToCart = useCartStore((state) => state.addToCart);

  const toggleWishlist = useWishlistStore(
    (state) => state.toggleWishlist,
  );

  const isInWishlist = useWishlistStore((state) =>
    state.isInWishlist(product.id),
  );

  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>

        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={
            isInWishlist
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
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

        <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#8b5cf6] shadow">
          AI Pick
        </div>
      </div>

      <div className="p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#d97706]">
          {reason}
        </p>

        <Link to={`/products/${product.id}`}>
          <h3 className="line-clamp-2 min-h-[48px] text-base font-bold text-[#29221b] hover:text-[#d97706]">
            {product.title}
          </h3>
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xl font-extrabold text-[#d97706]">
            ₹{product.price.toLocaleString("en-IN")}
          </p>

          <div className="flex items-center gap-1 text-sm font-semibold text-[#29221b]">
            <Star
              size={16}
              className="fill-[#f59e0b] text-[#f59e0b]"
            />
            {product.rating}
          </div>
        </div>

        <button
          type="button"
          onClick={() => addToCart(product)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <ShoppingCart size={18} />
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export default RecommendationCard;