"use client";

import { create } from "zustand";

type CreditsResponse = {
  credits: number;
};

type CreditsStoreState = {
  credits: number | null;
  loading: boolean;
  setCredits: (credits: number | null) => void;
  clearCredits: () => void;
  refreshCredits: (userId: string | null | undefined) => Promise<void>;
};

export const useCreditsStore = create<CreditsStoreState>((set) => ({
  credits: null,
  loading: false,
  setCredits: (credits) => set({ credits }),
  clearCredits: () => set({ credits: null, loading: false }),
  refreshCredits: async (userId) => {
    if (!userId) {
      set({ credits: null, loading: false });
      return;
    }
    set({ loading: true });
    try {
      const res = await fetch("/api/credits", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) {
          set({ credits: null, loading: false });
          return;
        }
        set({ loading: false });
        return;
      }
      const data = (await res.json()) as CreditsResponse;
      set({ credits: data.credits, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
