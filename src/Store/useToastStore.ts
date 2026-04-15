import { create } from "zustand";

interface ToastState {
    type: "success" | "error" | null;
    message: string;
    showToast: (type: "success" | "error", message: string) => void;
    clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    type: null,
    message: "",
    showToast: (type, message) => set({ type, message }),
    clear: () => set({ type: null, message: "" }),
}));