#!/usr/bin/env node
/**
 * Vercel ortam değişkenlerini API ile yükler (CLI engellendiğinde).
 * node scripts/push-vercel-env.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envFile = join(root, 'deploy', 'VERCEL-ORTAM-DEGISKENLERI.env');
const authPath = join(
  homedir(),
  'AppData',
  'Roaming',
  'xdg.data',
  'com.vercel.cli',
  'auth.json'
);

function loadAuth() {
  if (!existsSync(authPath)) throw new Error('Vercel auth.json bulunamadı — önce npx vercel login');
  const { token } = JSON.parse(readFileSync(authPath, 'utf8'));
  if (!token) throw new Error('Vercel token yok');
  return token;
}

function loadEnvFile() {
  const vars = {};
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    vars[line.slice(0, i).trim()] = line.slice(i + 1);
  }
  return vars;
}

async function api(token, path, options = {}) {
  const res = await fetch(`https://api.vercel.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${path}: ${data.error?.message ?? text}`);
  }
  return data;
}

const token = loadAuth();
const vars = loadEnvFile();

const projectId = 'prj_DRNjU6vTSGnbqM7tL7Zfo5WuMNJE';
const teamId = 'team_RgeAmllCt7wqUfCcHWQyT0a7';

const existing = await api(token, `/v9/projects/${projectId}/env?teamId=${teamId}`);
const byKey = new Map((existing.envs ?? []).map((e) => [e.key, e]));

function isSensitive(key) {
  return /SECRET|KEY|PIN|PASSWORD|SUPABASE|TOKEN/i.test(key);
}

function targetsFor(key) {
  // Vercel hassas değişkenleri development'a izin vermiyor
  if (isSensitive(key)) return ['production', 'preview'];
  return ['production', 'preview', 'development'];
}

for (const [key, value] of Object.entries(vars)) {
  const current = byKey.get(key);
  const targets = targetsFor(key);
  if (current) {
    await api(token, `/v9/projects/${projectId}/env/${current.id}?teamId=${teamId}`, {
      method: 'PATCH',
      body: JSON.stringify({ value, target: targets }),
    });
    console.log(`✅ güncellendi: ${key}`);
  } else {
    await api(token, `/v9/projects/${projectId}/env?teamId=${teamId}`, {
      method: 'POST',
      body: JSON.stringify({
        key,
        value,
        type: isSensitive(key) ? 'encrypted' : 'plain',
        target: targets,
      }),
    });
    console.log(`✅ eklendi: ${key}`);
  }
}

console.log('\nRedeploy başlatılıyor...');
const deployments = await api(
  token,
  `/v6/deployments?projectId=${projectId}&teamId=${teamId}&limit=1&target=production`
);
const latest = deployments.deployments?.[0];
if (latest?.uid) {
  const redeploy = await api(token, `/v13/deployments?teamId=${teamId}`, {
    method: 'POST',
    body: JSON.stringify({
      deploymentId: latest.uid,
      name: 'fistik',
      target: 'production',
    }),
  });
  console.log(`✅ Redeploy tetiklendi: ${redeploy.url ?? latest.url}`);
} else {
  console.log('⚠ Son deployment bulunamadı — Vercel panelden Redeploy yapın');
}
