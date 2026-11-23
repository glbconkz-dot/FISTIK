import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { filesForProject, scanOfficeDisk } from "../../../global-architects/src/lib/disk-scan";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../global-architects/baza");

type ProjectFile = {
  id: string;
  name: string;
  learnFrom: boolean;
  outcome: string;
  copyRules: string[];
  client?: string;
  city?: string;
  typology?: string;
};

async function readOne(id: string) {
  const folder = path.join(root, id);
  const project = JSON.parse(await readFile(path.join(folder, "project.json"), "utf8")) as ProjectFile;
  const album = await readFile(path.join(folder, "album-index.md"), "utf8").catch(() => "");
  const originalFiles = (await readdir(path.join(folder, "original")).catch(() => [] as string[])).filter(
    (name) => name !== ".gitkeep",
  );
  return {
    ...project,
    album,
    originalFiles,
    originalsPresent: originalFiles.length > 0,
  };
}

export default defineTool({
  description: prompt`
    Read the finished-project base before producing 3D, OPZ, AP, MEP, or a
    KZ filing. Pass a project id, or "list" to see every record.
    learnFrom false means the job is still open: do not copy its album.
    If originalsPresent is false and disk.connected is false, you have only
    the portfolio note. The office disk is not on this machine. Do not invent
    sheets from a drawing you have not read. Pass "disk" to scan the office
    folder named in baza/disk.json.
  `,
  inputSchema: z.object({
    project: z.string().min(1),
  }),
  effect: "read",
  async execute({ project }) {
    const diskFile = JSON.parse(await readFile(path.join(root, "disk.json"), "utf8").catch(() => "{}")) as {
      root?: string;
      url?: string;
    };
    const disk = await scanOfficeDisk({
      root: process.env.DISK_ROOT || diskFile.root || "",
      url: process.env.SYNO_URL || diskFile.url || "",
    });
    const needle = project.trim().toLowerCase();
    if (needle === "disk") return { found: true as const, disk };
    const ids = (await readdir(root, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    if (needle === "list" || needle === "all") {
      const records = [];
      for (const id of ids) records.push({ ...(await readOne(id)), diskFiles: filesForProject(disk, id) });
      return { found: true as const, disk, projects: records };
    }
    const id = ids.find((item) => item === needle);
    if (!id) {
      return { found: false as const, ids, disk };
    }
    return { found: true as const, disk, project: { ...(await readOne(id)), diskFiles: filesForProject(disk, id) } };
  },
});
