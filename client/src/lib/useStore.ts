import { create } from "zustand";

// ==========================
// 📩 Tin nhắn
// ==========================
interface Tinnhan {
  id: number;
  nguoiGuiId: string;
  nguoiNhanId: string;
  noidung: string;
  ngaytao: Date;
}

interface TinnhanStoreState {
  tinnhans: Tinnhan[];
  setTinnhan: (tinnhans: Tinnhan[]) => void;
  addTinnhan: (tinnhan: Tinnhan) => void;
}

export const useTinnhanStore = create<TinnhanStoreState>((set) => ({
  tinnhans: [],
  setTinnhan: (tinnhans) => set({ tinnhans }),
  addTinnhan: (tinnhan) =>
    set((state) => ({
      tinnhans: [...state.tinnhans, tinnhan],
    })),
}));

// ==========================
// 📞 Cuộc gọi
// ==========================
interface CallData {
  roomID: string;
  from: {
    id: string;
    name: string;
    HinhAnh: string;
  };
}

interface CallStoreState {
  active: boolean;
  callData?: CallData;
  setActive: (isActive: boolean) => void;
  setCallData: (data?: CallData) => void;
}

export const CallStore = create<CallStoreState>((set) => ({
  active: false,
  callData: undefined,
  setActive: (isActive) => set({ active: isActive }),
  setCallData: (data) => set({ callData: data }),
}));
