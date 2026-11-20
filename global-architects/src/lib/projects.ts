import type { AppLocale } from '@/i18n/routing';
import { loc, type Copy } from '@/lib/studio';

export type ProjectCategory =
  | 'industrial'
  | 'healthcare'
  | 'residential'
  | 'commercial'
  | 'office'
  | 'construction';

export type DrawingKind =
  | 'warehouse-campus'
  | 'service-yard'
  | 'clinic-lowrise'
  | 'clinic-campus'
  | 'residential-tower'
  | 'residential-block'
  | 'office-bar'
  | 'factory-plant'
  | 'retail-block'
  | 'hq-pavilion'
  | 'facade-study'
  | 'office-fitout';

export type ProjectFact = {
  label: Copy;
  value: Copy;
};

export type MaterialSwatch = {
  name: Copy;
  hex: string;
};

export type Project = {
  slug: string;
  category: ProjectCategory;
  drawing: DrawingKind;
  featured: boolean;
  yearLabel: string;
  client: string;
  title: Copy;
  typology: Copy;
  location: Copy;
  summary: Copy;
  program: Copy[];
  facts: ProjectFact[];
  palette: MaterialSwatch[];
};

const stagesDraftWorking = loc(
  'Эскизный + рабочий проект',
  'Draft + working project',
  'Avan + uygulama projesi',
  'Эскиздік + жұмыс жобасы',
);

export const CATEGORIES: { id: 'all' | ProjectCategory; label: Copy }[] = [
  { id: 'all', label: loc('Все', 'All', 'Tümü', 'Барлығы') },
  { id: 'industrial', label: loc('Промышленность', 'Industrial', 'Sanayi', 'Өнеркәсіп') },
  { id: 'healthcare', label: loc('Медицина', 'Healthcare', 'Sağlık', 'Медицина') },
  { id: 'residential', label: loc('Жильё', 'Residential', 'Konut', 'Тұрғын үй') },
  { id: 'commercial', label: loc('Коммерция', 'Commercial', 'Ticari', 'Коммерция') },
  { id: 'office', label: loc('Офисы', 'Office', 'Ofis', 'Кеңсе') },
  {
    id: 'construction',
    label: loc('Строительство', 'Construction', 'İnşaat', 'Құрылыс'),
  },
];

export const PROJECTS: Project[] = [
  {
    slug: 'tema-retail-kz',
    category: 'industrial',
    drawing: 'warehouse-campus',
    featured: true,
    yearLabel: '2022',
    client: 'ТОО «TEMA RETAIL KZ»',
    title: loc(
      'Административно-складской комплекс TEMA RETAIL KZ',
      'TEMA RETAIL KZ administrative and warehouse complex',
      'TEMA RETAIL KZ idari ve depo kompleksi',
      'TEMA RETAIL KZ әкімшілік-қойма кешені',
    ),
    typology: loc(
      'Логистика / администрация',
      'Logistics / administration',
      'Lojistik / idare',
      'Логистика / әкімшілік',
    ),
    location: loc(
      'Алматинская область, с. М. Туймебаев',
      'Almaty Region, M. Tuymebaev village',
      'Almatı bölgesi, M. Tuymebay köyü',
      'Алматы облысы, М. Түймебай ауылы',
    ),
    summary: loc(
      'Эскизный и рабочий проект административно-складского комплекса на участке 7,3510 га. Этажность 1–3. Сроки: 1 июля 2022 — 2022.',
      'Draft and working project for an administrative and warehouse complex on a 7.3510 ha plot. 1–3 storeys. 1 July 2022–2022.',
      '7,3510 ha arsa üzerinde idari-depo kompleksi için avan ve uygulama projesi. 1–3 kat. 1 Temmuz 2022–2022.',
      '7,3510 га учаскеде әкімшілік-қойма кешенінің эскиздік және жұмыс жобасы. 1–3 қабат. 2022 ж. 1 шілде — 2022.',
    ),
    program: [
      loc(
        'Складские корпуса и административный блок на одной площадке.',
        'Warehouse halls and an administrative block on a single site.',
        'Tek sahada depo hangarları ve idari blok.',
        'Бір алаңда қойма корпустары мен әкімшілік блок.',
      ),
      loc(
        'Генеральный план участка 7,3510 га в Туймебаеве.',
        'Masterplan of the 7.3510 ha plot in Tuymebaev.',
        'Tuymebay’de 7,3510 ha alanın vaziyet planı.',
        'Түймебайдағы 7,3510 га учаскенің бас жоспары.',
      ),
    ],
    facts: [
      {
        label: loc('Участок', 'Plot', 'Arsa', 'Учаске'),
        value: loc('7,3510 га', '7.3510 ha', '7,3510 ha', '7,3510 га'),
      },
      {
        label: loc('Этажность', 'Floors', 'Kat', 'Қабат'),
        value: loc('1–3', '1–3', '1–3', '1–3'),
      },
      {
        label: loc('Стадии', 'Stages', 'Aşamalar', 'Кезеңдер'),
        value: stagesDraftWorking,
      },
    ],
    palette: [
      { name: loc('Бетон', 'Concrete', 'Beton', 'Бетон'), hex: '#b7b1a6' },
      { name: loc('Сталь', 'Steel', 'Çelik', 'Болат'), hex: '#5c5852' },
      { name: loc('Стекло', 'Glass', 'Cam', 'Шыны'), hex: '#9aa4a8' },
    ],
  },
  {
    slug: 'borusan-makina-karaganda',
    category: 'industrial',
    drawing: 'service-yard',
    featured: true,
    yearLabel: '2021–2023',
    client: 'ТОО «Borusan Makina Kazakhstan»',
    title: loc(
      'Borusan Makina — Caterpillar, Караганда',
      'Borusan Makina — Caterpillar, Karaganda',
      'Borusan Makina — Caterpillar, Karaganda',
      'Borusan Makina — Caterpillar, Қарағанды',
    ),
    typology: loc(
      'Сервис тяжёлой техники',
      'Heavy-equipment service',
      'Ağır iş makinesi servisi',
      'Ауыр техника сервисі',
    ),
    location: loc(
      'Караганда, мкр. Октябрьский, уч. кв. 089, зд. 503',
      'Karaganda, Oktyabrsky microdistrict, cadastral block 089, building 503',
      'Karaganda, Oktyabrsky mahallesi, 089 ada, 503 yapı',
      'Қарағанды, Октябрьский шағын ауданы, 089 есеп кварталы, 503 ғимарат',
    ),
    summary: loc(
      'Эскизный и рабочий проекты административно-бытового комплекса и шести инженерных объектов. Сроки: 1 июня 2021 — 2023. Участок 9,1775 га, этажность 1–3. Рабочие проекты получили положительное заключение экспертизы: пристройка блока D цеха тяжёлой техники, расширение котельной с резервуарами СУГ и ГРП, пристройка сборочного цеха, АБК, центр комплектации.',
      'Draft and working projects for an administrative-household complex and six engineering facilities. 1 June 2021–2023. Plot 9.1775 ha, 1–3 storeys. Working projects received positive expert conclusions: Block D extension of the heavy-machinery shop, boiler-room expansion with LPG tanks and a gas distribution point, assembly-shop extension, ABC building, packing centre.',
      'İdari-sosyal kompleks ve altı mühendislik tesisi için avan ve uygulama projeleri. 1 Haziran 2021–2023. Arsa 9,1775 ha, 1–3 kat. Uygulama projeleri olumlu ekspertiz aldı: ağır makine atölyesi D bloğu eki, LPG tankları ve gaz dağıtım noktasıyla kazan dairesi genişlemesi, montaj atölyesi eki, idari-sosyal bina, paketleme merkezi.',
      'Әкімшілік-тұрмыстық кешен мен алты инженерлік нысанның эскиздік және жұмыс жобалары. 2021 ж. 1 маусым — 2023. Учаске 9,1775 га, 1–3 қабат. Жұмыс жобалары сараптаманың оң қорытындысын алды: ауыр техника цехының D блогының жапсарламасы, СКГ резервуарлары мен ГРТ бар қазандықты кеңейту, құрастыру цехының жапсарламасы, ӘТК, жинақтау орталығы.',
    ),
    program: [
      loc(
        'Ремонтный цех тяжёлой техники и обследование строительных конструкций.',
        'Heavy-machinery repair shop and structural survey of existing buildings.',
        'Ağır makine tamir atölyesi ve mevcut yapıların strüktürel etüdü.',
        'Ауыр техника жөндеу цехі және құрылыс конструкцияларын зерттеу.',
      ),
      loc(
        'Шесть дополнительных инженерных сооружений на площадке Caterpillar.',
        'Six additional engineering structures on the Caterpillar yard.',
        'Caterpillar sahasında altı ek mühendislik yapısı.',
        'Caterpillar алаңындағы алты қосымша инженерлік құрылыс.',
      ),
    ],
    facts: [
      {
        label: loc('Участок', 'Plot', 'Arsa', 'Учаске'),
        value: loc('9,1775 га', '9.1775 ha', '9,1775 ha', '9,1775 га'),
      },
      {
        label: loc('Этажность', 'Floors', 'Kat', 'Қабат'),
        value: loc('1–3', '1–3', '1–3', '1–3'),
      },
      {
        label: loc('Инженерные объекты', 'Engineering works', 'Mühendislik tesisleri', 'Инженерлік нысандар'),
        value: loc('6', '6', '6', '6'),
      },
    ],
    palette: [
      { name: loc('Сталь', 'Steel', 'Çelik', 'Болат'), hex: '#4f4c47' },
      { name: loc('Бетон', 'Concrete', 'Beton', 'Бетон'), hex: '#c2bbb0' },
      { name: loc('Катафорез', 'Shop grey', 'Atölye grisi', 'Цех сұр'), hex: '#6d6a64' },
    ],
  },
  {
    slug: 'borusan-makina-almaty',
    category: 'office',
    drawing: 'hq-pavilion',
    featured: false,
    yearLabel: '2013–2015',
    client: 'ТОО «Borusan Makina Kazakhstan»',
    title: loc(
      'Офисное здание Borusan Makina, Алматы',
      'Borusan Makina office building, Almaty',
      'Borusan Makina ofis binası, Almatı',
      'Borusan Makina кеңсе ғимараты, Алматы',
    ),
    typology: loc('Штаб-квартира', 'Headquarters', 'Merkez ofis', 'Бас кеңсе'),
    location: loc('Алматы', 'Almaty', 'Almatı', 'Алматы'),
    summary: loc(
      'Эскизный и рабочий проект офисного здания. Площадь 6500 м², этажность 1–3. Сроки: 2013–2015. Бюджет проекта: 10,5 млн USD.',
      'Draft and working project for an office building. 6,500 m², 1–3 storeys. 2013–2015. Project budget: USD 10.5 million.',
      'Ofis binası için avan ve uygulama projesi. 6.500 m², 1–3 kat. 2013–2015. Proje bütçesi: 10,5 milyon USD.',
      'Кеңсе ғимаратының эскиздік және жұмыс жобасы. 6500 м², 1–3 қабат. 2013–2015. Жоба бюджеті: 10,5 млн USD.',
    ),
    program: [
      loc(
        'Административный объём 1–3 этажа для дилера Caterpillar в Алматы.',
        'A 1–3 storey administrative volume for the Caterpillar dealer in Almaty.',
        'Almatı’daki Caterpillar bayisi için 1–3 katlı idari hacim.',
        'Алматыдағы Caterpillar дилеріне арналған 1–3 қабатты әкімшілік көлем.',
      ),
    ],
    facts: [
      {
        label: loc('Площадь', 'Area', 'Alan', 'Алаңы'),
        value: loc('6500 м²', '6,500 m²', '6.500 m²', '6500 м²'),
      },
      {
        label: loc('Этажность', 'Floors', 'Kat', 'Қабат'),
        value: loc('1–3', '1–3', '1–3', '1–3'),
      },
      {
        label: loc('Бюджет', 'Budget', 'Bütçe', 'Бюджет'),
        value: loc('10,5 млн USD', 'USD 10.5 m', '10,5 milyon USD', '10,5 млн USD'),
      },
    ],
    palette: [
      { name: loc('Камень', 'Stone', 'Taş', 'Тас'), hex: '#c5bba8' },
      { name: loc('Стекло', 'Glass', 'Cam', 'Шыны'), hex: '#8f9aa0' },
      { name: loc('Сталь', 'Steel', 'Çelik', 'Болат'), hex: '#3d3b38' },
    ],
  },
  {
    slug: 'borusan-khabarovsk',
    category: 'industrial',
    drawing: 'service-yard',
    featured: false,
    yearLabel: '2022',
    client: 'Borusan Makina',
    title: loc(
      'Сервисный центр Borusan Makina, Хабаровск',
      'Borusan Makina service centre, Khabarovsk',
      'Borusan Makina servis merkezi, Habarovsk',
      'Borusan Makina сервистік орталығы, Хабаровск',
    ),
    typology: loc(
      'Концепт сервисного центра',
      'Service-centre concept',
      'Servis merkezi konsepti',
      'Сервис орталығының концепті',
    ),
    location: loc(
      'Российская Федерация, Хабаровск, Хабаровский край',
      'Russian Federation, Khabarovsk, Khabarovsk Krai',
      'Rusya Federasyonu, Habarovsk, Habarovsk Krayı',
      'Ресей Федерациясы, Хабаровск, Хабаровск өлкесі',
    ),
    summary: loc(
      'Концепт-проект сервисного центра тяжёлой техники Borusan Makina в Хабаровске.',
      'Concept design for a Borusan Makina heavy-equipment service centre in Khabarovsk.',
      'Habarovsk’ta Borusan Makina ağır iş makinesi servis merkezi konsept projesi.',
      'Хабаровскідегі Borusan Makina ауыр техника сервистік орталығының концепт-жобасы.',
    ),
    program: [
      loc(
        'Сервисная площадка дилера Caterpillar на Дальнем Востоке.',
        'A Caterpillar-dealer service yard in the Russian Far East.',
        'Rusya Uzak Doğu’da Caterpillar bayisi servis sahası.',
        'Ресей Қиыр Шығысындағы Caterpillar дилерінің сервистік алаңы.',
      ),
    ],
    facts: [
      {
        label: loc('Стадия', 'Stage', 'Aşama', 'Кезең'),
        value: loc('Концепт-проект', 'Concept project', 'Konsept proje', 'Концепт-жоба'),
      },
    ],
    palette: [
      { name: loc('Сталь', 'Steel', 'Çelik', 'Болат'), hex: '#55524d' },
      { name: loc('Бетон', 'Concrete', 'Beton', 'Бетон'), hex: '#d0c9bc' },
    ],
  },
  {
    slug: 'amur-machinery',
    category: 'industrial',
    drawing: 'service-yard',
    featured: false,
    yearLabel: '2022',
    client: 'ООО «Amur Machinery and Services»',
    title: loc(
      'Сервисный центр Amur Machinery, Хабаровск',
      'Amur Machinery service centre, Khabarovsk',
      'Amur Machinery servis merkezi, Habarovsk',
      'Amur Machinery сервистік орталығы, Хабаровск',
    ),
    typology: loc('Сервисный центр', 'Service centre', 'Servis merkezi', 'Сервистік орталық'),
    location: loc(
      'Российская Федерация, Хабаровск',
      'Russian Federation, Khabarovsk',
      'Rusya Federasyonu, Habarovsk',
      'Ресей Федерациясы, Хабаровск',
    ),
    summary: loc(
      'Концепт и рабочий проект сервисного центра. Площадь комплекса 31 902 м², высота 4–12 м, этажность 1–2. Сроки: 14 февраля 2022 — 2022.',
      'Concept and working project for a service centre. Complex area 31,902 m², height 4–12 m, 1–2 storeys. 14 February 2022–2022.',
      'Servis merkezi için konsept ve uygulama projesi. Kompleks alanı 31.902 m², yükseklik 4–12 m, 1–2 kat. 14 Şubat 2022–2022.',
      'Сервистік орталықтың концепті мен жұмыс жобасы. Кешен алаңы 31 902 м², биіктігі 4–12 м, 1–2 қабат. 2022 ж. 14 ақпан — 2022.',
    ),
    program: [
      loc(
        'Ангарные пролёты 4–12 м для обслуживания тяжёлой техники.',
        '4–12 m hall spans for heavy-equipment maintenance.',
        'Ağır makine bakımı için 4–12 m açıklıklı hangarlar.',
        'Ауыр техникаға қызмет көрсетуге арналған 4–12 м аралықты ангарлар.',
      ),
    ],
    facts: [
      {
        label: loc('Площадь комплекса', 'Complex area', 'Kompleks alanı', 'Кешен алаңы'),
        value: loc('31 902 м²', '31,902 m²', '31.902 m²', '31 902 м²'),
      },
      {
        label: loc('Высота', 'Height', 'Yükseklik', 'Биіктігі'),
        value: loc('4–12 м', '4–12 m', '4–12 m', '4–12 м'),
      },
      {
        label: loc('Этажность', 'Floors', 'Kat', 'Қабат'),
        value: loc('1–2', '1–2', '1–2', '1–2'),
      },
    ],
    palette: [
      { name: loc('Профлист', 'Profiled sheet', 'Trapez sac', 'Профильді парақ'), hex: '#7a756c' },
      { name: loc('Бетон', 'Concrete', 'Beton', 'Бетон'), hex: '#b8b2a7' },
    ],
  },
  {
    slug: 'orhun-medical-aktobe',
    category: 'healthcare',
    drawing: 'clinic-lowrise',
    featured: true,
    yearLabel: '2022',
    client: 'ТОО «Orhun Medical»',
    title: loc(
      'Онкологическая клиника Orhun Medical, Актобе',
      'Orhun Medical oncology clinic, Aktobe',
      'Orhun Medical onkoloji kliniği, Aktöbe',
      'Orhun Medical онкологиялық клиникасы, Ақтөбе',
    ),
    typology: loc(
      'Многопрофильная онкология',
      'Multidisciplinary oncology',
      'Çok disiplinli onkoloji',
      'Көпсалалы онкология',
    ),
    location: loc('Актобе', 'Aktobe', 'Aktöbe', 'Ақтөбе'),
    summary: loc(
      'Концепт-проект многопрофильной онкологической клиники с диагностическим центром. Двухэтажное здание 5787 м². Старт: 4 апреля 2022. Первый этаж: ПЭТ, ОФЭКТ-КТ, томотерапия, циклотрон; второй этаж — медицинский центр. Концепт передан заказчику на согласование.',
      'Concept for a multidisciplinary oncology clinic with a diagnostic centre. Two-storey building, 5,787 m². Started 4 April 2022. Ground floor: PET, SPECT-CT, tomotherapy, cyclotron; first floor: medical centre. Concept submitted to the client for approval.',
      'Tanı merkeziyle çok disiplinli onkoloji kliniği konsepti. İki katlı bina, 5.787 m². Başlangıç: 4 Nisan 2022. Zemin kat: PET, SPECT-BT, tomoterapi, siklotron; üst kat: tıp merkezi. Konsept onay için işverene teslim edildi.',
      'Диагностикалық орталығы бар көпсалалы онкологиялық клиниканың концепт-жобасы. Екіқабатты ғимарат, 5787 м². Басталуы: 2022 ж. 4 сәуір. Бірінші қабат: ПЭТ, ОФЭКТ-КТ, томотерапия, циклотрон; екінші қабат — медициналық орталық. Концепт келісуге тапсырыс берушіге берілді.',
    ),
    program: [
      loc(
        'Ядерная медицина и лучевая терапия на первом этаже.',
        'Nuclear medicine and radiotherapy on the ground floor.',
        'Zemin katta nükleer tıp ve radyoterapi.',
        'Бірінші қабаттағы ядролық медицина мен сәулелік терапия.',
      ),
      loc(
        'Медицинский центр на втором этаже.',
        'Medical centre on the upper floor.',
        'Üst katta tıp merkezi.',
        'Екінші қабаттағы медициналық орталық.',
      ),
    ],
    facts: [
      {
        label: loc('Площадь', 'Area', 'Alan', 'Алаңы'),
        value: loc('5787 м²', '5,787 m²', '5.787 m²', '5787 м²'),
      },
      {
        label: loc('Этажность', 'Floors', 'Kat', 'Қабат'),
        value: loc('2', '2', '2', '2'),
      },
      {
        label: loc('Стадия', 'Stage', 'Aşama', 'Кезең'),
        value: loc('Концепт-проект', 'Concept project', 'Konsept proje', 'Концепт-жоба'),
      },
    ],
    palette: [
      { name: loc('Белый объём', 'White mass', 'Beyaz kütle', 'Ақ көлем'), hex: '#e7e1d6' },
      { name: loc('Стекло', 'Glass', 'Cam', 'Шыны'), hex: '#a3b0b4' },
      { name: loc('Сталь', 'Steel', 'Çelik', 'Болат'), hex: '#2f2d2a' },
    ],
  },
  {
    slug: 'orhun-medical-almaty-reconstruction',
    category: 'healthcare',
    drawing: 'clinic-lowrise',
    featured: false,
    yearLabel: '—',
    client: 'ТОО «Orhun Medical»',
    title: loc(
      'Реконструкция под медицинский центр Orhun Medical, Алматы',
      'Reconstruction for Orhun Medical centre, Almaty',
      'Orhun Medical tıp merkezi rekonstrüksiyonu, Almatı',
      'Orhun Medical медициналық орталығына реконструкция, Алматы',
    ),
    typology: loc(
      'Реконструкция торгового центра',
      'Shopping-centre reconstruction',
      'AVM rekonstrüksiyonu',
      'Сауда орталығын реконструкциялау',
    ),
    location: loc('Алматы', 'Almaty', 'Almatı', 'Алматы'),
    summary: loc(
      'Эскизный проект реконструкции торгового центра под медицинский центр Orhun Medical.',
      'Draft design for reconstructing a shopping centre into an Orhun Medical centre.',
      'Bir alışveriş merkezinin Orhun Medical tıp merkezine dönüştürülmesi için avan proje.',
      'Сауда орталығын Orhun Medical медициналық орталығына қайта жаңғыртудың эскиздік жобасы.',
    ),
    program: [
      loc(
        'Смена функции: торговля → диагностика и клиника.',
        'Change of use: retail to diagnostics and clinic.',
        'İşlev değişimi: perakende → tanı ve klinik.',
        'Функция ауысуы: сауда → диагностика және клиника.',
      ),
    ],
    facts: [
      {
        label: loc('Стадия', 'Stage', 'Aşama', 'Кезең'),
        value: loc('Эскизный проект', 'Draft project', 'Avan proje', 'Эскиздік жоба'),
      },
    ],
    palette: [
      { name: loc('Существующий каркас', 'Existing frame', 'Mevcut karkas', 'Бар каркас'), hex: '#8a8378' },
      { name: loc('Новый интерьер', 'New interior', 'Yeni iç mekân', 'Жаңа интерьер'), hex: '#d8d1c4' },
    ],
  },
  {
    slug: 'orhun-head-office',
    category: 'office',
    drawing: 'office-bar',
    featured: false,
    yearLabel: '2017–2018',
    client: 'ТОО «Orhun Medical»',
    title: loc(
      'Головной офис Orhun Medical, Алматы',
      'Orhun Medical head office, Almaty',
      'Orhun Medical genel müdürlük, Almatı',
      'Orhun Medical бас кеңсесі, Алматы',
    ),
    typology: loc('Офис', 'Office', 'Ofis', 'Кеңсе'),
    location: loc('Алматы', 'Almaty', 'Almatı', 'Алматы'),
    summary: loc(
      'Проектирование головного офиса Orhun Medical в Алматы. Сроки: 2017–2018.',
      'Design of the Orhun Medical head office in Almaty. 2017–2018.',
      'Almatı’daki Orhun Medical genel müdürlük binasının tasarımı. 2017–2018.',
      'Алматыдағы Orhun Medical бас кеңсесінің жобалауы. 2017–2018.',
    ),
    program: [
      loc(
        'Административный блок медицинской группы.',
        'Administrative block for the medical group.',
        'Sağlık grubunun idari bloğu.',
        'Медициналық топтың әкімшілік блогы.',
      ),
    ],
    facts: [
      {
        label: loc('Стадии', 'Stages', 'Aşamalar', 'Кезеңдер'),
        value: loc('Проектирование', 'Design', 'Tasarım', 'Жобалау'),
      },
    ],
    palette: [
      { name: loc('Штукатурка', 'Render', 'Sıva', 'Сылақ'), hex: '#d6cfc2' },
      { name: loc('Стекло', 'Glass', 'Cam', 'Шыны'), hex: '#97a3a8' },
    ],
  },
  {
    slug: 'alma-medical-group',
    category: 'healthcare',
    drawing: 'clinic-campus',
    featured: true,
    yearLabel: '2023',
    client: 'ТОО «ALMA MEDICAL GROUP»',
    title: loc(
      'Многопрофильная онкологическая клиника ALMA MEDICAL GROUP',
      'ALMA MEDICAL GROUP multidisciplinary oncology clinic',
      'ALMA MEDICAL GROUP çok disiplinli onkoloji kliniği',
      'ALMA MEDICAL GROUP көпсалалы онкологиялық клиникасы',
    ),
    typology: loc(
      'Клиника + подземный паркинг',
      'Clinic + underground parking',
      'Klinik + yeraltı otoparkı',
      'Клиника + жер асты тұрағы',
    ),
    location: loc('Алматы', 'Almaty', 'Almatı', 'Алматы'),
    summary: loc(
      'Эскизный и рабочий проект. Площадь здания 17 418 м², 3 этажа плюс подземный паркинг. Сроки: 15 февраля 2023 — 4 апреля 2023.',
      'Draft and working project. Building area 17,418 m², 3 storeys plus underground parking. 15 February 2023–4 April 2023.',
      'Avan ve uygulama projesi. Bina alanı 17.418 m², 3 kat artı yeraltı otoparkı. 15 Şubat 2023–4 Nisan 2023.',
      'Эскиздік және жұмыс жобасы. Ғимарат алаңы 17 418 м², 3 қабат және жер асты тұрағы. 2023 ж. 15 ақпан — 4 сәуір.',
    ),
    program: [
      loc(
        'Онкологический комплекс с подземным паркингом в Алматы.',
        'Oncology complex with underground parking in Almaty.',
        'Almatı’da yeraltı otoparklı onkoloji kompleksi.',
        'Алматыдағы жер асты тұрағы бар онкологиялық кешен.',
      ),
    ],
    facts: [
      {
        label: loc('Площадь', 'Area', 'Alan', 'Алаңы'),
        value: loc('17 418 м²', '17,418 m²', '17.418 m²', '17 418 м²'),
      },
      {
        label: loc('Этажность', 'Floors', 'Kat', 'Қабат'),
        value: loc('3 + подземный паркинг', '3 + basement parking', '3 + bodrum otopark', '3 + жер асты тұрағы'),
      },
    ],
    palette: [
      { name: loc('Камень', 'Stone', 'Taş', 'Тас'), hex: '#cfc6b6' },
      { name: loc('Стекло', 'Glass', 'Cam', 'Шыны'), hex: '#8d9aa0' },
      { name: loc('Металл', 'Metal', 'Metal', 'Металл'), hex: '#2a2926' },
    ],
  },
  {
    slug: 'artemida',
    category: 'commercial',
    drawing: 'retail-block',
    featured: false,
    yearLabel: '2019',
    client: 'ТОО «Artemida»',
    title: loc(
      'Реконструкция торгового центра Artemida',
      'Artemida shopping centre reconstruction',
      'Artemida alışveriş merkezi rekonstrüksiyonu',
      'Artemida сауда орталығын реконструкциялау',
    ),
    typology: loc('Реконструкция ТЦ', 'Mall reconstruction', 'AVM rekonstrüksiyonu', 'СО реконструкциясы'),
    location: loc(
      'Алматы, Бостандыкский район',
      'Almaty, Bostandyk district',
      'Almatı, Bostandyk ilçesi',
      'Алматы, Бостандық ауданы',
    ),
    summary: loc(
      'Эскизный и рабочий проект реконструкции. Площадь здания 53 521 м², 12 этажей. Старт: 11 февраля 2019.',
      'Draft and working reconstruction project. Building area 53,521 m², 12 storeys. Started 11 February 2019.',
      'Rekonstrüksiyon için avan ve uygulama projesi. Bina alanı 53.521 m², 12 kat. Başlangıç: 11 Şubat 2019.',
      'Реконструкцияның эскиздік және жұмыс жобасы. Ғимарат алаңы 53 521 м², 12 қабат. Басталуы: 2019 ж. 11 ақпан.',
    ),
    program: [
      loc(
        'Существующий торговый объём в Бостандыке — переустройство и усиление.',
        'An existing retail volume in Bostandyk — reworking and strengthening.',
        'Bostandyk’teki mevcut ticari hacmin yeniden düzenlenmesi ve güçlendirilmesi.',
        'Бостандықтағы бар сауда көлемін қайта жайластыру және күшейту.',
      ),
    ],
    facts: [
      {
        label: loc('Площадь', 'Area', 'Alan', 'Алаңы'),
        value: loc('53 521 м²', '53,521 m²', '53.521 m²', '53 521 м²'),
      },
      {
        label: loc('Этажность', 'Floors', 'Kat', 'Қабат'),
        value: loc('12', '12', '12', '12'),
      },
    ],
    palette: [
      { name: loc('Стекло', 'Glass', 'Cam', 'Шыны'), hex: '#9aa7ad' },
      { name: loc('Камень', 'Stone', 'Taş', 'Тас'), hex: '#b7ae9f' },
      { name: loc('Бронза', 'Bronze', 'Bronz', 'Қола'), hex: '#8a7355' },
    ],
  },
  {
    slug: 'four-seasons',
    category: 'residential',
    drawing: 'residential-tower',
    featured: true,
    yearLabel: '2020–2021',
    client: 'ТОО «ALFA stroy»',
    title: loc(
      'МЖК Four Seasons',
      'Four Seasons multifunctional residential complex',
      'Four Seasons çok işlevli konut kompleksi',
      'Four Seasons көпфункционалды тұрғын кешені',
    ),
    typology: loc('Многофункциональный ЖК', 'Mixed-use residential', 'Karma kullanımlı konut', 'Аралас тұрғын кешен'),
    location: loc(
      'Алматы, Бостандыкский район',
      'Almaty, Bostandyk district',
      'Almatı, Bostandyk ilçesi',
      'Алматы, Бостандық ауданы',
    ),
    summary: loc(
      'Эскизный и рабочий проект. Площадь здания 42 524 м², 12 этажей. Сроки: 27 июля 2020 — 2021. Первая и вторая очереди получили положительное заключение государственной экспертизы.',
      'Draft and working project. Building area 42,524 m², 12 storeys. 27 July 2020–2021. Stages 1 and 2 received positive state-expertise conclusions.',
      'Avan ve uygulama projesi. Bina alanı 42.524 m², 12 kat. 27 Temmuz 2020–2021. 1. ve 2. etaplar devlet ekspertizinden olumlu sonuç aldı.',
      'Эскиздік және жұмыс жобасы. Ғимарат алаңы 42 524 м², 12 қабат. 2020 ж. 27 шілде — 2021. Бірінші және екінші кезек мемлекеттік сараптаманың оң қорытындысын алды.',
    ),
    program: [
      loc(
        'Две очереди многофункционального жилого комплекса в Бостандыке.',
        'Two stages of a mixed-use residential complex in Bostandyk.',
        'Bostandyk’te karma kullanımlı konut kompleksinin iki etabı.',
        'Бостандықтағы аралас тұрғын кешеннің екі кезегі.',
      ),
    ],
    facts: [
      {
        label: loc('Площадь', 'Area', 'Alan', 'Алаңы'),
        value: loc('42 524 м²', '42,524 m²', '42.524 m²', '42 524 м²'),
      },
      {
        label: loc('Этажность', 'Floors', 'Kat', 'Қабат'),
        value: loc('12', '12', '12', '12'),
      },
      {
        label: loc('Заказчик', 'Client', 'İşveren', 'Тапсырыс беруші'),
        value: loc('ALFA stroy', 'ALFA stroy', 'ALFA stroy', 'ALFA stroy'),
      },
    ],
    palette: [
      { name: loc('Штукатурка', 'Render', 'Sıva', 'Сылақ'), hex: '#e4ddd0' },
      { name: loc('Стекло', 'Glass', 'Cam', 'Шыны'), hex: '#8b969c' },
      { name: loc('Цоколь', 'Plinth', 'Kaide', 'Іргетас'), hex: '#5a564f' },
    ],
  },
  {
    slug: 'union',
    category: 'residential',
    drawing: 'residential-block',
    featured: true,
    yearLabel: '2021',
    client: 'ТОО «TUR-KHAN»',
    title: loc(
      'МЖК UNION',
      'UNION multifunctional residential complex',
      'UNION çok işlevli konut kompleksi',
      'UNION көпфункционалды тұрғын кешені',
    ),
    typology: loc('Многофункциональный ЖК', 'Mixed-use residential', 'Karma kullanımlı konut', 'Аралас тұрғын кешен'),
    location: loc(
      'Алматинская область, Бесагаш',
      'Almaty Region, Besagash',
      'Almatı bölgesi, Besagaş',
      'Алматы облысы, Бесағаш',
    ),
    summary: loc(
      'Эскизный и рабочий проект. Площадь здания 134 372 м², участок 5,39 га, 9 этажей. Старт: 10 февраля 2021. Рабочий проект 23 июня 2021 получил положительное заключение государственной экспертизы.',
      'Draft and working project. Building area 134,372 m², plot 5.39 ha, 9 storeys. Started 10 February 2021. The working project received a positive state-expertise conclusion on 23 June 2021.',
      'Avan ve uygulama projesi. Bina alanı 134.372 m², arsa 5,39 ha, 9 kat. Başlangıç: 10 Şubat 2021. Uygulama projesi 23 Haziran 2021’de devlet ekspertizinden olumlu sonuç aldı.',
      'Эскиздік және жұмыс жобасы. Ғимарат алаңы 134 372 м², учаске 5,39 га, 9 қабат. Басталуы: 2021 ж. 10 ақпан. Жұмыс жобасы 2021 ж. 23 маусымда мемлекеттік сараптаманың оң қорытындысын алды.',
    ),
    program: [
      loc(
        'Квартальная застройка на 5,39 га в Бесагаше.',
        'Block planning on 5.39 ha in Besagash.',
        'Besagaş’ta 5,39 ha üzerinde ada yerleşimi.',
        'Бесағаштағы 5,39 га кварталдық құрылыс.',
      ),
    ],
    facts: [
      {
        label: loc('Площадь здания', 'Building area', 'Bina alanı', 'Ғимарат алаңы'),
        value: loc('134 372 м²', '134,372 m²', '134.372 m²', '134 372 м²'),
      },
      {
        label: loc('Участок', 'Plot', 'Arsa', 'Учаске'),
        value: loc('5,39 га', '5.39 ha', '5,39 ha', '5,39 га'),
      },
      {
        label: loc('Этажность', 'Floors', 'Kat', 'Қабат'),
        value: loc('9', '9', '9', '9'),
      },
    ],
    palette: [
      { name: loc('Кирпич', 'Brick', 'Tuğla', 'Кірпіш'), hex: '#8d6e56' },
      { name: loc('Стекло', 'Glass', 'Cam', 'Шыны'), hex: '#9aa6ab' },
      { name: loc('Бетон', 'Concrete', 'Beton', 'Бетон'), hex: '#c9c2b5' },
    ],
  },
  {
    slug: 'hayat-apartments',
    category: 'residential',
    drawing: 'facade-study',
    featured: false,
    yearLabel: '2021–2022',
    client: 'ТОО «Time Group Construction» / Hayat Construction Group',
    title: loc(
      'МЖК Hayat Apartments — фасады',
      'Hayat Apartments MRC — facades',
      'Hayat Apartments — cepheler',
      'Hayat Apartments МЖК — қасбеттер',
    ),
    typology: loc('Дизайн фасадов', 'Facade design', 'Cephe tasarımı', 'Қасбет дизайны'),
    location: loc('Алматы', 'Almaty', 'Almatı', 'Алматы'),
    summary: loc(
      'Дизайн фасадов МЖК Hayat Apartments. Комплект передан заказчику ТОО «Hayat Construction Group». Сроки проектирования: 8 апреля 2021 — 2022.',
      'Facade design for Hayat Apartments MRC. Drawings delivered to Hayat Construction Group LLP. Design period: 8 April 2021–2022.',
      'Hayat Apartments cephe tasarımı. Paftalar Hayat Construction Group LLP’ye teslim edildi. Tasarım: 8 Nisan 2021–2022.',
      'Hayat Apartments МЖК қасбеттерінің дизайны. Жинақ «Hayat Construction Group» ЖШС-не берілді. Жобалау: 2021 ж. 8 сәуір — 2022.',
    ),
    program: [
      loc(
        'Фасадный код жилого комплекса — без выдачи чужих фотографий объекта за съёмку бюро.',
        'A facade code for the residential complex — studio drawings, not stock photographs of the building.',
        'Konut kompleksi için cephe kodu — stok fotoğraf değil, büro çizimleri.',
        'Тұрғын кешеннің қасбет кодексі — нысанның бөтен фотосы емес, бюро сызбалары.',
      ),
    ],
    facts: [
      {
        label: loc('Стадия', 'Stage', 'Aşama', 'Кезең'),
        value: loc('Дизайн фасадов', 'Facade design', 'Cephe tasarımı', 'Қасбет дизайны'),
      },
    ],
    palette: [
      { name: loc('Штукатурка', 'Render', 'Sıva', 'Сылақ'), hex: '#ddd4c4' },
      { name: loc('Оконный проём', 'Window void', 'Pencere boşluğu', 'Терезе ойығы'), hex: '#2c2a26' },
      { name: loc('Металл', 'Metal', 'Metal', 'Металл'), hex: '#6e6258' },
    ],
  },
  {
    slug: 'new-time',
    category: 'residential',
    drawing: 'residential-tower',
    featured: false,
    yearLabel: '2022',
    client: '—',
    title: loc(
      'ЖК New Time',
      'New Time residential complex',
      'New Time konut kompleksi',
      'New Time тұрғын кешені',
    ),
    typology: loc(
      'Жилой комплекс с паркингом',
      'Residential with parking',
      'Otoparklı konut',
      'Тұрағы бар тұрғын кешен',
    ),
    location: loc(
      'Алматы, Медеуский район',
      'Almaty, Medeu district',
      'Almatı, Medeu ilçesi',
      'Алматы, Медеу ауданы',
    ),
    summary: loc(
      'Эскизный и рабочий проект жилого комплекса New Time с подземным паркингом и детской площадкой в Медеуском районе. Старт: 2022.',
      'Draft and working project for New Time — a residential complex with underground parking and a playground in Medeu district. Started 2022.',
      'Medeu ilçesinde yeraltı otoparkı ve çocuk oyun alanı olan New Time konut kompleksi için avan ve uygulama projesi. Başlangıç: 2022.',
      'Медеу ауданындағы жер асты тұрағы мен балалар алаңы бар New Time тұрғын кешенінің эскиздік және жұмыс жобасы. Басталуы: 2022.',
    ),
    program: [
      loc(
        'Подземный паркинг и двор с детской площадкой.',
        'Underground parking and a courtyard playground.',
        'Yeraltı otoparkı ve çocuk oyun alanlı avlu.',
        'Жер асты тұрағы және балалар алаңы бар аула.',
      ),
    ],
    facts: [
      {
        label: loc('Стадии', 'Stages', 'Aşamalar', 'Кезеңдер'),
        value: stagesDraftWorking,
      },
      {
        label: loc('Район', 'District', 'İlçe', 'Аудан'),
        value: loc('Медеу', 'Medeu', 'Medeu', 'Медеу'),
      },
    ],
    palette: [
      { name: loc('Штукатурка', 'Render', 'Sıva', 'Сылақ'), hex: '#e6dfd2' },
      { name: loc('Стекло', 'Glass', 'Cam', 'Шыны'), hex: '#8e9aa0' },
    ],
  },
  {
    slug: 'aqualine',
    category: 'office',
    drawing: 'office-bar',
    featured: false,
    yearLabel: '2020',
    client: 'ТОО «TUR-KHAN»',
    title: loc(
      'Офис Aqualine',
      'Aqualine office',
      'Aqualine ofisi',
      'Aqualine кеңсесі',
    ),
    typology: loc('Офисное здание', 'Office building', 'Ofis binası', 'Кеңсе ғимараты'),
    location: loc('Алматы', 'Almaty', 'Almatı', 'Алматы'),
    summary: loc(
      'Эскизный и рабочий проект. Площадь 1853 м², высота 15,400 м, 4 этажа. Старт: 3 ноября 2020.',
      'Draft and working project. Area 1,853 m², height 15.400 m, 4 storeys. Started 3 November 2020.',
      'Avan ve uygulama projesi. Alan 1.853 m², yükseklik 15,400 m, 4 kat. Başlangıç: 3 Kasım 2020.',
      'Эскиздік және жұмыс жобасы. Алаңы 1853 м², биіктігі 15,400 м, 4 қабат. Басталуы: 2020 ж. 3 қараша.',
    ),
    program: [
      loc(
        'Четырёхэтажный административный объём высотой 15,4 м.',
        'A four-storey administrative volume 15.4 m high.',
        '15,4 m yüksekliğinde dört katlı idari hacim.',
        'Биіктігі 15,4 м төртқабатты әкімшілік көлем.',
      ),
    ],
    facts: [
      {
        label: loc('Площадь', 'Area', 'Alan', 'Алаңы'),
        value: loc('1853 м²', '1,853 m²', '1.853 m²', '1853 м²'),
      },
      {
        label: loc('Высота', 'Height', 'Yükseklik', 'Биіктігі'),
        value: loc('15,400 м', '15.400 m', '15,400 m', '15,400 м'),
      },
      {
        label: loc('Этажность', 'Floors', 'Kat', 'Қабат'),
        value: loc('4', '4', '4', '4'),
      },
    ],
    palette: [
      { name: loc('Стекло', 'Glass', 'Cam', 'Шыны'), hex: '#8fa0a6' },
      { name: loc('Алюминий', 'Aluminium', 'Alüminyum', 'Алюминий'), hex: '#b7b3aa' },
    ],
  },
  {
    slug: 'lc-waikiki',
    category: 'industrial',
    drawing: 'warehouse-campus',
    featured: false,
    yearLabel: '—',
    client: 'LC Waikiki',
    title: loc(
      'Административно-складской комплекс LC Waikiki',
      'LC Waikiki administrative and warehouse complex',
      'LC Waikiki idari ve depo kompleksi',
      'LC Waikiki әкімшілік-қойма кешені',
    ),
    typology: loc(
      'Администрация / склад',
      'Administration / warehouse',
      'İdare / depo',
      'Әкімшілік / қойма',
    ),
    location: loc('Казахстан', 'Kazakhstan', 'Kazakistan', 'Қазақстан'),
    summary: loc(
      'Рабочий проект «Строительство административно-складского комплекса» получил положительное заключение экспертизы и проходит государственную экспертизу.',
      'The working project “Construction of an administrative and warehouse complex” received a positive expert conclusion and is proceeding through state expertise.',
      '“İdari ve depo kompleksi inşaatı” uygulama projesi olumlu ekspertiz sonucu aldı ve devlet ekspertizinden geçmektedir.',
      '«Әкімшілік-қойма кешенін салу» жұмыс жобасы сараптаманың оң қорытындысын алды және мемлекеттік сараптамадан өтуде.',
    ),
    program: [
      loc(
        'Административный блок и складская логистика ритейлера.',
        'Retailer’s administrative block and warehouse logistics.',
        'Perakendecinin idari bloğu ve depo lojistiği.',
        'Бөлшек сауданың әкімшілік блогы мен қойма логистикасы.',
      ),
    ],
    facts: [
      {
        label: loc('Стадия', 'Stage', 'Aşama', 'Кезең'),
        value: loc(
          'Рабочий проект / экспертиза',
          'Working project / expertise',
          'Uygulama projesi / ekspertiz',
          'Жұмыс жобасы / сараптама',
        ),
      },
    ],
    palette: [
      { name: loc('Бетон', 'Concrete', 'Beton', 'Бетон'), hex: '#cfc8bc' },
      { name: loc('Сталь', 'Steel', 'Çelik', 'Болат'), hex: '#4a4742' },
    ],
  },
  {
    slug: 'halavet-kz',
    category: 'industrial',
    drawing: 'factory-plant',
    featured: true,
    yearLabel: '—',
    client: 'HALAVET KZ',
    title: loc(
      'Фабрика желатина HALAVET KZ',
      'HALAVET KZ gelatin factory',
      'HALAVET KZ jelatin fabrikası',
      'HALAVET KZ желатин фабрикасы',
    ),
    typology: loc(
      'Пищевое производство',
      'Food production',
      'Gıda üretimi',
      'Тағам өндірісі',
    ),
    location: loc('Казахстан', 'Kazakhstan', 'Kazakistan', 'Қазақстан'),
    summary: loc(
      'Эскизный проект первой в Центральной Азии фабрики по изготовлению желатина. Производственно-складские помещения — 8000 м²; административно-бытовой комплекс — 2000 м²; резервуар — 7000 м³; система очистки технологической воды — 8000 м³; котельная. На стадии разработки рабочего проекта.',
      'Sketch project for the first gelatin factory in Central Asia. Production and storage — 8,000 m²; administrative-household complex — 2,000 m²; tank — 7,000 m³; process-water treatment — 8,000 m³; boiler plant. Working project in development.',
      'Orta Asya’nın ilk jelatin fabrikası için eskiz proje. Üretim ve depolama — 8.000 m²; idari-sosyal kompleks — 2.000 m²; tank — 7.000 m³; proses suyu arıtma — 8.000 m³; kazan dairesi. Uygulama projesi geliştiriliyor.',
      'Орталық Азиядағы алғашқы желатин фабрикасының эскиздік жобасы. Өндірістік-қойма үй-жайлары — 8000 м²; әкімшілік-тұрмыстық кешен — 2000 м²; резервуар — 7000 м³; технологиялық су тазарту — 8000 м³; қазандық. Жұмыс жобасы әзірленуде.',
    ),
    program: [
      loc(
        'Производство и склад 8000 м², АБК 2000 м².',
        'Production and storage 8,000 m², ABC 2,000 m².',
        'Üretim ve depo 8.000 m², idari-sosyal 2.000 m².',
        'Өндіріс пен қойма 8000 м², ӘТК 2000 м².',
      ),
      loc(
        'Резервуар 7000 м³ и очистка воды 8000 м³, котельная.',
        '7,000 m³ tank and 8,000 m³ water treatment, boiler plant.',
        '7.000 m³ tank ve 8.000 m³ su arıtma, kazan dairesi.',
        '7000 м³ резервуар және 8000 м³ су тазарту, қазандық.',
      ),
    ],
    facts: [
      {
        label: loc('Производство / склад', 'Production / storage', 'Üretim / depo', 'Өндіріс / қойма'),
        value: loc('8000 м²', '8,000 m²', '8.000 m²', '8000 м²'),
      },
      {
        label: loc('АБК', 'ABC', 'İdari-sosyal', 'ӘТК'),
        value: loc('2000 м²', '2,000 m²', '2.000 m²', '2000 м²'),
      },
      {
        label: loc('Резервуар', 'Tank', 'Tank', 'Резервуар'),
        value: loc('7000 м³', '7,000 m³', '7.000 m³', '7000 м³'),
      },
      {
        label: loc('Очистка воды', 'Water treatment', 'Su arıtma', 'Су тазарту'),
        value: loc('8000 м³', '8,000 m³', '8.000 m³', '8000 м³'),
      },
    ],
    palette: [
      { name: loc('Нержавеющая сталь', 'Stainless steel', 'Paslanmaz çelik', 'Тот баспайтын болат'), hex: '#9a9590' },
      { name: loc('Бетон', 'Concrete', 'Beton', 'Бетон'), hex: '#c4bdb0' },
      { name: loc('Технологический синий', 'Process blue-grey', 'Proses gri-mavisi', 'Технологиялық сұр-көк'), hex: '#6b757a' },
    ],
  },
  {
    slug: 'shell-aktau',
    category: 'construction',
    drawing: 'office-fitout',
    featured: false,
    yearLabel: '2016+',
    client: 'Shell Development Kazakhstan',
    title: loc(
      'Офисы Shell — Алматы и Актау',
      'Shell offices — Almaty and Aktau',
      'Shell ofisleri — Almatı ve Aktau',
      'Shell кеңселері — Алматы және Ақтау',
    ),
    typology: loc(
      'Fit-out / KA Global Construction',
      'Fit-out / KA Global Construction',
      'Fit-out / KA Global Construction',
      'Fit-out / KA Global Construction',
    ),
    location: loc('Алматы; Актау', 'Almaty; Aktau', 'Almatı; Aktau', 'Алматы; Ақтау'),
    summary: loc(
      'Строительное подразделение KA Global Construction. Офис Shell Development в Алматы: 2016, 3200 м², 2 этажа, бюджет 2,7 млн USD. По отзыву заказчика успешное завершение алматинского офиса дало основание продолжить работу над офисом Shell в Актау — от проекта до сдачи.',
      'Delivered by the KA Global Construction division. Shell Development office in Almaty: 2016, 3,200 m², 2 storeys, budget USD 2.7 million. The client recorded that the successful Almaty office gave confidence to continue with the Shell Aktau office — from design through completion.',
      'KA Global Construction birimi. Almatı’daki Shell Development ofisi: 2016, 3.200 m², 2 kat, bütçe 2,7 milyon USD. İşveren, Almatı ofisinin başarılı tesliminin Shell Aktau ofisiyle — tasarımdan teslime — devam etme güveni verdiğini kaydetti.',
      'KA Global Construction құрылыс бөлімшесі. Алматыдағы Shell Development кеңсесі: 2016, 3200 м², 2 қабат, бюджет 2,7 млн USD. Тапсырыс беруші Алматы кеңсесінің сәтті аяқталуы Shell Ақтау кеңсесімен — жобадан тапсыруға дейін — жұмысты жалғастыруға сенім бергенін жазды.',
    ),
    program: [
      loc(
        'Fit-out административных интерьеров нефтегазового офиса.',
        'Fit-out of oil-and-gas administrative interiors.',
        'Petrol-gaz idari iç mekân fit-out’u.',
        'Мұнай-газ әкімшілік интерьерінің fit-out-ы.',
      ),
      loc(
        'Алматы 3200 м² / 2 этажа; продолжение — офис в Актау.',
        'Almaty 3,200 m² / 2 storeys; follow-on — Aktau office.',
        'Almatı 3.200 m² / 2 kat; devamı — Aktau ofisi.',
        'Алматы 3200 м² / 2 қабат; жалғасы — Ақтау кеңсесі.',
      ),
    ],
    facts: [
      {
        label: loc('Алматы, площадь', 'Almaty area', 'Almatı alanı', 'Алматы алаңы'),
        value: loc('3200 м²', '3,200 m²', '3.200 m²', '3200 м²'),
      },
      {
        label: loc('Этажность', 'Floors', 'Kat', 'Қабат'),
        value: loc('2', '2', '2', '2'),
      },
      {
        label: loc('Бюджет Алматы', 'Almaty budget', 'Almatı bütçesi', 'Алматы бюджеті'),
        value: loc('2,7 млн USD', 'USD 2.7 m', '2,7 milyon USD', '2,7 млн USD'),
      },
    ],
    palette: [
      { name: loc('Шпон', 'Veneer', 'Kaplama', 'Шпон'), hex: '#7a6248' },
      { name: loc('Стекло', 'Glass', 'Cam', 'Шыны'), hex: '#a8b2b6' },
      { name: loc('Сталь', 'Steel', 'Çelik', 'Болат'), hex: '#3a3834' },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return PROJECTS.filter((project) => project.featured);
}

export function getProjectsByCategory(category: string | undefined): Project[] {
  if (!category || category === 'all') return PROJECTS;
  return PROJECTS.filter((project) => project.category === category);
}

export function getRelatedProjects(slug: string, locale: AppLocale, limit = 3): Project[] {
  const current = getProject(slug);
  if (!current) return PROJECTS.slice(0, limit);
  const same = PROJECTS.filter((p) => p.slug !== slug && p.category === current.category);
  const rest = PROJECTS.filter((p) => p.slug !== slug && p.category !== current.category);
  void locale;
  return [...same, ...rest].slice(0, limit);
}

export function isProjectCategory(value: string | undefined): value is ProjectCategory | 'all' {
  return CATEGORIES.some((category) => category.id === value);
}
