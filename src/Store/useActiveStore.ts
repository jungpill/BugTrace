import { create } from "zustand";

type EnabledHosts = { [key: string]: boolean };

interface ActiveState {
  active: boolean;
  initActive: (host: string) => Promise<void>;
  toggleActive: (host: string) => Promise<void>;
}

export const useActiveStore = create<ActiveState>((set, get) => ({
  active: false,

  initActive: async (host) => {
    const res = await chrome.storage.local.get("enabledHosts");
    // res.enabledHosts를 EnabledHosts 타입으로 단언(Assertion)
    const enabledHosts = (res.enabledHosts as EnabledHosts) || {};
    
    // 이제 host(string)로 안전하게 접근 가능.
    set({ active: !!enabledHosts[host] });
  },

  toggleActive: async (host) => {
    const currentStatus = get().active;
    const nextStatus = !currentStatus;

    const res = await chrome.storage.local.get("enabledHosts");
    const enabledHosts = (res.enabledHosts as EnabledHosts) || {};
    
    // 새로운 설정 객체 생성
    const nextHosts: EnabledHosts = { 
      ...enabledHosts, 
      [host]: nextStatus 
    };
    
    await chrome.storage.local.set({ enabledHosts: nextHosts });
    set({ active: nextStatus });
  }
}));