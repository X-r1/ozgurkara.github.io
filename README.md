# Özgür Kara — Mimarlık Portfolyosu

**Canlı site:** https://x-r1.github.io/ozgurkara.github.io/

Tekirdağ Namık Kemal Üniversitesi Mimarlık Bölümü 4. sınıf öğrencisi Özgür Kara'nın kişisel portfolyosu. Projeler, 3D maketler, teknik çizimler ve özgeçmiş tek bir kesintisiz sahnede, kaydırdıkça anlatılıyor. Site Türkçe ve İngilizce.

## Sitede neler var

**Giriş: parçalardan mekân kurmak**
Sayfa açılınca kartondan bir arazi maketi katman katman yükseliyor, ağaçlar dikiliyor ve tepesine bir Rubik küpü iniyor. Küp kendi kendine yavaşça dönüp katmanlarını çeviriyor; üstüne tıklayınca hızlanıyor.

**Aşağı kaydırınca**
Küp havaya kalkıp 27 parçasına dağılıyor. Parçaların üçü sıraya giriyor ve her biri, projelere inildikçe bir binanın kütle modeline dönüşüyor: *her parça bir proje*.

**Projeler**

| Proje | Ne | Yıl |
|---|---|---|
| Prime Ofis | 3 katlı mimarlık ofisi, Tekirdağ | 2026 |
| Modulus | Çok katlı ofis binası (grup projesi: Zeynep Aybüke Kurt, Melike Salman, Özgür Kara) | 2025 |
| Oblique Mağaza | Ticari yapı, giyim mağazası | 2026 |

Her projede döndürülüp güneş açısı değiştirilebilen bir 3D maket, yakınlaştırılabilir kat planları, kesitler, görünüşler, detaylar, indirilebilir pafta seti (PDF) ve render galerisi var.

**Özgeçmiş: el feneri**
Projelerden sonra şalter iniyor, ekran kararıyor. Sağ üstten bir el feneri yanıyor; önce isme dar bir odakla vuruyor, aşağı indikçe odak dağılıp bütün özgeçmişi aydınlatıyor. Fener ara ara göz kırpıyor, hüzmede toz zerreleri süzülüyor. TR ve EN özgeçmiş PDF olarak indirilebiliyor.

**Sonsuz döngü**
Sayfanın en altında ışık çemberi arazi maketinin en alt katmanına dönüşüyor. Kaydırmaya devam edince kamera maketin üstünde yürüyormuş gibi ilerliyor, katmanlar önünde yükseliyor, küp iniyor ve site başa dönüyor. En üstte yukarı kaydırınca da aynı yol tersten oynuyor. Geçişler tamamen kaydırmaya bağlı; durunca duruyor, geri kaydırınca geri gidiyor.

## Nasıl yapıldı

- **3D:** [Three.js](https://threejs.org) (WebGL). Arazi maketi, ağaçlar, duman arka planı ve ışık efektleri kodla üretiliyor.
- **Modeller:** Blender'da hazırlanıp sıkıştırılmış glTF (`.glb`) olarak dışa aktarıldı. Rubik küpü de Blender'da modellendi.
- **Çizimler:** AutoCAD paftaları görsele çevrildi.
- **Derleme aracı yok:** Düz HTML, CSS ve JavaScript. Dosyalar GitHub Pages'te olduğu gibi yayınlanıyor.

## Dosyalar

| Dosya / klasör | İçerik |
|---|---|
| `index.html` | Sayfa, 3D sahne, proje detay paneli, çizim görüntüleyici, TR/EN metinler |
| `patch-kup.js` | Arazi maketi, küp ve kaydırma animasyonları, el feneri, sonsuz döngü |
| `projects.js` | Proje bilgileri, model, çizim ve görsel listeleri |
| `style.css` | Görünüm |
| `models/` | 3D modeller (`.glb` ve çift tıkla açmak için `.glb.js` kopyaları) |
| `drawings/` | Paftalar ve PDF setleri |
| `images/` | Renderlar |
| `cv.pdf`, `cv-en.pdf` | İndirilebilir özgeçmiş |

---

## Bakım notları (site sahibi için)

**Bilgisayarda açmak:** `index.html`'e çift tıkla. İnternet gerekir (Three.js internetten yüklenir).

**Güncellemek:** Bu klasörde (GitHub Desktop'taki repo klasörü) değişiklik yap, GitHub Desktop'ta **Commit to main → Push origin**. Force push kullanma. Site 1-2 dakikada güncellenir, sonra **Ctrl + F5**.

| Ne değişecek | Nerede |
|---|---|
| Projeler (isim, yıl, yer, açıklama) | `projects.js` |
| Projelerin İngilizcesi | `projects.js`'te her projedeki `en: { ... }` |
| Giriş yazısı, CV, iletişim | `index.html` (giriş: `class="hero"`, CV: `id="cv"`) |
| İngilizce arayüz metinleri | `index.html` içinde `const EN = {` |
| Renkler, yazı tipleri | `style.css` en üstteki `:root` |
| Özgeçmiş PDF'leri | `cv.pdf`, `cv-en.pdf`; yenisini aynı adla üzerine kaydet |

**Yeni 3D model:** Modeli `.glb` olarak `models/` klasörüne koy, `projects.js`'te projeye `model: 'models/ad.glb'` yaz. Sonra `modelleri-hazirla.bat`'a çift tıkla; bu, çift tıkla açılan sayfa için `.glb.js` kopyasını üretir. Yayındaki site `.glb`'yi doğrudan kullanır.

**Yeni çizim:** Dosyayı `drawings/<proje>/` klasörüne koy ve `projects.js`'te ilgili listeye bir satır ekle: `{ title: 'Çatı Planı', src: PO + 'cati-plani.jpg', note: '1/100' }`. Aynı adla üzerine kaydedersen başka bir şey yapmana gerek yok. PDF doğrudan gösterilemez, JPG'ye çevir (uzun kenar 4000–5000 px).

**Yeni proje:** `projects.js`'te bir projeyi kopyalayıp bilgilerini değiştir; sitede otomatik görünür.
