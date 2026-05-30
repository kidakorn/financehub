'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import type { CarFormInput, Dictionary } from '@/types/index';
import { buildCar } from '@/lib/calculateLoan';
import { useAddCar } from '@/store/useAppStore';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  dict: Dictionary;
}

const EMPTY: CarFormInput = {
  vehicleType: 'car',
  name:        '',
  price:       '',
  downPayment: '',
  annualRate:  '',
  termMonths:  '',
  startDate:   new Date().toISOString().split('T')[0],
};

const TERM_PRESETS = [24, 36, 48, 60, 72, 84];

export default function AddCarModal({ isOpen, onClose, dict }: AddCarModalProps) {
  const addCar  = useAddCar();
  const [form, setForm]   = useState<CarFormInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'price' || name === 'downPayment') {
      const raw = value.replace(/,/g, '');
      if (/^\d*$/.test(raw)) {
        const formatted = raw ? Number(raw).toLocaleString('en-US') : '';
        setForm((f) => ({ ...f, [name]: formatted }));
      }
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const car = buildCar({
      ...form,
      price: form.price.replace(/,/g, ''),
      downPayment: form.downPayment.replace(/,/g, '')
    });
    if (!car) {
      setError(dict.errorInvalid);
      return;
    }
    addCar(car);
    setForm(EMPTY);
    onClose();
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setForm(EMPTY);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl">{dict.modalTitleAdd}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-4 space-y-5">
            {/* Error */}
            {error && (
              <div role="alert" className="px-4 py-3 rounded-md bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Vehicle Type Selector */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, vehicleType: 'car' }))}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  form.vehicleType === 'car' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {dict.labelCarName?.includes('รถยนต์') || dict.labelCarName === 'Car Name' ? 'Car' : 'รถยนต์'}
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, vehicleType: 'motorcycle' }))}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  form.vehicleType === 'motorcycle' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {dict.labelCarName?.includes('รถยนต์') || dict.labelCarName === 'Car Name' ? 'Motorcycle' : 'มอเตอร์ไซค์'}
              </button>
            </div>

            {/* Car name */}
            <div className="space-y-1.5">
              <Label htmlFor="modal-name">{dict.labelCarName}</Label>
              <Input
                id="modal-name" name="name" type="text"
                value={form.name} onChange={handleChange}
                placeholder={dict.placeholderCarName}
              />
            </div>

            {/* 2-col grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="modal-price">{dict.labelPrice}</Label>
                <div className="relative">
                  <Input id="modal-price" name="price" type="text"
                    value={form.price} onChange={handleChange} placeholder="1,500,000"
                    className="pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">฿</span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="modal-down">{dict.labelDown}</Label>
                <div className="relative">
                  <Input id="modal-down" name="downPayment" type="text"
                    value={form.downPayment} onChange={handleChange} placeholder="0"
                    className="pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">฿</span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="modal-rate">{dict.labelRate}</Label>
                <div className="relative">
                  <Input id="modal-rate" name="annualRate" type="number" min="0" max="50" step="0.01"
                    value={form.annualRate} onChange={handleChange} placeholder="3.99"
                    className="pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="modal-start">{dict.labelStartDate}</Label>
                <Input id="modal-start" name="startDate" type="date"
                  value={form.startDate} onChange={handleChange} />
              </div>
            </div>

            {/* Term presets */}
            <div className="space-y-3">
              <Label>{dict.labelTerm} / {dict.labelTermPresets}</Label>
              <div className="flex flex-wrap gap-2">
                {TERM_PRESETS.map((m) => {
                  const active = form.termMonths === String(m);
                  return (
                    <Button
                      key={m} type="button" variant={active ? "default" : "outline"} size="sm"
                      onClick={() => setForm((f) => ({ ...f, termMonths: String(m) }))}
                    >
                      {m} {dict.unitMonths}
                    </Button>
                  );
                })}
              </div>
              <div className="relative">
                <Input
                  id="modal-term" name="termMonths" type="number" min="1" max="360" step="1"
                  value={form.termMonths} onChange={handleChange}
                  placeholder="60" className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {dict.unitMonths}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/50">
            <Button type="button" variant="ghost" onClick={() => handleClose(false)} className="flex-1 sm:flex-none">
              {dict.btnCancel}
            </Button>
            <Button type="submit" id="btn-modal-save" className="flex-1 sm:flex-none">
              {dict.btnSave}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
