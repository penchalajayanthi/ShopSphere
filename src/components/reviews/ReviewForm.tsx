import { useState } from "react";
import type { SyntheticEvent } from "react";
import { Star, Send } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { reviewStorage } from "../../utils/reviewStorage";

interface ReviewFormProps {
  productId: number;
  onReviewAdded: () => void;
}

function ReviewForm({
  productId,
  onReviewAdded,
}: ReviewFormProps) {
  const user = useAuthStore((state) => state.user);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (
    event: SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!user) {
      setError("Please login to submit a review.");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    if (comment.trim().length < 5) {
      setError(
        "Please write at least 5 characters in your review.",
      );
      return;
    }

    reviewStorage.add({
      id: `review-${Date.now()}`,
      productId,
      userId: user.id,
      userName: user.name,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    });

    setRating(0);
    setComment("");
    setSuccess("Your review was added successfully!");

    onReviewAdded();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-orange-100 bg-white p-5 shadow-md sm:p-6"
    >
      <div className="mb-5">
        <h3 className="text-xl font-extrabold text-[#29221b]">
          Write a Review
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Share your experience with this product.
        </p>
      </div>

      {/* Rating */}
      <div className="mb-5">
        <p className="mb-2 text-sm font-bold text-[#29221b]">
          Your Rating
        </p>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const active =
              star <= (hoverRating || rating);

            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() =>
                  setHoverRating(star)
                }
                onMouseLeave={() =>
                  setHoverRating(0)
                }
                aria-label={`Rate ${star} out of 5`}
                className="rounded-md p-1 transition hover:scale-110"
              >
                <Star
                  size={28}
                  className={
                    active
                      ? "fill-[#f59e0b] text-[#f59e0b]"
                      : "text-gray-300"
                  }
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Review */}
      <div className="mb-4">
        <label
          htmlFor={`review-${productId}`}
          className="mb-2 block text-sm font-bold text-[#29221b]"
        >
          Your Review
        </label>

        <textarea
          id={`review-${productId}`}
          value={comment}
          onChange={(event) =>
            setComment(event.target.value)
          }
          placeholder="What did you like or dislike about this product?"
          rows={4}
          maxLength={500}
          className="w-full resize-none rounded-2xl border border-orange-200 bg-[#fffaf0] px-4 py-3 text-sm text-[#29221b] outline-none transition focus:border-[#f59e0b] focus:ring-2 focus:ring-orange-100"
        />

        <p className="mt-1 text-right text-xs text-gray-400">
          {comment.length}/500
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
          {success}
        </div>
      )}

      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <Send size={17} />
        Submit Review
      </button>
    </form>
  );
}

export default ReviewForm;