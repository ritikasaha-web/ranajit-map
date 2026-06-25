import { create } from "zustand";

type TowerStore = {
  selectedTowerId: string | null;
  setSelectedTowerId: (id: string | null) => void;
  activeSiteFilter: string;
  setActiveSiteFilter: (filter: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
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
  activeSiteFilter: "all",
  setActiveSiteFilter: (filter) => set({ activeSiteFilter: filter }),
  isSidebarOpen: false,
  setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),
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
