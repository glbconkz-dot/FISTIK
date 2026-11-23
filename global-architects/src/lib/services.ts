import { loc, type Copy } from '@/lib/studio';

export type StudioService = {
  id: string;
  index: string;
  title: Copy;
  body: Copy;
};

export const SERVICES: StudioService[] = [
  {
    id: 'architecture',
    index: '01',
    title: loc('Архитектура', 'Architecture', 'Mimari', 'Сәулет'),
    body: loc(
      'Эскизный и рабочий проект жилых, административных и промышленных зданий любой сложности по лицензии I категории.',
      'Concept and working design for residential, administrative and industrial buildings of any complexity under an I-category license.',
      'I. kategori lisansıyla her ölçekte konut, idari ve sanayi yapıları için konsept ve uygulama projesi.',
      'I санатты лицензия бойынша кез келген күрделіліктегі тұрғын, әкімшілік және өнеркәсіп ғимараттарының эскиздік әрі жұмыс жобасы.',
    ),
  },
  {
    id: 'structure',
    index: '02',
    title: loc(
      'Конструкции',
      'Structural engineering',
      'Taşıyıcı sistem',
      'Конструкциялар',
    ),
    body: loc(
      'Расчёт строительных конструкций, нагрузки, обследования существующих каркасов — СНиП и Еврокоды.',
      'Structural calculations, loads and surveys of existing frames — SNiP and Eurocodes.',
      'Taşıyıcı hesap, yükler ve mevcut karkasların incelenmesi — SNiP ve Eurocode.',
      'Құрылыс конструкцияларын есептеу, жүктемелер, бар каркастарды тексеру — СНиП және Еурокодтар.',
    ),
  },
  {
    id: 'interiors',
    index: '03',
    title: loc('Интерьеры', 'Interiors', 'İç mimari', 'Интерьер'),
    body: loc(
      'Дизайн интерьеров и фасадов с 3D-визуализацией — от административных комплексов до медицинских и жилых объектов.',
      'Interior and facade design with 3D visualization — from administrative complexes to medical and residential buildings.',
      'İdari komplekslerden sağlık ve konut yapılarına 3D görselleştirmeli iç ve cephe tasarımı.',
      'Әкімшілік кешендерден медициналық және тұрғын нысандарға дейін 3D визуализациямен интерьер және қасбет дизайны.',
    ),
  },
  {
    id: 'masterplan',
    index: '04',
    title: loc('Мастер-план', 'Masterplanning', 'Master plan', 'Мастер-жоспар'),
    body: loc(
      'Планировка участков промышленных дворов, жилых кварталов и логистических кампусов — от гектаров Туймебая до Бесагаша.',
      'Site planning for industrial yards, residential blocks and logistics campuses — from Tuymebaev hectares to Besagash.',
      'Sanayi avluları, konut adaları ve lojistik kampüsler için alan planı — Tuymebay hektarlarından Besagaş’a.',
      'Өнеркәсіп аулалары, тұрғын кварталдар және логистикалық кампустардың жоспары — Түймебай гектарларынан Бесағашқа дейін.',
    ),
  },
  {
    id: 'bim',
    index: '05',
    title: loc('BIM / Revit / VR', 'BIM / Revit / VR', 'BIM / Revit / VR', 'BIM / Revit / VR'),
    body: loc(
      'Информационное моделирование, координация разделов и VR-просмотр объёмов до экспертизы.',
      'Information modelling, discipline coordination and VR review of massing before expertise.',
      'Bilgi modellemesi, disiplin koordinasyonu ve ekspertiz öncesi VR hacim incelemesi.',
      'Ақпараттық модельдеу, бөлімдерді үйлестіру және сараптамаға дейін VR көлем шолуы.',
    ),
  },
  {
    id: 'viz',
    index: '06',
    title: loc('3D-визуализация', '3D visualization', '3D görselleştirme', '3D визуализация'),
    body: loc(
      'Интерьеры и фасады проектируемых объектов — для согласования с заказчиком и экспертизы.',
      'Interiors and facades of the buildings we design — for client approval and expertise.',
      'Tasarladığımız yapıların iç mekân ve cephe görselleri — işveren onayı ve ekspertiz için.',
      'Жобалайтын нысандардың интерьері мен қасбеті — тапсырыс берушімен келісу және сараптама үшін.',
    ),
  },
  {
    id: 'supervision',
    index: '07',
    title: loc(
      'Авторский надзор',
      'Construction supervision',
      'Yapım denetimi',
      'Авторлық қадағалау',
    ),
    body: loc(
      'Сопровождение на площадке и согласование изменений рабочего проекта в ходе строительства.',
      'Site attendance and coordination of working-project changes during construction.',
      'Şantiyede eşlik ve uygulama projesindeki değişikliklerin inşaat sırasında koordinasyonu.',
      'Алаңда сүйемелдеу және құрылыс кезінде жұмыс жобасы өзгерістерін келісу.',
    ),
  },
  {
    id: 'stages',
    index: '08',
    title: loc(
      'Эскиз + рабочий проект',
      'Concept + working project',
      'Konsept + uygulama projesi',
      'Эскиз + жұмыс жобасы',
    ),
    body: loc(
      'Полный цикл: концепт, эскизный проект, рабочий проект, положительное заключение экспертизы.',
      'Full cycle: concept, draft design, working project, positive expert conclusion.',
      'Tam çevrim: konsept, avan proje, uygulama projesi, olumlu ekspertiz sonucu.',
      'Толық цикл: концепт, эскиздік жоба, жұмыс жобасы, сараптаманың оң қорытындысы.',
    ),
  },
  {
    id: 'codes',
    index: '09',
    title: loc(
      'СНиП / Еврокоды / экспертиза',
      'SNiP / Eurocodes / expertise',
      'SNiP / Eurocode / ekspertiz',
      'СНиП / Еурокодтар / сараптама',
    ),
    body: loc(
      'Нормативная база Казахстана и расчётные коды; подготовка комплектов к государственной экспертизе.',
      'Kazakhstan codes and calculation standards; packages prepared for state expertise.',
      'Kazakistan yönetmelikleri ve hesap kodları; devlet ekspertizi için pafta setleri.',
      'Қазақстан нормалары мен есеп кодтары; мемлекеттік сараптамаға жинақ дайындау.',
    ),
  },
  {
    id: 'mep',
    index: '10',
    title: loc(
      'Инженерные разделы',
      'Mechanical & electrical',
      'Mekanik ve elektrik',
      'Инженерлік бөлімдер',
    ),
    body: loc(
      'ОВ, ВК, ЭЛ, СС, котельные, газ, очистка воды — в составе промышленных и медицинских комплексов.',
      'HVAC, plumbing, electrical, low-current, boiler plants, gas and water treatment within industrial and medical complexes.',
      'HVAC, sıhhi tesisat, elektrik, zayıf akım, kazan dairesi, gaz ve su arıtma — sanayi ve sağlık komplekslerinde.',
      'Желдету, су, электр, әлсіз ток, қазандық, газ, су тазарту — өнеркәсіп және медицина кешендерінде.',
    ),
  },
  {
    id: 'construction',
    index: '11',
    title: loc(
      'KA Global Construction',
      'KA Global Construction',
      'KA Global Construction',
      'KA Global Construction',
    ),
    body: loc(
      'Строительное подразделение: строительство, ремонт и отделка. Офисы Shell в Алматы и Актау выполнены этим крылом.',
      'Construction division: building, repair and fit-out. The Shell Almaty and Aktau offices were delivered by this arm.',
      'İnşaat kolu: yapım, onarım ve fit-out. Shell Almatı ve Aktau ofisleri bu birim tarafından teslim edildi.',
      'Құрылыс бөлімшесі: салу, жөндеу және әрлеу. Shell-дің Алматы және Ақтау кеңселерін осы қанат орындады.',
    ),
  },
];
