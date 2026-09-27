import type { Review } from "../types/review";
import { storage } from "./storage";

const REVIEWS_KEY = "shopsphere_reviews";

export const reviewStorage = {
  getAll(): Review[] {
    return storage.get<Review[]>(REVIEWS_KEY, []);
  },

  getByProduct(productId: number): Review[] {
    return reviewStorage
      .getAll()
      .filter((review) => review.productId === productId);
  },

  add(review: Review): void {
    const reviews = reviewStorage.getAll();

    storage.set(REVIEWS_KEY, [
      review,
      ...reviews,
    ]);
  },

  remove(reviewId: string): void {
    const reviews = reviewStorage.getAll();

    storage.set(
      REVIEWS_KEY,
      reviews.filter((review) => review.id !== reviewId),
    );
  },
};