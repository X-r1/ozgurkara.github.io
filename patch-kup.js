/* =====================================================================
   DENEME: "Parçalardan mekân kurmak" (yalnızca index-kup.html kullanır)
   Giriş: buz kayası yerine kontur katmanlarından bir arazi maketi, üstünde Rubik küpü ve maket ağaçları.
     - Açılışta konturlar alttan tek tek yükselir, ağaçlar dikilir, en son küp yerine oturur.
     - Küp en üst düzlükte yavaşça döner, arada katmanları çevrilir; tıklayınca hızlanır.
   Aşağı kaydırdıkça (arazi yerinde kalır):
     1) küp araziden havalanır, aksonometrik açıya oturur ve 27 parçasına ayrılır,
     2) her projeye bir parça ayrılır ve beyaz maket bloğuna döner, diğerleri dağılır,
     3) proje parçaları sağ üstte aşağı iner; her proje bölümünde o parça taşına uçar,
        binanın boyuna uzar ve şematik bina modeline dönüşür.
   Kaydırmayla ileri-geri oynar. patch-rubik.js'in yerine geçer.
   ===================================================================== */
(function () {
const SITE = window.SITE;
if (!SITE) return;
const { THREE, renderer, scene, camera, canvas, hero, loadGLB, fitModel, mulberry32 } = SITE;
const stones = SITE.stones || [];

/* ---------- Yazılar (sahne sabitken sırayla görünür) ---------- */
const CAPTIONS = [
  { at: 0.02, tr: '27 parça', en: '27 pieces' },
  { at: 0.36, tr: 'Dağılır', en: 'Taken apart' },
  { at: 0.66, tr: 'Her parça bir proje', en: 'Every piece, a project' },
];
const css = document.createElement('style');
css.textContent = `
.kup-pin { position: relative; height: 640vh; pointer-events: none; }
.kup-pin .kup-sticky { position: sticky; top: 0; height: 100vh; }
.kup-cap { position: absolute; bottom: 11vh; left: 0; right: 0; text-align: center; font-family: var(--mono, monospace);
  font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: var(--muted, #8a96a3);
  opacity: 0; transform: translateY(10px); transition: opacity .5s, transform .5s; }
.kup-cap.on { opacity: 1; transform: none; }
.hero .scroll-hint { display: none; }
.cv { margin-top: 70vh; }                           /* projelerle CV arasında şalter/karanlık için kaydırma payı */
/* CV derli toplu: isim solda, bilgiler hemen yanında; zemin daha şeffaf (arkadaki masa ve maket görünsün) */
.cv { background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none; border-top: 0; padding-bottom: 45vh; }   /* fenerin ışığı kesintisiz düşsün; altta maketin belireceği boşluk */
@media (min-width: 900px) {
  .cv { display: grid; grid-template-columns: minmax(240px, 26%) 1fr; column-gap: 4vw; align-items: start; padding-top: 80px; }
  .cv-head { flex-direction: column; align-items: flex-start; margin-bottom: 0; position: sticky; top: 90px; }
  .cv-grid > .label, .cv-grid > .body { padding: 16px 0; }
  .cv-grid { grid-template-columns: 140px 1fr; }
  .cv .about { font-size: clamp(16px, 1.35vw, 20px); }
  .row { grid-template-columns: 120px 1fr; padding: 2px 0 8px; }
  .cv > footer { grid-column: 1 / -1; margin-top: 48px; }
}
html { scrollbar-width: none; }                     /* sağdaki kaydırma çubuğu gizli (kaydırma çalışır) */
html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
.kup-cap b { display: block; color: var(--fg, #e8edf1); font-family: var(--sans, inherit); font-weight: 500; letter-spacing: -.02em;
  text-transform: none; font-size: clamp(28px, 4vw, 54px); margin-top: 10px; }
`;
document.head.appendChild(css);
const pin = document.createElement('section');
pin.className = 'kup-pin';
pin.innerHTML = '<div class="kup-sticky">' + CAPTIONS.map(() => '<div class="kup-cap"></div>').join('') + '</div>';
document.querySelector('.hero').after(pin);
const caps = [...pin.querySelectorAll('.kup-cap')];
const setPin = () => { window.SITE_PIN_PX = pin.offsetHeight; };
setPin();
addEventListener('resize', setPin);

/* ---------- Arka plan: yıldızlar yerine çok silik bir grid ---------- */
hero.visible = false;                                   // buz kayası, tel çekirdek ve uçan küreler
scene.children.filter((o) => o.isPoints).forEach((o) => { o.visible = false; });
const grid = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.strokeStyle = 'rgba(255,255,255,0.05)';
  g.lineWidth = 2;
  g.strokeRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(80 / 0.9, 50 / 0.9);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(80, 50),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }));
  m.position.z = -7;
  m.renderOrder = -1;
  scene.add(m);
  return m;
})();

/* ---------- Gölgeler ---------- */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
scene.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.needsUpdate = true; }); });

/* ---------- Sahne: arazi maketi (hero ile aynı yerde, kendi eğimi ve dönüşüyle) ---------- */
const stage = new THREE.Group();
scene.add(stage);
const site = new THREE.Group();                         // arazi + ağaçlar (küp ayrı)
stage.add(site);
const TILT = 0.42;                                       // maketi kameraya doğru eğ: üst yüzler görünsün
const stageSpin = -0.5;                                 // maket kendi etrafında dönmez
const sun = new THREE.DirectionalLight('#fff4e6', 2.0);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -3.4, right: 3.4, top: 3.4, bottom: -3.4, near: 0.5, far: 24 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);

// Kontur katmanları: alttan üste küçülen, iç içe girintili-çıkıntılı ince plakalar
const N = 8, H = 0.07, R0 = 2.35, RTOP = 1.1, YB = -1.0;
const TOP = YB + N * H;                                  // en üst düzlüğün kotu
const radiusAt = (i, a) => {
  const R = R0 - i * (R0 - RTOP) / (N - 1);
  return R * (1 + 0.07 * Math.sin(2 * a + 0.6) + 0.05 * Math.sin(3 * a + 1.9 + i * 0.15) + 0.03 * Math.sin(5 * a + 0.4 + i * 0.3));
};
const centerOf = (i) => new THREE.Vector2(0.045 * i, -0.03 * i);
// Karton maket: bütün katmanlar aynı karton tonunda, kot farkını kenar çizgileri ve gölge okutur
const KRAFT = '#c4a77c', KRAFT_DARK = '#8f744f', KRAFT_LIGHT = '#dccaa6';
const LAYER_COLORS = Array.from({ length: N }, (_, i) => new THREE.Color(i % 2 ? KRAFT : '#bea06f'));
const lineMat = new THREE.LineBasicMaterial({ color: '#3b2c1a', transparent: true, opacity: 0.85 });
const layers = [];
for (let i = 0; i < N; i++) {
  const c = centerOf(i), shape = new THREE.Shape();
  for (let k = 0; k <= 120; k++) {
    const a = (k / 120) * Math.PI * 2, r = radiusAt(i, a);
    const x = c.x + Math.cos(a) * r, y = c.y + Math.sin(a) * r;
    k ? shape.lineTo(x, y) : shape.moveTo(x, y);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: H, bevelEnabled: false, curveSegments: 1 });
  geo.rotateX(-Math.PI / 2);                             // plaka yukarı doğru kalınlaşsın (y ekseni)
  // Ortam ışığını kıs: güneş baskın olsun, küpün gölgesi belirgin düşsün
  const mat = new THREE.MeshStandardMaterial({ color: LAYER_COLORS[i], roughness: 0.95, transparent: true, envMapIntensity: 0.25 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = mesh.receiveShadow = true;
  const g = new THREE.Group();
  g.add(mesh, new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), lineMat.clone()));
  g.userData.y = YB + i * H;
  g.position.y = g.userData.y;
  site.add(g);
  layers.push(g);
}

// Maket ağaçları: tel kafes küre taç + ince çubuk, alt katmanların düzlüklerine dikili
const trees = [];
{
  const rnd = mulberry32(11);
  const crownMat = new THREE.MeshStandardMaterial({ color: KRAFT_LIGHT, roughness: 0.95, transparent: true, opacity: 0.6, depthWrite: false });
  const stickMat = new THREE.MeshStandardMaterial({ color: '#5a4630', roughness: 0.9 });
  const wire = new THREE.LineBasicMaterial({ color: '#3b2c1a', transparent: true, opacity: 0.75 });
  let tries = 0;
  while (trees.length < 12 && tries++ < 400) {
    const i = Math.floor(rnd() * (N - 2)), a = rnd() * Math.PI * 2;
    const rIn = radiusAt(i + 1, a) + 0.05, rOut = radiusAt(i, a) - 0.05;
    if (rOut <= rIn) continue;
    const c = centerOf(i), r = rIn + rnd() * (rOut - rIn);
    // aynı katmanda iç içe girmesin
    const x = c.x + Math.cos(a) * r, z = -(c.y + Math.sin(a) * r);
    if (trees.some((t) => Math.hypot(t.position.x - x, t.position.z - z) < 0.4)) continue;
    const size = 0.09 + rnd() * 0.07, stick = 0.18 + rnd() * 0.12;
    let cg = new THREE.IcosahedronGeometry(size, 1);
    const pos = cg.attributes.position, v = new THREE.Vector3();
    for (let k = 0; k < pos.count; k++) { v.fromBufferAttribute(pos, k).multiplyScalar(0.88 + rnd() * 0.24); pos.setXYZ(k, v.x, v.y, v.z); }
    cg.computeVertexNormals();
    const crown = new THREE.Mesh(cg, crownMat);
    crown.add(new THREE.LineSegments(new THREE.EdgesGeometry(cg, 1), wire));
    crown.position.y = stick + size * 0.8;
    crown.castShadow = true;
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, stick, 6), stickMat);
    st.position.y = stick / 2;
    st.castShadow = true;
    const t = new THREE.Group();
    t.add(st, crown);
    t.position.set(x, YB + (i + 1) * H, z);
    t.userData.order = trees.length;
    site.add(t);
    trees.push(t);
  }
}

/* ---------- Küp ---------- */
const BASE = 0.25, MAX = 6, KICK = 2.2;
let speed = BASE, cubeSpin = 0.4;
const holder = new THREE.Group();
stage.add(holder);
const CUBE = 1.05;
const REST = new THREE.Vector3(0.045 * (N - 1), TOP + CUBE / 2, 0.03 * (N - 1));  // en üst düzlüğün ortası
holder.position.copy(REST);
// Küp de karton: gövde koyu karton, çıkartmalar açık karton; proje blokları açık kartona döner
const BLACK = new THREE.Color(KRAFT_DARK), WHITE = new THREE.Color('#e8dcc4');
const stickerMat = new THREE.MeshStandardMaterial({ color: KRAFT_LIGHT, roughness: 0.9 });
const blackMat = new THREE.MeshStandardMaterial({ color: BLACK, roughness: 0.9 });
const projMat = new THREE.MeshStandardMaterial({ color: BLACK, roughness: 0.9 });

let root = null, cubies = [], projPieces = [], center = new THREE.Vector3(), step = 1, pieceSize = 1, core = null;
let twist = null, nextTwist = 2.5, pinned = false;

// Projeyi temsil edecek parçalar: aksonometrik bakışta görünen köşe ve kenarlardan
const PROJECT_SLOTS = [[1, 1, 1], [-1, 1, 1], [1, 1, -1], [1, -1, 1], [0, 1, 1], [1, 0, 1], [1, 1, 0], [-1, 1, -1], [-1, -1, 1]];

loadGLB('models/rubik.glb').then((m) => {
  root = m;
  const parts = m.children.filter((o) => /^Cubie_/.test(o.name));
  core = m.children.find((o) => /Core/.test(o.name)) || null;
  parts.forEach((o) => center.add(o.position));
  center.divideScalar(parts.length || 1);
  step = Math.max(...parts.map((o) => Math.max(Math.abs(o.position.x - center.x), Math.abs(o.position.y - center.y), Math.abs(o.position.z - center.z)))) || 1;
  const bodyOf = (o) => (o.isMesh ? o : o.children.find((c) => c.isMesh && !/Sticker/.test(c.name)));
  const g = bodyOf(parts[0]).geometry;
  g.computeBoundingBox();
  pieceSize = g.boundingBox.getSize(new THREE.Vector3()).x;
  // 27. parça: merkezdeki mekanizmanın yerine aynı boyda bir blok
  const mid = new THREE.Mesh(g, blackMat);
  mid.name = 'Cubie_0_0_0';
  mid.position.copy(center);
  m.add(mid);
  parts.push(mid);
  cubies = parts.map((o) => ({
    o, body: bodyOf(o), at: o.position.clone().sub(center).divideScalar(step).round(),
    stickers: o.children.filter((c) => c !== bodyOf(o)),
    q0: new THREE.Quaternion(), project: -1, spinAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
  }));
  cubies.forEach((c) => { c.body.material = blackMat; c.stickers.forEach((st) => st.traverse((o) => { if (o.isMesh) o.material = stickerMat; })); });
  m.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  const n = Math.min(stones.length, 27);
  for (let k = 0; k < n; k++) {
    const slot = PROJECT_SLOTS[k];
    let c = slot ? cubies.find((c) => c.project < 0 && c.at.equals(new THREE.Vector3(...slot))) : null;
    c = c || cubies.find((c) => c.project < 0);
    c.project = k;
    c.body.material = projMat;
    projPieces.push(c);
  }
  holder.add(fitModel(m, CUBE, CUBE, true));
  introStart = performance.now();
  SITE.kup = { introT: () => (performance.now() - introStart) / 1000, trees: trees.length };
}).catch((err) => console.warn('Rubik küpü yüklenemedi:', err));

/* ---------- Açılış: konturlar yükselir, ağaçlar dikilir, küp oturur ---------- */
let introStart = 0;
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeBack = (x) => { const s = 1.4; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const LAYER_DELAY = 0.13, LAYER_DUR = 0.7;
const TREES_AT = N * LAYER_DELAY + 0.2, CUBE_AT = TREES_AT + 0.45, CUBE_DUR = 0.9;
const INTRO_END = CUBE_AT + CUBE_DUR;
// Döngüde (sayfa sonundan başa dönünce): kamera araziye yakın başlar, katmanlar gelir,
// sonra kamera geri çekilir ve küp en son, geri çekilme biterken iner.
const ZOOM_OUT_AT = TREES_AT + 0.5, ZOOM_OUT_DUR = 1.0;
// Döngü (sayfa sonundan başa): en alt katman baştan yerinde, kamera onun kenarına çok yakın.
// Kamera arazinin üstünde kenardan merkeze ilerler, katmanlar yol boyunca yükselir, ağaçlar dikilir,
// küp iner; en son kamera geri çekilip başlangıç görüntüsüne döner.
const L_LAYERS_END = (N - 2) * LAYER_DELAY + LAYER_DUR, L_TREES_AT = L_LAYERS_END - 0.35;
const LOOP_CUBE_AT = L_LAYERS_END + 0.25, LOOP_CUBE_DUR = 1.0, LOOP_DROP = 3.2;
const L_ZOOM_AT = LOOP_CUBE_AT + LOOP_CUBE_DUR + 0.1, L_ZOOM_DUR = 1.2;
const LOOP_END = L_ZOOM_AT + L_ZOOM_DUR;
let loopMode = false, zoomK = 0, travelK = 0, cubeK = 0;   // travelK: kenardan merkeze ilerleme, cubeK: küp inişi
// Açılış bitmeden kaydırmaya başlanırsa animasyon sona atlar
function intro(t) {
  const cubeAt = loopMode ? LOOP_CUBE_AT : CUBE_AT;
  const treesAt = loopMode ? L_TREES_AT : TREES_AT;
  zoomK = loopMode ? 1 - smooth(seg(t, L_ZOOM_AT, LOOP_END)) : 0;
  travelK = smooth(seg(t, 0, L_LAYERS_END + 0.15));
  cubeK = smooth(seg(t, LOOP_CUBE_AT - 0.3, LOOP_CUBE_AT + LOOP_CUBE_DUR));
  layers.forEach((g, i) => {
    // Döngüde en alt katman hep yerinde (sayfa sonunda CV'nin altlığı), diğerleri sırayla gelir
    const e = !loopMode ? clamp01((t - i * LAYER_DELAY) / LAYER_DUR)
      : i === 0 ? 1 : clamp01((t - (i - 1) * LAYER_DELAY) / LAYER_DUR);
    g.position.y = g.userData.y - (1 - easeOut(e)) * 1.2;
    g.children[0].material.opacity = Math.min(1, e * 4);           // hızlıca opaklaşsın (yarı saydam gri görünmesin)
    g.children[1].material.opacity = 0.85 * e;
    g.visible = e > 0;
  });
  trees.forEach((tr) => {
    const e = clamp01((t - treesAt - tr.userData.order * 0.05) / 0.45);
    tr.scale.setScalar(Math.max(easeBack(e), 1e-4));
    tr.visible = e > 0;
  });
  const e = clamp01((t - cubeAt) / (loopMode ? LOOP_CUBE_DUR : CUBE_DUR));
  holder.visible = e > 0;
  holder.position.copy(REST).add(new THREE.Vector3(0, (loopMode ? (1 - smooth(e)) * LOOP_DROP : (1 - easeOut(e)) * 2.4), 0));
  showLoading(t);
  return t >= (loopMode ? LOOP_END : INTRO_END);
}
// Kamera: ana döngü kamerayı yerleştirdikten sonra, çizimden hemen önce çağrılır
const camFocus = new THREE.Vector3(), camLook = new THREE.Vector3();
// Yükleme ekranı: yakın planda maket ekranın ortasında, yazılar silinir, altta yüzde sayacı
const loadCss = document.createElement('style');
loadCss.textContent = `
.kup-load { position: fixed; left: 50%; bottom: 4vh; transform: translateX(-50%); z-index: 5; pointer-events: none;
  display: flex; flex-direction: column; align-items: center; gap: 10px; opacity: 0;
  font-family: var(--mono, monospace); font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: var(--muted, #8a96a3); }
.kup-load i { display: block; width: 180px; height: 1px; background: currentColor; opacity: .3; position: relative; }
.kup-load b { position: absolute; left: 0; top: 0; height: 1px; background: #dccaa6; width: 0; }
`;
document.head.appendChild(loadCss);
const loadEl = document.createElement('div');
loadEl.className = 'kup-load';
loadEl.style.display = 'none';                   // yükleme yazısı gösterilmiyor (sayaç kodu duruyor)
loadEl.innerHTML = '<span></span><i><b></b></i>';
document.body.appendChild(loadEl);
const heroText = document.querySelector('.hero');
function showLoading(t) {
  const pct = Math.round(clamp01(t / ZOOM_OUT_AT) * 100);
  const en = document.documentElement.lang === 'en';
  loadEl.style.opacity = zoomK.toFixed(3);
  loadEl.querySelector('span').textContent = `${en ? 'Building' : 'Kuruluyor'} ${pct}%`;
  loadEl.querySelector('b').style.width = pct + '%';
  heroText.style.opacity = (1 - zoomK).toFixed(3);
}
// Patlama bölümünde kamera: küp kalkarken ona yaklaşır (pinZoom), dağılırken geri çekilir (pinPull),
// sıra kurulurken normal açısına döner (parçaların ekran dizilimi normal kameraya göre hesaplı)
let pinZoom = 0, pinPull = 0;
const pinFocus = new THREE.Vector3();
function pinCamera(cam, camY) {
  holder.getWorldPosition(pinFocus);
  camLook.set(0, camY, 0).lerp(pinFocus, pinZoom * 0.85);
  cam.position.lerp(pinFocus.clone().add(new THREE.Vector3(0, 0.25, 3.4)), pinZoom * 0.7);
  cam.position.z += pinPull * 2.4;
  cam.lookAt(camLook);
}
// Döngü kamerası: en alt katmanın kameraya bakan kenarından (travel 0) en üst düzlüğün ortasına (travel 1)
const rimL = new THREE.Vector3(), midL = new THREE.Vector3(), poseF = new THREE.Vector3();
function loopPose(travel, cube, outPos, outLook) {
  // En alt katmanın kameraya en yakın (dünyada en önde, +z) kenar noktası
  stage.updateMatrixWorld();
  let best = -Infinity;
  for (let k = 0; k < 72; k++) {
    const a = (k / 72) * Math.PI * 2, r = radiusAt(0, a);
    poseF.set(Math.cos(a) * r, YB + H, -Math.sin(a) * r);
    const z = poseF.clone().applyMatrix4(stage.matrixWorld).z;
    if (z > best) { best = z; rimL.copy(poseF); }
  }
  midL.set(REST.x, TOP, REST.z);
  poseF.copy(rimL).lerp(midL, travel);
  outLook.copy(poseF).lerp(midL, 0.5);            // ileriye (merkeze) bakar: yürürken önde yükselen katmanlar görünür
  stage.localToWorld(poseF);
  stage.localToWorld(outLook);
  // İlerledikçe kamera alçalıp yaklaşır, maketin yüzeyine paralel bakar (üstünde yürür gibi);
  // küp inerken yeniden yükselip biraz açılır
  const low = smooth(seg(travel, 0, 0.4)) * (1 - cube);   // yolun ilk kısmında paralele iner
  const d = (3.0 - 0.5 * low + 0.9 * cube) * Math.max(stage.scale.x, 0.5);   // daha az yakın: katmanların gelişi görünsün
  outPos.copy(poseF).add(new THREE.Vector3(0, (0.34 - 0.22 * low) * d, (0.9 + 0.08 * low) * d));   // göz hizası: arazide yürür gibi
}
const posePos = new THREE.Vector3(), poseLook = new THREE.Vector3();
window.SITE_CAM_FN = (cam, camY) => {
  updateBase(cam);
  if (zoomK <= 0) { if (pinZoom > 0 || pinPull > 0) pinCamera(cam, camY); return; }
  loopPose(travelK, cubeK, posePos, poseLook);
  cam.position.lerp(posePos, zoomK);
  camLook.set(0, camY, 0).lerp(poseLook, zoomK);
  cam.lookAt(camLook);
};

// CV'nin arka planı: masanın üstünde arazi maketinin bir kopyası. El feneri onu bulur; sayfanın sonuna
// inildikçe kamera maketin en alt katmanının kenarına yaklaşır (döngü başındaki yakın planın tam aynısı),
// üst katmanlar, ağaçlar ve masa silinir; geçiş başlayınca gerçek maket aynı görüntüde devralır.
const desk = new THREE.Group();
const deskSite = site.clone(true);
deskSite.position.set(0, 0, 0);
deskSite.visible = true;
deskSite.traverse((o) => {
  if (o.material) o.material = o.material.clone();
  if (o.isMesh) o.castShadow = false;
});
const deskLayers = deskSite.children.filter((o) => o.userData.y !== undefined);
const deskTrees = deskSite.children.filter((o) => o.userData.order !== undefined);
deskLayers.forEach((g) => {
  g.position.y = g.userData.y;
  g.visible = true;
  g.children[0].material.opacity = 1;
  g.children[1].material.opacity = 0.85;
});
deskTrees.forEach((t) => { t.scale.setScalar(1); t.visible = true; });
// Masa: koyu ceviz tabla, maketin altında
const tableMat = new THREE.MeshStandardMaterial({ color: '#3d2b1d', roughness: 0.75, metalness: 0.05, transparent: true });
const table = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.16, 5.4), tableMat);
table.position.set(0.3, YB - 0.08 - 0.002, 0.2);
const tableEdge = new THREE.LineSegments(new THREE.EdgesGeometry(table.geometry), new THREE.LineBasicMaterial({ color: '#1c130c', transparent: true, opacity: 0.6 }));
table.add(tableEdge);
desk.add(deskSite, table);
desk.matrixAutoUpdate = false;
desk.visible = false;
scene.add(desk);

const baseCam = new THREE.PerspectiveCamera(), baseM = new THREE.Matrix4();
const deskE = new THREE.Matrix4();
let lightP = 0;                                   // CV bölümündeki ilerleme (updateLights hesaplar)
const sceneCanvas = document.querySelector('#scene');
function updateBase(cam) {
  // Fener vururken masa da maket de görünmez; yalnızca en altta, ışığın çemberinden en alt katman belirir
  const toL = smooth(seg(lightP, 0.82, 1));
  const show = !loopS && introDone && toL > 0.001;
  desk.visible = show;
  // Maket bulanıktan netleşerek belirir (o sırada 3D sahnede yalnızca o var)
  sceneCanvas.style.filter = show && toL < 0.995 ? `blur(${((1 - toL) * 14).toFixed(1)}px)` : '';
  if (!show) return;
  // Döngü başındaki yakın planda maketin kameraya göre konumu
  loopPose(0, 0, posePos, poseLook);
  baseCam.position.copy(posePos);
  baseCam.lookAt(poseLook);
  baseCam.updateMatrixWorld();
  deskE.copy(baseCam.matrixWorld).invert().multiply(stage.matrixWorld);
  cam.updateMatrixWorld();
  desk.matrix.copy(cam.matrixWorld).multiply(deskE);
  desk.matrixWorldNeedsUpdate = true;
  deskLayers.forEach((g, i) => {
    g.visible = i === 0;
    if (i) return;
    g.children[0].material.opacity = toL;
    g.children[1].material.opacity = 0.85 * toL;
  });
  deskTrees.forEach((t) => { t.visible = false; });
  table.visible = false;
}
/* ---------- Projelerden CV'ye: şalter iner, el feneri CV'yi bulur ---------- */
// CV ekrana girerken ışıklar titreyip söner (ekranda hiçbir şey kalmaz). Sonra kameranın arkasından bir
// el feneri yanar: önce CV başlığında dar bir odak, aşağı inildikçe odak dağılır ve bütün CV görünür.
// Fener arada göz kırpar. En altta ışık dairesi en alt kontur katmanının şekline oturur; döngü oradan başlar.
const darkEl = document.createElement('div');
// Karartma 3D sahnenin hemen üstünde, yazıların altında: fener arka planı değil yazıları aydınlatır
darkEl.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;display:none';
document.querySelector('#scene').after(darkEl);
// Yazıların üstüne düşen sıcak ışık (çarpma karışımı: koyu arka planı değiştirmez, yazıları ısıtır)
const warmEl = document.createElement('div');
warmEl.style.cssText = 'position:fixed;inset:0;z-index:59;pointer-events:none;display:none;mix-blend-mode:multiply';
document.body.appendChild(warmEl);
const navEl = document.querySelector('.nav');
const cvEl = document.querySelector('.cv'), cvTitle = cvEl && cvEl.querySelector('h2');
let blinkAt = 0, blinkEnd = 0, blinkDepth = 1, nextBlink = performance.now() + 2000;
function flashFlicker(now) {                      // 1 = tam ışık; arada kısa göz kırpmalar
  if (now > nextBlink) {
    blinkAt = now;
    blinkEnd = now + 70 + Math.random() * 160;
    blinkDepth = 0.55 + Math.random() * 0.45;
    nextBlink = now + 500 + Math.random() * 1400;   // sık sık göz kırpar
  }
  if (now < blinkEnd) {
    const k = (now - blinkAt) / (blinkEnd - blinkAt);
    return 1 - blinkDepth * (k < 0.5 || Math.sin(k * 40) > 0 ? 1 : 0.4);
  }
  return 0.94 + 0.06 * Math.sin(now * 0.013) * Math.sin(now * 0.0071);   // pil zayıf: hafif titreme
}
// En alt katmanın, döngü başındaki yakın plandaki ekran izdüşümü (elips)
const ellV = new THREE.Vector3();
function layerEllipse() {
  loopPose(0, 0, posePos, poseLook);
  baseCam.position.copy(posePos);
  baseCam.lookAt(poseLook);
  baseCam.fov = camera.fov;
  baseCam.aspect = innerWidth / innerHeight;
  baseCam.updateProjectionMatrix();
  baseCam.updateMatrixWorld();
  baseM.makeTranslation(0, layers[0].userData.y, 0).premultiply(stage.matrixWorld);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let k = 0; k < 48; k++) {
    const a = (k / 48) * Math.PI * 2, r = radiusAt(0, a);
    ellV.set(Math.cos(a) * r, H, -Math.sin(a) * r).applyMatrix4(baseM).project(baseCam);
    const x = (ellV.x + 1) / 2 * innerWidth, y = (1 - ellV.y) / 2 * innerHeight;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const big = 6 * Math.max(innerWidth, innerHeight);
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, rx: Math.min(big, (x1 - x0) / 2 * 1.12), ry: Math.min(big, (y1 - y0) / 2 * 1.12) };
}
function lightsAt(P, now) {                       // P: CV bölümündeki ilerleme (0 = CV girmeye başladı, 1 = sayfa sonu)
  const cut = seg(P, 0, 0.2);
  if (P < 0.4) {                                  // 0.2–0.4: zifiri karanlık
    // Şalter: ışıklar birkaç kez titrer, sonra tamamen söner
    const blinkOff = cut > 0 && cut < 1 && Math.floor(cut * 9) % 3 === 1;
    return { inA: cut >= 1 ? 1 : blinkOff ? 0.93 : cut * cut * 0.7, outA: null };
  }
  // Fener: yanarken birkaç kez teklesin
  const onK = seg(P, 0.4, 0.46);                  // CV başlığı ekrana girince fener yanar
  const ignite = onK < 1 && Math.floor(onK * 7) % 2 === 1 ? 0.1 : 1;
  const light = ignite * flashFlicker(now) * smooth(seg(onK, 0, 0.3) + 0.0001);
  const spread = smooth(seg(P, 0.46, 0.82));
  const t0 = cvTitle ? cvTitle.getBoundingClientRect() : { left: innerWidth * 0.2, width: 300, top: innerHeight * 0.4, height: 80 };
  // Odak dağılırken ışık en fazla maket kadar açılır: başlıktan maketin en alt katmanının izdüşümüne doğru büyür
  const M = layerEllipse();
  let cx = t0.left + Math.min(t0.width, 520) / 2, cy = t0.top + t0.height / 2;
  cx += (M.cx - cx) * spread;
  cy += (innerHeight * 0.5 - cy) * spread;
  // Odak dağılınca yazıları kaplar (en fazla maket genişliği kadar, ekranın ortasında); en sonda katmana oturur
  let rx = 100 + (Math.min(M.rx, innerWidth * 0.62) - 100) * spread, ry = 75 + (innerHeight * 0.55 - 75) * spread;
  let soft = 25 + 45 * spread;                    // odak dağıldıkça kenar yumuşar
  let outA = 1 - 0.65 * spread;                   // çemberin dışı loş kalır
  // En altta ışık dairesi en alt katmanın şekline oturur (kenar keskinleşir, dışı kararır)
  const toLayer = smooth(seg(P, 0.82, 1));       // maketin alt katmanı en sonda, alttaki boşlukta belirir
  if (toLayer > 0) {
    cy += (M.cy - cy) * toLayer;
    rx += (M.rx - rx) * toLayer; ry += (M.ry - ry) * toLayer;
    soft += (88 - soft) * toLayer;
    outA += (0.97 - outA) * toLayer;
  }
  // Fener zayıf: çemberin içi de tam aydınlanmaz
  return { inA: 1 - 0.9 * light, outA: Math.max(outA, 1 - 0.9 * light), cx, cy, rx, ry, soft, light, on: onK, spread, toLayer };
}

// Hacimli ışık: kameranın arkasından (ekranın altından) gelen koni, içinde titreşen ışık şaftları (god rays)
// ve hüzmede süzülen toz/foton zerreleri. Şaftlar bulanık bir tuvalde, zerreler net bir tuvalde çizilir.
function makeCanvas(z, blur) {
  const cv = document.createElement('canvas');
  cv.style.cssText = `position:fixed;inset:0;width:100%;height:100%;z-index:${z};pointer-events:none;display:none;mix-blend-mode:screen` + (blur ? `;filter:blur(${blur}px)` : '');
  document.body.appendChild(cv);
  return cv;
}
const raysCv = makeCanvas(61, 7), dustCv = makeCanvas(62, 0);
const SHAFTS = Array.from({ length: 11 }, () => ({ v: Math.random() * 2 - 1, w: 0.03 + Math.random() * 0.08, ph: Math.random() * 6.28, sp: 0.4 + Math.random() * 1.1 }));
const motes = [];
let raysLast = performance.now();
function fitCanvas(cv, scale) {
  const w = Math.round(innerWidth * scale), h = Math.round(innerHeight * scale);
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  return cv.getContext('2d');
}
function drawRays(L, fade) {
  const now = performance.now(), dt = Math.min((now - raysLast) / 1000, 0.05);
  raysLast = now;
  const on = L && L.outA !== null && L.light > 0.01 && fade > 0.001;
  raysCv.style.display = dustCv.style.display = on ? '' : 'none';
  if (!on) { motes.length = 0; return; }
  const I = 0.95 * L.light * fade * (1 - 0.45 * L.spread) * (1 - 0.8 * L.toLayer);   // dağıldıkça hüzme incelir
  // Kaynak: sağ üst, ekranın dışında ve kameraya yakın (arkasında değil): hüzme önde geniş başlar, yazılara doğru daralır
  const sx = innerWidth * 1.12, sy = -innerHeight * 0.22;
  const tx = L.cx, ty = L.cy, rx = Math.min(L.rx, innerWidth * 1.2), ry = Math.min(L.ry, innerHeight * 1.2);
  const bl = Math.hypot(tx - sx, ty - sy) || 1, px = -(ty - sy) / bl, py = (tx - sx) / bl;   // hüzmeye dik yön
  const W0 = Math.min(innerWidth, innerHeight) * 0.5;                                       // kaynaktaki genişlik
  const at = (u, v) => {
    const ax = sx + px * v * W0, ay = sy + py * v * W0;
    return [ax + (tx + v * rx - ax) * u, ay + (ty + v * ry * 0.25 - ay) * u];
  };

  // Şaftlar (yarım çözünürlük, CSS ile bulanık)
  const S = 0.5, g = fitCanvas(raysCv, S);
  g.setTransform(S, 0, 0, S, 0, 0);
  g.clearRect(0, 0, innerWidth, innerHeight);
  g.globalCompositeOperation = 'lighter';
  const cone = g.createLinearGradient(sx, sy, tx, ty);
  cone.addColorStop(0, 'rgba(255,220,160,0)');
  cone.addColorStop(0.55, `rgba(255,220,160,${(0.05 * I).toFixed(3)})`);
  cone.addColorStop(1, `rgba(255,226,175,${(0.11 * I).toFixed(3)})`);
  g.fillStyle = cone;
  g.beginPath(); g.moveTo(...at(0, -1)); g.lineTo(...at(1.05, -1)); g.lineTo(...at(1.05, 1)); g.lineTo(...at(0, 1)); g.closePath(); g.fill();
  SHAFTS.forEach((s) => {
    const a = (0.5 + 0.5 * Math.sin(now * 0.001 * s.sp + s.ph)) * (0.6 + 0.4 * Math.sin(now * 0.0023 * s.sp + s.ph * 2));
    const v = s.v + 0.04 * Math.sin(now * 0.0004 * s.sp + s.ph);
    const grad = g.createLinearGradient(sx, sy, tx, ty);
    grad.addColorStop(0, 'rgba(255,230,185,0)');
    grad.addColorStop(0.7, `rgba(255,230,185,${(0.10 * I * a).toFixed(3)})`);
    grad.addColorStop(1, `rgba(255,235,195,${(0.16 * I * a).toFixed(3)})`);
    g.fillStyle = grad;
    g.beginPath(); g.moveTo(...at(0, v - s.w * 0.5)); g.lineTo(...at(1.08, v - s.w)); g.lineTo(...at(1.08, v + s.w)); g.lineTo(...at(0, v + s.w * 0.5)); g.closePath(); g.fill();
  });

  // Zerreler: hüzme boyunca kameradan uzaklaşan fotonlar (fener yanarken hızlı akın), sonra süzülen toz
  const c = fitCanvas(dustCv, Math.min(devicePixelRatio || 1, 2));
  const D = dustCv.width / innerWidth;
  c.setTransform(D, 0, 0, D, 0, 0);
  c.clearRect(0, 0, innerWidth, innerHeight);
  c.globalCompositeOperation = 'lighter';
  const burst = L.on < 1 ? 1 : 0;                 // fener yanma anı: foton akını
  const rate = (burst ? 260 : 45) * L.light;
  for (let n = rate * dt + Math.random(); n >= 1 && motes.length < 320; n--) {
    const fast = burst || Math.random() < 0.15;
    motes.push({ u: fast ? 0.05 : 0.25 + Math.random() * 0.75, v: (Math.random() * 2 - 1) * 0.95, age: 0,
      life: fast ? 0.6 + Math.random() * 0.6 : 2.5 + Math.random() * 3.5, sp: fast ? 0.9 + Math.random() * 0.9 : 0.02 + Math.random() * 0.05,
      dv: (Math.random() - 0.5) * 0.05, s: 0.6 + Math.random() * 1.4, fast });
  }
  for (let i = motes.length - 1; i >= 0; i--) {
    const m = motes[i];
    m.age += dt;
    const u0 = m.u;
    m.u = Math.min(1.05, m.u + m.sp * dt);
    m.v += m.dv * dt;
    if (m.age > m.life || m.u >= 1.05) { motes.splice(i, 1); continue; }
    const life = Math.sin(Math.PI * m.age / m.life);
    const tw = m.fast ? 1 : 0.55 + 0.45 * Math.sin(now * 0.006 + i);
    const al = Math.min(1, 0.9 * life * tw * I * 2.2);
    if (al < 0.01) continue;
    const [x, y] = at(m.u, m.v), size = m.s * (m.fast ? 2.6 - 1.8 * m.u : 1.2);   // yakında büyük, uzakta küçük
    if (m.fast) {                                  // hızlı fotonlar kısa iz bırakır
      const [x0, y0] = at(u0 - m.sp * 0.03, m.v);
      c.strokeStyle = `rgba(255,236,200,${al.toFixed(3)})`;
      c.lineWidth = size;
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x, y); c.stroke();
    } else {
      c.fillStyle = `rgba(255,232,190,${al.toFixed(3)})`;
      c.beginPath(); c.arc(x, y, size, 0, 6.283); c.fill();
    }
  }
}
function setMask(el, img) { el.style.maskImage = el.style.webkitMaskImage = img; }
// Arka plan (3D) karanlık kalır; yazılar yalnızca fenerin çemberinde görünür (sayfa içeriğine maske).
// Döngüde sayfa sonunun kopyası (hayalet) maskelenir, sayfa değil.
function drawLights(L, fade) {                    // fade: 0..1 (döngüde karartma kalkarken)
  drawRays(L, fade);
  const target = loopS && ghost ? ghost : content;
  const other = target === content ? ghost : content;
  if (other) setMask(other, '');
  if (!L || fade <= 0.001) {
    darkEl.style.display = warmEl.style.display = 'none';
    setMask(target, '');
    navEl.style.opacity = '';
    return;
  }
  darkEl.style.display = '';
  const c = '3,4,6';
  const vis = (a) => `rgba(0,0,0,${(1 - a * fade).toFixed(3)})`;
  if (L.outA === null) {                          // şalter: her şey birlikte kararır
    darkEl.style.background = `rgba(${c},${(L.inA * fade).toFixed(3)})`;
    setMask(target, `linear-gradient(${vis(L.inA)}, ${vis(L.inA)})`);
    warmEl.style.display = 'none';
    navEl.style.opacity = (1 - L.inA * fade).toFixed(3);
    return;
  }
  const e = `ellipse ${L.rx.toFixed(0)}px ${L.ry.toFixed(0)}px at ${L.cx.toFixed(0)}px ${L.cy.toFixed(0)}px`;
  // Arka plan: hep karanlık; yalnızca en sonda ışık çemberinde maketin alt katmanı aydınlanır
  const bgOut = 0.97 * fade, bgIn = (0.97 + (L.inA - 0.97) * L.toLayer) * fade;
  darkEl.style.background =
    `radial-gradient(${e}, rgba(${c},${bgIn.toFixed(3)}) 0%, rgba(${c},${bgIn.toFixed(3)}) ${L.soft.toFixed(0)}%, rgba(${c},${bgOut.toFixed(3)}) 100%)`;
  // Yazılar: maske konumu hedef öğenin kutusuna göre
  const r = target === content ? content.getBoundingClientRect() : { left: 0, top: 0 };
  setMask(target, `radial-gradient(ellipse ${L.rx.toFixed(0)}px ${L.ry.toFixed(0)}px at ${(L.cx - r.left).toFixed(0)}px ${(L.cy - r.top).toFixed(0)}px, ` +
    `${vis(L.inA)} 0%, ${vis(L.inA)} ${L.soft.toFixed(0)}%, ${vis(L.outA)} 100%)`);
  // Sıcak ışık yazıların üstünde
  const k = 0.55 * L.light * fade;
  warmEl.style.display = '';
  warmEl.style.background = `radial-gradient(${e}, rgb(255,${(255 - 34 * k).toFixed(0)},${(255 - 80 * k).toFixed(0)}) 0%, rgb(255,255,255) ${Math.min(100, L.soft + 15).toFixed(0)}%)`;
  navEl.style.opacity = Math.max(0.3, 1 - L.outA * fade).toFixed(3);
}
// Arka plan: her yerde dumanlı mavi-gri. Zemin rengi + modellerin arkasında yavaşça süzülen yumuşak duman bulutları
// (kamerayı izler, hep görünür).
const SMOKE_BG = '#2c3640';
scene.background = new THREE.Color(SMOKE_BG);
if (scene.fog) scene.fog.color.set(SMOKE_BG);
document.documentElement.style.setProperty('--bg', SMOKE_BG);
document.body.style.background = SMOKE_BG;
grid.visible = false;
const smokeTex = (() => {                         // yumuşak, düzensiz kenarlı bir duman bulutu (alfa dokusu)
  const S = 256, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d'), rnd = mulberry32(17);
  for (let i = 0; i < 70; i++) {                  // üst üste binen yumuşak lekeler: bulut gövdesi
    const a = rnd() * 6.283, r = Math.sqrt(rnd()) * S * 0.28;
    const x = S / 2 + Math.cos(a) * r, y = S / 2 + Math.sin(a) * r * 0.7, rr = S * (0.06 + rnd() * 0.16);
    const gr = g.createRadialGradient(x, y, 0, x, y, rr);
    gr.addColorStop(0, `rgba(255,255,255,${(0.05 + rnd() * 0.08).toFixed(3)})`);
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
const smokes = Array.from({ length: 9 }, (_, i) => {
  const rnd = mulberry32(100 + i);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
    map: smokeTex, color: '#a9bccd', transparent: true, opacity: 0.22 + rnd() * 0.18, depthWrite: false, fog: false }));
  m.renderOrder = -1;
  m.userData = { x: (rnd() - 0.5) * 22, y: (rnd() - 0.5) * 9, z: -5 - rnd() * 4, s: 7 + rnd() * 9,
    vx: 0.08 + rnd() * 0.18, rot: rnd() * 6.28, vr: (rnd() - 0.5) * 0.04, ph: rnd() * 6.28 };
  scene.add(m);
  return m;
});
function updateSmoke(dt) {
  const t = performance.now() / 1000;
  smokes.forEach((m) => {
    const u = m.userData;
    u.x += u.vx * dt;
    if (u.x > 13) u.x -= 26;                      // sağdan çıkan duman soldan yeniden girer
    u.rot += u.vr * dt;
    m.position.set(camera.position.x * 0.6 + u.x, camera.position.y + u.y + Math.sin(t * 0.15 + u.ph) * 0.6, u.z);
    m.rotation.z = u.rot;
    m.scale.setScalar(u.s * (1 + 0.06 * Math.sin(t * 0.2 + u.ph)));
  });
}

function updateLights() {
  if (!cvEl) return;
  const now = performance.now();
  if (loopS) {                                    // döngü başında sayfa sonundaki karartma, yazılar silinirken kalkar
    drawLights(lightsAt(1, now), 1 - clamp01(loopS.cur / SLIDE));
    return;
  }
  // Başlangıç: son proje ekranın üst yarısına çıkınca (CV'nin 70vh boşluğunun başı ekranın ortasında)
  const start = cvEl.getBoundingClientRect().top + scrollY - innerHeight * 1.3;
  const P = (scrollY - start) / Math.max(1, pageEnd() - start);
  lightP = clamp01(P);
  const L = P > 0 ? lightsAt(Math.min(P, 1), now) : null;
  drawLights(L, 1);
}

/* ---------- Katman çevirme (boştayken) ---------- */
const AXES = ['x', 'y', 'z'];
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
function startTwist() {
  const axis = AXES[(Math.random() * 3) | 0];
  const layer = [-1, 0, 1][(Math.random() * 3) | 0];
  const dir = Math.random() < 0.5 ? 1 : -1;
  const members = cubies.filter((c) => Math.abs(c.at[axis] - layer) < 0.35);
  const pivot = new THREE.Object3D();
  pivot.position.copy(center);
  root.add(pivot);
  pivot.updateMatrixWorld(true);
  members.forEach((c) => pivot.attach(c.o));
  twist = { dir, members, pivot, t: 0, vec: new THREE.Vector3(+(axis === 'x'), +(axis === 'y'), +(axis === 'z')) };
}
function endTwist() {
  const { pivot, members, vec, dir } = twist;
  pivot.quaternion.setFromAxisAngle(vec, dir * Math.PI / 2);
  pivot.updateMatrixWorld(true);
  const rm = new THREE.Matrix4();
  members.forEach((c) => {
    root.attach(c.o);
    c.at.applyAxisAngle(vec, dir * Math.PI / 2).round();
    c.o.position.copy(c.at).multiplyScalar(step).add(center);
    rm.makeRotationFromQuaternion(c.o.quaternion);
    const e = rm.elements;
    for (const k of [0, 1, 2, 4, 5, 6, 8, 9, 10]) e[k] = Math.round(e[k]);
    c.o.quaternion.setFromRotationMatrix(rm);
  });
  root.remove(pivot);
  twist = null;
}

/* ---------- Tıklama: maketin (arazi ya da küp) üstüne basınca küp hızlanır ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
const overStage = (e) => {
  if (window.SITE_PIN_PX && scrollY > 0) return false;
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  return ray.intersectObject(stage, true).some((h) => h.object.isMesh);
};
canvas.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' && overStage(e)) canvas.style.cursor = 'pointer'; });
canvas.addEventListener('click', (e) => { if (overStage(e)) { speed = Math.min(MAX, speed + KICK); nextTwist = Math.min(nextTwist, 0.05); } });

/* ---------- Yardımcılar ---------- */
function clamp01(x) { return Math.min(1, Math.max(0, x)); }
const seg = (p, a, b) => clamp01((p - a) / (b - a));
const smooth = (x) => x * x * (3 - 2 * x);
const V = () => new THREE.Vector3(), Q = () => new THREE.Quaternion();
const Y = new THREE.Vector3(0, 1, 0);
const rootWQ = Q(), rootWQi = Q(), tmpQ = Q();
let rootWS = 1;
const EXPLODE = 1.25;
const explodedLocal = (c, f) => c.at.clone().multiplyScalar(step * (1 + f)).add(center);
const viewSize = () => {
  const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
  return { h, w: h * camera.aspect };
};
function refreshRoot() {
  root.updateWorldMatrix(true, false);
  root.getWorldQuaternion(rootWQ);
  rootWQi.copy(rootWQ).invert();
  rootWS = root.getWorldScale(V()).x;
}
function placeWorld(c, pos, quat, size) {
  c.o.position.copy(root.worldToLocal(pos.clone()));
  c.o.quaternion.copy(rootWQi).multiply(quat);
  c.o.scale.copy(size).divideScalar(pieceSize * rootWS);
}
const worldOfLocal = (local) => root.localToWorld(local.clone());
const rowPosOf = (k, n, w) => V().set((k - (n - 1) / 2) * Math.min(1.1, (w * 0.7) / Math.max(n, 1)), 0.25, 0.6);

/* ---------- Taşlar: şematik modelin ölçüsü (parçanın uzayacağı kutu) ---------- */
const stoneBox = [];
function ensureStoneBox(k) {
  const s = stones[k];
  if (stoneBox[k] || !s || !s.inner.children.length) return stoneBox[k];
  s.inner.scale.setScalar(1);
  s.group.updateWorldMatrix(true, true);
  const inv = s.inner.matrixWorld.clone().invert(), box = new THREE.Box3(), b = new THREE.Box3(), mtx = new THREE.Matrix4();
  s.inner.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    b.copy(o.geometry.boundingBox).applyMatrix4(mtx.multiplyMatrices(inv, o.matrixWorld));
    box.union(b);
  });
  stoneBox[k] = { size: box.getSize(V()), center: box.getCenter(V()) };
  return stoneBox[k];
}

/* ---------- 1. bölüm: sahne sabitken (p: 0..1); arazi yerinde kalır ---------- */
// Önemli anlarda (küp havada, tam dağılmış, sıra kurulmuş) sayfa tam o noktada bir an durur:
// kaydırma kısa süre kapanır, sonra kendiliğinden açılır. İki yönde de çalışır.
const STOPS = [0.12, 0.52, 0.76], STOP_MS = 100;
let stopUntil = 0, lastP = 0, armed = STOPS.map(() => true);
addEventListener('scroll', () => {
  const pinPx = window.SITE_PIN_PX || 1;
  const p = scrollY / pinPx;
  if (performance.now() < stopUntil || loopS) { lastP = p; return; }
  STOPS.forEach((s, i) => {
    if (Math.abs(p - s) > 0.04) armed[i] = true;           // uzaklaşınca yeniden kurulsun
    // Yalnızca normal kaydırmada; menü bağlantısı gibi büyük atlamalarda durma
    if (armed[i] && (lastP - s) * (p - s) <= 0 && lastP !== p && Math.abs(p - lastP) < 0.25) {
      armed[i] = false;
      stopUntil = performance.now() + STOP_MS;
      window.scrollTo({ top: s * pinPx, behavior: 'instant' });
    }
  });
  lastP = scrollY / pinPx;
}, { passive: true });
const stopped = () => performance.now() < stopUntil;
addEventListener('wheel', (e) => { if (stopped()) e.preventDefault(); }, { passive: false });
addEventListener('touchmove', (e) => { if (stopped()) e.preventDefault(); }, { passive: false });
addEventListener('keydown', (e) => {
  if (stopped() && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key)) e.preventDefault();
});
function applyPin(p) {
  const out = smooth(seg(p, 0, 0.12));          // küp araziden havalanır, aksonometriğe döner
  // Dağılma havalanırken başlar: önce parçalar yavaşça aralanır ("27 parça" okunur), sonra hızlanır
  const boom = smooth(Math.pow(seg(p, 0.08, 0.52), 1.6));
  const paint = smooth(seg(p, 0.52, 0.62));     // proje parçaları açık kartona döner, çıkartmalar söner
  const part = smooth(seg(p, 0.58, 0.74));      // proje parçaları sıraya girer, diğerleri dağılır
  const side = smooth(seg(p, 0.78, 1));         // sahne hâlâ sabitken sıra yavaşça sağ üst köşeye toplanır

  // Küp: yerinde dönüşünden, araziye göre sabit bir 45° bakışa (eğim maketin kendisinden gelir)
  holder.quaternion.setFromAxisAngle(Y, cubeSpin).slerp(tmpQ.setFromAxisAngle(Y, Math.PI / 4), out);
  holder.position.copy(REST).add(V().set(0, out * 0.75, 0));
  holder.scale.setScalar(1 + out * 0.3);
  projMat.color.copy(BLACK).lerp(WHITE, paint);
  if (core) core.scale.setScalar(Math.max(1 - boom, 1e-4));
  refreshRoot();

  const n = projPieces.length, { w, h } = viewSize();
  cubies.forEach((c) => {
    const ex = explodedLocal(c, EXPLODE * boom);
    if (c.project < 0) {
      // Dağılan parçalar: dışa doğru savrulur, döner ve küçülerek kaybolur
      c.o.position.copy(ex).add(c.at.clone().multiplyScalar(step * 6 * part));
      c.o.quaternion.copy(c.q0).multiply(tmpQ.setFromAxisAngle(c.spinAxis, part * 2.5));
      c.o.scale.setScalar(Math.max(1 - part, 1e-4));
      c.stickers.forEach((s) => s.scale.setScalar(1));
      return;
    }
    // Proje parçaları: ekranın ortasında yan yana bir sıraya girer, eksenlere hizalanır
    c.stickers.forEach((s) => s.scale.setScalar(Math.max(1 - paint, 1e-4)));
    const pos = worldOfLocal(ex).lerp(rowPosOf(c.project, n, w), part).lerp(sidePosOf(c.project, w, h, camera.position.y), side);
    const q = Q().copy(rootWQ).multiply(Q().copy(c.q0).slerp(Q(), part));
    placeWorld(c, pos, q, V().setScalar(pieceSize * rootWS * (1 + part * 0.4) * (1 - side * 0.55)));
  });
  return { rowSize: pieceSize * rootWS * 1.4 };
}

// Sağ üst köşedeki sıra (menü ile proje numaraları arası)
const sidePosOf = (k, w, h, camY) => V().set(w * 0.41, camY + h * 0.36 - k * 0.42, 0.5);

/* ---------- 2. bölüm: projelere iniş (q: kamera ilerlemesi, 1 = ilk proje) ---------- */
function applyProjects(q, rowSize) {
  const { w, h } = viewSize();
  const camY = camera.position.y;
  const n = projPieces.length;
  projPieces.forEach((c) => {
    const k = c.project, s = stones[k];
    const box = ensureStoneBox(k);
    // Sıra (1. bölümün sonunda sağ üst köşeye toplanmış) kamerayla aşağı iner
    const ride = sidePosOf(k, w, h, camY);
    const rideSize = rowSize * 0.45;
    // Taşa uçuş ve dönüşüm: proje bölümü yaklaşırken, geniş bir aralığa yayılmış (q: k → k+1)
    const a = seg(q, k, k + 1);
    const fly = smooth(seg(a, 0, 0.7));
    const morph = smooth(seg(a, 0.7, 1));
    if (!s || !box) {
      placeWorld(c, ride, rootWQ, V().setScalar(rideSize));
      return;
    }
    s.inner.updateWorldMatrix(true, false);
    const target = box.center.clone().applyMatrix4(s.inner.matrixWorld);
    const sQ = s.inner.getWorldQuaternion(Q());
    const full = box.size.clone().multiplyScalar(s.group.scale.x);   // binanın dünya ölçüsü
    const pos = ride.clone().lerp(target, fly);
    const quat = Q().copy(rootWQ).slerp(sQ, fly);
    const size = V().setScalar(rideSize).lerp(full, fly).multiplyScalar(1 - morph);
    placeWorld(c, pos, quat, size.max(V().setScalar(1e-4)));
    s.inner.scale.setScalar(Math.max(morph, 1e-4));
  });
}

function hideStones() {
  projPieces.forEach((c) => { const s = stones[c.project]; if (s && s.inner.children.length) s.inner.scale.setScalar(1e-4); });
}

function updateCaptions(p) {
  const en = document.documentElement.lang === 'en';
  let cur = -1;
  CAPTIONS.forEach((c, k) => { if (p >= c.at) cur = k; });
  if (p <= 0.01 || p >= 0.995) cur = -1;
  caps.forEach((el, k) => {
    const c = CAPTIONS[k];
    const txt = `${String(k + 1).padStart(2, '0')} / ${String(CAPTIONS.length).padStart(2, '0')}<b>${en ? c.en : c.tr}</b>`;
    if (el.dataset.txt !== txt) { el.innerHTML = txt; el.dataset.txt = txt; }
    el.classList.toggle('on', k === cur);
  });
}

/* ---------- Sonsuz döngü: iki yönde, hiç kesilmeyen tek akış ---------- */
// Sayfa sonunda CV'nin buzlu zemininin altında en alt kontur katmanı durur (yakın plan, altlık).
// Aşağı: kaydırmaya devam ettikçe zemin ve yazılar silinir, katman netleşir; kamera katmanın
//        kenarından merkeze arazinin üstünde ilerler, diğer katmanlar yol boyunca yükselir,
//        küp iner; sonra kaydırmak yakınlaşmayı azaltır ve başlangıca dönülür.
// Yukarı: en üstte yukarı kaydırınca bunun tam tersi.
// Geçiş boyunca sayfa hep en üsttedir; sayfa sonundaki yazılar, ekranda aynı yerde duran bir
// kopyayla (hayalet) gösterilir.
const content = document.querySelector('main.content');
const pageEnd = () => document.documentElement.scrollHeight - innerHeight;
// Geçiş tamamen kaydırmaya bağlı: kaydırdıkça ilerler, durunca durur, geri kaydırınca geri gider.
// Tek eksen (= açılış zamanı t):  0 ─ SLIDE : sayfa sonu yazıları silinir;  0 ─ TOTAL : arazi kurulur, küp iner, kamera açılır
const SLIDE = 0.6;
const TOTAL = LOOP_END;
const RATE = TOTAL / 1800;                        // kaç piksellik kaydırma bir tam geçiş eder
const LEAD = 0.3;                                 // hedef, animasyonun en fazla bu kadar önüne geçebilir (fazla savurma atılır)
let loopS = null;                                 // { want, cur }
let ghost = null;

// Sayfanın sonunda ekranda görünen bölümlerin kopyası, sayfa sondayken durdukları yerde.
// Kopyanın kendisine filtre/saydamlık verilmez: bölümün buzlu zemini (backdrop-filter) arkadaki katmanı bulandırmaya devam etsin.
function buildGhost() {
  const end = pageEnd();
  ghost = document.createElement('div');
  ghost.style.cssText = 'position:fixed;inset:0;z-index:2;pointer-events:none;overflow:hidden';
  [...content.children].forEach((el) => {
    const r = el.getBoundingClientRect();
    const top = r.top + scrollY - end;          // sayfa sondayken ekrandaki konumu
    if (top > innerHeight || top + r.height < 0 || !r.height) return;
    const cl = el.cloneNode(true);
    cl.removeAttribute('id');
    cl.dataset.bg = getComputedStyle(el).backgroundColor;
    cl.style.cssText += `;position:absolute;margin:0;left:${r.left}px;top:${top}px;width:${r.width}px;height:${r.height}px`;
    ghost.appendChild(cl);
  });
  document.body.appendChild(ghost);
}
function removeGhost() { if (ghost) ghost.remove(); ghost = null; }
function fadeGhost(u) {
  if (!ghost) return;
  ghost.style.visibility = u >= 1 ? 'hidden' : '';
  const lift = `translate3d(0, ${(-u * 45).toFixed(2)}vh, 0)`;
  const glass = 1 - smooth(seg(u, 0, 0.8));      // buzlu zemin incelir: altındaki katman netleşir
  const blur = (smooth(seg(u, 0.25, 1)) * 12).toFixed(1), op = (1 - smooth(seg(u, 0.4, 1))).toFixed(3);
  [...ghost.children].forEach((cl) => {
    cl.style.transform = lift;
    const m = (cl.dataset.bg || '').match(/[\d.]+/g);
    if (m && m.length >= 3) cl.style.background = `rgba(${m[0]},${m[1]},${m[2]},${((m[3] !== undefined ? +m[3] : 1) * glass).toFixed(3)})`;
    cl.style.backdropFilter = cl.style.webkitBackdropFilter = `blur(${(18 * glass).toFixed(1)}px)`;
    cl.style.borderColor = glass < 1 ? `rgba(255,255,255,${(0.1 * glass).toFixed(3)})` : '';
    [...cl.children].forEach((ch) => { ch.style.filter = `blur(${blur}px)`; ch.style.opacity = op; });
  });
}

function restoreTop() {                           // küp yerinde, arazi kurulu (normal üst durum)
  intro(LOOP_END + 1);
  loopMode = false;
  zoomK = 0;
  showLoading(LOOP_END + 1);
  introDone = true;
}
function enterTop() {                            // iki yönde de aynı döngü kurgusu (aynı kamera, aynı zamanlama)
  if (twist) endTwist();
  introDone = false;
  loopMode = true;
  site.position.set(0, 0, 0);
  site.visible = true;
}
function startLoop(fromEnd) {
  buildGhost();
  if (fromEnd) {
    window.SITE_SNAP = true;                      // kamera aradaki projelerden geçmeden yerine otursun
    window.scrollTo({ top: 0, behavior: 'instant' });
    SITE.kup.loops = (SITE.kup.loops || 0) + 1;
  }
  enterTop();
  loopS = fromEnd ? { want: 0, cur: 0 } : { want: TOTAL, cur: TOTAL };
  fadeGhost(clamp01(loopS.cur / SLIDE));
}
function endLoop(toEnd) {
  restoreTop();
  removeGhost();
  loopS = null;
  if (toEnd) {
    window.SITE_SNAP = true;
    window.scrollTo({ top: pageEnd(), behavior: 'instant' });
  }
}
function stepAnim(dt) {                           // ana döngüden; true dönerse kare bitti
  if (!loopS) return false;
  const s = loopS;
  // Tarayıcının yumuşak kaydırması atlamadan sonra sayfayı itmeye devam edebilir: geçiş boyunca en üstte tut
  if (scrollY > 0) window.scrollTo({ top: 0, behavior: 'instant' });
  // Tekerlek adımları yumuşasın ama birikmesin: kaydırma bırakılınca animasyon hemen durur
  s.cur += (s.want - s.cur) * Math.min(1, dt * 7);
  if (s.cur < 0.004 && s.want <= 0) { endLoop(true); return false; }
  if (s.cur > TOTAL - 0.004 && s.want >= TOTAL) { endLoop(false); return false; }
  fadeGhost(clamp01(s.cur / SLIDE));
  unpin();                                        // sayfa sonundan gelindi: küp parçaları proje diziliminden toplansın
  holder.quaternion.setFromAxisAngle(Y, cubeSpin);
  intro(Math.min(s.cur, LOOP_END));
  return true;
}
SITE.kupAnim = () => loopS && { want: +loopS.want.toFixed(2), cur: +loopS.cur.toFixed(2) };

// Girdi: kenardayken aynı yöne kaydırmak geçişi başlatır; geçiş sürerken kaydırma sayfayı değil animasyonu sürer
const atTop = () => scrollY <= 0;
const atEnd = () => pageEnd() > 0 && scrollY >= pageEnd() - 2;
function drive(px) {                              // px > 0: aşağı kaydırma
  if (!root) return false;
  if (!loopS) {
    if (px < 0 && atTop() && introDone) startLoop(false);
    else if (px > 0 && atEnd()) startLoop(true);
    else return false;
  }
  const w = Math.min(loopS.cur + LEAD, Math.max(loopS.cur - LEAD, loopS.want + px * RATE));
  loopS.want = Math.min(TOTAL + 0.01, Math.max(-0.01, w));
  return true;
}
addEventListener('wheel', (e) => {
  const px = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
  if (px && drive(px)) e.preventDefault();
}, { passive: false });
let touchY = null;
addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', (e) => {
  if (touchY === null) return;
  const y = e.touches[0].clientY, px = (touchY - y) * 2;
  touchY = y;
  if (px && drive(px)) e.preventDefault();
}, { passive: false });
addEventListener('keydown', (e) => {
  const step = { ArrowDown: 120, ArrowUp: -120, PageDown: innerHeight * 0.8, PageUp: -innerHeight * 0.8,
    ' ': innerHeight * 0.8, End: 400, Home: -400 }[e.key];
  if (step && (loopS || (step < 0 && atTop()) || (step > 0 && atEnd())) && drive(step)) e.preventDefault();
});

/* ---------- Kaydırınca arazi silikleşip kaybolur ---------- */
// Önce kontur çizgileri silinir ve ağaçlar küçülür (keskinlik gider, bulanıklaşma hissi),
// sonra katmanlar geriye-aşağı çekilerek saydamlaşır. En üste dönünce geri gelir.
function fadeSite(p) {
  const soft = smooth(seg(p, 0.02, 0.2));
  const gone = smooth(seg(p, 0.06, 0.34));
  layers.forEach((g) => {
    g.children[0].material.opacity = 1 - gone;
    g.children[0].castShadow = gone < 0.4;
    g.children[1].material.opacity = 0.85 * (1 - soft);
  });
  trees.forEach((t) => t.scale.setScalar(Math.max(1 - soft, 1e-4)));
  site.position.set(0, -gone * 0.5, -gone * 1.2);
  site.visible = gone < 0.999;
}

// En üste dönüldü: küpü toparla, proje taşlarını gizle, boşta dönüşe devam
function unpin() {
  hideStones();
  if (!pinned) return;
  applyPin(0);
  cubies.forEach((c) => { c.o.position.copy(explodedLocal(c, 0)); c.o.quaternion.copy(c.q0); c.o.scale.setScalar(1); });
  pinned = false;
}

/* ---------- Döngü ---------- */
const clock = new THREE.Clock();
let introDone = false;
layers.forEach((g) => { g.visible = false; });
trees.forEach((t) => { t.visible = false; });
holder.visible = false;
(function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  const pinPx = window.SITE_PIN_PX || 1;
  const p = clamp01(scrollY / pinPx);
  pinZoom = loopS || p <= 0 ? 0 : smooth(seg(p, 0, 0.1)) * (1 - smooth(seg(p, 0.14, 0.38)));
  pinPull = loopS || p <= 0 ? 0 : smooth(seg(p, 0.16, 0.4)) * (1 - smooth(seg(p, 0.5, 0.68)));
  // Giriş yazısı, kamera küpe yaklaşırken silinsin (yukarı kayarken menünün altına binmesin)
  if (!loopS && introDone) heroText.style.opacity = (1 - smooth(seg(p, 0, 0.05))).toFixed(3);
  const unit = document.querySelector('.hero').offsetHeight || innerHeight;
  const q = Math.max(0, scrollY - pinPx) / unit;
  updateCaptions(p);
  updateLights();
  // Duvar: projelere inerken loş bir odanın duvarı gibi belirir; CV'de (şalterden sonra) fener altında tam renk
  updateSmoke(dt);

  // Maket kahramanın (hero) yerinde durur; kendi eğimi ve yavaş dönüşü var (kaydırırken durur)
  stage.position.copy(hero.position).add(V().set(0, -0.15, 0));
  stage.scale.copy(hero.scale);
  stage.rotation.set(TILT, stageSpin, 0, 'XYZ');
  sun.position.copy(stage.position).add(V().set(2.6, 6.5, 4));
  sun.target.position.copy(stage.position);
  // Izgara kamerayla gelir ama kaydırdıkça yukarı akar (hücre boyu 0.9): aşağı inildiği hissedilsin
  grid.position.set(camera.position.x * 0.3, camera.position.y + ((scrollY / innerHeight) * 1.6) % 0.9, -7);
  sun.shadow.camera.zoom = 1 / Math.max(stage.scale.x, 0.3);
  sun.shadow.camera.updateProjectionMatrix();

  speed = BASE + (speed - BASE) * Math.exp(-dt * 0.7);
  const boost = speed / BASE;
  cubeSpin += speed * dt;
  if (!root || !cubies.length) return;

  if (stepAnim(dt)) return;
  if (!introDone) {
    // Test için: ?introt=0.8 açılışı o saniyede dondurur
    const frozen = parseFloat(new URLSearchParams(location.search).get('introt'));
    if (frozen >= 0) { loopMode = new URLSearchParams(location.search).has('dongu'); intro(frozen); return; }
    introDone = intro((performance.now() - introStart) / 1000) || p > 0;
    if (introDone) { intro(LOOP_END + 1); loopMode = false; zoomK = 0; }
  }
  if (introDone) fadeSite(p);

  if (p > 0) {
    if (!pinned) {
      if (twist) endTwist();
      cubies.forEach((c) => c.q0.copy(c.o.quaternion));
      pinned = true;
    }
    const { rowSize } = applyPin(p);
    if (q > 0) applyProjects(q, rowSize);
    else hideStones();
    return;
  }
  unpin();
  holder.quaternion.setFromAxisAngle(Y, cubeSpin);
  if (!introDone) return;
  if (twist) {
    twist.t += dt * (0.9 + boost * 0.55);
    if (twist.t >= 1) endTwist();
    else twist.pivot.quaternion.setFromAxisAngle(twist.vec, twist.dir * Math.PI / 2 * ease(twist.t));
  } else if ((nextTwist -= dt * boost) <= 0) {
    startTwist();
    nextTwist = 1.6 + Math.random() * 1.4;
  }
})();
})();
