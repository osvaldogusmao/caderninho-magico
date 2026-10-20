/* ================= End-of-lesson celebration: scene + original tune per companion ================= */
const MATE_THEME={estrela:'pop',jade:'pop',luna:'pop',kai:'pop',boiadeira:'campo',bia:'futebol',leo:'futebol',mari:'mar',sofia:'espaco',theo:'espaco',rafa:'ninja',pistinha:'cao',fofucho:'fofo',dino:'dino',bipe:'robo'};
const CEL={
 pop:{title:'Show de matemática!',fx:['⭐','✨','🎤','💜','🎶','💖'],mode:'zoom',scene:'<div class="spot l"></div><div class="spot r"></div><div class="stage"></div>'},
 campo:{title:'Ê trem bão!',fx:['🤠','⭐','🌻','🎶','🐴'],mode:'fall',scene:'<div class="sun"></div><div class="fence"></div><div class="hatfly">🤠</div>'},
 futebol:{title:'Gol de placa!',fx:['⚽','🏆','🎉','⭐','🥇'],mode:'fall',scene:'<div class="field"></div><div class="goal">🥅</div><div class="kick">⚽</div><div class="gol">GOOOL!</div>'},
 mar:{title:'Que mergulho!',fx:['🐚','🐠','💎','⭐','🐬'],mode:'rise',scene:'<div class="bubbles">'+'<i></i>'.repeat(14)+'</div><svg class="waves" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0 60 Q150 20 300 60 T600 60 T900 60 T1200 60 V120 H0Z" fill="#0E7C9B"/><path d="M0 80 Q150 50 300 80 T600 80 T900 80 T1200 80 V120 H0Z" fill="#0A5F7A"/></svg>'},
 espaco:{title:'Missão cumprida!',fx:['⭐','🌟','🪐','☄️','✨'],mode:'zoom',scene:'<div class="stars">'+'<i></i>'.repeat(30)+'</div><div class="planet"></div><div class="rocket">🚀</div>'},
 ninja:{title:'Golpe ninja perfeito!',fx:['🌸','🍃','⭐','🌸'],mode:'fall',scene:'<div class="moon"></div><svg class="shuriken" viewBox="0 0 40 40"><path d="M20 0 L24 16 L40 20 L24 24 L20 40 L16 24 L0 20 L16 16Z" fill="#2B2F45"/><circle cx="20" cy="20" r="4" fill="#C9CEDF"/></svg>'},
 cao:{title:'Pista encontrada!',fx:['🦴','🎾','⭐','🐾'],mode:'fall',scene:'<div class="grass"></div><div class="paws">'+'<span>🐾</span>'.repeat(8)+'</div>'},
 fofo:{title:'Que fofura de lição!',fx:['💖','💕','🌈','⭐','☁️'],mode:'rise',scene:'<div class="rainbow"></div><div class="cloud c1"></div><div class="cloud c2"></div>'},
 dino:{title:'Rooar! Lição jurássica!',fx:['🦕','🥚','⭐','🌿','🦖'],mode:'fall',scene:'<div class="volcano">🌋</div><div class="ground"></div>'},
 robo:{title:'Bip bop! Missão completa!',fx:['⚙️','🔩','💡','⭐','🔋'],mode:'rise',scene:'<div class="circuit"></div><div class="gear g1">⚙️</div><div class="gear g2">⚙️</div>'}
};
/* tiny synth: notes in beats, drums from a noise buffer */
function playTune(theme){
  const c=ctx();if(!c||!S.sound)return{stop(){},dur:7};
  const out=c.createGain();out.gain.value=.55;out.connect(c.destination);
  const echo=c.createDelay();echo.delayTime.value=.33;const fb=c.createGain();fb.gain.value=.3;echo.connect(fb).connect(echo);echo.connect(out);
  const srcs=[];const t0=c.currentTime+.1;let bpm=120;const spb=()=>60/bpm;
  const hz=m=>440*Math.pow(2,(m-69)/12);
  let noise=null;{const n=c.sampleRate;noise=c.createBuffer(1,n,n);const d=noise.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1}
  const note=(b,m,len,o={})=>{if(m==null)return;const t=t0+b*spb(),d=Math.max(.05,len*spb());const osc=c.createOscillator(),g=c.createGain();osc.type=o.w||'triangle';osc.frequency.value=hz(m);
    if(o.vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=o.vib;lg.gain.value=hz(m)*.012;l.connect(lg).connect(osc.frequency);l.start(t);l.stop(t+d+.3);srcs.push(l)}
    const v=o.v||.15,rel=d*(o.sus||1);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(o.a||.012));g.gain.exponentialRampToValueAtTime(.0001,t+rel+.02);osc.connect(g);
    let dst=g;if(o.f){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=o.f;g.connect(f);dst=f}dst.connect(out);if(o.echo)dst.connect(echo);osc.start(t);osc.stop(t+rel+.1);srcs.push(osc)};
  const drum=(b,k)=>{const t=t0+b*spb();
    if(k==='kick'||k==='taiko'||k==='boom'){const o=c.createOscillator(),g=c.createGain();const f0=k==='kick'?150:k==='taiko'?110:90,f1=k==='kick'?40:k==='taiko'?55:30,dec=k==='kick'?.18:k==='taiko'?.45:.6,v=k==='kick'?.5:k==='taiko'?.6:.7;
      o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dec*.8);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+dec);o.connect(g).connect(out);o.start(t);o.stop(t+dec+.05);srcs.push(o);return}
    const s=c.createBufferSource();s.buffer=noise;const f=c.createBiquadFilter(),g=c.createGain();
    const P={snare:['bandpass',1800,.16,.3],hat:['highpass',7000,.045,.12],tcha:['highpass',4000,.09,.16],wood:['bandpass',1200,.05,.25],crash:['highpass',5000,1.2,.18],shaker:['highpass',6000,.07,.06]}[k];
    f.type=P[0];f.frequency.value=P[1];g.gain.setValueAtTime(P[3],t);g.gain.exponentialRampToValueAtTime(.0001,t+P[2]);s.connect(f).connect(g).connect(out);s.start(t,Math.random()*.5);s.stop(t+P[2]+.05);srcs.push(s)};
  const seq=(b0,ns,step,o)=>ns.forEach((m,i)=>note(b0+i*step,m,o.len||step,o));
  const chordAt=(b,ms,len,o)=>ms.forEach(m=>note(b,m,len,o));
  let beats=16;
  if(theme==='pop'){bpm=118;for(let b=0;b<16;b++){drum(b,'kick');if(b%2)drum(b,'snare');drum(b,'hat');drum(b+.5,'hat')}
    [[48,[60,64,67]],[43,[59,62,67]],[45,[60,64,69]],[41,[60,65,69]]].forEach(([r,ch],i)=>{seq(i*4,[r,r,r+12,r,r,r+12,r,r],.5,{w:'sawtooth',f:700,v:.16});seq(i*4,[...ch,ch[1],...ch,ch[1],...ch,ch[1],...ch,ch[1]].map(x=>x+12),.25,{v:.05})});
    seq(0,[76,79,81,79,76,74,72,74,76,79,84,83,81,79,76,null],1,{w:'square',f:2600,v:.08,len:.9});chordAt(15,[72,76,79,84],1.5,{w:'sawtooth',f:3000,v:.06});drum(15,'crash')}
  else if(theme==='campo'){bpm=108;const bass=[43,50,48,43,50,45,43,50];bass.forEach((m,i)=>{note(i*2,m,.9,{w:'triangle',v:.25});note(i*2+1,m===43?38:m-5,.9,{w:'triangle',v:.2})});
    const ch=[[67,71,74],[67,72,76],[66,69,74],[67,71,74],[67,71,74],[67,72,76],[66,69,72],[67,71,74]];for(let b=0;b<16;b++){drum(b,'kick');drum(b+.5,'tcha');chordAt(b+.5,ch[Math.floor(b/2)],.35,{w:'square',f:1800,v:.04,vib:6})}
    seq(0,[67,71,74,74,76,74,71,67,69,72,76,74,72,69,66,69,67,71,74,79,78,76,74,71,69,71,72,69,67,null,79,null],.5,{w:'sawtooth',f:2400,v:.1,vib:5,len:.45});chordAt(15.5,[67,71,74,79],1.2,{w:'square',f:2000,v:.06,vib:6})}
  else if(theme==='futebol'){bpm=128;for(let i=0;i<8;i++)drum(i*.125,'snare');for(let b=1;b<16;b++){drum(b,'kick');if(b%2)drum(b,'snare')}
    const br={w:'sawtooth',f:2800,v:.11};[[0,72],[.5,72],[1,72],[2,79,1.5],[4,81],[4.5,81],[5,81],[6,79,1],[7,76,1]].forEach(([b,m,l])=>{note(b,m,l||.4,br);note(b,m-4,l||.4,{...br,v:.07})});
    [[8,76,1],[9,76,.5],[9.5,76,.5],[10,74,1],[11,72,1],[12,76,1],[13,79,1],[14,84,2]].forEach(([b,m,l])=>{note(b,m,l,br);note(b,m-5,l,{...br,v:.06})});drum(14,'crash');
    seq(0,[48,48,55,55,53,53,55,55,48,48,55,55,53,55,48,48],1,{w:'triangle',v:.2})}
  else if(theme==='mar'){bpm=96;beats=15;const roots=[48,45,41,43,48];roots.forEach((r,i)=>{note(i*3,r,2.8,{w:'sine',v:.22});const ch=[r+12,r+16,r+19];chordAt(i*3+1,ch,.9,{w:'triangle',v:.05});chordAt(i*3+2,ch,.9,{w:'triangle',v:.05});drum(i*3+1,'shaker');drum(i*3+2,'shaker')});
    [[0,76,1],[1,79,1],[2,84,1],[3,83,2],[5,81,1],[6,79,1],[7,81,1],[8,77,1],[9,76,2],[11,74,1],[12,72,1],[12.5,76,.5],[13,79,.5],[13.5,84,1.5]].forEach(([b,m,l])=>note(b,m,l,{w:'sine',v:.16,sus:2.2,echo:1}))}
  else if(theme==='espaco'){bpm=100;const chs=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]];chs.forEach((ch,i)=>{const arp=[...ch,ch[0]+12,...ch.slice().reverse(),ch[0]+12].map(x=>x+12);for(let k=0;k<16;k++)note(i*4+k*.25,arp[k%arp.length],.24,{w:'sine',v:.06,echo:1});note(i*4,ch[0]-12,4,{w:'sawtooth',f:500,v:.09,a:.4});if(i%1===0){drum(i*4,'kick');drum(i*4+2,'kick')}});
    [[0,81,2],[2,84,2],[4,84,2],[6,81,1],[7,79,1],[8,76,2],[10,79,2],[12,83,3],[15,81,1.5]].forEach(([b,m,l])=>note(b,m,l,{w:'sine',v:.15,a:.05,echo:1}));drum(15,'crash')}
  else if(theme==='ninja'){bpm=112;[0,1.5,2,3].forEach(o=>{for(let bar=0;bar<4;bar++)drum(bar*4+o,'taiko')});for(let b=0;b<16;b++)drum(b+.5,'wood');
    note(0,50,16,{w:'sawtooth',f:450,v:.07,a:.3});
    seq(0,[74,77,79,81,84,81,79,77,74,77,79,81,79,77,74,72,74,77,81,84,86,84,81,79,77,79,81,77,74,null,86,null],.5,{w:'triangle',v:.17,sus:.5,len:.5});chordAt(15,[62,69,74],1.5,{w:'triangle',v:.08,sus:1.5})}
  else if(theme==='cao'){bpm=140;for(let b=0;b<16;b++){note(b,b%2?43:48,.3,{w:'triangle',v:.22,sus:.5});drum(b+.5,'wood')}
    seq(0,[72,76,79,76,84,79,76,79,77,81,84,81,79,83,86,83,72,76,79,76,84,79,76,79,77,79,83,86,84,null,96,null],.5,{w:'sine',v:.2,sus:.35,len:.5});drum(15,'crash')}
  else if(theme==='fofo'){bpm=84;beats=12;[[0,[48,52,55]],[4,[43,47,50]],[8,[48,52,55]]].forEach(([b,ch])=>{for(let k=0;k<4;k++)chordAt(b+k,ch.map(x=>x+12),.9,{w:'triangle',v:.035})});
    seq(0,[88,91,88,84,86,89,86,83,84,88,91,96],1,{w:'sine',v:.13,sus:2.5,len:1,echo:1});note(11,84,2,{w:'sine',v:.1,sus:2})}
  else if(theme==='dino'){bpm=92;for(let b=0;b<16;b++){drum(b,'boom');if(b%2)drum(b,'snare')}
    seq(0,[36,36,31,36,39,39,34,39,41,41,36,41,43,43,38,43],1,{w:'sawtooth',f:350,v:.22,len:.7});
    seq(0,[48,52,55,60,55,52,48,null,53,57,60,65,67,71,74,79],1,{w:'sawtooth',f:900,v:.12,len:.8});drum(15,'crash')}
  else{bpm=144;const chs=[[72,76,79],[69,72,76],[65,69,72],[67,71,74]];chs.forEach((ch,i)=>{for(let k=0;k<16;k++)note(i*4+k*.25,ch[k%3]+(k%6===5?12:0),.2,{w:'square',v:.045});drum(i*4,'kick');drum(i*4+2,'kick');drum(i*4+1,'snare');drum(i*4+3,'snare')});
    seq(0,[84,88,91,96,91,88,84,null,81,84,88,93,91,86,83,91],1,{w:'square',v:.07,len:.6});chordAt(15,[84,88,91,96],1.2,{w:'square',v:.05})}
  const dur=beats*60/bpm+1.2;
  return{dur,beatMs:60000/bpm,stop(){try{out.gain.cancelScheduledValues(c.currentTime);out.gain.setTargetAtTime(.0001,c.currentTime,.08)}catch(e){}setTimeout(()=>{srcs.forEach(s=>{try{s.stop()}catch(e){}});try{out.disconnect()}catch(e){}},400)}};
}
function celebrate(stars,done){
  const theme=MATE_THEME[S.mate]||'pop',T=CEL[theme];const wasMusic=!!musicTimer;musicOff();
  const el=document.createElement('div');el.className=`celebrate th-${theme}`;el.setAttribute('role','dialog');el.setAttribute('aria-label','Lição concluída');
  el.innerHTML=`<div class="cel-scene">${T.scene}</div><div class="cel-fx"></div>
    <div class="cel-center"><div class="cel-buddy">${meDraw()}</div><div class="cel-title">${T.title}</div><div class="bigstars">${starStr(stars)}</div><div class="cel-sub">Toque para continuar</div></div>`;
  document.body.appendChild(el);
  el.querySelectorAll('.stars i').forEach(i=>{i.style.left=R(0,100)+'%';i.style.top=R(0,100)+'%'});
  const fx=el.querySelector('.cel-fx');const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce)for(let i=0;i<34;i++){const s=document.createElement('span');s.className='p '+T.mode;s.textContent=pick(T.fx);s.style.left=R(0,96)+'%';s.style.fontSize=R(22,46)+'px';s.style.animationDelay=(R(0,4000)/1000)+'s';s.style.animationDuration=(R(30,55)/10)+'s';fx.appendChild(s)}
  const tune=playTune(theme);
  const buddy=el.querySelector('.cel-buddy');buddy.style.animationDuration=(tune.beatMs?tune.beatMs/1000:.5)+'s';
  let shakeIv=null;if(theme==='dino'&&!reduce)shakeIv=setInterval(()=>{el.classList.remove('stomp');void el.offsetWidth;el.classList.add('stomp')},tune.beatMs||650);
  if(stars>=2)setTimeout(()=>confetti(stars===3?160:80),400);
  let closed=false;const close=()=>{if(closed)return;closed=true;clearInterval(shakeIv);tune.stop();el.classList.add('out');setTimeout(()=>el.remove(),400);if(wasMusic||S.music)musicOn();done&&done()};
  el.addEventListener('click',close);setTimeout(close,Math.max(6500,tune.dur*1000));
}
/* "Six seven!": the kids' meme, shown whenever an answer is 67 (palms up, going up and down in turns) */
const SS_HAND=`<svg viewBox="0 0 120 120" width="100%" height="100%"><g fill="#F6C59F" stroke="#C98B63" stroke-width="3">
  <rect x="22" y="14" width="15" height="44" rx="7.5"/><rect x="40" y="6" width="15" height="50" rx="7.5"/><rect x="58" y="8" width="15" height="48" rx="7.5"/><rect x="76" y="18" width="14" height="40" rx="7"/>
  <rect x="88" y="52" width="14" height="34" rx="7" transform="rotate(-38 95 69)"/><path d="M20 50 Q20 104 56 106 Q92 104 92 52 Z"/></g>
  <path d="M38 78 Q56 88 74 78" fill="none" stroke="#C98B63" stroke-width="3" stroke-linecap="round"/></svg>`;
function sixSeven(){try{const old=document.querySelector('.sixseven');if(old)old.remove();
  const el=document.createElement('div');el.className='sixseven';el.setAttribute('aria-live','polite');
  el.innerHTML=`<div class="ss-title">SIX SEVEN!</div><div class="ss-hands"><div class="ss-hand"><b>6</b><i>${SS_HAND}</i></div><div class="ss-hand r"><b>7</b><i>${SS_HAND}</i></div></div>`;
  const close=()=>{if(el.parentNode)el.parentNode.removeChild(el)};el.addEventListener('click',close);document.body.appendChild(el);setTimeout(close,2700)}catch(e){}
  tone([[392,.16,'square'],[523,.16,'square'],[392,.16,'square'],[523,.24,'square']],.12);setTimeout(()=>speak(SIXSEVEN_SAY),150)}
const SIXSEVEN_SAY='Six seven!';
const is67=v=>String(v)==='67';
