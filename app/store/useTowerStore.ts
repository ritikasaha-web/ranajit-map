import { create } from "zustand";

type TowerStore = {
  selectedTowerId: string | null;
  setSelectedTowerId: (id: string | null) => void;
};
type ExpandTowerStore = {
  openExpandTower: boolean;
  setOpenExpandTower: (value: boolean) => void;
};

export const useTowerStore = create<TowerStore>((set) => ({
  selectedTowerId: null,
  setSelectedTowerId: (id) => set({ selectedTowerId: id }),
}));
export const useExpandTowerStore = create<ExpandTowerStore>((set) => ({
  openExpandTower: false,
  setOpenExpandTower: (value) => set({ openExpandTower: value }),
}));
