import { useEffect, useState } from "react";
import {
  MessageSquare,
  Star,
  Trash2,
} from "lucide-react";
import type { Review } from "../../types/review";
import { useAuthStore } from "../../store/authStore";
import { reviewStorage } from "../../utils/reviewStorage";

interface ReviewListProps {
  productId: number;
  refreshKey: number;
}

function ReviewList({
  productId,
  refreshKey,
}: ReviewListProps) {
  const user = useAuthStore((state) => state.user);

 const [reviews, setReviews] = useState<Review[]>(
  () => reviewStorage.getByProduct(productId),
);

const [expanded, setExpanded] = useState(false);

useEffect(() => {
  setReviews(reviewStorage.getByProduct(productId));
}, [productId, refreshKey]);

  const refreshReviews = () => {
    setReviews(reviewStorage.getByProduct(productId));
  };

  const handleDelete = (reviewId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) {
      return;
    }

    reviewStorage.remove(reviewId);
    refreshReviews();
  };

  const visibleReviews = expanded
    ? reviews
    : reviews.slice(0, 3);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) => sum + review.rating,
          0,
        ) / reviews.length
      : 0;

  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-md sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#ec4899] text-white">
            <MessageSquare size={23} />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-[#29221b]">
              Customer Reviews
            </h2>

            <p className="text-sm text-gray-500">
              {reviews.length}{" "}
              {reviews.length === 1
                ? "review"
                : "reviews"}
            </p>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="flex items-center gap-2 rounded-2xl bg-[#fff7ed] px-4 py-3">
            <Star
              size={22}
              className="fill-[#f59e0b] text-[#f59e0b]"
            />

            <span className="text-xl font-extrabold text-[#29221b]">
              {averageRating.toFixed(1)}
            </span>

            <span className="text-sm text-gray-500">
              / 5
            </span>
          </div>
        )}
      </div>

      {/* Empty */}
      {reviews.length === 0 && (
        <div className="rounded-2xl bg-[#fffaf0] p-8 text-center">
          <MessageSquare
            size={38}
            className="mx-auto mb-3 text-[#d97706]"
          />

          <h3 className="font-bold text-[#29221b]">
            No reviews yet
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Be the first person to review this product.
          </p>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {visibleReviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-orange-100 bg-[#fffaf0] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] font-bold text-white">
                    {review.userName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="font-bold text-[#29221b]">
                      {review.userName}
                    </p>

                    <p className="text-xs text-gray-500">
                      {new Date(
                        review.createdAt,
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>

                {user?.id === review.userId && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(review.id)
                    }
                    aria-label="Delete your review"
                    className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>

              {/* Stars */}
              <div className="mt-3 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={17}
                    className={
                      star <= review.rating
                        ? "fill-[#f59e0b] text-[#f59e0b]"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-700">
                {review.comment}
              </p>
            </article>
          ))}

          {reviews.length > 3 && (
            <button
              type="button"
              onClick={() =>
                setExpanded((current) => !current)
              }
              className="w-full rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-bold text-[#7c3aed] transition hover:bg-purple-100"
            >
              {expanded
                ? "Show Less"
                : `Show All ${reviews.length} Reviews`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default ReviewList;