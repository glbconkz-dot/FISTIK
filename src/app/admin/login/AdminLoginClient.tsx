'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminBrand } from '@/components/admin/AdminBrand';
import { signInAdmin } from '@/app/actions/orders';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(() => {
    const code = searchParams.get('error');
    if (code === 'unauthorized') {
      return 'You are not authorized to access the admin panel.';
    }
    if (code === 'setup') {
      return 'Supabase is not configured. Copy .env.example to .env.local, add your Supabase URL and anon key, then restart npm run dev.';
    }
    return '';
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const result = await signInAdmin(
      form.get('email') as string,
      form.get('password') as string
    );

    if (!result.success) {
      setError(result.error ?? 'Login failed');
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="luxury-card w-full max-w-md p-8">
        <div className="mx-auto flex justify-center rounded-2xl bg-brand px-6 py-4">
          <AdminBrand logoHeight={52} />
        </div>
        <p className="mt-4 text-center text-sm text-muted">Admin Login</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input name="email" type="email" className="input-field" required autoComplete="email" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              className="input-field"
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
