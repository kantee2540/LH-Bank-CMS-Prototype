// Capture every CMS screen of the prototype via headless Chrome (CDP, no extra packages)
// Usage: npm run dev -- --port 5190  แล้วรัน  node scripts/capture-screens.mjs docs/screenshots/backoffice http://localhost:5190 /tmp/lh-chrome-profile
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const [, , OUT, BASE = 'http://localhost:5190', PROFILE] = process.argv;
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const W = 1440, H = 900;

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=9333', `--user-data-dir=${PROFILE}`,
  `--window-size=${W},${H}`, '--force-device-scale-factor=1', '--no-first-run', '--no-default-browser-check', 'about:blank',
], { stdio: 'ignore' });

let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try { target = (await (await fetch('http://127.0.0.1:9333/json/list')).json()).find((t) => t.type === 'page'); } catch { /* not up yet */ }
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res) => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
const js = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;
const metrics = (height) => send('Emulation.setDeviceMetricsOverride', { width: W, height, deviceScaleFactor: 1, mobile: false });

await send('Page.enable'); await send('Runtime.enable'); await metrics(H);
const load = async (url) => { await send('Page.navigate', { url }); await sleep(1800); };
const go = async (route) => { await js(`location.hash = '#${route}'; window.scrollTo(0,0); true`); await sleep(1100); };
// รอให้รูปโหลดครบ
const imgs = () => js(`Promise.all([...document.images].filter(i => !i.complete).map(i => new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 3000); })))`);

const shots = [];
async function shot(name, { full = true } = {}) {
  await imgs();
  const h = full ? Math.min(6000, Math.max(H, await js(`Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)`))) : H;
  await metrics(h); await sleep(400);
  const { result } = await send('Page.captureScreenshot', { format: 'png' });
  const file = `${String(shots.length + 1).padStart(2, '0')}-${name}.png`;
  writeFileSync(join(OUT, file), Buffer.from(result.data, 'base64'));
  shots.push({ file, height: h });
  await metrics(H);
  console.log(file, h);
}
const clickText = (sel, text) => js(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find(e => e.textContent.trim().includes(${JSON.stringify(text)})); if (el) el.click(); return !!el; })()`);
const clickSel = (sel) => js(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (el) el.click(); return !!el; })()`);

/* ---------- Login ---------- */
await load(`${BASE}/#/login`);
await js(`sessionStorage.clear(); true`);
await load(`${BASE}/#/login`);
await shot('login', { full: false });
await js(`sessionStorage.setItem('lh-cms-authed','1'); location.hash = '#/'; true`);
await send('Page.reload'); await sleep(2000);

/* ---------- Content Editor ---------- */
const EDITOR = [
  ['/', 'dashboard'],
  ['/requests', 'my-requests'],
  ['/seo', 'seo-general'], ['/seo?tab=advanced', 'seo-advanced'], ['/seo?tab=aeo', 'seo-aeo'], ['/seo?tab=schema', 'seo-schema'], ['/seo?tab=social', 'seo-social-campaign'],
  ['/menu/location', 'menu-location'], ['/menu/set', 'menu-set'], ['/menu/set/header-personal', 'menu-set-edit'],
  ['/media', 'media'],
  ['/banner/hero', 'banner-hero'], ['/banner/hero/h1', 'banner-hero-edit'], ['/banner/promotion', 'banner-promotion'],
  ['/layout', 'page-builder-layout'], ['/layout/home', 'page-builder-layout-edit'],
  ['/content', 'page-builder-content'], ['/content/1', 'page-builder-content-edit'],
  ['/news', 'page-builder-news'], ['/news/n1', 'page-builder-news-edit'],
  ['/advisory', 'page-builder-advisory'], ['/advisory/a1', 'page-builder-advisory-edit'],
  ['/path', 'path-structure'],
  ['/products/loan', 'products-loan'], ['/products/loan/hl-new', 'products-loan-edit'], ['/products/deposit', 'products-deposit'],
  ['/life-stage', 'life-stage'],
  ['/rates/interest', 'rates-interest'], ['/rates/exchange', 'rates-exchange'], ['/rates/calculator', 'rates-calculator'], ['/rates/calculator/home-1st-class', 'rates-calculator-edit'],
  ['/npa', 'npa'], ['/npa/npa-0101', 'npa-edit'],
  ['/form/dashboard', 'form-dashboard'], ['/form', 'form-submissions'], ['/form/builder', 'form-builder'], ['/form/builder/card', 'form-builder-edit'],
  ['/faq', 'faq'], ['/faq/f1', 'faq-edit'],
  ['/files', 'file-manager'],
  ['/ai', 'ai-assistants'], ['/ai/writer', 'ai-workspace'], ['/ai/writer/settings', 'ai-settings'],
  ['/trash', 'recycle-bin'],
  ['/setting/users', 'setting-users'], ['/setting/audit', 'setting-audit-log'], ['/setting/language', 'setting-language'], ['/setting/revision', 'setting-revision'],
];
for (const [route, name] of EDITOR) {
  // บางหน้าอ่าน ?tab ตอน mount เท่านั้น — กลับหน้าแรกก่อนเพื่อ remount
  if (route.includes('?')) await go('/');
  await go(route);
  await shot(name);
}

/* ---------- Popups สำคัญ ---------- */
await go('/'); await clickText('button', 'ดูทั้งหมด'); await sleep(500); await shot('popup-dashboard-view-all', { full: false });
await go('/content/1'); await clickText('button', 'ประวัติการแก้ไข'); await sleep(500); await shot('popup-version-history', { full: false });
await go('/'); await go('/seo?tab=social'); await clickText('button', 'สร้างแคมเปญ'); await sleep(500); await shot('popup-social-campaign-create', { full: false });
await go('/form'); await clickSel('button[title="ดูรายละเอียด"]'); await sleep(500); await shot('popup-form-submission-detail', { full: false });

/* ---------- Auditor (สลับบทบาทจากปุ่มบน Top bar) ---------- */
await go('/');
await clickSel('button.role-chip');
await sleep(4500); // รอ Toast หายก่อนถ่าย
for (const [route, name] of [['/', 'auditor-dashboard'], ['/approval', 'auditor-approval-inbox'], ['/approval/r1', 'auditor-approval-review'], ['/approval/history', 'auditor-approval-history']]) {
  await go(route); await shot(name);
}

writeFileSync(join(OUT, 'index.json'), JSON.stringify(shots, null, 2));
ws.close(); chrome.kill();
await sleep(300);
try { rmSync(PROFILE, { recursive: true, force: true }); } catch { /* ignore */ }
console.log('done', shots.length);
