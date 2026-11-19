import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const DRAWING = new Set([".pdf", ".dwg", ".dxf", ".rvt", ".rfa", ".ifc", ".plt", ".dwf", ".dwfx"]);
const MAX_FILES = 400;
const MAX_DEPTH = 5;

export type DiskFile = { name: string; folder: string };
export type DiskScan = {
  configured: boolean;
  connected: boolean;
  root: string;
  reason: string;
  fileCount: number;
  folders: string[];
  files: DiskFile[];
};

const EMPTY: DiskScan = {
  configured: false,
  connected: false,
  root: "",
  reason:
    "Disk yolu yazılı değil. Bu ajan bulutta, GitHub’daki FISTIK kopyasında çalışıyor. Ofis disk sunucusu bu makineye bağlı değil, bu yüzden dosya taraması yok.",
  fileCount: 0,
  folders: [],
  files: [],
};

type SynoEnvelope = {
  success?: boolean;
  error?: { code?: number };
  data?: {
    sid?: string;
    shares?: SynoEntry[];
    files?: SynoEntry[];
  };
};

type SynoEntry = {
  name?: string;
  path?: string;
  isdir?: boolean;
};

export async function scanOfficeDisk(source: { root?: string; url?: string }): Promise<DiskScan> {
  const url = source.url?.trim() ?? "";
  if (url) return scanSynology(url);
  return scanDisk(source.root ?? "");
}

async function scanSynology(rawUrl: string): Promise<DiskScan> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ...EMPTY, configured: true, root: rawUrl, reason: "Disk adresi okunamadı." };
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    return { ...EMPTY, configured: true, root: parsed.host, reason: "Disk adresi https olmalı ve şifre içermemeli." };
  }
  const base = parsed.origin;
  const account = process.env.SYNO_ACCOUNT?.trim() ?? "";
  const password = process.env.SYNO_PASSWORD ?? "";
  if (!account || !password) {
    const alive = await synoCall(base, {
      api: "SYNO.FileStation.List",
      version: "2",
      method: "list_share",
    });
    if (!alive) {
      return { ...EMPTY, configured: true, root: base, reason: `Synology adresine ulaşılamadı: ${base}` };
    }
    return {
      ...EMPTY,
      configured: true,
      root: base,
      reason:
        "Synology açıldı (Global NAS). Dosya listesi oturum istiyor. Hesap bu makinede yok. Şifre sohbete yazılmaz.",
    };
  }

  const login = await synoCall(base, {
    api: "SYNO.API.Auth",
    version: "7",
    method: "login",
    account,
    passwd: password,
    session: "FileStation",
    format: "sid",
  });
  const sid = login?.data?.sid;
  if (!login?.success || !sid) {
    return {
      ...EMPTY,
      configured: true,
      root: base,
      reason: `Synology girişi kabul edilmedi (${login?.error?.code ?? "yanıt yok"}). Dosya listesi alınamadı.`,
    };
  }

  const files: DiskFile[] = [];
  const folders = new Set<string>();
  try {
    const shares = await synoCall(base, {
      api: "SYNO.FileStation.List",
      version: "2",
      method: "list_share",
      _sid: sid,
    });
    for (const share of shares?.data?.shares ?? []) {
      const sharePath = share.path || (share.name ? `/${share.name}` : "");
      if (!sharePath || !share.name) continue;
      folders.add(share.name);
      await walkSynology(base, sid, sharePath, share.name, 1, files, folders);
    }
  } finally {
    await synoCall(base, {
      api: "SYNO.API.Auth",
      version: "7",
      method: "logout",
      session: "FileStation",
      _sid: sid,
    });
  }

  return {
    configured: true,
    connected: true,
    root: base,
    reason: files.length
      ? `Synology tarandı: ${files.length} çizim dosyası.`
      : "Synology oturumu açıldı. Paylaşımlarda PDF, DWG veya RVT yok.",
    fileCount: files.length,
    folders: [...folders].sort(),
    files: files.slice(0, 80),
  };
}

async function walkSynology(
  base: string,
  sid: string,
  folderPath: string,
  top: string,
  depth: number,
  files: DiskFile[],
  folders: Set<string>,
) {
  if (files.length >= MAX_FILES || depth > MAX_DEPTH) return;
  let offset = 0;
  const limit = 100;
  for (;;) {
    const page = await synoCall(base, {
      api: "SYNO.FileStation.List",
      version: "2",
      method: "list",
      folder_path: folderPath,
      offset: String(offset),
      limit: String(limit),
      _sid: sid,
    });
    const batch = page?.data?.files ?? [];
    for (const entry of batch) {
      if (files.length >= MAX_FILES) return;
      const name = entry.name ?? "";
      if (!name || name.startsWith(".") || name.startsWith("#") || name.startsWith("@")) continue;
      if (entry.isdir) {
        const next = entry.path || `${folderPath}/${name}`;
        await walkSynology(base, sid, next, top, depth + 1, files, folders);
        continue;
      }
      if (DRAWING.has(path.extname(name).toLowerCase())) {
        files.push({ name, folder: top });
      }
    }
    offset += batch.length;
    if (batch.length < limit) break;
  }
}

async function synoCall(base: string, fields: Record<string, string>): Promise<SynoEnvelope | null> {
  try {
    const response = await fetch(`${base}/webapi/entry.cgi`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(fields),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return null;
    return (await response.json()) as SynoEnvelope;
  } catch {
    return null;
  }
}

export async function scanDisk(root: string): Promise<DiskScan> {
  const trimmed = root.trim();
  if (!trimmed) return EMPTY;
  try {
    const info = await stat(trimmed);
    if (!info.isDirectory()) {
      return { ...EMPTY, configured: true, root: trimmed, reason: `Bu yol klasör değil: ${trimmed}` };
    }
  } catch {
    return {
      ...EMPTY,
      configured: true,
      root: trimmed,
      reason: `Yol bu makinede yok: ${trimmed}. Ajan ofis ağını görmüyor. Disk, ajanın çalıştığı bilgisayarda açık olmalı.`,
    };
  }

  const files: DiskFile[] = [];
  const folders = new Set<string>();
  async function walk(dir: string, depth: number) {
    if (files.length >= MAX_FILES || depth > MAX_DEPTH) return;
    const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (files.length >= MAX_FILES) return;
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (depth === 0) folders.add(entry.name);
        await walk(full, depth + 1);
      } else if (DRAWING.has(path.extname(entry.name).toLowerCase())) {
        const rel = path.relative(trimmed, full);
        const folder = rel.split(path.sep)[0] ?? "";
        files.push({ name: entry.name, folder });
        if (folder && folder !== entry.name) folders.add(folder);
      }
    }
  }
  await walk(trimmed, 0);
  return {
    configured: true,
    connected: true,
    root: trimmed,
    reason: files.length
      ? `${files.length} çizim dosyası tarandı.`
      : "Klasör açık. İçinde PDF, DWG veya RVT yok.",
    fileCount: files.length,
    folders: [...folders].sort(),
    files: files.slice(0, 80),
  };
}

export function filesForProject(scan: DiskScan, projectId: string): DiskFile[] {
  const tokens = projectId.split("-").filter((token) => token.length > 3);
  if (!scan.connected || tokens.length === 0) return [];
  return scan.files.filter((file) => {
    const hay = `${file.folder} ${file.name}`.toLowerCase();
    return tokens.some((token) => hay.includes(token));
  });
}
