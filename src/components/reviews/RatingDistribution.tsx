import { Star } from "lucide-react";

import type { Review } from "../../types/review";

interface RatingDistributionProps {
  reviews: Review[];
}

function RatingDistribution({
  reviews,
}: RatingDistributionProps) {
  const total =
    reviews.length;

  const average =
    total === 0
      ? 0
      : reviews.reduce(
          (sum, review) =>
            sum + review.rating,
          0,
        ) / total;

  const counts = [5, 4, 3, 2, 1].map(
    (rating) => ({
      rating,
      count: reviews.filter(
        (review) =>
          review.rating === rating,
      ).length,
    }),
  );

  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">

      <div className="grid gap-6 sm:grid-cols-[180px_1fr]">

        {/* Average */}

        <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-5 text-center">

          <p className="text-4xl font-black text-[#29221b]">
            {average.toFixed(1)}
          </p>

          <div className="mt-2 flex items-center gap-1">

            <Star
              size={18}
              fill="currentColor"
              className="text-[#f59e0b]"
            />

            <span className="text-sm font-bold text-[#6b5b47]">
              Average Rating
            </span>

          </div>

          <p className="mt-2 text-xs font-bold text-[#8c7a63]">
            {total}{" "}
            {total === 1
              ? "review"
              : "reviews"}
          </p>

        </div>

        {/* Distribution */}

        <div className="space-y-3">

          {counts.map(
            ({
              rating,
              count,
            }) => {

              const percentage =
                total === 0
                  ? 0
                  : (count / total) *
                    100;

              return (
                <div
                  key={rating}
                  className="flex items-center gap-3"
                >

                  <div className="flex w-10 shrink-0 items-center gap-1 text-sm font-black text-[#6b5b47]">
                    {rating}
                    <Star
                      size={13}
                      fill="currentColor"
                      className="text-[#f59e0b]"
                    />
                  </div>

                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ec4899]"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                  <span className="w-10 text-right text-xs font-black text-[#8c7a63]">
                    {count}
                  </span>

                </div>
              );
            },
          )}

        </div>

      </div>

    </section>
  );
}

export default RatingDistribution;