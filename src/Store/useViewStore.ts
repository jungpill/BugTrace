import { create } from 'zustand';

type PageType = "MAIN" | "DETAIL" | "SETTINGS";

interface ViewState {
  currentPage: PageType;
  selectedError: any | null; // 상세 페이지에 표시할 데이터
  // Actions
  goToMain: () => void;
  goToDetail: (errorData: any) => void;
  goToSettings: () => void;
}

export const useViewStore = create<ViewState>((set) => ({
  currentPage: "MAIN",
  selectedError: null,
  
  goToMain: () => set({ currentPage: "MAIN", selectedError: null }),
  
  goToDetail: (data) => set({ currentPage: "DETAIL", selectedError: data }),
  
  goToSettings: () => set({ currentPage: "SETTINGS" }),
}));