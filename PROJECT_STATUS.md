# PROJECT_STATUS — Tek katlı avlu villa

Durum tarihi: 24 Kasım 2026, 14:20 (Qyzylorda, UTC+5).

Bu dosya ChatGPT ile ortak çalışma içindir. Onaylanmış tasarım bu adımda değiştirilmedi. CAD dosyası üretilmedi. Mevcut kod silinmedi.

## 1. Bu adımda yapılan

Mevcut klasörler, yazılmış kod ve Python kütüphaneleri incelendi. Onaylı villa görseli okundu. Geometri henüz çizilmedi. Duvar, kapı, pencere ve mahal koordinatları boş bırakıldı. Görseldeki tutarsız metrekareler CAD ölçüsü sayılmadı.

## 2. Kesin kurallar

Kaynak görsel: `TEK KATLI AVLU VİLLA`, tek kat, avlulu plan. Başlık: 4 yatak odası, ayrı mutfak, kış bahçesi (şömineli). Kuzey oku planın sol üstündedir. Giriş kuzeydedir.

- U biçimli kat planı korunur. Yeni veya farklı bir kat planı çizilmez.
- Mekânların konumu, yönü ve birbirleriyle ilişkisi korunur.
- 20,00 m × 40,00 m arsa sınırı ve 800 m² arsa kısıtı şimdilik modelin dışındadır. Bina U’su durur. Arsa çizgisi çizilmez.
- Görseli CAD içine resim olarak yapıştırmak işin kendisi değildir. Duvar, kapı, pencere, mobilya ve sıhhi tesisat düzenlenebilir vektördür.
- Duvarlar kalınlıklıdır. Kapılar duvar boşluğu ve açılış yayıdır. Pencereler doğrama çizgisidir.
- Mobilya ve sıhhi tesisat ayrı katmanlardadır.
- Ölçü ve mahal alanı, izlenen geometriden hesaplanır. Görseldeki çelişen sayılar kopyalanmaz.
- Ebeveyn banyosu, mevcut odanın içinde kalır: iki lavabo, tek duş, küvet, klozet, bide, dolap. Klozet ve bide ayrı mahremiyet bölmesindedir.
- Ortak banyo, mevcut odanın içinde kalır: tek lavabo, tek duş, klozet, bide, dolap.

## 3. Onaylı net kat yükseklikleri

| Hacim | Net yükseklik |
| --- | ---: |
| Salon, giriş, kış bahçesi | 4200 mm |
| Mutfak, master yatak odası | 3600 mm |
| Diğer yatak odaları | 3300 mm |
| Banyo ve teknik hacimler | 3000 mm |

Giriş holü, giriş saçağı ile birlikte giriş grubundadır ve 4200 mm kabul edilir. Portmanto, misafir WC, çamaşır, depo, teknik oda, ortak banyo, ebeveyn banyosu ve giyinme odası teknik veya ıslak hacimdir: 3000 mm. Yatak odası 1, 2 ve 3: 3300 mm.

## 4. Korunacak mekân ilişkisi

Plan U’dur. Batı kanat salon ve mutfak, kuzey kanat giriş ve üç yatak odası, doğu kanat master süit, orta boşluk havuzlu avludur. Avlu güneyde ana terasa açılır.

Kuzey kenarı, batıdan doğuya: teknik oda, çamaşır odası, depo, giriş saçağı, giriş holü, portmanto, misafir WC, yatak odası 1, yatak odası 2, yatak odası 3.

Batı kanat, kuzeyden güneye: mutfak terası, mutfak, salon, kış bahçesi. Kış bahçesi güneybatıdadır ve şöminelidir. Salon avluya ve kış bahçesine bakar.

Orta: açık avlu ve havuz. Camlı teras giriş holünün avlu tarafındadır.

Doğu kanat, kuzeyden güneye: üç yatak odası, ortak banyo, giyinme odası, master yatak odası, ebeveyn banyosu.

Güney: ana teras. Mutfak batıda kendi terasına açılır.

Cepheler, görseldeki sıra ile: ön cephe giriş (kuzey), arka cephe ana teras ve bahçe (güney), sağ cephe, sol cephe. Cephe çizimi ikinci adımdır. İlk vektör işi kat planıdır.

## 5. Görseldeki sayılar ölçü değildir

Afişteki metrekareler birbiriyle çelişir. CAD bunları kopyalamaz. Alan, kapalı poligonun alanıdır.

| Mekân | Plan etiketi | Alan tablosu |
| --- | ---: | ---: |
| Master yatak odası | 20,0 m² | 21,0 m² |
| Kış bahçesi | 22,0 m² | 20,0 m² |
| Avlu | 70,0 m² | 68,0 m² |
| Ana teras | 40,0 m² | 25,0 m² |
| Mutfak terası | 20,0 m² | 15,0 m² |

Tablo toplamı 247,0 m² net ve yaklaşık 300,0 m² brüt yazar. Bu toplamlar, iz sürme bitmeden doğrulanmış kabul edilmez. 20 × 40 m arsa ölçüsü de şimdilik bağlayıcı değildir.

Ortak banyonun afiş etiketi 6,0 m²’dir. İstenen cihaz grubu (lavabo, duş, klozet, bide, dolap) bu etikete sığmayabilir. Oda yeri değiştirilmez. Sığma kontrolü, izlenen poligonun alanıyla yapılır.

## 6. Klasörlerin durumu

İki ayrı yer vardır. FISTIK pastane kodu bu işin içine alınmaz. Mevcut dosyalar silinmedi.

| Yer | Ne | CAD |
| --- | --- | --- |
| `/agent/repos/FISTIK` | Pastane uygulaması. Dal `cursor/global-architects-app-e875`. Kökte market sitesi, `src`, `supabase`. | Yok. `station.ts` bu dalda yok. |
| `/agent/repos/FISTIK/global-architects` | Aynı daldaki tanıtım sitesi. | Vektör plan yok. |
| `/agent/repos/global-architects` | Pastaneden ayrılmış masa ve ajan. Kendi git deposu, dal `main`, ilk commit `a16b208`. | Metin pafta listesi var. DXF, IFC ve duvar geometrisi yok. |

FISTIK’e açılmış 2 ve 3 numaralı çekme istekleri kapatıldı. Pastane `main` dalına bu iş birleştirilmez.

Ayrılmış deponun parçaları:

- `global-architects` — Next.js 16.2.9 masa. Komut `npm run dev`, adres `http://localhost:3010/tr/station`.
- `global-architects-agent` — Agent SDK masası. Araçlar `study_base`, `expertise_gate`, `project_status`, `record_finding`.
- `global-architects/baza` — Four Seasons, UNION, Borusan Karaganda, LC Waikiki kayıtları. HALAVET süren iştir, kopya kaynağı değildir. Bu villa o albümlerin parçası değildir.
- `global-architects/src/lib/station.ts` — `produce` ve `deliver`. Dosya adından 3D, ОПЗ, AP, EO/SS, OV/VK ve dosya kapağı metni yazar.
- `global-architects/src/lib/disk-scan.ts` — Synology listesi. Duvar çizmez.

`deliver` bir sonuç metnidir. Duvar ekseni, kapı yayı, pencere doğraması ve mahal poligonu tutmaz. Villa CAD’i bu fonksiyonun çıktısı değildir.

## 7. Kütüphaneler

Python 3.12.3 kurulu. Üç paket kurulu değil. PyPI’da varlar. Bu adımda kurulmadılar.

| Paket | PyPI | İş |
| --- | --- | --- |
| ezdxf 1.4.5 | Var | Düzenlenebilir DXF. Katman, çizgi, yay, tarama, ölçü. |
| Shapely 2.2.0 | Var | Duvar kalınlığı, mahal poligonu, alan ve çakışma. |
| IfcOpenShell 0.9.0.post1 | Var | Sonraki adımda IFC. Duvar, kapı, pencere, mahal. |

Karar: tek kaynak JSON olur. DXF ve IFC o kayıttan üretilir. Revit, IFC veya aynı JSON ile ikinci adımdadır. Görsel, DXF’in içine altına yapıştırılmaz.

## 8. Ortak JSON

Dosya adı, iz başlayınca: `villa/model/plan.json`. Birim milimetredir. Kuzey +Y. Orijin, U planın izlenen kuzeybatı iç köşesidir. Bu adımda koordinat yazılmadı.

```json
{
  "id": "tek-katli-avlu-villa",
  "units": "mm",
  "north": "+Y",
  "siteBoundary": null,
  "source": "TEK KATLI AVLU VILLA sheet",
  "rooms": [
    {
      "id": "salon",
      "name": "Salon",
      "clearHeightMm": 4200,
      "polygon": [],
      "areaM2": null
    }
  ],
  "walls": [
    {
      "id": "W-000",
      "axis": [],
      "thicknessMm": null,
      "heightMm": null,
      "rooms": []
    }
  ],
  "doors": [
    {
      "id": "D-000",
      "wallId": "W-000",
      "widthMm": null,
      "heightMm": null,
      "swing": "left",
      "hinge": null
    }
  ],
  "windows": [
    {
      "id": "N-000",
      "wallId": "W-000",
      "widthMm": null,
      "heightMm": null,
      "sillMm": null
    }
  ],
  "fixtures": [
    {
      "id": "F-000",
      "roomId": "ebeveyn-banyo",
      "kind": "lavabo",
      "layer": "A-SANI"
    }
  ]
}
```

`polygon` ve `axis` boştur. Bilerek boştur. Uydurma koordinat onaylı planı değiştirir.

DXF katmanları, üretim başlayınca:

| Katman | İçerik |
| --- | --- |
| A-WALL | Duvar, gerçek kalınlık |
| A-DOOR | Kasa boşluğu ve açılış yayı |
| A-GLAZ | Pencere doğraması |
| A-ROOM | Mahal sınırı ve adı |
| A-FURN | Mobilya |
| A-SANI | Lavabo, duş, küvet, klozet, bide |
| A-DIM | Geometriden ölçü |
| A-ANNO | Mahal adı ve hesaplanan alan |

## 9. Çalışma sırası

Tasarım bu sırada da değiştirilmez. Her adım bir dosyadır. Bir sonraki adım, bir öncekinin dosyası durunca başlar.

1. Görseldeki U’yu milimetre ızgarasına izlemek. Arsa çizilmez. Mahal komşuluğu bölüm 4’teki gibi kalır.
2. Duvar ekseni ve kalınlık. Kalınlık, izdeki duvar genişliğinden gelir. Afişteki metrekareye uydurmak için duvar kaydırılmaz.
3. Kapı boşluğu ve yay. Pencere doğraması.
4. Shapely ile mahal poligonu ve alan. Afişle fark bir tabloya yazılır. Geometri, tabloya uysun diye şişirilmez.
5. Ebeveyn ve ortak banyonun cihazları, o odanın izlenen sınırı içinde, ayrı katmanda.
6. ezdxf ile DXF. JSON tek kaynaktır.
7. Yükseklikler oda özelliği olarak IFC’ye gider. Kat planı DXF’i 2B’dir. 3B, yüksekliği JSON’dan okur.
8. IfcOpenShell ile IFC. Revit o IFC’yi açar.

## 10. Bilinçli olarak yapılmayanlar

- DXF, DWG ve IFC yazılmadı.
- Duvar koordinatı uydurulmadı.
- `ezdxf`, `shapely` ve `ifcopenshell` kurulmadı.
- FISTIK pastane dosyaları değiştirilmedi ve silinmedi.
- 20 × 40 m arsa çizilmedi.
- Ebeveyn ve ortak banyo, evin planında başka odaya taşınmadı. Cihaz listesi, o odaların iç programıdır.
