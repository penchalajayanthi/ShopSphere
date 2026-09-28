import type {
  RecommendationPreferences,
  RecommendationSignal,
} from "../types/recommendation";

import { storage } from "./storage";

const SIGNALS_KEY = "shopsphere_recommendation_signals";
const PREFERENCES_KEY = "shopsphere_recommendation_preferences";

export const recommendationStorage = {
  // ==========================================
  // RECOMMENDATION SIGNALS
  // ==========================================

  getSignals(): RecommendationSignal[] {
    return storage.get<RecommendationSignal[]>(
      SIGNALS_KEY,
      [],
    );
  },

  getUserSignals(userId: number): RecommendationSignal[] {
    return recommendationStorage
      .getSignals()
      .filter((signal) => signal.userId === userId);
  },

  addSignal(signal: RecommendationSignal): void {
    const signals = recommendationStorage.getSignals();

    storage.set(SIGNALS_KEY, [
      signal,
      ...signals,
    ]);
  },

  removeSignal(signalId: string): void {
    const signals = recommendationStorage.getSignals();

    const updatedSignals = signals.filter(
      (signal) => signal.id !== signalId,
    );

    storage.set(SIGNALS_KEY, updatedSignals);
  },

  clearUserSignals(userId: number): void {
    const signals = recommendationStorage.getSignals();

    const updatedSignals = signals.filter(
      (signal) => signal.userId !== userId,
    );

    storage.set(SIGNALS_KEY, updatedSignals);
  },

  // ==========================================
  // RECOMMENDATION PREFERENCES
  // ==========================================

  getPreferences(
    userId: number,
  ): RecommendationPreferences {
    const preferences =
      storage.get<RecommendationPreferences[]>(
        PREFERENCES_KEY,
        [],
      );

    const existingPreference = preferences.find(
      (preference) => preference.userId === userId,
    );

    if (existingPreference) {
      return existingPreference;
    }

    // Default preferences for a new user
    return {
      userId,
      mode: "personalized",
      useBrowsingHistory: true,
      useWishlist: true,
      useCart: true,
      usePurchaseHistory: true,
      updatedAt: new Date().toISOString(),
    };
  },

  savePreferences(
    updatedPreference: RecommendationPreferences,
  ): void {
    const preferences =
      storage.get<RecommendationPreferences[]>(
        PREFERENCES_KEY,
        [],
      );

    const existingIndex = preferences.findIndex(
      (preference) =>
        preference.userId === updatedPreference.userId,
    );

    // New preference record
    if (existingIndex === -1) {
      storage.set(PREFERENCES_KEY, [
        updatedPreference,
        ...preferences,
      ]);

      return;
    }

    // Update existing preference record
    const updatedPreferences = [...preferences];

    updatedPreferences[existingIndex] = {
      ...updatedPreference,
      updatedAt: new Date().toISOString(),
    };

    storage.set(
      PREFERENCES_KEY,
      updatedPreferences,
    );
  },

  resetPreferences(userId: number): void {
    const preferences =
      storage.get<RecommendationPreferences[]>(
        PREFERENCES_KEY,
        [],
      );

    const updatedPreferences = preferences.filter(
      (preference) => preference.userId !== userId,
    );

    storage.set(
      PREFERENCES_KEY,
      updatedPreferences,
    );
  },

  // ==========================================
  // RESET EVERYTHING FOR ONE USER
  // ==========================================

  resetUserPersonalization(userId: number): void {
    recommendationStorage.clearUserSignals(userId);
    recommendationStorage.resetPreferences(userId);
  },
};