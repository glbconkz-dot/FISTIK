import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { expertiseGate, findProject } from "../lib/catalog";

export default defineTool({
  description: prompt`
    Deterministic Gosexpertiza gate. Returns whether a project may be
    submitted to state expertise, the blocking drawing sets, and warnings.
    Call this instead of guessing completeness. Never say a project can
    go to expertise unless this tool returns canSubmitExpertise true.
  `,
  inputSchema: z.object({
    project: z.string().min(1),
  }),
  effect: "read",
  async execute({ project }) {
    const found = findProject(project);
    if (!found) {
      return {
        found: false as const,
        hint: "Unknown project. Call project_status without a name to learn ids, or use four-seasons, union, halavet, alma-medical.",
      };
    }
    return { found: true as const, ...expertiseGate(found) };
  },
});
