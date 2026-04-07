'use client';
import { useEffect, useState } from 'react';
import { paymentsAPI } from '@/lib/api';

export default function PayoutsPage() {
  const [acct, setAcct] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    paymentsAPI.accountStatus().then(r => setAcct(r.data));
    paymentsAPI.myPayouts().then(r => setPayouts(r.data));
  }, []);

  const onboard = async () => {
    const r = await paymentsAPI.onboardingLink();
    if (r.data.url) window.location.href = r.data.url;
  };

  const totalEarned = payouts.filter(p => p.status === 'sent')
    .reduce((s, p) => s + p.net, 0);
  const pending = payouts.filter(p => ['pending','scheduled'].includes(p.status))
    .reduce((s, p) => s + p.net, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Payouts</h1>

      {acct && !acct.payouts_enabled && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-6">
          <h2 className="font-bold mb-2">Connect your bank to get paid</h2>
          <p className="text-sm mb-4">VenuePlus uses Stripe Connect to send your earnings.
            You'll be redirected to a secure form to add your details.</p>
          <button onClick={onboard} className="btn-primary">Set up payouts</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-neutral-500">Total earned</p>
          <p className="text-2xl font-bold">${totalEarned.toFixed(2)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-neutral-500">Pending</p>
          <p className="text-2xl font-bold">${pending.toFixed(2)}</p>
        </div>
      </div>

      <table className="w-full bg-white border rounded text-sm">
        <thead><tr className="border-b">
          <th className="p-2 text-left">Booking</th><th>Type</th><th>Gross</th>
          <th>Fee</th><th>Net</th><th>Status</th>
        </tr></thead>
        <tbody>
          {payouts.map((po) => (
            <tr key={po.id} className="border-b">
              <td className="p-2">#{po.booking_id}</td>
              <td className="text-center">{po.type}</td>
              <td className="text-right">${po.gross.toFixed(2)}</td>
              <td className="text-right text-neutral-500">-${po.platform_fee.toFixed(2)}</td>
              <td className="text-right font-bold">${po.net.toFixed(2)}</td>
              <td className="text-center">{po.status}</td>
            </tr>
          ))}
          {payouts.length === 0 && (
            <tr><td colSpan={6} className="p-4 text-center text-neutral-500">No payouts yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
