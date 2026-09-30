import { useEffect, useState } from "react";

import { storage } from "../../utils/storage";

import type { Review } from "../../types/review";

import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import RatingDistribution from "./RatingDistribution";

interface ReviewSectionProps {
  productId: number;
}

const REVIEWS_KEY =
  "shopsphere_reviews";

function ReviewSection({
  productId,
}: ReviewSectionProps) {
  const [reviews, setReviews] =
    useState<Review[]>([]);

  const loadReviews = () => {
    const stored =
      storage.get<Review[]>(
        REVIEWS_KEY,
        [],
      );

    setReviews(
      stored.filter(
        (review) =>
          review.productId === productId,
      ),
    );
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  return (
    <section className="mt-8 space-y-5">

      {/* Section Heading */}

      <div className="rounded-3xl bg-gradient-to-r from-[#6d28d9] via-[#8b5cf6] to-[#ec4899] p-6 text-white shadow-xl sm:p-7">

        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
          SHOPSPHERE AI
        </p>

        <h2 className="mt-1 text-2xl font-black sm:text-3xl">
          Reviews & Ratings
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
          Read real shopper feedback and share
          your experience with this product.
        </p>

      </div>

      {/* Rating Distribution */}

      <RatingDistribution
        reviews={reviews}
      />

      {/* Write Review */}

      <ReviewForm
        productId={productId}
        onReviewAdded={loadReviews}
      />

      {/* Review List */}

      <ReviewList
        productId={productId}
        reviews={reviews}
        onReviewsChanged={loadReviews}
      />

    </section>
  );
}

export default ReviewSection;