'use client';

import { useState, useMemo } from 'react';
import { useApp, useDeleteCar, useSetLang, useDict, AppProvider } from '@/store/useAppStore';
import { getCarStats } from '@/lib/calculateLoan';
import { formatTHB } from '@/lib/formatters';
import type { Lang } from '@/types/index';
import AddCarModal from '@/components/AddCarModal';
import BillingView from '@/components/BillingView';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sheet, SheetContent } from '@/components/ui/sheet';

/* ─── Layout Components ────────────────────────────────────────────────────── */

function Header({ lang, setLang }: { lang: Lang, setLang: (l: Lang) => void }) {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="main-container px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-600">
            <path d="M5 15l2-8h10l2 8v4h-2v-2H7v2H5v-4zm2-6l-1 4h12l-1-4H7zm2 6a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" fill="currentColor"/>
          </svg>
          <span className="text-lg font-bold text-gray-900 tracking-tight">CarPay</span>
        </div>
        
        {/* Nav (Mock) */}
        <nav className="hidden md:flex items-center gap-6">
          <span className="text-sm font-semibold text-gray-900">Dashboard</span>
          <span className="text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer">Payments</span>
          <span className="text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer">Cars</span>
          <span className="text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer">Reports</span>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
            className="text-xs font-bold uppercase text-gray-500 hover:text-gray-900"
          >
            {lang === 'th' ? 'EN' : 'TH'}
          </button>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none">Devakorn</p>
              <p className="text-xs text-gray-500 mt-1">Admin</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ─── Dashboard List ───────────────────────────────────────────────────────── */

function DashboardList({ 
  onAddCar, 
  onViewBilling 
}: { 
  onAddCar: () => void;
  onViewBilling: (id: string) => void;
}) {
  const { state } = useApp();
  const deleteCar = useDeleteCar();
  const cars = state.cars;
  const lang = state.lang;

  const isTh = lang === 'th';

  const handleExport = () => {
    const header = isTh 
      ? "ชื่อรถ,ราคา,เงินดาวน์,ดอกเบี้ยรายปี(%),จำนวนงวด,ยอดผ่อนต่อเดือน,เริ่มสัญญา\n"
      : "Car Name,Price,Down Payment,Annual Rate (%),Term Months,Monthly Payment,Start Date\n";
    
    const rows = cars.map(c => 
      `"${c.name}",${c.price},${c.downPayment},${c.annualRate},${c.termMonths},${c.monthlyAmt},${c.startDate}`
    ).join('\n');
    
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "car-fleet-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="anim-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isTh ? 'รายการชำระรถยนต์' : 'My Car Fleet Payments'}
        </h1>
        <div className="flex items-center gap-3">
          <Button onClick={onAddCar}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mr-2"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            {isTh ? 'เพิ่มรถใหม่' : 'Add New Car'}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            {isTh ? 'ส่งออก' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Dashboard Overview Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
          <p className="text-sm font-medium text-gray-500 mb-1">{isTh ? 'หนี้สินรวม' : 'Total Fleet Debt'}</p>
          <p className="text-2xl font-bold text-gray-900">฿{formatTHB(cars.reduce((sum, c) => sum + getCarStats(c).remaining, 0))}</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
          <p className="text-sm font-medium text-gray-500 mb-1">{isTh ? 'รายจ่ายต่อเดือน' : 'Total Monthly Outflow'}</p>
          <p className="text-2xl font-bold text-blue-600">฿{formatTHB(cars.reduce((sum, c) => sum + c.monthlyAmt, 0))}</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
          <p className="text-sm font-medium text-gray-500 mb-1">{isTh ? 'จำนวนรถในระบบ' : 'Total Active Cars'}</p>
          <p className="text-2xl font-bold text-gray-900">{cars.length} {isTh ? 'คัน' : 'Cars'}</p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isTh ? 'รุ่นรถยนต์' : 'CAR MODEL'}</TableHead>
              <TableHead>{isTh ? 'ยอดชำระต่อเดือน' : 'MONTHLY PAYMENT'}</TableHead>
              <TableHead>{isTh ? 'สถานะ' : 'STATUS'}</TableHead>
              <TableHead>{isTh ? 'งวดสุดท้าย' : 'LEASE END DATE'}</TableHead>
              <TableHead>{isTh ? 'ชำระแล้วรวม' : 'TOTAL PAID'}</TableHead>
              <TableHead className="text-right">{isTh ? 'จัดการ' : 'ACTIONS'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  {isTh ? 'ยังไม่มีรถยนต์ในระบบ' : 'No cars added yet.'}
                </TableCell>
              </TableRow>
            )}
            {cars.map((car) => {
              const stats = getCarStats(car);
              const isPaidOff = stats.remaining === 0;
              
              const endDate = new Date(car.startDate);
              endDate.setMonth(endDate.getMonth() + car.termMonths);
              const endDateStr = endDate.toLocaleDateString(isTh ? 'th-TH' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <TableRow key={car.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gray-50 rounded flex items-center justify-center border border-gray-200 flex-shrink-0">
                        {car.vehicleType === 'motorcycle' ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <circle cx="5.5" cy="17.5" r="3.5"></circle>
                            <circle cx="18.5" cy="17.5" r="3.5"></circle>
                            <path d="M15 6a3.5 3.5 0 1 0-7 0"></path>
                            <path d="M12 17.5V14l-3-3 4-3 2 3h2"></path>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                            <path d="M5 15l2-8h10l2 8v4h-2v-2H7v2H5v-4zm2-6l-1 4h12l-1-4H7z" fill="currentColor"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{car.name}</p>
                        <p className="text-xs text-gray-500">{car.termMonths} {isTh ? 'เดือน' : 'Months'} • {car.annualRate}%</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-gray-900 text-base">
                      ฿{formatTHB(car.monthlyAmt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {isPaidOff ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{isTh ? 'ชำระครบ' : 'Paid'}</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{isTh ? 'กำลังผ่อน' : 'Pending'}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">{endDateStr}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-gray-600">
                      ฿{formatTHB(stats.totalPaid)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={() => onViewBilling(car.id)}
                      >
                        {isTh ? 'รายละเอียด' : 'View'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          if(window.confirm(isTh ? 'ลบรถคันนี้?' : 'Delete this car?')) deleteCar(car.id);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ─── Main App ─────────────────────────────────────────────────────────────── */

function AppInner() {
  const { state } = useApp();
  const setLang = useSetLang();
  const dict = useDict();
  
  const [modal, setModal] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  const selectedCar = useMemo(() => {
    if (!selectedCarId) return null;
    return state.cars.find(c => c.id === selectedCarId) || null;
  }, [state.cars, selectedCarId]);

  return (
    <div className={`w-full flex flex-col font-sans ${state.lang === 'th' ? 'lang-th' : 'lang-en'} min-h-screen bg-gray-100`}>
      <Header lang={state.lang} setLang={setLang} />
      
      <main className="main-container w-full px-4 sm:px-6 py-8 flex-1">
        <DashboardList 
          onAddCar={() => setModal(true)} 
          onViewBilling={setSelectedCarId} 
        />
        
        {/* Slide-over Panel for Billing Details using Shadcn Sheet */}
        <Sheet open={!!selectedCar} onOpenChange={(open) => { if (!open) setSelectedCarId(null) }}>
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

      <AddCarModal
        isOpen={modal}
        onClose={() => setModal(false)}
        dict={dict}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
