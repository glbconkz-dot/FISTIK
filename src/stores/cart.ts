'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
  getItemQuantity: (productId: string) => number;
}

function clampQuantity(item: CartItem, quantity: number): number {
  const max = item.stockMax ?? 9999;
  return Math.min(max, Math.max(0, quantity));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        if (quantity <= 0) return;
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            const nextQty = clampQuantity(
              { ...existing, stockMax: item.stockMax ?? existing.stockMax },
              existing.quantity + quantity
            );
            if (nextQty <= 0) return state;
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? {
                      ...i,
                      quantity: nextQty,
                      stockMax: item.stockMax ?? i.stockMax,
                    }
                  : i
              ),
            };
          }
          const nextQty = clampQuantity(item as CartItem, quantity);
          if (nextQty <= 0) return state;
          return {
            items: [...state.items, { ...item, quantity: nextQty }],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        const existing = get().items.find((i) => i.productId === productId);
        if (!existing) return;
        const clamped = clampQuantity(existing, quantity);
        if (clamped <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: clamped } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemQuantity: (productId) =>
        get().items.find((i) => i.productId === productId)?.quantity ?? 0,
    }),
    { name: 'fistik-cart', version: 2 }
  )
);
