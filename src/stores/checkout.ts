'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { extractKzNationalDigits } from '@/lib/checkout';

export interface SavedCheckoutForm {
  customerName: string;
  phoneNational: string;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryDate: string;
  addressStreet: string;
  buildingNumber: string;
  floorApartment: string;
  addressNotes: string;
  cakeText: string;
  notes: string;
}

const emptyForm: SavedCheckoutForm = {
  customerName: '',
  phoneNational: '',
  deliveryMethod: 'delivery',
  deliveryDate: '',
  addressStreet: '',
  buildingNumber: '',
  floorApartment: '',
  addressNotes: '',
  cakeText: '',
  notes: '',
};

interface CheckoutState {
  form: SavedCheckoutForm;
  updateForm: (data: Partial<SavedCheckoutForm>) => void;
  clearForm: () => void;
}

type LegacyForm = SavedCheckoutForm & {
  phone?: string;
  address?: string;
  deliveryTime?: string;
};

function normalizeForm(raw: Partial<LegacyForm> | undefined): SavedCheckoutForm {
  return {
    customerName: raw?.customerName ?? '',
    phoneNational: extractKzNationalDigits(raw?.phoneNational ?? raw?.phone ?? ''),
    deliveryMethod: raw?.deliveryMethod === 'pickup' ? 'pickup' : 'delivery',
    deliveryDate: raw?.deliveryDate ?? '',
    addressStreet: raw?.addressStreet ?? raw?.address ?? '',
    buildingNumber: raw?.buildingNumber ?? '',
    floorApartment: raw?.floorApartment ?? '',
    addressNotes: raw?.addressNotes ?? '',
    cakeText: raw?.cakeText ?? '',
    notes: raw?.notes ?? '',
  };
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      form: emptyForm,
      updateForm: (data) =>
        set((state) => ({
          form: {
            ...state.form,
            ...data,
            ...(data.phoneNational !== undefined
              ? { phoneNational: extractKzNationalDigits(data.phoneNational) }
              : {}),
          },
        })),
      clearForm: () => set({ form: emptyForm }),
    }),
    {
      name: 'fistik-checkout',
      version: 4,
      migrate: (persisted) => {
        const state = persisted as { form?: LegacyForm } | LegacyForm | undefined;
        const legacy =
          state && typeof state === 'object' && 'form' in state
            ? state.form
            : (state as LegacyForm | undefined);

        return {
          form: normalizeForm(legacy),
        };
      },
    }
  )
);
