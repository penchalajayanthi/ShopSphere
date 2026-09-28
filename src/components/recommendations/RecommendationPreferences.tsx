import { useEffect, useState } from "react";
import {
  Brain,
  Eye,
  Heart,
  ShoppingCart,
  ShoppingBag,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore";
import {
  recommendationStorage,
} from "../../utils/recommendationStorage";

import type {
  RecommendationPreferences as RecommendationPreferencesType,
  RecommendationSignal,
} from "../../types/recommendation";

function RecommendationPreferences() {
  const user = useAuthStore((state) => state.user);

  const [preferences, setPreferences] =
    useState<RecommendationPreferencesType | null>(null);

  const [signals, setSignals] = useState<RecommendationSignal[]>([]);

  const [showSignals, setShowSignals] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const savedPreferences =
      recommendationStorage.getPreferences(user.id);

    const userSignals =
      recommendationStorage.getUserSignals(user.id);

    setPreferences(savedPreferences);
    setSignals(userSignals);
  }, [user]);

  if (!user || !preferences) {
    return null;
  }

  const updatePreference = (
    key: keyof RecommendationPreferencesType,
    value: boolean | string,
  ) => {
    const updated = {
      ...preferences,
      [key]: value,
      updatedAt: new Date().toISOString(),
    };

    setPreferences(updated);

    recommendationStorage.savePreferences(updated);

    setMessage("Recommendation preferences updated.");

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset your recommendation signals? This will remove your personalization history used by the recommendation system.",
    );

    if (!confirmed) return;

    recommendationStorage.clearUserSignals(user.id);
    recommendationStorage.resetPreferences(user.id);

    const defaultPreferences =
      recommendationStorage.getPreferences(user.id);

    setPreferences(defaultPreferences);
    setSignals([]);

    setMessage(
      "Your recommendation signals have been reset.",
    );

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const getSignalIcon = (type: RecommendationSignal["type"]) => {
    switch (type) {
      case "viewed":
        return <Eye size={18} />;

      case "wishlist":
        return <Heart size={18} />;

      case "cart":
        return <ShoppingCart size={18} />;

      case "purchase":
        return <ShoppingBag size={18} />;

      case "category":
        return <Sparkles size={18} />;

      case "price":
        return <Brain size={18} />;

      default:
        return <Sparkles size={18} />;
    }
  };

  const getSignalTitle = (
    type: RecommendationSignal["type"],
  ) => {
    switch (type) {
      case "viewed":
        return "Recently viewed";

      case "wishlist":
        return "Wishlist activity";

      case "cart":
        return "Cart activity";

      case "purchase":
        return "Purchase history";

      case "category":
        return "Category preference";

      case "price":
        return "Price preference";

      default:
        return "Recommendation signal";
    }
  };

  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#ec4899] text-white shadow-md">
            <Brain size={24} />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#29221b]">
              Recommendation Preferences
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Control how ShopSphere personalizes your
              recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Success message */}

      {message && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {message}
        </div>
      )}

      {/* Recommendation mode */}

      <div className="mb-6">
        <h3 className="mb-3 font-bold text-[#29221b]">
          Recommendation mode
        </h3>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Personalized */}

          <button
            type="button"
            onClick={() =>
              updatePreference("mode", "personalized")
            }
            className={`rounded-2xl border p-4 text-left transition ${
              preferences.mode === "personalized"
                ? "border-orange-400 bg-orange-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-orange-200"
            }`}
          >
            <Sparkles
              size={22}
              className="mb-2 text-orange-500"
            />

            <p className="font-bold text-[#29221b]">
              Personalized
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Uses your activity and preferences.
            </p>
          </button>

          {/* Popular */}

          <button
            type="button"
            onClick={() =>
              updatePreference("mode", "popular")
            }
            className={`rounded-2xl border p-4 text-left transition ${
              preferences.mode === "popular"
                ? "border-purple-400 bg-purple-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-purple-200"
            }`}
          >
            <Brain
              size={22}
              className="mb-2 text-purple-500"
            />

            <p className="font-bold text-[#29221b]">
              Popular
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Shows popular products without heavy
              personalization.
            </p>
          </button>

          {/* Recent */}

          <button
            type="button"
            onClick={() =>
              updatePreference("mode", "recent")
            }
            className={`rounded-2xl border p-4 text-left transition ${
              preferences.mode === "recent"
                ? "border-pink-400 bg-pink-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-pink-200"
            }`}
          >
            <Eye
              size={22}
              className="mb-2 text-pink-500"
            />

            <p className="font-bold text-[#29221b]">
              Recent activity
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Focuses more on your recent shopping activity.
            </p>
          </button>
        </div>
      </div>

      {/* Personalization signals */}

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck
            size={20}
            className="text-green-600"
          />

          <h3 className="font-bold text-[#29221b]">
            Personalization signals
          </h3>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          Choose which types of activity can influence your
          recommendations.
        </p>

        <div className="space-y-3">
          {/* Browsing history */}

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-200 p-4 transition hover:bg-orange-50">
            <div className="flex items-center gap-3">
              <Eye
                size={20}
                className="text-orange-500"
              />

              <div>
                <p className="font-semibold text-[#29221b]">
                  Browsing history
                </p>

                <p className="text-xs text-gray-500">
                  Products you have viewed.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={preferences.useBrowsingHistory}
              onChange={(event) =>
                updatePreference(
                  "useBrowsingHistory",
                  event.target.checked,
                )
              }
              className="h-5 w-5 accent-orange-500"
            />
          </label>

          {/* Wishlist */}

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-200 p-4 transition hover:bg-pink-50">
            <div className="flex items-center gap-3">
              <Heart
                size={20}
                className="text-pink-500"
              />

              <div>
                <p className="font-semibold text-[#29221b]">
                  Wishlist activity
                </p>

                <p className="text-xs text-gray-500">
                  Products you save to your wishlist.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={preferences.useWishlist}
              onChange={(event) =>
                updatePreference(
                  "useWishlist",
                  event.target.checked,
                )
              }
              className="h-5 w-5 accent-pink-500"
            />
          </label>

          {/* Cart */}

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-200 p-4 transition hover:bg-purple-50">
            <div className="flex items-center gap-3">
              <ShoppingCart
                size={20}
                className="text-purple-500"
              />

              <div>
                <p className="font-semibold text-[#29221b]">
                  Cart activity
                </p>

                <p className="text-xs text-gray-500">
                  Products you add to your cart.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={preferences.useCart}
              onChange={(event) =>
                updatePreference(
                  "useCart",
                  event.target.checked,
                )
              }
              className="h-5 w-5 accent-purple-500"
            />
          </label>

          {/* Purchase history */}

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-200 p-4 transition hover:bg-orange-50">
            <div className="flex items-center gap-3">
              <ShoppingBag
                size={20}
                className="text-orange-600"
              />

              <div>
                <p className="font-semibold text-[#29221b]">
                  Purchase history
                </p>

                <p className="text-xs text-gray-500">
                  Products from your previous orders.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={preferences.usePurchaseHistory}
              onChange={(event) =>
                updatePreference(
                  "usePurchaseHistory",
                  event.target.checked,
                )
              }
              className="h-5 w-5 accent-orange-500"
            />
          </label>
        </div>
      </div>

      {/* Transparency */}

      <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles
                size={20}
                className="text-purple-600"
              />

              <h3 className="font-bold text-[#29221b]">
                Why am I seeing these recommendations?
              </h3>
            </div>

            <p className="mt-2 text-sm text-gray-600">
              See the activity currently influencing your
              personalized recommendations.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowSignals((current) => !current)
            }
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-purple-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {showSignals
              ? "Hide signals"
              : "View signals"}
          </button>
        </div>

        {showSignals && (
          <div className="mt-5">
            {signals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-purple-200 bg-white/70 p-5 text-center">
                <Sparkles
                  size={28}
                  className="mx-auto mb-2 text-purple-400"
                />

                <p className="font-semibold text-[#29221b]">
                  No recommendation signals yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Browse products, add items to your wishlist,
                  or use your cart to create personalization
                  signals.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {signals.map((signal) => (
                  <div
                    key={signal.id}
                    className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      {getSignalIcon(signal.type)}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-[#29221b]">
                        {getSignalTitle(signal.type)}
                      </p>

                      <p className="truncate text-sm text-gray-500">
                        {signal.label}
                      </p>
                    </div>

                    <span className="ml-auto rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                      Weight {signal.weight}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reset */}

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-red-100 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-red-800">
            Reset personalization
          </h3>

          <p className="mt-1 text-sm text-red-600">
            Clear recommendation signals and restore the
            default recommendation preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
        >
          <RotateCcw size={18} />
          Reset Signals
        </button>
      </div>
    </section>
  );
}

export default RecommendationPreferences;