import { create } from "zustand";

type TowerStore = {
  selectedTowerId: string | null;
  setSelectedTowerId: (id: string | null) => void;
};
type ExpandTowerStore = {
  openExpandTower: boolean;
  setOpenExpandTower: (value: boolean) => void;
};

interface SitePhotosStore {
  isSitePhotosOpen: boolean;
  setSitePhotosOpen: (val: boolean) => void;
}
interface UploadStore {
  isUploadOpen: boolean;
  setUploadOpen: (isOpen: boolean) => void;
}

export const useTowerStore = create<TowerStore>((set) => ({
  selectedTowerId: null,
  setSelectedTowerId: (id) => set({ selectedTowerId: id }),
}));
export const useExpandTowerStore = create<ExpandTowerStore>((set) => ({
  openExpandTower: false,
  setOpenExpandTower: (value) => set({ openExpandTower: value }),
}));

export const useSitePhotosStore = create<SitePhotosStore>((set) => ({
  isSitePhotosOpen: false,
  setSitePhotosOpen: (val) => set({ isSitePhotosOpen: val }),
}));

export const useUploadStore = create<UploadStore>((set) => ({
  isUploadOpen: false,
  setUploadOpen: (isOpen) => set({ isUploadOpen: isOpen }),
}));
