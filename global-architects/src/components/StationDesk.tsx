"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EXAMPLES,
  STAGE_LABEL,
  STAGE_ORDER,
  blankJob,
  nextOpen,
  produce,
  type DocState,
  type StageId,
  type StationJob,
} from "@/lib/station";

const STORAGE_KEY = "ga-station-jobs";

export function StationDesk() {
  const [jobs, setJobs] = useState<StationJob[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    client: "",
    city: "Almatı",
    floors: "",
    area: "",
    typology: "Konut",
    exampleId: EXAMPLES[0].id as string,
  });
  const [planName, setPlanName] = useState("");
  const [planNote, setPlanNote] = useState("");
  const [bases, setBases] = useState<BaseRecord[]>([]);
  const [disk, setDisk] = useState<DiskScan | null>(null);
  const [bazaState, setBazaState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StationJob[];
        if (Array.isArray(parsed) && parsed.length) {
          setJobs(parsed);
          setActiveId(parsed[0].id);
        }
      } catch {
        /* boş masa */
      }
    }
    setReady(true);
    fetch("/api/baza")
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<{ projects?: BaseRecord[]; disk?: DiskScan }>;
      })
      .then((body) => {
        if (!Array.isArray(body.projects) || body.projects.length === 0) throw new Error("baza");
        setBases(body.projects);
        if (body.disk) setDisk(body.disk);
        setBazaState("ready");
        setDraft((value) =>
          body.projects!.some((item) => item.id === value.exampleId)
            ? value
            : { ...value, exampleId: body.projects!.find((item) => item.learnFrom)?.id ?? body.projects![0].id },
        );
      })
      .catch(() => {
        setBazaState("error");
        setDisk({
          configured: false,
          connected: false,
          root: "",
          reason: "Baza adresi açılmadı. /api/baza okunamadı.",
          fileCount: 0,
          folders: [],
        });
      });
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs, ready]);

  const job = jobs.find((item) => item.id === activeId) ?? null;
  const current = job ? nextOpen(job) : null;

  const planCount = job?.plans.length ?? 0;
  const missingDocs = useMemo(
    () => job?.docs.filter((doc) => doc.state === "missing").length ?? 0,
    [job],
  );

  function save(next: StationJob) {
    setJobs((list) => list.map((item) => (item.id === next.id ? next : item)));
  }

  function patchStage(stage: StageId, state: StationJob["stages"][StageId]["state"], output?: string) {
    if (!job) return;
    const stages = { ...job.stages, [stage]: { state, output: output ?? job.stages[stage].output } };
    if (state === "approved") {
      const index = STAGE_ORDER.indexOf(stage);
      const following = STAGE_ORDER[index + 1];
      if (following && stages[following].state === "locked") {
        stages[following] = { ...stages[following], state: "open" };
      }
    }
    save({ ...job, stages });
  }

  function runStage(stage: StageId) {
    if (!job) return;
    if (stage === "plans" && job.plans.length === 0) return;
    const picked = bases.find((item) => item.id === job.exampleId);
    const output = produce(job, stage, baseNote(picked, disk));
    patchStage(stage, "draft", output);
  }

  return (
    <div className="pb-16 pt-8">
      <p className="label">İş istasyonu</p>
      <h1 className="display mt-3 text-5xl italic sm:text-6xl">Plandan dosyaya.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        Kat planı girilir. Masa sırayla 3D görünüş listesini, ОПЗ’yi, AP paftalarını, elektrik ve mekanik paftalarını yazar.
        Eksik evrakı ya ister ya onayınıza bırakır. Bir sonraki adım, öncekinin onayı olmadan açılmaz.         Çizgi dosyası (DWG) bu ekrandan çıkmaz; pafta kilitlenir.
      </p>
      <DiskBanner disk={disk} />

      <form
        className="mt-8 grid gap-3 border border-rule p-4 sm:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.name.trim() || bazaState !== "ready") return;
          const created = blankJob({
            name: draft.name.trim(),
            client: draft.client.trim() || "—",
            city: draft.city.trim() || "Almatı",
            floors: draft.floors.trim() || "—",
            area: draft.area.trim() || "—",
            typology: draft.typology,
            exampleId: draft.exampleId,
          });
          setJobs((list) => [created, ...list]);
          setActiveId(created.id);
          setDraft((value) => ({ ...value, name: "", client: "" }));
        }}
      >
        <input
          required
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          placeholder="Nesne adı"
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
        <button type="submit" className="bg-charcoal px-4 py-2 text-xs tracking-[0.14em] text-paper uppercase">
          Masa aç
        </button>
        <input
          value={draft.area}
          onChange={(event) => setDraft({ ...draft, area: event.target.value })}
          placeholder="Alan"
          className="field-input border-b border-rule"
        />
        <input
          value={draft.city}
          onChange={(event) => setDraft({ ...draft, city: event.target.value })}
          placeholder="Şehir"
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
          className="field-input border-b border-rule"
        >
          {bazaState !== "ready" ? (
            <option value="">{bazaState === "loading" ? "Baza okunuyor" : "Baza okunamadı"}</option>
          ) : (
            bases.map((example) => (
              <option key={example.id} value={example.id}>
                {example.learnFrom ? "Baza" : "Süren"}: {example.name}
              </option>
            ))
          )}
        </select>
      </form>

      {jobs.length > 1 ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {jobs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={`label ${item.id === activeId ? "text-charcoal" : "text-muted"}`}
            >
              {item.name}
            </button>
          ))}
        </div>
      ) : null}

      {job ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[16rem_1fr_18rem]">
          <ol className="border border-rule">
            {STAGE_ORDER.map((stage, index) => {
              const state = job.stages[stage].state;
              return (
                <li key={stage} className={`border-b border-rule px-3 py-3 ${current === stage ? "bg-stone/40" : ""}`}>
                  <p className="label">0{index + 1}</p>
                  <p className="mt-1 text-sm">{STAGE_LABEL[stage]}</p>
                  <p className="mt-1 text-xs text-muted">{stateLabel(state)}</p>
                </li>
              );
            })}
          </ol>

          <section className="border border-rule p-4 sm:p-6">
            <BaseCard record={bases.find((item) => item.id === job.exampleId)} />
            <p className="label mt-6">{current ? STAGE_LABEL[current] : "Kapandı"}</p>
            <h2 className="mt-2 font-display text-3xl">{job.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {job.client} · {job.city} · {job.typology} · {planCount} plan · {missingDocs} eksik evrak
            </p>

            {current === "plans" || job.stages.plans.state !== "approved" ? (
              <div className="mt-6 border-t border-rule pt-4">
                <p className="label">Kat planı ekle</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    value={planName}
                    onChange={(event) => setPlanName(event.target.value)}
                    placeholder="Dosya adı, örn. kat-2.pdf"
                    className="field-input min-w-[12rem] flex-1 border-b border-rule"
                  />
                  <input
                    value={planNote}
                    onChange={(event) => setPlanNote(event.target.value)}
                    placeholder="Kat / aks notu"
                    className="field-input min-w-[10rem] flex-1 border-b border-rule"
                  />
                  <button
                    type="button"
                    className="border border-charcoal px-3 py-2 text-xs tracking-wide"
                    onClick={() => {
                      const name = planName.trim();
                      if (!name) return;
                      save({
                        ...job,
                        plans: [...job.plans, { id: crypto.randomUUID(), name, note: planNote.trim() }],
                      });
                      setPlanName("");
                      setPlanNote("");
                    }}
                  >
                    Ekle
                  </button>
                </div>
                <label className="mt-3 block text-xs text-muted">
                  Bilgisayardan seçince yalnız ad kaydolur.
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.dwg"
                    className="mt-1 block text-sm"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      save({
                        ...job,
                        plans: [...job.plans, { id: crypto.randomUUID(), name: file.name, note: planNote.trim() }],
                      });
                      event.target.value = "";
                    }}
                  />
                </label>
                <ul className="mt-4 space-y-1 text-sm">
                  {job.plans.map((plan) => (
                    <li key={plan.id} className="flex justify-between gap-3 border-b border-rule py-1">
                      <span>
                        {plan.name}
                        {plan.note ? <span className="text-muted"> — {plan.note}</span> : null}
                      </span>
                      <button
                        type="button"
                        className="text-xs text-muted"
                        onClick={() => save({ ...job, plans: job.plans.filter((item) => item.id !== plan.id) })}
                      >
                        Sil
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <StageActions
              stage={current}
              state={current ? job.stages[current].state : "approved"}
              canRun={current !== "plans" || job.plans.length > 0}
              onRun={() => current && runStage(current)}
              onAsk={() => current && patchStage(current, "waiting")}
              onApprove={() => current && patchStage(current, "approved")}
              onReturn={() => current && patchStage(current, "draft")}
            />

            {current && job.stages[current].output ? (
              <pre className="mt-6 whitespace-pre-wrap border border-rule bg-paper p-4 text-xs leading-relaxed">
                {job.stages[current].output}
              </pre>
            ) : null}
          </section>

          <aside className="border border-rule p-4">
            <p className="label">Alınacak evrak</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Örnek albüm: {bases.find((item) => item.id === job.exampleId)?.name ?? job.exampleId}. Eksik evrak işi durdurur veya onayınızla geçer.
            </p>
            <ul className="mt-4 space-y-3">
              {job.docs.map((doc) => (
                <li key={doc.id} className="border-b border-rule pb-3">
                  <p className="text-sm">{doc.title}</p>
                  <p className="mt-1 text-xs text-muted">{doc.why}</p>
                  <p className="mt-1 text-xs">{docStateLabel(doc.state)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Tiny onClick={() => setDoc(job, doc.id, "in_hand", save)}>Alındı</Tiny>
                    <Tiny onClick={() => setDoc(job, doc.id, "waiting", save)}>Onay iste</Tiny>
                    {doc.state === "waiting" ? (
                      <Tiny onClick={() => setDoc(job, doc.id, "waived", save)}>Onayla, evraksız geç</Tiny>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      ) : (
        <p className="mt-10 text-sm text-muted">Henüz masa yok. Nesne adını yazıp masa açın, kat planını ekleyin.</p>
      )}
    </div>
  );
}

type DiskScan = {
  configured: boolean;
  connected: boolean;
  root: string;
  reason: string;
  fileCount: number;
  folders: string[];
};

type BaseRecord = {
  id: string;
  name: string;
  learnFrom: boolean;
  outcome: string;
  copyRules: string[];
  originalFiles: string[];
};

function baseNote(record: BaseRecord | undefined, disk: DiskScan | null): string {
  if (!record) return "Baza kaydı yok. Örnek albüm seçin.";
  const files = record.originalFiles.length
    ? `Orijinal dosya: ${record.originalFiles.join(", ")}`
    : "Orijinal pafta yok. Yalnız portföy kaydı. Çizim uydurulmaz.";
  const gate = record.learnFrom
    ? "Bu albümden kopyalanır."
    : "Bu süren iştir. Dosya kapağı buradan kopyalanmaz.";
  const diskLine = disk?.connected
    ? `Disk tarandı: ${disk.fileCount} dosya.`
    : (disk?.reason ?? "Disk taranmadı.");
  return [diskLine, record.name, record.outcome, gate, files, ...record.copyRules].join("\n");
}

function DiskBanner({ disk }: { disk: DiskScan | null }) {
  if (!disk) return null;
  return (
    <div className="mt-6 max-w-2xl border border-rule p-4">
      <p className="label">{disk.connected ? "Disk sunucu" : "Disk sunucu bağlı değil"}</p>
      <p className="mt-2 text-sm leading-relaxed">{disk.reason}</p>
      {disk.root ? <p className="mt-2 text-xs text-muted">{disk.root}</p> : null}
      {disk.connected ? (
        <p className="mt-2 text-xs text-muted">{disk.folders.slice(0, 12).join(" · ")}</p>
      ) : null}
    </div>
  );
}

function BaseCard({ record }: { record: BaseRecord | undefined }) {
  if (!record) return null;
  return (
    <div className="border border-rule p-4">
      <p className="label">{record.learnFrom ? "Öğrenme bazı" : "Süren iş, kopyalanmaz"}</p>
      <p className="mt-2 font-display text-2xl">{record.name}</p>
      <p className="mt-2 text-sm text-muted">{record.outcome}</p>
      <ul className="mt-3 space-y-1 text-sm">
        {record.copyRules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        {record.originalFiles.length
          ? `Orijinal: ${record.originalFiles.join(", ")}`
          : "original/ klasörü boş. PDF veya DWG konunca ajan onları da okur."}
      </p>
    </div>
  );
}

function setDoc(job: StationJob, id: string, state: DocState, save: (job: StationJob) => void) {
  save({
    ...job,
    docs: job.docs.map((doc) => (doc.id === id ? { ...doc, state } : doc)),
  });
}

function StageActions({
  stage,
  state,
  canRun,
  onRun,
  onAsk,
  onApprove,
  onReturn,
}: {
  stage: StageId | null;
  state: StationJob["stages"][StageId]["state"];
  canRun: boolean;
  onRun: () => void;
  onAsk: () => void;
  onApprove: () => void;
  onReturn: () => void;
}) {
  if (!stage || state === "locked") return null;
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {state === "open" || state === "draft" ? (
        <button
          type="button"
          disabled={!canRun}
          onClick={onRun}
          className="bg-charcoal px-4 py-2 text-xs tracking-[0.14em] text-paper uppercase disabled:opacity-40"
        >
          {stage === "plans" ? "Planları kilitle" : "Yap"}
        </button>
      ) : null}
      {state === "draft" ? (
        <button type="button" onClick={onAsk} className="border border-charcoal px-4 py-2 text-xs tracking-wide">
          Onay iste
        </button>
      ) : null}
      {state === "waiting" ? (
        <>
          <button type="button" onClick={onApprove} className="bg-charcoal px-4 py-2 text-xs tracking-[0.14em] text-paper uppercase">
            Onayla
          </button>
          <button type="button" onClick={onReturn} className="border border-charcoal px-4 py-2 text-xs tracking-wide">
            Geri çevir
          </button>
        </>
      ) : null}
      {state === "approved" ? <p className="text-sm text-muted">Onaylandı. Sıradaki adım açık.</p> : null}
    </div>
  );
}

function Tiny({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="border border-rule px-2 py-1 text-[11px] tracking-wide">
      {children}
    </button>
  );
}

function stateLabel(state: StationJob["stages"][StageId]["state"]): string {
  if (state === "locked") return "kilitli";
  if (state === "open") return "sıra burada";
  if (state === "draft") return "yazıldı";
  if (state === "waiting") return "onay bekliyor";
  return "onaylandı";
}

function docStateLabel(state: DocState): string {
  if (state === "in_hand") return "alındı";
  if (state === "waiting") return "onay bekliyor";
  if (state === "waived") return "onayla evraksız geçildi";
  return "alınacak";
}
