/* ================= Helpers for questions ================= */
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const C=(v,html,say)=>({v:String(v),html:html==null?String(v):html,say:say==null?String(v):say});
const fmt=n=>typeof n==='number'?n.toLocaleString('pt-BR',{maximumFractionDigits:4}):String(n);
const fI=n=>n<0?`−${fmt(-n)}`:fmt(n);
const N=v=>C(v,fmt(v));
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const gcdf=(a,b)=>b?gcdf(b,a%b):Math.abs(a);
const isPrime=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true};
const small=(...xs)=>xs.every(x=>Number.isInteger(x)&&x>=0&&x<=100);

// color-mix is missing on older Safari (iOS 12): compute the blend in JS there
const MIXOK=(()=>{try{return CSS.supports('color','color-mix(in srgb, red 50%, white)')}catch(e){return false}})();
const HEXC={'--red':'#EF476F','--orange':'#F7882F','--yellow':'#FFC53D','--green':'#22A867','--teal':'#11A89A','--blue':'#3A78F2','--purple':'#8B5CF6','--pink':'#E8559F','--ink':'#1E2843','--ok':'#22A867','--card':'#FFFFFF'};
let CURHEX='#7F9CD8';
const hexOf=c=>{const m=/var\((--[a-z]+)\)/.exec(c);return m?(m[1]==='--c'?CURHEX:(HEXC[m[1]]||'#7F9CD8')):c};
function mixc(c,p,b){b=b==='var(--card)'?'#fff':b;if(MIXOK)return `color-mix(in srgb,${c} ${p}%,${b})`;
  const rgb=s=>{s=hexOf(s);if(s.length===4)s='#'+s[1]+s[1]+s[2]+s[2]+s[3]+s[3];return[1,3,5].map(i=>parseInt(s.substr(i,2),16))};
  const A=rgb(c),B=rgb(b);return 'rgb('+A.map((v,i)=>Math.round(v*p/100+B[i]*(1-p/100))).join(',')+')'}
const THINGS=[{e:'🍎',n:'maçãs',f:1},{e:'⭐',n:'estrelas',f:1},{e:'🐞',n:'joaninhas',f:1},{e:'🌸',n:'flores',f:1},{e:'🐟',n:'peixinhos',f:0},{e:'🍓',n:'morangos',f:0},{e:'🎈',n:'balões',f:0},{e:'🐥',n:'pintinhos',f:0},{e:'🍪',n:'biscoitos',f:0},{e:'🦋',n:'borboletas',f:1},{e:'🎤',n:'microfones',f:0},{e:'🐶',n:'cachorrinhos',f:0},{e:'🤠',n:'chapéus',f:0}];
const qnt=t=>t.f?'Quantas':'Quantos';
function numChoices(ans,o){
  o=o||{};const min=o.min!=null?o.min:0,max=o.max!=null?o.max:Infinity,n=o.n||4;
  const s=new Set([ans]);
  for(const d of shuf(o.offs||[-3,-2,-1,1,2,3])){if(s.size>=n)break;const x=ans+d;if(x>=min&&x<=max)s.add(x)}
  let k=3;while(s.size<n&&k<200){const x=ans+R(-k,k);if(x>=min&&x<=max)s.add(x);k++}
  return shuf([...s]).map(v=>N(v));
}
// unique options that always include the answer; mk turns a value into a choice
function opts(ans,cands,mk=N,n=4){const s=[ans];for(const c of cands){if(s.length>=n)break;if(c===undefined||c===null||(typeof c==='number'&&(!isFinite(c)||c<0)))continue;if(!s.some(x=>String(x)===String(c)))s.push(c)}
  let k=1;while(s.length<Math.min(n,3)&&typeof ans==='number'&&k<50){const c=ans+k;if(!s.includes(c))s.push(c);k++}
  return shuf(s).map(mk)}
const sOpts=(ans,cands,n=4)=>opts(ans,cands,x=>C(x,x,x),n);
const objs=(n,e,cross=0,cols)=>`<div class="objs" style="--cols:${cols||Math.min(5,Math.max(n,1))}">${Array.from({length:n},(_,i)=>`<span class="obj${i>=n-cross?' gone':''}">${e}</span>`).join('')}</div>`;
const eq=s=>`<div class="eq">${s.replace(/\?/g,'<span class="hole">?</span>').replace(/○/g,'<span class="hole">&nbsp;</span>')}</div>`;
const sayEq=s=>s.replace(/\?/g,' quanto ').replace(/\+/g,' mais ').replace(/−/g,' menos ').replace(/×/g,' vezes ').replace(/÷/g,' dividido por ').replace(/=/g,' é igual a ').replace(/○/g,' qual sinal ').replace(/\s+/g,' ').trim();
const rods=g=>`<div class="rods">${Array.from({length:g},()=>`<div class="rod">${'<i></i>'.repeat(10)}</div>`).join('')}</div>`;
const pv=n=>`<div class="pv">${Math.floor(n/10)?rods(Math.floor(n/10)):''}${n%10?`<div class="cubes">${'<span class="cube"></span>'.repeat(n%10)}</div>`:''}</div>`;
const NUMW=['zero','um','dois','três','quatro','cinco','seis','sete','oito','nove'];
const DEN={2:['meio','meios'],3:['terço','terços'],4:['quarto','quartos'],5:['quinto','quintos'],6:['sexto','sextos'],7:['sétimo','sétimos'],8:['oitavo','oitavos'],9:['nono','nonos'],10:['décimo','décimos'],100:['centésimo','centésimos']};
const fracHTML=(k,n)=>`<span class="frac"><span>${k}</span><span>${n}</span></span>`;
const fracSay=(k,n)=>DEN[n]?`${k} ${DEN[n][k===1?0:1]}`:`${k} sobre ${n}`;
const fracC=(k,n)=>C(`${k}/${n}`,fracHTML(k,n),fracSay(k,n));
function fracChoices(k,n){
  const s=new Map();const add=(a,b)=>{if(a>=1&&b>=2&&a<b&&DEN[b])s.set(`${a}/${b}`,[a,b])};
  add(k,n);
  for(const [a,b] of shuf([[n-k,n],[k,n+1],[k,n-1],[k+1,n],[k-1,n],[k,n+2],[1,n===2?3:2]])){if(s.size>=4)break;add(a,b)}
  return shuf([...s.values()]).map(([a,b])=>fracC(a,b));
}
const red=(n,d)=>{const g=gcdf(n,d)||1;return[n/g,d/g]};
const fv=(n,d)=>{const[x,y]=red(n,d);return `${x}/${y}`};
const fH=(n,d)=>{const[x,y]=red(n,d);return y===1?String(x):fracHTML(x,y)};
const fS=(n,d)=>{const[x,y]=red(n,d);return y===1?String(x):fracSay(x,y)};
// fraction options compared by value (reduced display), or raw display compared by value or by text
function fOpts(a,cands){const out=[red(...a)];const val=x=>x[0]/x[1];for(const c of cands){if(out.length>=4)break;if(!c||c[1]<=0||c[0]<0||!Number.isInteger(c[0])||!Number.isInteger(c[1]))continue;const r=red(...c);if(!out.some(o=>Math.abs(val(o)-val(r))<1e-9))out.push(r)}
  let k=1;while(out.length<3){const r=red(out[0][0]+k,out[0][1]);if(!out.some(o=>Math.abs(val(o)-val(r))<1e-9))out.push(r);k++}
  return shuf(out).map(([n,d])=>C(`${n}/${d}`,fH(n,d),fS(n,d)))}
function fOptsRaw(a,cands,mode='val'){const out=[a];const val=x=>x[0]/x[1];const same=(x,y)=>mode==='val'?Math.abs(val(x)-val(y))<1e-9:(x[0]===y[0]&&x[1]===y[1]);
  for(const c of cands){if(out.length>=4)break;if(!c||c[1]<=0||c[0]<0||!Number.isInteger(c[0])||!Number.isInteger(c[1]))continue;if(!out.some(o=>same(o,c)))out.push(c)}
  let k=1;while(out.length<3){const c=[a[0]+k,a[1]];if(!out.some(o=>same(o,c)))out.push(c);k++}
  return shuf(out).map(([n,d])=>C(`${n}/${d}`,fracHTML(n,d),fracSay(n,d)))}
function pie(n,k,col){
  let p='';const cx=50,cy=50,r=44;
  for(let i=0;i<n;i++){const a0=-Math.PI/2+i*2*Math.PI/n,a1=a0+2*Math.PI/n;
    p+=`<path class="part" d="M${cx} ${cy} L${(cx+r*Math.cos(a0)).toFixed(2)} ${(cy+r*Math.sin(a0)).toFixed(2)} A${r} ${r} 0 0 1 ${(cx+r*Math.cos(a1)).toFixed(2)} ${(cy+r*Math.sin(a1)).toFixed(2)} Z" style="fill:${i<k?col:'var(--card)'}"/>`}
  return `<svg viewBox="0 0 100 100" class="fig" aria-hidden="true">${p}</svg>`;
}
function bar(n,k,col){
  const w=96/n;let p='';
  for(let i=0;i<n;i++)p+=`<rect class="part" x="${(2+i*w).toFixed(2)}" y="2" width="${w.toFixed(2)}" height="36" style="fill:${i<k?col:'var(--card)'}"/>`;
  return `<svg viewBox="0 0 100 40" class="fig" style="width:min(320px,80vw)" aria-hidden="true">${p}</svg>`;
}
function grid100(k,col){let p='';for(let i=0;i<100;i++)p+=`<rect class="part" style="stroke-width:1;fill:${i<k?col:'var(--card)'}" x="${2+(i%10)*10}" y="${2+Math.floor(i/10)*10}" width="10" height="10"/>`;return `<svg viewBox="0 0 104 104" class="fig" aria-hidden="true">${p}</svg>`}
const regPoly=(n,r=44,cx=50,cy=52)=>Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;return `${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)}`}).join(' ');
const SHAPES={
  'círculo':{s:0,d:'<circle cx="50" cy="50" r="42"/>'},
  'quadrado':{s:4,d:'<rect x="12" y="12" width="76" height="76" rx="3"/>'},
  'retângulo':{s:4,d:'<rect x="4" y="26" width="92" height="48" rx="3"/>'},
  'triângulo':{s:3,d:`<polygon points="${regPoly(3,46,50,58)}"/>`},
  'pentágono':{s:5,d:`<polygon points="${regPoly(5,46)}"/>`},
  'hexágono':{s:6,d:`<polygon points="${regPoly(6,46,50,50)}"/>`},
  'losango':{s:4,d:'<polygon points="50,4 86,50 50,96 14,50"/>'},
  'oval':{s:0,d:'<ellipse cx="50" cy="50" rx="46" ry="28"/>'}
};
const COLS=['var(--red)','var(--orange)','var(--yellow)','var(--green)','var(--teal)','var(--blue)','var(--purple)','var(--pink)'];
const shapeSVG=(name,col,cls='fig')=>`<svg viewBox="0 0 100 100" class="${cls}" aria-hidden="true"><g class="part" style="fill:${col}">${SHAPES[name].d}</g></svg>`;
const SOLIDS={
  'cubo':c=>`<polygon class="part" points="18,36 34,20 82,20 66,36" style="fill:${mixc(c,60,'#fff')}"/><polygon class="part" points="66,36 82,20 82,68 66,84" style="fill:${mixc(c,75,'#000')}"/><rect class="part" x="18" y="36" width="48" height="48" style="fill:${c}"/>`,
  'esfera':c=>`<circle class="part" cx="50" cy="52" r="38" style="fill:${c}"/><ellipse cx="50" cy="52" rx="38" ry="10" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2" stroke-dasharray="5 4"/><circle cx="37" cy="38" r="7" fill="rgba(255,255,255,.6)"/>`,
  'cilindro':c=>`<path class="part" d="M24 24 V78 A26 8 0 0 0 76 78 V24Z" style="fill:${c}"/><ellipse class="part" cx="50" cy="24" rx="26" ry="8" style="fill:${mixc(c,55,'#fff')}"/>`,
  'cone':c=>`<path class="part" d="M50 10 L22 78 A28 9 0 0 0 78 78 Z" style="fill:${c}"/>`,
  'pirâmide':c=>`<polygon class="part" points="50,10 16,78 60,90" style="fill:${c}"/><polygon class="part" points="50,10 60,90 86,72" style="fill:${mixc(c,70,'#000')}"/>`
};
const PRISM=c=>`<polygon class="part" points="14,80 50,80 32,48" style="fill:${c}"/><polygon class="part" points="50,80 86,62 68,30 32,48" style="fill:${mixc(c,70,'#000')}"/><polygon class="part" points="32,48 68,30 50,30 14,48" style="fill:none;stroke-dasharray:4 4"/><line class="part" x1="32" y1="48" x2="68" y2="30"/>`;
const solidSVG=(name,col)=>`<svg viewBox="0 0 100 100" class="fig sm" aria-hidden="true">${SOLIDS[name](col)}</svg>`;
function numberLine(start,miss,step=1){
  let t='<line x1="10" y1="40" x2="630" y2="40"/><path d="M630 40 l-12 -8 M630 40 l-12 8 M10 40 l12 -8 M10 40 l12 8" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>';
  for(let i=0;i<=10;i++){const x=30+i*58;const lab=fI(start+i*step);const fs=lab.length>4?16:lab.length>3?19:24;t+=`<line x1="${x}" y1="29" x2="${x}" y2="51"/>`;
    t+=i===miss?`<rect class="nlhole" x="${x-24}" y="58" width="48" height="36" rx="9"/><text class="q" x="${x}" y="86" font-size="26">?</text>`:`<text x="${x}" y="84" font-size="${fs}">${lab}</text>`}
  return `<svg viewBox="0 0 640 100" class="nl" aria-hidden="true">${t}</svg>`;
}
function ruler(len,col){
  const s=54,x0=24;let t='';
  for(let i=0;i<=20;i++){const x=x0+i*s/2;t+=`<line x1="${x}" y1="64" x2="${x}" y2="${i%2?72:80}" style="stroke-width:${i%2?2:3}"/>`;if(i%2===0)t+=`<text x="${x}" y="102" font-size="20">${i/2}</text>`}
  const end=x0+len*s;
  return `<svg viewBox="0 0 588 114" class="ruler" aria-hidden="true">
    <path d="M${x0} 22 H${end-18} L${end} 36 L${end-18} 50 H${x0} Z" style="fill:${col}" stroke="var(--ink)" stroke-width="2.5"/>
    <rect x="${x0+6}" y="28" width="${Math.max(8,len*s-40)}" height="6" rx="3" fill="rgba(255,255,255,.45)"/>
    <rect class="rbody" x="6" y="60" width="576" height="50" rx="6"/>${t}</svg>`;
}
const BALLC={vermelha:'var(--red)',azul:'var(--blue)',verde:'var(--green)',amarela:'var(--yellow)'};
const bag=list=>`<div class="bag">${shuf(list).map(c=>`<i class="ball" style="background:${BALLC[c]}"></i>`).join('')}</div>`;
const ballC=(c,html)=>C(c,`<i class="ball" style="background:${BALLC[c]}"></i><span>${html||c}</span>`,c);

/* ---- extra drawings ---- */
function angleSVG(deg){
  const V=[110,118],r=95,rad=deg*Math.PI/180,x2=V[0]+r*Math.cos(rad),y2=V[1]-r*Math.sin(rad);
  let mark;
  if(deg===90)mark=`<path class="hl" d="M${V[0]} ${V[1]-22} H${V[0]+22} V${V[1]}" style="stroke-width:3"/>`;
  else{const a=26,ex=V[0]+a*Math.cos(rad),ey=V[1]-a*Math.sin(rad);mark=`<path class="hl" style="stroke-width:3" d="M${V[0]+a} ${V[1]} A${a} ${a} 0 ${deg>180?1:0} 0 ${ex.toFixed(1)} ${ey.toFixed(1)}"/>`}
  return `<svg viewBox="0 0 220 130" class="fig md" aria-hidden="true"><line class="ln" x1="${V[0]}" y1="${V[1]}" x2="${V[0]+r}" y2="${V[1]}"/><line class="ln" x1="${V[0]}" y1="${V[1]}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>${mark}<circle cx="${V[0]}" cy="${V[1]}" r="4" fill="var(--ink)"/></svg>`;
}
function lineSVG(kind){
  const rot=R(-25,25);let l;
  if(kind==='paralelas')l=`<line class="ln" x1="20" y1="45" x2="180" y2="45"/><line class="ln" x1="20" y1="95" x2="180" y2="95"/>`;
  else if(kind==='perpendiculares')l=`<line class="ln" x1="100" y1="8" x2="100" y2="132"/><line class="ln" x1="25" y1="70" x2="175" y2="70"/><path class="hl" style="stroke-width:3" d="M100 56 H114 V70"/>`;
  else l=`<line class="ln" x1="20" y1="25" x2="180" y2="115"/><line class="ln" x1="20" y1="105" x2="180" y2="40"/>`;
  return `<svg viewBox="0 0 200 140" class="fig md" aria-hidden="true"><g transform="rotate(${rot} 100 70)">${l}</g></svg>`;
}
const QUADS={quadrado:'<rect x="30" y="12" width="66" height="66"/>',retângulo:'<rect x="8" y="22" width="104" height="48"/>',losango:'<polygon points="60,4 104,45 60,86 16,45"/>',paralelogramo:'<polygon points="34,18 112,18 86,72 8,72"/>',trapézio:'<polygon points="38,18 82,18 112,72 8,72"/>'};
const quadSVG=(nm,col)=>`<svg viewBox="0 0 120 90" class="fig md" aria-hidden="true"><g class="part" style="fill:${col}">${QUADS[nm]}</g></svg>`;
const polySVG=(n,col)=>`<svg viewBox="0 0 100 100" class="fig" aria-hidden="true"><polygon class="part" style="fill:${col}" points="${regPoly(n,46,50,50)}"/></svg>`;
function circlePartSVG(part){
  let h='';
  if(part==='raio')h='<line class="hl" x1="60" y1="60" x2="108" y2="60"/>';
  else if(part==='diâmetro')h='<line class="hl" x1="12" y1="60" x2="108" y2="60"/>';
  else if(part==='circunferência')h='<circle class="hl" cx="60" cy="60" r="48"/>';
  else h='<circle cx="60" cy="60" r="7" style="fill:var(--c)"/>';
  return `<svg viewBox="0 0 120 120" class="fig" aria-hidden="true"><circle cx="60" cy="60" r="48" fill="var(--card)" class="ln" style="stroke-width:2.5"/><circle cx="60" cy="60" r="3" fill="var(--ink)"/>${h}</svg>`;
}
function rectSVG(w,h,u='cm'){const s=Math.min(180/w,100/h),W=w*s,H=h*s,x=(240-W)/2,y=12;return `<svg viewBox="0 0 240 ${H+50}" class="fig wide" aria-hidden="true"><rect class="part" x="${x}" y="${y}" width="${W}" height="${H}" style="fill:${mixc('var(--c)',22,'var(--card)')}"/><text class="lbl" x="${x+W/2}" y="${y+H+22}">${w} ${u}</text><text class="lbl" x="${x+W+8}" y="${y+H/2+5}" text-anchor="start" style="text-anchor:start">${h} ${u}</text></svg>`}
function gridArea(w,h){const s=26;let p='';for(let i=0;i<w;i++)for(let j=0;j<h;j++)p+=`<rect class="part" style="stroke-width:1.5;fill:${mixc('var(--c)',35,'var(--card)')}" x="${4+i*s}" y="${4+j*s}" width="${s}" height="${s}"/>`;return `<svg viewBox="0 0 ${w*s+8} ${h*s+8}" class="fig" style="width:min(${w*34}px,80vw)" aria-hidden="true">${p}</svg>`}
function triSVG(b,h,u='cm'){const s=Math.min(170/b,100/h),B=b*s,Hh=h*s,x=30,y=Hh+14,ax=x+B*.35;return `<svg viewBox="0 0 240 ${Hh+48}" class="fig wide" aria-hidden="true"><polygon class="part" style="fill:${mixc('var(--c)',22,'var(--card)')}" points="${x},${y} ${x+B},${y} ${ax},${y-Hh}"/><line class="ln" style="stroke-dasharray:6 5;stroke-width:2" x1="${ax}" y1="${y-Hh}" x2="${ax}" y2="${y}"/><text class="lbl" x="${x+B/2}" y="${y+22}">base ${b} ${u}</text><text class="lbl" x="${ax+6}" y="${y-Hh/2}" style="text-anchor:start">altura ${h} ${u}</text></svg>`}
function parSVG(b,h,u='cm'){const s=Math.min(150/b,100/h),B=b*s,Hh=h*s,x=20,y=Hh+14,o=30;return `<svg viewBox="0 0 240 ${Hh+48}" class="fig wide" aria-hidden="true"><polygon class="part" style="fill:${mixc('var(--c)',22,'var(--card)')}" points="${x},${y} ${x+B},${y} ${x+B+o},${y-Hh} ${x+o},${y-Hh}"/><line class="ln" style="stroke-dasharray:6 5;stroke-width:2" x1="${x+o}" y1="${y-Hh}" x2="${x+o}" y2="${y}"/><text class="lbl" x="${x+B/2}" y="${y+22}">base ${b} ${u}</text><text class="lbl" x="${x+o+6}" y="${y-Hh/2}" style="text-anchor:start">altura ${h} ${u}</text></svg>`}
function boxSVG(l,w,h,u='cm'){const s=Math.min(110/(l+w*.6),90/(h+w*.4)),L=l*s,H=h*s,D=w*s*.6,x=24,y=D+14;return `<svg viewBox="0 0 250 ${H+D+52}" class="fig wide" aria-hidden="true"><polygon class="part" style="fill:${mixc('var(--c)',45,'#fff')}" points="${x},${y} ${x+D},${y-D} ${x+L+D},${y-D} ${x+L},${y}"/><polygon class="part" style="fill:${mixc('var(--c)',65,'#000')}" points="${x+L},${y} ${x+L+D},${y-D} ${x+L+D},${y+H-D} ${x+L},${y+H}"/><rect class="part" style="fill:var(--c)" x="${x}" y="${y}" width="${L}" height="${H}"/><text class="lbl" x="${x+L/2}" y="${y+H+22}">${l} ${u}</text><text class="lbl" x="${x+L+D+8}" y="${y+H/2-D/2}" style="text-anchor:start">${h} ${u}</text><text class="lbl" x="${x+L+D/2+6}" y="${y-D/2-6}" style="text-anchor:start">${w} ${u}</text></svg>`}
function thermoSVG(t,min,max,step){const top=16,bot=176,y=v=>bot-(v-min)/(max-min)*(bot-top);let ticks='';for(let v=min;v<=max;v+=step/ (step>=10?2:1)){const maj=(v-min)%step===0;ticks+=`<line class="ln" style="stroke-width:${maj?2.5:1.5}" x1="66" y1="${y(v)}" x2="${maj?80:74}" y2="${y(v)}"/>`;if(maj)ticks+=`<text class="lbl" x="84" y="${y(v)+5}" style="text-anchor:start">${fI(v)}</text>`}
  return `<svg viewBox="0 0 130 214" class="fig" style="width:130px" aria-hidden="true"><rect x="44" y="8" width="22" height="178" rx="11" fill="var(--card)" class="ln" style="stroke-width:2.5"/><circle cx="55" cy="192" r="17" fill="var(--red)" class="ln" style="stroke-width:2.5"/><rect x="50" y="${y(t)}" width="10" height="${192-y(t)}" fill="var(--red)"/>${ticks}<text class="lbl" x="10" y="20" style="text-anchor:start">°C</text></svg>`}
function clockSVG(h,m){const cx=80,cy=80;let n='';for(let i=1;i<=12;i++){const a=(i*30-90)*Math.PI/180;n+=`<text class="lbl" style="font-size:16px" x="${(cx+57*Math.cos(a)).toFixed(1)}" y="${(cy+57*Math.sin(a)+6).toFixed(1)}">${i}</text>`}
  const ha=((h%12)+m/60)*30-90,ma=m*6-90,pt=(a,l)=>`${(cx+l*Math.cos(a*Math.PI/180)).toFixed(1)} ${(cy+l*Math.sin(a*Math.PI/180)).toFixed(1)}`;
  return `<svg viewBox="0 0 160 160" class="fig" aria-hidden="true"><circle cx="80" cy="80" r="74" fill="var(--card)" class="ln" style="stroke-width:5"/>${n}<line class="ln" style="stroke-width:6" x1="80" y1="80" x2="${pt(ha,34).split(' ')[0]}" y2="${pt(ha,34).split(' ')[1]}"/><line class="ln" style="stroke-width:4;stroke:var(--c)" x1="80" y1="80" x2="${pt(ma,52).split(' ')[0]}" y2="${pt(ma,52).split(' ')[1]}"/><circle cx="80" cy="80" r="5" fill="var(--ink)"/></svg>`}
function coordSVG(min,max,items){const n=max-min,s=Math.min(36,300/n),pad=26,W=n*s+pad*2;const X=v=>pad+(v-min)*s,Y=v=>pad+(max-v)*s;let g='';
  for(let v=min;v<=max;v++){g+=`<line x1="${X(v)}" y1="${Y(min)}" x2="${X(v)}" y2="${Y(max)}" stroke="var(--line)" stroke-width="1.5"/><line x1="${X(min)}" y1="${Y(v)}" x2="${X(max)}" y2="${Y(v)}" stroke="var(--line)" stroke-width="1.5"/>`;
    g+=`<text class="lbl" style="font-size:12px" x="${X(v)}" y="${(min<0?Y(0):Y(min))+16}">${v===0&&min<0?'':fI(v)}</text>`;if(v!==0||min>=0)g+=`<text class="lbl" style="font-size:12px;text-anchor:end" x="${(min<0?X(0):X(min))-5}" y="${Y(v)+4}">${v===min&&min>=0?'':fI(v)}</text>`}
  const ax=min<0?0:min;g+=`<line class="ln" x1="${X(min)}" y1="${Y(ax)}" x2="${X(max)}" y2="${Y(ax)}"/><line class="ln" x1="${X(ax)}" y1="${Y(min)}" x2="${X(ax)}" y2="${Y(max)}"/>`;
  for(const it of items)g+=`<text x="${X(it.x)}" y="${Y(it.y)+9}" text-anchor="middle" font-size="${Math.round(s*.78)}">${it.e}</text>`;
  return `<svg viewBox="0 0 ${W} ${W}" class="fig" style="width:min(${Math.round(W*1.15)}px,88vw)" aria-hidden="true">${g}</svg>`}
