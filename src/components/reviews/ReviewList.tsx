import {
  CheckCircle2,
  ThumbsDown,
  ThumbsUp,
  Star,
} from "lucide-react";

import { useState } from "react";

import { storage } from "../../utils/storage";

import type { Review } from "../../types/review";

interface ReviewListProps {
  productId: number;
  reviews: Review[];
  onReviewsChanged: () => void;
}

type SortOption =
  | "recent"
  | "highest"
  | "lowest"
  | "helpful";

const REVIEWS_KEY =
  "shopsphere_reviews";

function ReviewList({
  productId,
  reviews,
  onReviewsChanged,
}: ReviewListProps) {
  const [sortBy, setSortBy] =
    useState<SortOption>("recent");

  const [votedReviews, setVotedReviews] =
    useState<Record<string, "up" | "down">>(
      {},
    );

  const sortedReviews = [...reviews]
    .filter(
      (review) =>
        review.productId === productId,
    )
    .sort((a, b) => {

      if (sortBy === "highest") {
        return b.rating - a.rating;
      }

      if (sortBy === "lowest") {
        return a.rating - b.rating;
      }

      if (sortBy === "helpful") {
        return (
          b.helpful - b.notHelpful -
          (a.helpful - a.notHelpful)
        );
      }

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });

  const handleVote = (
    reviewId: string,
    type: "up" | "down",
  ) => {
    if (votedReviews[reviewId]) {
      return;
    }

    const allReviews =
      storage.get<Review[]>(
        REVIEWS_KEY,
        [],
      );

    const updatedReviews =
      allReviews.map(
        (review) => {

          if (
            review.id !== reviewId
          ) {
            return review;
          }

          return {
            ...review,
            helpful:
              type === "up"
                ? review.helpful + 1
                : review.helpful,
            notHelpful:
              type === "down"
                ? review.notHelpful + 1
                : review.notHelpful,
          };
        },
      );

    storage.set(
      REVIEWS_KEY,
      updatedReviews,
    );

    setVotedReviews(
      (current) => ({
        ...current,
        [reviewId]: type,
      }),
    );

    onReviewsChanged();
  };

  if (sortedReviews.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/40 p-8 text-center">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-[#d97706]">
          <Star
            size={25}
            fill="currentColor"
          />
        </div>

        <h3 className="mt-4 text-lg font-black text-[#29221b]">
          No reviews yet
        </h3>

        <p className="mt-1 text-sm text-[#8c7a63]">
          Be the first customer to review
          this product.
        </p>

      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">

      {/* Header */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h3 className="text-xl font-black text-[#29221b]">
            Customer Reviews
          </h3>

          <p className="mt-1 text-sm text-[#8c7a63]">
            What shoppers are saying.
          </p>

        </div>

        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(
              event.target
                .value as SortOption,
            )
          }
          className="rounded-xl border border-orange-100 bg-[#fffaf0] px-3 py-2.5 text-sm font-bold text-[#6b5b47] outline-none focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
          aria-label="Sort reviews"
        >
          <option value="recent">
            Most Recent
          </option>

          <option value="highest">
            Highest Rated
          </option>

          <option value="lowest">
            Lowest Rated
          </option>

          <option value="helpful">
            Most Helpful
          </option>
        </select>

      </div>

      {/* Reviews */}

      <div className="mt-6 space-y-4">

        {sortedReviews.map(
          (review) => {

            const vote =
              votedReviews[
                review.id
              ];

            return (
              <article
                key={review.id}
                className="rounded-2xl border border-orange-100 bg-[#fffaf0] p-4 sm:p-5"
              >

                {/* Review top */}

                <div className="flex items-start justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] text-sm font-black text-white">
                      {review.userName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <p className="font-black text-[#29221b]">
                          {review.userName}
                        </p>

                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-black text-green-700">
                            <CheckCircle2
                              size={11}
                            />
                            Verified Purchase
                          </span>
                        )}

                      </div>

                      <p className="mt-1 text-xs text-[#a6957e]">
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

                  {/* Rating */}

                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1">

                    <Star
                      size={13}
                      fill="currentColor"
                      className="text-[#f59e0b]"
                    />

                    <span className="text-xs font-black text-[#a16207]">
                      {review.rating}
                    </span>

                  </div>

                </div>

                {/* Stars */}

                <div className="mt-4 flex items-center gap-1">

                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={
                          star <=
                          review.rating
                            ? "currentColor"
                            : "none"
                        }
                        className={
                          star <=
                          review.rating
                            ? "text-[#f59e0b]"
                            : "text-gray-300"
                        }
                      />
                    ),
                  )}

                </div>

                {/* Comment */}

                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#6b5b47]">
                  {review.comment}
                </p>

                {/* Helpful */}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-orange-100 pt-4">

                  <span className="mr-2 text-xs font-bold text-[#8c7a63]">
                    Was this helpful?
                  </span>

                  <button
                    type="button"
                    disabled={Boolean(vote)}
                    onClick={() =>
                      handleVote(
                        review.id,
                        "up",
                      )
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition ${
                      vote === "up"
                        ? "bg-green-100 text-green-700"
                        : "bg-white text-[#6b5b47] hover:bg-green-50 hover:text-green-700"
                    }`}
                  >
                    <ThumbsUp size={14} />
                    Helpful
                    <span>
                      {review.helpful}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={Boolean(vote)}
                    onClick={() =>
                      handleVote(
                        review.id,
                        "down",
                      )
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition ${
                      vote === "down"
                        ? "bg-red-100 text-red-700"
                        : "bg-white text-[#6b5b47] hover:bg-red-50 hover:text-red-700"
                    }`}
                  >
                    <ThumbsDown size={14} />
                    Not Helpful
                    <span>
                      {review.notHelpful}
                    </span>
                  </button>

                </div>

              </article>
            );
          },
        )}

      </div>
    </section>
  );
}

export default ReviewList;