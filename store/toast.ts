import { create } from "zustand";

type Toast = {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastState = {
  toast: Toast | null;
  show: (message: string, action?: { label: string; onClick: () => void }) => void;
  dismiss: () => void;
};

let nextId = 0;

export const useToast = create<ToastState>((set) => ({
  toast: null,
  show: (message, action) =>
    set({
      toast: {
        id: ++nextId,
        message,
        actionLabel: action?.label,
        onAction: action?.onClick,
      },
    }),
  dismiss: () => set({ toast: null }),
}));
