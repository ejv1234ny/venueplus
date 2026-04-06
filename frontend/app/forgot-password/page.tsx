'use client';
import { useState } from 'react';
import { authExtras } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authExtras.forgotPassword(email);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold mb-4">Forgot password</h1>
        {sent ? (
          <p>If an account exists for <strong>{email}</strong>, a reset link has been sent.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" className="input-field" />
            <button type="submit" className="btn-primary w-full">Send reset link</button>
          </form>
        )}
      </div>
    </div>
  );
}
