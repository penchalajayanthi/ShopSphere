import type { Product } from "../../types/product";

import type {
  RecommendationProvider,
  RecommendationProviderContext,
  RecommendationCandidate,
  RecommendationStrategy,
} from "./recommendationProvider";

const clamp = (
  value: number,
  minimum: number,
  maximum: number,
) => {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  );
};

const normalize = (
  value: number,
  minimum: number,
  maximum: number,
) => {
  if (maximum === minimum) {
    return 1;
  }

  return clamp(
    (value - minimum) /
      (maximum - minimum),
    0,
    1,
  );
};

const priceSimilarity = (
  first: number,
  second: number,
) => {
  const difference = Math.abs(
    first - second,
  );

  const base = Math.max(
    first,
    second,
    1,
  );

  return clamp(
    1 - difference / base,
    0,
    1,
  );
};


const createCandidate = (
  product: Product,
  score: number,
  reason: string,
): RecommendationCandidate => {
  return {
    product,
    score: Number(
      score.toFixed(4),
    ),
    reason,
  };
};

const getSignalProductIds = (
  context: RecommendationProviderContext,
  signalType:
    | "viewed"
    | "wishlist"
    | "cart"
    | "purchase",
): number[] => {
  return context.signals
    .filter(
      (signal) =>
        signal.type === signalType,
    )
    .map(
      (signal) =>
        Number(signal.value),
    )
    .filter(
      (productId): productId is number =>
        Number.isFinite(productId),
    );
};

const getProductsByIds = (
  products: Product[],
  ids: number[],
): Product[] => {
  const idSet = new Set(ids);

  return products.filter(
    (product) =>
      idSet.has(product.id),
  );
};


const getCategoryFrequency = (
  products: Product[],
  ids: number[],
): string[] => {
  const signalProducts =
    getProductsByIds(
      products,
      ids,
    );

  const frequency =
    new Map<string, number>();

  signalProducts.forEach(
    (product) => {
      frequency.set(
        product.category,
        (frequency.get(
          product.category,
        ) ?? 0) + 1,
      );
    },
  );

  return [...frequency.entries()]
    .sort(
      (a, b) =>
        b[1] - a[1],
    )
    .map(
      ([category]) =>
        category,
    );
};

export class MockRecommendationProvider
  implements RecommendationProvider
{
  getRecommendations(
    strategy: RecommendationStrategy,
    context: RecommendationProviderContext,
  ): RecommendationCandidate[] {
    switch (strategy) {
      case "recently-viewed":
        return this.recentlyViewed(
          context,
        );

      case "similar-products":
        return this.similarProducts(
          context,
        );

      case "category-based":
        return this.categoryBased(
          context,
        );

      case "price-based":
        return this.priceBased(
          context,
        );

      case "wishlist-based":
        return this.wishlistBased(
          context,
        );

      case "cart-based":
        return this.cartBased(
          context,
        );

      case "frequently-bought-together":
        return this.frequentlyBoughtTogether(
          context,
        );

      case "trending":
        return this.trending(
          context,
        );

      case "personalized":
        return this.personalized(
          context,
        );

      default:
        return [];
    }
  }

  private recentlyViewed(
    context: RecommendationProviderContext,
  ): RecommendationCandidate[] {
    const viewedIds =
      getSignalProductIds(
        context,
        "viewed",
      );

    const uniqueIds = [
      ...new Set(
        [...viewedIds].reverse(),
      ),
    ];

    const candidates =
      getProductsByIds(
        context.products,
        uniqueIds,
      ).filter(
        (product) =>
          product.id !==
          context.currentProduct?.id,
      );

    return candidates
      .map(
        (product, index) =>
          createCandidate(
            product,
            1 -
              index /
                Math.max(
                  candidates.length,
                  1,
                ),
            "Recently viewed",
          ),
      )
      .slice(0, context.limit);
  }

  private similarProducts(
    context: RecommendationProviderContext,
  ): RecommendationCandidate[] {
    const current =
      context.currentProduct;

    if (!current) {
      return [];
    }

    const candidates =
      context.products
        .filter(
          (product) =>
            product.id !==
            current.id,
        )
        .map((product) => {
          let score = 0;

          if (
            product.category ===
            current.category
          ) {
            score += 0.45;
          }

          if (
            product.brand &&
            current.brand &&
            product.brand.toLowerCase() ===
              current.brand.toLowerCase()
          ) {
            score += 0.2;
          }

          score +=
            priceSimilarity(
              product.price,
              current.price,
            ) * 0.2;

          score +=
            normalize(
              product.rating,
              1,
              5,
            ) * 0.15;

          return {
            product,
            score,
          };
        })
        .sort(
          (a, b) =>
            b.score - a.score,
        );

    return candidates
      .slice(0, context.limit)
      .map(
        ({ product, score }) =>
          createCandidate(
            product,
            score,
            "Similar products",
          ),
      );
  }

  private categoryBased(
    context: RecommendationProviderContext,
  ): RecommendationCandidate[] {
    const signalIds = [
      ...getSignalProductIds(
        context,
        "viewed",
      ),
      ...getSignalProductIds(
        context,
        "wishlist",
      ),
      ...getSignalProductIds(
        context,
        "cart",
      ),
      ...getSignalProductIds(
        context,
        "purchase",
      ),
    ];

    const preferredCategories =
      getCategoryFrequency(
        context.products,
        signalIds,
      );

    const targetCategory =
      context.currentProduct?.category ??
      preferredCategories[0];

    if (!targetCategory) {
      return [];
    }

    const candidates =
      context.products
        .filter(
          (product) =>
            product.category ===
              targetCategory &&
            product.id !==
              context.currentProduct?.id,
        )
        .sort(
          (a, b) =>
            b.rating - a.rating,
        );

    return candidates
      .slice(0, context.limit)
      .map(
        (product) =>
          createCandidate(
            product,
            0.7 +
              normalize(
                product.rating,
                1,
                5,
              ) *
                0.3,
            "From your category",
          ),
      );
  }


  private priceBased(
    context: RecommendationProviderContext,
  ): RecommendationCandidate[] {
    const viewedProducts =
      getProductsByIds(
        context.products,
        getSignalProductIds(
          context,
          "viewed",
        ),
      );

    const wishlistProducts =
      getProductsByIds(
        context.products,
        getSignalProductIds(
          context,
          "wishlist",
        ),
      );

    const cartProducts =
      getProductsByIds(
        context.products,
        getSignalProductIds(
          context,
          "cart",
        ),
      );

    const sourceProducts = [
      ...viewedProducts,
      ...wishlistProducts,
      ...cartProducts,
      ...(context.currentProduct
        ? [context.currentProduct]
        : []),
    ];

    if (
      sourceProducts.length === 0
    ) {
      return [];
    }

    const averagePrice =
      sourceProducts.reduce(
        (sum, product) =>
          sum + product.price,
        0,
      ) /
      sourceProducts.length;

    const candidates =
      context.products
        .filter(
          (product) =>
            product.id !==
            context.currentProduct?.id,
        )
        .map(
          (product) => ({
            product,
            score:
              priceSimilarity(
                product.price,
                averagePrice,
              ),
          }),
        )
        .sort(
          (a, b) =>
            b.score - a.score,
        );

    return candidates
      .slice(0, context.limit)
      .map(
        ({ product, score }) =>
          createCandidate(
            product,
            score,
            "Within your price range",
          ),
      );
  }

  private wishlistBased(
    context: RecommendationProviderContext,
  ): RecommendationCandidate[] {
    if (
      context.wishlistProductIds
        .length === 0
    ) {
      return [];
    }

    const wishlistProducts =
      getProductsByIds(
        context.products,
        context.wishlistProductIds,
      );

    const candidates =
      context.products
        .filter(
          (product) =>
            !context.wishlistProductIds.includes(
              product.id,
            ) &&
            product.id !==
              context.currentProduct?.id,
        )
        .map((product) => {
          let score = 0;

          wishlistProducts.forEach(
            (wishlisted) => {
              if (
                product.category ===
                wishlisted.category
              ) {
                score += 0.5;
              }

              if (
                product.brand &&
                wishlisted.brand &&
                product.brand.toLowerCase() ===
                  wishlisted.brand.toLowerCase()
              ) {
                score += 0.2;
              }

              score +=
                priceSimilarity(
                  product.price,
                  wishlisted.price,
                ) * 0.3;
            },
          );

          return {
            product,
            score:
              score /
              Math.max(
                wishlistProducts.length,
                1,
              ),
          };
        })
        .sort(
          (a, b) =>
            b.score - a.score,
        );

    return candidates
      .slice(0, context.limit)
      .map(
        ({ product, score }) =>
          createCandidate(
            product,
            score,
            "From your wishlist",
          ),
      );
  }

  private cartBased(
    context: RecommendationProviderContext,
  ): RecommendationCandidate[] {
    if (
      context.cartProductIds.length ===
      0
    ) {
      return [];
    }

    const cartProducts =
      getProductsByIds(
        context.products,
        context.cartProductIds,
      );

    const candidates =
      context.products
        .filter(
          (product) =>
            !context.cartProductIds.includes(
              product.id,
            ) &&
            product.id !==
              context.currentProduct?.id,
        )
        .map((product) => {
          let score = 0;

          cartProducts.forEach(
            (cartProduct) => {
              if (
                product.category ===
                cartProduct.category
              ) {
                score += 0.5;
              }

              score +=
                priceSimilarity(
                  product.price,
                  cartProduct.price,
                ) * 0.25;

              score +=
                normalize(
                  product.rating,
                  1,
                  5,
                ) * 0.25;
            },
          );

          return {
            product,
            score:
              score /
              Math.max(
                cartProducts.length,
                1,
              ),
          };
        })
        .sort(
          (a, b) =>
            b.score - a.score,
        );

    return candidates
      .slice(0, context.limit)
      .map(
        ({ product, score }) =>
          createCandidate(
            product,
            score,
            "Based on your cart",
          ),
      );
  }

  private frequentlyBoughtTogether(
    context: RecommendationProviderContext,
  ): RecommendationCandidate[] {
    const seedProduct =
      context.currentProduct;

    if (!seedProduct) {
      return [];
    }

    const pairCounts =
      new Map<number, number>();

    context.orders.forEach(
      (order) => {
        const hasSeed =
          order.items.some(
            (item) =>
              item.product.id ===
              seedProduct.id,
          );

        if (!hasSeed) {
          return;
        }

        order.items.forEach(
          (item) => {
            if (
              item.product.id ===
              seedProduct.id
            ) {
              return;
            }

            pairCounts.set(
              item.product.id,
              (pairCounts.get(
                item.product.id,
              ) ?? 0) +
                item.quantity,
            );
          },
        );
      },
    );

    const candidates =
      context.products
        .filter(
          (product) =>
            product.id !==
              seedProduct.id &&
            pairCounts.has(
              product.id,
            ),
        )
        .sort(
          (a, b) =>
            (pairCounts.get(
              b.id,
            ) ?? 0) -
            (pairCounts.get(
              a.id,
            ) ?? 0),
        );

    return candidates
      .slice(0, context.limit)
      .map((product) => {
        const count =
          pairCounts.get(
            product.id,
          ) ?? 0;

        return createCandidate(
          product,
          Math.min(
            count / 10,
            1,
          ),
          "Frequently bought together",
        );
      });
  }

  private trending(
    context: RecommendationProviderContext,
  ): RecommendationCandidate[] {
    const candidates =
      context.products
        .filter(
          (product) =>
            product.id !==
              context.currentProduct?.id &&
            product.stock > 0,
        )
        .map((product) => {
          const ratingScore =
            normalize(
              product.rating,
              1,
              5,
            );

          const discountScore =
            normalize(
              product.discountPercentage,
              0,
              50,
            );

          const stockSignal =
            product.stock > 50
              ? 0.3
              : product.stock > 10
                ? 0.2
                : 0.1;

          const score =
            ratingScore * 0.55 +
            discountScore * 0.25 +
            stockSignal * 0.2;

          return {
            product,
            score,
          };
        })
        .sort(
          (a, b) =>
            b.score - a.score,
        );

    return candidates
      .slice(0, context.limit)
      .map(
        ({ product, score }) =>
          createCandidate(
            product,
            score,
            "Trending products",
          ),
      );
  }

  private personalized(
    context: RecommendationProviderContext,
  ): RecommendationCandidate[] {
    const viewedIds =
      getSignalProductIds(
        context,
        "viewed",
      );

    const wishlistIds =
      getSignalProductIds(
        context,
        "wishlist",
      );

    const cartIds =
      getSignalProductIds(
        context,
        "cart",
      );

    const purchaseIds =
      getSignalProductIds(
        context,
        "purchase",
      );

    const allSignalIds = [
      ...viewedIds,
      ...wishlistIds,
      ...cartIds,
      ...purchaseIds,
    ];

    const signalProducts =
      getProductsByIds(
        context.products,
        allSignalIds,
      );
    if (
      signalProducts.length === 0
    ) {
      return this.trending(
        context,
      );
    }

    const preferredCategories =
      getCategoryFrequency(
        context.products,
        allSignalIds,
      );

    const averagePrice =
      signalProducts.reduce(
        (sum, product) =>
          sum + product.price,
        0,
      ) /
      signalProducts.length;

    const viewedProducts =
      getProductsByIds(
        context.products,
        viewedIds,
      );

    const wishlistProducts =
      getProductsByIds(
        context.products,
        wishlistIds,
      );

    const cartProducts =
      getProductsByIds(
        context.products,
        cartIds,
      );

    const purchaseProducts =
      getProductsByIds(
        context.products,
        purchaseIds,
      );

    const candidates =
      context.products
        .filter(
          (product) =>
            product.id !==
            context.currentProduct?.id,
        )
        .map((product) => {
          let score = 0;

          if (
            preferredCategories.includes(
              product.category,
            )
          ) {
            score += 0.3;
          }

          score +=
            priceSimilarity(
              product.price,
              averagePrice,
            ) * 0.25;

          score +=
            normalize(
              product.rating,
              1,
              5,
            ) * 0.15;

       
          if (
            viewedProducts.length > 0
          ) {
            const bestViewedSimilarity =
              Math.max(
                ...viewedProducts.map(
                  (viewed) => {
                    let value = 0;

                    if (
                      product.category ===
                      viewed.category
                    ) {
                      value += 0.5;
                    }

                    value +=
                      priceSimilarity(
                        product.price,
                        viewed.price,
                      ) * 0.5;

                    return value;
                  },
                ),
              );

            score +=
              clamp(
                bestViewedSimilarity,
                0,
                1,
              ) * 0.15;
          }

          if (
            wishlistProducts.length > 0 &&
            wishlistProducts.some(
              (wishlistProduct) =>
                wishlistProduct.category ===
                product.category,
            )
          ) {
            score += 0.05;
          }

          if (
            cartProducts.length > 0 &&
            cartProducts.some(
              (cartProduct) =>
                cartProduct.category ===
                product.category,
            )
          ) {
            score += 0.05;
          }

          if (
            purchaseProducts.length > 0 &&
            purchaseProducts.some(
              (purchaseProduct) =>
                purchaseProduct.category ===
                product.category,
            )
          ) {
            score += 0.05;
          }

          return {
            product,
            score,
          };
        })
        .sort(
          (a, b) =>
            b.score - a.score,
        );

    return candidates
      .slice(0, context.limit)
      .map(
        ({ product, score }) =>
          createCandidate(
            product,
            score,
            "Recommended for you",
          ),
      );
  }
}


export const mockRecommendationProvider =
  new MockRecommendationProvider();