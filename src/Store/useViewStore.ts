import { create } from 'zustand';
import type { ErrorRecord } from '../type/types';

type PageType = "MAIN" | "DETAIL" | "SETTINGS";

interface ViewState {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  records: ErrorRecord[]; // 전체 에러 리스트 저장용
  selectedRecord: ErrorRecord | null; // 상세 페이지용 데이터
  
  // Actions
  goToMain: () => void;
  goToSettings: () => void;
  goToDetail: () => void;
  
  // 에러 로그 관련 액션
  fetchRecords: () => Promise<void>;
}

export const useViewStore = create<ViewState>((set) => ({
  currentPage: "MAIN",
  setCurrentPage: (page) => set({ currentPage: page }),
  records: [],
  selectedRecord: null,

  goToMain: () => set({ currentPage: "MAIN", selectedRecord: null }),
  goToSettings: () => set({ currentPage: "SETTINGS" }),
  goToDetail: () => set({currentPage: 'DETAIL'}),

  fetchRecords: async () => {
    chrome.runtime.sendMessage({ type: "GET_RECORDS" }, (response) => {
      if (response?.ok) {
        set({ records: response.records });
      }
    });
  },

}));