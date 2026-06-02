'use client';

import React, { useMemo, useState } from 'react';
import type { Car, Dictionary, Lang, Installment } from '@/types/index';
import { formatTHB } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface PaymentsTabProps {
  cars: Car[];
  dict: Dictionary;
  lang: Lang;
}

type AggregatedInstallment = Installment & { carName: string; carId: string };

export default function PaymentsTab({ cars, dict, lang }: PaymentsTabProps) {
  const isTh = lang === 'th';
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const allInstallments = useMemo(() => {
    let list: AggregatedInstallment[] = [];
    cars.forEach(car => {
      const mapped = car.schedule.map(inst => ({
        ...inst,
        carName: car.name,
        carId: car.id
      }));
      list = list.concat(mapped);
    });

    // Sort by due date (oldest/nearest first)
    list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return list;
  }, [cars]);

  const filteredInstallments = useMemo(() => {
    if (filter === 'all') return allInstallments;
    return allInstallments.filter(i => filter === 'paid' ? i.isPaid : !i.isPaid);
  }, [allInstallments, filter]);

  return (
    <div className="anim-up space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{dict.unifiedPaymentsTitle}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{dict.unifiedPaymentsDesc}</p>
        </div>
        
        {/* Filter Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {dict.filterAll}
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {dict.filterPending}
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'paid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {dict.filterPaid}
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.colDueDate}</TableHead>
              <TableHead>{dict.colVehicle}</TableHead>
              <TableHead>{dict.colNo}</TableHead>
              <TableHead>{dict.colAmount}</TableHead>
              <TableHead>{dict.colStatus}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInstallments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14 text-gray-400">
                  {dict.emptyFilter}
                </TableCell>
              </TableRow>
            )}
            {filteredInstallments.map(inst => {
              const dateStr = new Date(inst.dueDate).toLocaleDateString(isTh ? 'th-TH' : 'en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              });
              
              return (
                <TableRow key={inst.id}>
                  <TableCell className="font-medium text-gray-900">
                    {dateStr}
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900 font-semibold">{inst.carName}</span>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {inst.no}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold tabular-nums">฿{formatTHB(inst.amount)}</span>
                  </TableCell>
                  <TableCell>
                    {inst.isPaid 
                      ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{dict.badgePaid}</Badge>
                      : <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{dict.badgePending}</Badge>
                    }
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
