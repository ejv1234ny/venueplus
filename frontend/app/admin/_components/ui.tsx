'use client';
/**
 * Shared building blocks for the admin Mission Control area:
 * money formatting, consistent risk/decision color semantics, a 10s polling
 * hook with loading/error state, and lightweight SVG/CSS-bar charts (no chart
 * dependency added). Folder is `_components` so Next treats it as private (not
 * a route).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export const fmtMoney = (usd: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd || 0);

export const fmtDateTime = (s?: string | null) =>
  s ? new Date(s).toLocaleString() : '—';

export function errMsg(e: any): string {
  return (
    e?.response?.data?.detail ||
    e?.message ||
    'Something went wrong'
  );
}

// ---- Polling hook: re-fetches every `intervalMs` (default 10s) ----
export function usePoll<T>(fn: () => Promise<T>, intervalMs = 10000) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const d = await fnRef.current();
      setData(d);
      setError(null);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    const id = setInterval(reload, intervalMs);
    return () => clearInterval(id);
  }, [reload, intervalMs]);

  return { data, error, loading, reload };
}

// ---- Loading / error gate (never blank-screens on error) ----
export function StateBlock({
  loading,
  error,
  hasData,
  children,
}: {
  loading: boolean;
  error: string | null;
  hasData: boolean;
  children: React.ReactNode;
}) {
  if (error && !hasData) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        ⚠ {error}
        <span className="text-red-500 text-sm"> — retrying…</span>
      </div>
    );
  }
  if (loading && !hasData) {
    return <LoadingSpinner message="Loading…" />;
  }
  return (
    <>
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded px-3 py-2 text-sm mb-3">
          ⚠ {error} — showing last good data
        </div>
      )}
      {children}
    </>
  );
}

// ---- Risk / decision color semantics (consistent everywhere) ----
export const RISK_STYLES: Record<string, string> = {
  read: 'bg-neutral-100 text-neutral-700',
  internal_write: 'bg-sky-100 text-sky-800',
  outbound: 'bg-amber-100 text-amber-800',
  financial: 'bg-orange-100 text-orange-800',
  money_movement: 'bg-red-100 text-red-700',
  legal: 'bg-purple-100 text-purple-700',
};

export const DECISION_STYLES: Record<string, string> = {
  auto: 'bg-green-100 text-green-700',
  require_approval: 'bg-amber-100 text-amber-800',
  deny: 'bg-red-100 text-red-700',
};

const STATUS_STYLES: Record<string, string> = {
  done: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  running: 'bg-sky-100 text-sky-800',
  planned: 'bg-neutral-100 text-neutral-600',
  needs_approval: 'bg-amber-100 text-amber-800',
  blocked: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
};

function Pill({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label.replace(/_/g, ' ')}
    </span>
  );
}

export const RiskBadge = ({ risk }: { risk: string }) => (
  <Pill label={risk} cls={RISK_STYLES[risk] || 'bg-neutral-100 text-neutral-700'} />
);
export const DecisionBadge = ({ decision }: { decision: string }) => (
  <Pill label={decision} cls={DECISION_STYLES[decision] || 'bg-neutral-100 text-neutral-700'} />
);
export const StatusBadge = ({ status }: { status: string }) => (
  <Pill label={status} cls={STATUS_STYLES[status] || 'bg-neutral-100 text-neutral-700'} />
);

// ---- KPI card ----
export function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className={`text-2xl font-bold ${accent || ''}`}>{value}</p>
    </div>
  );
}

// ---- Lightweight CSS bar chart ----
export function BarChart({
  points,
  format,
}: {
  points: { date: string; value: number }[];
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));
  return (
    <div>
      <div className="flex items-end gap-px h-40 border-b border-neutral-200">
        {points.map((p) => (
          <div
            key={p.date}
            className="flex-1 flex items-end h-full"
            title={`${p.date}: ${format ? format(p.value) : p.value}`}
          >
            <div
              className="w-full bg-primary-500/80 hover:bg-primary-600 rounded-t transition-colors"
              style={{ height: `${Math.max(p.value > 0 ? 4 : 0, (p.value / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-neutral-400 mt-1">
        <span>{points[0]?.date}</span>
        <span>{points[points.length - 1]?.date}</span>
      </div>
    </div>
  );
}
