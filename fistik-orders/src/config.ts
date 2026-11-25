import Constants from 'expo-constants';

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'https://fistik.kz'
).replace(/\/$/, '');

const extraSecret =
  typeof Constants.expoConfig?.extra?.managerSecret === 'string'
    ? Constants.expoConfig.extra.managerSecret
    : '';

export const MANAGER_SECRET = (
  process.env.EXPO_PUBLIC_MANAGER_SECRET ||
  extraSecret ||
  ''
).trim();

export function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${MANAGER_SECRET}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}
