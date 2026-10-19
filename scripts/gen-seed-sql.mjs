// lib/data.ts + lib/i18n-data.json -> supabase/seed.sql
import fs from 'node:fs';
const d = JSON.parse(fs.readFileSync('lib/i18n-data.json', 'utf8'));
const q = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`);
const j = (o) => `${q(JSON.stringify(o))}::jsonb`;
const out = [];
// texts
const byKey = (ns, byLang) => {
  const m = {};
  for (const [lang, dict] of Object.entries(byLang)) for (const [k, v] of Object.entries(dict)) (m[k] ??= {})[lang] = v;
  for (const [k, v] of Object.entries(m)) out.push(`insert into site_texts(ns,key,value) values(${q(ns)},${q(k)},${j(v)}) on conflict do nothing;`);
};
byKey('t', d.t); byKey('ui', d.ui); byKey('auth', d.auth);
const meta = {}; for (const [l, v] of Object.entries(d.meta)) for (const [k, x] of Object.entries(v)) (meta[k] ??= {})[l] = x;
for (const [k, v] of Object.entries(meta)) out.push(`insert into site_texts(ns,key,value) values('meta',${q(k)},${j(v)}) on conflict do nothing;`);
out.push(`insert into site_settings(key,value) values('langs',${j(d.langs)}) on conflict do nothing;`);
const X = await import('../lib/data.ts');
X.COLLECTIONS.forEach((c, i) => out.push(`insert into site_collections values(${q(c.id)},${q(c.world)},${q(c.href)},${q(c.title)},${q(c.desc)},${c.count},${q(c.img)},${q(c.pos)},${c.subs ? `array[${c.subs.map(q)}]` : "'{}'"},${i},true) on conflict do nothing;`));
X.PRODUCTS.forEach((p, i) => out.push(`insert into site_products values(${q(p.id)},${q(p.code)},${q(p.name)},${q(p.cat)},${q(p.world)},${q(p.img)},${q(p.href)},${i},true) on conflict do nothing;`));
X.GALLERY_GROUPS.forEach((g, i) => {
  out.push(`insert into site_gallery_groups values(${q(g.id)},${q(g.label)},${i},true) on conflict do nothing;`);
  for (let n = 1; n <= g.count; n++) out.push(`insert into site_gallery_images(group_id,src,sort) values(${q(g.id)},${q(`/images/${g.prefix}-${n}.webp`)},${n});`);
});
X.NEWS.forEach((n, i) => out.push(`insert into site_news(href,date_key,year,head_key,badge_key,award,sort) values(${q(n.href)},${q(n.d || null)},${q(n.year)},${q(n.h)},${q(n.badge)},${!!n.award},${i});`));
X.PARTNERS.forEach((p, i) => out.push(`insert into site_partners(name,href,img,sort) values(${q(p.name)},${q(p.href)},${q(p.img)},${i});`));
out.push(`insert into site_settings(key,value) values('contact',${j(X.CONTACT)}),('hero',${j(X.HERO)}) on conflict do nothing;`);
fs.writeFileSync('supabase/seed.sql', out.join('\n') + '\n');
console.log(out.length, 'statements');
