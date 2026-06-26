import { Suspense } from 'react';
import AdminLoginPage from './AdminLoginClient';

export default function LoginPage() {
  return (
    <Suspense>
      <AdminLoginPage />
    </Suspense>
  );
}
