# KA Global Architects — GIP ajanı

Parent ajan stüdyo masasıdır. Alt ajanlar: `architecture`, `structures`, `mep`, `documentation`, `expertise`.

```bash
cd global-architects-agent
npx @grok/agent-sdk validate --dir .
npx @grok/agent-sdk tool call expertise_gate --dir . --input '{"project":"halavet"}'
npx @grok/agent-sdk run --dir . --message "HALAVET ekspertize gonderilebilir mi?"
npx @grok/agent-sdk dev --dir .
```

`run` ve playground için Cursor oturumu gerekir. `validate` / `tool call` gerekmez.

Bu ajanı FISTIK pastane deposunun PR’larına bağlamayın. Çizim git ağacı için `github-docs` skill’ine bakın.
