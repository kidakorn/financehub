'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Car, Dictionary, Lang } from '@/types/index';
import { getCarStats } from '@/lib/calculateLoan';
import { formatTHB } from '@/lib/formatters';

interface DashboardOverviewProps {
  cars: Car[];
  dict: Dictionary;
  lang: Lang;
}

export default function DashboardOverview({ cars, dict, lang }: DashboardOverviewProps) {
  const isTh = lang === 'th';

  const stats = useMemo(() => {
    let totalDebt = 0;
    let totalMonthly = 0;
    let totalPaid = 0;
    let nextDue: string | null = null;
    let nextDueAmt = 0;
    
    // Calculate total debt, monthly outflow, total paid, and next upcoming payment
    const allUpcoming: { date: Date; amt: number }[] = [];

    cars.forEach(car => {
      const s = getCarStats(car);
      totalDebt += s.remaining;
      totalMonthly += car.monthlyAmt;
      totalPaid += s.totalPaid;

      // Find upcoming installments
      car.schedule.forEach(inst => {
        if (!inst.isPaid) {
          allUpcoming.push({ date: new Date(inst.dueDate), amt: inst.amount });
        }
      });
    });

    allUpcoming.sort((a, b) => a.date.getTime() - b.date.getTime());

    if (allUpcoming.length > 0) {
      nextDue = allUpcoming[0].date.toLocaleDateString(isTh ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      nextDueAmt = allUpcoming[0].amt;
    }

    return { totalDebt, totalMonthly, totalPaid, nextDue, nextDueAmt, allUpcoming };
  }, [cars, isTh]);

  // Generate chart data: aggregate payments by month for the next 6 months
  const chartData = useMemo(() => {
    const data: { name: string; amount: number }[] = [];
    const now = new Date();
    
    for (let i = 0; i < 6; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = targetDate.toLocaleDateString(isTh ? 'th-TH' : 'en-US', { month: 'short' });
      
      // Sum all upcoming payments that fall in this month and year
      const monthlyTotal = stats.allUpcoming.reduce((sum, item) => {
        if (item.date.getMonth() === targetDate.getMonth() && item.date.getFullYear() === targetDate.getFullYear()) {
          return sum + item.amt;
        }
        return sum;
      }, 0);
      
      data.push({ name: monthName, amount: monthlyTotal });
    }
    
    return data;
  }, [stats.allUpcoming, isTh]);

  // Top upcoming bills (next 5)
  const upcomingBillsList = stats.allUpcoming.slice(0, 5);

  return (
    <div className="anim-up space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{dict.overviewTitle}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{dict.overviewDesc}</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
          <p className="text-sm font-medium text-gray-500 mb-1">{dict.widgetTotalDebt}</p>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">฿{formatTHB(stats.totalDebt)}</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
          <p className="text-sm font-medium text-gray-500 mb-1">{dict.widgetMonthlyOutflow}</p>
          <p className="text-2xl font-bold text-blue-600 tabular-nums">฿{formatTHB(stats.totalMonthly)}</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
          <p className="text-sm font-medium text-gray-500 mb-1">{dict.statTotalPaid}</p>
          <p className="text-2xl font-bold text-green-600 tabular-nums">฿{formatTHB(stats.totalPaid)}</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
          <p className="text-sm font-medium text-gray-500 mb-1">{dict.nextPaymentDue}</p>
          <p className="text-2xl font-bold text-amber-600 tabular-nums">{stats.nextDue ? `฿${formatTHB(stats.nextDueAmt)}` : '-'}</p>
          {stats.nextDue && <p className="text-xs text-gray-400 mt-1">{stats.nextDue}</p>}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded-xl p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-6">{dict.projectedPayments} (6 {dict.unitMonths})</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(val) => `฿${val.toLocaleString()}`}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: any) => [`฿${formatTHB(Number(value))}`, dict.statMonthly]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAmt)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Bills List */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{dict.upcomingBills}</h2>
          
          {upcomingBillsList.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center text-gray-400 py-10">
              <p>{dict.noUpcomingBills}</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {upcomingBillsList.map((bill, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {bill.date.getDate()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {bill.date.toLocaleDateString(isTh ? 'th-TH' : 'en-US', { month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-500">{dict.colAmount}</p>
                    </div>
                  </div>
                  <p className="text-base font-bold text-gray-900 tabular-nums">฿{formatTHB(bill.amt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
