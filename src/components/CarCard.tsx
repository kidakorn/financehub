'use client';

import type { Car, Dictionary } from '@/types/index';
import { getCarStats } from '@/lib/calculateLoan';
import { formatTHB } from '@/lib/formatters';
import { useDeleteCar } from '@/store/useAppStore';

interface CarCardProps {
  car:          Car;
  dict:         Dictionary;
  onViewBilling: (carId: string) => void;
}

export default function CarCard({ car, dict, onViewBilling }: CarCardProps) {
  const deleteCar = useDeleteCar();
  const stats     = getCarStats(car);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(dict.confirmDelete)) {
      deleteCar(car.id);
    }
  };

  return (
    <article
      className="card anim-up flex flex-col overflow-hidden group cursor-pointer"
      style={{ animationDelay: '0.05s' }}
      aria-label={car.name}
      onClick={() => onViewBilling(car.id)}
    >
      <div className="p-6 flex flex-col gap-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold truncate tracking-tight" style={{ color: 'var(--color-text-1)' }}>
              {car.name}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>
              {car.termMonths} {dict.unitMonths} · {car.annualRate}% {dict.summaryRate}
            </p>
          </div>
          <button
            onClick={handleDelete}
            id={`btn-delete-${car.id}`}
            aria-label={`${dict.btnDeleteCar} ${car.name}`}
            className="btn btn-sm btn-danger flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 3.5h10M4 3.5V2h6v1.5M5.5 6v4M8.5 6v4M3 3.5l.5 8h7l.5-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Monthly Payment */}
        <div className="rounded-2xl p-4 border-none shadow-none" style={{ background: 'var(--color-surface-2)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-3)' }}>
            {dict.statMonthly}
          </p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl font-bold tabular-nums leading-none gradient-text">
              ฿{formatTHB(car.monthlyAmt)}
            </p>
            <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-3)' }}>{dict.summaryInclVAT}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-2)' }}>
              {dict.statPaid} {stats.paidCount}/{car.termMonths} {dict.unitInstallments}
            </span>
            <span className="text-[11px] font-bold" style={{ color: 'var(--color-primary)' }}>
              {stats.progressPct}%
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${stats.progressPct}%` }} />
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          {[
            { label: dict.statTotalPaid,   value: stats.totalPaid },
            { label: dict.statRemainingAmt, value: stats.remaining },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-3)' }}>
                {label}
              </p>
              <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text-2)' }}>
                ฿{formatTHB(value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
