# Mimari Portfolyo Sitesi

## Açmak
`index.html` dosyasına çift tıkla. İnternet bağlantısı gerekir (3D kütüphanesi Three.js internetten yüklenir).

> **3D modeller ve çift tıklama:** Tarayıcı, çift tıklanarak açılan sayfada `.glb` dosyalarını okumaz. Bu yüzden her modelin yanında bir `.glb.js` kopyası durur ve site onu kullanır. **Bir modeli ekledikten ya da Blender'dan yeniden dışa aktardıktan sonra `modelleri-hazirla.bat`'a çift tıkla**, kopyalar güncellenir. Bunu yapmazsan sitede modelin yerine örnek maket görünür.
> İnternette yayınlanan sitede bu kopyalar kullanılmaz, `.glb` dosyaları doğrudan yüklenir.

## Neyi nereden değiştiririm?
| Ne | Nerede |
|---|---|
| Projeler (isim, yıl, yer, alan, açıklama, etiketler) | `projects.js` |
| Adın, giriş yazısı, CV, iletişim bilgileri | `index.html` (giriş: `class="hero"`, CV: `id="cv"` bölümü) |
| İngilizce metinler (giriş, CV, düğmeler) | `index.html` içindeki `const EN = {` listesi. Türkçesi HTML'de, aynı anahtarla (`data-i18n="..."`) eşleşir |
| Projelerin İngilizcesi | `projects.js`'te her projedeki `en: { ... }`. Yazmadığın alan Türkçe görünür |
| Renkler, yazı tipleri | `style.css` en üstteki `:root` |
| İndirilebilir CV | `cv.pdf` (Türkçe) ve `cv-en.pdf` (İngilizce); yenisini aynı adla üzerine kaydet |

## Kendi 3D modellerini eklemek
1. Modelini **.glb** formatında dışa aktar:
   - **SketchUp / Rhino / Revit** → önce `.fbx` veya `.obj` olarak dışa aktar, **Blender**'da aç → *File › Export › glTF 2.0 (.glb)*
   - Rhino 8 ve Blender doğrudan `.glb` verebilir.
2. Dosyayı `models/` klasörüne koy (örn. `models/burgu-kule.glb`).
3. `projects.js`'te ilgili projede `model: 'models/burgu-kule.glb'` yaz.

Model otomatik olarak ortalanır, maket tablasına sığdırılır ve buz taşının içine yerleşir. Dosya boyutunu küçük tut (ideali 10 MB altı). Blender'da dışa aktarırken *Compression* seçeneğini açabilirsin.

İpucu: Ana sayfadaki taşın içi için `stoneModel` ile daha hafif ikinci bir model verebilirsin (iç mekansız, sadeleştirilmiş). Böylece sayfa telefonda da akıcı kalır. Tam model yalnızca 3D makette yüklenir.

## Çizimler (kat planı, kesit, görünüş, detay)
Projede `drawings` varsa detay panelinde **Çizimler** düğmeleri çıkar ve yakınlaştırılabilir bir görüntüleyici açılır. Çizimler `drawings/<proje>/` klasöründe durur. Desteklenen biçimler: `.jpg`, `.png`, `.webp`, `.svg`.

Kat planlarını güncellediğinde:
- **En kolayı:** Yeni paftayı aynı dosya adıyla kaydet, eskisinin üzerine yaz (örn. `drawings/primeofis/pafta-02.jpg`). Başka bir şey değiştirmen gerekmez.
- **Yeni çizim eklemek:** Dosyayı klasöre koy, `projects.js`'te ilgili listeye bir satır ekle:
  `{ title: 'Çatı Planı', src: PO + 'cati-plani.jpg', note: '1/100' }`
- **PDF'ten resim:** PDF'i doğrudan gösteremez. PDF'i JPG'ye çevir (uzun kenar 4000–5000 px okunaklı olur) ya da bu klasörde Claude'a "paftaları güncelle" de.

## Görsel (render) eklemek
Görselleri `images/` klasörüne koy, projede `images: ['images/kule-1.jpg', 'images/kule-2.jpg']` yaz. Proje detayında galeri olarak görünür.

## Yeni proje eklemek
`projects.js`'teki bir projeyi kopyalayıp listenin içine yapıştır ve bilgilerini değiştir. Sitede otomatik olarak yeni bir taş belirir.

## Ücretsiz yayınlamak
- **Netlify Drop**: https://app.netlify.com/drop adresine `portfolio` klasörünü sürükle-bırak.
- **GitHub Pages**: Klasörü bir GitHub deposuna yükle → *Settings › Pages* → `main` dalını seç.
- **Vercel**: Klasörü içe aktar, ayar gerekmez.
