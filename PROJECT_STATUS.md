# PROJECT_STATUS — Tek katlı avlu villa

Durum tarihi: 25 Kasım 2026, 13:44 (Qyzylorda, UTC+5).

Aşama 02 işlendi. Onaylı U plan korundu. Yeni kat planı çizilmedi. Arsa sınırı modele alınmadı. CAD dosyası üretildi ve DXF geri okunarak kontrol edildi.

## Dosyalar

- `villa/generate_plan.py` — üretim ve kontrol kodu. ezdxf ve Shapely kullanır.
- `villa/project_geometry.json` — duvar, kapı, pencere, mahal ve cihaz kaydı. Birim milimetre. Kuzey +Y.
- `villa/villa_architectural.dxf` — düzenlenebilir plan.
- `villa/villa_architectural_preview.png` — bu DXF'in önizlemesi.
- `villa/GEOMETRY_VALIDATION.md` — kontrol raporu.
- `villa/reference-sheet.png` — izlenen afiş.

## Ölçek ve kalınlık

Ölçek tahmini: doğu kanat kapı boşluğu 22 px = 800 mm. Dış duvar 300 mm, iç bölme 140 mm. Bu kalınlıklar geçici model değeridir. СН РК veya СП РК hükmü olarak gösterilmez. Kesinleşmemiş her ölçü `certainty: estimated` taşır.

Orijin, U planın kuzeybatı iç köşesidir.

## Korunan ilişki

Batı kanat: mutfak terası, mutfak, salon, kış bahçesi. Kuzey bar: teknik oda, çamaşır, depo, portmanto, rüzgarlık, klasovaya 2, misafir WC, giriş holünün nişi. Doğu kanat: üç yatak odası, ortak banyo, master, giyinme, ebeveyn banyosu. Orta: avlu ve havuz. Güney: ana teras. Giriş saçağı rüzgarlığın kuzeyindedir. Pafta yazıları Rusçadır. Akslar 300 mm taşıyıcı duvarın merkezindedir.

Ebeveyn banyosu kendi odasındadır: iki lavabo, duş, küvet, dolap, klozet ve bide. Klozet ile bide ayrı bölmededir. Ortak banyo kendi odasındadır: lavabo, duş, klozet, bide, dolap.

Net yükseklikler: salon, giriş holü, giriş saçağı, kış bahçesi ve rüzgarlık 4200 mm. Mutfak ve master 3600 mm. Diğer yatak odaları 3300 mm. Banyo ve teknik hacimler 3000 mm. Rüzgarlık, giriş grubunun parçası sayıldı.

## Hesaplanan alanlar

Afiş sayıları kopyalanmadı. Ayrıntı `villa/GEOMETRY_VALIDATION.md` içindedir.

| Mahal | m² |
| --- | ---: |
| Техническое помещение | 10.16 |
| Постирочная | 5.53 |
| Кладовая | 4.98 |
| Гардероб | 6.26 |
| Тамбур | 8.15 |
| Гостевой санузел | 5.62 |
| Холл | 28.20 |
| Кухня | 32.78 |
| Гостиная | 58.24 |
| Зимний сад | 29.51 |
| Спальня 1 | 15.42 |
| Спальня 2 | 17.11 |
| Спальня 3 | 17.06 |
| Общая ванная | 11.50 |
| Спальня хозяев | 19.39 |
| Гардеробная | 10.80 |
| Ванная хозяев | 14.95 |
| Внутренний двор | 125.49 |
| Терраса | 54.53 |
| Терраса кухни | 11.43 |
| Кладовая 2 | 4.69 |
| Коридор | 17.88 |
| Козырёк входа | 3.53 |

## Kontroller

Kontrol listesindeki maddeler geçti.

Kapılar duvar boşluğu olarak kesildi. Kanat yayları hedef mahalle bakıyor. Mahaller bahçeden kapı grafiğiyle dolaşılabiliyor. Duvar uçları birleşiyor.

## Sonraki adım

IFC ve Revit, bu kat planı onaylandıktan sonra. Onaydan önce duvar kaydırılmaz ve afişteki çelişen metrekareye uydurma yapılmaz.
