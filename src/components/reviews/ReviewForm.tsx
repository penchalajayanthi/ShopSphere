import { useState } from "react";
import { Star, Send, ShieldCheck } from "lucide-react";

import { useAuthStore } from "../../store/authStore";
import { storage } from "../../utils/storage";

import type { Order } from "../../types/order";
import type { Review } from "../../types/review";

interface ReviewFormProps {
  productId: number;
  onReviewAdded: () => void;
}

const REVIEWS_KEY = "shopsphere_reviews";
const ORDERS_KEY = "shopsphere_orders";

function ReviewForm({
  productId,
  onReviewAdded,
}: ReviewFormProps) {
  const user = useAuthStore((state) => state.user);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
        <p className="font-black text-[#29221b]">
          Please log in to write a review.
        </p>
      </div>
    );
  }

  const checkVerifiedPurchase = () => {
    const orders = storage.get<Order[]>(
      ORDERS_KEY,
      [],
    );

    return orders.some(
      (order) =>
        order.shippingAddress?.email?.toLowerCase() ===
          user.email.toLowerCase() &&
        order.items.some(
          (item) => item.product.id === productId,
        ),
    );
  };

  const handleSubmit = () => {
    const cleanComment = comment.trim();

    if (cleanComment.length < 10) {
      setMessage(
        "Review must contain at least 10 characters.",
      );
      return;
    }

    if (cleanComment.length > 500) {
      setMessage(
        "Review must contain 500 characters or fewer.",
      );
      return;
    }

    setSubmitting(true);
    setMessage("");

    const existingReviews =
      storage.get<Review[]>(
        REVIEWS_KEY,
        [],
      );

    const alreadyReviewed =
      existingReviews.some(
        (review) =>
          review.productId === productId &&
          review.userId === user.id,
      );

    if (alreadyReviewed) {
      setMessage(
        "You have already reviewed this product.",
      );
      setSubmitting(false);
      return;
    }

    const verifiedPurchase =
      checkVerifiedPurchase();

    const newReview: Review = {
      id: `review-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

      productId,

      userId: user.id,

      userName: user.name,

      rating,

      comment: cleanComment,

      createdAt:
        new Date().toISOString(),

      helpful: 0,

      notHelpful: 0,

      verifiedPurchase,
    };

    storage.set(
      REVIEWS_KEY,
      [
        ...existingReviews,
        newReview,
      ],
    );

    setComment("");
    setRating(5);
    setHoverRating(0);
    setMessage(
      "Your review was added successfully.",
    );
    setSubmitting(false);

    onReviewAdded();
  };

  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">

      {/* Header */}

      <div className="flex items-start gap-3">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#ec4899] text-white shadow-md">
          <Star size={21} fill="currentColor" />
        </div>

        <div>
          <h3 className="text-xl font-black text-[#29221b]">
            Write a Review
          </h3>

          <p className="mt-1 text-sm text-[#8c7a63]">
            Share your experience with this product.
          </p>
        </div>

      </div>

      {/* Rating */}

      <div className="mt-6">

        <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#6b5b47]">
          Your Rating
        </p>

        <div className="flex items-center gap-1">

          {[1, 2, 3, 4, 5].map(
            (value) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setRating(value)
                }
                onMouseEnter={() =>
                  setHoverRating(value)
                }
                onMouseLeave={() =>
                  setHoverRating(0)
                }
                aria-label={`Rate ${value} out of 5`}
                className="rounded-lg p-1 transition hover:bg-amber-50"
              >
                <Star
                  size={27}
                  className={
                    value <=
                    (hoverRating ||
                      rating)
                      ? "text-[#f59e0b]"
                      : "text-gray-300"
                  }
                  fill={
                    value <=
                    (hoverRating ||
                      rating)
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            ),
          )}

          <span className="ml-2 text-sm font-black text-[#d97706]">
            {rating}/5
          </span>

        </div>
      </div>

      {/* Review */}

      <div className="mt-5">

        <label
          htmlFor={`review-${productId}`}
          className="mb-2 block text-xs font-black uppercase tracking-wide text-[#6b5b47]"
        >
          Your Review
        </label>

        <textarea
          id={`review-${productId}`}
          value={comment}
          onChange={(event) =>
            setComment(
              event.target.value,
            )
          }
          rows={5}
          maxLength={500}
          placeholder="Tell other shoppers what you think..."
          className="w-full resize-none rounded-2xl border border-orange-100 bg-[#fffaf0] px-4 py-3 text-sm leading-6 text-[#29221b] outline-none transition placeholder:text-[#b8a792] focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
        />

        <div className="mt-2 flex items-center justify-between">

          <p className="text-xs text-[#a6957e]">
            Minimum 10 characters
          </p>

          <p className="text-xs font-bold text-[#8c7a63]">
            {comment.length}/500
          </p>

        </div>

      </div>

      {/* Verification information */}

      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-green-50 p-4">

        <ShieldCheck
          size={20}
          className="mt-0.5 shrink-0 text-green-600"
        />

        <div>

          <p className="text-sm font-black text-green-800">
            Verified Purchase
          </p>

          <p className="mt-1 text-xs leading-5 text-green-700">
            ShopSphere checks your local order
            history to determine whether this
            review is from a verified purchase.
          </p>

        </div>

      </div>

      {/* Message */}

      {message && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
            message.includes(
              "successfully",
            )
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Submit */}

      <button
        type="button"
        disabled={submitting}
        onClick={handleSubmit}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] px-6 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={17} />

        {submitting
          ? "Submitting..."
          : "Submit Review"}
      </button>

    </section>
  );
}

export default ReviewForm;