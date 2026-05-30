'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id:       string;
  message:  string;
  variant:  ToastVariant;
  duration: number;
}

interface ToastCtx {
  toasts:  Toast[];
  toast:   (message: string, variant?: ToastVariant, duration?: number) => void;
  dismiss: (id: string) => void;
}

/* ─── Context ────────────────────────────────────────────────────────────────── */

const ToastContext = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = 'info', duration = 3500) => {
    const id = `toast-${++counterRef.current}`;
    setToasts(prev => [...prev, { id, message, variant, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

/* ─── Individual Toast Item ─────────────────────────────────────────────────── */

const ICONS: Record<ToastVariant, JSX.Element> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" fill="currentColor" opacity=".15"/>
      <path d="M4.5 8l2.5 2.5L11.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" fill="currentColor" opacity=".15"/>
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 2L14.5 13H1.5L8 2z" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="8" cy="11.5" r="0.75" fill="currentColor"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" fill="currentColor" opacity=".15"/>
      <path d="M8 7v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="8" cy="4.5" r="0.75" fill="currentColor"/>
    </svg>
  ),
};

const COLORS: Record<ToastVariant, { bg: string; text: string; bar: string; close: string }> = {
  success: { bg: 'bg-white border-green-200',  text: 'text-green-700',  bar: 'bg-green-500',  close: 'text-green-400 hover:text-green-700' },
  error:   { bg: 'bg-white border-red-200',    text: 'text-red-600',    bar: 'bg-red-500',    close: 'text-red-400 hover:text-red-600' },
  warning: { bg: 'bg-white border-amber-200',  text: 'text-amber-700',  bar: 'bg-amber-400',  close: 'text-amber-400 hover:text-amber-700' },
  info:    { bg: 'bg-white border-blue-200',   text: 'text-blue-600',   bar: 'bg-blue-500',   close: 'text-blue-400 hover:text-blue-600' },
};

function ToastItem({ toast: t, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const c = COLORS[t.variant];

  // Enter animation
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Progress bar + auto-dismiss
  useEffect(() => {
    const start = Date.now();
    let raf: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / t.duration) * 100);
      setProgress(pct);
      if (pct > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        handleDismiss();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.duration]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => dismiss(t.id), 300);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        relative flex items-start gap-3 min-w-[260px] max-w-sm w-full
        rounded-xl border shadow-lg px-4 py-3 overflow-hidden
        transition-all duration-300 ease-out
        ${c.bg}
        ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
      `}
    >
      {/* Icon */}
      <span className={`flex-shrink-0 mt-0.5 ${c.text}`}>{ICONS[t.variant]}</span>

      {/* Message */}
      <p className={`flex-1 text-sm font-medium leading-snug ${c.text}`}>{t.message}</p>

      {/* Close */}
      <button
        onClick={handleDismiss}
        className={`flex-shrink-0 mt-0.5 transition-colors ${c.close}`}
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Progress bar */}
      <span
        className={`absolute bottom-0 left-0 h-0.5 transition-none ${c.bar}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/* ─── Container ─────────────────────────────────────────────────────────────── */

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-5 right-4 sm:right-5 z-[100] flex flex-col gap-2.5 items-end pointer-events-none"
    >
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} dismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
