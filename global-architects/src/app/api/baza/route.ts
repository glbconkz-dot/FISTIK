import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { filesForProject, scanDisk } from "@/lib/disk-scan";

export const dynamic = "force-dynamic";

type ProjectFile = {
  id: string;
  name: string;
  learnFrom: boolean;
  client: string;
  city: string;
  typology: string;
  outcome: string;
  copyRules: string[];
};

export async function GET() {
  const root = path.join(process.cwd(), "baza");
  const entries = await readdir(root, { withFileTypes: true });
  const projects = [];
  for (const entry of entries.filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const folder = path.join(root, entry.name);
    const raw = await readFile(path.join(folder, "project.json"), "utf8");
    const project = JSON.parse(raw) as ProjectFile;
    const originalDir = path.join(folder, "original");
    const originalFiles = (await readdir(originalDir).catch(() => [] as string[])).filter(
      (name) => name !== ".gitkeep",
    );
    const album = await readFile(path.join(folder, "album-index.md"), "utf8").catch(() => "");
    projects.push({ ...project, originalFiles, album });
  }
  const diskFile = JSON.parse(await readFile(path.join(root, "disk.json"), "utf8").catch(() => "{}")) as {
    root?: string;
  };
  const disk = await scanDisk(process.env.DISK_ROOT || diskFile.root || "");
  const projectsWithDisk = projects.map((project) => ({
    ...project,
    diskFiles: filesForProject(disk, project.id),
  }));
  return Response.json({ projects: projectsWithDisk, disk });
}
