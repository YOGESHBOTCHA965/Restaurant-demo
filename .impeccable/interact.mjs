// Dev-only interaction check: node .impeccable/interact.mjs <url>
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const url = process.argv[2] || 'http://localhost:8000/';
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9334;
const proc = spawn(edge, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${join(tmpdir(), 'bp-cdp2')}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (targets.length) break; } catch {} await sleep(200); }
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map(); const errors = [];
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value || a.description).join(' '));
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); return r.result?.exceptionDetails ? 'EXC ' + r.result.exceptionDetails.exception?.description : r.result?.result?.value; };
await send('Runtime.enable'); await send('Page.enable'); await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url }); await sleep(1800);
const result = await evaluate(`(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const o={};
const sd=document.querySelector('[data-start-dish=chicken-tikka]');sd.dispatchEvent(new PointerEvent('pointerenter',{pointerType:'mouse'}));await w(700);
o.preview=document.querySelector('.hero-layer.is-current').dataset.layer+' | names '+[...document.querySelectorAll('.start-name')].map(n=>n.textContent).join(',');
document.querySelector('.start-board').dispatchEvent(new PointerEvent('pointerleave',{pointerType:'mouse'}));await w(100);o.back=document.querySelector('.hero-layer.is-current').dataset.layer;
sd.click();await w(400);o.boardPath=document.querySelector('.filter-button[aria-pressed=true]').textContent+' | '+[...document.querySelectorAll('.menu-item h4')].map(h=>h.textContent).join(',');
document.querySelector('.filter-button[data-category=all]').click();await w(100);
document.querySelector('.filter-button[data-category=soups]').click();await w(700);
o.soups=[...document.querySelectorAll('.menu-item h4')].map(h=>h.textContent).join(',')+' | photo '+document.getElementById('menu-photo').getAttribute('src');
const s=document.getElementById('menu-search');s.value='zzz';s.dispatchEvent(new Event('input'));o.empty=!document.getElementById('menu-empty').hidden;
document.getElementById('clear-search').click();await w(50);o.cleared=document.getElementById('menu-count').textContent;
document.querySelector('.oven-copy [data-menu-path=clay-oven]').click();await w(100);o.clay=[...document.querySelectorAll('.menu-item h4')].map(h=>h.textContent).join(',');
document.querySelector('[data-spice-button=chili]').click();await w(50);o.spice=document.getElementById('spice-name').textContent;
document.querySelector('.footer-row [data-open-editor]').click();await w(300);o.editor=document.getElementById('editor-dialog').open+' fields '+document.querySelectorAll('#basics-fields .form-field').length;
document.getElementById('close-editor').click();scrollTo(0,0);await w(200);o.nav=[...document.querySelectorAll('.desktop-nav [aria-current]')].map(a=>a.textContent).join(',');
document.getElementById('visit').scrollIntoView();await w(300);o.navVisit=[...document.querySelectorAll('.desktop-nav [aria-current]')].map(a=>a.textContent).join(',');
o.leaders=document.querySelectorAll('.dish-leader').length;
return JSON.stringify(o,null,1)})()`);
console.log(result);
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send('Page.navigate', { url }); await sleep(1500);
const mobile = await evaluate(`(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const o={};
const t=document.getElementById('mobile-toggle');t.click();await w(100);
o.open=!document.getElementById('mobile-nav').hidden+' '+t.getAttribute('aria-expanded');
document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));await w(100);
o.escClosed=document.getElementById('mobile-nav').hidden+' focus '+(document.activeElement===t);
t.click();document.querySelector('#mobile-nav a[href="#visit"]').click();await w(100);
o.linkClosed=document.getElementById('mobile-nav').hidden;
o.dirHref=document.querySelector('#mobile-nav [data-directions]').href;
o.tap=document.querySelector('[data-start-dish=daal-soup]').getBoundingClientRect().height;
return JSON.stringify(o)})()`);
console.log('mobile', mobile);
console.log('errors:', errors);
ws.close(); proc.kill(); process.exit(0);
