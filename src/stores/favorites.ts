'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  ids: string[];
  toggle: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  count: () => number;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        })),
      isFavorite: (productId) => get().ids.includes(productId),
      count: () => get().ids.length,
    }),
    { name: 'fistik-favorites', version: 1 }
  )
);
