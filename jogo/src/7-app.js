/* ================= State & storage ================= */
const ROUND=8;
const store={get(k,d){try{const v=localStorage.getItem('cm-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('cm-'+k,JSON.stringify(v))}catch(e){}}};
const S={screen:'home',name:'',gender:'f',mate:'estrela',grade:'1',prog:{},gems:0,sound:store.get('sound',true),music:store.get('music',false),round:null,mini:null,editing:null,rank:null};
/* ---- players saved on this device (no login): each keeps its own progress ---- */
let PROFILES=store.get('profiles',[]);
if(!PROFILES.length){const oldName=store.get('name',''),oldProg=store.get('prog',{});
  // progress from the single-grade version belongs to the 1st grade
  for(const k of Object.keys(oldProg))if(!k.includes(':')){oldProg['1:'+k]=oldProg['1:'+k]||oldProg[k];delete oldProg[k]}
  if(oldName||Object.keys(oldProg).length)PROFILES=[{id:'local-'+Date.now(),code:null,name:oldName,gender:store.get('gender','f'),mate:store.get('mate','estrela'),grade:store.get('grade','1'),prog:oldProg,gems:store.get('gems',0)}];
  store.set('profiles',PROFILES)}
let ACTIVE=store.get('active',PROFILES[0]?PROFILES[0].id:null);
const activeProfile=()=>PROFILES.find(p=>p.id===ACTIVE)||null;
function loadProfile(p){S.name=p.name;S.gender=p.gender;S.mate=p.mate;S.grade=p.grade;S.prog=p.prog||{};S.gems=p.gems||0;S.items=p.items||[];S.wear=p.wear||{}}
function saveProfile(){const p=activeProfile();if(!p)return;Object.assign(p,{name:S.name,gender:S.gender,mate:S.mate,grade:S.grade,prog:S.prog,gems:S.gems});store.set('profiles',PROFILES);store.set('active',ACTIVE);scheduleSync()}
if(activeProfile())loadProfile(activeProfile());

/* ---- online sync and ranking: only when served by the app at /caderninho ---- */
// the app page sets window.CM_API (see jogo/standalone.py); the claude.ai artifact has no server and plays offline
const API=window.CM_API||'/api/caderninho';
const ONLINE=!!window.CM_API||/^\/caderninho(\/|$)/.test(location.pathname);
const NAME_OK=s=>/^[\p{L}\p{M} '-]{1,20}$/u.test(s);
// online, the first screen also lists the players saved on the server (any device)
const firstScreen=()=>{S.editing=null;if(PROFILES.length||ONLINE){S.screen='who';if(ONLINE)loadOthers()}else{S.screen='home';S.editing='new'}};
let OTHERS=null;
async function loadOthers(){try{const d=await api('/players','GET');OTHERS=d.players||[]}catch(e){OTHERS=OTHERS||[]}
  if(S.screen!=='who')return;if(!PROFILES.length&&!OTHERS.length){S.screen='home';S.editing='new'}render()}
let syncTimer=null;
function scheduleSync(){if(!ONLINE)return;clearTimeout(syncTimer);syncTimer=setTimeout(syncNow,800)}
async function api(path,method,body,tok){const h={'content-type':'application/json'};if(tok)h['x-family-token']=tok;const r=await fetch(API+path,{method,headers:h,body:body?JSON.stringify(body):undefined});const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||'erro'),{status:r.status});return j}
async function syncNow(){const p=activeProfile();if(!ONLINE||!p||!p.code||!NAME_OK(p.name))return;clearTimeout(syncTimer);
  try{await api('/players/'+p.id,'PUT',{code:p.code,name:p.name,gender:p.gender,mate:p.mate,grade:p.grade,progress:p.prog||{}})}catch(e){}}
const mergeProg=(a,b)=>{const o=JSON.parse(JSON.stringify(a||{}));for(const k of Object.keys(b||{})){const x=o[k]||[0,0,0],y=b[k];o[k]=[0,1,2].map(i=>Math.max(x[i]||0,y[i]||0))}return o};
// another device may have played: keep the best stars of both
async function pullProfile(p){if(!ONLINE||!p.code)return;try{const s=await api('/recover','POST',{name:p.name,code:p.code});p.prog=mergeProg(p.prog,s.progress);p.gems=s.gems||0;p.birthDate=s.birthDate;p.items=s.items||[];p.wear=s.wear||{};store.set('profiles',PROFILES);if(p.id===ACTIVE){loadProfile(p);if(S.screen==='map')render()}scheduleSync()}catch(e){}}
const profileStars=p=>Object.keys(p.prog||{}).reduce((a,k)=>a+p.prog[k].reduce((x,y)=>x+(y||0),0),0);
const gx=(s,g)=>s.replace(/\{([^|}]*)\|([^}]*)\}/g,(m,f,mm)=>(g||S.gender)==='m'?mm:f);
const fill=s=>gx(s).replace(/NOME/g,S.name||(S.gender==='m'?'campeão':'campeã'));
const mate=()=>MATES[S.mate]||MATES.estrela;
const grade=()=>GRADES.find(g=>g.id===S.grade)||GRADES[1];
const pkey=(g,w)=>`${g}:${w}`;
const gradeStars=g=>g.worlds.reduce((a,w)=>a+(S.prog[pkey(g.id,w.id)]||[]).reduce((x,y)=>x+(y||0),0),0);
const starStr=n=>[0,1,2].map(i=>`<span class="${i<n?'on':''}">★</span>`).join('');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ================= Sound, music & speech ================= */
let actx=null;
function ctx(){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();return actx}catch(e){return null}}
function tone(seq,vol=.22){if(!S.sound)return;const c=ctx();if(!c)return;try{let t=c.currentTime;
  seq.forEach(([f,d,type])=>{const o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(c.destination);o.start(t);o.stop(t+d+.02);t+=d*.8})}catch(e){}}
const sndOk=()=>tone([[660,.12],[880,.12],[1175,.22]]);
const sndBad=()=>tone([[300,.18,'triangle'],[240,.22,'triangle']]);
const sndWin=()=>tone([[523,.15],[659,.15],[784,.15],[1047,.35]]);
const sndPop=()=>tone([[900,.06,'square'],[1400,.08]],.12);
const sndTick=()=>tone([[1200,.04,'square']],.05);
let musicTimer=null,musicStep=0;
const MELODY=[523,659,784,659,587,698,880,698,523,659,784,1047,988,784,659,587];
function musicOn(){if(musicTimer||!S.music)return;const c=ctx();if(!c)return;musicTimer=setInterval(()=>{if(!S.music||!actx)return;const t=actx.currentTime,f=MELODY[musicStep%MELODY.length];musicStep++;
  [[f,.045,'triangle'],[f/2,.03,'sine']].forEach(([fr,v,ty])=>{const o=actx.createOscillator(),g=actx.createGain();o.type=ty;o.frequency.value=fr;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.26);o.connect(g).connect(actx.destination);o.start(t);o.stop(t+.3)})},300)}
function musicOff(){clearInterval(musicTimer);musicTimer=null}

/* Speech: pre-recorded neural female voice clips stitched per phrase, number and name.
   Falls back to the device voice only when a phrase has no clip. */
const spoken=s=>s.replace(/,\s*NOME(?=[!?.])/g,'').replace(/\s*NOME[,!]?/g,'').replace(/\s+/g,' ').trim();
const normChunk=s=>s.replace(/\s+/g,' ').replace(/^[\s,.;:!?]+/,'').replace(/[\s,;:]+$/,'').trim();
const normName=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z ]/g,'').replace(/\s+/g,' ').trim();
function clipKeys(text){const keys=[];for(const p of text.replace(/[^\p{L}\p{N}\s,.!?:;]/gu,' ').split(/(\d+)/)){if(/^\d+$/.test(p)){keys.push('#'+(+p));continue}const c=normChunk(p);if(c)keys.push(c)}return keys}
const safeSay=t=>!/[−×÷²³√π%°]|\d\s*[,./:]\s*\d|\d{4,}|\d\s*\.\s*\d/.test(t)&&(t.match(/\d+/g)||[]).every(n=>+n<=100);
const voiceFor=q=>{const t=q.say||q.text;return safeSay(t)?t:'Leia a pergunta e escolha a resposta certa.'};
const revealFor=c=>safeSay(c.say)?`A resposta é ${c.say}.`:'Esta é a resposta certa!';
const VOZ={};const loaded=new Set();const decoded=new Map();let speakId=0;let playing=[];
function loadVoz(name){if(loaded.has(name))return;loaded.add(name);fetch(`voz/${name}.json`).then(r=>r.ok?r.json():null).then(j=>{if(j)Object.assign(VOZ,j)}).catch(()=>{loaded.delete(name)})}
function clipBuffer(k){
  if(decoded.has(k))return decoded.get(k);
  const bin=atob(VOZ[k]);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  const p=new Promise((res,rej)=>ctx().decodeAudioData(u.buffer,res,rej));decoded.set(k,p);return p;
}
function stopSpeech(){speakId++;playing.forEach(s=>{try{s.stop()}catch(e){}});playing=[];try{speechSynthesis.cancel()}catch(e){}}
let voice=null;
function loadVoice(){try{const vs=speechSynthesis.getVoices().filter(v=>/^pt/i.test(v.lang));
  const fem=/francisca|thalita|leticia|letícia|luciana|maria|vit[oó]ria|joana|camila|fernanda|helo[ií]sa|raquel|google portugu[eê]s do brasil/i;
  const score=v=>(/pt[-_]BR/i.test(v.lang)?4:0)+(fem.test(v.name)?3:0)+(/natural|neural|online|premium|enhanced/i.test(v.name)?2:0);
  voice=vs.sort((a,b)=>score(b)-score(a))[0]||null}catch(e){}}
try{loadVoice();speechSynthesis.onvoiceschanged=loadVoice}catch(e){}
function deviceSpeak(t){if(!('speechSynthesis' in window))return;try{const u=new SpeechSynthesisUtterance(t.replace(/[^\p{L}\p{N}\s,.!?:;]/gu,' '));u.lang='pt-BR';u.rate=.95;u.pitch=1.05;if(voice)u.voice=voice;speechSynthesis.speak(u)}catch(e){}}
async function speakKeys(keys,text){
  if(!S.sound)return;stopSpeech();const id=speakId;
  if(!ctx()||!keys.length||keys.some(k=>!VOZ[k])){deviceSpeak(text);return}
  try{
    const bufs=await Promise.all(keys.map(clipBuffer));if(id!==speakId)return;
    let at=actx.currentTime+.05;
    bufs.forEach((b,i)=>{const s=actx.createBufferSource();s.buffer=b;s.connect(actx.destination);s.start(at);playing.push(s);
      at+=b.duration+(/[.!?]$/.test(keys[i])?.22:keys[i][0]==='@'?.04:.07)});
  }catch(e){if(id===speakId)deviceSpeak(text)}
}
const speak=t=>speakKeys(clipKeys(t),t);
// question, then tip, as one queue of recorded clips
const speakTwo=(a,b)=>speakKeys([...clipKeys(a),...clipKeys(b)],a+' '+b);
// lines with NOME: say the child's name when a clip for it exists, otherwise drop it
function speakLine(raw){const r=gx(raw);const nk='@'+normName(S.name);
  if(r.includes('NOME')&&S.name&&VOZ[nk]){const i=r.indexOf('NOME');speakKeys([...clipKeys(r.slice(0,i)),nk,...clipKeys(r.slice(i+4))],fill(r));}
  else speak(spoken(r))}

/* ================= Effects ================= */
function floaty(){const el=document.getElementById('floaty');if(!el||el.childElementCount)return;const sy=['+','−','×','÷','=','1','2','3','5','7','9','½','%','★'];const cs=COLS;
  for(let i=0;i<16;i++){const s=document.createElement('span');s.textContent=pick(sy);s.style.left=R(0,96)+'%';s.style.fontSize=R(22,48)+'px';s.style.color=pick(cs);s.style.animationDuration=R(16,34)+'s';s.style.animationDelay=(-R(0,30))+'s';el.appendChild(s)}}
function flyAt(el,txt){try{const r=el.getBoundingClientRect();const f=document.createElement('div');f.className='fly';f.textContent=txt;f.style.left=(r.left+r.width/2-20)+'px';f.style.top=(r.top-10)+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),1000)}catch(e){}}
function confetti(n=140,origin){
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const cv=document.getElementById('confetti');cv.hidden=false;const c2=cv.getContext('2d');
  const W=cv.width=innerWidth,H=cv.height=innerHeight;const cols=['#EF476F','#F7882F','#FFC53D','#22A867','#3A78F2','#8B5CF6','#E8559F'];
  const ps=Array.from({length:n},()=>origin?{x:origin.x,y:origin.y,vx:-5+Math.random()*10,vy:-8+Math.random()*5,s:5+Math.random()*6,r:Math.random()*6,vr:-.3+Math.random()*.6,c:pick(cols)}:{x:Math.random()*W,y:-20-Math.random()*H*.5,vx:-2+Math.random()*4,vy:2+Math.random()*4,s:6+Math.random()*7,r:Math.random()*6,vr:-.2+Math.random()*.4,c:pick(cols)});
  const t0=performance.now(),dur=origin?1100:3200;
  (function f(t){c2.clearRect(0,0,W,H);ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=origin?.35:.05;p.r+=p.vr;c2.save();c2.translate(p.x,p.y);c2.rotate(p.r);c2.fillStyle=p.c;c2.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66);c2.restore()});
    if(t-t0<dur)requestAnimationFrame(f);else{c2.clearRect(0,0,W,H);cv.hidden=true}})(t0);
}

/* ================= Screens ================= */
let cleanup=null;
// pointer events only exist from iOS 13; fall back to touch and mouse
const TAP=window.PointerEvent?['pointerdown']:['touchstart','mousedown'];
function onTap(el,fn){let last=0;TAP.forEach(ev=>el.addEventListener(ev,e=>{const now=Date.now();if(now-last<350)return;last=now;e.preventDefault();fn(e)},{passive:false}))}
function render(){if(cleanup){cleanup();cleanup=null}
  const f={reviewintro:renderReviewIntro,home:renderHome,who:renderWho,rank:renderRank,shop:renderShop,login:renderLogin,wallet:renderWallet,parents:renderParents,explore:renderExplore,tabex:renderTabex,seq:renderSeq,seqdone:renderSeqDone,map:renderMap,miniintro:renderMiniIntro,mini:renderMini,minidone:renderMiniDone,play:renderPlay,result:renderResult}[S.screen];f();window.scrollTo&&window.scrollTo(0,0)}
const gradeChips=(cls='')=>`<div class="chiprow ${cls}">${GRADES.map(g=>`<button class="chip" data-grade="${g.id}" aria-pressed="${S.grade===g.id}">${g.name}</button>`).join('')}</div>`;
function renderHome(){
  $app.innerHTML=`<section class="home screen">
    <div style="width:140px" class="bob">${mate().draw()}</div>
    <h1 class="logo"><span class="l1">Caderninho</span> <span class="l2" style="animation-delay:.4s">Mágico</span></h1>
    <p class="tag">Matemática da pré-escola ao 6º ano, com mundos, minigames e estrelas.</p>
    <form class="step namebox" id="nameform"><label class="steplabel" for="nm">Como você se chama?</label>
      <input id="nm" maxlength="20" autocomplete="off" placeholder="Seu nome" value="${esc(S.name||'')}"><p class="err" id="nmerr" aria-live="polite"></p></form>
    ${ONLINE&&(S.editing==='new'||!activeProfile())?`<div class="step"><div class="steplabel">Quando você nasceu?</div>${dobPicker('hdob',S.dob||'')}<p class="hint">Você vai entrar com o seu nome e esta data.</p></div>`:''}
    <div class="step"><div class="steplabel">Você é...</div><div class="chips"><button class="chip" data-gender="f" aria-pressed="${S.gender==='f'}">Menina</button><button class="chip" data-gender="m" aria-pressed="${S.gender==='m'}">Menino</button></div></div>
    <div class="step"><div class="steplabel">Em que ano você está?</div><div class="chips">${GRADES.map(g=>`<button class="chip" data-grade="${g.id}" aria-pressed="${S.grade===g.id}">${g.name}</button>`).join('')}</div></div>
    <div class="step"><div class="steplabel">Quem vai jogar com você?</div>
      <div class="squad">${MATE_ORDER.map(k=>{const m=MATES[k];return `<button class="mate" data-mate="${k}" aria-pressed="${S.mate===k}" style="--mc:${m.color}"><span class="pic">${m.draw()}</span><b>${m.name}</b><small>${m.role}</small></button>`}).join('')}</div></div>
    <div class="btnrow"><button class="btn big wiggle" style="--c:var(--pink)" data-act="start">${S.editing&&S.editing!=='new'?'Salvar e jogar':'Vamos jogar!'}</button>${PROFILES.length?'<button class="btn ghost" data-act="who">Voltar</button>':''}</div>
  </section>`;
  document.getElementById('nameform').addEventListener('submit',e=>{e.preventDefault();start()});
}
const otherCard=p=>{const m=MATES[p.mate]||MATES.estrela;const gn=(GRADES.find(x=>x.id===p.grade)||{}).name||'';
  return `<div class="player" style="--mc:${m.color}"><button class="pbtn" data-login="${esc(p.id)}"><span class="pic">${m.draw()}</span><b>${esc(p.name)}</b><small>${gn} · ★ ${p.stars}</small></button></div>`};
function renderWho(){const mine=new Set(PROFILES.map(p=>p.id));const others=(OTHERS||[]).filter(p=>!mine.has(p.id));
  $app.innerHTML=`<section class="home screen">
    <h1 class="logo"><span class="l1">Caderninho</span> <span class="l2" style="animation-delay:.4s">Mágico</span></h1>
    <div class="steplabel">Quem vai jogar?</div>
    ${PROFILES.length&&ONLINE?'<div class="plabel">Neste aparelho</div>':''}
    <div class="players">${PROFILES.map(p=>{const m=MATES[p.mate]||MATES.estrela;
      return `<div class="player" style="--mc:${m.color}"><button class="pbtn" data-pick="${esc(p.id)}"><span class="pic">${dressed(m,p.wear)}</span><b>${esc(p.name||'Sem nome')}</b><small>★ ${profileStars(p)} · 💎 ${p.gems||0}</small>${p.code?`<small class="code">Código ${esc(p.code)}</small>`:''}</button><button class="pedit" data-edit="${esc(p.id)}" aria-label="Editar ${esc(p.name)}">✏️</button></div>`}).join('')}
      <button class="player add" data-act="newp"><span class="plus">+</span><b>Novo jogador</b></button></div>
    ${ONLINE?(OTHERS===null?'<p class="hint">Procurando outros jogadores...</p>':others.length?`<div class="plabel">${PROFILES.length?'Outros jogadores':'Já jogou? Toque no seu nome'}</div><div class="players others">${others.map(otherCard).join('')}</div><p class="err" id="otherr" aria-live="polite"></p>`:''):''}
    ${ONLINE?`<div class="btnrow"><button class="btn ghost" data-act="loginname">Não achou seu nome? Entrar com nome e data</button><button class="btn ghost" data-act="parents">👨‍👩‍👧 Área dos pais</button></div>`:''}
  </section>`;
}
function pickPlayer(id){const p=PROFILES.find(x=>x.id===id);if(!p)return;
  // online, a device profile logs in once with the birth date (or is created on the server)
  if(ONLINE&&!p.code)return openLogin({mode:'create',pid:p.id});if(ONLINE&&!p.birthDate)return openLogin({mode:'setdob',pid:p.id});ACTIVE=id;loadProfile(p);store.set('profiles',PROFILES);store.set('active',ACTIVE);
  loadVoz('g-'+S.grade);S.screen='map';render();musicOn();speakLine(mate().hi);pullProfile(p);flushLessons()}
const MEDAL=['🥇','🥈','🥉'];
const rankRow=r=>{const m=MATES[r.mate]||MATES.estrela;const gn=(GRADES.find(x=>x.id===r.grade)||{}).name||'';
  return `<div class="rrow${r.isMe?' me':''}"><span class="rpos">${MEDAL[r.rank-1]||r.rank+'º'}</span><span class="rpic">${m.draw()}</span><span class="rname">${esc(r.name)}${r.isMe?' <em>(você)</em>':''}<small>${gn}</small></span><span class="rstars">★ ${r.stars}</span></div>`};
function renderRank(){const g=grade();const R=S.rank||{tab:'all',data:null,err:null};
  $app.innerHTML=`<div class="screen"><div class="topbar"><button class="iconbtn" data-act="map" aria-label="Voltar ao mapa">←</button><h2 class="rtitle">🏆 Ranking</h2></div>
    <div class="chips rtabs"><button class="chip" data-rtab="all" aria-pressed="${R.tab==='all'}">Todos os anos</button><button class="chip" data-rtab="${g.id}" aria-pressed="${R.tab===g.id}">${g.name}</button></div>
    <section class="card ranklist">${R.err?`<p class="hint">${esc(R.err)}</p>`:!R.data?'<p class="hint">Carregando...</p>':!R.data.top.length?'<p class="hint">Ninguém tem estrelas ainda. Jogue uma lição e seja o primeiro!</p>':R.data.top.map(rankRow).join('')+(R.data.me?'<div class="rsep">···</div>'+rankRow(R.data.me):'')}</section></div>`}
async function loadRank(tab){S.rank={tab,data:null,err:null};S.screen='rank';render();await syncNow();const p=activeProfile();
  try{const d=await api('/ranking?'+(tab==='all'?'':'grade='+tab+'&')+'me='+encodeURIComponent(p&&p.code?p.id:''),'GET');if(S.screen==='rank'&&S.rank.tab===tab){S.rank.data=d;render()}}
  catch(e){if(S.screen==='rank'&&S.rank.tab===tab){S.rank.err='Sem conexão com o ranking agora. Tente de novo mais tarde.';render()}}}
/* ---- bonus games ---- */
function setBonusStars(b,ai,stars){const k=bkey(b,ai);S.prog[k]=[Math.max((S.prog[k]||[0])[0]||0,stars)];saveProfile()}
const bonusStars=(b,ai)=>(S.prog[bkey(b,ai)]||[0])[0]||0;
function openBonus(bi,ai){const b=BONUS[bi],act=b.acts[ai];stopSpeech();CURHEX=hexOf(b.color);
  if(act.kind==='quiz')return newRound(bi,ai,true);
  S.bonus={bi,ai};if(act.kind==='explore'){S.explore={sel:null,auto:null};S.screen='explore';render();speak(BONUS_SAY[0])}
  else if(act.kind==='tabex'){S.tabex={sel:null,auto:false};S.screen='tabex';render();speak(BONUS_SAY[2])}
  else{S.seq={round:0,mistakes:0,t0:Date.now()};newSeqRound();S.screen='seq';render();speak(BONUS_SAY[b.tab?3:1])}}
TAB.n=store.get('tab',0);
function setTab(n){TAB.n=n;store.set('tab',n)}
const tabChips=(all)=>`<div class="chips tabchips"><span class="tablbl">Tabuada do</span>${all?`<button class="chip" data-tab="0" aria-pressed="${!TAB.n}">🎲 Todas</button>`:''}${Array.from({length:10},(_,i)=>`<button class="chip" data-tab="${i+1}" aria-pressed="${TAB.n===i+1}">${i+1}</button>`).join('')}</div>`;
function renderBonusBar(){return `<section class="bonusbar">${BONUS.map((b,bi)=>`<article class="world bonus" style="--c:${b.color};--i:0">
    <div class="whead"><span class="wicon">${b.icon}</span><h3>${b.name}</h3><span class="btag">Bônus</span></div>
    ${b.tab?tabChips(1):''}<div class="bacts">${b.acts.map((a,ai)=>`<button class="lvl" data-b="${bi}" data-a="${ai}"><span class="n">${ai+1}</span><span class="t">${a.name}<small>${a.hint}</small></span><span class="stars">${a.kind==='explore'||a.kind==='tabex'?'👀':starStr(bonusStars(b,ai))}</span></button>`).join('')}</div>
  </article>`).join('')}</section>`}
function renderExplore(){const b=BONUS[S.bonus.bi],E=S.explore;let cells='';
  for(let n=1;n<=100;n++)cells+=`<button class="tbtn${E.sel===n?' on':''}" data-n="${n}" style="background:${ROWTINT[rowOf(n)]}">${n}</button>`;
  const info=E.sel?`<div class="bignum" style="font-size:clamp(3rem,10vw,4.5rem)">${E.sel}</div><p class="hint">${exploreDesc(E.sel)}</p>`:'<p class="hint">Toque em um número para ouvir.</p>';
  $app.innerHTML=`<div class="screen" style="--c:${b.color}"><div class="topbar"><button class="iconbtn" data-act="map" aria-label="Voltar ao mapa">←</button><div class="goal">${b.icon} Explorar a tabela</div></div>
    <div class="explore"><div class="card exinfo">${info}<div class="btnrow"><button class="btn" data-act="count1">${E.auto==='1'?'⏹ Parar':'▶ Contar de 1 a 100'}</button><button class="btn ghost" data-act="count10">${E.auto==='10'?'⏹ Parar':'De 10 em 10'}</button></div></div>
    <div class="table100">${cells}</div></div></div>`;
  cleanup=()=>{clearInterval(E.timer);E.timer=null;E.auto=null}}
const exploreDesc=n=>{const d=Math.floor(n/10),u=n%10,D=`${d} dezena${d===1?'':'s'}`,U=`${u} unidade${u===1?'':'s'}`;return n===100?'1 centena (10 dezenas)':!d?U:!u?D:`${D} e ${U}`};
// update only the highlighted cell and the info box, so the page does not jump while counting
function exploreShow(n){S.explore.sel=n;document.querySelectorAll('.tbtn.on').forEach(x=>x.classList.remove('on'));const el=document.querySelector(`.tbtn[data-n="${n}"]`);if(el){el.classList.add('on');if(el.scrollIntoView&&S.explore.auto)el.scrollIntoView({block:'nearest'})}
  const big=document.querySelector('.exinfo .bignum'),h=document.querySelector('.exinfo .hint');
  if(big){big.textContent=n;if(h)h.textContent=exploreDesc(n)}else{const box=document.querySelector('.exinfo');if(box){const d=document.createElement('div');d.className='bignum';d.style.fontSize='clamp(3rem,10vw,4.5rem)';d.textContent=n;box.insertBefore(d,box.firstChild);if(h)h.textContent=exploreDesc(n)}}
  speak(String(n))}
function exploreTap(n){if(S.explore.auto)return;exploreShow(n);if(is67(n))sixSeven()}
function exploreCount(step){const E=S.explore;const was=E.auto;clearInterval(E.timer);E.timer=null;E.auto=null;
  if(was===String(step)){render();return}
  E.auto=String(step);render();let n=step===10?10:1;exploreShow(n);
  E.timer=setInterval(()=>{n+=step;if(n>100){clearInterval(E.timer);E.timer=null;E.auto=null;render();return}exploreShow(n)},step===10?1300:850)}
// "Em ordem!": ten numbers to tap from smallest to largest (a run of the 1–100 table, or one multiplication table)
/* multiplication table explorer: rows n × 1 … n × 10, a tap shows the dot array and reads it */
const tabDots=(n,k)=>`<div class="tdots" style="--k:${k}">${Array.from({length:n},(_,r)=>`<span class="trow" style="--d:${r*.06}s">${'<i></i>'.repeat(k)}</span>`).join('')}</div>`;
const tabInfo=(n,k)=>k?`<div class="bignum" style="font-size:clamp(2.2rem,8vw,3.4rem)">${n} × ${k} = ${n*k}</div>${tabDots(n,k)}<p class="hint">${n} grupo${n>1?'s':''} de ${k}: ${n*k} bolinha${n*k>1?'s':''}</p>`:'<p class="hint">Toque numa conta para ouvir.</p>';
function renderTabex(){const b=BONUS[S.bonus.bi],T=S.tabex,n=TAB.n||2;const info=`<div class="tinfo">${tabInfo(n,T.sel)}</div>`;
  $app.innerHTML=`<div class="screen" style="--c:${b.color}"><div class="topbar"><button class="iconbtn" data-act="map" aria-label="Voltar ao mapa">←</button><div class="goal">${b.icon} Tabuada do ${n}</div></div>
    ${tabChips(0)}
    <div class="explore"><div class="card exinfo">${info}<div class="btnrow"><button class="btn" data-act="tabread">${T.auto?'⏹ Parar':'▶ Ler a tabuada'}</button></div></div>
    <div class="tablist">${Array.from({length:10},(_,i)=>`<button class="trowbtn${T.sel===i+1?' on':''}" data-tk="${i+1}"><span>${n} × ${i+1}</span><b>= ${n*(i+1)}</b></button>`).join('')}</div></div></div>`;
  cleanup=()=>{clearTimeout(T.timer);T.timer=null;T.auto=false}}
// update the info box and the highlighted row in place, so the page does not jump while reading
function tabShow(k){const T=S.tabex,n=TAB.n||2;T.sel=k;const box=document.querySelector('.tinfo');if(box)box.innerHTML=tabInfo(n,k);
  document.querySelectorAll('.trowbtn.on').forEach(x=>x.classList.remove('on'));const el=document.querySelector(`.trowbtn[data-tk="${k}"]`);
  if(el){el.classList.add('on');if(el.scrollIntoView&&T.auto)el.scrollIntoView({block:'nearest'})}speak(tabSay(n,k))}
function tabRead(){const T=S.tabex;const btn=()=>document.querySelector('[data-act=tabread]');clearTimeout(T.timer);T.timer=null;
  if(T.auto){T.auto=false;if(btn())btn().textContent='▶ Ler a tabuada';return}
  let k=1;T.auto=true;if(btn())btn().textContent='⏹ Parar';const step=()=>{if(S.screen!=='tabex'||!T.auto)return;tabShow(k);k++;
    if(k<=10)T.timer=setTimeout(step,2600);else T.timer=setTimeout(()=>{T.auto=false;if(S.screen==='tabex'&&btn())btn().textContent='▶ Ler a tabuada'},2600)};step()}
function newSeqRound(){const Q=S.seq,b=BONUS[S.bonus.bi];if(b.tab){Q.tab=tabN();Q.list=Array.from({length:10},(_,i)=>(i+1)*Q.tab)}else{const st=R(1,91);Q.list=Array.from({length:10},(_,i)=>st+i)}
  Q.idx=0;Q.cells=shuf(Q.list)}
const seqHint=Q=>`Próximo: <b>${Q.list[Q.idx]==null?'✓':Q.list[Q.idx]}</b> · Erros: ${Q.mistakes}`;
function renderSeq(){const b=BONUS[S.bonus.bi],Q=S.seq,done=new Set(Q.list.slice(0,Q.idx));
  $app.innerHTML=`<div class="screen card" style="--c:${b.color}"><div class="topbar"><button class="iconbtn" data-act="map" aria-label="Voltar ao mapa">←</button><div class="goal">${Q.tab?`Tabuada do ${Q.tab}: toque de ${Q.tab} em ${Q.tab}, até o ${Q.tab*10}!`:`Toque em ordem, do ${Q.list[0]} até o ${Q.list[9]}!`}</div><span class="score">${Q.round+1}/3</span></div>
    <div class="seqgrid">${Q.cells.map(n=>`<button class="sbtn${done.has(n)?' done':''}" data-s="${n}">${n}</button>`).join('')}</div>
    <p class="hint">${seqHint(Q)}</p></div>`;
  if(Q.tab&&Q.round)speak(`Agora a tabuada do ${Q.tab}!`)}
function seqTap(n,btn){const Q=S.seq;if(Q.list.indexOf(n)<Q.idx)return;
  if(n!==Q.list[Q.idx]){Q.mistakes++;btn.classList.remove('shake');void btn.offsetWidth;btn.classList.add('shake');sndBad();const h=document.querySelector('.hint');if(h)h.innerHTML=seqHint(Q);return}
  Q.idx++;btn.classList.add('done');if(is67(n))sixSeven();else{sndPop();speak(String(n))}flyAt(btn,'✓');const h=document.querySelector('.hint');if(h)h.innerHTML=seqHint(Q);
  if(Q.idx>=Q.list.length){Q.round++;if(Q.round<3){setTimeout(()=>{newSeqRound();render()},700)}else{const secs=(Date.now()-Q.t0)/1000;const stars=Q.mistakes<=1&&secs<120?3:Q.mistakes<=5?2:1;
    const b=BONUS[S.bonus.bi];setBonusStars(b,S.bonus.ai,stars);setTimeout(()=>{S.screen='seqdone';S.seq.stars=stars;render();
      postLesson({key:bkey(b,S.bonus.ai),level:0,stars,score:Q.mistakes,total:30,reviews:0,seconds:Math.round(secs)},showReward)},700)}}}
function renderSeqDone(){const b=BONUS[S.bonus.bi],Q=S.seq,m=mate();
  $app.innerHTML=`<section class="result screen" style="--c:${b.color}"><div class="buddy dance">${meDraw()}</div><div class="bigstars">${starStr(Q.stars)}</div>
    <h2>${esc(fill(RESULT_T[Q.stars]))}</h2><p>Você colocou 30 números em ordem com ${Q.mistakes} erro${Q.mistakes===1?'':'s'}.</p>${rewardSlot()}
    <div class="btnrow"><button class="btn ghost" data-act="seqagain">Jogar de novo</button><button class="btn" style="--c:var(--purple)" data-act="map">Voltar ao mapa</button></div></section>`;
  stopSpeech();celebrate(Q.stars,()=>{if(S.screen==='seqdone')speakLine(`${RESULT_T[Q.stars]} Você ganhou ${Q.stars} estrela${Q.stars>1?'s':''}!`)})}
function renderMap(){
  const m=mate(),g=grade(),me=activeProfile();
  $app.innerHTML=`<div class="screen"><header class="maphead">
      <div class="buddy bob">${meDraw()}</div>
      <div class="bubble">${esc(fill(m.hi))} Escolha um mundo do ${g.name}.</div>
      <div class="headtools"><span class="pill">★ ${gradeStars(g)} de ${g.worlds.length*9}</span>${ONLINE&&me&&me.code?`<button class="pill gem" data-act="wallet" aria-label="Meus diamantes">💎 ${S.gems}</button><button class="iconbtn" data-act="shop" aria-label="Loja">🛍️</button>`:`<span class="pill gem">💎 ${S.gems}</span>`}${ONLINE?'<button class="iconbtn" data-act="rank" aria-label="Ranking">🏆</button>':''}
      <button class="iconbtn${S.music?'':' off'}" data-act="music" aria-label="Música">🎵</button>
      <button class="iconbtn${S.sound?'':' off'}" data-act="sound" aria-label="Som">${S.sound?'🔊':'🔇'}</button>
      <button class="iconbtn" data-act="home" aria-label="Trocar de jogador">👤</button></div>
    </header>
    <div class="gradebar">${gradeChips()}</div>
    ${renderBonusBar()}
    <section class="worlds">${g.worlds.map((w,wi)=>{const p=S.prog[pkey(g.id,w.id)]||[];
      return `<article class="world" style="--c:${w.color};--on:${w.on||'#fff'};--i:${wi}">
        <div class="whead"><span class="wicon">${w.icon}</span><h3>${w.name}</h3></div>
        <div class="levels">${w.levels.map((l,li)=>`<button class="lvl" data-w="${wi}" data-l="${li}"><span class="n">${li+1}</span><span class="t">${l[0]}<small>IXL ${g.short} · ${l[1]}</small></span><span class="stars">${starStr(p[li]||0)}</span></button>`).join('')}</div>
      </article>`}).join('')}</section></div>`;
}
/* ---- warm-up mini-games ---- */
function openWorld(wi,li){const g=grade();const kind=MINI_KIND[(wi+li)%3];const spec=MINI[g.id]();S.mini={wi,li,kind,spec,goal:miniGoal(kind,spec),score:0};S.screen='miniintro';render();speak(`Hora do aquecimento! ${S.mini.goal}`)}
function renderMiniIntro(){const mi=S.mini,w=grade().worlds[mi.wi],info=MINI_INFO[mi.kind];
  $app.innerHTML=`<section class="result screen" style="--c:${w.color}">
    <div class="buddy dance">${meDraw()}</div>
    <div class="bignum" style="font-size:4rem">${info.icon}</div>
    <h2>Hora do aquecimento!</h2>
    <p style="font-family:var(--display);font-size:1.4rem;color:var(--ink)">${info.title}</p>
    <p>${esc(mi.goal)}</p>
    <div class="btnrow"><button class="btn big wiggle" style="--c:${w.color};--on:${w.on||'#fff'}" data-act="minigo">Começar!</button><button class="btn ghost" data-act="miniskip">Pular aquecimento</button></div>
  </section>`}
function miniHead(w,mi,showTimer=true){return `<div class="topbar"><button class="iconbtn" data-act="map" aria-label="Voltar ao mapa">←</button><div class="goal">${esc(mi.goal)}</div><span class="score" id="mscore">${mi.score}</span></div>${showTimer?'<div class="timer"><i id="mtimer" style="width:100%"></i></div>':''}`}
function renderMini(){const mi=S.mini,w=grade().worlds[mi.wi];
  if(mi.kind==='balloons')return runBalloons(w,mi);
  if(mi.kind==='moles')return runMoles(w,mi);
  return runMemory(w,mi);
}
function bumpScore(el){const mi=S.mini;mi.score++;const sc=document.getElementById('mscore');if(sc){sc.textContent=mi.score;sc.classList.remove('streak');void sc.offsetWidth}if(el)flyAt(el,'+1')}
function timerLoop(sec,onEnd){const t0=performance.now();let raf;const bar=()=>document.getElementById('mtimer');
  const step=t=>{const left=Math.max(0,1-(t-t0)/(sec*1000));const b=bar();if(b)b.style.width=(left*100)+'%';if(left<=0){onEnd();return}raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step);return()=>cancelAnimationFrame(raf)}
// warm-up pace per grade: younger kids get slower balloons, longer-lived moles, more time and fewer memory pairs
const PACE={p:{bv:[18,26],spawn:2300,up:[3600,4200],every:1800,maxUp:2,time:45,pairs:4,mem:180,grow:0},
 '1':{bv:[22,30],spawn:2100,up:[3200,3800],every:1600,maxUp:2,time:45,pairs:4,mem:180,grow:0},
 '2':{bv:[28,40],spawn:1500,up:[2600,3200],every:1350,maxUp:3,time:40,pairs:5,mem:150,grow:0},
 '3':{bv:[36,52],spawn:1250,up:[2100,2600],every:1100,maxUp:3,time:35,pairs:6,mem:120,grow:.01},
 '4':{bv:[44,64],spawn:1100,up:[1800,2300],every:950,maxUp:4,time:30,pairs:6,mem:100,grow:.015},
 '5':{bv:[50,74],spawn:1000,up:[1600,2100],every:850,maxUp:4,time:30,pairs:6,mem:90,grow:.02},
 '6':{bv:[55,85],spawn:900,up:[1500,1900],every:800,maxUp:4,time:30,pairs:6,mem:90,grow:.02}};
const pace=()=>PACE[S.grade]||PACE['1'];
function runBalloons(w,mi){const P=pace();
  $app.innerHTML=`<div class="screen card" style="--c:${w.color}">${miniHead(w,mi)}<div class="arena" id="arena"><div class="cloud" style="top:30px"></div><div class="cloud" style="top:140px;animation-delay:-14s"></div></div></div>`;
  const ar=document.getElementById('arena');const bals=[];let alive=true;const cols=['#EF476F','#F7882F','#22A867','#3A78F2','#8B5CF6','#E8559F','#11A89A'];
  const spawn=()=>{if(!alive)return;const [label,ok]=mi.spec.item();const b=document.createElement('button');b.className='balloon';b.style.setProperty('--bc',pick(cols));b.innerHTML=`<span class="bb">${label}</span>`;
    const W=ar.clientWidth,H=ar.clientHeight;const o={el:b,ok,x:R(4,Math.max(5,W-90)),y:H+10,v:R(...P.bv)/1000*(1+mi.score*P.grow),dead:false};onTap(b,e=>{if(o.dead)return;
      if(o.ok){o.dead=true;b.style.setProperty('--pos',`translate(${o.x}px,${o.y}px)`);b.classList.add('popped');sndPop();bumpScore(b);setTimeout(()=>b.remove(),260)}else{b.classList.remove('nope');void b.offsetWidth;b.classList.add('nope');sndBad()}});
    ar.appendChild(b);bals.push(o)};
  let last=performance.now(),raf;const loop=t=>{const dt=t-last;last=t;for(const o of bals){if(o.dead)continue;o.y-=o.v*dt;o.el.style.transform=`translate(${o.x}px,${o.y}px)`;if(o.y<-120){o.dead=true;o.el.remove()}}raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  spawn();const iv=setInterval(spawn,P.spawn);
  const stopT=timerLoop(P.time,()=>finishMini());
  cleanup=()=>{alive=false;clearInterval(iv);cancelAnimationFrame(raf);stopT()};
}
function runMoles(w,mi){const P=pace();
  $app.innerHTML=`<div class="screen card" style="--c:${w.color}">${miniHead(w,mi)}<div class="moles" id="moles">${Array.from({length:9},(_,i)=>`<button class="mhole" data-h="${i}" aria-label="buraco ${i+1}"><span class="mole"><b></b></span></button>`).join('')}</div></div>`;
  const holes=[...document.querySelectorAll('.mhole')];const st=holes.map(()=>({up:false,ok:false,t:null}));
  holes.forEach((h,i)=>onTap(h,e=>{const s=st[i];if(!s.up)return;
    if(s.ok){s.up=false;h.classList.add('bonk');sndPop();bumpScore(h);clearTimeout(s.t);setTimeout(()=>h.classList.remove('up','bonk'),220)}else{h.classList.add('nope');sndBad();setTimeout(()=>h.classList.remove('nope'),300)}}));
  const show=()=>{if(st.filter(s=>s.up).length>=P.maxUp)return;const free=st.map((s,i)=>s.up?-1:i).filter(i=>i>=0);if(!free.length)return;const i=pick(free);const [label,ok]=mi.spec.item();const s=st[i];s.up=true;s.ok=ok;holes[i].querySelector('b').innerHTML=label;holes[i].classList.add('up');
    s.t=setTimeout(()=>{s.up=false;holes[i].classList.remove('up')},R(...P.up))};
  show();const iv=setInterval(show,P.every);
  const stopT=timerLoop(P.time,()=>finishMini());
  cleanup=()=>{clearInterval(iv);st.forEach(s=>clearTimeout(s.t));stopT()};
}
function runMemory(w,mi){
  const P=pace();const pairs=mi.spec.pairs().slice(0,P.pairs);const cards=shuf(pairs.flatMap((p,i)=>[{i,h:p[0]},{i,h:p[1]}]));
  $app.innerHTML=`<div class="screen card" style="--c:${w.color}">${miniHead(w,mi)}<div class="memory" id="memory" style="--mc:${cards.length===10?5:4}">${cards.map((c,k)=>`<button class="mcard" data-k="${k}" aria-label="carta ${k+1}"><span class="in"><span class="f">?</span><span class="b">${c.h}</span></span></button>`).join('')}</div></div>`;
  const els=[...document.querySelectorAll('.mcard')];let open=[],lock=false,found=0;
  els.forEach((el,k)=>el.addEventListener('click',()=>{if(lock||el.classList.contains('open')||el.classList.contains('done'))return;el.classList.add('open');sndTick();open.push(k);
    if(open.length===2){lock=true;const [a,b]=open;if(cards[a].i===cards[b].i){setTimeout(()=>{els[a].classList.add('done');els[b].classList.add('done');sndPop();bumpScore(els[b]);bumpScore(els[a]);found++;open=[];lock=false;if(found===pairs.length)setTimeout(finishMini,500)},350)}
      else setTimeout(()=>{els[a].classList.remove('open');els[b].classList.remove('open');open=[];lock=false},850)}}));
  const stopT=timerLoop(P.mem,()=>finishMini());
  cleanup=()=>stopT();
}
function finishMini(){if(S.screen!=='mini')return;S.screen='minidone';render();const n=S.mini.score;sndWin();if(n>=6)confetti(120);speak(`Aquecimento concluído! Você fez ${n} ponto${n===1?'':'s'}!`)}
function renderMiniDone(){const mi=S.mini,w=grade().worlds[mi.wi];
  $app.innerHTML=`<section class="result screen" style="--c:${w.color}">
    <div class="buddy dance">${meDraw()}</div>
    <h2>Aquecimento concluído!</h2>
    <div class="bignum">${mi.score} ⚡</div>
    <p>Você fez ${mi.score} ponto${mi.score===1?'':'s'}. Agora vamos ao mundo ${esc(w.name)}!</p>
    <div class="btnrow"><button class="btn big wiggle" style="--c:${w.color};--on:${w.on||'#fff'}" data-act="miniskip">Entrar no mundo ➜</button><button class="btn ghost" data-act="minigo">Jogar de novo</button></div>
  </section>`}
/* ---- quiz ---- */
/* ---- review with tips (like Duolingo): missed questions come back at the end ---- */
const TIPS=[
 [/você vê\?/,'Conte devagar, apontando com o dedo para cada um.'],
 [/Conte de|Pule de/,'Conte pulando sempre o mesmo tanto e vá falando os números em voz alta.'],
 [/barrinha|blocos|cubinhos/,'Cada barrinha vale dez. Cada cubinho vale um.'],
 [/escondido na reta/,'Ache um número conhecido na reta e conte os pulinhos até a interrogação.'],
 [/escondido na tabela/,'Cada fileira é uma dezena. Olhe o número do começo da fileira.'],
 [/vem antes do /,'Antes é um a menos.'],
 [/vizinhos/,'Um vizinho é um a menos. O outro é um a mais.'],
 [/vem depois do /,'Depois é um a mais.'],
 [/Toque no número/,'Ache primeiro a fileira da dezena e depois a unidade.'],
 [/Arredonde/,'Olhe o algarismo da direita. De cinco para cima, arredonde para cima.'],
 [/Estime/,'Arredonde os números primeiro e depois faça a conta.'],
 [/múltiplo/,'Múltiplo é um resultado da tabuada desse número.'],
 [/divisor/,'Divisor é o número que divide sem sobrar resto.'],
 [/fatoração/,'Divida pelo menor número primo várias vezes, até chegar no um.'],
 [/primo/,'Primo só pode ser dividido por um e por ele mesmo.'],
 [/combinações/,'Multiplique: cada peça de roupa combina com cada uma das outras.'],
 [/dezena|centena|milhar|algarismo|unidade[s]?\. Que/,'Olhe a casa de cada algarismo: unidades, dezenas e centenas.'],
 [/subindo|descendo|falta\?|sequência|Qual vem depois|multiplicado pelo mesmo/,'Veja de quanto em quanto os números mudam e continue do mesmo jeito.'],
 [/O que vem depois|padrão|forma vem depois/,'Fale o padrão em voz alta e veja o que se repete.'],
 [/Tinha .*Saíram/,'Conte só os que sobraram, sem os riscados.'],
 [/Dobro/,'Dobro é somar o número com ele mesmo.'],
 [/sinal está faltando/,'Veja se o resultado ficou maior ou menor que o primeiro número.'],
 [/equivalente/,'Frações equivalentes: multiplique o de cima e o de baixo pelo mesmo número.'],
 [/forma mais simples/,'Divida o de cima e o de baixo pelo mesmo número, até não dar mais.'],
 [/completa a conta|está faltando\?/,'Experimente cada opção na conta e veja qual fica certa.'],
 [/sinal completa/,'A boca do jacaré abre para o número maior.'],
 [/\d\/\d+ ×/,'Multiplique os de cima entre si e os de baixo entre si.'],
 [/\d\/\d+ ÷/,'Para dividir, vire a segunda fração de cabeça para baixo e multiplique.'],
 [/\d\/\d+ [+−]/,'Primeiro deixe as frações com o mesmo número embaixo. Depois faça a conta só com os de cima.'],
 [/\d,\d+ (×|÷) (10|100|1\.000)\?/,'Vezes dez, a vírgula anda uma casa para a direita. Dividido por dez, anda para a esquerda.'],
 [/\d,\d+ [+−]/,'Coloque vírgula embaixo de vírgula e faça a conta como sempre.'],
 [/porcentagem|%/,'Cem por cento é o inteiro. Cinquenta por cento é a metade.'],
 [/decimal/,'Um décimo é zero vírgula um. Uma metade é zero vírgula cinco.'],
 [/fração|parte da figura/,'O número de baixo diz em quantas partes iguais o todo foi dividido. O de cima diz quantas partes são.'],
 [/razão/,'Multiplique os dois números pelo mesmo valor.'],
 [/propriedade/,'Comutativa troca a ordem. Associativa troca os parênteses de lugar.'],
 [/expressão|\(\d|\d\)/,'Faça primeiro o que está nos parênteses, depois vezes e dividido, por último mais e menos.'],
 [/×|grupos com|arranjo/,'Multiplicar é somar o mesmo número várias vezes.'],
 [/÷|divididos|resto|quociente/,'Dividir é repartir em partes iguais. Pense na tabuada.'],
 [/\+/,'Comece pelo número maior e conte para a frente.'],
 [/−/,'Comece pelo número maior e conte para trás.'],
 [/par ou ímpar|é par|é ímpar/,'Os números pares terminam em zero, dois, quatro, seis ou oito.'],
 [/grupo tem/,'Conte os dois grupos e compare.'],
 [/maior|menor|ordem crescente|ordem decrescente/,'Compare com calma, começando pelo algarismo da esquerda.'],
 [/triângulo tem lados/,'Equilátero tem três lados iguais. Isósceles tem dois iguais. Escaleno tem todos diferentes.'],
 [/ângulos de .*Ele é/,'Retângulo tem um ângulo reto. Obtusângulo tem um ângulo bem aberto. Acutângulo tem todos fechadinhos.'],
 [/este ângulo/,'O ângulo reto parece o canto de um quadrado. O agudo é mais fechado e o obtuso, mais aberto.'],
 [/parte do círculo/,'O raio vai do centro até a borda. O diâmetro atravessa o círculo inteiro.'],
 [/área|quadradinhos/,'Conte os quadradinhos de uma fileira e multiplique pelo número de fileiras.'],
 [/lados|vértices|faces|arestas|eixos/,'Conte com o dedo, um por um, sem pular nenhum.'],
 [/Toque no|forma tem|mesma forma|polígono|quadrilátero|retas|triângulo|círculo/,'Olhe os lados e as pontas da figura com atenção.'],
 [/provável|probabilidade|cor é mais|Tirar/,'A cor que tem mais bolinhas no saco é a mais fácil de sair.'],
 [/centímetros mede/,'Olhe onde o giz começa e onde termina na régua.'],
 [/horas o relógio/,'O ponteiro pequeno mostra as horas. O grande mostra os minutos.'],
 [/temperatura/,'Veja até onde vai o vermelho do termômetro.'],
 [/comprido|curto|pesado|leve|alto|baixo/,'Compare os tamanhos com cuidado.'],
 [/quente|frio/,'Pense em como cada coisa fica quando você encosta nela.'],
 [/em cima|embaixo|fila/,'Aponte com o dedo e siga a ordem.'],
 [/não combina|mesma cor/,'Procure o que é diferente dos outros.'],
 [/unidade é melhor/,'Pense no tamanho da coisa: coisas grandes usam unidades grandes.'],
 [/= quantos/,'Lembre quantas unidades pequenas cabem em uma grande. Um metro tem cem centímetros.'],
 [/demora|dias|meses|dura|leva para|vem depois de|vem antes de|idade|unidade usamos|horas tem|minutos tem/,'Pense no seu dia a dia.']];
const DEFAULT_TIP='Leia com calma e olhe a imagem de novo. Você consegue!';
const plainText=s=>String(s).replace(/<[^>]+>/g,' ');
function tipFor(q){const t=plainText(q.text);for(const [re,tip] of TIPS)if(re.test(t))return tip;return DEFAULT_TIP}
const tipShown=q=>q.hint||tipFor(q);
const tipVoice=q=>q.hint&&safeSay(q.hint)?q.hint:tipFor(q);
const REVIEW_SAY='Vamos revisar o que foi difícil! Com uma dica fica mais fácil.';
const curQ=r=>r.review?r.review.list[r.review.i]:r.qs[r.i];
const roundWorld=r=>r.bonus?BONUS[r.wi]:grade().worlds[r.wi];
function newRound(wi,li,bonus){
  const w=bonus?BONUS[wi]:grade().worlds[wi];const gen=bonus?w.acts[li].gen:w.gen[li];CURHEX=hexOf(w.color);const qs=[];const seen=new Set();let guard=0;
  while(qs.length<ROUND&&guard<300){guard++;const q=gen();const key=q.text+'|'+(q.visual||'')+'|'+q.answer;if(seen.has(key)&&guard<250)continue;seen.add(key);qs.push(q)}
  S.round={wi,li,bonus:!!bonus,qs,i:0,score:0,tries:0,lock:false,marks:[],streak:0,t0:Date.now()};S.screen='play';render();
}
function renderPlay(){
  const r=S.round,g=grade(),w=roundWorld(r),q=curQ(r),m=mate(),RV=r.review;
  const n=q.cols||q.choices.length;
  const cls=`choices c${n}${q.txtc?' txt':''}${q.pen?' pen':''}${q.grid?' g100':''}`;
  $app.innerHTML=`<div class="screen" style="--c:${w.color}">
    <div class="topbar"><button class="iconbtn" data-act="map" aria-label="Voltar ao mapa">←</button>
      <div class="dots">${RV?RV.list.map((_,i)=>`<i class="${i<RV.i?'done':i===RV.i?'now':''}"></i>`).join(''):r.qs.map((_,i)=>`<i class="${i<r.i?(r.marks[i]?'done':'miss'):i===r.i?'now':''}"></i>`).join('')}</div>
      <button class="iconbtn" data-act="say" aria-label="Ouvir a pergunta">🔊</button></div>
    <div class="stage">
      <aside class="side"><div class="buddy bob" id="buddy">${meDraw()}</div><div class="say" id="say">${RV?'Use a dica!':r.i===0?esc(fill(m.hi)):'Você consegue!'}</div><div class="streak" id="streak">${r.streak>=2?`🔥 ${r.streak} seguidas!`:''}</div></aside>
      <section class="card">
        <div class="qtag">${r.bonus?`Bônus · ${w.name} · ${w.acts[r.li].name}`:`${g.short} · ${w.name} · Nível ${r.li+1}`} · ${RV?`Revisão ${RV.i+1} de ${RV.list.length}`:`Pergunta ${r.i+1} de ${ROUND}`}</div>
        <h2 class="prompt">${q.text}</h2>
        ${q.visual?`<div class="visual">${q.visual}</div>`:''}
        ${RV?`<div class="tipbox" id="tipbox"><span class="tipicon">💡</span><span><b>Dica:</b> ${tipShown(q)}</span></div>`:q.hint?`<p class="hint">${q.hint}</p>`:''}
        <div class="${cls}" style="--n:${n}">${q.choices.map((c,i)=>`<button class="choice${c.wide?' wide':''}" data-c="${i}" aria-label="${esc(c.say)}"${q.grid?` style="background:${ROWTINT[rowOf(i+1)]}"`:''}>${c.html}</button>`).join('')}</div>
        <div class="feedback" id="fb" aria-live="polite"></div>
      </section>
    </div></div>`;
  const t=setTimeout(()=>RV?speakTwo(voiceFor(q),tipVoice(q)):speak(voiceFor(q)),250);cleanup=()=>clearTimeout(t);
}
function choose(i,btn){
  const r=S.round;if(!r||r.lock)return;const q=curQ(r);const c=q.choices[i];const m=mate();
  const fb=document.getElementById('fb'),say=document.getElementById('say'),buddy=document.getElementById('buddy'),st=document.getElementById('streak');
  if(c.v===q.answer){
    r.lock=true;btn.classList.add('ok');if(r.review){if(r.tries===0)r.review.first++}else{if(r.tries===0){r.score++;r.streak++}else r.streak=0;r.marks[r.i]=r.tries===0}
    const raw=pick(m.cheers);fb.className='feedback good';fb.textContent='Acertou!';say.textContent=fill(raw);
    buddy.classList.remove('bob','shake');void buddy.offsetWidth;buddy.classList.add('jump');const ss=is67(q.answer);if(ss)sixSeven();else{sndOk();speakLine(raw)}flyAt(btn,r.tries===0?'+1 ⭐':'✓');
    const rc=btn.getBoundingClientRect();confetti(36,{x:rc.left+rc.width/2,y:rc.top+rc.height/2});
    if(st){st.textContent=r.streak>=2?`🔥 ${r.streak} seguidas!`:'';st.classList.remove('hot');void st.offsetWidth;if(r.streak>=2)st.classList.add('hot')}
    setTimeout(next,ss?3000:1800);
  }else{
    r.tries++;r.streak=0;if(st)st.textContent='';btn.classList.add('bad');btn.disabled=true;sndBad();buddy.classList.remove('bob','jump');void buddy.offsetWidth;buddy.classList.add('shake');
    if(r.review){
      // in review the question stays until it is right: wrong options fade out and the tip pulses
      const raw=pick(m.oops);fb.className='feedback oops';fb.textContent='Quase! Leia a dica e tente de novo.';say.textContent=fill(raw);
      const tb=document.getElementById('tipbox');if(tb){tb.classList.remove('pulse');void tb.offsetWidth;tb.classList.add('pulse')}
      speak(tipVoice(q));
    }else if(r.tries>=2){
      r.lock=true;r.marks[r.i]=false;
      const k=q.choices.findIndex(x=>x.v===q.answer);const good=document.querySelector(`[data-c="${k}"]`);if(good)good.classList.add('reveal');
      fb.className='feedback oops';fb.textContent='Olha a resposta certa aqui!';say.textContent='Na próxima você acerta!';
      speak(revealFor(q.choices[k]));setTimeout(next,2800);
    }else{
      const raw=pick(m.oops);fb.className='feedback oops';fb.textContent='Quase! Tente outra vez.';say.textContent=fill(raw);speakLine(raw);
    }
  }
}
function next(){
  const r=S.round;if(S.screen!=='play')return;r.tries=0;r.lock=false;
  if(r.review){r.review.i++;if(r.review.i<r.review.list.length)return render();return finishRound(r)}
  r.i++;
  if(r.i>=ROUND){
    const missed=r.qs.filter((_,i)=>!r.marks[i]);
    if(missed.length){r.review={list:missed.map(q=>Object.assign({},q,{choices:shuf(q.choices)})),i:0,first:0};S.screen='reviewintro';render();speak(REVIEW_SAY);return}
    finishRound(r);
  }else render();
}
function finishRound(r){
  {
    let stars=r.score>=7?3:r.score>=5?2:1;if(r.review&&r.review.first===r.review.list.length)stars=Math.min(3,stars+1);const g=grade(),w=roundWorld(r);r.stars=stars;
    if(r.bonus)setBonusStars(w,r.li,stars);else{const k=pkey(g.id,w.id);const p=S.prog[k]||[0,0,0];p[r.li]=Math.max(p[r.li]||0,stars);S.prog[k]=p;saveProfile()}
    S.screen='result';render();
    postLesson({key:r.bonus?bkey(w,r.li):pkey(g.id,w.id),level:r.bonus?0:r.li,stars,score:r.score,total:ROUND,reviews:r.review?r.review.list.length:0,seconds:Math.round((Date.now()-r.t0)/1000)},showReward);
  }
}
function renderReviewIntro(){const r=S.round,w=roundWorld(r),n=r.review.list.length;
  $app.innerHTML=`<section class="result screen" style="--c:${w.color}"><div class="buddy bob">${meDraw()}</div>
    <div class="bignum" style="font-size:4rem">💡</div><h2>Hora de revisar!</h2>
    <p>Você vai refazer ${n===1?'a pergunta que ficou difícil':`as ${n} perguntas que ficaram difíceis`}, agora com uma dica.</p>
    <p>Acertando todas de primeira, você ganha uma estrela a mais!</p>
    <div class="btnrow"><button class="btn big wiggle" style="--c:${w.color};--on:${w.on||'#fff'}" data-act="reviewgo">Revisar</button></div></section>`}
const RESULT_T={3:'Incrível, NOME!',2:'Muito bem, NOME!',1:'Bom treino!'};
function renderResult(){
  const r=S.round,w=roundWorld(r),m=mate();
  const lines={3:fill(m.cheers[0]),2:'Falta pouquinho para 3 estrelas. Tenta de novo?',1:'Cada jogo deixa você mais forte. Bora de novo?'};
  $app.innerHTML=`<section class="result screen" style="--c:${w.color};--on:${w.on||'#fff'}">
    <div class="buddy dance">${meDraw()}</div>
    <div class="bigstars">${starStr(r.stars)}</div>
    <h2>${esc(fill(RESULT_T[r.stars]))}</h2>
    <p>Você acertou ${r.score} de ${ROUND} de primeira em ${esc(w.name)}, ${r.bonus?esc(w.acts[r.li].name):`nível ${r.li+1}`}.</p>
    ${rewardSlot()}
    ${r.review?`<p>💡 Revisão: ${r.review.first} de ${r.review.list.length} de primeira${r.review.first===r.review.list.length?' — ganhou uma estrela a mais!':'.'}</p>`:''}
    <p>${esc(lines[r.stars])}</p>
    <div class="btnrow">
      <button class="btn ghost" data-act="again">Jogar de novo</button>
      ${!r.bonus&&r.li<2?`<button class="btn" data-act="nextlvl">Nível ${r.li+2}</button>`:''}
      <button class="btn" style="--c:var(--purple)" data-act="map">Outros mundos</button>
    </div></section>`;
  stopSpeech();celebrate(r.stars,()=>{if(S.screen==='result')speakLine(`${RESULT_T[r.stars]} Você ganhou ${r.stars} estrela${r.stars>1?'s':''}!`)});
}
async function start(){
  const inp=document.getElementById('nm');if(inp)S.name=inp.value.trim().slice(0,20);
  if(!NAME_OK(S.name)){const err=document.getElementById('nmerr');if(err)err.textContent=S.name?'Use só letras no nome.':'Digite seu nome para começar.';if(inp)inp.focus();return}
  // online, a new player is created on the server right away: name + birth date are the login
  if(ONLINE&&(S.editing==='new'||!activeProfile())){const dob=dobValue('hdob'),bad=dobErr(dob),err=document.getElementById('nmerr');if(bad){err.textContent=bad;return}
    S.dob=dob;err.textContent='Criando...';
    try{const s2=await api('/players','POST',{name:S.name,gender:S.gender,mate:S.mate,grade:S.grade,birthDate:dob});S.dob='';S.editing=null;const p=adoptPlayer(s2);pickPlayer(p.id);return}
    catch(e){err.textContent=e.status===409?e.message:e.status?(e.message||'Confira os dados.'):'Sem conexão agora. Tente de novo.';return}}
  if(S.editing==='new'||!activeProfile()){const p={id:'local-'+Date.now(),code:null,name:S.name,gender:S.gender,mate:S.mate,grade:S.grade,prog:{},gems:0};PROFILES.push(p);ACTIVE=p.id;S.prog={};S.gems=0}
  else if(S.editing)ACTIVE=S.editing;
  S.editing=null;saveProfile();loadVoz('g-'+S.grade);S.screen='map';render();musicOn();speakLine(mate().hi);
}
function setGrade(id){S.grade=id;if(S.screen!=='home')saveProfile();loadVoz('g-'+id)}

/* ================= Events ================= */
const $app=document.getElementById('app');
$app.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;if(S.sound||S.music)ctx();if(rewardsClick(b))return;
  if(b.dataset.pick){pickPlayer(b.dataset.pick);return}
  if(b.dataset.login){openLogin({mode:'id',id:b.dataset.login});return}
  if(b.dataset.edit){const p=PROFILES.find(x=>x.id===b.dataset.edit);if(p){S.editing=p.id;loadProfile(p);S.screen='home';render()}return}
  if(b.dataset.rtab){loadRank(b.dataset.rtab);return}
  if(S.screen==='home'&&document.getElementById('hdob')){const d=dobValue('hdob');if(d&&d!=='bad')S.dob=d}
  if(b.dataset.mate){S.mate=b.dataset.mate;const inp=document.getElementById('nm');if(inp)S.name=inp.value.trim().slice(0,20);
    renderHome();speakLine(MATES[S.mate].hi);return}
  if(b.dataset.gender){S.gender=b.dataset.gender;const inp=document.getElementById('nm');if(inp)S.name=inp.value.trim().slice(0,20);renderHome();return}
  if(b.dataset.grade){setGrade(b.dataset.grade);if(S.screen==='home'){const inp=document.getElementById('nm');if(inp)S.name=inp.value.trim().slice(0,20);renderHome()}else render();return}
  if(b.dataset.c!=null){choose(+b.dataset.c,b);return}
  if(b.dataset.b!=null){openBonus(+b.dataset.b,+b.dataset.a);return}
  if(b.dataset.n!=null){exploreTap(+b.dataset.n);return}
  if(b.dataset.s!=null){seqTap(+b.dataset.s,b);return}
  if(b.dataset.tab!=null){setTab(+b.dataset.tab);sndPop();if(S.screen==='map'){document.querySelectorAll('.tabchips .chip').forEach(c=>c.setAttribute('aria-pressed',String(+c.dataset.tab===TAB.n)));return}if(S.screen==='tabex'){S.tabex.sel=null;S.tabex.auto=false}render();if(S.screen==='tabex')speak(`Tabuada do ${TAB.n||2}!`);return}
  if(b.dataset.tk!=null){if(!S.tabex.auto)tabShow(+b.dataset.tk);return}
  if(b.dataset.w!=null){openWorld(+b.dataset.w,+b.dataset.l);return}
  const a=b.dataset.act;
  if(a==='start')start();
  else if(a==='map'){stopSpeech();S.screen='map';render()}
  else if(a==='home'||a==='who'){stopSpeech();if(activeProfile())loadProfile(activeProfile());firstScreen();render()}
  else if(a==='newp'){S.editing='new';S.name='';S.gender='f';S.mate='estrela';S.grade='1';S.screen='home';render()}
  else if(a==='rank')loadRank('all');
  else if(a==='count1')exploreCount(1);
  else if(a==='count10')exploreCount(10);
  else if(a==='tabread')tabRead();
  else if(a==='seqagain')openBonus(S.bonus.bi,S.bonus.ai);
  else if(a==='say'){const r=S.round,q=curQ(r);r.review?speakTwo(voiceFor(q),tipVoice(q)):speak(voiceFor(q))}
  else if(a==='reviewgo'){stopSpeech();S.screen='play';render()}
  else if(a==='sound'){S.sound=!S.sound;store.set('sound',S.sound);if(!S.sound)stopSpeech();render()}
  else if(a==='music'){S.music=!S.music;store.set('music',S.music);if(S.music)musicOn();else musicOff();render()}
  else if(a==='minigo'){S.mini.score=0;const g=grade();S.mini.spec=MINI[g.id]();S.mini.goal=miniGoal(S.mini.kind,S.mini.spec);S.screen='mini';render();speak(S.mini.goal)}
  else if(a==='miniskip'){stopSpeech();newRound(S.mini.wi,S.mini.li)}
  else if(a==='again')newRound(S.round.wi,S.round.li,S.round.bonus);
  else if(a==='nextlvl')openWorld(S.round.wi,S.round.li+1);
});

const GT=typeof globalThis!=='undefined'?globalThis:window;
if(GT.__EXPORT){GT.__EXPORT({dressed,SHOP,LOGIN_SAY,EXCHANGE_SAY,SIXSEVEN_SAY,tabSay,TAB,tipFor,tipVoice,REVIEW_SAY,BONUS,BONUS_SAY,GRADES,MATES,MATE_ORDER,MINI,MINI_KIND,MINI_INFO,miniGoal,voiceFor,revealFor,clipKeys,spoken,gx,normName,safeSay,RESULT_T});}
else{loadVoz('comum');loadVoz('nomes');loadVoz('g-'+S.grade);floaty();firstScreen();render();}
})();
</script>
