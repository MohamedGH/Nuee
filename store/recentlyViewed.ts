import { create } from "zustand";
import { persist } from "zustand/middleware";

type RecentlyViewedState = {
  ids: string[];
  add: (productId: string) => void;
};

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (productId) =>
        set((state) => ({
          ids: [productId, ...state.ids.filter((id) => id !== productId)].slice(0, 8),
        })),
    }),
    { name: "nuee-recently-viewed" }
  )
);
