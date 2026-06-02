'use client';

import React, { useMemo } from 'react';
import type { Car, Dictionary, Lang } from '@/types/index';
import { formatTHB } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/Toast';

interface ReportsTabProps {
  cars: Car[];
  dict: Dictionary;
  lang: Lang;
}

export default function ReportsTab({ cars, dict, lang }: ReportsTabProps) {
  const isTh = lang === 'th';
  const { toast } = useToast();

  const handleExport = () => {
    const header = isTh
      ? 'ชื่อยานพาหนะ,ประเภท,ราคา,เงินดาวน์,ดอกเบี้ยรายปี(%),จำนวนงวด,ยอดผ่อนต่อเดือน,เริ่มสัญญา\n'
      : 'Vehicle Name,Type,Price,Down Payment,Annual Rate (%),Term (Months),Monthly Payment,Start Date\n';
    const rows = cars.map(c =>
      `"${c.name}","${c.vehicleType}",${c.price},${c.downPayment},${c.annualRate},${c.termMonths},${c.monthlyAmt},${c.startDate}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'fleet-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(dict.toastExported, 'success');
  };

  const reportData = useMemo(() => {
    let totalPrincipal = 0;
    let totalInterest = 0;
    
    const breakdowns = cars.map(car => {
      const p = car.principal;
      const i = car.totalInterest;
      totalPrincipal += p;
      totalInterest += i;
      
      return {
        id: car.id,
        name: car.name,
        principal: p,
        interest: i,
        total: p + i
      };
    });

    return { totalPrincipal, totalInterest, breakdowns };
  }, [cars]);

  return (
    <div className="anim-up space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{dict.reportsTitle}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{dict.reportsDesc}</p>
        </div>
        
        <Button variant="default" size="sm" onClick={handleExport} className="self-start">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          {dict.exportCSV}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{dict.totalPrincipal}</h2>
          <p className="text-3xl font-bold text-gray-900 tabular-nums">฿{formatTHB(reportData.totalPrincipal)}</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{dict.summaryInterest}</h2>
          <p className="text-3xl font-bold text-amber-600 tabular-nums">฿{formatTHB(reportData.totalInterest)}</p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm mt-8">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900">{dict.financialSummary}</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.colVehicle}</TableHead>
              <TableHead className="text-right">{dict.summaryPrincipal}</TableHead>
              <TableHead className="text-right">{dict.summaryInterest}</TableHead>
              <TableHead className="text-right">{dict.summaryPreVAT}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.breakdowns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-400">
                  {dict.emptyFilter}
                </TableCell>
              </TableRow>
            ) : (
              reportData.breakdowns.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-gray-900">{row.name}</TableCell>
                  <TableCell className="text-right tabular-nums">฿{formatTHB(row.principal)}</TableCell>
                  <TableCell className="text-right tabular-nums text-amber-600">฿{formatTHB(row.interest)}</TableCell>
                  <TableCell className="text-right tabular-nums font-bold">฿{formatTHB(row.total)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
