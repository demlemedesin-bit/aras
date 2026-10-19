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

export default function ThemeLive() {
  useEffect(() => {
    if (window.parent === window) return;
    const d = document;
    let edit = false;
    let hover: Element | null = null;
    const st = () => {
      let s = d.getElementById('aras-theme-live') as HTMLStyleElement | null;
      if (!s) { s = d.createElement('style'); s.id = 'aras-theme-live'; d.head.appendChild(s); }
      return s;
    };
    let ed = d.getElementById('aras-edit-css') as HTMLStyleElement | null;
    if (!ed) { ed = d.createElement('style'); ed.id = 'aras-edit-css'; ed.textContent = '[data-aras-h]{outline:2px solid #2f81f7!important;outline-offset:-2px;cursor:crosshair!important}.aras-sel{outline:3px solid #f5a524!important;outline-offset:-3px}'; d.head.appendChild(ed); }
    const clear = () => { hover?.removeAttribute('data-aras-h'); hover = null; };
    const over = (e: MouseEvent) => {
      if (!edit) return;
      const t = e.target as Element;
      if (t === hover) return;
      clear(); hover = t; t.setAttribute('data-aras-h', '');
    };
    const click = (e: MouseEvent) => {
      if (!edit) return;
      e.preventDefault(); e.stopPropagation();
      const t = e.target as Element;
      d.querySelectorAll('.aras-sel').forEach((x) => x.classList.remove('aras-sel'));
      t.classList.add('aras-sel');
      const cs = getComputedStyle(t);
      const pick = (p: string) => cs.getPropertyValue(p);
      window.parent.postMessage({
        type: 'aras-pick', ...selectors(t),
        computed: { color: pick('color'), 'background-color': pick('background-color'), 'font-size': pick('font-size'), 'font-weight': pick('font-weight'), 'border-radius': pick('border-radius'), opacity: pick('opacity'), 'letter-spacing': pick('letter-spacing'), 'text-align': pick('text-align'), padding: pick('padding'), margin: pick('margin') },
      }, location.origin);
    };
    const block = (e: Event) => { if (edit) { e.preventDefault(); e.stopPropagation(); } };
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
        edit = !!m.on; if (!edit) { clear(); d.querySelectorAll('.aras-sel').forEach((x) => x.classList.remove('aras-sel')); }
        d.documentElement.style.setProperty('cursor', edit ? 'crosshair' : '');
      }
    };
    window.addEventListener('message', on);
    d.addEventListener('mouseover', over, true);
    d.addEventListener('click', click, true);
    d.addEventListener('submit', block, true);
    window.parent.postMessage({ type: 'aras-ready' }, location.origin);
    return () => { window.removeEventListener('message', on); d.removeEventListener('mouseover', over, true); d.removeEventListener('click', click, true); d.removeEventListener('submit', block, true); };
  }, []);
  return null;
}
