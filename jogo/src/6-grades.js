/* ================= Grades & worlds ================= */
const W=(id,name,icon,color,levels,on)=>({id,name,icon,color,on,levels:levels.map(l=>[l[0],l[1]]),gen:levels.map(l=>l[2])});
const w1=(id,i)=>WORLDS1.find(w=>w.id===id).gen[i];
const LEN=['m_cm','km_m','cm_mm'],MASS=['kg_g','L_mL'],TIME=['h_min','min_s','sem_d','dia_h','ano_mes'];
const GRADES=[
 {id:'p',name:'Pré-escola',short:'Pré',worlds:[
  W('contar','Contar','🐞','var(--red)',[['Até 3','A',G.count(1,3)],['Até 5','B',G.count(1,5)],['Até 10','C',G.count(1,10)]]),
  W('numeros','Números até 20','🐸','var(--pink)',[['Reta numérica','C',G.nline(0,0,1)],['Sequências até 20','D',G.seq({min:0,max:20,steps:[1]})],['Dezenas e unidades','D',w1('dezenas',0)]]),
  W('salteado','Contar salteado','🦘','var(--orange)',[['De 2 em 2','F',G.countGroups([2])],['De 5 em 5','F',G.countGroups([5])],['De 10 em 10','F',G.countTens()]]),
  W('organizar','Organizar','🧺','var(--green)',[['Qual não combina?','G',G.odd()],['Mesma cor','G',G.sameColor()],['Mesma forma','G',G.sameShape()]]),
  W('comparar','Comparar','🐊','var(--teal)',[['Qual tem mais?','H',G.groupsCmp('mais')],['Qual tem menos?','H',G.groupsCmp('menos')],['Maior e menor até 10','H',G.maxmin(1,10)]]),
  W('padroes','Padrões','🌈','var(--purple)',[['Padrão AB','I',w1('padroes',0)],['Padrões maiores','I',w1('padroes',1)],['Padrões de formas','I',G.patShapes()]]),
  W('somar','Somar','🍎','var(--orange)',[['Somar até 5','J',G.addPic(5)],['Somar até 10','K',G.addPic(10)],['Complete a soma','K',w1('misterio',0)]]),
  W('subtrair','Tirar','🎈','var(--blue)',[['Tirar até 5','L',G.subPic(5)],['Tirar até 10','M',G.subPic(10)],['Complete a conta','M',G.miss('−',[2,10],[1,9])]]),
  W('posicoes','Posições','🧭','var(--yellow)',[['Em cima e embaixo','N',G.pos()],['Primeiro, segundo...','C',G.ordinal()],['Na malha','N',G.coord(1,3,'obj')]],'var(--ink)'),
  W('medidas','Medidas','📏','var(--red)',[['Grande e pequeno','O',G.sizeCmp()],['Mais comprido','O',w1('medidas',0)],['Quente ou frio','O',G.hotCold()]]),
  W('formas','Formas','🔺','var(--green)',[['Nomes das formas','P',w1('formas',0)],['Lados e vértices','P',w1('formas',1)],['Formas 3D','Q',w1('formas',2)]])
 ]},
 {id:'1',name:'1º ano',short:'1º',worlds:WORLDS1},
 {id:'2',name:'2º ano',short:'2º',worlds:[
  W('contagem','Contagem','🐸','var(--pink)',[['Sequências até 100','A',G.seq({max:100,steps:[1]})],['Reta até 1.000','A',G.nline(0,0,100)],['Par ou ímpar','A',G.parity(1,100)]]),
  W('comparar','Comparar e ordenar','🐊','var(--green)',[['Comparar até 100','B',G.cmp(1,100)],['Comparar até 1.000','B',G.cmp(100,999)],['Ordenar até 1.000','B',G.order(100,999)]]),
  W('adicao1','Adição até 18','➕','var(--orange)',[['Dobros','D',G.doubles()],['Somas até 18','D',G.add([2,9],[2,9])],['Complete a soma','D',G.miss('+',[1,9],[1,9])]]),
  W('adicao2','Adição grande','🧮','var(--red)',[['Sem reagrupar','E',G.add([10,89],[10,89],{carry:false})],['Reagrupando','E',G.add([15,89],[15,89],{carry:true})],['Três dígitos','E',G.add([100,599],[100,399])]]),
  W('subtracao1','Subtração até 18','➖','var(--blue)',[['Subtrair até 10','F',G.sub([2,10],[1,10])],['Subtrair até 18','F',G.sub([10,18],[2,9])],['Complete a conta','F',G.miss('−',[2,18],[1,9])]]),
  W('subtracao2','Subtração grande','🎯','var(--purple)',[['Sem reagrupar','G',G.sub([20,99],[10,89],{borrow:false})],['Reagrupando','G',G.sub([30,99],[11,89],{borrow:true})],['Três dígitos','G',G.sub([300,999],[100,299])]]),
  W('posicional','Valor posicional','🧱','var(--teal)',[['Dezenas e unidades','I',w1('dezenas',1)],['Algarismo sublinhado','I',G.place(3)],['Compor números','I',G.compose(3)]]),
  W('mult','Multiplicação','✖️','var(--orange)',[['Grupos iguais','M',G.mulGroups()],['Arranjos','M',G.mulArray()],['Tabuadas do 2 ao 5','M',G.mul([2,5],[1,10])]]),
  W('div','Divisão','🍪','var(--yellow)',[['Dividir igualmente','N',G.divShare()],['Dividir por 2, 3 e 4','N',G.div([2,4],[1,10])],['Dividir por até 5','N',G.div([2,5],[1,10])]],'var(--ink)'),
  W('fracoes','Frações','🍕','var(--red)',[['Metade, terço, quarto','L',w1('fracoes',0)],['Frações nas figuras','L',w1('fracoes',1)],['Partes de um grupo','L',w1('fracoes',2)]]),
  W('geometria','Geometria','🔺','var(--green)',[['Formas planas','J',w1('formas',0)],['Faces, arestas e vértices','J',G.solidCounts()],['Formas no dia a dia','J',w1('formas',2)]]),
  W('medidas','Medidas e horas','⏰','var(--blue)',[['Medir com régua','K',w1('medidas',1)],['Termômetro','K',G.thermo(false)],['Que horas são?','K',G.clock(false)]]),
  W('chance','Chance','🎲','var(--teal)',[['Mais ou menos provável','O',w1('chance',2)],['Certo ou impossível','O',w1('chance',1)],['Qual cor sai mais?','O',w1('chance',0)]])
 ]},
 {id:'3',name:'3º ano',short:'3º',worlds:[
  W('numeros','Números','🔢','var(--pink)',[['Sequências até 1.000','A',G.seq({max:1000,steps:[1,2,5,10,100]})],['Par ou ímpar','A',G.parity(1,999)],['Primo ou não?','A',G.prime(30)]]),
  W('posicional','Valor posicional','🧱','var(--teal)',[['Algarismo sublinhado','D',G.place(4)],['Compor números','D',G.compose(4)],['Arredondar','U',G.round([10,100],11,999)]]),
  W('addsub','Adição e subtração','➕','var(--orange)',[['Somar 3 dígitos','E',G.add([100,899],[100,899])],['Subtrair 3 dígitos','F',G.sub([200,999],[100,899])],['Quatro dígitos','E',G.addsub([1000,9999])]]),
  W('tabuada','Tabuada','✖️','var(--purple)',[['Tabuadas até 5','I',G.mul([0,5],[0,10])],['Tabuadas do 6 ao 9','I',G.mul([6,9],[1,10])],['Complete o fator','I',G.miss('×',[2,10],[2,10])]]),
  W('mult','Multiplicação grande','🚀','var(--red)',[['Arranjos','G',G.mulArray()],['Por múltiplos de 10','I',G.mulTens(false)],['2 e 3 dígitos','I',G.mul([2,9],[11,199])]]),
  W('div','Divisão','🍪','var(--yellow)',[['Dividir até 5','L',G.div([1,5],[1,10])],['Dividir até 10','L',G.div([6,10],[1,10])],['Complete a divisão','L',G.miss('÷',[1,10],[1,10])]],'var(--ink)'),
  W('mistas','Operações mistas','🔀','var(--blue)',[['Que sinal falta?','M',G.opm(['+','−','×','÷'],[2,20],[2,10])],['Quatro operações','M',G.mixed4()],['Expressões','M',G.ops()]]),
  W('fracoes','Frações','🍕','var(--red)',[['Comparar frações','O',G.fCmp('den')],['Frações equivalentes','P',G.fEq()],['Somar frações','Q',G.fAddS(false)]]),
  W('decimais','Decimais','🔟','var(--teal)',[['Décimos','R',G.dRep(1)],['Comparar decimais','S',G.dCmp(1)],['Somar decimais','T',G.dAr('+',1,9)]]),
  W('geometria','Geometria','📐','var(--green)',[['Tipos de ângulo','V',G.aClass()],['Retas','V',G.lines()],['Perímetro','V',G.perim()]]),
  W('medidas','Medidas','⚖️','var(--orange)',[['Converter unidades','W',G.uConv(['m_cm','kg_g','L_mL'])],['Que unidade usar?','W',G.uChoose()],['Que horas são?','W',G.clock(true)]]),
  W('coord','Coordenadas','🗺️','var(--purple)',[['Que objeto está no ponto?','X',G.coord(1,5,'obj')],['Quais as coordenadas?','X',G.coord(1,5,'xy')],['Mapa do tesouro','X',G.coord(1,6,'mix')]]),
  W('estatistica','Estatística e chance','📊','var(--blue)',[['Moda','Y',G.mode()],['Média','Y',G.mean(3)],['Certo ou impossível','Y',w1('chance',1)]])
 ]},
 {id:'4',name:'4º ano',short:'4º',worlds:[
  W('inteiros','Números grandes','🔢','var(--pink)',[['Valor posicional','A',G.place(6)],['Arredondar','A',G.round([100,1000],1000,99999)],['Comparar','A',G.cmp(1000,99999)]]),
  W('fatores','Múltiplos e primos','🧩','var(--purple)',[['Múltiplos','A',G.multiple()],['Divisores','A',G.divisor()],['Fatoração','A',G.factor()]]),
  W('addsub','Adição e subtração','➕','var(--orange)',[['Somar grandes','B',G.add([1000,49999],[1000,49999])],['Subtrair grandes','B',G.sub([10000,99999],[1000,9999])],['Estimar','B',G.estimate()]]),
  W('mult','Multiplicação','✖️','var(--red)',[['Por 1 dígito','C',G.mul([2,9],[100,999])],['Por 2 dígitos','C',G.mul([11,99],[11,99])],['Com zeros','C',G.mulTens(true)]]),
  W('div','Divisão','🍪','var(--yellow)',[['Sem resto','D',G.div([2,9],[11,99])],['Com resto','D',G.div([2,9],[3,30],{rem:true})],['Complete a divisão','D',G.miss('÷',[2,12],[2,12])]],'var(--ink)'),
  W('sequencias','Sequências','🐸','var(--green)',[['Aritméticas','E',G.arith(false)],['Decrescentes','E',G.arith(true)],['Geométricas','E',G.geo()]]),
  W('fracoes','Frações','🍕','var(--red)',[['Simplificar','G',G.fSimp()],['Comparar','H',G.fCmp('any')],['Maior e menor','H',G.fMax()]]),
  W('opfracoes','Contas com frações','🥧','var(--orange)',[['Somar e subtrair','I',G.fAddS('mix')],['Subtrair','I',G.fAddS(true)],['Denominadores diferentes','I',G.fAddD(false)]]),
  W('decimais','Decimais','🔟','var(--teal)',[['Centésimos','J',G.dRep(2)],['Decimal e fração','J',G.dToF()],['Somar e subtrair','K',G.dArMix(2,9)]]),
  W('negativos','Números negativos','🌡️','var(--blue)',[['Reta numérica','M',G.iLine()],['Comparar','M',G.iCmp()],['Termômetro','N',G.thermo(true)]]),
  W('geometria','Geometria','📐','var(--green)',[['Triângulos','O',G.triClass()],['Quadriláteros','O',G.quad()],['Polígonos','O',G.polyName()]]),
  W('area','Área e perímetro','🟩','var(--purple)',[['Área na malha','P',G.areaGrid()],['Área do retângulo','P',G.areaRect()],['Volume do cubo','P',G.vol(true)]]),
  W('estatistica','Estatística','📊','var(--blue)',[['Média','R',G.mean(4)],['Mediana','R',G.median()],['Combinações','R',G.combos(2)]])
 ]},
 {id:'5',name:'5º ano',short:'5º',worlds:[
  W('numeros','Teoria dos números','🧩','var(--purple)',[['MDC','A',G.gcd()],['MMC','A',G.lcm()],['Primos','A',G.prime(60)]]),
  W('potencias','Multiplicação e potências','⚡','var(--orange)',[['Por 2 dígitos','B',G.mul([12,99],[12,99])],['Potências','B',G.power()],['Estimar produtos','B',G.estMul()]]),
  W('div','Divisão','🍪','var(--yellow)',[['Por 2 dígitos','C',G.div([11,30],[2,40])],['Com resto','C',G.div([11,25],[2,30],{rem:true})],['Quociente decimal','C',G.divDec()]],'var(--ink)'),
  W('fracoes','Frações','🍕','var(--red)',[['Equivalentes','E',G.fEq()],['Comparar','E',G.fCmp('any')],['Maior e menor','E',G.fMax()]]),
  W('opfracoes','Contas com frações','🥧','var(--orange)',[['Somar diferentes','F',G.fAddD(false)],['Multiplicar','F',G.fMul()],['Dividir','F',G.fDiv()]]),
  W('decimais','Decimais','🔟','var(--teal)',[['Arredondar','G',G.dRound()],['Comparar','G',G.dCmp(2)],['Decimal e fração','G',G.dToF()]]),
  W('opdecimais','Contas com decimais','🧮','var(--blue)',[['Somar e subtrair','H',G.dArMix(2,99)],['Vezes 10, 100 e 1.000','H',G.dPow10()],['Multiplicar','H',G.dMul()]]),
  W('porcentagem','Porcentagem','💯','var(--pink)',[['Converter','I',G.pConv()],['Porcentagem de um número','I',G.pOf()],['Desafio','I',G.pMix()]]),
  W('expressoes','Expressões','🔀','var(--purple)',[['Ordem das operações','J',G.ops()],['Que sinal falta?','J',G.opm(['+','−','×','÷'],[2,50],[2,12])],['Números negativos','K',G.iMin()]]),
  W('conversoes','Conversões','⚖️','var(--orange)',[['Comprimento','L',G.uConv(LEN)],['Massa e capacidade','L',G.uConv(MASS)],['Tempo','L',G.uConv(TIME)]]),
  W('geometria','Geometria','📐','var(--green)',[['Simetria','M',G.symm()],['Partes do círculo','M',G.circleParts()],['Faces e arestas','M',G.solidCounts()]]),
  W('medicao','Área e volume','🟩','var(--teal)',[['Área do triângulo','N',G.areaTri()],['Paralelogramo','N',G.areaPar()],['Volume','N',G.vol(false)]]),
  W('coord','Plano cartesiano','🗺️','var(--purple)',[['1º quadrante','O',G.coord(1,6,'mix')],['4 quadrantes','O',G.coord(4,4,'obj')],['Coordenadas','O',G.coord(4,4,'xy')]]),
  W('estatistica','Probabilidade','🎲','var(--blue)',[['Média, mediana e moda','P',G.mmm()],['Probabilidade','P',G.probF()],['Combinações','P',G.combos(3)]])
 ]},
 {id:'6',name:'6º ano',short:'6º',worlds:[
  W('numeros','Números e potências','⚡','var(--orange)',[['Potências','B',G.power()],['Ordem das operações','B',G.ops()],['Comparar grandes','A',G.cmp(10000,999999)]]),
  W('teoria','Teoria dos números','🧩','var(--purple)',[['MDC','C',G.gcd()],['MMC','C',G.lcm()],['Fatoração','C',G.factor()]]),
  W('inteiros','Inteiros','🌡️','var(--blue)',[['Comparar','D',G.iCmp()],['Somar e subtrair','D',G.iAr(['+','−'])],['Multiplicar e dividir','D',G.iAr(['×','÷'])]]),
  W('decimais','Decimais','🔟','var(--teal)',[['Somar e subtrair','F',G.dArMix(2,99)],['Multiplicar','F',G.dMul()],['Dividir','F',G.dDiv()]]),
  W('fracoes','Frações','🥧','var(--red)',[['Somar e subtrair','H',G.fAddD('mix')],['Multiplicar','H',G.fMul()],['Dividir','H',G.fDiv()]]),
  W('porcentagem','Razões e porcentagens','💯','var(--pink)',[['Razões equivalentes','I',G.ratio()],['Converter','I',G.pConv()],['Porcentagem de um número','I',G.pOf()]]),
  W('propriedades','Propriedades','🔁','var(--green)',[['Propriedades','J',G.props()],['Que sinal falta?','B',G.opm(['+','−','×','÷'],[2,99],[2,12])],['Expressões','B',G.ops()]]),
  W('conversoes','Conversões','⚖️','var(--orange)',[['Comprimento','K',G.uConv(LEN)],['Massa e capacidade','K',G.uConv(MASS)],['Tempo','K',G.uConv(TIME)]]),
  W('geometria','Geometria','📐','var(--green)',[['Ângulos do triângulo','L',G.aTri()],['Quadriláteros','L',G.quad()],['Polígonos','L',G.polyName()]]),
  W('medicao','Medição','🟩','var(--teal)',[['Áreas','M',G.areaMix()],['Círculo','M',G.circle()],['Volume','M',G.vol(false)]]),
  W('estatistica','Estatística','📊','var(--blue)',[['Média, mediana e moda','N',G.mmm()],['Probabilidade','N',G.probF()],['Combinações','N',G.combos(3)]]),
  W('coord','Plano cartesiano','🗺️','var(--purple)',[['1º quadrante','O',G.coord(1,6,'xy')],['4 quadrantes','O',G.coord(4,5,'obj')],['Coordenadas','O',G.coord(4,5,'xy')]])
 ]}
];

/* ================= Warm-up mini-game specs per grade ================= */
const MINI={
 p:()=>{const t=R(1,5);return{crit:`com o número ${t}`,item:()=>{const ok=Math.random()<.45;return[String(ok?t:pick([1,2,3,4,5].filter(x=>x!==t))),ok]},
   pairs:()=>shuf([1,2,3,4,5,6]).map(n=>[String(n),'⭐'.repeat(n)])}},
 '1':()=>{const t=R(5,10);return{crit:`que dão ${t}`,item:()=>{const ok=Math.random()<.45;let a,b;do{a=R(1,9);b=R(0,9)}while(ok?a+b!==t:a+b===t);if(ok){a=R(Math.max(0,t-9),Math.min(9,t));b=t-a}return[`${a} + ${b}`,ok]},
   pairs:()=>{const sums=shuf([2,3,4,5,6,7,8,9,10,11,12]).slice(0,6);return sums.map(s=>{const a=R(Math.max(1,s-9),Math.min(9,s-1));return[`${a} + ${s-a}`,String(s)]})}}},
 '2':()=>({crit:'com números pares',item:()=>{const ok=Math.random()<.5;let n;do{n=R(1,60)}while((n%2===0)!==ok);return[String(n),ok]},
   pairs:()=>shuf([2,3,4,5,6,7,8,9,10,11,12,15]).slice(0,6).map(n=>[`dobro de ${n}`,String(2*n)])}),
 '3':()=>{const t=pick([12,18,24,36]);const fs=[];for(let a=2;a<=10;a++)if(t%a===0&&t/a<=10)fs.push([a,t/a]);return{crit:`que dão ${t}`,item:()=>{const ok=Math.random()<.45;if(ok){const [a,b]=pick(fs);return[`${a} × ${b}`,true]}let a,b;do{a=R(2,9);b=R(2,9)}while(a*b===t);return[`${a} × ${b}`,false]},
   pairs:()=>{const out=[],seen=new Set();while(out.length<6){const a=R(2,9),b=R(2,9);if(!seen.has(a*b)){seen.add(a*b);out.push([`${a} × ${b}`,String(a*b)])}}return out}}},
 '4':()=>{const k=R(3,9);return{crit:`que são múltiplos de ${k}`,item:()=>{const ok=Math.random()<.45;if(ok)return[String(k*R(1,10)),true];let n;do{n=R(2,k*10)}while(n%k===0);return[String(n),false]},
   pairs:()=>{const out=[],seen=new Set();while(out.length<6){const b=R(2,9),q=R(2,9);if(!seen.has(q)){seen.add(q);out.push([`${b*q} ÷ ${b}`,String(q)])}}return out}}},
 '5':()=>({crit:'com frações iguais a um meio',item:()=>{const ok=Math.random()<.45;if(ok){const n=R(1,6);return[fracHTML(n,2*n),true]}let a,b;do{b=R(2,10);a=R(1,b-1)}while(a*2===b);return[fracHTML(a,b),false]},
   pairs:()=>shuf([[1,2,'0,5'],[1,4,'0,25'],[3,4,'0,75'],[1,5,'0,2'],[1,10,'0,1'],[2,5,'0,4'],[3,10,'0,3'],[4,5,'0,8']]).slice(0,6).map(([n,d,x])=>[fracHTML(n,d),x])}),
 '6':()=>({crit:'com resultado negativo',item:()=>{const ok=Math.random()<.45;let a,b;do{a=R(1,20);b=R(1,20)}while((a<b)!==ok);return[`${a} − ${b}`,ok]},
   pairs:()=>{const out=[],seen=new Set();while(out.length<6){const a=R(-9,9),b=R(-9,9);const s=a+b;if(a!==0&&b!==0&&!seen.has(s)){seen.add(s);out.push([`${fI(a)} + ${pI(b)}`,fI(s)])}}return out}})
};
const MINI_KIND=['balloons','moles','memory'];
const MINI_INFO={balloons:{title:'Estoura-balões',icon:'🎈',verb:'Estoure os balões'},moles:{title:'Toupeira dos números',icon:'🐹',verb:'Acerte as toupeiras'},memory:{title:'Jogo da memória',icon:'🃏',verb:'Encontre os pares iguais'}};
const miniGoal=(kind,spec)=>kind==='memory'?'Encontre os pares que combinam!':`${MINI_INFO[kind].verb} ${spec.crit}!`;
