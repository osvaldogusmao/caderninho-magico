/* ================= Shop: skins and accessories bought with diamonds (1 to 20 each) =================
   Same ids, prices and slots as the server catalog (src/lib/game-shop.ts in the app). */
const SHOP=[
 {id:'lacinho',name:'Lacinho',price:1,slot:'head',e:'🎀'},
 {id:'flor',name:'Florzinha',price:2,slot:'head',e:'🌸'},
 {id:'oculos',name:'Óculos',price:3,slot:'face',e:'👓'},
 {id:'estrela',name:'Estrelinha',price:4,slot:'head',e:'⭐'},
 {id:'bone',name:'Boné',price:5,slot:'head',e:'🧢'},
 {id:'escuros',name:'Óculos escuros',price:6,slot:'face',e:'🕶️'},
 {id:'coracao',name:'Coração',price:7,slot:'extra',e:'❤️'},
 {id:'fones',name:'Fones',price:8,slot:'head',e:'🎧'},
 {id:'balao',name:'Balão',price:9,slot:'extra',e:'🎈'},
 {id:'neon',name:'Skin Neon',price:10,slot:'skin'},
 {id:'coroa',name:'Coroa',price:11,slot:'head',e:'👑'},
 {id:'cartola',name:'Cartola',price:12,slot:'head',e:'🎩'},
 {id:'dourada',name:'Skin Dourada',price:13,slot:'skin'},
 {id:'borboleta',name:'Borboleta',price:14,slot:'extra',e:'🦋'},
 {id:'gelo',name:'Skin Gelo',price:15,slot:'skin'},
 {id:'brilho',name:'Brilhos',price:16,slot:'extra',e:'🌟'},
 {id:'fantasma',name:'Skin Fantasma',price:17,slot:'skin'},
 {id:'arcoiris',name:'Arco-íris',price:18,slot:'extra',e:'🌈'},
 {id:'magico',name:'Skin Arco-íris Mágico',price:19,slot:'skin'},
 {id:'galaxia',name:'Skin Galáxia',price:20,slot:'skin'}];
const SHOP_BY={};SHOP.forEach(i=>{SHOP_BY[i.id]=i});
const SLOT_NAME={head:'Cabeça',face:'Rosto',extra:'Enfeite',skin:'Skin'};
// where things sit inside the 120×154 drawing: people have the head at the top, the animals a bit lower
const ANCHOR={person:{head:[60,13,34],face:[60,57,30]},pistinha:{head:[60,24,32],face:[60,62,28]},fofucho:{head:[60,36,32],face:[60,78,30]},dino:{head:[64,22,30],face:[64,52,26]},bipe:{head:[60,20,32],face:[60,58,30]}};
const emo=(e,x,y,sz,cls)=>`<text x="${x}" y="${y}" font-size="${sz}" text-anchor="middle" dy=".35em"${cls?` class="${cls}"`:''}>${e}</text>`;
// the mate's drawing with the accessories and skin in use
function dressed(m,wear){let svg=m.draw();wear=wear||{};if(!wear.head&&!wear.face&&!wear.extra&&!wear.skin)return svg;
  const key=Object.keys(MATES).find(k=>MATES[k]===m);const A=ANCHOR[key]||ANCHOR.person;let back='',front='';
  const x=wear.extra&&SHOP_BY[wear.extra];
  if(x){if(x.id==='arcoiris')back+=emo(x.e,60,30,74,'acc-back');else if(x.id==='balao')front+=emo(x.e,106,58,30,'acc-float');else if(x.id==='borboleta')front+=emo(x.e,16,62,24,'acc-flap');else if(x.id==='brilho')front+=emo(x.e,14,26,20,'acc-twinkle')+emo(x.e,108,44,16,'acc-twinkle d2');else front+=emo(x.e,104,24,22,'acc-float')}
  if(wear.face&&SHOP_BY[wear.face]){const [fx,fy,fs]=A.face;front+=emo(SHOP_BY[wear.face].e,fx,fy,fs)}
  if(wear.head&&SHOP_BY[wear.head]){const [hx,hy,hs]=A.head;front+=emo(SHOP_BY[wear.head].e,hx,hy,hs)}
  if(wear.skin==='galaxia')front+=emo('✨',12,40,16,'acc-twinkle')+emo('✨',110,100,14,'acc-twinkle d2')+emo('✨',20,120,12,'acc-twinkle');
  if(wear.skin)svg=svg.replace('class="char"',`class="char skin-${wear.skin}"`);
  return svg.replace(/(<svg[^>]*>)/,'$1'+back).replace(/<\/svg>\s*$/,front+'</svg>')}
const meDraw=()=>dressed(mate(),S.wear);

function openShop(){S.shop={try:null,confirm:null,busy:false,err:''};S.screen='shop';render()}
function renderShop(){const Sh=S.shop,wear=S.wear||{},items=S.items||[];const look=Object.assign({},wear);if(Sh.try){look[SHOP_BY[Sh.try].slot]=Sh.try}
  $app.innerHTML=`<div class="screen shop"><div class="topbar"><button class="iconbtn" data-act="map" aria-label="Voltar ao mapa">←</button><h2 class="rtitle">🛍️ Loja</h2><button class="pill gem" data-act="wallet" aria-label="Meus diamantes">💎 ${S.gems}</button></div>
    <div class="shoptop"><div class="buddy bob shopme">${dressed(mate(),look)}</div><p class="hint">${Sh.try?`Experimentando: <b>${esc(SHOP_BY[Sh.try].name)}</b>`:'Toque num item para experimentar. Compre com os diamantes das lições!'}</p><p class="err" id="sherr" aria-live="polite">${esc(Sh.err)}</p></div>
    <div class="shopgrid">${SHOP.map(it=>{const own=items.includes(it.id),on=wear[it.slot]===it.id,can=S.gems>=it.price;
      const act=own?`<button class="btn small${on?' on':''}" data-wear="${it.id}">${on?'Usando ✓':'Usar'}</button>`
        :Sh.confirm===it.id?`<button class="btn small" style="--c:var(--green)" data-buy="${it.id}">Confirmar ${it.price} 💎</button>`
        :`<button class="btn small" style="--c:var(--yellow);--on:var(--ink)" data-buyask="${it.id}"${can?'':' disabled'}>${can?`Comprar ${it.price} 💎`:`Faltam ${it.price-S.gems} 💎`}</button>`;
      return `<div class="sitem${Sh.try===it.id?' trying':''}${own?' own':''}"><button class="sprev" data-try="${it.id}" aria-label="Experimentar ${esc(it.name)}">${it.e?`<span class="semo">${it.e}</span>`:`<span class="sswatch skin-${it.id}"></span>`}</button>
        <b>${esc(it.name)}</b><small>${SLOT_NAME[it.slot]} · ${it.price} 💎</small>${act}</div>`}).join('')}</div></div>`}
async function shopBuy(id){const Sh=S.shop,p=activeProfile();if(Sh.busy)return;Sh.busy=true;
  try{const r=await api(`/players/${encodeURIComponent(p.id)}/shop`,'POST',{code:p.code,item:id});S.gems=p.gems=r.gems;S.items=p.items=r.items;Sh.confirm=null;Sh.try=null;Sh.err='';
    store.set('profiles',PROFILES);sndWin();confetti(90);speakLine(pick(mate().cheers));Sh.busy=false;await shopWear(id,true)}
  catch(e){Sh.busy=false;Sh.confirm=null;Sh.err=e.status?e.message:'Sem conexão agora. Tente de novo.';render()}}
// put on (or take off) an item the player owns
async function shopWear(id,put){const p=activeProfile(),it=SHOP_BY[id];const w=Object.assign({},S.wear||{});
  if(put||w[it.slot]!==id)w[it.slot]=id;else delete w[it.slot];
  const old=S.wear;S.wear=p.wear=w;store.set('profiles',PROFILES);S.shop.try=null;render();
  try{await api(`/players/${encodeURIComponent(p.id)}/shop`,'PUT',{code:p.code,wear:w})}catch(e){S.wear=p.wear=old;store.set('profiles',PROFILES);S.shop.err='Sem conexão agora. Tente de novo.';render()}}
function shopClick(b){if(S.screen!=='shop'&&b.dataset.act!=='shop')return false;
  if(b.dataset.act==='shop'){openShop();return true}
  if(b.dataset.try){S.shop.try=S.shop.try===b.dataset.try?null:b.dataset.try;S.shop.confirm=null;sndPop();render();return true}
  if(b.dataset.buyask){S.shop.confirm=b.dataset.buyask;S.shop.try=b.dataset.buyask;render();return true}
  if(b.dataset.buy){shopBuy(b.dataset.buy);return true}
  if(b.dataset.wear){shopWear(b.dataset.wear,false);return true}
  return false}
