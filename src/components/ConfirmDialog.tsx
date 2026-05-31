'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open:       boolean;
  title:      string;
  message?:   string | ReactNode;
  confirmLabel?: string;
  cancelLabel?:  string;
  variant?:   'danger' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm:  () => void;
  onCancel:   () => void;
}

const TrashSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);
const WarningSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const InfoSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const VARIANT_STYLES = {
  danger:  { icon: <TrashSvg />,   ring: 'ring-red-100',   btn: 'destructive' as const, iconBg: 'bg-red-50' },
  warning: { icon: <WarningSvg />, ring: 'ring-amber-100', btn: 'default'     as const, iconBg: 'bg-amber-50' },
  info:    { icon: <InfoSvg />,    ring: 'ring-blue-100',  btn: 'default'     as const, iconBg: 'bg-blue-50' },
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  isLoading    = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const v = VARIANT_STYLES[variant];

  useEffect(() => setMounted(true), []);

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

  if (!mounted) return null;
  if (!open && !visible) return null;

  return createPortal(
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
          <div className={`w-12 h-12 rounded-full ${v.iconBg} flex items-center justify-center mb-4`}>
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
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={v.btn === 'destructive' ? 'destructive' : 'default'}
            className={`flex-1 ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white border-0' : ''}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
