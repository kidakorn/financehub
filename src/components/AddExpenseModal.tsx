'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import type { FinanceDictionary } from '@/i18n/financeDict';
import { addPlannedExpense, updatePlannedExpense } from '@/actions/financeActions';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  dict: FinanceDictionary;
  month: string; // YYYY-MM
  onSaved: () => void;
  editData?: any;
}

export default function AddExpenseModal({ isOpen, onClose, dict, month, onSaved, editData }: AddExpenseModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const data = {
        name: fd.get('name') as string,
        category: fd.get('category') as string,
        amount: parseFloat(fd.get('amount') as string),
        expectedDate: fd.get('expectedDate') as string,
        month,
        endMonth: fd.get('endMonth') as string || null,
      };

      if (editData) {
        await updatePlannedExpense(editData.id, data);
      } else {
        await addPlannedExpense(data);
      }
      onSaved();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden anim-up">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{editData ? dict.btnEdit : dict.modalAddExpenseTitle}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">{dict.lblExpenseName}</label>
            <input required name="name" defaultValue={editData?.name} type="text" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Rent, Internet" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{dict.lblAmount}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">฿</span>
                <input required name="amount" defaultValue={editData?.amount} type="number" min="0" step="0.01" className="w-full h-10 pl-8 pr-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{dict.lblExpectedDate}</label>
              <input required name="expectedDate" defaultValue={editData?.expectedDate} type="date" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{dict.lblCategory}</label>
              <select required name="category" defaultValue={editData?.category} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white">
                <option value="fixed">{dict.expenseCategoryFixed}</option>
                <option value="onetime">{dict.expenseCategoryOneTime}</option>
                <option value="savings">{dict.expenseCategorySavings}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{dict.lblEndMonth}</label>
              <input name="endMonth" defaultValue={editData?.endMonth} type="month" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{dict.lblEndMonthDesc}</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>{dict.btnCancel}</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
              {editData ? dict.btnSave : dict.btnSave}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
