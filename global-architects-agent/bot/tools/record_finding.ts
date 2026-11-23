import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";

type Finding = {
  project: string;
  department: string;
  code: string;
  severity: "block" | "comment" | "note";
  text: string;
  at: string;
};

export default defineTool({
  description: prompt`
    Record a review finding on a drawing set. Same project + department +
    code + text is stored once. Use after a department subagent reviews a
    section. This is the studio journal, not a substitute for expertise_gate.
  `,
  inputSchema: z.object({
    project: z.string().min(1),
    department: z.enum([
      "pm",
      "architecture",
      "structures",
      "mep",
      "bim",
      "documentation",
      "expertise",
    ]),
    code: z.string().min(1),
    severity: z.enum(["block", "comment", "note"]),
    text: z.string().min(4),
  }),
  effect: "idempotent",
  async execute({ project, department, code, text, severity }, ctx) {
    const key = `finding:${project}:${department}:${code}:${text}`;
    const existing = await ctx.host.kv.get(key);
    if (existing) {
      return { stored: false as const, duplicate: true as const, finding: existing };
    }
    const finding: Finding = {
      project,
      department,
      code,
      severity,
      text,
      at: new Date().toISOString(),
    };
    await ctx.host.kv.put(key, finding);
    const indexKey = `findings:${project}`;
    const rawIndex = await ctx.host.kv.get(indexKey);
    const index = Array.isArray(rawIndex)
      ? rawIndex.filter((item): item is string => typeof item === "string")
      : [];
    if (!index.includes(key)) {
      index.push(key);
      await ctx.host.kv.put(indexKey, index);
    }
    return { stored: true as const, duplicate: false as const, finding };
  },
});
