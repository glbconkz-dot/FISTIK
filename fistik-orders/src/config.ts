import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'https://fistik.kz'
).replace(/\/$/, '');

const extraSecret =
  typeof Constants.expoConfig?.extra?.managerSecret === 'string'
    ? Constants.expoConfig.extra.managerSecret
    : '';

const bakedSecret = (
  process.env.EXPO_PUBLIC_MANAGER_SECRET ||
  extraSecret ||
  ''
).trim();

const SECRET_KEY = 'fistik.manager.secret';

let runtimeSecret = bakedSecret;

export function getManagerSecret(): string {
  return runtimeSecret;
}

export function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getManagerSecret()}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export async function loadStoredSecret(): Promise<string> {
  if (runtimeSecret) return runtimeSecret;
  try {
    const stored = (await SecureStore.getItemAsync(SECRET_KEY))?.trim() ?? '';
    if (stored) runtimeSecret = stored;
  } catch {
    // SecureStore unavailable (web / first launch)
  }
  return runtimeSecret;
}

export async function saveManagerSecret(value: string): Promise<void> {
  const next = value.trim();
  runtimeSecret = next;
  if (next) {
    await SecureStore.setItemAsync(SECRET_KEY, next);
  } else {
    await SecureStore.deleteItemAsync(SECRET_KEY);
  }
}
