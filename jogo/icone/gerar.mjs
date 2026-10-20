// Gera as imagens grandes do ícone a partir de icone.svg (precisa do Playwright: npx playwright).
// Depois: python3 jogo/icone/tamanhos.py cria os PNG do public/ (iOS, Android e favicon).
import { chromium } from 'playwright';
import fs from 'node:fs';
const svg=fs.readFileSync(new URL('icone.svg',import.meta.url),'utf8');
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1024}});
await p.setContent(`<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=block"><style>html,body{margin:0}svg{display:block}</style></head><body>${svg}</body></html>`);
await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
console.log('font loaded:',await p.evaluate(()=>document.fonts.check('700 100px Fredoka')));
await p.screenshot({path:new URL('icone-1024.png',import.meta.url).pathname});
// maskable: the drawing shrinks to 80% so a round mask on Android does not cut the star
await p.evaluate(()=>{const svg=document.querySelector('svg');const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('transform','translate(512 512) scale(.8) translate(-512 -512)');
  [...svg.children].filter(e=>!['defs','rect'].includes(e.tagName)||e.tagName==='rect'&&e.getAttribute('fill')!=='url(#bg)').forEach(e=>g.appendChild(e));svg.appendChild(g)});
await p.screenshot({path:new URL('icone-maskable-1024.png',import.meta.url).pathname});await b.close();
