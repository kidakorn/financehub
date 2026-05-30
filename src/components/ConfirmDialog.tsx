'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open:       boolean;
  title:      string;
  message?:   string | ReactNode;
  confirmLabel?: string;
  cancelLabel?:  string;
  variant?:   'danger' | 'warning' | 'info';
  onConfirm:  () => void;
  onCancel:   () => void;
}

const VARIANT_STYLES = {
  danger:  { icon: '🗑️', ring: 'ring-red-100',    btn: 'destructive' as const, iconBg: 'bg-red-50' },
  warning: { icon: '⚠️', ring: 'ring-amber-100', btn: 'default'     as const, iconBg: 'bg-amber-50' },
  info:    { icon: 'ℹ️', ring: 'ring-blue-100',  btn: 'default'     as const, iconBg: 'bg-blue-50' },
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [visible, setVisible] = useState(false);
  const v = VARIANT_STYLES[variant];

  // Animate in/out
  useEffect(() => {
    if (open) {
      // Next tick so CSS transition fires
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open && !visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className={`
        fixed inset-0 z-[200] flex items-center justify-center p-4
        transition-opacity duration-200
        ${visible && open ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Panel */}
      <div
        className={`
          relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl
          ring-4 ${v.ring}
          transition-all duration-200 ease-out
          ${visible && open
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'}
        `}
      >
        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full ${v.iconBg} flex items-center justify-center mb-4 text-2xl`}>
            {v.icon}
          </div>

          <h2 id="confirm-title" className="text-base font-bold text-gray-900 mb-1">{title}</h2>
          {message && (
            <div className="text-sm text-gray-500 leading-relaxed">{message}</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={v.btn === 'destructive' ? 'destructive' : 'default'}
            className={`flex-1 ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white border-0' : ''}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
