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
