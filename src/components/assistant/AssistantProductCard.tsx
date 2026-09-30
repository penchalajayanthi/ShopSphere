import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import type { Product } from "../../types/product";
import { useCartStore } from "../../store/cartStore";
import Toast from "../ui/Toast";
import { useState } from "react";

interface AssistantProductCardProps {
  product: Product;
}

function AssistantProductCard({ product,}: AssistantProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart,);
  const [toastMessage, setToastMessage] = useState("");
  const handleAddToCart = () => {
    addToCart(product);
    setToastMessage( `${product.title} added to cart!`, );
  };

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-md">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-36 w-full object-cover transition duration-300 hover:scale-105"
          />
        </Link>

        <div className="p-3">
          <Link to={`/products/${product.id}`}>
            <h3 className="line-clamp-2 min-h-[42px] text-sm font-bold text-[#29221b] hover:text-[#7c3aed]">
              {product.title}
            </h3>
          </Link>

          <div className="mt-2 flex items-center justify-between">
            <span className="font-black text-[#d97706]">
              ₹{product.price.toLocaleString("en-IN")}
            </span>

            <span className="flex items-center gap-1 text-xs font-bold">
              <Star
                size={14}
                className="fill-[#f59e0b] text-[#f59e0b]"
              />
              {product.rating}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ec4899] px-3 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <ShoppingCart size={15} />
            Add to Cart
          </button>
        </div>
      </article>

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