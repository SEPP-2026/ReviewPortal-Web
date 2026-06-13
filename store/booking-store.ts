import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface BookingItem {
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  dailyRate: number;
  startDate: string;
  endDate: string;
}

export interface BookingState {
  items: BookingItem[];
  totalDays: number;
  totalAmount: number;
  
  // Actions
  addItem: (item: BookingItem) => void;
  removeItem: (equipmentId: string) => void;
  updateItem: (equipmentId: string, updates: Partial<BookingItem>) => void;
  clearCart: () => void;
  calculateTotal: () => void;
}

export const useBookingStore = create<BookingState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        totalDays: 0,
        totalAmount: 0,

        addItem: (item: BookingItem) =>
          set((state) => {
            const existingItem = state.items.find(
              (i) => i.equipmentId === item.equipmentId
            );
            let updatedItems;

            if (existingItem) {
              updatedItems = state.items.map((i) =>
                i.equipmentId === item.equipmentId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              );
            } else {
              updatedItems = [...state.items, item];
            }

            const newState = { items: updatedItems };
            setTimeout(() => get().calculateTotal(), 0);
            return newState;
          }),

        removeItem: (equipmentId: string) =>
          set((state) => {
            const updatedItems = state.items.filter(
              (i) => i.equipmentId !== equipmentId
            );
            setTimeout(() => get().calculateTotal(), 0);
            return { items: updatedItems };
          }),

        updateItem: (equipmentId: string, updates: Partial<BookingItem>) =>
          set((state) => {
            const updatedItems = state.items.map((i) =>
              i.equipmentId === equipmentId ? { ...i, ...updates } : i
            );
            setTimeout(() => get().calculateTotal(), 0);
            return { items: updatedItems };
          }),

        clearCart: () => {
          set({ items: [], totalDays: 0, totalAmount: 0 });
        },

        calculateTotal: () => {
          const { items } = get();
          let totalAmount = 0;
          let maxDays = 0;

          items.forEach((item) => {
            const start = new Date(item.startDate).getTime();
            const end = new Date(item.endDate).getTime();
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

            totalAmount += item.quantity * item.dailyRate * days;
            maxDays = Math.max(maxDays, days);
          });

          set({ totalAmount, totalDays: maxDays });
        },
      }),
      {
        name: "booking-storage",
        version: 1,
      }
    )
  )
);
