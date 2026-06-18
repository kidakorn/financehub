'use client';

import { useEffect, useState, useMemo } from 'react';
import { getFinanceData, confirmMonthlyIncome } from '@/actions/financeActions';
import { generateTimeline } from '@/lib/financeUtils';
import type { TimelineEvent } from '@/lib/financeUtils';
import { financeDictEn, financeDictTh } from '@/i18n/financeDict';
import type { FinanceDictionary } from '@/i18n/financeDict';
import { formatTHB } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AddIncomeModal from '@/components/AddIncomeModal';
import AddExpenseModal from '@/components/AddExpenseModal';

export default function FinanceTab({ lang }: { lang: 'th' | 'en' }) {
  const dict: FinanceDictionary = lang === 'th' ? financeDictTh : financeDictEn;
  
  const [data, setData] = useState<{ incomes: any[], expenses: any[], cars: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const [incomeModal, setIncomeModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);

  // Use current month
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getFinanceData(currentMonth);
      setData({ incomes: res.incomeSources, expenses: res.plannedExpenses, cars: res.cars });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const timeline = useMemo(() => {
    if (!data) return [];
    
    // Calculate total installments per car
    const carInstallments = data.cars.flatMap(c => c.schedule.map((s: any) => ({ ...s, car: c })));
    
    return generateTimeline(data.incomes, data.expenses, carInstallments, currentMonth);
  }, [data, currentMonth]);

  const summary = useMemo(() => {
    if (!data) return { totalIncome: 0, totalExpenses: 0, remaining: 0 };
    
    let totalIncome = 0;
    data.incomes.forEach(inc => {
      const actual = inc.actuals?.[0];
      totalIncome += actual ? actual.actualAmount : inc.estimatedAmount;
    });

    let totalExpenses = 0;
    data.expenses.forEach(exp => {
      totalExpenses += exp.amount;
    });
    data.cars.forEach(car => {
      // Sum up installments for this month
      car.schedule.forEach((s: any) => {
        if (s.dueDate.startsWith(currentMonth)) totalExpenses += s.amount;
      });
    });

    return { totalIncome, totalExpenses, remaining: totalIncome - totalExpenses };
  }, [data, currentMonth]);

  const handleConfirmIncome = async (sourceId: string, amount: number) => {
    await confirmMonthlyIncome(sourceId, currentMonth, amount);
    await loadData();
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading...</div>;
  }

  return (
    <>
      <div className="anim-up space-y-6">
        {/* ── SUMMARY HEADER ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{dict.summaryTitle} ({currentMonth})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{dict.totalIncome}</p>
            <p className="text-2xl font-bold text-green-600">฿{formatTHB(summary.totalIncome)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{dict.totalExpenses}</p>
            <p className="text-2xl font-bold text-red-500">฿{formatTHB(summary.totalExpenses)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{dict.remainingBalance}</p>
            <p className={`text-2xl font-bold ${summary.remaining < 0 ? 'text-red-600' : 'text-blue-600'}`}>
              ฿{formatTHB(summary.remaining)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── LEFT COL: Incomes & Expenses ── */}
        <div className="space-y-6">
          
          {/* INCOMES */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{dict.incomeSources}</h3>
              <Button size="sm" onClick={() => setIncomeModal(true)}>{dict.btnAddIncome}</Button>
            </div>
            {data.incomes.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">{dict.noData}</p>
            ) : (
              <div className="space-y-3">
                {data.incomes.map(inc => {
                  const actual = inc.actuals?.[0];
                  const amount = actual ? actual.actualAmount : inc.estimatedAmount;
                  const confirmed = actual ? actual.isConfirmed : false;

                  return (
                    <div key={inc.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{inc.name}</p>
                        <p className="text-xs text-gray-500">Payday: {inc.payday}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">฿{formatTHB(amount)}</p>
                          {confirmed 
                            ? <span className="text-[10px] font-bold text-green-600 uppercase">{dict.lblConfirmed}</span>
                            : <span className="text-[10px] font-bold text-amber-500 uppercase">{dict.lblEstimated}</span>
                          }
                        </div>
                        {!confirmed && (
                          <Button size="sm" variant="outline" onClick={() => handleConfirmIncome(inc.id, amount)} className="h-7 text-xs px-2">
                            {dict.btnConfirm}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* EXPENSES */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{dict.plannedExpenses}</h3>
              <Button size="sm" onClick={() => setExpenseModal(true)}>{dict.btnAddExpense}</Button>
            </div>
            
            <div className="space-y-3">
              {data.expenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{exp.name}</p>
                    <Badge variant="outline" className="mt-1 text-[10px] h-4 leading-none bg-gray-50">{exp.category}</Badge>
                  </div>
                  <p className="font-bold text-gray-900">฿{formatTHB(exp.amount)}</p>
                </div>
              ))}

              {/* READONLY CAR LOANS */}
              {data.cars.flatMap(c => c.schedule).filter((s:any) => s.dueDate.startsWith(currentMonth)).map((s:any) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-blue-100 bg-blue-50/30">
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">{data.cars.find(c => c.id === s.carId)?.name}</p>
                    <Badge variant="outline" className="mt-1 text-[10px] h-4 leading-none bg-blue-100 text-blue-700 border-blue-200">
                      {dict.carLoanImport}
                    </Badge>
                  </div>
                  <p className="font-bold text-blue-900">฿{formatTHB(s.amount)}</p>
                </div>
              ))}

              {data.expenses.length === 0 && data.cars.length === 0 && (
                <p className="text-sm text-gray-400 py-4">{dict.noData}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COL: Timeline ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-fit">
          <h3 className="font-bold text-gray-900 mb-4">{dict.timeline}</h3>
          
          <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
            {timeline.map((event, idx) => {
              const isIncome = event.type === 'income';
              
              return (
                <div key={idx} className="relative">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${isIncome ? 'bg-green-500' : 'bg-red-400'}`} />
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-0.5">{event.date}</p>
                      <p className={`font-semibold text-sm ${isIncome ? 'text-green-700' : 'text-gray-900'}`}>
                        {event.name}
                      </p>
                      {event.atRisk && (
                        <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                          {dict.atRiskWarning}
                        </p>
                      )}
                    </div>
                    <p className={`font-bold tabular-nums ${isIncome ? 'text-green-600' : 'text-gray-900'}`}>
                      {isIncome ? '+' : '-'}฿{formatTHB(event.amount)}
                    </p>
                  </div>
                </div>
              );
            })}

            {timeline.length === 0 && (
              <p className="text-sm text-gray-400 py-4 -ml-4">{dict.noData}</p>
            )}
          </div>
        </div>
      </div>
      </div>

      <AddIncomeModal isOpen={incomeModal} onClose={() => setIncomeModal(false)} dict={dict} onSaved={loadData} />
      <AddExpenseModal isOpen={expenseModal} onClose={() => setExpenseModal(false)} dict={dict} month={currentMonth} onSaved={loadData} />
    </>
  );
}
