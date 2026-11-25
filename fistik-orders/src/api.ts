import { API_URL, authHeaders, getManagerSecret } from './config';
import type { HealthResponse, ManagerOrder, OrdersResponse } from './types';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/api/manager/health`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`health ${res.status}`);
  }
  return (await res.json()) as HealthResponse;
}

export async function fetchOrders(): Promise<{
  orders: ManagerOrder[];
  adminUrl: string;
}> {
  if (!getManagerSecret()) {
    throw new Error('secret-missing');
  }
  const res = await fetch(`${API_URL}/api/manager/orders?limit=40`, {
    headers: authHeaders(),
  });
  if (res.status === 401) {
    throw new Error('unauthorized');
  }
  if (!res.ok) {
    throw new Error(`orders ${res.status}`);
  }
  const data = (await res.json()) as OrdersResponse;
  return {
    orders: data.orders ?? [],
    adminUrl: data.adminUrl ?? 'https://fistik.kz/admin/orders',
  };
}

export async function registerDevice(params: {
  expoPushToken: string;
  deviceName: string;
  platform: string;
}): Promise<void> {
  if (!getManagerSecret()) {
    throw new Error('secret-missing');
  }
  const res = await fetch(`${API_URL}/api/manager/register-device`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`register ${res.status} ${text.slice(0, 120)}`);
  }
}
