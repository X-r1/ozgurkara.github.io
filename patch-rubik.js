/* =====================================================================
<<<<<<< HEAD
   YAMA: Rubik küpü (giriş ekranındaki buz taşının içinde)
=======
   YAMA: Gotik Rubik küpü (giriş ekranındaki buz taşının içinde)
>>>>>>> ffdc7b118bf630a2e0fdcab19c5a2a4a750e3850
   - Küp her zaman yavaşça döner, arada bir katmanları çevrilir.
   - Taşa tıklayınca dönüş ve katman çevirme hızlanır, sonra yavaşça normale iner.
   Kaldırmak için index.html'deki <script src="patch-rubik.js"> satırını sil.
   ===================================================================== */
(function () {
const SITE = window.SITE;
if (SITE) init(SITE);

function init({ THREE, camera, canvas, hero, heroRock, heroCore, coreLight, loadGLB, fitModel }) {
  const BASE = 0.25;            // boşta dönüş hızı (rad/sn)
  const MAX = 6;                // tıklamalarla çıkabileceği en yüksek hız
  const KICK = 2.2;             // her tıklamada eklenen hız
  const SPACING_TOL = 0.35;     // katman yuvarlama toleransı

  let speed = BASE;
  const holder = new THREE.Group();
  hero.add(holder);
<<<<<<< HEAD
  // Küpü öne doğru aydınlatan iç ışık (taşın içi karanlık kalmasın)
  const glow = new THREE.PointLight('#ffffff', 3, 5);
=======
  // Küpü öne doğru aydınlatan sıcak bir iç ışık (vitraylar parlasın)
  const glow = new THREE.PointLight('#ffd7a8', 6, 5);
>>>>>>> ffdc7b118bf630a2e0fdcab19c5a2a4a750e3850
  glow.position.set(0.6, 0.8, 1.6);
  hero.add(glow);

  let cube = null, root = null, cubies = [], center = new THREE.Vector3(), step = 1;
  let twist = null, nextTwist = 1.5;

<<<<<<< HEAD
  loadGLB('models/rubik.glb').then((m) => {
    root = m;
    // Küçük küpler: adı Cubie_x_y_z olan düğümler (çıkartmalar bunların çocukları).
    // Modelde her küp tam ızgara noktasında ve dönüşsüz durur; merkez ve aralık konumlardan okunur.
    const parts = m.children.filter((o) => /^Cubie_/.test(o.name));
    parts.forEach((o) => center.add(o.position));
    center.divideScalar(parts.length || 1);
    step = Math.max(...parts.map((o) => Math.max(Math.abs(o.position.x - center.x), Math.abs(o.position.y - center.y), Math.abs(o.position.z - center.z)))) || 1;
    cubies = parts.map((o) => ({ o, at: o.position.clone().sub(center).divideScalar(step).round() }));
    SITE.rubik = { cubies, center, step, twists: 0 };   // durum (hata ayıklama için)
    // Kenar 1.05: dönerken köşegeni (~0.91 yarıçap) taşın en dar yerinde bile içeride kalır
    cube = fitModel(m, 1.05, 1.05, true);
=======
  loadGLB('models/rubik-gotik.glb').then((m) => {
    root = m;
    // Küçük küpler: adı Cubie_x_y_z olan düğümler (vitray ve çerçeveler bunların çocukları).
    // Merkezler, model sahneye yerleşmeden (kendi koordinatlarında) ölçülür.
    m.updateMatrixWorld(true);
    const box = new THREE.Box3();
    const parts = m.children.filter((o) => /^Cubie_/.test(o.name));
    const centers = parts.map((o) => box.setFromObject(o).getCenter(new THREE.Vector3()));
    centers.forEach((c) => center.add(c));
    center.divideScalar(centers.length || 1);
    step = Math.max(...centers.map((c) => Math.max(Math.abs(c.x - center.x), Math.abs(c.y - center.y), Math.abs(c.z - center.z)))) || 1;
    cubies = parts.map((o, k) => ({ o, at: centers[k].clone().sub(center).divideScalar(step).round() }));
    cube = fitModel(m, 1.35, 1.35, true);
>>>>>>> ffdc7b118bf630a2e0fdcab19c5a2a4a750e3850
    holder.add(cube);
    holder.rotation.set(0.5, 0.6, 0.15);
    heroCore.visible = false;
    coreLight.intensity *= 0.5;
  }).catch((err) => console.warn('Rubik küpü yüklenemedi:', err));

  // ---------- Katman çevirme ----------
  const AXES = ['x', 'y', 'z'];
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  function startTwist() {
    const axis = AXES[(Math.random() * 3) | 0];
    const layer = [-1, 0, 1][(Math.random() * 3) | 0];
    const dir = Math.random() < 0.5 ? 1 : -1;
    const members = cubies.filter((c) => Math.abs(c.at[axis] - layer) < SPACING_TOL);
    const pivot = new THREE.Object3D();
    pivot.position.copy(center);
    root.add(pivot);
    pivot.updateMatrixWorld(true);
    members.forEach((c) => pivot.attach(c.o));
    twist = { axis, dir, members, pivot, t: 0, vec: new THREE.Vector3(+(axis === 'x'), +(axis === 'y'), +(axis === 'z')) };
  }
  function endTwist() {
    const { pivot, members, vec, dir } = twist;
    pivot.quaternion.setFromAxisAngle(vec, dir * Math.PI / 2);
    pivot.updateMatrixWorld(true);
<<<<<<< HEAD
    const rm = new THREE.Matrix4();
    members.forEach((c) => {
      root.attach(c.o);
      c.at.applyAxisAngle(vec, dir * Math.PI / 2).round();
      // Birikmiş küçük hataları sil: konumu ızgaraya, dönüşü tam 90°'lere oturt
      c.o.position.copy(c.at).multiplyScalar(step).add(center);
      rm.makeRotationFromQuaternion(c.o.quaternion);
      const e = rm.elements;
      for (const k of [0, 1, 2, 4, 5, 6, 8, 9, 10]) e[k] = Math.round(e[k]);
      c.o.quaternion.setFromRotationMatrix(rm);
    });
    root.remove(pivot);
    twist = null;
    SITE.rubik.twists++;
=======
    members.forEach((c) => {
      root.attach(c.o);
      c.at.applyAxisAngle(vec, dir * Math.PI / 2).round();
    });
    root.remove(pivot);
    twist = null;
>>>>>>> ffdc7b118bf630a2e0fdcab19c5a2a4a750e3850
  }

  // ---------- Tıklama / imleç ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const overHero = (e) => {
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObject(heroRock, false).length > 0;
  };
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' && overHero(e)) canvas.style.cursor = 'pointer';
  });
  canvas.addEventListener('click', (e) => {
    if (!overHero(e)) return;
    speed = Math.min(MAX, speed + KICK);
    nextTwist = Math.min(nextTwist, 0.05);
  });

  // ---------- Döngü ----------
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    speed = BASE + (speed - BASE) * Math.exp(-dt * 0.7);      // hız yavaşça boşta hızına iner
    const boost = speed / BASE;
    holder.rotation.y += speed * dt;
    holder.rotation.x += speed * dt * 0.35;
<<<<<<< HEAD
    glow.intensity = 3 + (boost - 1) * 0.8;
=======
    glow.intensity = 6 + (boost - 1) * 1.5;
>>>>>>> ffdc7b118bf630a2e0fdcab19c5a2a4a750e3850
    if (!root || !cubies.length) return;
    if (twist) {
      twist.t += dt * (0.9 + boost * 0.55);                    // hızlıyken katmanlar da hızlı döner
      if (twist.t >= 1) endTwist();
      else twist.pivot.quaternion.setFromAxisAngle(twist.vec, twist.dir * Math.PI / 2 * ease(twist.t));
    } else if ((nextTwist -= dt * boost) <= 0) {
      startTwist();
      nextTwist = 1.6 + Math.random() * 1.4;
    }
  })();
}
})();
