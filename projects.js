// =====================================================================
//  PROJELERİN — siteyi düzenlemek için çoğunlukla sadece bu dosyayı değiştir.
//  Her obje sitede bir "buz taşı" olur. Sıra = kaydırma sırası.
//
//  model:     Kendi 3D modelin (.glb). Örn: "models/vadi-kulesi.glb"
//  stoneModel: (isteğe bağlı) taşın içinde gösterilecek hafif sürüm; yoksa "model" kullanılır
//  schematic: (isteğe bağlı) şematik model; verilirse ana sayfada buz taşı yerine bu döner
//             Boş (null) bırakırsan aşağıdaki "generator" ile örnek bir maket çizilir.
//  generator: model yoksa kullanılacak örnek maket tipi:
//             "tower" | "terraces" | "pavilion" | "villa" | "courtyard" | "cylinder"
//  images:    Render görselleri. Örn: ["images/kule-1.jpg", "images/kule-2.jpg"]
//  drawings:  Teknik çizimler ("Çizimler" düğmesi). Her bölüm bir liste:
//             { title: 'Zemin Kat Planı', src: 'drawings/.../plan.jpg', note: '1/50' }
//             src: .jpg / .png / .svg / .webp olabilir. Boş bırakılan bölümde "yakında" yazar.
//  drawingsPdf: (isteğe bağlı) tüm paftaların PDF'i, indirme bağlantısı olarak görünür.
//  en:        İngilizce sürüm (sağ üstteki EN düğmesi). Yazmadığın alan Türkçe kalır.
//             Çizimlerde de olur: { title: 'Kesit A-A', ..., en: { title: 'Section A-A' } }
// =====================================================================

const PO = 'drawings/primeofis/';
const PI = 'images/primeofis/';
const OD = 'drawings/oblique/';
const OI = 'images/oblique/';
const MD = 'drawings/mts5/';
const MI = 'images/mts5/';
const LD = 'drawings/longevity/';
const LI = 'images/longevity/';

window.PORTFOLIO = {
  projects: [
    {
      id: 'prime-ofis',
      title: 'Prime Ofis',
      type: '3 Katlı Mimarlık Ofisi',
      year: '2026',
      location: 'Tekirdağ, Süleymanpaşa · Ada 2758 Parsel 4',
      area: '~870 m² kapalı alan · 755,60 m² parsel',
      status: 'Mimari Uygulama Projesi',
      role: 'Bireysel Proje',
      en: {
        type: '3-Storey Architecture Office',
        location: 'Tekirdağ, Süleymanpaşa · Block 2758 Plot 4',
        area: '~870 m² floor area · 755.60 m² plot',
        status: 'Architectural Construction Project',
        role: 'Individual Project',
        description: [
          'A three-storey architecture office on a plot with a slope of about 15–17%, designed with the logic of traditional Japanese timber construction. The ground floor is set into the hillside and opens onto the garden; the main entrance is on the first floor, at street level.',
          'The building sits on a 4.0 × 3.5 m structural grid. The structure consists of GL24h glulam columns and beams, CLT floor slabs and a reinforced concrete raft foundation. The roughly 2.5 m deep eave is carried by a kumimono bracket system, as in Japanese temples.',
          'The south-west facing offices, engawa and balconies open onto the Japanese garden and towards the sea. The north-east facade facing the street is kept more closed as the entrance, parking and service side. All technical drawings were produced by cutting sections from the 3D model.'
        ],
        tags: ['Japanese timber architecture', 'Kumimono', 'GL24h / CLT', 'Sloped site', 'Japanese garden']
      },
      description: [
        'Yaklaşık %15–17 eğimli bir parsel üzerinde, geleneksel Japon ahşap yapı mantığıyla tasarladığım üç katlı bir mimarlık ofisi. Zemin katı yamaca gömüp bahçeye açtım; ana girişi yol kotundan 1. kata aldım.',
        'Bina 4,0 × 3,5 m\'lik bir aks sistemine oturuyor. Taşıyıcı sistem GL24h lamine ahşap kolon ve kirişler, CLT döşemeler ve betonarme radye temelden oluşuyor. Yaklaşık 2,5 m dışarı taşan saçağı Japon tapınaklarındaki kumimono konsol sistemiyle taşıdım.',
        'Güneybatıya bakan ofisler, engawa ve balkonlar Japon bahçesine ve deniz yönüne açılıyor. Yola bakan kuzeydoğu cephesi ise giriş, otopark ve servis cephesi olarak daha kapalı tutuldu. Tüm teknik çizimleri 3B modelden kesit alarak ürettim.'
      ],
      tags: ['Japon ahşap mimarisi', 'Kumimono', 'GL24h / CLT', 'Eğimli arazi', 'Japon bahçesi'],
      model: 'models/primeofis.glb',
      stoneModel: 'models/primeofis-tas.glb',   // ana sayfadaki taş için hafif sürüm
      schematic: 'models/primeofis-sema.glb',   // ana sayfada taş yerine bu şematik model döner
      generator: 'courtyard',
      images: [
        PI + '01_kus_bakisi.jpg', PI + '02_sokak_cephesi.jpg', PI + '03_ana_giris.jpg', PI + '04_bahce_cephesi.jpg',
        PI + '05_engawa.jpg', PI + '06_ofis_ic_mekan.jpg', PI + '07_maket_atolyesi.jpg', PI + '08_odul_salonu_sergi.jpg',
        PI + '09_gece_ana_giris.jpg', PI + '10_gece_sokak_cephesi.jpg', PI + '11_gece_arka_bahce_cephesi.jpg', PI + '12_gece_bakilan_aci.jpg',
        PI + '21_resepsiyon.jpg', PI + '23_ofis_ici.jpg', PI + '13_toplanti_odasi_1.jpg', PI + '14_toplanti_odasi_2.jpg',
        PI + '17_yonetici_odasi.jpg', PI + '15_koridor_maket_galerisi.jpg', PI + '22_maket_koridoru.jpg', PI + '16_maket_atolyesi.jpg',
        PI + '19_malzeme_kutuphanesi.jpg', PI + '18_oturma_mutfak.jpg', PI + '24_balkon.jpg', PI + '20_yan_bahce_merdiveni.jpg',
        PI + '25_japon_bahcesi.jpg'
      ],
      drawings: {
        plans: [
          { title: 'Vaziyet Planı', src: PO + 'pafta-01.jpg', note: '1/250 · 1/5000 · Pafta 01', en: { title: 'Site Plan', note: '1/250 · 1/5000 · Sheet 01' } },
          { title: 'Zemin Kat Planı', src: PO + 'pafta-02.jpg', note: '1/50 · Pafta 02', en: { title: 'Ground Floor Plan', note: '1/50 · Sheet 02' } },
          { title: '1. Kat Planı', src: PO + 'pafta-03.jpg', note: '1/50 · Pafta 03', en: { title: 'First Floor Plan', note: '1/50 · Sheet 03' } },
          { title: '2. Kat Planı', src: PO + 'pafta-04.jpg', note: '1/50 · Pafta 04', en: { title: 'Second Floor Plan', note: '1/50 · Sheet 04' } }
        ],
        sections: [
          { title: 'Kesit A-A', src: PO + 'pafta-05.jpg', note: '1/50 · Pafta 05', en: { title: 'Section A-A', note: '1/50 · Sheet 05' } },
          { title: 'Kesit B-B', src: PO + 'pafta-06.jpg', note: '1/50 · Pafta 06', en: { title: 'Section B-B', note: '1/50 · Sheet 06' } }
        ],
        elevations: [
          { title: 'Güney Cephesi', src: PO + 'pafta-07.jpg', note: '1/50 · Pafta 07', en: { title: 'South Elevation', note: '1/50 · Sheet 07' } },
          { title: 'Kuzey Cephesi', src: PO + 'pafta-08.jpg', note: '1/50 · Pafta 08', en: { title: 'North Elevation', note: '1/50 · Sheet 08' } },
          { title: 'Doğu Cephesi', src: PO + 'pafta-09.jpg', note: '1/50 · Pafta 09', en: { title: 'East Elevation', note: '1/50 · Sheet 09' } },
          { title: 'Batı Cephesi', src: PO + 'pafta-10.jpg', note: '1/50 · Pafta 10', en: { title: 'West Elevation', note: '1/50 · Sheet 10' } }
        ],
        details: [
          { title: 'Sistem Detayları D1–D4', src: PO + 'detay-01.jpg', note: '1/10 · 1/5', en: { title: 'System Details D1–D4', note: '1/10 · 1/5' } },
          { title: 'Çatı Detayları D5–D6', src: PO + 'detay-02.jpg', note: '1/20 · 1/100', en: { title: 'Roof Details D5–D6', note: '1/20 · 1/100' } },
          { title: 'D7 Saçak Detayı', src: PO + 'd7-01.jpg', en: { title: 'D7 Eave Detail' } },
          { title: 'Dış Mekân Görselleri', src: PO + 'pafta-11.jpg', note: 'Pafta 11', en: { title: 'Exterior Views', note: 'Sheet 11' } },
          { title: 'İç Mekân Görselleri', src: PO + 'pafta-12.jpg', note: 'Pafta 12', en: { title: 'Interior Views', note: 'Sheet 12' } }
        ]
      },
      drawingsPdf: PO + 'PrimeOfis_Mimari_Proje.pdf'
    },
    {
      id: 'longevity',
      title: 'Longevity Yaşam Merkezi',
      type: 'Sağlıklı Yaşam Kampüsü',
      year: '2026',
      location: 'Kumbağ, Süleymanpaşa · Tekirdağ',
      area: '~34.610 m² proje alanı · ~4.181 m² yapı taban alanı · 23 yapı',
      status: 'Mimari Tasarım VII · Vize 2. Teslim',
      role: 'Bireysel Proje',
      description: [
        'Kumbağ\'da Marmara kıyısında, yol ile kumsal arasındaki eğimli bir arazide tasarladığım sağlıklı yaşam merkezi. Kurgu, ziyaretçinin izlediği bir rotaya dayanıyor: ölç, öğren, uygula, dinlen, doğayla temas et ve yeniden değerlendir.',
        'Program tek bir büyük bina yerine Japon köşk mantığıyla parçalara ayrıldı: Ryokan ana köşkü ve üç konaklama binasından oluşan 35 odalı konaklama köyü, Karşılama Köşkü, kafe, Sofra Evi, Öğrenme ve Toplum Evi, Şifa Evi, saunalı deniz kompleksi ve dört deniz bungalovu. Yapılar kırma çatılı, engawalı, en fazla iki katlı ve 9,50 m yükseklik sınırının altında.',
        'Arazi İnönü Caddesi\'ndeki mon kapısından başlayıp arasta yolu ve Çınar Meydanı üzerinden denize iniyor. Bahçeler, yürüyüş halkası, iskeleler ve konaklamanın altındaki yaklaşık 155 araçlık bodrum otopark yerleşimi birbirine bağlıyor. Proje vaziyet planları, kot ve acil çıkış planı, kat planları, kesit ve görünüşler, siluetler ve 1/1000 oluklu mukavva arazi maketiyle anlatılıyor.'
      ],
      tags: ['Sağlıklı yaşam', 'Kampüs yerleşimi', 'Japon köşk mimarisi', 'Kıyı peyzajı', 'Eğimli arazi', 'Arazi maketi'],
      en: {
        title: 'Longevity Living Center',
        type: 'Healthy Living Campus',
        location: 'Kumbağ, Süleymanpaşa · Tekirdağ',
        area: '~34,610 m² site · ~4,181 m² building footprint · 23 buildings',
        status: 'Architectural Design VII · Midterm Submission 2',
        role: 'Individual Project',
        description: [
          'A healthy living center on a sloping site between the road and the beach on the Marmara coast in Kumbağ. The scheme follows the route a visitor takes: measure, learn, practise, rest, connect with nature and re-evaluate.',
          'Instead of one large building, the program is split into pavilions in the manner of Japanese kiosks: a 35-room lodging village of a ryokan main pavilion and three guest houses, a Welcome Pavilion, a café, a Dining House, a Learning and Community House, a Healing House, a sea complex with saunas and four sea bungalows. The buildings have hipped roofs and engawa verandas, are at most two storeys and stay below the 9.50 m height limit.',
          'The site starts at the mon gate on İnönü Street and descends to the sea via a market street and the Plane Tree Square. Gardens, a walking loop, piers and a basement car park for about 155 cars under the lodging tie the layout together. The project is presented with site plans, a level and emergency exit plan, floor plans, sections and elevations, silhouettes and a 1/1000 corrugated cardboard site model.'
        ],
        tags: ['Healthy living', 'Campus layout', 'Japanese pavilion architecture', 'Coastal landscape', 'Sloped site', 'Site model']
      },
      model: 'models/longevity.glb',
      schematic: 'models/longevity-karton.glb', // 1/1000 karton maket: ana sayfada döner, panelde detaysız model
      images: [
        'kam_01_kus_bakisi', 'kam_c1_konaklama_cephe', 'kam_c2_sofra_evi_cephe', 'kam_c3_deniz_kompleksi', 'kam_02_mon_kapisi',
        'kam_03_mon_arkadan_meydan', 'kam_04_cinar_meydani', 'kam_05_meydan_kus', 'kam_06_asma_gecidi', 'kam_07_koi_havuzu',
        'kam_07b_bonsai_bahcesi', 'kam_08_aycicegi_labirenti', 'kam_09_harman_tarla', 'kam_10_sonbahar_bahcesi', 'kam_11_sonbahar_ortasi',
        'maket_1_genel', 'maket_2_cadde', 'maket_3_meydan', 'maket_4_deniz'
      ].map((ad) => LI + ad + '.jpg').concat([LD + 'k00-konsept.jpg', LD + 'analizler.jpg', LD + 'm01-maket.jpg']),
      drawings: {
        plans: [
          { title: 'Vaziyet Planı: Ulaşım ve Yakın Çevre', src: LD + 'v01.jpg', note: '1/1000 · Pafta V-01', en: { title: 'Site Plan: Access and Surroundings', note: '1/1000 · Sheet V-01' } },
          { title: 'Vaziyet Planı: Yerleşim ve Siluetler', src: LD + 'v02.jpg', note: '1/500 · Pafta V-02', en: { title: 'Site Plan: Layout and Silhouettes', note: '1/500 · Sheet V-02' } },
          { title: 'Kot Planı: Zemin Katlar ve Acil Çıkışlar', src: LD + 'v06-kot.jpg', note: '1/500 · Pafta V-06', en: { title: 'Level Plan: Ground Floors and Emergency Exits', note: '1/500 · Sheet V-06' } }
        ].concat([            // Pafta 05: her yapi icin kat plani, kesit ve gorunusler (sira = PDF sayfa sirasi)
          ['1.1 Konaklama Binası K1 (K2, K3 aynı plan)', '1.1 Guest House K1 (K2, K3 same plan)'],
          ['1.0 Ryokan Ana Köşk', '1.0 Ryokan Main Pavilion'],
          ['2 Karşılama Köşkü', '2 Welcome Pavilion'],
          ['3 Kafe (Chaya)', '3 Café (Chaya)'],
          ['4 Sofra Evi', '4 Dining House'],
          ['11.1 Deniz Kompleksi: Soyunma ve Duş', '11.1 Sea Complex: Changing and Showers'],
          ['11.2 Deniz Kompleksi: Fin Saunası', '11.2 Sea Complex: Finnish Sauna'],
          ['11.3 Deniz Kompleksi: Ilık Sauna', '11.3 Sea Complex: Warm Sauna'],
          ['11.4 Deniz Kompleksi: Dinlenme Köşkü', '11.4 Sea Complex: Rest Pavilion'],
          ['11.5 Deniz Kompleksi: Çay ve Seyir', '11.5 Sea Complex: Tea and Viewing Pavilion'],
          ['12.1 Deniz Bungalovu (4 adet aynı plan)', '12.1 Sea Bungalow (4 of the same plan)'],
          ['5 Öğrenme ve Toplum Evi', '5 Learning and Community House'],
          ['5A Ortak Derslik, Atölye ve Dojo', '5A Classroom, Workshop and Dojo'],
          ['6 Şifa Evi: Sağlık Birimi', '6 Healing House: Health Unit'],
          ['7 Arasta Kolonadı', '7 Market Colonnade (Arasta)'],
          ['8 Mon Kapısı', '8 Mon Gate'],
          ['D1 Durak Köşkü (D1, D3 aynı)', 'D1 Shuttle Stop Pavilion (D1, D3 same)']
        ].map(([tr, en], i) => {
          const n = String(i + 1).padStart(2, '0');
          return { title: tr, src: LD + '05-' + n + '.jpg', note: '1/200 · Pafta 05-' + n + ' · plan, kesit, görünüş',
                   en: { title: en, note: '1/200 · Sheet 05-' + n + ' · plan, section, elevations' } };
        })),
        sections: [
          { title: 'Arazi Kesitleri A-A, D-D', src: LD + '03-1.jpg', note: '1/100 · Pafta 03', en: { title: 'Site Sections A-A, D-D', note: '1/100 · Sheet 03' } },
          { title: 'Arazi Kesiti B-B', src: LD + '03-2.jpg', note: '1/100 · Pafta 03', en: { title: 'Site Section B-B', note: '1/100 · Sheet 03' } },
          { title: 'Arazi Kesiti C-C', src: LD + '03-3.jpg', note: '1/100 · Pafta 03', en: { title: 'Site Section C-C', note: '1/100 · Sheet 03' } }
        ],
        elevations: [
          { title: 'Doğu Silueti (Denizden)', src: LD + '04-1.jpg', note: '1/100 · Pafta 04', en: { title: 'East Silhouette (from the Sea)', note: '1/100 · Sheet 04' } },
          { title: 'Batı Silueti (İnönü Cd.)', src: LD + '04-2.jpg', note: '1/100 · Pafta 04', en: { title: 'West Silhouette (İnönü St.)', note: '1/100 · Sheet 04' } }
        ],
        details: []
      },
      drawingsPdf: LD + 'Longevity_Kumbag_Paftalar.pdf'
    },
    {
      id: 'modulus',
      title: 'Modulus',
      type: 'Çok Katlı Ofis Binası',
      year: '2025',
      location: 'Fatih Sultan Mehmet Bulvarı · Şehit Serkan Tuban Caddesi',
      area: 'Bodrum + zemin + 5 kat · +21,45 m',
      status: 'Mimari Tasarım 5 · Stüdyo Projesi',
      role: 'Grup Projesi · Zeynep Aybüke Kurt, Melike Salman, Özgür Kara',
      description: [
        'Mimari Tasarım 5 stüdyosunda (Prof. Dr. Meltem Özçakı grubu) üç kişilik ekip olarak tasarladığımız, haç planlı bir ofis binası. Kat kütleleri birbirinin üzerinde kayarak dışa taşıyor ve gölgeli giriş alanları ile pilotili boşluklar oluşturuyor.',
        'Yaya girişi güneydeki Fatih Sultan Mehmet Bulvarı\'ndan; otopark ve mal kabul girişi doğudaki Şehit Serkan Tuban Caddesi\'nden. Zemin katta çok amaçlı salon ve kulis, yemekhane ve mutfak, satış alanı, danışma ve güvenlik yer alıyor.',
        'Üst katlarda AR-GE, hukuk, basın-medya, lojistik, insan kaynakları, finans, bilgi işlem ve halkla ilişkiler ofisleri, laboratuvarlar ve toplantı odaları var. 5. kat yönetim kurulu toplantı odası ve müdür yardımcılığı ofislerine ayrıldı. Bodrumda sığınak, jeneratör, su ve yağmur suyu depoları ile arşiv bulunuyor.'
      ],
      tags: ['Ofis', 'Haç plan', 'Kayan kütleler', 'Pilotiler', 'Grup projesi'],
      en: {
        title: 'Modulus',
        type: 'Multi-Storey Office Building',
        area: 'Basement + ground + 5 floors · +21.45 m',
        status: 'Architectural Design 5 · Studio Project',
        role: 'Group Project · Zeynep Aybüke Kurt, Melike Salman, Özgür Kara',
        description: [
          'A cross-shaped office building designed as a team of three in the Architectural Design 5 studio (Prof. Dr. Meltem Özçakı\'s group). The floor volumes slide over one another and cantilever outwards, creating shaded entrance areas and spaces on pilotis.',
          'Pedestrians enter from Fatih Sultan Mehmet Boulevard to the south; parking and goods delivery are reached from Şehit Serkan Tuban Street to the east. The ground floor holds a multi-purpose hall with backstage, a dining hall and kitchen, a sales area, reception and security.',
          'The upper floors house R&D, legal, press and media, logistics, human resources, finance, IT and public relations offices, laboratories and meeting rooms. The fifth floor is reserved for the board meeting room and deputy director offices. The basement contains a shelter, generator room, water and rainwater tanks and archives.'
        ],
        tags: ['Office', 'Cross plan', 'Sliding volumes', 'Pilotis', 'Group project']
      },
      model: 'models/mts5.glb',
      schematic: 'models/mts5-sema.glb',
      generator: 'tower',
      images: [1, 2, 3, 4, 5, 6].map((n) => MI + '0' + n + '.jpg'),
      drawings: {
        plans: [
          { title: 'Vaziyet Planı', src: MD + 'pafta-03.jpg', note: '1/1000 · 1/500 · Pafta 3', en: { title: 'Site Plan', note: '1/1000 · 1/500 · Sheet 3' } },
          { title: 'Zemin, 1. ve 2. Kat Planları', src: MD + 'pafta-01.jpg', note: '1/200 · Pafta 1', en: { title: 'Ground, 1st and 2nd Floor Plans', note: '1/200 · Sheet 1' } },
          { title: 'Bodrum, 3., 4. ve 5. Kat Planları', src: MD + 'pafta-02.jpg', note: '1/200 · Pafta 2', en: { title: 'Basement, 3rd, 4th and 5th Floor Plans', note: '1/200 · Sheet 2' } }
        ],
        sections: [
          { title: 'Kesitler A-A, B-B', src: MD + 'pafta-04.jpg', note: '1/200 · Pafta 4', en: { title: 'Sections A-A, B-B', note: '1/200 · Sheet 4' } }
        ],
        elevations: [
          { title: 'Güney, Batı, Kuzey ve Doğu Cepheleri', src: MD + 'pafta-04.jpg', note: '1/200 · Pafta 4', en: { title: 'South, West, North and East Elevations', note: '1/200 · Sheet 4' } }
        ],
        details: []
      },
      drawingsPdf: MD + 'MTS5_Proje_Seti.pdf'
    },
    {
      id: 'oblique-magaza',
      title: 'Oblique Mağaza',
      type: 'Ticari Yapı · Giyim Mağazası',
      year: '2026',
      area: '~416 m² satış alanı · 2 kat',
      status: 'Avan Proje',
      description: [
        'Farklı açılarla döndürülmüş küp, prizma ve piramit kütlelerin birbirine geçmesiyle oluşan iki katlı bir mağaza. Adını da bu eğik (oblique) kütlelerden alıyor. En yüksek noktası +15,90 m.',
        'Ana giriş kuzeydeki meydandan, bronz harfli tabelanın altındaki çift kanatlı kapıdan. Güneyde otopark, yükleme alanı ve depo girişi var. Zemin kat (+1,50) 178 m² satış alanı, 7 kabinli soyunma, kasa ve depodan; 1. kat (+5,50) 238 m² satış alanı, galeri boşluğu, soyunma kabinleri ve WC\'lerden oluşuyor. Katları eğik U merdiven ve asansör bağlıyor.',
        'Cephe siyah dokulu brüt beton. Eğik yüzlere yerleştirilen büyük cam giydirmeler ve üçgen piramit pencere, iç mekana tepeden gün ışığı alıyor.'
      ],
      tags: ['Ticari yapı', 'Eğik kütleler', 'Brüt beton', 'Cam giydirme', 'Mağaza tasarımı'],
      en: {
        title: 'Oblique Store',
        type: 'Commercial Building · Clothing Store',
        area: '~416 m² sales area · 2 floors',
        status: 'Preliminary Design',
        description: [
          'A two-storey store formed by interlocking cubes, prisms and a pyramid rotated at different angles; it takes its name from these oblique volumes. The highest point is at +15.90 m.',
          'The main entrance is from the square to the north, through a double door under the bronze-letter sign. Parking, a loading area and the storage entrance are on the south. The ground floor (+1.50) has a 178 m² sales area, fitting rooms with 7 cabins, a checkout and storage; the first floor (+5.50) has a 238 m² sales area, a gallery void, fitting rooms and WCs. An inclined U-shaped stair and a lift connect the floors.',
          'The facade is black textured fair-faced concrete. Large glazed panels set into the tilted faces and a triangular pyramid window bring daylight into the interior from above.'
        ],
        tags: ['Commercial', 'Oblique volumes', 'Fair-faced concrete', 'Curtain wall', 'Retail design']
      },
      model: 'models/oblique.glb',
      stoneModel: 'models/oblique-tas.glb',
      schematic: 'models/oblique-sema.glb',
      generator: 'courtyard',
      images: [
        OI + '01_kus_bakisi_kd.jpg', OI + '02_kuzey_giris.jpg', OI + '03_kus_bakisi_gb.jpg', OI + '04_guney_otopark.jpg',
        OI + '05_bati.jpg', OI + '06_dogu.jpg', OI + '07_zemin_kat_satis.jpg', OI + '08_ust_kat_galeri.jpg'
      ],
      drawings: {
        plans: [
          { title: 'Zemin Kat Planı', src: OD + 'P1_zemin_kat_plani.png', note: '1/100 · Pafta 1', en: { title: 'Ground Floor Plan', note: '1/100 · Sheet 1' } },
          { title: '1. Kat Planı', src: OD + 'P2_1_kat_plani.png', note: '1/100 · Pafta 2', en: { title: 'First Floor Plan', note: '1/100 · Sheet 2' } }
        ],
        sections: [
          { title: 'Kesitler A–A, B–B', src: OD + 'P3_kesitler.png', note: '1/100 · Pafta 3', en: { title: 'Sections A–A, B–B', note: '1/100 · Sheet 3' } }
        ],
        elevations: [
          { title: 'Kuzey – Güney Görünüşleri', src: OD + 'P4_gorunusler_NS.png', note: '1/100 · Pafta 4', en: { title: 'North – South Elevations', note: '1/100 · Sheet 4' } },
          { title: 'Doğu – Batı Görünüşleri', src: OD + 'P5_gorunusler_EW.png', note: '1/100 · Pafta 5', en: { title: 'East – West Elevations', note: '1/100 · Sheet 5' } }
        ],
        details: []
      },
      drawingsPdf: OD + 'Oblique_Magaza_Proje_Seti.pdf'
    }
  ]
};
