export type StageId =
  | "plans"
  | "render"
  | "opz"
  | "ap"
  | "electrical"
  | "mechanical"
  | "filing";

export type StageState = "locked" | "open" | "draft" | "waiting" | "approved";

export type DocState = "missing" | "in_hand" | "waiting" | "waived";

export type PlanFile = {
  id: string;
  name: string;
  note: string;
};

export type IncomingDoc = {
  id: string;
  title: string;
  why: string;
  state: DocState;
};

export type StationJob = {
  id: string;
  name: string;
  client: string;
  city: string;
  floors: string;
  area: string;
  typology: string;
  exampleId: string;
  exampleName?: string;
  exampleUse?: string;
  learnFrom?: boolean;
  plans: PlanFile[];
  stages: Record<StageId, { state: StageState; output: string }>;
  docs: IncomingDoc[];
};

export const STAGE_ORDER: StageId[] = [
  "plans",
  "render",
  "opz",
  "ap",
  "electrical",
  "mechanical",
  "filing",
];

export const STAGE_LABEL: Record<StageId, string> = {
  plans: "Kat planları",
  render: "3D render",
  opz: "ОПЗ",
  ap: "AP — mimari uygulama",
  electrical: "Elektrik",
  mechanical: "Mekanik",
  filing: "KZ dosyalama",
};

export const EXAMPLES = [
  {
    id: "four-seasons",
    name: "Four Seasons MRC",
    use: "12 kat konut. Olumlu ekspertiz. ЭП + РП albümü.",
  },
  {
    id: "union",
    name: "UNION",
    use: "9 kat, 5,39 ha. РП, 23.06.2021 olumlu sonuç.",
  },
  {
    id: "borusan-karaganda",
    name: "Borusan — Karaganda",
    use: "Sanayi, АБК, atölye tevsii, kazan ve gaz. Olumlu ekspertiz.",
  },
  {
    id: "alma-medical",
    name: "ALMA Medical Group",
    use: "3 kat + otopark sağlık. Ekspertiz kapısında kapanmış cilt listesi.",
  },
] as const;

export const DOC_SEED: Array<Omit<IncomingDoc, "state">> = [
  { id: "tz", title: "İşveren görev tanımı (ТЗ)", why: "Program ve TEP ОПЗ’ye buradan girer." },
  { id: "apz", title: "APZ / planlama görevi", why: "Yükseklik, çekme, işlev. Ekspertiz ilk buna bakar." },
  { id: "topo", title: "Topoğrafya", why: "Vaziyet ve kotlar." },
  { id: "geo", title: "Jeoloji / zemin", why: "KR onsuz kapanmaz. Bu masa KR çizmez, evrakı ister." },
  { id: "tu-eo", title: "Elektrik TU", why: "EO tek hat ve güç, şehir şebekesine bağlanamaz." },
  { id: "tu-vk", title: "Su ve kanalizasyon TU", why: "VK çapları ve bağlantı noktası." },
  { id: "tu-heat", title: "Isı şebekesi TU", why: "OV kazan / şehir ısısı seçimi." },
  { id: "tu-fire", title: "Yangın TU", why: "AP yangın şeması ve PB." },
  { id: "title", title: "Mülkiyet / kadastro", why: "Dosya kapağı ve GP." },
];

export function blankJob(partial: Pick<StationJob, "name" | "client" | "city" | "floors" | "area" | "typology" | "exampleId">): StationJob {
  const stages = {} as StationJob["stages"];
  for (const id of STAGE_ORDER) {
    stages[id] = { state: id === "plans" ? "open" : "locked", output: "" };
  }
  return {
    id: crypto.randomUUID(),
    ...partial,
    plans: [],
    stages,
    docs: DOC_SEED.map((doc) => ({ ...doc, state: "missing" })),
  };
}

function sheet(code: string, title: string, from: string): string {
  return `${code}  ${title}  ← ${from}`;
}

export function produce(job: StationJob, stage: StageId, baseNote = "", pack = false): string {
  const planLines = job.plans.map((plan, index) => `${index + 1}. ${plan.name}${plan.note ? ` — ${plan.note}` : ""}`);
  const example = EXAMPLES.find((item) => item.id === job.exampleId) ?? EXAMPLES[0];
  const head = `${job.name} · ${job.client} · ${job.city} · ${job.floors} kat · ${job.area}`;
  const learned = baseNote ? [`Bazadan:`, baseNote, ""] : [];

  if (stage === "plans") {
    return ["Kilitlenen kat planları:", ...planLines].join("\n");
  }

  if (stage === "render") {
    const views = job.plans.flatMap((plan, index) => [
      sheet(`R-${String(index + 1).padStart(2, "0")}a`, `Plan üstü — ${plan.name}`, "kat planı"),
      sheet(`R-${String(index + 1).padStart(2, "0")}b`, `İç perspektif — ${plan.name}`, "aynı aks"),
    ]);
    return [
      ...learned,
      head,
      "3D, yüklenen planların aks ve kat sınırına kilitli. Yeni kütle uydurulmaz.",
      ...views,
      sheet("R-C1", "Kuzey cephe", "plan konturu"),
      sheet("R-C2", "Güney cephe", "plan konturu"),
      sheet("R-C3", "Doğu cephe", "plan konturu"),
      sheet("R-C4", "Batı cephe", "plan konturu"),
      sheet("R-S1", "Enine kesit", "plan + kat yüksekliği"),
      sheet("R-M1", "Vaziyet kütlesi", `${job.floors} kat`),
      ...(pack ? [] : ["Onaylanmadan ОПЗ açılmaz."]),
    ].join("\n");
  }

  if (stage === "opz") {
    const missing = job.docs.filter((doc) => doc.state === "missing").map((doc) => `- ${doc.title}`);
    return [
      ...learned,
      `ОПЗ — ${head}`,
      "1. Основание: ТЗ, APZ, kadastro.",
      `2. Gösterge: ${job.typology}, ${job.area}, ${job.floors} kat, ${job.city}.`,
      "3. Mimari karar: yalnızca kilitli kat planları.",
      ...planLines.map((line) => `   ${line}`),
      "4. Konstrüksiyon: zemin raporu gelene kadar boş bırakılır.",
      "5. Mühendislik: AP onayından sonra EO ve OV/VK.",
      "6. Yangın ve MGN: AP paftalarında gösterilir, burada tekrar uydurulmaz.",
      missing.length ? "Evrak bekleyen maddeler:" : "Evrak listesi kapalı.",
      ...missing,
    ].join("\n");
  }

  if (stage === "ap") {
    const plans = job.plans.map((plan, index) =>
      sheet(`AP-${String(index + 3).padStart(2, "0")}`, `Kat planı — ${plan.name}`, "işveren planı"),
    );
    return [
      ...learned,
      `AP — mimari uygulama. Kaynak: kilitli plan + onaylı 3D + ОПЗ.`,
      "Ölçek 1:100. Aks, kapı, MGN ve yangın çıkışı planın dışına taşmaz.",
      sheet("AP-01", "Kapak / pafta listesi", example.name),
      sheet("AP-02", "Genel veriler", "ОПЗ §1–3"),
      ...plans,
      sheet("AP-F1", "Cepheler 1–4", "onaylı 3D"),
      sheet("AP-S1", "Kesitler", "onaylı 3D"),
      sheet("AP-MGN", "Erişilebilirlik", "kat planı"),
      sheet("AP-PB", "Yangın tahliye şeması", "kat planı"),
    ].join("\n");
  }

  if (stage === "electrical") {
    return [
      ...learned,
      "EO / SS — aks AP kat planından kopyalanır. Plan değiştirilmez.",
      ...job.plans.flatMap((plan, index) => [
        sheet(`EO-L${index + 1}`, `Aydınlatma — ${plan.name}`, "AP kat"),
        sheet(`EO-P${index + 1}`, `Priz kuvvet — ${plan.name}`, "AP kat"),
        sheet(`SS-${index + 1}`, `Zayıf akım — ${plan.name}`, "AP kat"),
      ]),
      sheet("EO-01", "Tek hat şeması", job.docs.find((d) => d.id === "tu-eo")?.state === "in_hand" ? "elektrik TU" : "TU yok — şema taslak, bağlantı boş"),
      sheet("EO-PE", "Topraklama ve eşpotansiyel", "AP-02"),
    ].join("\n");
  }

  if (stage === "mechanical") {
    return [
      ...learned,
      "OV / VK — şaft ve cihaz yeri AP’de işaretli olandan çıkar.",
      ...job.plans.flatMap((plan, index) => [
        sheet(`OV-H${index + 1}`, `Isıtma — ${plan.name}`, "AP kat"),
        sheet(`OV-V${index + 1}`, `Havalandırma — ${plan.name}`, "AP kat"),
        sheet(`VK-W${index + 1}`, `Su — ${plan.name}`, "AP kat"),
        sheet(`VK-K${index + 1}`, `Kanalizasyon — ${plan.name}`, "AP kat"),
      ]),
      sheet("OV-01", "Isı merkezi", job.docs.find((d) => d.id === "tu-heat")?.state === "in_hand" ? "ısı TU" : "TU yok — onay iste"),
      sheet("VK-01", "Su giriş / sayaç", job.docs.find((d) => d.id === "tu-vk")?.state === "in_hand" ? "su TU" : "TU yok — onay iste"),
    ].join("\n");
  }

  const openDocs = job.docs.filter((doc) => doc.state === "missing" || doc.state === "waiting");
  const albumName = job.exampleName ?? example.name;
  const albumUse = job.exampleUse ?? example.use;
  if (job.learnFrom === false) {
    return [...learned, `${albumName} süren iştir. Dosya kapağı buradan kopyalanmaz.`, albumUse].filter(Boolean).join("\n");
  }
  return [
    ...learned,
    `KZ ekspertiz dosyası. Örnek albüm: ${albumName}. ${albumUse}`,
    "Kopyalanan düzen: kapak, açıklama, GP, AP, KR yeri, OV, VK, EO, SS, PB, POS, OOS, MGN, EE, SM.",
    "Bu masanın kapattığı ciltler: 3D, ОПЗ, AP, EO/SS, OV/VK.",
    "Bu masanın kapatmadığı, örnek albümde ayrı duran ciltler: KR, POS, OOS, SM. Zemin ve metraj evrakı gelmeden yazılmaz.",
    openDocs.length ? "Dosyaya girmeden kapanmayan evrak:" : "Gelen evrak tamam. Dosya kapağı yazılabilir.",
    ...openDocs.map((doc) => `- ${doc.title} (${doc.state === "waiting" ? "onay bekliyor" : "yok"})`),
  ].join("\n");
}

export function deliver(job: StationJob, baseNote: string): string {
  const sections = (["render", "opz", "ap", "electrical", "mechanical", "filing"] as StageId[]).map((stage) =>
    produce(job, stage, "", true),
  );
  return [baseNote, ...sections].filter((part) => part.trim()).join("\n\n");
}

export function nextOpen(job: StationJob): StageId {
  for (const id of STAGE_ORDER) {
    if (job.stages[id].state !== "approved") return id;
  }
  return "filing";
}
