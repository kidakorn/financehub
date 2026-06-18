'use client';

import { useMemo } from 'react';
import type { FinanceDictionary } from '@/i18n/financeDict';
import type { TimelineEvent } from '@/lib/financeUtils';
import { formatTHB } from '@/lib/formatters';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid 
} from 'recharts';

interface FinanceAnalyticsProps {
  data: any;
  summary: any;
  currentMonth: string;
  dict: FinanceDictionary;
}

export default function FinanceAnalytics({ data, summary, dict, currentMonth }: FinanceAnalyticsProps) {
  
  // Prepare Expense Breakdown Data
  const expenseData = useMemo(() => {
    if (!data) return [];
    
    const categories = new Map<string, number>();
    
    data.expenses.forEach((exp: any) => {
      const cat = exp.category || 'Other';
      categories.set(cat, (categories.get(cat) || 0) + exp.amount);
    });

    data.cars.forEach((car: any) => {
      car.schedule.forEach((s: any) => {
        if (s.dueDate.startsWith(currentMonth)) {
          categories.set('Car Loans', (categories.get('Car Loans') || 0) + s.amount);
        }
      });
    });

    return Array.from(categories.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
      
  }, [data, currentMonth]);

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6', '#EC4899'];

  // Prepare Cash Flow Line Chart Data
  // We want to chart the running balance over the days of the month.
  const cashFlowData = useMemo(() => {
    if (!data) return [];
    
    // Group timeline events by day
    // Wait, the timeline isn't passed as a prop! Let's just calculate from data directly.
    const balances: { day: string, balance: number }[] = [];
    
    // We assume 30/31 days in month
    const [yearStr, monthStr] = currentMonth.split('-');
    const year = parseInt(yearStr, 10);
    const monthIdx = parseInt(monthStr, 10) - 1;
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    
    let runningBalance = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${yearStr}-${monthStr}-${day.toString().padStart(2, '0')}`;
      
      // Add incomes for this day
      data.incomes.forEach((inc: any) => {
        // approximate payday mapping
        if (inc.payday === dateStr) {
           const actual = inc.actuals?.[0];
           runningBalance += actual ? actual.actualAmount : inc.estimatedAmount;
        }
      });
      
      // Subtract expenses
      data.expenses.forEach((exp: any) => {
        if (exp.expectedDate === dateStr) runningBalance -= exp.amount;
      });

      // Subtract car loans
      data.cars.forEach((car: any) => {
        car.schedule.forEach((s: any) => {
          if (s.dueDate === dateStr) runningBalance -= s.amount;
        });
      });

      balances.push({ day: day.toString(), balance: runningBalance });
    }
    
    return balances;
  }, [data, currentMonth]);

  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-xl rounded-lg">
          <p className="text-sm font-semibold text-gray-900">{payload[0].name || `Day ${payload[0].payload.day}`}</p>
          <p className="text-sm text-gray-600">฿{formatTHB(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="anim-up space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cash Flow Line Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Running Cash Flow</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `฿${val/1000}k`} />
                <RechartsTooltip content={renderTooltip} />
                <Line type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories Donut */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Expense Breakdown</h3>
          {expenseData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No expenses yet</div>
          ) : (
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={renderTooltip} />
                </PieChart>
              </ResponsiveContainer>
              {/* Total label inside donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-gray-500 font-medium">Total</span>
                <span className="text-xl font-bold text-gray-900">฿{formatTHB(summary.totalExpenses)}</span>
              </div>
            </div>
          )}
          
          {/* Custom Legend */}
          <div className="mt-4 space-y-2">
            {expenseData.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-gray-600 font-medium">{entry.name}</span>
                </div>
                <span className="text-gray-900 font-bold">฿{formatTHB(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
