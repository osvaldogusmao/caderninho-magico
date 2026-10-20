const WORLDS1=[
 {id:'contar',name:'Contar',icon:'🐞',color:'var(--red)',levels:[['Até 10','A.1–A.2'],['De 2 em 2 e de 5 em 5','A.3–A.4'],['De 10 em 10','A.5']],gen:[
  ()=>{const t=pick(THINGS),n=R(1,10);return{text:`${qnt(t)} ${t.n} você vê?`,visual:objs(n,t.e),choices:numChoices(n,{min:1,max:12}),answer:String(n)}},
  ()=>{const t=pick(THINGS),k=pick([2,5]),g=R(2,k===2?8:6),a=k*g;
    return{text:`Conte de ${k} em ${k}. ${qnt(t)} ${t.n} ao todo?`,visual:`<div class="groups">${Array.from({length:g},()=>`<div class="grp" style="--k:${k===2?2:5}">${`<span>${t.e}</span>`.repeat(k)}</div>`).join('')}</div>`,choices:numChoices(a,{min:k,offs:[-k,k,-1,1,2*k]}),answer:String(a)}},
  ()=>{const g=R(2,9),a=g*10;return{text:'Cada barrinha tem 10 bolinhas. Quantas bolinhas ao todo?',visual:rods(g),choices:numChoices(a,{min:10,max:100,offs:[-10,10,-1,1,20]}),answer:String(a)}}
 ]},
 {id:'somar',name:'Somar',icon:'🍎',color:'var(--orange)',levels:[['Somas até 10 com figuras','B.1–B.2'],['Somas até 20','B.5 · C.1'],['Números maiores','B.8 · B.10 · C.5']],gen:[
  ()=>{const s=R(2,10),a=R(1,s-1),b=s-a,t=pick(THINGS);return{text:`Quanto é ${a} + ${b}?`,say:`Quanto é ${a} mais ${b}?`,visual:`${objs(a,t.e)}<span class="op">+</span>${objs(b,t.e)}`,choices:numChoices(s,{min:1,max:12}),answer:String(s)}},
  ()=>{let a,b;if(Math.random()<.3){a=R(3,10);b=a}else{const s=R(11,20);a=R(s-10,10);b=s-a}
    return{text:a===b?`Dobro! Quanto é ${a} + ${b}?`:`Quanto é ${a} + ${b}?`,say:`Quanto é ${a} mais ${b}?`,visual:eq(`${a} + ${b} = ?`),choices:numChoices(a+b,{min:2}),answer:String(a+b)}},
  ()=>{let a,b;const m=R(0,2);
    if(m===0){a=R(11,89);b=R(1,Math.min(9,99-a))}
    else if(m===1){a=10*R(1,8);b=10*R(1,9-a/10)}
    else{a=10*R(1,4)+R(0,5);b=10*R(1,4)+R(0,9-a%10)}
    return{text:`Quanto é ${a} + ${b}?`,say:`Quanto é ${a} mais ${b}?`,visual:eq(`${a} + ${b} = ?`),choices:numChoices(a+b,{min:10,offs:[-10,10,-1,1,-2,2]}),answer:String(a+b)}}
 ]},
 {id:'subtrair',name:'Subtrair',icon:'🎈',color:'var(--blue)',levels:[['Tirar até 10','E.1–E.2'],['Subtrair até 18','E.5'],['Números maiores','E.8 · E.10 · F.2']],gen:[
  ()=>{const a=R(2,10),b=R(1,a),t=pick(THINGS);return{text:`Tinha ${a} ${t.n}. Saíram ${b}. ${qnt(t)} ficaram?`,visual:`${objs(a,t.e,b)}${eq(`${a} − ${b} = ?`)}`,say:`Tinha ${a} ${t.n}. Saíram ${b}. ${qnt(t)} ficaram?`,choices:numChoices(a-b,{min:0,max:10}),answer:String(a-b)}},
  ()=>{const a=R(10,18),b=R(a-9,9);return{text:`Quanto é ${a} − ${b}?`,say:`Quanto é ${a} menos ${b}?`,visual:eq(`${a} − ${b} = ?`),choices:numChoices(a-b,{min:0}),answer:String(a-b)}},
  ()=>{let a,b;const m=R(0,2);
    if(m===0){const u=R(1,9);a=10*R(2,9)+u;b=R(1,u)}
    else if(m===1){a=10*R(2,9);b=10*R(1,a/10-1)}
    else{a=R(21,99);b=10*R(1,Math.floor(a/10)-1)}
    return{text:`Quanto é ${a} − ${b}?`,say:`Quanto é ${a} menos ${b}?`,visual:eq(`${a} − ${b} = ?`),choices:numChoices(a-b,{min:0,offs:[-10,10,-1,1,-2,2]}),answer:String(a-b)}}
 ]},
 {id:'misterio',name:'Número Mistério',icon:'🔍',color:'var(--purple)',levels:[['Número escondido','B.4'],['Mais ou menos?','H.4'],['Desafio até 20','H.7']],gen:[
  ()=>{const c=R(3,10),a=R(1,c-1);return{text:'Que número está faltando?',say:`${a} mais quanto dá ${c}?`,visual:eq(`${a} + ? = ${c}`),choices:numChoices(c-a,{min:0,max:10}),answer:String(c-a)}},
  ()=>{let a,b,c,op;if(Math.random()<.5){op='+';a=R(1,10);b=R(1,10);c=a+b}else{op='−';a=R(3,18);b=R(1,a-1);c=a-b}
    return{text:'Qual sinal está faltando: mais ou menos?',say:`${a}, qual sinal, ${b}, é igual a ${c}. Mais ou menos?`,visual:eq(`${a} ○ ${b} = ${c}`),choices:[C('+','+','mais'),C('−','−','menos')],answer:op}},
  ()=>{const t=pick(['?+','+?','?-','-?']);let s,ans;
    if(t==='?+'){const c=R(5,20),b=R(1,c-1);ans=c-b;s=`? + ${b} = ${c}`}
    else if(t==='+?'){const c=R(5,20),a=R(1,c-1);ans=c-a;s=`${a} + ? = ${c}`}
    else if(t==='?-'){ans=R(5,20);const b=R(1,ans-1);s=`? − ${b} = ${ans-b}`}
    else{const a=R(5,20);ans=R(1,a-1);s=`${a} − ? = ${a-ans}`}
    return{text:'Que número completa a conta?',say:'Que número completa? '+sayEq(s),visual:eq(s),choices:numChoices(ans,{min:0,max:20}),answer:String(ans)}}
 ]},
 {id:'comparar',name:'Comparar',icon:'🐊',color:'var(--green)',levels:[['Qual tem mais?','I.1'],['Maior, menor ou igual','I.2'],['O maior e o menor','I.3–I.5']],gen:[
  ()=>{const t=pick(THINGS);const a=R(1,10);let b=Math.random()<.22?a:R(1,10);
    const ans=a>b?'a':a<b?'b':'=';
    return{text:'Qual grupo tem mais?',cols:2,choices:[C('a',objs(a,t.e,0,Math.min(a,4)),'o primeiro grupo'),C('b',objs(b,t.e,0,Math.min(b,4)),'o segundo grupo'),Object.assign(C('=','Os dois têm igual','os dois têm igual'),{wide:1})],answer:ans}},
  ()=>{const a=R(1,99);const b=Math.random()<.18?a:R(1,99);const ans=a<b?'<':a>b?'>':'=';
    return{text:'Qual sinal completa?',say:`Compare ${a} e ${b}. Qual sinal completa?`,visual:eq(`${a} ○ ${b}`),hint:'🐊 A boca do jacaré abre para o número maior.',cols:3,choices:[C('<','&lt;','menor que'),C('>','&gt;','maior que'),C('=','=','igual a')],answer:ans}},
  ()=>{const big=Math.random()<.5,max=big?999:99,min=big?100:1;const s=new Set();while(s.size<4)s.add(R(min,max));const arr=[...s];const want=Math.random()<.5?'maior':'menor';
    const ans=want==='maior'?Math.max(...arr):Math.min(...arr);
    return{text:`Qual é o ${want} número?`,choices:arr.map(v=>C(v)),answer:String(ans)}}
 ]},
 {id:'dezenas',name:'Dezenas',icon:'🧱',color:'var(--teal)',levels:[['Até 20','J.1–J.2'],['Até 100','J.4–J.5'],['Dezenas e unidades','J.3 · J.6']],gen:[
  ()=>{const n=R(11,20);if(n<20&&Math.random()<.35)return{text:'Quantos cubinhos soltos (unidades) você vê?',visual:pv(n),choices:numChoices(n%10,{min:1,max:9}),answer:String(n%10)};
    return{text:'Que número os blocos mostram?',hint:'Cada barrinha vale 10. Cada cubinho vale 1.',visual:pv(n),choices:numChoices(n,{min:10,max:20,offs:[-1,1,-2,2,-10]}),answer:String(n)}},
  ()=>{const n=R(21,99);const sw=(n%10)*10+Math.floor(n/10);const s=new Set([n]);if(n%10&&sw!==n)s.add(sw);
    for(const d of shuf([-10,10,-1,1]))if(s.size<4&&n+d>9&&n+d<100)s.add(n+d);
    return{text:'Que número os blocos mostram?',hint:'Cada barrinha vale 10. Cada cubinho vale 1.',visual:pv(n),choices:shuf([...s]).map(v=>C(v)),answer:String(n)}},
  ()=>{const d=R(1,9),u=R(0,9),n=d*10+u;const m=R(0,2);
    if(m===0)return{text:`${d} dezena${d>1?'s':''} e ${u} unidade${u===1?'':'s'}. Que número é?`,visual:pv(n),choices:numChoices(n,{min:1,max:99,offs:[-10,10,-1,1,u*10+d-n]}),answer:String(n)};
    if(m===1)return{text:`Quantas dezenas tem o número ${n}?`,visual:`<div class="bignum">${n}</div>`,choices:numChoices(d,{min:0,max:9}),answer:String(d)};
    return{text:`${n} é igual a quantas dezenas e ${u} unidade${u===1?'':'s'}?`,visual:eq(`${n} = ? dezenas e ${u}`),choices:numChoices(d,{min:0,max:9}),answer:String(d)}}
 ]},
 {id:'sequencias',name:'Sequências',icon:'🐸',color:'var(--pink)',levels:[['Reta numérica','A.8'],['Antes e depois','A.10'],['Pulos de 2, 5 e 10','A.7 · A.12']],gen:[
  ()=>{const s=R(0,10),m=R(1,10);return{text:'Que número está escondido na reta?',visual:numberLine(s,m),choices:numChoices(s+m,{min:0,max:20}),answer:String(s+m)}},
  ()=>{const up=Math.random()<.6;const s=up?R(1,95):R(6,100);const terms=Array.from({length:5},(_,i)=>up?s+i:s-i);const m=R(0,4);
    return{text:up?'Os números estão subindo. Qual falta?':'Os números estão descendo. Qual falta?',say:`${terms.map((t,i)=>i===m?'quanto':t).join(', ')}. Qual número falta?`,visual:`<div class="seq">${terms.map((t,i)=>i===m?'<span class="sq hole">?</span>':`<span class="sq">${t}</span>`).join('')}</div>`,choices:numChoices(terms[m],{min:0,offs:[-1,1,-2,2,-10,10]}),answer:String(terms[m])}},
  ()=>{let terms,txt;if(Math.random()<.65){const st=pick([2,5,10]);const s=st*R(0,st===10?5:8);terms=Array.from({length:5},(_,i)=>s+i*st);txt=`Pule de ${st} em ${st}. Qual número falta?`}
    else{const up=Math.random()<.5;const s=R(100,994);terms=Array.from({length:5},(_,i)=>up?s+i:s+4-i);txt='Qual número falta na sequência?'}
    const m=R(1,4);const st=Math.abs(terms[1]-terms[0]);
    return{text:txt,say:terms[0]>100?txt:`${txt.replace(/\. Qual.*/,'.')} ${terms.map((t,i)=>i===m?'quanto':t).join(', ')}`,visual:`<div class="seq">${terms.map((t,i)=>i===m?'<span class="sq hole">?</span>':`<span class="sq">${t}</span>`).join('')}</div>`,choices:numChoices(terms[m],{min:0,offs:[-st,st,-1,1,2*st]}),answer:String(terms[m])}}
 ]},
 {id:'parimpar',name:'Par ou Ímpar',icon:'🧦',color:'var(--yellow)',on:'var(--ink)',levels:[['Todo mundo tem par?','A.13'],['Par ou ímpar','A.13'],['Encontre o número','A.13']],gen:[
  ()=>{const n=R(1,10),t=pick(THINGS);let cols='';for(let i=0;i<n;i+=2)cols+=`<span>${t.e}${i+1<n?'<br>'+t.e:''}</span>`;
    return{text:`São ${n} ${t.n}. É par ou ímpar?`,hint:'Se todo mundo tem um parzinho, é par!',visual:`<div class="pairs">${cols}</div>`,cols:2,choices:[C('par','Par'),C('ímpar','Ímpar')],answer:n%2?'ímpar':'par'}},
  ()=>{const n=R(1,30);return{text:'Este número é par ou ímpar?',say:`O número ${n} é par ou ímpar?`,hint:'Olhe o último algarismo: 0, 2, 4, 6 e 8 são pares.',visual:`<div class="bignum">${n}</div>`,cols:2,choices:[C('par','Par'),C('ímpar','Ímpar')],answer:n%2?'ímpar':'par'}},
  ()=>{const want=Math.random()<.5?0:1;const s=new Set();const target=2*R(0,48)+want+(want?0:2);s.add(target);while(s.size<4){const x=2*R(1,49)+(1-want);s.add(x)}
    return{text:`Qual destes números é ${want?'ímpar':'par'}?`,choices:shuf([...s]).map(v=>C(v)),answer:String(target)}}
 ]},
 {id:'fracoes',name:'Frações',icon:'🍕',color:'var(--red)',levels:[['Metade, terço, quarto','K.1'],['Frações nas figuras','K.2 · K.5'],['Partes de um grupo','K.3 · K.4']],gen:[
  ()=>{const n=pick([2,3,4]);const names={2:'metade',3:'um terço',4:'um quarto'};
    return{text:'Que parte da figura está pintada?',visual:Math.random()<.5?pie(n,1,'var(--orange)'):bar(n,1,'var(--orange)'),cols:3,txtc:1,choices:[2,3,4].map(d=>C(names[d],`${names[d]} ${fracHTML(1,d)}`,names[d])),answer:names[n]}},
  ()=>{const n=pick([2,3,4,5,6,8]),k=R(1,n-1);return{text:'Que fração está pintada?',visual:Math.random()<.5?pie(n,k,'var(--red)'):bar(n,k,'var(--red)'),choices:fracChoices(k,n),answer:`${k}/${n}`}},
  ()=>{const n=pick([2,3,4,5,6,8]),k=R(1,n-1);
    if(Math.random()<.5){const list=Array.from({length:n},(_,i)=>i<k?'vermelha':'gray');
      return{text:'Que fração das bolinhas é vermelha?',visual:`<div class="bag">${list.map(c=>`<i class="ball" style="background:${c==='gray'?'var(--line)':BALLC.vermelha}"></i>`).join('')}</div>`,choices:fracChoices(k,n),answer:`${k}/${n}`}}
    return{text:'Que fração da barra está pintada?',visual:bar(n,k,'var(--purple)'),choices:fracChoices(k,n),answer:`${k}/${n}`}}
 ]},
 {id:'formas',name:'Formas',icon:'🔺',color:'var(--orange)',levels:[['Nomes das formas','M.2'],['Lados e vértices','M.1'],['Formas no dia a dia','M.4–M.5']],gen:[
  ()=>{const names=shuf(Object.keys(SHAPES)).slice(0,4);const ans=pick(names);const cols=shuf(COLS);
    return{text:`Toque no ${ans}.`,choices:names.map((nm,i)=>C(nm,shapeSVG(nm,cols[i],'fig sm'),nm)),answer:ans}},
  ()=>{const nm=pick(['triângulo','quadrado','retângulo','losango','pentágono','hexágono']);const s=SHAPES[nm].s;const w=Math.random()<.5;
    return{text:w?`Quantos lados tem este ${nm}?`:`Quantos vértices (cantinhos) tem este ${nm}?`,visual:shapeSVG(nm,pick(COLS)),choices:[3,4,5,6].map(v=>C(v)),answer:String(s)}},
  ()=>{const objsL=[['🏀','a bola de basquete','esfera'],['⚽','a bola de futebol','esfera'],['🌍','o planeta Terra','esfera'],['🎲','o dado','cubo'],['🧊','o cubo de gelo','cubo'],['🎁','a caixa de presente','cubo'],['🥫','a lata','cilindro'],['🥁','o tambor','cilindro'],['🍦','a casquinha de sorvete','cone'],['🎉','o chapéu de festa','cone']];
    const [e,label,ans]=pick(objsL);const opts=shuf([ans,...shuf(Object.keys(SOLIDS).filter(x=>x!==ans)).slice(0,3)]);const col=pick(COLS);
    return{text:`Que forma tem ${label}?`,visual:`<div class="bignum" style="font-size:5rem">${e}</div>`,txtc:1,choices:opts.map(o=>C(o,`<span class="solids">${solidSVG(o,col)}<span>${o}</span></span>`,o)),answer:ans}}
 ]},
 {id:'medidas',name:'Medidas',icon:'📏',color:'var(--blue)',levels:[['Mais comprido, mais curto','L.4'],['Medir com régua','L.2'],['Tempo','L.7']],gen:[
  ()=>{const lens=shuf([3,4,5,6,7,8,9,10]).slice(0,3);const want=Math.random()<.5?'comprido':'curto';const ans=want==='comprido'?Math.max(...lens):Math.min(...lens);const cols=shuf(['var(--red)','var(--green)','var(--blue)','var(--purple)','var(--pink)']);
    return{text:`Qual lápis é o mais ${want}?`,pen:1,cols:1,choices:lens.map((l,i)=>C(l,`<span class="pencil" style="width:${l*9+8}%;--pc:${cols[i]}"></span>`,`o lápis ${i+1}`)),answer:String(ans)}},
  ()=>{const l=R(2,10);return{text:'Quantos centímetros mede o giz de cera?',visual:ruler(l,pick(['var(--red)','var(--green)','var(--purple)','var(--pink)'])),choices:numChoices(l,{min:1,max:11,offs:[-1,1,2,-2]}),answer:String(l)}},
  ()=>{const bank=[
      ['Quantos dias tem uma semana?','7',['5','7','10','12']],
      ['Quantos meses tem um ano?','12',['7','10','12','30']],
      ['Quantas horas tem um dia?','24',['12','24','60','7']],
      ['Quantos minutos tem uma hora?','60',['10','24','60','100']],
      ['O que demora mais?','Uma noite de sono',['Escovar os dentes','Uma noite de sono','Piscar os olhos']],
      ['O que demora menos?','Piscar os olhos',['Piscar os olhos','Assistir a um filme','Uma semana de aula']],
      ['Que unidade usamos para a sua idade?','Anos',['Segundos','Minutos','Anos']],
      ['Quanto tempo dura um filme?','Horas',['Segundos','Horas','Meses']],
      ['Quanto tempo leva para lavar as mãos?','Segundos',['Segundos','Dias','Anos']],
      ['Que dia vem depois de segunda-feira?','Terça-feira',['Domingo','Terça-feira','Sexta-feira']],
      ['Que mês vem depois de janeiro?','Fevereiro',['Março','Fevereiro','Dezembro']],
      ['Que dia vem antes de domingo?','Sábado',['Sábado','Segunda-feira','Quarta-feira']]];
    const [t,a,o]=pick(bank);return{text:t,txtc:o[0].length>3,cols:o.length,choices:shuf(o).map(x=>C(x)),answer:a}}
 ]},
 {id:'padroes',name:'Padrões',icon:'🌈',color:'var(--purple)',levels:[['Padrão AB','N.1'],['Padrões maiores','N.1–N.2'],['Padrões de números','N.3–N.4']],gen:[
  ()=>{const set=shuf(['🔴','🔵','🟡','🟢','⭐','🌙','💜','🎤','🤠','🐶']);const [A,B,X]=set;const seq=[A,B,A,B,A,B,A];const ans=B;
    return{text:'O que vem depois?',visual:`<div class="pat">${seq.map(s=>`<span>${s}</span>`).join('')}<span class="hole">?</span></div>`,cols:3,choices:shuf([A,B,X]).map(s=>C(s)),answer:ans}},
  ()=>{const set=shuf(['🔴','🔵','🟡','🟢','⭐','🌙','💜','🎤','🤠','🐶']);const [A,B,Cc,X]=set;const unit=pick([[A,A,B],[A,B,B],[A,B,Cc],[A,A,B,B]]);
    const L=unit.length===4?7:R(7,8);const full=Array.from({length:L+1},(_,i)=>unit[i%unit.length]);
    const opts=[...new Set([...unit,X])];
    return{text:'Descubra o padrão. O que vem depois?',visual:`<div class="pat">${full.slice(0,L).map(s=>`<span>${s}</span>`).join('')}<span class="hole">?</span></div>`,cols:opts.length,choices:shuf(opts).map(s=>C(s)),answer:full[L]}},
  ()=>{const st=pick([2,3,5,10,-1,-2]);const s=st>0?R(0,20):R(12,30);const terms=Array.from({length:5},(_,i)=>s+i*st);
    return{text:st>0?'Os números crescem. Qual vem depois?':'Os números diminuem. Qual vem depois?',say:`${terms.slice(0,4).join(', ')}. Qual vem depois?`,visual:`<div class="seq">${terms.slice(0,4).map(t=>`<span class="sq">${t}</span>`).join('')}<span class="sq hole">?</span></div>`,choices:numChoices(terms[4],{min:0,offs:[-st,st,1,-1]}),answer:String(terms[4])}}
 ]},
 {id:'chance',name:'Chance',icon:'🎲',color:'var(--teal)',levels:[['Qual cor sai mais?','O.1'],['Certo ou impossível?','O.2'],['Mais ou menos provável','O.1']],gen:[
  ()=>{const cs=shuf(Object.keys(BALLC)).slice(0,R(2,3));const counts=shuf([1,2,3,4,5,6]).slice(0,cs.length);const list=[];cs.forEach((c,i)=>{for(let j=0;j<counts[i];j++)list.push(c)});
    const ans=cs[counts.indexOf(Math.max(...counts))];
    return{text:'Sem olhar, você tira uma bolinha do saco. Qual cor é mais provável?',visual:bag(list),cols:cs.length,choices:cs.map(c=>ballC(c)),answer:ans}},
  ()=>{const [T,O]=shuf(Object.keys(BALLC));const kind=pick(['certo','provável','improvável','impossível']);const tot=R(6,9);let t;
    if(kind==='certo')t=tot;else if(kind==='impossível')t=0;else if(kind==='provável')t=tot-R(1,2);else t=1;
    const list=[...Array(t).fill(T),...Array(tot-t).fill(O)];
    const lab={certo:'É certo',provável:'É provável',improvável:'É improvável',impossível:'É impossível'};
    return{text:`Tirar uma bolinha ${T} é...`,visual:bag(list),txtc:1,choices:['certo','provável','improvável','impossível'].map(k=>C(k,lab[k])),answer:kind}},
  ()=>{const [A,B]=shuf(Object.keys(BALLC));const a=R(1,6);const b=Math.random()<.25?a:R(1,6);const list=[...Array(a).fill(A),...Array(b).fill(B)];
    const ans=a>b?'mais':a<b?'menos':'igual';
    return{text:`Tirar ${A} é mais, menos ou igualmente provável que tirar ${B}?`,visual:bag(list),txtc:1,cols:3,choices:[C('mais','Mais provável'),C('menos','Menos provável'),C('igual','Igualmente provável')],answer:ans}}
 ]}
];

