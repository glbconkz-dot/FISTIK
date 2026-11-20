import { loc, type Copy } from '@/lib/studio';

export type TeamMember = {
  id: string;
  name: Copy;
  role: Copy;
  experience?: Copy;
};

export const TEAM: TeamMember[] = [
  {
    id: 'okan',
    name: loc('Окан Ешильгёз', 'Okan Yeşilgöz', 'Okan Yeşilgöz', 'Окан Ешильгёз'),
    role: loc(
      'Руководитель компании',
      'Managing Director',
      'Şirket yöneticisi',
      'Компания басшысы',
    ),
    experience: loc(
      '24 года в строительстве и проектировании',
      '24 years in construction and design',
      'İnşaat ve tasarımda 24 yıl',
      'Құрылыс пен жобалауда 24 жыл',
    ),
  },
  {
    id: 'uncham',
    name: loc('Унчам Сакашева', 'Uncham Sakasheva', 'Unçam Sakaşeva', 'Ұнчам Сақашева'),
    role: loc('Координатор проектов', 'Project coordinator', 'Proje koordinatörü', 'Жоба үйлестірушісі'),
    experience: loc('Стаж 13 лет', '13 years of practice', '13 yıl deneyim', '13 жылдық өтіл'),
  },
  {
    id: 'daniyar',
    name: loc('Данияр Ережепов', 'Daniyar Erezhepov', 'Daniyar Erejepov', 'Данияр Ережепов'),
    role: loc('Отдел снабжения', 'Supply department', 'Tedarik birimi', 'Жабдықтау бөлімі'),
    experience: loc(
      '18 лет в строительстве и проектировании',
      '18 years in construction and design',
      'İnşaat ve tasarımda 18 yıl',
      'Құрылыс пен жобалауда 18 жыл',
    ),
  },
  {
    id: 'evgeny',
    name: loc('Евгений Титов', 'Evgeny Titov', 'Yevgeni Titov', 'Евгений Титов'),
    role: loc(
      'Главный архитектор проекта (ГАП)',
      'Chief project architect (GAP)',
      'Baş proje mimarı (GAP)',
      'Жобаның бас сәулетшісі (ГАП)',
    ),
    experience: loc('Стаж 24 года', '24 years of practice', '24 yıl deneyim', '24 жылдық өтіл'),
  },
  {
    id: 'oryngali',
    name: loc(
      'Орынгали Алпысбаев',
      'Oryngali Alpysbayev',
      'Orıngali Alpısbayev',
      'Орынғали Алпысбаев',
    ),
    role: loc(
      'Руководитель группы конструкторов',
      'Head of structural engineers',
      'Konstrüktör grubu başkanı',
      'Конструкторлар тобының жетекшісі',
    ),
  },
  {
    id: 'katerina-g',
    name: loc('Катерина Гузеева', 'Katerina Guzeeva', 'Katerina Guzeeva', 'Катерина Гузеева'),
    role: loc('Архитектор', 'Architect', 'Mimar', 'Сәулетші'),
    experience: loc('Стаж 19 лет', '19 years of practice', '19 yıl deneyim', '19 жылдық өтіл'),
  },
  {
    id: 'olga-p',
    name: loc('Ольга Парфёнова', 'Olga Parfenova', 'Olga Parfenova', 'Ольга Парфёнова'),
    role: loc('Архитектор', 'Architect', 'Mimar', 'Сәулетші'),
    experience: loc('Стаж 18 лет', '18 years of practice', '18 yıl deneyim', '18 жылдық өтіл'),
  },
  {
    id: 'olga-k',
    name: loc('Ольга Халина', 'Olga Khalina', 'Olga Khalina', 'Ольга Халина'),
    role: loc('Архитектор', 'Architect', 'Mimar', 'Сәулетші'),
    experience: loc('Стаж 16 лет', '16 years of practice', '16 yıl deneyim', '16 жылдық өтіл'),
  },
  {
    id: 'alexandra',
    name: loc('Александра Белая', 'Alexandra Belaya', 'Alexandra Belaya', 'Александра Белая'),
    role: loc('Архитектор', 'Architect', 'Mimar', 'Сәулетші'),
    experience: loc(
      '14 лет в строительстве и проектировании',
      '14 years in construction and design',
      'İnşaat ve tasarımda 14 yıl',
      'Құрылыс пен жобалауда 14 жыл',
    ),
  },
  {
    id: 'katerina-s',
    name: loc(
      'Катерина Савинская',
      'Katerina Savinskaya',
      'Katerina Savinskaya',
      'Катерина Савинская',
    ),
    role: loc(
      'Инженер-проектировщик ЭЛ',
      'Electrical design engineer',
      'Elektrik proje mühendisi',
      'Электр жобалау инженері',
    ),
    experience: loc('Стаж 19 лет', '19 years of practice', '19 yıl deneyim', '19 жылдық өтіл'),
  },
  {
    id: 'alexander',
    name: loc('Александр Морозов', 'Alexander Morozov', 'Alexander Morozov', 'Александр Морозов'),
    role: loc(
      'Инженер-проектировщик СС',
      'Low-current systems engineer',
      'Zayıf akım sistem mühendisi',
      'Әлсіз ток жүйелерінің инженері',
    ),
  },
  {
    id: 'alina',
    name: loc('Алина Гарварт', 'Alina Garvart', 'Alina Garvart', 'Алина Гарварт'),
    role: loc('Архитектор', 'Architect', 'Mimar', 'Сәулетші'),
  },
  {
    id: 'anna',
    name: loc('Анна Шкуропатова', 'Anna Shkuropatova', 'Anna Shkuropatova', 'Анна Шкуропатова'),
    role: loc('Архитектор', 'Architect', 'Mimar', 'Сәулетші'),
  },
  {
    id: 'zhanel',
    name: loc(
      'Жанэль Бехмахамбет',
      'Zhanel Bekhmakhambet',
      'Janel Bekmahambet',
      'Жанэль Бекмахамбет',
    ),
    role: loc(
      'Ассистент руководителя',
      "Director's assistant",
      'Yönetici asistanı',
      'Басшының көмекшісі',
    ),
  },
];
