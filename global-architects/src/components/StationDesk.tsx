"use client";

import { useEffect, useState } from "react";
import { DOC_SEED, EXAMPLES, blankJob, deliver, type StationJob } from "@/lib/station";

const STORAGE_KEY = "ga-result-v2";

type BaseRecord = {
  id: string;
  name: string;
  learnFrom: boolean;
  outcome: string;
  copyRules: string[];
};

type Draft = {
  name: string;
  client: string;
  floors: string;
  area: string;
  typology: string;
  exampleId: string;
  plans: string;
  inHand: string[];
};

const EMPTY: Draft = {
  name: "",
  client: "",
  floors: "",
  area: "",
  typology: "Konut",
  exampleId: "union",
  plans: "",
  inHand: [],
};

export function StationDesk() {
  const [bases, setBases] = useState<BaseRecord[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [result, setResult] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw) as { draft: Draft; result: string };
        if (saved.draft) setDraft(saved.draft);
        if (saved.result) setResult(saved.result);
      } catch {
        /* eski masa */
      }
    }
    fetch("/api/baza")
      .then((response) => response.json())
      .then((body: { projects?: BaseRecord[] }) => {
        if (Array.isArray(body.projects) && body.projects.length) setBases(body.projects);
      })
      .catch(() => setBases([]));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, result }));
  }, [draft, result]);

  const albums = bases.length
    ? bases
    : EXAMPLES.map((item) => ({
        id: item.id,
        name: item.name,
        learnFrom: true,
        outcome: item.use,
        copyRules: [] as string[],
      }));
  const album = albums.find((item) => item.id === draft.exampleId) ?? albums[0];

  function writeResult(next = draft) {
    const plans = next.plans
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (!next.name.trim() || plans.length === 0 || !album) return;
    const job: StationJob = {
      ...blankJob({
        name: next.name.trim(),
        client: next.client.trim() || "—",
        city: "Almatı",
        floors: next.floors.trim() || "—",
        area: next.area.trim() || "—",
        typology: next.typology,
        exampleId: album.id,
      }),
      exampleName: album.name,
      exampleUse: album.outcome,
      learnFrom: album.learnFrom,
      plans: plans.map((name) => ({ id: name, name, note: "" })),
      docs: DOC_SEED.map((doc) => ({
        ...doc,
        state: next.inHand.includes(doc.id) ? "in_hand" : "missing",
      })),
    };
    const rules = [
      album.learnFrom ? "Bu albümden kopyalanır." : "Bu süren iştir. Dosya kapağı kopyalanmaz.",
      album.outcome,
      ...album.copyRules,
    ].join("\n");
    setResult(deliver(job, rules));
  }

  function toggleDoc(id: string) {
    const inHand = draft.inHand.includes(id) ? draft.inHand.filter((item) => item !== id) : [...draft.inHand, id];
    const next = { ...draft, inHand };
    setDraft(next);
    if (result) writeResult(next);
  }

  return (
    <div className="pb-16 pt-8">
      <p className="label">İş istasyonu</p>
      <h1 className="display mt-3 text-5xl italic sm:text-6xl">Sonuç.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        Plan adlarını yazın. Bir düğme 3D listesini, ОПЗ’yi, AP’yi, elektriği, mekaniği ve dosya kapağını yazar.
      </p>

      <form
        className="mt-8 grid gap-3 border border-rule p-4 sm:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          writeResult();
        }}
      >
        <input
          required
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          placeholder="İş adı"
          className="field-input border-b border-rule"
        />
        <input
          value={draft.client}
          onChange={(event) => setDraft({ ...draft, client: event.target.value })}
          placeholder="İşveren"
          className="field-input border-b border-rule"
        />
        <input
          value={draft.floors}
          onChange={(event) => setDraft({ ...draft, floors: event.target.value })}
          placeholder="Kat"
          className="field-input border-b border-rule"
        />
        <input
          value={draft.area}
          onChange={(event) => setDraft({ ...draft, area: event.target.value })}
          placeholder="Alan"
          className="field-input border-b border-rule"
        />
        <select
          value={draft.typology}
          onChange={(event) => setDraft({ ...draft, typology: event.target.value })}
          className="field-input border-b border-rule"
        >
          {["Konut", "Ofis", "Sanayi", "Sağlık", "Kamu"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          value={draft.exampleId}
          onChange={(event) => setDraft({ ...draft, exampleId: event.target.value })}
          className="field-input border-b border-rule sm:col-span-2"
        >
          {albums.map((item) => (
            <option key={item.id} value={item.id}>
              {item.learnFrom ? "Albüm" : "Süren"}: {item.name}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-charcoal px-4 py-2 text-xs tracking-[0.14em] text-paper uppercase">
          Sonucu yaz
        </button>
        <textarea
          required
          value={draft.plans}
          onChange={(event) => setDraft({ ...draft, plans: event.target.value })}
          placeholder={"Her satır bir kat planı\nkat-1.pdf\nkat-2.pdf"}
          rows={4}
          className="field-input border border-rule p-2 sm:col-span-4"
        />
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {DOC_SEED.map((doc) => {
          const on = draft.inHand.includes(doc.id);
          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => toggleDoc(doc.id)}
              className={`border px-2 py-1 text-xs ${on ? "border-charcoal text-charcoal" : "border-rule text-muted"}`}
            >
              {on ? "Var" : "Yok"} · {doc.title}
            </button>
          );
        })}
      </div>

      {album ? (
        <p className="mt-4 max-w-2xl text-sm text-muted">
          {album.learnFrom ? "Kopya albümü" : "Kopyalanmaz"}: {album.name}. {album.copyRules.join(" ")}
        </p>
      ) : null}

      {result ? (
        <pre className="mt-6 whitespace-pre-wrap border border-rule bg-paper p-4 text-xs leading-relaxed">{result}</pre>
      ) : (
        <p className="mt-6 text-sm text-muted">Sonuç burada durur.</p>
      )}
    </div>
  );
}
