'use client';

import { useState, useMemo } from 'react';
import type { Car, Dictionary } from '@/types/index';
import type { Lang } from '@/types/index';
import { getCarStats } from '@/lib/calculateLoan';
import { formatTHB, formatDate } from '@/lib/formatters';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useTogglePaid } from '@/store/useAppStore';
import { useToast } from '@/components/Toast';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BillingViewProps {
  car:    Car;
  lang:   Lang;
  dict:   Dictionary;
  onBack: () => void;
}

const PAGE_SIZE  = 12;
type FilterKey   = 'all' | 'paid' | 'pending';

export default function BillingView({ car, lang, dict, onBack }: BillingViewProps) {
  const togglePaid  = useTogglePaid();
  const { toast }   = useToast();
  const [page, setPage]         = useState(1);
  const [filter, setFilter]     = useState<FilterKey>('all');
  const stats = getCarStats(car);

  const handleToggle = (instId: string, currentPaid: boolean) => {
    togglePaid(car.id, instId);
    toast(
      currentPaid ? dict.toastPaidOff : dict.toastPaidOn,
      currentPaid ? 'info' : 'success',
      2500,
    );
  };

  const filtered = useMemo(() => {
    if (filter === 'all')     return car.schedule;
    if (filter === 'paid')    return car.schedule.filter((i) => i.isPaid);
    return car.schedule.filter((i) => !i.isPaid);
  }, [car.schedule, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = (f: FilterKey) => { setFilter(f); setPage(1); };

  const chartData = useMemo(() => {
    return car.schedule.map(inst => {
      const projectedPaid = inst.amount * inst.no;
      const projectedRemaining = car.totalWithVAT - projectedPaid;
      return {
        name: `M${inst.no}`,
        Remaining: Math.round(projectedRemaining),
        Paid: Math.round(projectedPaid)
      };
    });
  }, [car]);

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all',     label: dict.filterAll },
    { key: 'pending', label: dict.filterPending },
    { key: 'paid',    label: dict.filterPaid },
  ];

  return (
    <div className="anim-up">
      {/* Back + title */}
      <div className="flex items-center gap-4 mb-6">
        <Button id="btn-back" variant="ghost" size="sm" onClick={onBack}>
          {dict.btnBack}
        </Button>
        <div className="min-w-0">
          <h2 className="text-xl font-bold truncate" style={{ color: 'var(--color-text-1)' }}>
            {car.name}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>
            {dict.billingTitle} · {car.termMonths} {dict.billingSubtitle}
          </p>
        </div>
      </div>

      {/* Amortization Chart */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-1)' }}>Projected Amortization</h3>
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height={192}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="var(--color-text-3)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `฿${(val/1000)}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                itemStyle={{ fontSize: '12px' }}
                labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-1)' }}
                formatter={(val: any) => `฿${formatTHB(Number(val) || 0)}`}
              />
              <Line type="monotone" dataKey="Remaining" stroke="var(--color-primary)" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="Paid" stroke="var(--color-success)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Section 1: Loan Details */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 text-gray-900 border-b border-gray-100 pb-2">
            {lang === 'th' ? 'รายละเอียดสินเชื่อ' : 'Loan Details'}
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{dict.detailLoanAmount}</span>
              <span className="font-semibold text-gray-900">฿{formatTHB(car.principal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{dict.detailRepayment}</span>
              <span className="font-semibold text-gray-900">{car.termMonths} {dict.summaryTerm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{dict.detailInterest}</span>
              <span className="font-semibold text-gray-900">{car.annualRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{dict.detailStartDate}</span>
              <span className="font-semibold text-gray-900">{formatDate(car.startDate, lang)}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Monthly Payment Details */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 text-gray-900 border-b border-gray-100 pb-2">
            {lang === 'th' ? 'รายละเอียดการผ่อนชำระต่อเดือน' : 'Monthly Payment Details'}
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{dict.detailMonthlyExcVAT}</span>
              <span className="font-semibold text-gray-900">฿{formatTHB(car.monthlyExcVAT)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{dict.detailMonthlyIncVAT}</span>
              <span className="font-semibold text-gray-900">฿{formatTHB(car.monthlyIncVAT)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{dict.detailPPI}</span>
              <span className="font-semibold text-gray-900">฿{formatTHB(car.ppi)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2.5 mt-2.5">
              <span className="text-gray-700 font-bold">{dict.detailMonthlyTotal}</span>
              <span className="font-bold text-blue-600 text-base">฿{formatTHB(car.monthlyAmt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment list panel */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        {/* Panel header */}
        <div className="px-4 sm:px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-1)' }}>
                {dict.billingTitle}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>
                {car.schedule.length} {dict.billingSubtitle} · {dict.statPaid} {stats.paidCount}
              </p>
            </div>
            {/* Filter tabs */}
            <div
              className="flex rounded-lg overflow-hidden flex-shrink-0"
              style={{ border: '1px solid var(--color-border)' }}
              role="tablist"
            >
              {FILTERS.map((f, i) => (
                <button
                  key={f.key} role="tab" aria-selected={filter === f.key}
                  onClick={() => handleFilter(f.key)}
                  className="px-3 sm:px-4 py-1.5 text-xs font-semibold transition-colors"
                  style={{
                    background:  filter === f.key ? 'rgba(37, 99, 235, 0.10)' : 'transparent',
                    color:       filter === f.key ? 'var(--color-primary)' : 'var(--color-text-3)',
                    borderRight: i < FILTERS.length - 1 ? '1px solid var(--color-border)' : 'none',
                    minHeight:   '32px',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>{dict.tableProgress}</span>
              <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>{stats.progressPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${stats.progressPct}%` }} />
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gray-200" />

        {paginated.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>{dict.emptyFilter}</p>
          </div>
        ) : (
          <>
            {/* ── MOBILE: Card list (hidden sm+) ── */}
            <div className="block sm:hidden divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {paginated.map((inst) => (
                <div
                  key={inst.id}
                  className="flex items-center gap-3 px-4 py-4 transition-colors"
                  style={{ opacity: inst.isPaid ? 0.55 : 1 }}
                >
                  {/* No badge */}
                  <span
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold tabular-nums"
                    style={{
                      background: inst.isPaid ? 'var(--color-success-bg)' : 'var(--color-surface-hover)',
                      color:      inst.isPaid ? 'var(--color-success)' : 'var(--color-text-2)',
                      border:     `1px solid ${inst.isPaid ? 'var(--color-success-border)' : 'var(--color-border)'}`,
                    }}
                  >
                    {inst.no}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text-1)' }}>
                      ฿{formatTHB(inst.amount)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>
                      {formatDate(inst.dueDate, lang)}
                    </p>
                  </div>

                  {/* Status badge */}
                  {inst.isPaid
                    ? <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200">{dict.badgePaid}</span>
                    : <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">{dict.badgePending}</span>
                  }

                  {/* Toggle */}
                  <button
                    id={`btn-toggle-mobile-${inst.id}`}
                    onClick={() => handleToggle(inst.id, inst.isPaid)}
                    aria-label={inst.isPaid ? `${dict.filterPending} #${inst.no}` : `${dict.filterPaid} #${inst.no}`}
                    className={`flex items-center justify-center w-7 h-7 rounded-md border transition-all ${
                      inst.isPaid 
                        ? 'bg-green-100 border-green-300 text-green-700' 
                        : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {inst.isPaid ? (
                      <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <rect x="2" y="2" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* ── DESKTOP: Table (hidden below sm) ── */}
            <div className="hidden sm:block border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm mt-4">
              <Table aria-label={dict.billingTitle}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">{dict.colNo}</TableHead>
                    <TableHead>{dict.colDueDate}</TableHead>
                    <TableHead className="text-right">{dict.colAmount}</TableHead>
                    <TableHead className="text-right">{dict.colStatus}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((inst) => (
                    <TableRow key={inst.id} className={inst.isPaid ? 'opacity-60 bg-gray-50' : ''}>
                      <TableCell className="text-center font-medium">{inst.no}</TableCell>
                      <TableCell>{formatDate(inst.dueDate, lang)}</TableCell>
                      <TableCell className="text-right font-bold">฿{formatTHB(inst.amount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleToggle(inst.id, inst.isPaid)}
                            aria-label={`${inst.isPaid ? dict.filterPending : dict.filterPaid} #${inst.no}`}
                            className={`flex items-center justify-center w-7 h-7 rounded-md border transition-all ${
                              inst.isPaid 
                                ? 'bg-green-100 border-green-300 text-green-700' 
                                : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'
                            }`}
                          >
                            {inst.isPaid ? (
                              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                <rect x="2" y="2" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <>
            <div className="w-full h-px bg-gray-200" />
            <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3">
              <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                {dict.paginationInfo} {page}/{totalPages} · {paginated.length}/{filtered.length} {dict.billingSubtitle}
              </span>
              <div className="flex gap-2">
                <Button id="btn-prev" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  variant="ghost" size="sm">{dict.btnPrev}</Button>
                <Button id="btn-next" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  variant="ghost" size="sm">{dict.btnNext}</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
