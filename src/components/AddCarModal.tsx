'use client';

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import type { Car, CarFormInput, Dictionary, Lang } from '@/types/index';
import { buildCar } from '@/lib/calculateLoan';
import { useAddCar, useUpdateCar } from '@/store/useAppStore';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface VehicleModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  dict:         Dictionary;
  lang:         Lang;
  /** Pass an existing Car to enter edit mode */
  editCar?:     Car | null;
  onSaved?:     (mode: 'add' | 'edit') => void;
}

const EMPTY: CarFormInput = {
  vehicleType: 'car',
  name:        '',
  price:       '',
  downPayment: '',
  ppi:         '',
  annualRate:  '',
  termMonths:  '',
  startDate:   new Date().toISOString().split('T')[0],
  includeVat:  true,
};

const TERM_PRESETS = [24, 36, 48, 60, 72, 84];

function carToForm(car: Car): CarFormInput {
  return {
    vehicleType: car.vehicleType,
    name:        car.name,
    price:       car.price.toLocaleString('en-US'),
    downPayment: car.downPayment.toLocaleString('en-US'),
    ppi:         car.ppi ? car.ppi.toLocaleString('en-US') : '',
    annualRate:  String(car.annualRate),
    termMonths:  String(car.termMonths),
    startDate:   car.startDate,
    includeVat:  car.includeVat ?? true,
  };
}

export default function AddCarModal({
  isOpen,
  onClose,
  dict,
  lang,
  editCar  = null,
  onSaved,
}: VehicleModalProps) {
  const isTh     = lang === 'th';
  const isEdit   = !!editCar;
  const addCar   = useAddCar();
  const updateCar = useUpdateCar();

  const [form,  setForm]  = useState<CarFormInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  /* Pre-fill form when editing */
  useEffect(() => {
    if (isOpen) {
      setForm(editCar ? carToForm(editCar) : EMPTY);
      setError(null);
    }
  }, [isOpen, editCar]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
      return;
    }

    if (name === 'price' || name === 'downPayment' || name === 'ppi') {
      const raw = value.replace(/,/g, '');
      if (/^\d*$/.test(raw)) {
        setForm(f => ({ ...f, [name]: raw ? Number(raw).toLocaleString('en-US') : '' }));
      }
      return;
    }
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const built = buildCar({
      ...form,
      price:       form.price.replace(/,/g, ''),
      downPayment: form.downPayment.replace(/,/g, ''),
      ppi:         form.ppi.replace(/,/g, ''),
    });

    if (!built) {
      setError(dict.errorInvalid);
      return;
    }

    if (isEdit && editCar) {
      /* Preserve the original id, createdAt, and any isPaid flags on matching installments */
      const preserved = {
        ...built,
        id:        editCar.id,
        createdAt: editCar.createdAt,
        schedule:  built.schedule.map((inst, idx) => ({
          ...inst,
          id:     `${editCar.id}-${inst.no}`,
          isPaid: editCar.schedule[idx]?.isPaid ?? false,
        })),
      };
      updateCar(preserved);
      onSaved?.('edit');
    } else {
      addCar(built);
      onSaved?.('add');
    }

    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl">
            {isEdit ? dict.modalTitleEdit : dict.modalTitleAdd}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

            {/* Error alert */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm animate-[fadeIn_.2s_ease]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
                  <circle cx="8" cy="8" r="7" fill="currentColor" opacity=".15"/>
                  <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* Vehicle Type Selector */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg border border-gray-200">
              {(['car', 'motorcycle'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, vehicleType: type }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-150 ${
                    form.vehicleType === type
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {type === 'car' ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M5 15l2-8h10l2 8v4h-2v-2H7v2H5v-4zm2-6-1 4h12l-1-4H7zm2 6a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
                      <path d="M15 6a3.5 3.5 0 1 0-7 0"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                    </svg>
                  )}
                  {type === 'car'
                    ? (isTh ? 'รถยนต์' : 'Car')
                    : (isTh ? 'มอเตอร์ไซค์' : 'Motorcycle')}
                </button>
              ))}
            </div>

            {/* Vehicle Name */}
            <div className="space-y-1.5">
              <Label htmlFor="modal-name">{dict.labelCarName}</Label>
              <Input
                id="modal-name" name="name" type="text" required
                value={form.name} onChange={handleChange}
                placeholder={dict.placeholderCarName}
              />
            </div>

            {/* Price + Down payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="modal-price">{dict.labelPrice}</Label>
                <div className="relative">
                  <Input id="modal-price" name="price" type="text" required
                    value={form.price} onChange={handleChange} placeholder="1,500,000"
                    className="pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">฿</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modal-down">{dict.labelDown}</Label>
                <div className="relative">
                  <Input id="modal-down" name="downPayment" type="text"
                    value={form.downPayment} onChange={handleChange} placeholder="0"
                    className="pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">฿</span>
                </div>
              </div>

              {/* PPI */}
              <div className="space-y-1.5">
                <Label htmlFor="modal-ppi">{dict.labelPPI}</Label>
                <div className="relative">
                  <Input id="modal-ppi" name="ppi" type="text"
                    value={form.ppi} onChange={handleChange} placeholder={dict.placeholderPPI}
                    className="pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">฿</span>
                </div>
              </div>

              {/* Rate */}
              <div className="space-y-1.5">
                <Label htmlFor="modal-rate">{dict.labelRate}</Label>
                <div className="relative">
                  <Input id="modal-rate" name="annualRate" type="number" min="0" max="50" step="0.01" required
                    value={form.annualRate} onChange={handleChange} placeholder="3.99"
                    className="pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-1.5">
                <Label htmlFor="modal-start">{dict.labelStartDate}</Label>
                <Input id="modal-start" name="startDate" type="date" required
                  value={form.startDate} onChange={handleChange} />
              </div>
            </div>

            {/* VAT Checkbox */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="modal-vat"
                name="includeVat"
                checked={form.includeVat}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="modal-vat" className="font-medium cursor-pointer">
                {dict.labelIncludeVat}
              </Label>
            </div>

            {/* Term presets */}
            <div className="space-y-2.5">
              <Label>{dict.labelTerm} / {dict.labelTermPresets}</Label>
              <div className="flex flex-wrap gap-2">
                {TERM_PRESETS.map(m => (
                  <Button
                    key={m} type="button"
                    variant={form.termMonths === String(m) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setForm(f => ({ ...f, termMonths: String(m) }))}
                  >
                    {m} {dict.unitMonths}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <Input
                  id="modal-term" name="termMonths" type="number" min="1" max="360" step="1" required
                  value={form.termMonths} onChange={handleChange}
                  placeholder="60" className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  {dict.unitMonths}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/50">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 sm:flex-none">
              {dict.btnCancel}
            </Button>
            <Button type="submit" id="btn-modal-save" className="flex-1 sm:flex-none">
              {isEdit ? dict.modalTitleEdit : dict.btnSave}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
