# PROJECT_STATUS — Tek katlı avlu villa

Durum tarihi: 24 Kasım 2026, 20:13 (Qyzylorda, UTC+5).

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

Batı kanat: mutfak terası, mutfak, salon, kış bahçesi. Kuzey bar: teknik oda, çamaşır, depo, portmanto, rüzgarlık, masif çekirdek, misafir WC, giriş holünün nişi. Doğu kanat: üç yatak odası, ortak banyo, master, giyinme, ebeveyn banyosu. Orta: avlu ve havuz. Güney: ana teras. Giriş saçağı rüzgarlığın kuzeyindedir.

Ebeveyn banyosu kendi odasındadır: iki lavabo, duş, küvet, dolap, klozet ve bide. Klozet ile bide ayrı bölmededir. Ortak banyo kendi odasındadır: lavabo, duş, klozet, bide, dolap.

Net yükseklikler: salon, giriş holü, giriş saçağı, kış bahçesi ve rüzgarlık 4200 mm. Mutfak ve master 3600 mm. Diğer yatak odaları 3300 mm. Banyo ve teknik hacimler 3000 mm. Rüzgarlık, giriş grubunun parçası sayıldı.

## Hesaplanan alanlar

Afiş sayıları kopyalanmadı. Ayrıntı `villa/GEOMETRY_VALIDATION.md` içindedir.

| Mahal | m² |
| --- | ---: |
| Teknik oda | 10.16 |
| Çamaşır odası | 5.53 |
| Depo | 4.98 |
| Portmanto | 6.26 |
| Rüzgarlık | 8.15 |
| Misafir WC | 5.62 |
| Giriş holü | 27.84 |
| Mutfak | 32.78 |
| Salon | 58.24 |
| Kış bahçesi | 29.51 |
| Yatak odası 1 | 15.42 |
| Yatak odası 2 | 17.05 |
| Yatak odası 3 | 16.81 |
| Ortak banyo | 11.33 |
| Master yatak odası | 18.70 |
| Giyinme odası | 10.80 |
| Ebeveyn banyosu | 14.95 |
| Avlu | 143.45 |
| Ana teras | 57.72 |
| Mutfak terası | 11.43 |
| Giriş saçağı | 3.53 |

## Kontroller

Kontrol listesindeki maddeler geçti.

Kapılar duvar boşluğu olarak kesildi. Kanat yayları hedef mahalle bakıyor. Mahaller bahçeden kapı grafiğiyle dolaşılabiliyor. Duvar uçları birleşiyor.

## Sonraki adım

IFC ve Revit, bu kat planı onaylandıktan sonra. Onaydan önce duvar kaydırılmaz ve afişteki çelişen metrekareye uydurma yapılmaz.
