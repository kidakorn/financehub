'use client';

import { useState, useMemo, useTransition } from 'react';
import { useApp, useDeleteCar, useSetLang, useDict, AppProvider } from '@/store/useAppStore';
import { getCarStats } from '@/lib/calculateLoan';
import { formatTHB } from '@/lib/formatters';
import type { Car, Lang, Dictionary } from '@/types/index';
import VehicleModal from '@/components/AddCarModal';
import BillingView from '@/components/BillingView';
import { ToastProvider, useToast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { logout } from '@/actions/auth';
import { addCarAction, deleteCarAction, togglePaidAction } from '@/actions/carActions';

import DashboardOverview from '@/components/DashboardOverview';
import PaymentsTab from '@/components/PaymentsTab';
import ReportsTab from '@/components/ReportsTab';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Sheet, SheetContent } from '@/components/ui/sheet';

/* ─── Header ─────────────────────────────────────────────────────────────── */

type TabID = 'dashboard' | 'payments' | 'fleet' | 'reports';

function Header({ lang, setLang, userName, dict, activeTab, setActiveTab }: { lang: Lang; setLang: (l: Lang) => void; userName?: string | null; dict: Dictionary, activeTab: TabID, setActiveTab: (t: TabID) => void }) {
  const [loggingOut, startLogout] = useTransition();
  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="main-container px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-blue-600">
            <path d="M5 15l2-8h10l2 8v4h-2v-2H7v2H5v-4zm2-6l-1 4h12l-1-4H7zm2 6a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" fill="currentColor" />
          </svg>
          <span className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">DevaDrive</span>
        </div>

        {/* Nav — md+ */}
        <nav className="hidden md:flex items-center gap-6 h-full">
          {(['dashboard', 'payments', 'fleet', 'reports'] as TabID[]).map((tab) => {
            const isActive = activeTab === tab;
            let label = '';
            if (tab === 'dashboard') label = dict.navDashboard;
            if (tab === 'payments') label = dict.navPayments;
            if (tab === 'fleet') label = dict.navFleet;
            if (tab === 'reports') label = dict.navReports;
            
            return (
              <span 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm h-full flex items-center cursor-pointer transition-colors border-b-2 ${
                  isActive 
                    ? 'font-bold text-gray-900 border-blue-600' 
                    : 'font-medium text-gray-500 border-transparent hover:text-gray-900'
                }`}
              >
                {label}
              </span>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
            className="text-xs font-bold uppercase text-gray-500 hover:text-gray-900 px-2 py-1 rounded transition-colors"
          >
            {lang === 'th' ? 'EN' : 'TH'}
          </button>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none">{userName ?? 'User'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{dict.roleFleetManager}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <button
              onClick={() => startLogout(() => { logout(); })}
              disabled={loggingOut}
              title="Sign out"
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <nav className="md:hidden flex items-center overflow-x-auto px-4 h-12 border-t border-gray-100 gap-6 bg-white hide-scrollbar">
        {(['dashboard', 'payments', 'fleet', 'reports'] as TabID[]).map((tab) => {
          const isActive = activeTab === tab;
          let label = '';
          if (tab === 'dashboard') label = dict.navDashboard;
          if (tab === 'payments') label = dict.navPayments;
          if (tab === 'fleet') label = dict.navFleet;
          if (tab === 'reports') label = dict.navReports;
          
          return (
            <span 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm h-full flex items-center cursor-pointer transition-colors border-b-2 flex-shrink-0 whitespace-nowrap ${
                isActive 
                  ? 'font-bold text-gray-900 border-blue-600' 
                  : 'font-medium text-gray-500 border-transparent hover:text-gray-900'
              }`}
            >
              {label}
            </span>
          );
        })}
      </nav>
    </header>
  );
}

/* ─── Vehicle Icon ───────────────────────────────────────────────────────── */

function VehicleIcon({ type }: { type: 'car' | 'motorcycle' }) {
  if (type === 'motorcycle') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
      <circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6a3.5 3.5 0 1 0-7 0" /><path d="M12 17.5V14l-3-3 4-3 2 3h2" />
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400">
      <path d="M5 15l2-8h10l2 8v4h-2v-2H7v2H5v-4zm2-6l-1 4h12l-1-4H7z" fill="currentColor" />
    </svg>
  );
}

/* ─── Delete icon ────────────────────────────────────────────────────────── */
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

/* ─── Dashboard List ─────────────────────────────────────────────────────── */

function DashboardList({
  onAddVehicle,
  onEditVehicle,
  onViewBilling,
}: {
  onAddVehicle: () => void;
  onEditVehicle: (car: Car) => void;
  onViewBilling: (id: string) => void;
}) {
  const { state } = useApp();
  const dict = useDict();
  const { toast } = useToast();
  const cars = state.cars;
  const lang = state.lang;
  const isTh = lang === 'th';

  /* Confirm dialog state */
  const [confirm, setConfirm] = useState<{ open: boolean; carId: string | null }>({ open: false, carId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const openDelete = (id: string) => setConfirm({ open: true, carId: id });
  const closeDelete = () => {
    if (isDeleting) return;
    setConfirm({ open: false, carId: null });
  };
  
  const handleConfirmDelete = () => {
    if (confirm.carId) {
      setIsDeleting(true);
      const submitData = async () => {
        try {
          await deleteCarAction(confirm.carId!);
          toast(dict.toastDeleted, 'info');
          setConfirm({ open: false, carId: null });
        } catch (e) {
          toast('Error deleting', 'error');
        } finally {
          setIsDeleting(false);
        }
      };
      submitData();
    } else {
      closeDelete();
    }
  };

  const handleExport = () => {
    const header = isTh
      ? 'ชื่อยานพาหนะ,ประเภท,ราคา,เงินดาวน์,ดอกเบี้ยรายปี(%),จำนวนงวด,ยอดผ่อนต่อเดือน,เริ่มสัญญา\n'
      : 'Vehicle Name,Type,Price,Down Payment,Annual Rate (%),Term (Months),Monthly Payment,Start Date\n';
    const rows = cars.map(c =>
      `"${c.name}","${c.vehicleType}",${c.price},${c.downPayment},${c.annualRate},${c.termMonths},${c.monthlyAmt},${c.startDate}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'fleet-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(dict.toastExported, 'success');
  };

  return (
    <div className="anim-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {dict.dashboardTitle}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {dict.dashboardDesc}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={onAddVehicle} size="sm">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="mr-1.5"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            {dict.btnAddCar}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            {dict.exportCSV}
          </Button>
        </div>
      </div>

      {/* Summary widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 sm:p-5">
          <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{dict.widgetTotalDebt}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 tabular-nums">฿{formatTHB(cars.reduce((s, c) => s + getCarStats(c).remaining, 0))}</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 sm:p-5">
          <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{dict.widgetMonthlyOutflow}</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-600 tabular-nums">฿{formatTHB(cars.reduce((s, c) => s + c.monthlyAmt, 0))}</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 sm:p-5 col-span-2 sm:col-span-1">
          <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{dict.widgetTotalVehicles}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">
            {cars.length} <span className="text-sm font-medium text-gray-500">{cars.length === 1 ? dict.unitVehicle : dict.unitVehicles}</span>
          </p>
        </div>
      </div>

      {/* ── MOBILE: Cards ── */}
      {cars.length === 0 ? (
        <div className="block sm:hidden bg-white border border-gray-200 rounded-xl py-14 text-center shadow-sm mb-4">
          <p className="text-gray-400 text-sm">{dict.noCarsTitle}</p>
          <Button onClick={onAddVehicle} className="mt-4" size="sm">{dict.addFirstCar}</Button>
        </div>
      ) : (
        <div className="block sm:hidden space-y-3 mb-4">
          {cars.map(car => {
            const stats = getCarStats(car);
            const isPaidOff = stats.remaining === 0;
            const endDate = new Date(car.startDate);
            endDate.setMonth(endDate.getMonth() + car.termMonths);
            const endDateStr = endDate.toLocaleDateString(isTh ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short' });

            return (
              <div key={car.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-10 h-8 bg-gray-50 rounded flex items-center justify-center border border-gray-200 flex-shrink-0">
                      <VehicleIcon type={car.vehicleType} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{car.name}</p>
                      <p className="text-xs text-gray-500">
                        {isTh ? (car.vehicleType === 'motorcycle' ? 'มอเตอร์ไซค์' : 'รถยนต์') : (car.vehicleType === 'motorcycle' ? 'Motorcycle' : 'Car')}
                        {' · '}{car.termMonths} {dict.unitMonths} · {car.annualRate}%
                      </p>
                    </div>
                  </div>
                  {isPaidOff
                    ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex-shrink-0">{dict.badgePaid}</Badge>
                    : <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex-shrink-0">{dict.badgePending}</Badge>
                  }
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{dict.statMonthly}</p>
                    <p className="text-sm font-bold text-gray-900 tabular-nums">฿{formatTHB(car.monthlyAmt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{dict.statPaid}</p>
                    <p className="text-sm font-semibold text-gray-600 tabular-nums">฿{formatTHB(stats.totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{dict.colDueDate}</p>
                    <p className="text-sm text-gray-600">{endDateStr}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => onViewBilling(car.id)}>
                    {dict.btnViewBilling}
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onEditVehicle(car)}>
                    <EditIcon />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => openDelete(car.id)}>
                    <TrashIcon />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DESKTOP: Table ── */}
      <div className="hidden sm:block border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.colVehicle}</TableHead>
              <TableHead>{dict.colType}</TableHead>
              <TableHead>{dict.colMonthly}</TableHead>
              <TableHead>{dict.colStatus}</TableHead>
              <TableHead className="hidden lg:table-cell">{dict.colEndDate}</TableHead>
              <TableHead className="hidden lg:table-cell">{dict.colTotalPaid}</TableHead>
              <TableHead className="text-right">{dict.colActions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-14 text-gray-400">
                  {dict.noCarsTitle}
                </TableCell>
              </TableRow>
            )}
            {cars.map(car => {
              const stats = getCarStats(car);
              const isPaidOff = stats.remaining === 0;
              const endDate = new Date(car.startDate);
              endDate.setMonth(endDate.getMonth() + car.termMonths);
              const endDateStr = endDate.toLocaleDateString(isTh ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

              return (
                <TableRow key={car.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-8 bg-gray-50 rounded flex items-center justify-center border border-gray-200 flex-shrink-0">
                        <VehicleIcon type={car.vehicleType} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{car.name}</p>
                        <p className="text-xs text-gray-500">{car.termMonths} {dict.unitMonths} · {car.annualRate}%</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {car.vehicleType === 'motorcycle'
                        ? (isTh ? 'มอเตอร์ไซค์' : 'Motorcycle')
                        : (isTh ? 'รถยนต์' : 'Car')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-gray-900 tabular-nums">฿{formatTHB(car.monthlyAmt)}</span>
                  </TableCell>
                  <TableCell>
                    {isPaidOff
                      ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{dict.badgePaid}</Badge>
                      : <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{dict.badgePending}</Badge>
                    }
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-gray-600">{endDateStr}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="font-semibold text-gray-600 tabular-nums">฿{formatTHB(stats.totalPaid)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => onViewBilling(car.id)}>
                        {dict.btnViewBilling}
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onEditVehicle(car)}>
                        <EditIcon />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => openDelete(car.id)}>
                        <TrashIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Animated Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirm.open}
        title={dict.btnDeleteCar}
        message={dict.confirmDelete}
        confirmLabel={dict.btnDeleteCar}
        cancelLabel={dict.btnCancel}
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={closeDelete}
      />
    </div>
  );
}

/* ─── Main App ───────────────────────────────────────────────────────────── */

function AppInner() {
  const { state } = useApp();
  const setLang = useSetLang();
  const dict = useDict();
  const { toast } = useToast();
  const deleteCar = useDeleteCar();

  const [activeTab, setActiveTab] = useState<TabID>('dashboard');
  const [modal, setModal] = useState(false);
  const [editCar, setEditCar] = useState<Car | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedCar = useMemo(() => {
    if (!selectedCarId) return null;
    return state.cars.find(c => c.id === selectedCarId) ?? null;
  }, [state.cars, selectedCarId]);

  const openAdd = () => { setEditCar(null); setModal(true); };
  const openEdit = (car: Car) => { setEditCar(car); setModal(true); };
  const closeModal = () => setModal(false);

  const handleSaved = (mode: 'add' | 'edit') => {
    toast(mode === 'add' ? dict.toastAdded : dict.toastUpdated, 'success');
  };

  return (
    <div className={`w-full flex flex-col font-sans ${state.lang === 'th' ? 'lang-th' : 'lang-en'} min-h-screen bg-gray-100`}>
      <Header lang={state.lang} setLang={setLang} userName={state.userName} dict={dict} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-container w-full px-3 sm:px-6 py-6 sm:py-8 flex-1">
        {activeTab === 'dashboard' && (
          <DashboardOverview cars={state.cars} dict={dict} lang={state.lang} />
        )}
        {activeTab === 'payments' && (
          <PaymentsTab cars={state.cars} dict={dict} lang={state.lang} />
        )}
        {activeTab === 'reports' && (
          <ReportsTab cars={state.cars} dict={dict} lang={state.lang} />
        )}
        
        {/* We keep the Fleet tab rendering if it's the active tab OR if a car is selected so the slide-over works cleanly */}
        <div style={{ display: activeTab === 'fleet' ? 'block' : 'none' }}>
          <DashboardList
            onAddVehicle={openAdd}
            onEditVehicle={openEdit}
            onViewBilling={setSelectedCarId}
          />
        </div>

        {/* Slide-over detail panel (used across tabs if we select a car) */}
        <Sheet open={!!selectedCar} onOpenChange={(open) => { if (!open) setSelectedCarId(null); }}>
          <SheetContent className="w-full overflow-y-auto p-0" style={{ maxWidth: '42rem' }}>
            {selectedCar && (
              <div className="p-4 sm:p-6 h-full">
                <BillingView
                  car={selectedCar}
                  lang={state.lang}
                  dict={dict}
                  onBack={() => setSelectedCarId(null)}
                />
              </div>
            )}
          </SheetContent>
        </Sheet>
      </main>

      {/* Add / Edit modal */}
      <VehicleModal
        isOpen={modal}
        onClose={closeModal}
        dict={dict}
        lang={state.lang}
        editCar={editCar}
        onSaved={handleSaved}
      />
    </div>
  );
}

export default function DashboardClient({ initialCars, userName }: { initialCars: Car[], userName?: string | null }) {
  return (
    <AppProvider initialCars={initialCars} userName={userName}>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AppProvider>
  );
}
