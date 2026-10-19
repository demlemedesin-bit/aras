// 360° showroom turu: sürükle, yakınlaştır, otomatik dönüş. Orijinal sitedeki algoritmanın TypeScript portu.

export type TourOptions = {
  view: HTMLElement;
  track: HTMLElement;
  counter: HTMLElement;
  hint: HTMLElement;
  autoBtn: HTMLElement;
  pts: number[];
  asp: number;
  reduce: boolean;
  isOpen: () => boolean;
  close: () => void;
};

export function createTour(o: TourOptions) {
  const { view: v, track: tr, counter: cnt, hint, autoBtn, pts, asp } = o;
  let x = 0, y = 0, z = 1, vel = 0, raf = 0, idle = 0, auto = !o.reduce;
  let goal: number | null = null;
  let pd = 0;
  let last2 = 0;
  const ptr: Record<number, { x: number; y: number }> = {};

  const bh = () => {
    const vw = v.clientWidth, vh = v.clientHeight;
    return vw <= 700 ? vh * 0.48 : Math.min(vh, 820);
  };
  const iw = () => bh() * z * asp;
  const clampY = () => {
    const H = bh() * z, m = Math.max(0, (H - v.clientHeight) / 2);
    y = Math.max(-m, Math.min(m, y));
  };
  const section = (w: number, tol = 0) => {
    const f = ((x + v.clientWidth / 2) % w) / w;
    let k = 0;
    for (let n = 0; n < pts.length; n++) if (f >= pts[n] - tol) k = n;
    return k;
  };
  const draw = () => {
    const H = bh() * z, w = iw();
    x = ((x % w) + w) % w;
    clampY();
    tr.style.height = `${H}px`;
    tr.style.top = `${v.clientHeight / 2 - H / 2 + y}px`;
    tr.style.transform = `translate3d(${-x}px,0,0)`;
    cnt.textContent = `${section(w) + 1} / ${pts.length}`;
  };
  const zoomAt = (nz: number, fx: number, fy: number) => {
    nz = Math.max(1, Math.min(4, nz));
    if (nz === z) return;
    const r = nz / z, d = fy - v.clientHeight / 2 - y;
    x = (x + fx) * r - fx;
    y = fy - d * r - v.clientHeight / 2;
    z = nz;
    draw();
  };
  const setAuto = (on: boolean) => {
    auto = on;
    autoBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  };
  const stop = () => {
    setAuto(false);
    goal = null;
  };
  const touch = () => {
    idle = 0;
    hint.classList.add('off');
  };
  const tick = () => {
    if (!o.isOpen()) {
      raf = 0;
      return;
    }
    if (goal !== null) {
      const w = iw();
      let d = goal - x;
      d = ((((d + w / 2) % w) + w) % w) - w / 2;
      if (Math.abs(d) < 2) {
        x = goal;
        goal = null;
      } else x += d * 0.09;
    } else if (!pd) {
      if (Math.abs(vel) > 0.05) {
        x -= vel;
        vel *= 0.94;
        idle = 0;
      } else if (auto) {
        idle++;
        if (idle > 60) x += 0.35 / Math.sqrt(z);
      }
    }
    draw();
    raf = requestAnimationFrame(tick);
  };

  const go = (dir: number) => {
    stop();
    const w = iw();
    const k = section(w, 0.002);
    const nk = (k + dir + pts.length) % pts.length;
    const e = nk === pts.length - 1 ? 1 : pts[nk + 1];
    goal = ((pts[nk] + e) / 2) * w - v.clientWidth / 2;
    goal = ((goal % w) + w) % w;
    touch();
  };

  const rect = () => v.getBoundingClientRect();
  const dist = () => {
    const k = Object.keys(ptr);
    if (k.length < 2) return 0;
    const a = ptr[+k[0]], b = ptr[+k[1]];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onKey = (e: KeyboardEvent) => {
    if (!o.isOpen()) return;
    if (e.key === 'Escape' && !document.fullscreenElement) o.close();
    if (e.key === 'ArrowLeft') { stop(); touch(); vel = -12; }
    if (e.key === 'ArrowRight') { stop(); touch(); vel = 12; }
    if (e.key === 'ArrowUp') { y += 40; draw(); }
    if (e.key === 'ArrowDown') { y -= 40; draw(); }
    if (e.key === '+' || e.key === '=') { stop(); zoomAt(z * 1.25, v.clientWidth / 2, v.clientHeight / 2); }
    if (e.key === '-') { stop(); zoomAt(z / 1.25, v.clientWidth / 2, v.clientHeight / 2); }
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    stop(); touch();
    const r = rect();
    zoomAt(z * Math.exp(-e.deltaY * 0.0018), e.clientX - r.left, e.clientY - r.top);
  };
  const onDbl = (e: MouseEvent) => {
    stop(); touch();
    const r = rect();
    if (z > 1.05) { z = 1; y = 0; draw(); } else zoomAt(2.4, e.clientX - r.left, e.clientY - r.top);
  };
  const onDown = (e: PointerEvent) => {
    ptr[e.pointerId] = { x: e.clientX, y: e.clientY };
    pd = Object.keys(ptr).length;
    vel = 0; goal = null; touch();
    v.classList.add('dr');
    v.setPointerCapture(e.pointerId);
    if (pd === 2) last2 = dist();
  };
  const onMove = (e: PointerEvent) => {
    const p = ptr[e.pointerId];
    if (!p) return;
    if (pd >= 2) {
      ptr[e.pointerId] = { x: e.clientX, y: e.clientY };
      const d = dist();
      if (last2) {
        const k = Object.keys(ptr), a = ptr[+k[0]], b = ptr[+k[1]], r = rect();
        stop();
        zoomAt((z * d) / last2, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
      }
      last2 = d;
      return;
    }
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    stop(); x -= dx; y += dy; vel = -dx; touch();
  };
  const onUp = (e: PointerEvent) => {
    delete ptr[e.pointerId];
    pd = Object.keys(ptr).length;
    if (!pd) v.classList.remove('dr');
    last2 = 0;
  };
  const onResize = () => { if (o.isOpen()) draw(); };

  addEventListener('keydown', onKey);
  addEventListener('resize', onResize);
  v.addEventListener('wheel', onWheel, { passive: false });
  v.addEventListener('dblclick', onDbl);
  v.addEventListener('pointerdown', onDown);
  v.addEventListener('pointermove', onMove);
  v.addEventListener('pointerup', onUp);
  v.addEventListener('pointercancel', onUp);

  return {
    /** Tur açıldığında görünümü sıfırlar ve animasyonu başlatır. */
    start() {
      x = 0; y = 0; z = 1; vel = 0; idle = 0; goal = null;
      setAuto(!o.reduce);
      hint.classList.remove('off');
      draw();
      if (!raf) raf = requestAnimationFrame(tick);
    },
    go,
    zoom(dir: number) {
      stop(); touch();
      zoomAt(z * (dir > 0 ? 1.5 : 1 / 1.5), v.clientWidth / 2, v.clientHeight / 2);
    },
    resetView() { z = 1; y = 0; touch(); draw(); },
    toggleAuto() { setAuto(!auto); idle = 0; touch(); },
    destroy() {
      cancelAnimationFrame(raf);
      removeEventListener('keydown', onKey);
      removeEventListener('resize', onResize);
      v.removeEventListener('wheel', onWheel);
      v.removeEventListener('dblclick', onDbl);
      v.removeEventListener('pointerdown', onDown);
      v.removeEventListener('pointermove', onMove);
      v.removeEventListener('pointerup', onUp);
      v.removeEventListener('pointercancel', onUp);
    },
  };
}
