export type TimelineEvent = {
  date: string; // YYYY-MM-DD
  type: 'income' | 'expense' | 'car_loan';
  name: string;
  amount: number;
  isConfirmed?: boolean;
  atRisk?: boolean; // Flag if cumulative expenses exceed confirmed income before next payday
};

/**
 * Shifts a payday to the previous Friday if it falls on a weekend,
 * otherwise returns the same date.
 */
export function calculateNextPayday(dateStr: string, shiftWeekend: boolean): string {
  if (!shiftWeekend) return dateStr;

  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday

  if (day === 0) { // Sunday -> shift to Friday (-2 days)
    date.setDate(date.getDate() - 2);
  } else if (day === 6) { // Saturday -> shift to Friday (-1 day)
    date.setDate(date.getDate() - 1);
  }

  return date.toISOString().split('T')[0];
}

/**
 * Generates a chronological timeline of all financial events for the month.
 * Flags days as "at risk" if cumulative expenses exceed current confirmed income.
 */
export function generateTimeline(
  incomes: any[],
  expenses: any[],
  carInstallments: any[],
  month: string // YYYY-MM
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // 1. Process Incomes
  incomes.forEach((inc) => {
    // If we have actuals for this month, use that, else use estimated
    const actual = inc.actuals?.[0];
    const amount = actual ? actual.actualAmount : inc.estimatedAmount;
    const isConfirmed = actual ? actual.isConfirmed : false;
    
    // Shift the date to the correct month, then calculate payday
    const originalDate = new Date(inc.payday);
    const targetMonthDate = new Date(`${month}-01`);
    
    // Create a date in the target month with the same day
    const eventDate = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), originalDate.getDate());
    
    events.push({
      date: calculateNextPayday(eventDate.toISOString().split('T')[0], inc.shiftWeekend),
      type: 'income',
      name: inc.name,
      amount,
      isConfirmed
    });
  });

  // 2. Process Expenses
  expenses.forEach((exp) => {
    events.push({
      date: exp.expectedDate,
      type: 'expense',
      name: exp.name,
      amount: exp.amount
    });
  });

  // 3. Process Car Loans
  carInstallments.forEach((inst) => {
    // Only include installments due in this month
    if (inst.dueDate.startsWith(month)) {
      events.push({
        date: inst.dueDate,
        type: 'car_loan',
        name: `${inst.car.name} Installment ${inst.no}`,
        amount: inst.amount
      });
    }
  });

  // 4. Sort chronologically
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 5. Evaluate Risk
  let currentConfirmedIncome = 0;
  
  events.forEach((event) => {
    if (event.type === 'income' && event.isConfirmed) {
      currentConfirmedIncome += event.amount;
    } else if (event.type !== 'income') {
      currentConfirmedIncome -= event.amount;
      if (currentConfirmedIncome < 0) {
        event.atRisk = true;
      }
    }
  });

  return events;
}
