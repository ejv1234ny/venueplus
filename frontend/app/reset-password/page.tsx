'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authExtras } from '@/lib/api';

function ResetInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = params.get('token');
    if (!token) { setError('Missing token'); return; }
    try {
      await authExtras.resetPassword(token, password);
      router.push('/login');
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold mb-4">Reset password</h1>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          <input type="password" required minLength={8} value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min 8 chars)" className="input-field" />
          <button type="submit" className="btn-primary w-full">Set new password</button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetInner /></Suspense>;
}
