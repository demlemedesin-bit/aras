'use client';

import { useEffect } from 'react';

/** Panel önizlemesi (aynı sitede iframe): tema stilini anında uygular ve "öğe seç" modunu çalıştırır. */
const esc = (s: string) => (window.CSS && CSS.escape ? CSS.escape(s) : s.replace(/[^\w-]/g, '\\$&'));
const okCls = (c: string) => /^[A-Za-z][\w-]*$/.test(c) && !/^(on|open|js|lang-open|auth-open|pre-lock)$/.test(c);

function selectors(el: Element): { similar: string; exact: string; label: string } {
  const tag = el.tagName.toLowerCase();
  const cls = Array.from(el.classList).filter(okCls);
  const similar = cls.length ? `${tag}.${cls.slice(0, 2).map(esc).join('.')}` : '';
  const parts: string[] = [];
  let n: Element | null = el;
  for (let i = 0; n && n !== document.body && i < 6; i++) {
    if (n.id && /^[A-Za-z][\w-]*$/.test(n.id)) { parts.unshift(`#${n.id}`); break; }
    const t = n.tagName.toLowerCase();
    const sib = n.parentElement ? Array.from(n.parentElement.children).filter((x) => x.tagName === n!.tagName) : [];
    const c = Array.from(n.classList).filter(okCls)[0];
    parts.unshift(`${t}${c ? '.' + esc(c) : ''}${sib.length > 1 ? `:nth-of-type(${sib.indexOf(n) + 1})` : ''}`);
    n = n.parentElement;
  }
  const exact = parts.join(' > ');
  const txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 32);
  return { similar: similar || exact, exact, label: `${tag}${cls[0] ? '.' + cls[0] : ''}${txt ? ` “${txt}”` : ''}` };
}

const norm = (t: string) => t.replace(/\s+/g, ' ').trim();

export default function ThemeLive() {
  useEffect(() => {
    if (window.parent === window) return;
    const d = document;
    const root = d.documentElement;
    let edit = false;
    let hover: Element | null = null;
    let picked: Element | null = null;
    let editing: { el: HTMLElement; before: string } | null = null;
    let curSec: HTMLElement | null = null;
    const post = (m: object) => window.parent.postMessage(m, location.origin);

    const st = () => {
      let s = d.getElementById('aras-theme-live') as HTMLStyleElement | null;
      if (!s) { s = d.createElement('style'); s.id = 'aras-theme-live'; d.head.appendChild(s); }
      return s;
    };
    const ed = d.createElement('style');
    ed.id = 'aras-edit-css';
    ed.textContent = `
[data-aras-h]{outline:2px solid #2f81f7!important;outline-offset:-2px;cursor:crosshair!important}
.aras-sel{outline:3px solid #f5a524!important;outline-offset:-3px}
[contenteditable]{outline:3px solid #2f81f7!important;outline-offset:2px;cursor:text!important;user-select:text!important}
html:not([data-aras-edit]) [data-aras-off]{display:none!important}
html[data-aras-edit] [data-aras-off]{opacity:.25;filter:grayscale(1)}
html[data-aras-edit] main>section[id]:hover{box-shadow:inset 0 0 0 2px rgba(47,129,247,.55)}
#aras-bar{position:fixed;z-index:2147483000;display:none;align-items:center;gap:2px;padding:4px;border-radius:12px;background:#111c;backdrop-filter:blur(10px);color:#fff;font:600 12px system-ui,sans-serif;box-shadow:0 6px 24px #0006}
#aras-bar button{all:unset;cursor:pointer;min-width:30px;height:30px;display:grid;place-items:center;border-radius:8px;font-size:15px}
#aras-bar button:hover{background:#fff3}
#aras-bar .g{cursor:grab;letter-spacing:-2px}
#aras-bar b{padding:0 8px 0 6px;font-weight:600;opacity:.85;white-space:nowrap}
#aras-ind{position:fixed;z-index:2147483001;left:0;right:0;height:4px;background:#2f81f7;box-shadow:0 0 0 2px #2f81f755;display:none;pointer-events:none}
html[data-aras-drag],html[data-aras-drag] *{cursor:grabbing!important}`;
    d.head.appendChild(ed);

    const bar = d.createElement('div');
    bar.id = 'aras-bar';
    bar.innerHTML = '<button class="g" title="Sürükleyerek taşı">⋮⋮</button><b></b><button data-a="up" title="Yukarı taşı">↑</button><button data-a="down" title="Aşağı taşı">↓</button><button data-a="eye" title="Gizle / göster">◐</button>';
    d.body.appendChild(bar);
    const ind = d.createElement('div');
    ind.id = 'aras-ind';
    d.body.appendChild(ind);

    const main = () => d.querySelector('main');
    const secs = () => Array.from(main()?.querySelectorAll(':scope > section[id]') ?? []) as HTMLElement[];
    const state = () => ({ order: secs().map((x) => x.id), hidden: secs().filter((x) => x.hasAttribute('data-aras-off')).map((x) => x.id) });
    const emitLayout = () => post({ type: 'aras-order', ...state() });
    const placeBar = () => {
      if (!edit || !curSec) { bar.style.display = 'none'; return; }
      const r = curSec.getBoundingClientRect();
      if (r.bottom < 90 || r.top > innerHeight - 20) { bar.style.display = 'none'; return; }
      bar.style.display = 'flex';
      bar.style.left = '14px';
      bar.style.top = Math.max(r.top + 10, 88) + 'px';
      (bar.querySelector('b') as HTMLElement).textContent = curSec.id === 'top' ? 'Ana görsel' : curSec.id;
    };

    const clear = () => { hover?.removeAttribute('data-aras-h'); hover = null; };
    const over = (e: MouseEvent) => {
      if (!edit || editing) return;
      const t = e.target as Element;
      if (bar.contains(t)) return;
      const sc = t.closest('main > section[id]') as HTMLElement | null;
      if (sc !== curSec) { curSec = sc; placeBar(); }
      if (t === hover) return;
      clear(); hover = t; t.setAttribute('data-aras-h', '');
    };

    const click = (e: MouseEvent) => {
      if (!edit) return;
      const t = e.target as HTMLElement;
      if (bar.contains(t)) return;
      if (editing && editing.el.contains(t)) return;
      e.preventDefault(); e.stopPropagation();
      if (editing) finishEdit(true);
      d.querySelectorAll('.aras-sel').forEach((x) => x.classList.remove('aras-sel'));
      t.classList.add('aras-sel');
      picked = t;
      const cs = getComputedStyle(t);
      const g = (p: string) => cs.getPropertyValue(p);
      post({
        type: 'aras-pick', ...selectors(t), text: norm(t.textContent || '').slice(0, 400), lang: root.lang || 'tr', section: t.closest('main > section[id]')?.id ?? '',
        computed: { color: g('color'), 'background-color': g('background-color'), 'font-size': g('font-size'), 'font-weight': g('font-weight'), 'border-radius': g('border-radius'), opacity: g('opacity'), 'letter-spacing': g('letter-spacing'), 'text-align': g('text-align'), padding: g('padding'), margin: g('margin') },
      });
    };

    // Yerinde yazı düzenleme (çift tıklama)
    const finishEdit = (commit: boolean) => {
      if (!editing) return;
      const { el, before } = editing;
      editing = null;
      el.removeAttribute('contenteditable');
      const after = norm(el.textContent || '');
      if (!commit || after === before) { if (!commit) el.textContent = before; return; }
      post({ type: 'aras-textedit', before, after, lang: root.lang || 'tr' });
    };
    const dbl = (e: MouseEvent) => {
      if (!edit) return;
      const t = e.target as HTMLElement;
      if (bar.contains(t) || !norm(t.textContent || '')) return;
      e.preventDefault(); e.stopPropagation();
      clear();
      if (editing) finishEdit(true);
      editing = { el: t, before: norm(t.textContent || '') };
      t.setAttribute('contenteditable', 'plaintext-only');
      if (t.contentEditable !== 'plaintext-only') t.setAttribute('contenteditable', 'true');
      t.focus();
      const r = d.createRange(); r.selectNodeContents(t);
      const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(r);
    };
    const keydown = (e: KeyboardEvent) => {
      if (!editing) return;
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); finishEdit(true); }
      else if (e.key === 'Escape') { e.preventDefault(); finishEdit(false); }
      e.stopPropagation();
    };
    const focusout = () => { if (editing) finishEdit(true); };

    // Bölüm araç çubuğu
    const move = (el: HTMLElement, dir: -1 | 1) => {
      const list = secs(); const i = list.indexOf(el); const j = i + dir;
      if (j < 0 || j >= list.length) return;
      const m = main()!;
      if (dir < 0) m.insertBefore(el, list[j]); else m.insertBefore(list[j], el);
      emitLayout(); placeBar();
    };
    bar.addEventListener('click', (e) => {
      const a = (e.target as HTMLElement).closest('button')?.getAttribute('data-a');
      if (!a || !curSec) return;
      e.preventDefault(); e.stopPropagation();
      if (a === 'up') move(curSec, -1);
      else if (a === 'down') move(curSec, 1);
      else if (a === 'eye') { curSec.toggleAttribute('data-aras-off'); emitLayout(); }
    });
    bar.querySelector('.g')!.addEventListener('mousedown', (ev) => {
      const e = ev as MouseEvent;
      if (!curSec) return;
      e.preventDefault();
      const el = curSec;
      root.setAttribute('data-aras-drag', '');
      el.style.opacity = '.45';
      let ref: HTMLElement | null = null;
      const mm = (ev2: MouseEvent) => {
        const list = secs().filter((x) => x !== el);
        ref = list.find((x) => { const r = x.getBoundingClientRect(); return ev2.clientY < r.top + r.height / 2; }) ?? null;
        const r = (ref ?? list[list.length - 1])?.getBoundingClientRect();
        if (r) { ind.style.display = 'block'; ind.style.top = (ref ? r.top : r.bottom) - 2 + 'px'; }
        if (ev2.clientY < 80) scrollBy(0, -22); else if (ev2.clientY > innerHeight - 60) scrollBy(0, 22);
      };
      const up = () => {
        removeEventListener('mousemove', mm, true); removeEventListener('mouseup', up, true);
        root.removeAttribute('data-aras-drag'); el.style.opacity = ''; ind.style.display = 'none';
        const m = main()!;
        if (ref) m.insertBefore(el, ref); else m.appendChild(el);
        emitLayout(); placeBar();
      };
      addEventListener('mousemove', mm, true); addEventListener('mouseup', up, true);
    });

    const applyLayout = (order: string[], hidden: string[]) => {
      const m = main(); if (!m) return;
      const by = Object.fromEntries(secs().map((x) => [x.id, x]));
      for (const id of order) if (by[id]) m.appendChild(by[id]);
      Object.values(by).forEach((x) => x.toggleAttribute('data-aras-off', hidden.includes(x.id)));
      placeBar();
    };

    const setText = (before: string, after: string) => {
      const el = picked as HTMLElement | null;
      if (!el) return;
      const walker = d.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n: Node | null; const nodes: Text[] = [];
      while ((n = walker.nextNode())) nodes.push(n as Text);
      const hit = nodes.find((x) => norm(x.data) === before) ?? (nodes.length === 1 ? nodes[0] : null);
      if (hit) hit.data = after; else if (!el.children.length) el.textContent = after;
    };

    const on = (e: MessageEvent) => {
      if (e.origin !== location.origin) return;
      const m = e.data;
      if (m?.type === 'aras-theme') {
        st().textContent = String(m.css || '');
        const ln = d.getElementById('aras-font-live') as HTMLLinkElement | null;
        if (m.font) {
          const l = ln ?? Object.assign(d.createElement('link'), { id: 'aras-font-live', rel: 'stylesheet' });
          if (l.href !== m.font) l.href = m.font;
          if (!ln) d.head.appendChild(l);
        } else ln?.remove();
      } else if (m?.type === 'aras-edit') {
        edit = !!m.on;
        root.toggleAttribute('data-aras-edit', edit);
        if (!edit) { clear(); finishEdit(true); curSec = null; picked = null; d.querySelectorAll('.aras-sel').forEach((x) => x.classList.remove('aras-sel')); }
        placeBar();
      } else if (m?.type === 'aras-layout') applyLayout(m.order ?? [], m.hidden ?? []);
      else if (m?.type === 'aras-settext') setText(String(m.before), String(m.after));
    };
    window.addEventListener('message', on);
    window.addEventListener('scroll', placeBar, { passive: true });
    d.addEventListener('mouseover', over, true);
    d.addEventListener('click', click, true);
    d.addEventListener('dblclick', dbl, true);
    d.addEventListener('keydown', keydown, true);
    d.addEventListener('focusout', focusout, true);
    const block = (e: Event) => { if (edit) { e.preventDefault(); e.stopPropagation(); } };
    d.addEventListener('submit', block, true);
    post({ type: 'aras-ready' });
    return () => {
      window.removeEventListener('message', on); window.removeEventListener('scroll', placeBar);
      d.removeEventListener('mouseover', over, true); d.removeEventListener('click', click, true); d.removeEventListener('dblclick', dbl, true);
      d.removeEventListener('keydown', keydown, true); d.removeEventListener('focusout', focusout, true); d.removeEventListener('submit', block, true);
      bar.remove(); ind.remove(); ed.remove();
    };
  }, []);
  return null;
}
