import { create } from 'zustand';

type PageType = "MAIN" | "DETAIL" | "SETTINGS";

interface ViewState {
  currentPage: PageType;
  setCurrentPage: (page:PageType) => void
  selectedError: any | null; // 상세 페이지에 표시할 데이터
  // Actions
  goToMain: () => void;
  goToDetail: (errorData: any) => void;
  goToSettings: () => void;
}

export const useViewStore = create<ViewState>((set) => ({
  currentPage: "MAIN",
  selectedError: null,
  setCurrentPage: (page) => set({currentPage:page}),
  goToMain: () => set({ currentPage: "MAIN", selectedError: null }),
  
  goToDetail: (data) => set({ currentPage: "DETAIL", selectedError: data }),
  
  goToSettings: () => set({ currentPage: "SETTINGS" }),
}));