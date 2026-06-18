'use client';

import { useMemo } from 'react';
import type { TimelineEvent } from '@/lib/financeUtils';
import type { FinanceDictionary } from '@/i18n/financeDict';
import { formatTHB } from '@/lib/formatters';

interface FinanceCalendarProps {
  timeline: TimelineEvent[];
  currentMonth: string; // YYYY-MM
  dict: FinanceDictionary;
}

export default function FinanceCalendar({ timeline, currentMonth, dict }: FinanceCalendarProps) {
  // Parse year and month
  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1; // 0-based

  // Calendar calculations
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, monthIdx, 1).getDay(); // 0 = Sun, 6 = Sat

  // Group events by day (1 to daysInMonth)
  const eventsByDay = useMemo(() => {
    const map = new Map<number, TimelineEvent[]>();
    for (let i = 1; i <= daysInMonth; i++) {
      map.set(i, []);
    }
    
    timeline.forEach(event => {
      const eventDate = new Date(event.date);
      // Ensure it's the right month/year before mapping just in case
      if (eventDate.getFullYear() === year && eventDate.getMonth() === monthIdx) {
        const day = eventDate.getDate();
        map.get(day)?.push(event);
      }
    });
    return map;
  }, [timeline, year, monthIdx, daysInMonth]);

  // Compute running balance day by day
  const dailyBalance = useMemo(() => {
    let balance = 0;
    const balances = new Map<number, number>();
    
    // We add all events chronologically day by day
    for (let i = 1; i <= daysInMonth; i++) {
      const dayEvents = eventsByDay.get(i) || [];
      dayEvents.forEach(e => {
        if (e.type === 'income') balance += e.amount;
        else balance -= e.amount;
      });
      balances.set(i, balance);
    }
    return balances;
  }, [eventsByDay, daysInMonth]);

  // Array of blank cells for alignment
  const blankCells = Array.from({ length: firstDayOfWeek });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthName = new Date(year, monthIdx).toLocaleString(
    dict.tabFinance === 'Personal Budget' ? 'en-US' : 'th-TH', 
    { month: 'long', year: 'numeric' }
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden anim-up">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900">{monthName}</h2>
        <div className="flex gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> Income</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"></div> Expense</span>
        </div>
      </div>
      
      {/* Grid Header (Days of week) */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 uppercase tracking-wider">{day}</div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7 bg-gray-200 gap-px border-b border-gray-100">
        {blankCells.map((_, i) => (
          <div key={`blank-${i}`} className="bg-white min-h-[120px]" />
        ))}
        
        {days.map(day => {
          const dayEvents = eventsByDay.get(day) || [];
          const balance = dailyBalance.get(day) || 0;
          const isToday = new Date().getDate() === day && new Date().getMonth() === monthIdx && new Date().getFullYear() === year;

          return (
            <div key={day} className="bg-white min-h-[120px] p-2 relative group flex flex-col hover:bg-blue-50/10 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${isToday ? 'bg-blue-600 text-white' : 'text-gray-900'}`}>
                  {day}
                </span>
                
                {/* Projected Balance tooltip on hover */}
                <div className="hidden group-hover:block absolute top-2 right-2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                  Est. Balance: ฿{formatTHB(balance)}
                </div>
              </div>

              <div className="flex-1 space-y-1.5 overflow-y-auto hide-scrollbar pb-1">
                {dayEvents.map((evt, i) => {
                  const isInc = evt.type === 'income';
                  return (
                    <div 
                      key={i} 
                      title={`${evt.name}: ${isInc ? '+' : '-'}฿${formatTHB(evt.amount)}`}
                      className={`px-1.5 py-1 rounded text-[10px] leading-tight font-medium border truncate ${
                        isInc ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {evt.name}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
