/* ================= Characters (original drawings) ================= */
function person(o){
  const skin=o.skin||'#F6D3B8';
  let back='',front='',extra='',body='';
  const H=o.hair;
  if(o.style==='braid'){
    back=`<path d="M30 60 Q28 30 60 26 Q92 30 90 60 L92 96 Q60 104 28 96Z" fill="${H}"/>
      <path d="M86 70 q14 14 6 30 q10 10 2 26 q-6 10 -14 4 q8 -12 -2 -22 q8 -16 -4 -30z" fill="${H}"/>`;
  } else if(o.style==='buns'){
    back=`<circle cx="32" cy="34" r="14" fill="${H}"/><circle cx="88" cy="34" r="14" fill="${H}"/>
      <path d="M32 62 Q30 32 60 30 Q90 32 88 62 L86 84 Q60 90 34 84Z" fill="${H}"/>`;
  } else if(o.style==='braids'){
    back=`<path d="M32 62 Q30 32 60 30 Q90 32 88 62 L86 86 Q60 92 34 86Z" fill="${H}"/>
      <path d="M30 70 q-8 14 0 24 q-8 12 0 24 l8 -2 q-6 -10 0 -22 q-6 -12 2 -22z" fill="${H}"/>
      <path d="M90 70 q8 14 0 24 q8 12 0 24 l-8 -2 q6 -10 0 -22 q6 -12 -2 -22z" fill="${H}"/>
      <circle cx="31" cy="120" r="4" fill="${o.acc}"/><circle cx="89" cy="120" r="4" fill="${o.acc}"/>`;
  } else if(o.style==='pony'){
    back=`<path d="M32 62 Q30 32 60 30 Q90 32 88 62 L86 80 Q60 86 34 80Z" fill="${H}"/>
      <path d="M84 40 q22 6 18 34 q-2 16 -10 22 q4 -18 -6 -30z" fill="${H}"/><circle cx="86" cy="40" r="5" fill="${o.acc||'#fff'}"/>`;
  } else if(o.style==='long'){
    back=`<path d="M28 62 Q26 28 60 26 Q94 28 92 62 L96 112 Q60 120 24 112Z" fill="${H}"/>`;
  } else if(o.style==='short'||o.style==='spiky'||o.style==='curly'){
    back=`<path d="M32 62 Q30 32 60 30 Q90 32 88 62 L86 70 Q60 64 34 70Z" fill="${H}"/>`;
  }
  if(o.style==='braids'){
    front=`<path d="M32 58 Q36 34 60 34 Q84 34 88 58 Q74 46 60 50 Q46 46 32 58Z" fill="${H}"/>`;
  } else if(o.style==='spiky'){
    front=`<path d="M30 60 L28 40 L38 46 L40 28 L50 40 L56 22 L64 38 L72 24 L76 40 L86 30 L84 46 L94 44 L90 60 Q78 46 60 48 Q42 46 30 60Z" fill="${H}"/>`;
  } else if(o.style==='curly'){
    front=`<g fill="${H}"><circle cx="36" cy="46" r="10"/><circle cx="48" cy="36" r="11"/><circle cx="62" cy="33" r="11"/><circle cx="76" cy="37" r="11"/><circle cx="86" cy="48" r="10"/></g>`;
  } else if(o.style==='short'){
    front=`<path d="M30 60 Q30 30 60 30 Q90 30 90 60 Q84 44 70 44 Q60 40 44 46 Q34 50 30 60Z" fill="${H}"/>`;
  } else if(o.style){
    front=`<path d="M30 60 Q32 32 60 32 Q88 32 90 60 Q80 44 66 48 Q62 40 54 48 Q40 44 30 60Z" fill="${H}"/>`;
  }
  if(o.hat){
    extra+=`<ellipse cx="60" cy="38" rx="44" ry="9" fill="${o.hat}"/>
      <path d="M36 38 Q36 10 52 12 Q60 16 68 12 Q84 10 84 38Z" fill="${o.hat}"/>
      <path d="M37 32 Q60 38 83 32 L84 37 Q60 43 36 37Z" fill="${o.acc}"/>
      <path d="M60 18 l2.6 5.4 6 .8 -4.4 4.1 1.1 5.9 -5.3 -2.9 -5.3 2.9 1.1 -5.9 -4.4 -4.1 6 -.8z" fill="#FFD84A"/>`;
  }
  if(o.band){
    extra+=`<rect x="29" y="46" width="62" height="9" rx="3" fill="${o.band}"/><path d="M90 50 l16 -6 -4 10 8 6 -18 -2z" fill="${o.band}"/>`;
  }
  if(o.helmet){
    extra+=`<circle cx="60" cy="62" r="38" fill="rgba(190,225,255,.28)" stroke="#E7ECF7" stroke-width="6"/>
      <path d="M36 40 Q48 30 60 30" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
      <line x1="60" y1="24" x2="60" y2="12" stroke="#C9CEDF" stroke-width="3"/><circle cx="60" cy="10" r="4" fill="${o.acc||'#EF476F'}"/>`;
  }
  if(o.sword){
    extra+=`<g class="glow" style="color:${o.sword}"><rect x="96" y="54" width="7" height="62" rx="3.5" fill="${o.sword}" transform="rotate(18 99 116)"/></g>
      <rect x="92" y="112" width="18" height="6" rx="3" fill="#3B3F5C" transform="rotate(18 99 116)"/>
      <rect x="97" y="117" width="6" height="16" rx="3" fill="#3B3F5C" transform="rotate(18 99 116)"/>`;
  }
  if(o.mic){
    extra+=`<rect x="14" y="98" width="7" height="26" rx="3" fill="#3B3F5C" transform="rotate(-20 17 110)"/><circle cx="13" cy="96" r="8" fill="#C9CEDF" transform="rotate(-20 17 110)"/>`;
  }
  if(o.ball){
    extra+=`<g transform="translate(100 134)"><circle r="13" fill="#fff" stroke="#2A2340" stroke-width="2"/><path d="M0 -6 l6 4 -2 7 h-8 l-2 -7z" fill="#2A2340"/></g>`;
  }
  if(o.tail){
    body=`<path d="M38 104 Q60 98 82 104 L78 128 Q70 140 74 150 L46 150 Q50 140 42 128Z" fill="${o.tail}"/>
      <path d="M36 152 q-14 -6 -18 -18 q14 4 24 10z M84 152 q14 -6 18 -18 q-14 4 -24 10z" fill="${o.tail}"/>
      <path d="M44 112 q8 4 16 0 q8 4 16 0" stroke="rgba(255,255,255,.5)" stroke-width="3" fill="none"/>
      <path d="M40 104 Q60 92 80 104 L80 112 Q60 104 40 112Z" fill="${o.shirt}"/>`;
  } else {
    body=`<path d="M30 152 Q30 104 60 102 Q90 104 90 152Z" fill="${o.shirt}"/>`;
  }
  const plaid=o.plaid?`<path d="M38 120 H82 M38 132 H82 M50 106 V150 M70 106 V150" stroke="${o.plaid}" stroke-width="3" opacity=".6"/>`:'';
  const num=o.num?`<text x="60" y="140" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="22" fill="${o.numc||'#fff'}">${o.num}</text>`:'';
  const lash=o.lashes?`<path d="M44.6 65 l-4.5 -2.5 M44.8 67.5 l-4.8 -.4 M75.4 65 l4.5 -2.5 M75.2 67.5 l4.8 -.4" stroke="#2A2340" stroke-width="2" stroke-linecap="round"/>`:'';
  return `<svg viewBox="0 0 120 154" class="char" aria-hidden="true">
    ${back}${body}${plaid}${num}
    ${o.star?`<path d="M60 118 l3 6 6.5 1 -4.7 4.5 1.1 6.5 -5.9 -3.1 -5.9 3.1 1.1 -6.5 -4.7 -4.5 6.5 -1z" fill="${o.star}"/>`:''}
    <rect x="53" y="88" width="14" height="16" rx="6" fill="${skin}"/>
    <circle cx="60" cy="64" r="28" fill="${skin}"/>
    ${front}
    <ellipse cx="49" cy="68" rx="4.6" ry="6" fill="#2A2340"/><ellipse cx="71" cy="68" rx="4.6" ry="6" fill="#2A2340"/>
    <circle cx="50.5" cy="65.5" r="1.8" fill="#fff"/><circle cx="72.5" cy="65.5" r="1.8" fill="#fff"/>${lash}
    <ellipse cx="42" cy="78" rx="5" ry="3" fill="#F49AB0" opacity=".7"/><ellipse cx="78" cy="78" rx="5" ry="3" fill="#F49AB0" opacity=".7"/>
    <path d="M53 80 Q60 87 67 80" stroke="#7A2E3B" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${extra}
  </svg>`;
}
function puppy(){
  return `<svg viewBox="0 0 120 154" class="char" aria-hidden="true">
    <ellipse cx="60" cy="126" rx="34" ry="24" fill="#7FB8F5"/>
    <ellipse cx="60" cy="132" rx="18" ry="14" fill="#B9DBFF"/>
    <ellipse cx="44" cy="146" rx="10" ry="6" fill="#7FB8F5"/><ellipse cx="76" cy="146" rx="10" ry="6" fill="#7FB8F5"/>
    <ellipse cx="26" cy="64" rx="12" ry="26" fill="#2F6FC8" transform="rotate(18 26 64)"/>
    <ellipse cx="94" cy="64" rx="12" ry="26" fill="#2F6FC8" transform="rotate(-18 94 64)"/>
    <ellipse cx="60" cy="62" rx="34" ry="32" fill="#7FB8F5"/>
    <circle cx="80" cy="44" r="8" fill="#2F6FC8"/><circle cx="42" cy="86" r="5" fill="#2F6FC8"/>
    <ellipse cx="60" cy="78" rx="18" ry="13" fill="#B9DBFF"/>
    <ellipse cx="48" cy="58" rx="5" ry="6.5" fill="#1F2340"/><ellipse cx="72" cy="58" rx="5" ry="6.5" fill="#1F2340"/>
    <circle cx="49.5" cy="55.5" r="2" fill="#fff"/><circle cx="73.5" cy="55.5" r="2" fill="#fff"/>
    <ellipse cx="60" cy="72" rx="6" ry="4.5" fill="#1F2340"/>
    <path d="M52 80 Q60 87 68 80" stroke="#1F2340" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M57 83 q3 9 6 0z" fill="#F06A8A"/>
    <g fill="#2F6FC8" transform="translate(92 118)"><ellipse cx="0" cy="6" rx="7" ry="6"/><circle cx="-7" cy="-3" r="3"/><circle cx="0" cy="-6" r="3"/><circle cx="7" cy="-3" r="3"/></g>
  </svg>`;
}
function squish(){
  return `<svg viewBox="0 0 120 154" class="char" aria-hidden="true">
    <path d="M30 40 L38 14 L52 34Z" fill="#C79BEA"/><path d="M90 40 L82 14 L68 34Z" fill="#C79BEA"/>
    <path d="M36 32 L39 22 L45 31Z" fill="#F7B6D2"/><path d="M84 32 L81 22 L75 31Z" fill="#F7B6D2"/>
    <rect x="14" y="28" width="92" height="118" rx="46" fill="#C79BEA"/>
    <ellipse cx="60" cy="112" rx="30" ry="26" fill="#F1E2FF"/>
    <circle cx="44" cy="72" r="5.5" fill="#2A2340"/><circle cx="76" cy="72" r="5.5" fill="#2A2340"/>
    <circle cx="45.5" cy="70" r="2" fill="#fff"/><circle cx="77.5" cy="70" r="2" fill="#fff"/>
    <ellipse cx="34" cy="84" rx="7" ry="4" fill="#F49AB0"/><ellipse cx="86" cy="84" rx="7" ry="4" fill="#F49AB0"/>
    <path d="M54 82 Q57 86 60 82 Q63 86 66 82" stroke="#2A2340" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M60 104 c-6 -8 -16 0 0 12 c16 -12 6 -20 0 -12z" fill="#F7B6D2"/>
  </svg>`;
}
function dino(){
  return `<svg viewBox="0 0 120 154" class="char" aria-hidden="true">
    <path d="M86 120 Q116 120 112 96 Q104 112 84 108Z" fill="#3FB56B"/>
    <path d="M44 34 l6 -12 6 12 M58 30 l6 -12 6 12 M72 34 l6 -10 4 14" fill="#F7882F"/>
    <ellipse cx="60" cy="120" rx="32" ry="30" fill="#4CC97A"/>
    <ellipse cx="60" cy="126" rx="20" ry="20" fill="#C8F2B4"/>
    <ellipse cx="60" cy="62" rx="34" ry="30" fill="#4CC97A"/>
    <ellipse cx="62" cy="76" rx="26" ry="14" fill="#6BD993"/>
    <circle cx="46" cy="56" r="9" fill="#fff"/><circle cx="74" cy="56" r="9" fill="#fff"/>
    <circle cx="47" cy="57" r="5" fill="#1F2340"/><circle cx="73" cy="57" r="5" fill="#1F2340"/>
    <circle cx="48.5" cy="55" r="1.8" fill="#fff"/><circle cx="74.5" cy="55" r="1.8" fill="#fff"/>
    <path d="M46 80 Q60 90 76 80" stroke="#1F2340" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M52 82 l3 5 3 -4 M64 83 l3 4 3 -5" fill="#fff"/>
    <ellipse cx="34" cy="108" rx="6" ry="10" fill="#3FB56B" transform="rotate(-30 34 108)"/><ellipse cx="86" cy="108" rx="6" ry="10" fill="#3FB56B" transform="rotate(30 86 108)"/>
    <ellipse cx="46" cy="148" rx="11" ry="6" fill="#3FB56B"/><ellipse cx="74" cy="148" rx="11" ry="6" fill="#3FB56B"/>
  </svg>`;
}
function robot(){
  return `<svg viewBox="0 0 120 154" class="char" aria-hidden="true">
    <line x1="60" y1="26" x2="60" y2="10" stroke="#8A93AD" stroke-width="4"/><circle cx="60" cy="9" r="6" fill="#EF476F"/>
    <rect x="22" y="26" width="76" height="62" rx="16" fill="#C9D3E8"/>
    <rect x="14" y="46" width="10" height="22" rx="4" fill="#8A93AD"/><rect x="96" y="46" width="10" height="22" rx="4" fill="#8A93AD"/>
    <rect x="32" y="38" width="56" height="38" rx="10" fill="#1F2A44"/>
    <rect x="41" y="48" width="12" height="12" rx="4" fill="#6FF5E6"/><rect x="67" y="48" width="12" height="12" rx="4" fill="#6FF5E6"/>
    <path d="M48 66 Q60 73 72 66" stroke="#6FF5E6" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect x="52" y="88" width="16" height="8" fill="#8A93AD"/>
    <rect x="28" y="96" width="64" height="50" rx="14" fill="#A9B6D3"/>
    <circle cx="46" cy="116" r="6" fill="#FFC53D"/><circle cx="60" cy="116" r="6" fill="#22A867"/><circle cx="74" cy="116" r="6" fill="#3A78F2"/>
    <rect x="44" y="128" width="32" height="8" rx="4" fill="#8A93AD"/>
  </svg>`;
}
const MATES={
  estrela:{name:'Estrela',role:'Guerreira do Pop',color:'#8B5CF6',draw:()=>person({hair:'#5B3FA8',style:'braid',shirt:'#24203F',star:'#FFD84A',sword:'#C9A8FF',lashes:1}),
    cheers:['Brilhou, NOME! Você é uma estrela!','Acertou com estilo!','Esse é o poder da música!','Que show, NOME!'],
    oops:['Respira e tenta de novo!','Quem treina não desiste!'], hi:'Vamos lutar com números, NOME!'},
  jade:{name:'Jade',role:'Guerreira do Pop',color:'#11A89A',draw:()=>person({hair:'#1D1B2E',style:'buns',shirt:'#0E7C72',sword:'#6FF5E6',mic:1,lashes:1}),
    cheers:['Golpe certeiro, NOME!','Mandou muito bem!','Uhuu! Na batida certa!','Perfeito! Bate aqui!'],
    oops:['Quase! Mais uma vez!','Foco! Tenta outra!'], hi:'Bora treinar, NOME?'},
  luna:{name:'Luna',role:'Guerreira do Pop',color:'#E8559F',draw:()=>person({hair:'#F07AB8',style:'long',shirt:'#3A2C5E',star:'#F07AB8',sword:'#FFB3DA',lashes:1}),
    cheers:['Que poder, NOME!','Você brilha demais!','Acertou! Que orgulho!','Isso aí, NOME!'],
    oops:['Tudo bem errar! Tenta de novo!','Quase lá, NOME!'], hi:'Oi, NOME! Vamos brilhar?'},
  boiadeira:{name:'Boiadeirinha',role:'Cantora do campo',color:'#F7882F',draw:()=>person({hair:'#E9B949',style:'braids',shirt:'#E8559F',plaid:'#fff',acc:'#E8559F',hat:'#9A5B2C',skin:'#F4C9A6',lashes:1}),
    cheers:['Ê trem bão! Acertou, NOME!','Bora, peãozinh{a|o}! Mandou bem!','Que moda boa! Acertou!','Laçou a resposta certinha!'],
    oops:['Calma, parceir{a|o}! Tenta de novo!','Segura o chapéu e tenta outra!'], hi:'Ê boi! Bora contar, NOME?'},
  bia:{name:'Bia',role:'Jogadora de futebol',color:'#22A867',draw:()=>person({hair:'#6B3E1E',style:'pony',shirt:'#FFC53D',num:'9',numc:'#22A867',acc:'#22A867',skin:'#D9A47E',ball:1,lashes:1}),
    cheers:['Golaço, NOME!','É gol! Acertou!','Que jogada, craque!','Bola na rede!'],
    oops:['Bola na trave! Tenta de novo!','Quase! Chuta outra vez!'], hi:'Bora jogar, NOME? Eu passo a bola!'},
  mari:{name:'Mari',role:'Sereia',color:'#11A89A',draw:()=>person({hair:'#2EC4B6',style:'long',shirt:'#F07AB8',tail:'#14A39A',skin:'#F6D3B8',lashes:1}),
    cheers:['Que mergulho, NOME!','Acertou! Que onda boa!','Brilhou como pérola!','Splash! Perfeito!'],
    oops:['Nada mais um pouquinho! Tenta de novo!','Quase, NOME! Mais uma onda!'], hi:'Oi, NOME! Vamos nadar nos números?'},
  sofia:{name:'Sofia',role:'Astronauta',color:'#3A78F2',draw:()=>person({hair:'#2A1A12',style:'curly',shirt:'#E7ECF7',helmet:1,acc:'#E8559F',skin:'#A8714D',lashes:1}),
    cheers:['Missão cumprida, NOME!','Acertou! Rumo às estrelas!','Você é de outro planeta!','Decolagem perfeita!'],
    oops:['Ajustando a rota! Tenta de novo!','Quase! Mais uma volta na órbita!'], hi:'Contagem regressiva, NOME! Vamos decolar?'},
  kai:{name:'Kai',role:'Cantor do Pop',color:'#8B5CF6',draw:()=>person({hair:'#7C5CF0',style:'spiky',shirt:'#1F2A44',star:'#C9A8FF',mic:1,sword:'#B794FF'}),
    cheers:['Arrasou no palco, NOME!','Nota dez! Acertou!','Que show de resposta!','Aplausos pra você!'],
    oops:['Ensaia mais uma vez!','Quase! Bora de novo!'], hi:'E aí, NOME! Pront{a|o} pro show?'},
  leo:{name:'Léo',role:'Jogador de futebol',color:'#F7882F',draw:()=>person({hair:'#1D1B2E',style:'short',shirt:'#3A78F2',num:'10',skin:'#C98E66',ball:1}),
    cheers:['Gol de placa, NOME!','Acertou em cheio!','Que drible, craque!','Partiu, campe{ã|ão}!'],
    oops:['Foi na trave! Tenta de novo!','Respira e chuta de novo!'], hi:'Bola rolando, NOME! Vamos nessa?'},
  theo:{name:'Theo',role:'Astronauta',color:'#3A78F2',draw:()=>person({hair:'#C98A3C',style:'short',shirt:'#E7ECF7',helmet:1,acc:'#F7882F'}),
    cheers:['Temos um gênio a bordo!','Acertou! Até a Lua!','Missão completa, NOME!','Voando alto!'],
    oops:['Recalculando a rota!','Quase! Tenta outra vez!'], hi:'Capacete pronto, NOME? Vamos ao espaço!'},
  rafa:{name:'Rafa',role:'Ninja',color:'#EF476F',draw:()=>person({hair:'#1D1B2E',style:'spiky',shirt:'#2B2F45',band:'#EF476F',skin:'#E8B48C'}),
    cheers:['Golpe ninja, NOME!','Rápido e certeiro!','Acertou! Sabedoria ninja!','Silencioso e perfeito!'],
    oops:['Um ninja sempre tenta de novo!','Quase! Concentra!'], hi:'Treino ninja começando, NOME!'},
  pistinha:{name:'Pistinha',role:'Cachorrinho detetive',color:'#3A78F2',draw:puppy,
    cheers:['Pista encontrada, NOME!','Au au! Acertou!','Você é {uma ótima detetive|um ótimo detetive}!','Muito espert{a|o}!'],
    oops:['Hmm, vamos procurar outra pista!','Quase! Olha de novo!'], hi:'Au au! Vamos achar as pistas, NOME?'},
  fofucho:{name:'Fofucho',role:'Pelúcia fofinha',color:'#B07CE0',draw:squish,
    cheers:['Que fofura de resposta!','Abraço apertado pra você, NOME!','Acertou! Que alegria!','Você é demais!'],
    oops:['Tá tudo bem! Tenta de novo!','Quase, NOME! Mais uma!'], hi:'Oi, NOME! Vamos jogar {juntinhas|juntinhos}?'},
  dino:{name:'Dino',role:'Dinossauro',color:'#22A867',draw:dino,
    cheers:['Rooar! Acertou, NOME!','Que resposta jurássica!','Você é gigante!','Pisada certeira!'],
    oops:['Rooar! Tenta de novo!','Quase! Mais uma pisada!'], hi:'Rooar! Vamos contar, NOME?'},
  bipe:{name:'Bipe',role:'Robô',color:'#56627F',draw:robot,
    cheers:['Bip bop! Resposta correta!','Cálculo perfeito, NOME!','Processando... Você é demais!','Sistema feliz! Acertou!'],
    oops:['Erro detectado! Tenta de novo!','Recalculando... Mais uma vez!'], hi:'Bip bop! Olá, NOME! Vamos calcular?'}
};
const MATE_ORDER=['estrela','jade','luna','boiadeira','bia','mari','sofia','kai','leo','theo','rafa','pistinha','fofucho','dino','bipe'];
