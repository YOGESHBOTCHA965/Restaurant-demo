// Dev-only capture helper: node .impeccable/capture.mjs <url> <outDir>
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const url = process.argv[2] || 'http://localhost:8000/';
const out = process.argv[3] || '.impeccable/review';
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
mkdirSync(out, { recursive: true });
const port = 9333;
const proc = spawn(edge, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${join(tmpdir(), 'bp-cdp')}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (targets.length) break; } catch {} await sleep(200); }
const page = targets.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async expr => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;

const shots = [
  { name: 'desktop', width: 1440, height: 900, mobile: false },
  { name: 'tablet', width: 820, height: 1180, mobile: true },
  { name: 'mobile', width: 390, height: 844, mobile: true }
];
await send('Page.enable');
for (const s of shots) {
  await send('Emulation.setDeviceMetricsOverride', { width: s.width, height: s.height, deviceScaleFactor: 1, mobile: s.mobile });
  await send('Page.navigate', { url });
  await sleep(1500);
  await evaluate(`(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,80));}await new Promise(r=>setTimeout(r,1200));scrollTo(0,0);await new Promise(r=>setTimeout(r,900));return 1})()`);
  const brand = await evaluate(`JSON.stringify({signInView:document.documentElement.classList.contains('sign-in-view'),headerName:getComputedStyle(document.querySelector('.brand span')).opacity})`);
  const first = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: s.width, height: s.height, scale: 1 } });
  writeFileSync(join(out, s.name + '-first.png'), Buffer.from(first.result.data, 'base64'));
  const h = await evaluate('document.documentElement.scrollHeight');
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: s.width, height: h, scale: 1 } });
  writeFileSync(join(out, s.name + '.png'), Buffer.from(shot.result.data, 'base64'));
  const info = await evaluate(`JSON.stringify({h:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth>innerWidth,brand:${brand}})`);
  console.log(s.name, info);
}
ws.close(); proc.kill();
process.exit(0);
