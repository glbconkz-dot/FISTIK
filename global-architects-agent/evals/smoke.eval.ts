import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  description: "Expertise gate is called before claiming a project can be submitted.",
  async test(t) {
    await t.send(
      "HALAVET KZ ekspertize gonderilebilir mi? Eksik ciltleri listele.",
    );
    t.succeeded();
    t.calledTool("expertise_gate");
  },
});
