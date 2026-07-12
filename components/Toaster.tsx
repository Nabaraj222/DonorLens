'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

type Toast = {
  id: number;
  kind: 'success' | 'error';
  text: string;
  link?: { href: string; label: string };
};

const ToastContext = createContext<{
  push: (t: Omit<Toast, 'id'>) => void;
}>({ push: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((x) => x.id !== id)),
      8000
    );
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start justify-between gap-3 rounded-lg border p-3 text-sm shadow-lg ${
              t.kind === 'success'
                ? 'border-emerald-700 bg-emerald-950 text-emerald-200'
                : 'border-red-700 bg-red-950 text-red-200'
            }`}
          >
            <div>
              <p>{t.text}</p>
              {t.link && (
                <a
                  href={t.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block font-medium underline hover:opacity-80"
                >
                  {t.link.label}
                </a>
              )}
            </div>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
              }
              className="opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
