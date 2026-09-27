import { Sparkles } from "lucide-react";
import { useRecommendations } from "../../hooks/useRecommendations";
import RecommendationCard from "./RecommendationCard";
import type { Product } from "../../types/product";

interface RecommendationRailProps {
  title?: string;
  subtitle?: string;
  currentProduct?: Product;
  limit?: number;
}

function RecommendationRail({
  title = "Recommended for You",
  subtitle = "Personalized picks based on your shopping activity.",
  currentProduct,
  limit = 4,
}: RecommendationRailProps) {
  const { recommendations } = useRecommendations({
    currentProduct,
    limit,
  });

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-[#fff3d6] via-[#fff0f7] to-[#f3e8ff] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md">
            <Sparkles
              size={24}
              className="text-[#8b5cf6]"
            />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-[#29221b]">
              {title}
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.product.id}
            recommendation={recommendation}
          />
        ))}
      </div>
    </section>
  );
}

export default RecommendationRail;