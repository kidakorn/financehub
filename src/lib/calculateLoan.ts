import type { Car, CarFormInput, Installment, CarStats } from '@/types/index';
import { generateId, addMonths } from '@/lib/formatters';

/** ─── DevaDrive Loan Calculation Engine ──────────────────────────────────── */

/**
 * Builds a full Car entity from form input.
 * Formula (per spec):
 *   Principal = Price - Down
 *   Monthly   = ((Principal + (Principal * Rate * Years)) / Months) * 1.07
 */
export function buildCar(input: CarFormInput): Car | null {
  const price       = parseFloat(input.price);
  const downPayment = parseFloat(input.downPayment) || 0;
  const ppi         = parseFloat(input.ppi) || 0;
  const annualRate  = parseFloat(input.annualRate);
  const termMonths  = parseInt(input.termMonths, 10);
  const startDate   = input.startDate || new Date().toISOString().split('T')[0];

  // Validation guards
  if (
    isNaN(price)      || price <= 0 ||
    isNaN(annualRate) || annualRate < 0 ||
    isNaN(ppi)        || ppi < 0 ||
    isNaN(termMonths) || termMonths < 1 || termMonths > 360 ||
    downPayment < 0   || downPayment >= price
  ) {
    return null;
  }

  const principal     = price - downPayment;
  const years         = termMonths / 12;
  const totalInterest = principal * (annualRate / 100) * years;
  const monthlyExcVAT = (principal + totalInterest) / termMonths;
  const monthlyIncVAT = input.includeVat ? monthlyExcVAT * 1.07 : monthlyExcVAT;
  const monthlyAmt    = monthlyIncVAT + ppi;
  const totalWithVAT  = monthlyAmt * termMonths;

  const carId    = generateId();
  const schedule = buildSchedule(carId, termMonths, monthlyAmt, startDate);

  return {
    id:           carId,
    vehicleType:  input.vehicleType || 'car',
    name:         input.name.trim() || 'Unnamed Car',
    price,
    downPayment,
    principal,
    ppi,
    annualRate,
    termMonths,
    startDate,
    monthlyExcVAT,
    monthlyIncVAT,
    monthlyAmt,
    totalInterest,
    totalWithVAT,
    createdAt:    new Date().toISOString(),
    includeVat:   input.includeVat ?? true,
    schedule,
  };
}

/** Generates the full installment schedule for a car */
function buildSchedule(
  carId: string,
  months: number,
  monthlyAmt: number,
  startDate: string,
): Installment[] {
  return Array.from({ length: months }, (_, i) => ({
    id:      `${carId}-${i + 1}`,
    no:      i + 1,
    dueDate: addMonths(startDate, i + 1),
    amount:  monthlyAmt,
    isPaid:  false,
  }));
}

/** Derives live stats from a car (paid count, progress, remaining balance) */
export function getCarStats(car: Car): CarStats {
  const total          = car.schedule.length;
  const paidCount      = car.schedule.filter((s) => s.isPaid).length;
  const remainingCount = total - paidCount;
  const progressPct    = total > 0 ? Math.round((paidCount / total) * 100) : 0;
  const totalPaid      = paidCount * car.monthlyAmt;
  const remaining      = remainingCount * car.monthlyAmt;

  return { paidCount, remainingCount, progressPct, totalPaid, remaining };
}
