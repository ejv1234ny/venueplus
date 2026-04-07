'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminAPI } from '@/lib/api';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    const params = statusFilter ? { status: statusFilter } : {};
    adminAPI.payments(params).then(r => setPayments(r.data)).catch(() => {});
    adminAPI.payouts({}).then(r => setPayouts(r.data)).catch(() => {});
  };
  useEffect(load, [statusFilter]);

  const refund = async (id: number) => {
    const pct = prompt('Refund percent (1-100)?', '100');
    if (!pct) return;
    await adminAPI.manualRefund(id, Number(pct));
    load();
  };

  const retry = async (id: number) => {
    await adminAPI.retryPayout(id);
    load();
  };

  const totalGmv = payments.filter(p => ['captured','partially_refunded','refunded'].includes(p.status))
    .reduce((s, p) => s + p.total, 0);
  const totalFees = payments.filter(p => ['captured','partially_refunded','refunded'].includes(p.status))
    .reduce((s, p) => s + p.platform_fee, 0);
  const totalRefunded = payments.reduce((s, p) => s + p.refunded, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Admin · Payments & Payouts</h1>

      <section className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-neutral-500">GMV (captured)</p>
          <p className="text-2xl font-bold">${totalGmv.toFixed(2)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-neutral-500">Platform fees earned</p>
          <p className="text-2xl font-bold">${totalFees.toFixed(2)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-neutral-500">Refunded</p>
          <p className="text-2xl font-bold">${totalRefunded.toFixed(2)}</p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Payments</h2>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field max-w-xs">
            <option value="">All statuses</option>
            {['pending','authorized','captured','partially_refunded','refunded','failed','canceled'].map(s =>
              <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <table className="w-full bg-white border rounded text-sm">
          <thead><tr className="border-b">
            <th className="p-2 text-left">ID</th>
            <th>Booking</th><th>Subtotal</th><th>Fee</th><th>Stripe</th>
            <th>Total</th><th>Refunded</th><th>Status</th><th>Action</th>
          </tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-2">{p.id}</td>
                <td className="text-center">
                  <Link href={`/bookings/${p.booking_id}`} className="text-primary-600 underline">
                    #{p.booking_id}
                  </Link>
                </td>
                <td className="text-right">${p.subtotal.toFixed(2)}</td>
                <td className="text-right text-neutral-500">${p.platform_fee.toFixed(2)}</td>
                <td className="text-right text-neutral-500">${p.stripe_fee.toFixed(2)}</td>
                <td className="text-right font-bold">${p.total.toFixed(2)}</td>
                <td className="text-right text-red-600">${p.refunded.toFixed(2)}</td>
                <td className="text-center text-xs">{p.status}</td>
                <td className="text-center">
                  {['captured','authorized','partially_refunded'].includes(p.status) && (
                    <button onClick={() => refund(p.id)} className="text-red-600 text-xs underline">
                      Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={9} className="p-4 text-center text-neutral-500">No payments</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">Payouts</h2>
        <table className="w-full bg-white border rounded text-sm">
          <thead><tr className="border-b">
            <th className="p-2 text-left">ID</th>
            <th>Booking</th><th>Recipient</th><th>Type</th>
            <th>Gross</th><th>Net</th><th>Status</th><th>Action</th>
          </tr></thead>
          <tbody>
            {payouts.map((po) => (
              <tr key={po.id} className="border-b">
                <td className="p-2">{po.id}</td>
                <td className="text-center">#{po.booking_id}</td>
                <td className="text-center">{po.recipient_user_id}</td>
                <td className="text-center text-xs">{po.recipient_type}</td>
                <td className="text-right">${po.gross.toFixed(2)}</td>
                <td className="text-right font-bold">${po.net.toFixed(2)}</td>
                <td className="text-center text-xs">{po.status}</td>
                <td className="text-center">
                  {['failed','pending'].includes(po.status) && (
                    <button onClick={() => retry(po.id)} className="text-blue-600 text-xs underline">
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {payouts.length === 0 && (
              <tr><td colSpan={8} className="p-4 text-center text-neutral-500">No payouts</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
