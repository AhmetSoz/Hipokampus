"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * "Hafıza yolu" — ana sayfa hero'sunun arka planındaki tek imza hareket.
 *
 * Neden WebGL: iz çizgisinin derinlikte kıvrılması ve uç noktanın öne çıkması
 * düz bir SVG ile aynı hissi vermiyor. Sitenin başka hiçbir yerinde three.js
 * kullanılmıyor — hareket bilinçli olarak tek bir yere hapsedildi.
 *
 * Kısıtlar:
 *  - prefers-reduced-motion: reduce ise sahne hiç kurulmaz.
 *  - Sekme arka plandayken döngü durur.
 *  - WebGL yoksa sessizce hiçbir şey çizilmez; içerik etkilenmez.
 *  - Dekoratiftir: aria-hidden, hiçbir bilgi yalnızca burada yer almaz.
 */
export function MemoryTrail() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    /* Hem sistem ayarı hem arayüzdeki "hareketi azalt" anahtarı dinlenir.
       İkisinden biri açıksa sahne hiç kurulmaz — durdurulmaz, kurulmaz. */
    const systemReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const userCalm = () => document.documentElement.dataset.motion === "az";
    if (systemReduced.matches || userCalm()) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return; // WebGL yok — sessizce vazgeç.
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.4, 9);

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const TEAL = new THREE.Color("#0e5c63");
    const TEAL_SOFT = new THREE.Color("#7fc0c7");
    const SAND = new THREE.Color("#d8b07a");

    const group = new THREE.Group();
    scene.add(group);

    /* --- İzler: derinlikte kıvrılan üç yol ------------------------------ */
    const trails: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3 }[] = [];

    const makeTrail = (
      offsetY: number,
      depth: number,
      color: THREE.Color,
      opacity: number,
      radius: number,
    ) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-7, offsetY - 1.1, depth - 1.5),
        new THREE.Vector3(-3.6, offsetY + 0.5, depth + 0.6),
        new THREE.Vector3(-0.4, offsetY - 0.5, depth - 0.4),
        new THREE.Vector3(3.1, offsetY + 0.7, depth + 0.8),
        new THREE.Vector3(6.4, offsetY - 0.2, depth - 0.2),
      ]);
      const geometry = new THREE.TubeGeometry(curve, 140, radius, 10, false);
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
      });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
      trails.push({ mesh, curve });
      return curve;
    };

    const mainCurve = makeTrail(0.2, 0, TEAL, 0.5, 0.028);
    makeTrail(-1.5, -2.2, TEAL_SOFT, 0.34, 0.02);
    makeTrail(1.7, -3.4, TEAL_SOFT, 0.22, 0.016);

    /* --- Uç nokta: "yön bulma" ----------------------------------------- */
    const endPoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 24, 24),
      new THREE.MeshBasicMaterial({ color: SAND }),
    );
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 24, 24),
      new THREE.MeshBasicMaterial({ color: SAND, transparent: true, opacity: 0.22 }),
    );
    group.add(endPoint, halo);

    /* --- Zerreler: hafıza izleri ---------------------------------------- */
    const MOTE_COUNT = 90;
    const positions = new Float32Array(MOTE_COUNT * 3);
    const drift = new Float32Array(MOTE_COUNT);
    for (let i = 0; i < MOTE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7 - 1.5;
      drift[i] = 0.1 + Math.random() * 0.35;
    }
    const moteGeometry = new THREE.BufferGeometry();
    moteGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const motes = new THREE.Points(
      moteGeometry,
      new THREE.PointsMaterial({
        color: TEAL_SOFT,
        size: 0.055,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
      }),
    );
    group.add(motes);

    /* --- Ölçekleme ------------------------------------------------------ */
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Dar ekranda sahneyi geri çek ki iz kadraja sığsın.
      camera.position.z = w < 720 ? 12.5 : 9;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    /* --- Döngü ---------------------------------------------------------- */
    let frame = 0;
    let running = true;
    const clock = new THREE.Clock();
    const head = new THREE.Vector3();

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      // Çok yavaş, nefes alır gibi. Hız bilinçli olarak düşük tutuldu.
      group.rotation.y = Math.sin(t * 0.11) * 0.16;
      group.rotation.x = Math.sin(t * 0.08) * 0.06;
      group.position.y = Math.sin(t * 0.15) * 0.12;

      // Uç nokta izin üzerinde ileri geri gezinir.
      const progress = 0.62 + Math.sin(t * 0.22) * 0.34;
      mainCurve.getPointAt(THREE.MathUtils.clamp(progress, 0, 1), head);
      endPoint.position.copy(head);
      halo.position.copy(head);
      const pulse = 1 + Math.sin(t * 1.1) * 0.22;
      halo.scale.setScalar(pulse);

      const arr = moteGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < MOTE_COUNT; i++) {
        arr[i * 3] += drift[i] * 0.004;
        if (arr[i * 3] > 7.5) arr[i * 3] = -7.5;
      }
      moteGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    tick();

    const pause = () => {
      if (!running) return;
      cancelAnimationFrame(frame);
      running = false;
    };
    const resume = () => {
      if (running || document.hidden || userCalm()) return;
      running = true;
      tick();
    };

    const onVisibility = () => (document.hidden ? pause() : resume());
    document.addEventListener("visibilitychange", onVisibility);

    // Kullanıcı "hareketi azalt" anahtarını çevirdiğinde anında uygula.
    const motionWatcher = new MutationObserver(() =>
      userCalm() ? pause() : resume(),
    );
    motionWatcher.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion"],
    });

    /* --- Temizlik ------------------------------------------------------- */
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
      motionWatcher.disconnect();
      observer.disconnect();
      trails.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      [endPoint, halo].forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      moteGeometry.dispose();
      (motes.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 opacity-90"
    />
  );
}
