/* ================= Login (name + birth date), diamonds, Family Coin and the parents' area =================
   Only online (served by the app at /caderninho): the server owns diamonds, lessons and exchanges. */
const MONTHS=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const money=c=>(c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const fcoin=(n,cls)=>`<span class="fcoin${cls?' '+cls:''}" aria-hidden="true">F</span>${n==null?'':` ${n}`}`;
const fcName=n=>`${n} Family Coin${n===1?'':'s'}`;
// three big selects work on every iPad (iOS 12 included) and are easy for a parent to help with
function dobPicker(id,val){const p=(val||'').split('-').map(Number),Y=new Date().getFullYear();let ys='';for(let y=Y-2;y>=1990;y--)ys+=`<option value="${y}"${p[0]===y?' selected':''}>${y}</option>`;
  return `<div class="dob" id="${id}"><select data-dob="d" aria-label="Dia"><option value="">Dia</option>${Array.from({length:31},(_,i)=>`<option value="${i+1}"${p[2]===i+1?' selected':''}>${i+1}</option>`).join('')}</select>
    <select data-dob="m" aria-label="Mês"><option value="">Mês</option>${MONTHS.map((m,i)=>`<option value="${i+1}"${p[1]===i+1?' selected':''}>${m}</option>`).join('')}</select>
    <select data-dob="y" aria-label="Ano"><option value="">Ano</option>${ys}</select></div>`}
function dobValue(id){const el=document.getElementById(id);if(!el)return '';const v=k=>+el.querySelector(`[data-dob="${k}"]`).value;const d=v('d'),m=v('m'),y=v('y');if(!d||!m||!y)return '';
  const s=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const t=new Date(s+'T00:00:00Z');return !isNaN(t)&&t.toISOString().slice(0,10)===s?s:'bad'}
const dobErr=v=>!v?'Escolha o dia, o mês e o ano em que você nasceu.':v==='bad'?'Essa data não existe. Confira o dia e o mês.':'';
function setErr(id,t){const e=document.getElementById(id);if(e)e.textContent=t}

/* ---- child login ---- */
// a server player (from /login or /players) becomes a profile saved on this device
function adoptPlayer(s){let p=PROFILES.find(x=>x.id===s.id);if(!p){p={id:s.id};PROFILES.push(p)}
  Object.assign(p,{code:s.code,name:s.name,birthDate:s.birthDate,gender:s.gender,mate:s.mate,grade:s.grade,prog:mergeProg(p.prog,s.progress),gems:s.gems||0,items:s.items||[],wear:s.wear||{}});store.set('profiles',PROFILES);return p}
// mode: 'id' (tapped in the list), 'name' (types the name), 'create' (a device profile not yet on the server), 'setdob' (device profile without a birth date)
function openLogin(o){S.login=Object.assign({err:''},o);S.screen='login';render();speak(LOGIN_SAY)}
const LOGIN_SAY='Qual é a sua data de nascimento?';
function renderLogin(){const L=S.login,p=L.pid?PROFILES.find(x=>x.id===L.pid):null,o=L.id?(OTHERS||[]).find(x=>x.id===L.id):null;const who=p||o;const m=MATES[(who&&who.mate)||S.mate]||MATES.estrela;
  $app.innerHTML=`<section class="home screen"><div style="width:120px" class="bob">${m.draw()}</div>
    <form class="card loginbox" id="loginform">
      <h2>${who?`Olá, ${esc(who.name)}!`:'Entrar'}</h2>
      ${L.mode==='name'?`<label class="steplabel" for="lname">Seu nome</label><input id="lname" class="bigin" maxlength="20" autocomplete="off" placeholder="Seu nome">`:''}
      <div class="steplabel">Qual é a sua data de nascimento?</div>${dobPicker('ldob','')}
      <p class="hint">Se precisar, peça ajuda para um adulto.</p>
      <p class="err" id="lerr" aria-live="polite">${esc(L.err)}</p>
      <div class="btnrow"><button class="btn big" style="--c:var(--pink)" type="submit">Entrar</button><button class="btn ghost" type="button" data-act="who">Voltar</button></div>
    </form></section>`;
  document.getElementById('loginform').addEventListener('submit',e=>{e.preventDefault();doLogin()})}
async function doLogin(){const L=S.login,dob=dobValue('ldob');const bad=dobErr(dob);if(bad)return setErr('lerr',bad);
  const nameIn=document.getElementById('lname');setErr('lerr','Entrando...');
  try{let s;
    if(L.mode==='id')s=await api('/login','POST',{id:L.id,birthDate:dob});
    else if(L.mode==='name'){const n=nameIn.value.trim();if(!NAME_OK(n))return setErr('lerr','Digite seu nome.');s=await api('/login','POST',{name:n,birthDate:dob})}
    else if(L.mode==='setdob'){const p=PROFILES.find(x=>x.id===L.pid);s=await api('/login','POST',{id:p.id,birthDate:dob})}
    else{const p=PROFILES.find(x=>x.id===L.pid);
      try{s=await api('/players','POST',{name:p.name,gender:p.gender,mate:p.mate,grade:p.grade,birthDate:dob})}
      catch(e){if(e.status!==409)throw e;s=await api('/login','POST',{name:p.name,birthDate:dob})}
      // the device profile becomes the server one, keeping its stars
      PROFILES=PROFILES.filter(x=>x.id!==p.id);s.progress=mergeProg(p.prog,s.progress)}
    const p=adoptPlayer(s);pickPlayer(p.id);scheduleSync()}
  catch(e){setErr('lerr',e.status===401||e.status===404?(e.message||'Essa data não confere.'):'Sem conexão agora. Tente de novo.')}}

/* ---- lessons: the server records each one and pays its diamonds (with the daily limit) ---- */
let LQ=null;// lessons waiting to reach the server (offline or a failed request), kept on the device
function postLesson(body,show){const p=activeProfile();if(!ONLINE||!p||!p.code)return;if(!LQ)LQ=store.get('lq',[]);LQ.push({pid:p.id,code:p.code,body});store.set('lq',LQ);flushLessons(show)}
let flushing=false;
async function flushLessons(show){if(flushing)return;if(!LQ)LQ=store.get('lq',[]);flushing=true;
  try{while(LQ.length){const it=LQ[0];let res;
      try{res=await api(`/players/${encodeURIComponent(it.pid)}/lessons`,'POST',Object.assign({code:it.code},it.body))}
      catch(e){if(e.status&&e.status<500){LQ.shift();store.set('lq',LQ);continue}break}
      LQ.shift();store.set('lq',LQ);const p=PROFILES.find(x=>x.id===it.pid);if(p){p.gems=res.gems;store.set('profiles',PROFILES)}
      if(it.pid===ACTIVE){S.gems=res.gems;if(show)show(res)}}}
  finally{flushing=false}}
// the reward line on the result screens
function showReward(res){const el=document.getElementById('reward');if(!el)return;
  if(res.earned){el.innerHTML=`<span class="gemup">+${res.earned} 💎</span> Você ganhou ${res.earned} diamante${res.earned>1?'s':''}!`;el.className='reward on';tone([[988,.08],[1319,.14]],.12)}
  else if(res.today>=res.limit){el.innerHTML=`💎 Você já ganhou todos os diamantes de hoje (${res.limit}). Amanhã tem mais!`;el.className='reward on'}}
const rewardSlot=()=>ONLINE&&activeProfile()&&activeProfile().code?'<p class="reward" id="reward" aria-live="polite"></p>':'';

/* ---- wallet: diamonds and Family Coins ---- */
function openWallet(){S.wallet={data:null,err:'',busy:false};S.screen='wallet';render();loadWallet()}
async function loadWallet(){const p=activeProfile();if(!p||!p.code)return;
  try{const d=await api(`/players/${encodeURIComponent(p.id)}/wallet?code=${encodeURIComponent(p.code)}`,'GET');S.wallet.data=d;S.gems=p.gems=d.gems;store.set('profiles',PROFILES)}
  catch(e){S.wallet.err='Sem conexão agora. Tente de novo mais tarde.'}if(S.screen==='wallet')render()}
const EXST={pending:['⏳','Esperando seus pais'],paid:['✅','Recebido'],rejected:['↩️','Não aprovado: diamantes devolvidos']};
function renderWallet(){const W=S.wallet,d=W.data;let body;
  if(W.err)body=`<p class="hint">${esc(W.err)}</p>`;else if(!d)body='<p class="hint">Carregando...</p>';
  else{const f=d.family;const max=f?Math.floor(d.gems/f.gemsPerCoin):0;
    const trade=!f?`<div class="card wnote"><p>Para trocar seus diamantes por ${fcoin()} <b>Family Coins</b>, peça para seus pais abrirem a <b>Área dos pais</b>.</p></div>`
      :`<div class="card wtrade"><div class="wrate">${f.gemsPerCoin} 💎 = ${fcoin(1)} Family Coin = <b>${money(f.coinCents)}</b></div>
        ${max?`<div class="btnrow">${[...new Set([1,Math.min(5,max),max])].filter(n=>n<=max).map(n=>`<button class="btn" style="--c:var(--yellow);--on:var(--ink)" data-exch="${n}">Trocar ${n*f.gemsPerCoin} 💎 por ${fcName(n)}</button>`).join('')}</div>`
          :`<div class="wbar"><i style="width:${Math.round(100*d.gems/f.gemsPerCoin)}%"></i></div><p class="hint">Faltam ${f.gemsPerCoin-d.gems} 💎 para trocar por 1 Family Coin.</p>`}
        <p class="err" id="werr" aria-live="polite"></p></div>`;
    body=`<div class="wtop"><div class="card wbal"><div class="bignum">${d.gems} 💎</div><p class="hint">Hoje: ${d.today} de ${d.limit} diamantes</p></div>
      <div class="card wbal"><div class="bignum">${fcoin(d.coins,'big')}</div><p class="hint">Family Coins recebidas</p></div></div>${trade}
      ${d.exchanges.length?`<div class="card"><h3>Trocas</h3>${d.exchanges.map(e=>`<div class="exrow"><span>${EXST[e.status][0]}</span><span>${e.gems} 💎 → ${fcName(e.coins)}<small>${EXST[e.status][1]} · ${new Date(e.createdAt).toLocaleDateString('pt-BR')}</small></span><b>${money(e.cents)}</b></div>`).join('')}</div>`:''}`}
  $app.innerHTML=`<div class="screen"><div class="topbar"><button class="iconbtn" data-act="map" aria-label="Voltar ao mapa">←</button><h2 class="rtitle">💎 Meus diamantes</h2></div>
    <p class="hint">Cada lição terminada dá diamantes: um por estrela.</p><div class="btnrow"><button class="btn" style="--c:var(--pink)" data-act="shop">🛍️ Ir à loja</button></div>${body}</div>`}
async function askExchange(n,btn){const p=activeProfile();if(S.wallet.busy)return;S.wallet.busy=true;btn.disabled=true;
  try{await api(`/players/${encodeURIComponent(p.id)}/exchanges`,'POST',{code:p.code,coins:n});sndWin();confetti(80);speak(EXCHANGE_SAY);S.wallet.busy=false;loadWallet()}
  catch(e){S.wallet.busy=false;btn.disabled=false;setErr('werr',e.message&&e.status?e.message:'Sem conexão agora. Tente de novo.')}}
const EXCHANGE_SAY='Pedido enviado! Agora seus pais vão aprovar a troca.';

/* ---- parents' area (PIN) ---- */
const ss={get(k){try{return sessionStorage.getItem('cm-'+k)}catch(e){return null}},set(k,v){try{v==null?sessionStorage.removeItem('cm-'+k):sessionStorage.setItem('cm-'+k,v)}catch(e){}}};
const fam=()=>S.fam||(S.fam={token:ss.get('famtoken'),familyId:store.get('family',null),mode:null,data:null,report:null,kid:null,err:''});
const famApi=(path,method,body)=>api('/family'+path,method,body,fam().token);
function openParents(){const F=fam();F.err='';S.screen='parents';render();if(F.token)loadFamily()}
function famLogout(){const F=fam();F.rulesMsg='';F.token=null;F.data=null;F.report=null;ss.set('famtoken',null);render()}
async function loadFamily(){const F=fam();
  try{F.data=await famApi('','GET');if(!F.kid||!F.data.children.some(c=>c.id===F.kid))F.kid=F.data.children[0]&&F.data.children[0].id;if(F.kid)loadReport(F.kid)}
  catch(e){if(e.status===401){F.token=null;ss.set('famtoken',null)}else F.err='Sem conexão agora. Tente de novo.'}if(S.screen==='parents')render()}
async function loadReport(id){const F=fam();F.kid=id;F.report=null;if(S.screen==='parents')render();
  try{const r=await famApi('/report/'+encodeURIComponent(id),'GET');if(F.kid===id){F.report=r;if(S.screen==='parents')render()}}catch(e){}}
function famIn(d){const F=fam();F.token=d.token;F.familyId=d.familyId;ss.set('famtoken',d.token);store.set('family',d.familyId);F.mode=null;F.err='';loadFamily()}
async function famLogin(){const F=fam(),pin=document.getElementById('fpin').value.trim();if(!/^\d{4}$/.test(pin))return setErr('ferr','O PIN tem 4 números.');setErr('ferr','Entrando...');
  try{let body={pin};if(F.familyId&&F.mode!=='child')body.familyId=F.familyId;else{const n=document.getElementById('fkid').value.trim(),dob=dobValue('fdob');if(!n)return setErr('ferr','Digite o nome de um filho.');if(dobErr(dob))return setErr('ferr',dobErr(dob));body.child={name:n,birthDate:dob}}
    famIn(await api('/family/login','POST',body))}catch(e){setErr('ferr',e.status?e.message:'Sem conexão agora. Tente de novo.')}}
async function famCreate(){const pin=document.getElementById('fpin').value.trim(),pin2=document.getElementById('fpin2').value.trim(),n=document.getElementById('fkid').value.trim(),dob=dobValue('fdob');
  if(!/^\d{4}$/.test(pin))return setErr('ferr','Crie um PIN de 4 números.');if(pin!==pin2)return setErr('ferr','Os dois PINs estão diferentes.');if(!n)return setErr('ferr','Digite o nome do seu filho ou filha, como está no jogo.');if(dobErr(dob))return setErr('ferr',dobErr(dob));
  setErr('ferr','Criando...');try{famIn(await api('/family','POST',{pin,child:{name:n,birthDate:dob}}))}catch(e){setErr('ferr',e.status?e.message:'Sem conexão agora. Tente de novo.')}}
const keyName=k=>{const [g,w]=k.split(':');const m=/^(bn[a-z0-9]*?)(\d)$/.exec(w);if(m){const b=BONUS.find(x=>x.id===m[1]);return b?`${b.icon} ${b.name}: ${b.acts[+m[2]].name}`:k}
  const gr=GRADES.find(x=>x.id===g),wo=gr&&gr.worlds.find(x=>x.id===w);return wo?`${wo.icon} ${wo.name} (${gr.short})`:k};
const mins=s=>s<60?`${s} s`:s<3600?`${Math.round(s/60)} min`:`${Math.floor(s/3600)} h ${Math.round(s%3600/60)} min`;
function famLoginView(){const F=fam(),create=F.mode==='create',child=F.mode==='child'||!F.familyId&&!create;
  return `<form class="card loginbox" id="famform"><h2>${create?'Criar a Área dos pais':'Área dos pais'}</h2>
    ${create?'<p class="hint">Crie um PIN só dos pais. Com ele vocês veem o relatório, aprovam as trocas de diamantes e definem as regras.</p>':''}
    ${child||create?`<label class="steplabel" for="fkid">${create?'Nome do filho ou filha no jogo':'Nome de um filho no jogo'}</label><input id="fkid" class="bigin" maxlength="20" autocomplete="off"><div class="steplabel">Data de nascimento dele(a)</div>${dobPicker('fdob','')}`:''}
    <label class="steplabel" for="fpin">${create?'PIN dos pais (4 números)':'PIN dos pais'}</label><input id="fpin" class="bigin pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off">
    ${create?'<label class="steplabel" for="fpin2">Repita o PIN</label><input id="fpin2" class="bigin pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off">':''}
    <p class="err" id="ferr" aria-live="polite">${esc(F.err)}</p>
    <div class="btnrow"><button class="btn big" style="--c:var(--purple)" type="submit">${create?'Criar':'Entrar'}</button></div>
    <div class="btnrow">${create?'<button class="btn ghost" type="button" data-fmode="">Já tenho PIN</button>':'<button class="btn ghost" type="button" data-fmode="create">Criar a Área dos pais</button>'}${!create&&F.familyId&&!child?'<button class="btn ghost" type="button" data-fmode="child">Outra família</button>':''}</div></form>`}
// lessons per day, last 30 days: one series, so no legend; each bar carries its value on hover/tap
function dayBars(days){const max=Math.max(1,...days.map(d=>d.lessons));const tick=[0,7,14,21,29];
  return `<figure class="chart"><figcaption>Lições por dia (últimos 30 dias)</figcaption>
    <div class="bars" role="img" aria-label="Lições por dia nos últimos 30 dias">${days.map((d,i)=>{const [y,m,dd]=d.day.split('-');const tip=`${+dd}/${+m}: ${d.lessons} lição${d.lessons===1?'':'ões'}${d.gems?`, ${d.gems} 💎`:''}${d.seconds?`, ${mins(d.seconds)}`:''}`;
      return `<button class="bar" type="button" title="${tip}" data-tip="${esc(tip)}"><i style="height:${d.lessons?Math.max(4,Math.round(100*d.lessons/max)):0}%"></i></button>`}).join('')}<span class="bmax">${max}</span></div>
    <div class="bx">${tick.map(i=>{const [,m,dd]=days[i].day.split('-');return `<span style="left:${(i+.5)/days.length*100}%">${+dd}/${+m}</span>`}).join('')}</div>
    <p class="btip hint" id="btip" aria-live="polite">Toque numa barra para ver o dia.</p></figure>`}
function reportView(R){const t=R.totals,rate=R.rate;const g=GRADES.find(x=>x.id===R.player.grade)||GRADES[1];const prog=R.player.progress||{};
  const last30=R.days.reduce((a,d)=>a+d.lessons,0),secs=R.days.reduce((a,d)=>a+d.seconds,0);
  const trend=rate.now!=null&&rate.before!=null?(rate.now>rate.before?`<small class="up">▲ ${rate.now-rate.before} pontos</small>`:rate.now<rate.before?`<small class="down">▼ ${rate.before-rate.now} pontos</small>`:'<small>igual ao mês anterior</small>'):'<small>nos últimos 30 dias</small>';
  const wl=list=>list.length?list.map(w=>`<div class="exrow"><span>${esc(keyName(w.key))}<small>${w.lessons} lição${w.lessons===1?'':'ões'} · ${w.reviews} revis${w.reviews===1?'ão':'ões'}</small></span><b>${w.rate}%</b></div>`).join(''):'<p class="hint">Ainda sem lições nos últimos 30 dias.</p>';
  return `<div class="kpis"><div class="kpi"><b>${last30}</b><span>lições em 30 dias</span><small>${t.lessons} no total</small></div>
      <div class="kpi"><b>${mins(secs)}</b><span>jogando em 30 dias</span></div>
      <div class="kpi"><b>${rate.now==null?'–':rate.now+'%'}</b><span>acertos de primeira</span>${trend}</div>
      <div class="kpi"><b>${R.player.gems} 💎</b><span>diamantes guardados</span><small>${fcName(t.coinsPaid)} pagas · ${money(t.centsPaid)}</small><small>${(R.player.items||[]).length} ite${(R.player.items||[]).length===1?'m':'ns'} da loja</small></div></div>
    ${dayBars(R.days)}
    <div class="card"><h3>Progresso no ${esc(g.name)}</h3><div class="wprog">${g.worlds.map(w=>{const s=(prog[`${g.id}:${w.id}`]||[]).reduce((a,b)=>a+(b||0),0);
      return `<div class="wp"><span>${w.icon} ${esc(w.name)}</span><div class="wbar"><i style="width:${Math.round(100*s/9)}%"></i></div><small>${s}/9 ★</small></div>`}).join('')}</div></div>
    <div class="two"><div class="card"><h3>Precisa de ajuda</h3><p class="hint">Menos acertos de primeira nos últimos 30 dias.</p>${wl(R.hardest)}</div>
      <div class="card"><h3>Mandando bem</h3><p class="hint">Mais acertos de primeira.</p>${wl(R.best)}</div></div>
    <div class="card"><h3>Últimas lições</h3>${R.recent.length?R.recent.map(l=>`<div class="exrow"><span>${esc(keyName(l.key))}${/:bn/.test(l.key)?'':` · nível ${l.level+1}`}<small>${new Date(l.at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}${/5$/.test(l.key)&&/:bn/.test(l.key)?` · ${l.score} erro${l.score===1?'':'s'}`:` · ${l.score} de ${l.total} de primeira`}${l.reviews?` · ${l.reviews} na revisão`:''}</small></span><b>${starStr(l.stars)}${l.gems?` +${l.gems} 💎`:''}</b></div>`).join(''):'<p class="hint">Nenhuma lição ainda.</p>'}</div>
    ${R.exchanges.length?`<div class="card"><h3>Trocas</h3>${R.exchanges.map(e=>`<div class="exrow"><span>${EXST[e.status][0]} ${fcName(e.coins)} por ${e.gems} 💎<small>${new Date(e.createdAt).toLocaleDateString('pt-BR')}${e.status==='pending'?' · esperando vocês':''}</small></span><b>${money(e.cents)}</b></div>`).join('')}</div>`:''}`}
function renderParents(){const F=fam(),D=F.data;let body;
  if(!F.token)body=famLoginView();
  else if(!D)body=F.err?`<p class="hint">${esc(F.err)}</p>`:'<p class="hint">Carregando...</p>';
  else{const kidName=id=>(D.children.find(c=>c.id===id)||{}).name||'';const r=D.rules;
    body=`${D.pending.length?`<div class="card pend"><h3>Pedidos de troca</h3>${D.pending.map(e=>`<div class="exrow"><span><b>${esc(kidName(e.playerId))}</b> quer trocar ${e.gems} 💎 por ${fcName(e.coins)}<small>${new Date(e.createdAt).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})} · pague ${money(e.cents)}</small></span><span class="exbtns"><button class="btn" style="--c:var(--green)" data-paid="${esc(e.id)}">Paguei ✅</button><button class="btn ghost" data-reject="${esc(e.id)}">Recusar</button></span></div>`).join('')}</div>`:''}
      <div class="chips">${D.children.map(c=>`<button class="chip" data-kid="${esc(c.id)}" aria-pressed="${F.kid===c.id}">${esc(c.name)}</button>`).join('')}</div>
      ${!D.children.length?'<p class="hint">Nenhum filho na família. Adicione abaixo.</p>':F.report&&F.report.player.id===F.kid?reportView(F.report):'<p class="hint">Carregando o relatório...</p>'}
      <details class="card"${F.rulesMsg?' open':''}><summary><h3>Regras da recompensa</h3></summary><form id="rulesform" class="rules">
        <label>Diamantes para 1 Family Coin<input id="rg" type="number" min="1" max="10000" value="${r.gemsPerCoin}"></label>
        <label>Valor de 1 Family Coin (R$)<input id="rc" type="number" min="0.01" step="0.01" value="${(r.coinCents/100).toFixed(2)}"></label>
        <label>Limite de diamantes por dia (cada filho)<input id="rl" type="number" min="0" max="1000" value="${r.dailyGemLimit}"></label>
        <label>Novo PIN (deixe vazio para manter)<input id="rp" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4"></label>
        <p class="hint">Cada lição terminada dá 1 diamante por estrela (até 3), dentro do limite do dia.</p>
        <p class="err ok" id="rerr" aria-live="polite">${esc(F.rulesMsg||'')}</p><div class="btnrow"><button class="btn" style="--c:var(--purple)" type="submit">Salvar regras</button></div></form></details>
      <details class="card"><summary><h3>Adicionar filho</h3></summary><form id="kidform" class="rules"><label>Nome no jogo<input id="kname" maxlength="20" autocomplete="off"></label><div class="steplabel">Data de nascimento</div>${dobPicker('kdob','')}
        <p class="err" id="kerr" aria-live="polite"></p><div class="btnrow"><button class="btn" type="submit">Adicionar</button></div></form></details>`}
  $app.innerHTML=`<div class="screen parents"><div class="topbar"><button class="iconbtn" data-act="who" aria-label="Voltar">←</button><h2 class="rtitle">👨‍👩‍👧 Área dos pais</h2>${F.token?'<button class="btn ghost" data-act="famout">Sair</button>':''}</div>${body}</div>`;
  const ff=document.getElementById('famform');if(ff)ff.addEventListener('submit',e=>{e.preventDefault();F.mode==='create'?famCreate():famLogin()});
  const rf=document.getElementById('rulesform');if(rf)rf.addEventListener('submit',e=>{e.preventDefault();saveRules()});
  const kf=document.getElementById('kidform');if(kf)kf.addEventListener('submit',e=>{e.preventDefault();addKid()})}
async function saveRules(){const v=id=>document.getElementById(id).value.trim();const body={gemsPerCoin:Math.round(+v('rg')),coinCents:Math.round(+v('rc').replace(',','.')*100),dailyGemLimit:Math.round(+v('rl'))};
  if(v('rp')){if(!/^\d{4}$/.test(v('rp')))return setErr('rerr','O PIN tem 4 números.');body.newPin=v('rp')}
  if(!(body.gemsPerCoin>=1&&body.coinCents>=1&&body.dailyGemLimit>=0))return setErr('rerr','Confira os números.');
  try{await famApi('','PUT',body);fam().rulesMsg='Regras salvas!';loadFamily()}catch(e){setErr('rerr',e.status?e.message:'Sem conexão agora.')}}
async function addKid(){const n=document.getElementById('kname').value.trim(),dob=dobValue('kdob');if(!n)return setErr('kerr','Digite o nome.');if(dobErr(dob))return setErr('kerr',dobErr(dob));
  try{await famApi('/children','POST',{name:n,birthDate:dob});loadFamily()}catch(e){setErr('kerr',e.status?e.message:'Sem conexão agora.')}}
async function decide(id,action,btn){btn.disabled=true;try{await famApi('/exchanges/'+encodeURIComponent(id),'POST',{action});if(action==='paid')sndWin();loadFamily()}catch(e){btn.disabled=false;loadFamily()}}
// clicks for these screens; true when handled
function rewardsClick(b){const a=b.dataset.act;if(shopClick(b))return true;
  if(b.dataset.exch){askExchange(+b.dataset.exch,b);return true}
  if(b.dataset.kid){loadReport(b.dataset.kid);return true}
  if(b.dataset.paid){decide(b.dataset.paid,'paid',b);return true}
  if(b.dataset.reject){decide(b.dataset.reject,'rejected',b);return true}
  if(b.dataset.fmode!=null){const F=fam();F.mode=b.dataset.fmode||null;F.err='';render();return true}
  if(b.dataset.tip){const t=document.getElementById('btip');if(t)t.textContent=b.dataset.tip;document.querySelectorAll('.bar.on').forEach(x=>x.classList.remove('on'));b.classList.add('on');return true}
  if(a==='wallet'){openWallet();return true}
  if(a==='parents'){openParents();return true}
  if(a==='famout'){famLogout();return true}
  if(a==='loginname'){openLogin({mode:'name'});return true}
  return false}
