// Capture step-by-step flow screens of the prototype via headless Chrome (CDP, no extra packages)
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


const setVal = (sel, val, idx = 0) => js(`(() => { const el = document.querySelectorAll(${JSON.stringify(sel)})[${idx}]; if (!el) return false; const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(val)}); el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); return true; })()`);
const vp = { full: false };

/* ---------- Login flow ---------- */
await load(`${BASE}/#/login`); await js(`sessionStorage.clear(); true`); await load(`${BASE}/#/login`);
await shot('login-1-empty', vp);
await js(`document.querySelector('.login form').requestSubmit(); true`); await sleep(400);
await shot('login-2-error', vp);
await setVal('.login input.input', 'editor01', 0); await setVal('.login input.input', 'demo1234', 1); await sleep(200);
await js(`document.querySelector('.login form').requestSubmit(); true`); await sleep(1500);
await shot('login-3-dashboard', vp);
await sleep(3500);

/* ---------- Dashboard flow ---------- */
await go('/');
await setVal('.dash-head select', 'กำหนดช่วงเวลา'); await sleep(400);
await shot('dash-1-date-range', vp);
await clickText('button', 'ดูทั้งหมด'); await sleep(500);
await shot('dash-2-view-all', vp);

/* ---------- Version flow ---------- */
await go('/content/1'); await clickText('button', 'ประวัติการแก้ไข'); await sleep(500);
await shot('version-1-history', vp);
await clickSel('.ver-table button[title="กู้คืนเวอร์ชันนี้"]'); await sleep(500);
await shot('version-2-confirm', vp);
await js(`(() => { const b = [...document.querySelectorAll('.modal button')].filter(x => x.textContent.trim() === 'กู้คืน').pop(); b?.click(); return !!b; })()`); await sleep(600);
await shot('version-3-recovered', vp);
await sleep(3500);

/* ---------- Social Campaign flow ---------- */
await go('/'); await go('/seo?tab=social'); await sleep(300);
await shot('social-1-list', vp);
await clickText('button', 'สร้างแคมเปญ'); await sleep(500);
await shot('social-2-create-empty', vp);
await setVal('.modal input.input', 'สินเชื่อบ้าน Home 1st Class', 0); await sleep(150);
await js(`(() => { [...document.querySelectorAll('.modal .chip-filter')].filter(b => ['Instagram', 'LINE'].includes(b.textContent.trim())).forEach(b => b.click()); return true; })()`); await sleep(150);
await setVal('.modal input.input', '/th/personal/loan/home-loan', 1); await sleep(150);
await setVal('.modal select', 'paid_social'); await sleep(150);
await setVal('.modal input[type=date]', '2026-12-01', 0); await setVal('.modal input[type=date]', '2027-01-31', 1); await sleep(150);
await js(`(() => { const i = [...document.querySelectorAll('.modal input.input')].find(x => x.placeholder.startsWith('ไม่กรอก')); if (i) { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, 'สินเชื่อบ้านใหม่ ดอกเบี้ยพิเศษ'); i.dispatchEvent(new Event('input', { bubbles: true })); } return true; })()`); await sleep(300);
await shot('social-3-create-filled', vp);
await js(`(() => { const b = [...document.querySelectorAll('.modal button')].find(x => x.textContent.includes('บันทึกและใช้งาน')); b?.click(); return !!b; })()`); await sleep(700);
await shot('social-4-saved', vp);
await sleep(3500);

/* ---------- Dynamic Form flow ---------- */
await go('/form/dashboard'); await sleep(300);
await shot('form-1-dashboard');
await go('/form/builder'); await shot('form-2-builder-list', vp);
await go('/form/builder/card'); await sleep(300);
await shot('form-3-builder-edit', vp);
await clickText('button', 'เพิ่มช่อง'); await sleep(300);
await js(`(() => { const set = (el, v) => { const p = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(p, 'value').set.call(el, v); el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); };
  let r = [...document.querySelectorAll('.fb-field:not(.locked)')].pop(); set(r.querySelector('input.input'), 'อาชีพ'); return true; })()`); await sleep(150);
await js(`(() => { const r = [...document.querySelectorAll('.fb-field:not(.locked)')].pop(); const s = r.querySelector('select'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, 'select'); s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`); await sleep(150);
await js(`(() => { const r = [...document.querySelectorAll('.fb-field:not(.locked)')].pop(); const t = r.querySelector('textarea'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(t, ['พนักงานบริษัท', 'เจ้าของกิจการ', 'ข้าราชการ'].join(String.fromCharCode(10))); t.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`); await sleep(150);
await js(`(() => { const r = [...document.querySelectorAll('.fb-field:not(.locked)')].pop(); r.querySelectorAll('input[type=checkbox]')[1].click(); r.scrollIntoView({ block: 'center' }); return true; })()`); await sleep(400);
await js(`window.scrollTo(0, 420); true`); await sleep(300);
await send('Page.captureScreenshot', { format: 'png' }).then(({ result }) => { writeFileSync(join(OUT, 'form-4-builder-add-field.png'), Buffer.from(result.data, 'base64')); console.log('form-4-builder-add-field.png'); });
await js(`window.scrollTo(0, 0); true`);
await clickText('button', 'เผยแพร่'); await sleep(800);
await shot('form-5-published', vp);
await sleep(3500);
await go('/form?form=card'); await sleep(300);
await go('/'); await go('/form?form=card'); await sleep(300);
await shot('form-6-submissions-new-column', vp);
await clickSel('button[title="ดูรายละเอียด"]'); await sleep(500);
await shot('form-7-detail', vp);
await clickText('.drawer button, button', 'แสดงข้อมูลเต็ม'); await sleep(500);
await shot('form-8-detail-revealed', vp);

ws.close(); chrome.kill();
await sleep(300);
try { rmSync(PROFILE, { recursive: true, force: true }); } catch { /* ignore */ }
console.log('done');
