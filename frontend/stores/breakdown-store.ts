import { create } from 'zustand';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface BreakdownFormData {
  title: string;
  description?: string;
  breakdownType?: string;
  location: Location | null;
  vehicleId?: string;
  garageId?: string;
  photos: string[];
}

interface BreakdownState {
  // Form data for creating breakdown
  formData: BreakdownFormData;
  currentStep: number;
  
  // Selected garage for breakdown
  selectedGarage: any | null;
  
  // Active breakdown tracking
  activeBreakdown: any | null;
  mechanicLocation: Location | null;
  
  // Actions
  setFormData: (data: Partial<BreakdownFormData>) => void;
  setCurrentStep: (step: number) => void;
  setSelectedGarage: (garage: any | null) => void;
  setActiveBreakdown: (breakdown: any | null) => void;
  setMechanicLocation: (location: Location | null) => void;
  resetForm: () => void;
}

const initialFormData: BreakdownFormData = {
  title: '',
  description: '',
  breakdownType: '',
  location: null,
  vehicleId: undefined,
  garageId: undefined,
  photos: [],
};

export const useBreakdownStore = create<BreakdownState>((set) => ({
  formData: initialFormData,
  currentStep: 0,
  selectedGarage: null,
  activeBreakdown: null,
  mechanicLocation: null,

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setCurrentStep: (step) => set({ currentStep: step }),

  setSelectedGarage: (garage) =>
    set((state) => ({
      selectedGarage: garage,
      formData: { ...state.formData, garageId: garage?.id },
    })),

  setActiveBreakdown: (breakdown) => set({ activeBreakdown: breakdown }),

  setMechanicLocation: (location) => set({ mechanicLocation: location }),

  resetForm: () =>
    set({
      formData: initialFormData,
      currentStep: 0,
      selectedGarage: null,
    }),
}));
