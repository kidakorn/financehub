'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppAction, Car, Lang } from '@/types/index';
import { DICT } from '@/i18n/dictionary';

import { buildCar } from '@/lib/calculateLoan';

const mockCar1 = buildCar({
  vehicleType: 'car',
  name: 'Tesla Model 3',
  price: '1800000',
  downPayment: '300000',
  annualRate: '2.5',
  termMonths: '48',
  startDate: new Date().toISOString().split('T')[0]
});
const mockCar2 = buildCar({
  vehicleType: 'car',
  name: 'Honda Civic RS',
  price: '1200000',
  downPayment: '200000',
  annualRate: '3.0',
  termMonths: '60',
  startDate: new Date().toISOString().split('T')[0]
});
const mockMoto = buildCar({
  vehicleType: 'motorcycle',
  name: 'Yamaha XMAX 300',
  price: '189900',
  downPayment: '0',
  annualRate: '4.5',
  termMonths: '36',
  startDate: new Date().toISOString().split('T')[0]
});

// mark some installments as paid
if (mockCar1) {
  mockCar1.schedule[0].isPaid = true;
  mockCar1.schedule[1].isPaid = true;
}
if (mockCar2) {
  mockCar2.schedule[0].isPaid = true;
}
if (mockMoto) {
  mockMoto.schedule[0].isPaid = true;
  mockMoto.schedule[1].isPaid = true;
  mockMoto.schedule[2].isPaid = true;
}

/* ─── Initial State ─────────────────────────────────────────────────────────── */
const INITIAL_STATE: AppState = {
  cars: [],
  lang: 'th',
};

const STORAGE_KEY = 'devadrive-v1';

/* ─── Reducer ───────────────────────────────────────────────────────────────── */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_CAR':
      return { ...state, cars: [...state.cars, action.payload] };

    case 'DELETE_CAR':
      return { ...state, cars: state.cars.filter((c) => c.id !== action.carId) };

    case 'TOGGLE_PAID':
      return {
        ...state,
        cars: state.cars.map((car) =>
          car.id !== action.carId
            ? car
            : {
                ...car,
                schedule: car.schedule.map((inst) =>
                  inst.id === action.installmentId
                    ? { ...inst, isPaid: !inst.isPaid }
                    : inst
                ),
              }
        ),
      };

    case 'SET_LANG':
      return { ...state, lang: action.lang };

    case 'HYDRATE_STATE':
      return action.payload;

    default:
      return state;
  }
}

/* ─── Context ───────────────────────────────────────────────────────────────── */
interface AppContextValue {
  state:    AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

/* ─── Provider ──────────────────────────────────────────────────────────────── */
export function AppProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);

  useEffect(() => {
    setIsMounted(true);
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.cars)) {
          dispatch({ type: 'HYDRATE_STATE', payload: parsed });
          return;
        }
      }
    } catch {
      // ignore
    }

    // Fallback UI Stress Test Mock Injection
    const mockState: AppState = {
      cars: [mockCar1!, mockCar2!, mockMoto!].filter(Boolean),
      lang: 'th',
    };
    dispatch({ type: 'HYDRATE_STATE', payload: mockState });
  }, []);

  // Save changes to localStorage after mounting
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota exceeded — ignore */
    }
  }, [state, isMounted]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

/* ─── Hooks ─────────────────────────────────────────────────────────────────── */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}

export function useDict() {
  const { state } = useApp();
  return DICT[state.lang];
}

export function useAddCar() {
  const { dispatch } = useApp();
  return (car: Car) => dispatch({ type: 'ADD_CAR', payload: car });
}

export function useDeleteCar() {
  const { dispatch } = useApp();
  return (carId: string) => dispatch({ type: 'DELETE_CAR', carId });
}

export function useTogglePaid() {
  const { dispatch } = useApp();
  return (carId: string, installmentId: string) =>
    dispatch({ type: 'TOGGLE_PAID', carId, installmentId });
}

export function useSetLang() {
  const { dispatch } = useApp();
  return (lang: Lang) => dispatch({ type: 'SET_LANG', lang });
}
