import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { findProject } from "../lib/catalog";

export default defineTool({
  description: prompt`
    Read a KA Global Architects studio project: stage, client, city, and
    every drawing set status. Use before answering what is missing or who
    should work next. Pass the project id, code, or name.
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
        hint: "Known ids: four-seasons, union, borusan-karaganda, halavet, orhun-clinic, new-time, alma-medical",
      };
    }
    return {
      found: true as const,
      id: found.id,
      code: found.code,
      name: found.name,
      client: found.client,
      city: found.city,
      typology: found.typology,
      stage: found.stage,
      year: found.year,
      sections: found.sections.map((section) => ({
        code: section.code,
        nameRu: section.nameRu,
        nameTr: section.nameTr,
        requiredForExpertise: section.requiredForExpertise,
        status: section.status,
      })),
    };
  },
});
