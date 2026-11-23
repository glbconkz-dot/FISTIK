import { loc, type Copy } from '@/lib/studio';

export const STAGES = [
  'brief',
  'concept',
  'sketch',
  'working',
  'documentation',
  'expertise',
  'approved',
] as const;

export type StageId = (typeof STAGES)[number];

export type SectionStatus =
  | 'missing'
  | 'draft'
  | 'internal_review'
  | 'ready'
  | 'comments'
  | 'approved';

export type DepartmentId =
  | 'gip'
  | 'architecture'
  | 'structures'
  | 'mep'
  | 'bim'
  | 'documentation'
  | 'expertise';

export type TypologyId = 'residential' | 'public' | 'industrial' | 'office' | 'medical';

export type ProjectSection = {
  code: string;
  name: Copy;
  stage: 'sketch' | 'working';
  requiredForExpertise: boolean;
  status: SectionStatus;
  owner: DepartmentId;
};

export type PipelineProject = {
  id: string;
  code: string;
  name: string;
  client: string;
  city: Copy;
  typology: TypologyId;
  stage: StageId;
  areaM2?: number;
  plotHa?: number;
  floors?: string;
  year: string;
  workSlug?: string;
  note: Copy;
  sections: ProjectSection[];
};

export type Department = {
  id: DepartmentId;
  code: string;
  name: Copy;
  lead: Copy;
  summary: Copy;
  codes: string[];
  agent?: string;
};

export type StudioAgent = {
  id: string;
  role: Copy;
  department: DepartmentId | 'parent';
  summary: Copy;
  skills: string[];
  tools: string[];
};

export type PlaybookStep = {
  id: string;
  stage: StageId;
  index: string;
  title: Copy;
  body: Copy;
};

const OWNERS: Record<string, DepartmentId> = {
  TZ: 'gip',
  APZ: 'gip',
  IZY: 'gip',
  PZ: 'documentation',
  GP: 'architecture',
  AR: 'architecture',
  KR: 'structures',
  OV: 'mep',
  VK: 'mep',
  EO: 'mep',
  SS: 'mep',
  PB: 'mep',
  POS: 'documentation',
  OOS: 'documentation',
  MGN: 'architecture',
  EE: 'documentation',
  SM: 'documentation',
  BIM: 'bim',
  '3D': 'architecture',
};

const sectionDef = (
  code: string,
  name: Copy,
  stage: 'sketch' | 'working',
  requiredForExpertise: boolean,
): Omit<ProjectSection, 'status'> => ({
  code,
  name,
  stage,
  requiredForExpertise,
  owner: OWNERS[code] ?? 'gip',
});

export const EXPERTISE_SECTIONS: Omit<ProjectSection, 'status'>[] = [
  sectionDef('TZ', loc('Техническое задание', 'Design brief (TZ)', 'Görev tanımı (TZ)', 'Техникалық тапсырма'), 'sketch', true),
  sectionDef('APZ', loc('АПЗ / исходные данные', 'APZ / planning inputs', 'APZ / girdi verileri', 'АПЗ / бастапқы деректер'), 'sketch', true),
  sectionDef('IZY', loc('Инженерные изыскания', 'Engineering surveys', 'Mühendislik etütleri', 'Инженерлік ізденістер'), 'sketch', true),
  sectionDef('PZ', loc('Пояснительная записка', 'Explanatory note', 'Açıklama raporu', 'Түсіндірме жазба'), 'working', true),
  sectionDef('GP', loc('Генеральный план', 'Masterplan / site', 'Vaziyet planı', 'Бас жоспар'), 'sketch', true),
  sectionDef('AR', loc('Архитектурные решения', 'Architectural solutions', 'Mimari çözümler', 'Сәулет шешімдері'), 'working', true),
  sectionDef('KR', loc('Конструктивные решения', 'Structural solutions', 'Taşıyıcı sistem', 'Конструктивтік шешімдер'), 'working', true),
  sectionDef('OV', loc('Отопление и вентиляция', 'Heating and ventilation', 'Isıtma ve havalandırma', 'Жылыту және желдету'), 'working', true),
  sectionDef('VK', loc('Водоснабжение и канализация', 'Water and sewer', 'Su ve kanalizasyon', 'Сумен жабдықтау және кәріз'), 'working', true),
  sectionDef('EO', loc('Электроснабжение', 'Power supply', 'Elektrik', 'Электрмен жабдықтау'), 'working', true),
  sectionDef('SS', loc('Сети связи / СС', 'Low-current / comms', 'Zayıf akım', 'Байланыс желілері'), 'working', true),
  sectionDef('PB', loc('Пожарная безопасность', 'Fire safety', 'Yangın güvenliği', 'Өрт қауіпсіздігі'), 'working', true),
  sectionDef('POS', loc('ПОС', 'Construction organisation', 'Şantiye organizasyonu', 'Құрылысты ұйымдастыру'), 'working', true),
  sectionDef('OOS', loc('ООС / экология', 'Environment', 'Çevre', 'Қоршаған орта'), 'working', true),
  sectionDef('MGN', loc('Доступность МГН', 'Accessibility', 'Erişilebilirlik', 'МГН қолжетімділігі'), 'working', true),
  sectionDef('EE', loc('Энергоэффективность', 'Energy efficiency', 'Enerji verimliliği', 'Энергия тиімділігі'), 'working', true),
  sectionDef('SM', loc('Сметная документация', 'Bills of quantities', 'Metraj ve keşif', 'Сметалық құжаттама'), 'working', true),
  sectionDef('BIM', loc('BIM / Revit модель', 'BIM / Revit model', 'BIM / Revit modeli', 'BIM / Revit моделі'), 'working', false),
  sectionDef('3D', loc('3D визуализация', '3D visualization', '3D görselleştirme', '3D визуализация'), 'sketch', false),
];

const withStatuses = (entries: Array<[string, SectionStatus]>): ProjectSection[] => {
  const map = new Map(entries);
  return EXPERTISE_SECTIONS.map((item) => ({
    ...item,
    status: map.get(item.code) ?? 'missing',
  }));
};

const all = (status: SectionStatus): ProjectSection[] =>
  EXPERTISE_SECTIONS.map((item) => ({ ...item, status }));

export const PROJECTS: PipelineProject[] = [
  {
    id: 'four-seasons',
    code: 'AR-20-FS',
    name: 'Four Seasons',
    client: 'ALFA stroy',
    city: loc('Алматы, Бостандык', 'Almaty, Bostandyk', 'Almatı, Bostandyk', 'Алматы, Бостандық'),
    typology: 'residential',
    stage: 'approved',
    areaM2: 42524,
    floors: '12',
    year: '2020–2021',
    workSlug: 'four-seasons',
    note: loc(
      'Первая и вторая очереди — положительное заключение госэкспертизы.',
      'Stages 1 and 2 received a positive state-expertise conclusion.',
      '1. ve 2. etaplar devlet ekspertizinden olumlu sonuç aldı.',
      'Бірінші және екінші кезек мемлекеттік сараптаманың оң қорытындысын алды.',
    ),
    sections: all('approved'),
  },
  {
    id: 'union',
    code: 'AR-21-UN',
    name: 'UNION',
    client: 'TUR-KHAN',
    city: loc('Алматинская область, Бесагаш', 'Almaty Region, Besagash', 'Almatı bölgesi, Besagaş', 'Алматы облысы, Бесағаш'),
    typology: 'residential',
    stage: 'approved',
    areaM2: 134372,
    plotHa: 5.39,
    floors: '9',
    year: '2021',
    workSlug: 'union',
    note: loc(
      'Рабочий проект 23 июня 2021 получил положительное заключение.',
      'Working project received a positive conclusion on 23 June 2021.',
      'Uygulama projesi 23 Haziran 2021’de olumlu sonuç aldı.',
      'Жұмыс жобасы 2021 ж. 23 маусымда оң қорытынды алды.',
    ),
    sections: all('approved'),
  },
  {
    id: 'borusan-karaganda',
    code: 'IN-21-BMK',
    name: 'Borusan Makina — Caterpillar',
    client: 'Borusan Makina Kazakhstan',
    city: loc('Караганда', 'Karaganda', 'Karaganda', 'Қарағанды'),
    typology: 'industrial',
    stage: 'approved',
    plotHa: 9.1775,
    floors: '1–3',
    year: '2021–2023',
    workSlug: 'borusan-makina-karaganda',
    note: loc(
      'Рабочие проекты инженерных объектов — положительная экспертиза.',
      'Working projects for the engineering works received positive expertise.',
      'Mühendislik tesislerinin uygulama projeleri olumlu ekspertiz aldı.',
      'Инженерлік нысандардың жұмыс жобалары оң сараптама алды.',
    ),
    sections: all('approved'),
  },
  {
    id: 'halavet',
    code: 'IN-24-HL',
    name: 'HALAVET KZ',
    client: 'HALAVET KZ',
    city: loc('Казахстан', 'Kazakhstan', 'Kazakistan', 'Қазақстан'),
    typology: 'industrial',
    stage: 'working',
    areaM2: 10000,
    year: '2024–',
    workSlug: 'halavet-kz',
    note: loc(
      'Первая желатиновая фабрика в Центральной Азии. Рабочий проект в разработке — ворота Госэкспертизы закрыты.',
      'First gelatin factory in Central Asia. Working project in development — Gosexpertiza gate closed.',
      'Orta Asya’nın ilk jelatin fabrikası. Uygulama projesi gelişiyor — Gosexpertiza kapısı kapalı.',
      'Орталық Азиядағы алғашқы желатин фабрикасы. Жұмыс жобасы әзірленуде — Госэкспертиза қақпасы жабық.',
    ),
    sections: withStatuses([
      ['TZ', 'approved'],
      ['APZ', 'ready'],
      ['IZY', 'ready'],
      ['PZ', 'internal_review'],
      ['GP', 'ready'],
      ['AR', 'internal_review'],
      ['KR', 'draft'],
      ['OV', 'draft'],
      ['VK', 'draft'],
      ['EO', 'draft'],
      ['SS', 'missing'],
      ['PB', 'draft'],
      ['POS', 'missing'],
      ['OOS', 'missing'],
      ['MGN', 'draft'],
      ['EE', 'missing'],
      ['SM', 'missing'],
      ['BIM', 'draft'],
      ['3D', 'ready'],
    ]),
  },
  {
    id: 'orhun-clinic',
    code: 'MD-22-OR',
    name: 'Orhun Medical',
    client: 'Orhun Medical',
    city: loc('Актобе', 'Aktobe', 'Aktöbe', 'Ақтөбе'),
    typology: 'medical',
    stage: 'sketch',
    floors: '2',
    year: '2022–',
    workSlug: 'orhun-medical-aktobe',
    note: loc(
      'Концепт онкологической клиники передан заказчику. Эскиз не закрывает экспертизу.',
      'Oncology-clinic concept issued to the client. Sketch does not close expertise.',
      'Onkoloji kliniği konsepti işverene verildi. Eskiz ekspertizi kapatmaz.',
      'Онкологиялық клиника концепті тапсырыс берушіге берілді. Эскиз сараптаманы жаппайды.',
    ),
    sections: withStatuses([
      ['TZ', 'ready'],
      ['APZ', 'draft'],
      ['IZY', 'missing'],
      ['GP', 'draft'],
      ['AR', 'draft'],
      ['3D', 'ready'],
      ['PZ', 'missing'],
      ['KR', 'missing'],
    ]),
  },
  {
    id: 'new-time',
    code: 'AR-22-NT',
    name: 'NEW TIME',
    client: 'Time Group Construction',
    city: loc('Алматы, Медеу', 'Almaty, Medeu', 'Almatı, Medeu', 'Алматы, Медеу'),
    typology: 'residential',
    stage: 'concept',
    year: '2022–',
    workSlug: 'new-time',
    note: loc(
      'Жилой комплекс с паркингом. Стадия концепта — TZ ещё черновик.',
      'Residential complex with parking. Concept stage — TZ still a draft.',
      'Otoparklı konut. Konsept aşaması — TZ hâlâ taslak.',
      'Тұрағы бар тұрғын кешен. Концепт кезеңі — TZ әлі жоба.',
    ),
    sections: withStatuses([
      ['TZ', 'draft'],
      ['GP', 'draft'],
      ['3D', 'draft'],
    ]),
  },
  {
    id: 'alma-medical',
    code: 'MD-23-AMG',
    name: 'ALMA Medical Group',
    client: 'ALMA MEDICAL GROUP',
    city: loc('Алматы', 'Almaty', 'Almatı', 'Алматы'),
    typology: 'medical',
    stage: 'expertise',
    areaM2: 17418,
    floors: '3 + parking',
    year: '2023',
    workSlug: 'alma-medical-group',
    note: loc(
      'Обязательные тома ready. Ворота открыты — пакет на внутренней проверке перед подачей.',
      'Required volumes are ready. Gate open — internal check before filing.',
      'Zorunlu ciltler ready. Kapı açık — teslim öncesi iç kontrol.',
      'Міндетті томдар ready. Қақпа ашық — тапсыру алдындағы ішкі тексеру.',
    ),
    sections: EXPERTISE_SECTIONS.map((item) => ({
      ...item,
      status: item.requiredForExpertise ? 'ready' : 'draft',
    })),
  },
];

export const DEPARTMENTS: Department[] = [
  {
    id: 'gip',
    code: 'GIP',
    name: loc('ГИП / координация', 'GIP / coordination', 'GIP / koordinasyon', 'ГИП / үйлестіру'),
    lead: loc('Окан Ешильгёз · Унчам Сакашева', 'Okan Yeşilgöz · Uncham Sakasheva', 'Okan Yeşilgöz · Unçam Sakaşeva', 'Окан Ешильгёз · Ұнчам Сақашева'),
    summary: loc(
      'Бриф, ТЗ, АПЗ, изыскания, календарь ворот. Родительский агент студии.',
      'Brief, TZ, APZ, surveys, gate calendar. Parent studio agent.',
      'Brif, TZ, APZ, etütler, kapı takvimi. Stüdyonun üst ajanı.',
      'Бриф, ТЗ, АПЗ, ізденістер, қақпа күнтізбесі. Студияның негізгі агенті.',
    ),
    codes: ['TZ', 'APZ', 'IZY'],
    agent: 'parent',
  },
  {
    id: 'architecture',
    code: 'AR',
    name: loc('Архитектура', 'Architecture', 'Mimari', 'Сәулет'),
    lead: loc('Евгений Титов (ГАП)', 'Evgeny Titov (GAP)', 'Yevgeni Titov (GAP)', 'Евгений Титов (ГАП)'),
    summary: loc(
      'Эскиз, генплан, АР, МГН, 3D. Композиция до конструкций и инженерии.',
      'Sketch, site, AR, accessibility, 3D. Composition before structure and MEP.',
      'Eskiz, vaziyet, AR, erişilebilirlik, 3D. Strüktür ve MEP’ten önce kompozisyon.',
      'Эскиз, бас жоспар, АР, МГН, 3D. Конструкция мен MEP-ке дейін композиция.',
    ),
    codes: ['GP', 'AR', 'MGN', '3D'],
    agent: 'architecture',
  },
  {
    id: 'structures',
    code: 'KR',
    name: loc('Конструкции', 'Structures', 'Strüktür', 'Конструкциялар'),
    lead: loc('Орынгали Алпысбаев', 'Oryngali Alpysbayev', 'Orıngali Alpısbayev', 'Орынғали Алпысбаев'),
    summary: loc(
      'КР по зафиксированным осям. СНиП / Еврокоды. Без грунтов — не ready.',
      'KR on locked grids. SNiP / Eurocodes. No soils — not ready.',
      'Kilitli aks üzerine KR. SNiP / Eurocode. Zemin yoksa ready değil.',
      'Бекітілген осьтерде КР. СНиП / Еурокодтар. Топырақсыз — ready емес.',
    ),
    codes: ['KR'],
    agent: 'structures',
  },
  {
    id: 'mep',
    code: 'MEP',
    name: loc('Инженерия', 'MEP', 'Tesisat', 'Инженерия'),
    lead: loc('Инженерные разделы', 'Building services', 'Tesisat bölümleri', 'Инженерлік бөлімдер'),
    summary: loc(
      'ОВ, ВК, ЭО, СС, ПБ. После шахт и техпомещений на АР. ТУ от сетей — блок.',
      'HVAC, plumbing, power, comms, fire. After AR shafts and plant. Missing utility TUs block.',
      'OV, VK, EO, SS, PB. AR şaft ve teknik hacimlerden sonra. Şebeke TU’su yoksa blok.',
      'ОВ, ВК, ЭО, СС, ПБ. АР шахта мен техбөлмеден кейін. Желі ТУ-ы жоқ болса — блок.',
    ),
    codes: ['OV', 'VK', 'EO', 'SS', 'PB'],
    agent: 'mep',
  },
  {
    id: 'bim',
    code: 'BIM',
    name: loc('BIM / Revit', 'BIM / Revit', 'BIM / Revit', 'BIM / Revit'),
    lead: loc('Координация модели', 'Model coordination', 'Model koordinasyonu', 'Модель үйлестіру'),
    summary: loc(
      'Параллельная модель. Не заменяет подписанные листы экспертизы.',
      'Parallel model. Does not replace signed expertise sheets.',
      'Paralel model. İmzalı ekspertiz paftalarının yerine geçmez.',
      'Параллель модель. Сараптаманың қол қойылған парақтарын алмастырмайды.',
    ),
    codes: ['BIM'],
  },
  {
    id: 'documentation',
    code: 'DOC',
    name: loc('Документация', 'Documentation', 'Dokümantasyon', 'Құжаттама'),
    lead: loc('Альбом и git-дерево', 'Album and git tree', 'Albüm ve git ağacı', 'Альбом және git ағашы'),
    summary: loc(
      'Штампы, содержание, ПОС, ООС, СМ, EE, github-docs. Не в репозиторий FISTIK.',
      'Stamps, contents, POS, OOS, SM, EE, github-docs. Never the FISTIK bakery repo.',
      'Damgalar, içindekiler, POS, OOS, SM, EE, github-docs. FISTIK pastane deposuna değil.',
      'Мөрлер, мазмұн, ПОС, ООС, СМ, EE, github-docs. FISTIK торт репозиторийіне емес.',
    ),
    codes: ['PZ', 'POS', 'OOS', 'EE', 'SM'],
    agent: 'documentation',
  },
  {
    id: 'expertise',
    code: 'EXP',
    name: loc('Экспертиза', 'Expertise', 'Ekspertiz', 'Сараптама'),
    lead: loc('Госэкспертиза / ворота', 'Gosexpertiza / gate', 'Gosexpertiza / kapı', 'Госэкспертиза / қақпа'),
    summary: loc(
      'Только expertise_gate решает «можно подавать». Заключение выдаёт орган, не агент.',
      'Only expertise_gate may say “file it”. The authority issues the conclusion, not the agent.',
      '«Gönderilebilir» kararı yalnız expertise_gate. Sonuç ajan değil, kurum verir.',
      '«Тапсыруға болады» деп тек expertise_gate айтады. Қорытындыны агент емес, орган береді.',
    ),
    codes: [],
    agent: 'expertise',
  },
];

export const AGENTS: StudioAgent[] = [
  {
    id: 'parent',
    role: loc('ГИП-стол', 'GIP desk', 'GIP masası', 'ГИП үстелі'),
    department: 'parent',
    summary: loc(
      'Координирует концепт → эскиз → рабочий проект → документацию → ворота. Делегирует отделам.',
      'Coordinates concept → sketch → working project → documentation → gate. Delegates to departments.',
      'Konsept → eskiz → uygulama → dokümantasyon → kapıyı koordine eder. Bölümlere devreder.',
      'Концепт → эскиз → жұмыс жобасы → құжаттама → қақпаны үйлестіреді. Бөлімдерге тапсырады.',
    ),
    skills: ['concept', 'sketch', 'working-project', 'expertise-gate', 'github-docs'],
    tools: ['project_status', 'expertise_gate', 'record_finding'],
  },
  {
    id: 'architecture',
    role: loc('Архитектура / ГАП', 'Architecture / GAP', 'Mimari / GAP', 'Сәулет / ГАП'),
    department: 'architecture',
    summary: loc(
      'АР, ГП, МГН, 3D, противопожарные планировки. Не утверждает подачу на экспертизу.',
      'AR, GP, MGN, 3D, fire-related plans. Does not approve expertise filing.',
      'AR, GP, MGN, 3D, yangın planları. Ekspertiz teslimini onaylamaz.',
      'АР, ГП, МГН, 3D, өрт жоспарлары. Сараптамаға тапсыруды бекітпейді.',
    ),
    skills: ['concept', 'sketch', 'working-project'],
    tools: ['project_status', 'record_finding'],
  },
  {
    id: 'structures',
    role: loc('Конструкции', 'Structures', 'Strüktür', 'Конструкциялар'),
    department: 'structures',
    summary: loc(
      'КР только по зафиксированным осям. Грунты и нагрузки — до статуса ready.',
      'KR only on locked grids. Soils and loads before ready.',
      'KR yalnız kilitli aks üzerinde. Ready’den önce zemin ve yükler.',
      'КР тек бекітілген осьтерде. Ready-ден бұрын топырақ пен жүктеме.',
    ),
    skills: ['working-project'],
    tools: ['project_status', 'record_finding'],
  },
  {
    id: 'mep',
    role: loc('ОВ / ВК / ЭО / СС', 'MEP coordinator', 'Tesisat koordinatörü', 'MEP үйлестірушісі'),
    department: 'mep',
    summary: loc(
      'Сети и пожар после шахт АР. Отсутствующие ТУ — блокирующие.',
      'Networks and fire after AR shafts. Missing TUs are blocking.',
      'AR şaftlarından sonra şebekeler ve yangın. Eksik TU bloktur.',
      'АР шахталарынан кейін желілер мен өрт. Жоқ ТУ — блоктаушы.',
    ),
    skills: ['working-project'],
    tools: ['project_status', 'record_finding'],
  },
  {
    id: 'documentation',
    role: loc('Документация / BIM-реестр', 'Documentation / BIM register', 'Dokümantasyon / BIM sicili', 'Құжаттама / BIM тізілімі'),
    department: 'documentation',
    summary: loc(
      'Альбом, штампы, git-дерево объекта. Один репозиторий на здание, не FISTIK.',
      'Album, stamps, per-building git tree. One repo per object, never FISTIK.',
      'Albüm, damgalar, nesne git ağacı. Her yapıya bir repo; FISTIK değil.',
      'Альбом, мөрлер, нысан git ағашы. Әр ғимаратқа бір репозиторий, FISTIK емес.',
    ),
    skills: ['github-docs', 'working-project'],
    tools: ['project_status', 'record_finding'],
  },
  {
    id: 'expertise',
    role: loc('Госэкспертиза', 'Gosexpertiza', 'Gosexpertiza', 'Госэкспертиза'),
    department: 'expertise',
    summary: loc(
      'Репетирует замечания эксперта. Сначала expertise_gate, потом формулировки.',
      'Rehearses expert remarks. Call expertise_gate first, then wording.',
      'Uzman itirazlarını prova eder. Önce expertise_gate, sonra cümle.',
      'Сарапшы ескертулерін жаттықтырады. Алдымен expertise_gate, сосын мәтін.',
    ),
    skills: ['expertise-gate'],
    tools: ['expertise_gate', 'project_status', 'record_finding'],
  },
];

export const PLAYBOOK: PlaybookStep[] = [
  {
    id: 'concept',
    stage: 'concept',
    index: '01',
    title: loc('Концепт / ТЗ', 'Concept / TZ', 'Konsept / TZ', 'Концепт / ТЗ'),
    body: loc(
      'Зафиксировать заказчика, участок, типологию, ТЭП и риски. Не выпускать рабочие штампы.',
      'Lock client, site, typology, TEP and risks. Do not issue working-project stamps.',
      'İşveren, arsa, tipoloji, TEP ve riskleri kilitle. Uygulama damgası basma.',
      'Тапсырыс беруші, учаске, типология, ТЭП және тәуекелді бекіту. Жұмыс мөрін қоймау.',
    ),
  },
  {
    id: 'sketch',
    stage: 'sketch',
    index: '02',
    title: loc('Эскизный проект', 'Sketch project (EP)', 'Mimari eskiz (EP)', 'Эскиздік жоба'),
    body: loc(
      'Генплан, планы, фасады, разрез, ТЭП, 3D. Изыскания могут отсутствовать — это позже закроет ворота.',
      'Site, plans, elevations, one section, TEP, 3D. Missing surveys will close the later gate.',
      'Vaziyet, plan, cephe, kesit, TEP, 3D. Eksik etütler sonraki kapıyı kapatır.',
      'Бас жоспар, жоспарлар, қасбет, қима, ТЭП, 3D. Жоқ ізденістер кейінгі қақпаны жабады.',
    ),
  },
  {
    id: 'working',
    stage: 'working',
    index: '03',
    title: loc('Рабочий проект', 'Working project (RP)', 'Uygulama projesi (RP)', 'Жұмыс жобасы'),
    body: loc(
      'АР фиксирует оси, затем КР, затем инженерия. BIM параллелен и не заменяет листы.',
      'AR locks grids, then KR, then MEP. BIM is parallel and does not replace sheets.',
      'AR aksları kilitler, sonra KR, sonra tesisat. BIM paraleldir; paftanın yerini tutmaz.',
      'АР осьтерді бекітеді, сосын КР, сосын инженерия. BIM параллель; парақты алмастырмайды.',
    ),
  },
  {
    id: 'documentation',
    stage: 'documentation',
    index: '04',
    title: loc('Документация', 'Documentation', 'Dokümantasyon', 'Құжаттама'),
    body: loc(
      'Альбом, содержание, git: 00-brief … 04-expertise. Один объект — один репозиторий.',
      'Album, sheet index, git: 00-brief … 04-expertise. One object, one repository.',
      'Albüm, pafta listesi, git: 00-brief … 04-expertise. Bir nesne, bir repo.',
      'Альбом, мазмұн, git: 00-brief … 04-expertise. Бір нысан — бір репозиторий.',
    ),
  },
  {
    id: 'expertise',
    stage: 'expertise',
    index: '05',
    title: loc('Ворота Госэкспертизы', 'Gosexpertiza gate', 'Gosexpertiza kapısı', 'Госэкспертиза қақпасы'),
    body: loc(
      'Все обязательные коды — ready или approved. Иначе ворота закрыты. Заключение выдаёт орган.',
      'Every required code must be ready or approved. Otherwise the gate stays closed. The authority issues the conclusion.',
      'Her zorunlu kod ready veya approved olmalı. Değilse kapı kapalı. Sonuç kurumundur.',
      'Әр міндетті код ready немесе approved болуы керек. Әйтпесе қақпа жабық. Қорытынды органдікі.',
    ),
  },
];

export const PIPELINE_ORDER: StageId[] = ['concept', 'sketch', 'working', 'documentation', 'expertise', 'approved'];

export type GateResult = {
  projectId: string;
  stage: StageId;
  canSubmitExpertise: boolean;
  blocking: Array<{ code: string; name: Copy; status: SectionStatus; owner: DepartmentId }>;
  warnings: Array<{ code: string; name: Copy; status: SectionStatus; owner: DepartmentId }>;
  readyCount: number;
  requiredCount: number;
};

export function gate(project: PipelineProject): GateResult {
  const required = project.sections.filter((section) => section.requiredForExpertise);
  const isOpen = (status: SectionStatus) => status === 'ready' || status === 'approved';
  const blocking = required
    .filter((section) => !isOpen(section.status))
    .map((section) => ({
      code: section.code,
      name: section.name,
      status: section.status,
      owner: section.owner,
    }));
  const warnings = project.sections
    .filter((section) => !section.requiredForExpertise && !isOpen(section.status))
    .map((section) => ({
      code: section.code,
      name: section.name,
      status: section.status,
      owner: section.owner,
    }));
  const readyCount = required.filter((section) => isOpen(section.status)).length;
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

export function findProject(idOrCode: string): PipelineProject | undefined {
  const needle = idOrCode.trim().toLowerCase();
  return PROJECTS.find(
    (project) =>
      project.id === needle ||
      project.code.toLowerCase() === needle ||
      project.name.toLowerCase() === needle,
  );
}

export function getDepartment(id: DepartmentId): Department | undefined {
  return DEPARTMENTS.find((department) => department.id === id);
}
