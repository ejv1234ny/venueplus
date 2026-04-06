'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { authExtras } from '@/lib/api';

function VerifyInner() {
  const params = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'ok' | 'err'>('loading');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('err'); setMsg('Missing token'); return; }
    authExtras.verifyEmail(token)
      .then(() => { setStatus('ok'); setMsg('Email verified! You can now log in.'); })
      .catch((e) => { setStatus('err'); setMsg(e.response?.data?.detail || 'Verification failed'); });
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Email verification</h1>
        <p className={status === 'err' ? 'text-red-600' : 'text-neutral-700'}>{msg || 'Verifying...'}</p>
        {status === 'ok' && (
          <a href="/login" className="btn-primary inline-block mt-6">Go to login</a>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyInner /></Suspense>;
}
