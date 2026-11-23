export const STAGES = [
  "brief",
  "concept",
  "sketch",
  "working",
  "expertise",
  "approved",
] as const;

export type StageId = (typeof STAGES)[number];

export type SectionStatus =
  | "missing"
  | "draft"
  | "internal_review"
  | "ready"
  | "comments"
  | "approved";

export type ProjectSection = {
  code: string;
  nameRu: string;
  nameTr: string;
  stage: "sketch" | "working";
  requiredForExpertise: boolean;
  status: SectionStatus;
};

export type StudioProject = {
  id: string;
  code: string;
  name: string;
  client: string;
  city: string;
  typology: "residential" | "public" | "industrial" | "office" | "medical";
  stage: StageId;
  areaM2?: number;
  plotHa?: number;
  floors?: string;
  year: string;
  sections: ProjectSection[];
};

const section = (
  code: string,
  nameRu: string,
  nameTr: string,
  stage: "sketch" | "working",
  requiredForExpertise: boolean,
  status: SectionStatus,
): ProjectSection => ({
  code,
  nameRu,
  nameTr,
  stage,
  requiredForExpertise,
  status,
});

export const EXPERTISE_SECTIONS: Omit<ProjectSection, "status">[] = [
  section("TZ", "Техническое задание", "Görev tanımı", "sketch", true, "missing"),
  section("APZ", "АПЗ / исходные данные", "APZ / girdi verileri", "sketch", true, "missing"),
  section("IZY", "Инженерные изыскания", "Mühendislik etütleri", "sketch", true, "missing"),
  section("PZ", "Пояснительная записка", "Açıklama raporu", "working", true, "missing"),
  section("GP", "Генеральный план", "Vaziyet planı", "sketch", true, "missing"),
  section("AR", "Архитектурные решения", "Mimari çözümler", "working", true, "missing"),
  section("KR", "Конструктивные решения", "Taşıyıcı sistem", "working", true, "missing"),
  section("OV", "Отопление и вентиляция", "Isıtma ve havalandırma", "working", true, "missing"),
  section("VK", "Водоснабжение и канализация", "Su ve kanalizasyon", "working", true, "missing"),
  section("EO", "Электроснабжение", "Elektrik", "working", true, "missing"),
  section("SS", "Сети связи / СС", "Zayıf akım", "working", true, "missing"),
  section("PB", "Пожарная безопасность", "Yangın güvenliği", "working", true, "missing"),
  section("POS", "ПОС", "Şantiye organizasyonu", "working", true, "missing"),
  section("OOS", "ООС / экология", "Çevre", "working", true, "missing"),
  section("MGN", "Доступность МГН", "Erişilebilirlik", "working", true, "missing"),
  section("EE", "Энергоэффективность", "Enerji verimliliği", "working", true, "missing"),
  section("SM", "Сметная документация", "Metraj ve keşif", "working", true, "missing"),
  section("BIM", "BIM / Revit модель", "BIM / Revit modeli", "working", false, "missing"),
  section("3D", "3D визуализация", "3D görselleştirme", "sketch", false, "missing"),
].map(({ status: _status, ...rest }) => rest);

const withStatuses = (entries: Array<[string, SectionStatus]>): ProjectSection[] => {
  const map = new Map(entries);
  return EXPERTISE_SECTIONS.map((item) => ({
    ...item,
    status: map.get(item.code) ?? "missing",
  }));
};

export const PROJECTS: StudioProject[] = [
  {
    id: "four-seasons",
    code: "AR-20-FS",
    name: "Four Seasons MRC",
    client: "ALFA stroy",
    city: "Almaty, Bostandyk",
    typology: "residential",
    stage: "approved",
    areaM2: 42524,
    floors: "12",
    year: "2020–2021",
    sections: withStatuses(EXPERTISE_SECTIONS.map((s) => [s.code, "approved"])),
  },
  {
    id: "union",
    code: "AR-21-UN",
    name: "UNION MRC",
    client: "TUR-KHAN",
    city: "Almaty region, Besagash",
    typology: "residential",
    stage: "approved",
    areaM2: 134372,
    plotHa: 5.39,
    floors: "9",
    year: "2021",
    sections: withStatuses(EXPERTISE_SECTIONS.map((s) => [s.code, "approved"])),
  },
  {
    id: "borusan-karaganda",
    code: "IN-21-BMK",
    name: "Borusan Makina — Caterpillar",
    client: "Borusan Makina Kazakhstan",
    city: "Karaganda",
    typology: "industrial",
    stage: "approved",
    plotHa: 9.1775,
    floors: "1–3",
    year: "2021–2023",
    sections: withStatuses(EXPERTISE_SECTIONS.map((s) => [s.code, "approved"])),
  },
  {
    id: "halavet",
    code: "IN-24-HL",
    name: "HALAVET KZ",
    client: "HALAVET KZ",
    city: "Kazakhstan",
    typology: "industrial",
    stage: "working",
    areaM2: 10000,
    year: "2024–",
    sections: withStatuses([
      ["TZ", "approved"],
      ["APZ", "ready"],
      ["IZY", "ready"],
      ["PZ", "internal_review"],
      ["GP", "ready"],
      ["AR", "internal_review"],
      ["KR", "draft"],
      ["OV", "draft"],
      ["VK", "draft"],
      ["EO", "draft"],
      ["SS", "missing"],
      ["PB", "draft"],
      ["POS", "missing"],
      ["OOS", "missing"],
      ["MGN", "draft"],
      ["EE", "missing"],
      ["SM", "missing"],
      ["BIM", "draft"],
      ["3D", "ready"],
    ]),
  },
  {
    id: "orhun-clinic",
    code: "MD-22-OR",
    name: "Orhun Medical",
    client: "Orhun Medical",
    city: "Aktobe",
    typology: "medical",
    stage: "sketch",
    floors: "2",
    year: "2022–",
    sections: withStatuses([
      ["TZ", "ready"],
      ["APZ", "draft"],
      ["IZY", "missing"],
      ["GP", "draft"],
      ["AR", "draft"],
      ["3D", "ready"],
      ["PZ", "missing"],
      ["KR", "missing"],
    ]),
  },
  {
    id: "new-time",
    code: "AR-22-NT",
    name: "NEW TIME",
    client: "Time Group Construction",
    city: "Almaty, Medeu",
    typology: "residential",
    stage: "concept",
    year: "2022–",
    sections: withStatuses([
      ["TZ", "draft"],
      ["GP", "draft"],
      ["3D", "draft"],
    ]),
  },
  {
    id: "alma-medical",
    code: "MD-23-AMG",
    name: "ALMA Medical Group",
    client: "ALMA MEDICAL GROUP",
    city: "Almaty",
    typology: "medical",
    stage: "expertise",
    areaM2: 17418,
    floors: "3 + parking",
    year: "2023",
    sections: withStatuses(
      EXPERTISE_SECTIONS.map((s) => [
        s.code,
        s.requiredForExpertise ? "ready" : "draft",
      ]),
    ),
  },
];

export const findProject = (idOrCode: string): StudioProject | undefined => {
  const needle = idOrCode.trim().toLowerCase();
  return PROJECTS.find(
    (project) =>
      project.id === needle ||
      project.code.toLowerCase() === needle ||
      project.name.toLowerCase() === needle,
  );
};

export type GateResult = {
  projectId: string;
  stage: StageId;
  canSubmitExpertise: boolean;
  blocking: Array<{ code: string; nameRu: string; status: SectionStatus }>;
  warnings: Array<{ code: string; nameRu: string; status: SectionStatus }>;
  readyCount: number;
  requiredCount: number;
};

export function expertiseGate(project: StudioProject): GateResult {
  const required = project.sections.filter((section) => section.requiredForExpertise);
  const blocking = required
    .filter((section) => section.status !== "ready" && section.status !== "approved")
    .map((section) => ({
      code: section.code,
      nameRu: section.nameRu,
      status: section.status,
    }));
  const warnings = project.sections
    .filter(
      (section) =>
        !section.requiredForExpertise &&
        section.status !== "ready" &&
        section.status !== "approved",
    )
    .map((section) => ({
      code: section.code,
      nameRu: section.nameRu,
      status: section.status,
    }));
  const readyCount = required.filter(
    (section) => section.status === "ready" || section.status === "approved",
  ).length;
  return {
    projectId: project.id,
    stage: project.stage,
    canSubmitExpertise: blocking.length === 0,
    blocking,
    warnings,
    readyCount,
    requiredCount: required.length,
  };
}
