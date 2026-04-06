'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { providersAPI } from '@/lib/api';

function ClaimInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = params.get('token');
    if (!token) { setErr('Missing token'); return; }
    try {
      await providersAPI.claimConfirm(token, pw);
      router.push('/login');
    } catch (e: any) {
      setErr(e.response?.data?.detail || 'Failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold mb-2">Claim your listing</h1>
        <p className="text-neutral-600 mb-4">Set a password to take ownership of this VenuePlus listing.</p>
        {err && <p className="text-red-600 mb-2">{err}</p>}
        <form onSubmit={submit} className="space-y-4">
          <input type="password" minLength={8} required value={pw}
            onChange={(e) => setPw(e.target.value)} className="input-field"
            placeholder="New password (min 8 chars)" />
          <button type="submit" className="btn-primary w-full">Claim listing</button>
        </form>
      </div>
    </div>
  );
}

export default function ClaimPage() {
  return <Suspense><ClaimInner /></Suspense>;
}
