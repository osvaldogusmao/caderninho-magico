/* ================= Question generators (all grades) ================= */
const OPW={'+':'mais','−':'menos','×':'vezes','÷':'dividido por'};
const SIGNS=()=>[C('<','&lt;','menor que'),C('>','&gt;','maior que'),C('=','=','igual a')];
const hasCarry=(a,b)=>{while(a||b){if(a%10+b%10>=10)return true;a=Math.floor(a/10);b=Math.floor(b/10)}return false};
const hasBorrow=(a,b)=>{while(b){if(a%10<b%10)return true;a=Math.floor(a/10);b=Math.floor(b/10)}return false};
function offsFor(ans,op,a,b){
  if(op==='×')return[-b,b,-a,a,-1,1,10,-10];
  if(op==='÷')return[-1,1,-2,2,3];
  return ans>=1000?[-100,100,-10,10,-1000,1000]:ans>=100?[-10,10,-100,100,-1,1]:[-10,10,-1,1,-2,2];
}
function arith(a,op,b,ans){
  const s=`${fmt(a)} ${op} ${fmt(b)}`;
  return{text:`Quanto é ${s}?`,say:small(a,b)?`Quanto é ${a} ${OPW[op]} ${b}?`:'Resolva a conta.',visual:eq(`${s} = ?`),choices:numChoices(ans,{min:0,offs:offsFor(ans,op,a,b)}),answer:String(ans)};
}
const iSay=n=>n<0?`menos ${-n}`:String(n);
const pI=n=>n<0?`(−${fmt(-n)})`:fmt(n);
function iOpts(ans,cands){const s=[ans];for(const c of cands)if(s.length<4&&Number.isInteger(c)&&!s.includes(c))s.push(c);let k=1;while(s.length<4){if(!s.includes(ans+k))s.push(ans+k);k++}return shuf(s).map(v=>C(v,fI(v),iSay(v)))}
function nOpts(ans,cands){const s=[ans];const key=x=>Math.round(x*10000);for(const c of cands){if(s.length>=4)break;if(typeof c!=='number'||!isFinite(c)||c<0)continue;const v=Math.round(c*10000)/10000;if(!s.some(x=>key(x)===key(v)))s.push(v)}let k=1;while(s.length<4){const v=Math.round((ans+k)*10000)/10000;if(!s.some(x=>key(x)===key(v)))s.push(v);k++}return shuf(s).map(v=>C(String(v),fmt(v),fmt(v)))}
const unitC=(u,su)=>v=>C(v,`${fmt(v)} ${u}`,small(v)?`${v} ${su}`:fmt(v));

const POSI=[{e:'🐱',n:'gato'},{e:'📦',n:'caixa',f:1},{e:'🎩',n:'chapéu'},{e:'🐶',n:'cachorro'},{e:'⚽',n:'bola',f:1},{e:'🎂',n:'bolo'},{e:'🐸',n:'sapo'},{e:'🌸',n:'flor',f:1},{e:'🐢',n:'tartaruga',f:1},{e:'🧸',n:'ursinho'}];
const ORD=['primeiro','segundo','terceiro','quarto','quinto'];
const CATS={frutas:['🍎','🍌','🍇','🍓','🍐','🍉'],animais:['🐶','🐱','🐰','🐻','🐸','🐷'],veículos:['🚗','🚌','🚲','🚀','🚂','🚁'],roupas:['👕','👖','👗','🧦','🧢','👟']};
const COLORG={vermelho:['🍎','🍓','🍒','🚒','❤️'],amarelo:['🍌','🌻','🐥','⭐','🌽'],verde:['🥦','🐸','🍀','🥒','🌳'],azul:['💙','🐳','🧢','🦋','👖']};

const G={
 count:(lo,hi)=>()=>{const t=pick(THINGS),n=R(lo,hi);return{text:`${qnt(t)} ${t.n} você vê?`,visual:objs(n,t.e),choices:numChoices(n,{min:Math.max(0,lo-1),max:hi+2}),answer:String(n)}},
 countGroups:(ks)=>()=>{const t=pick(THINGS),k=pick(ks),g=R(2,k===2?8:k===5?6:5),a=k*g;
   return{text:`Conte de ${k} em ${k}. ${qnt(t)} ${t.n} ao todo?`,visual:`<div class="groups">${Array.from({length:g},()=>`<div class="grp" style="--k:${k===2?2:5}">${`<span>${t.e}</span>`.repeat(k)}</div>`).join('')}</div>`,choices:numChoices(a,{min:k,offs:[-k,k,-1,1,2*k]}),answer:String(a)}},
 countTens:()=>()=>{const g=R(2,9),a=g*10;return{text:'Cada barrinha tem 10 bolinhas. Quantas bolinhas ao todo?',visual:rods(g),choices:numChoices(a,{min:10,max:100,offs:[-10,10,-1,1,20]}),answer:String(a)}},
 addPic:(max)=>()=>{const s=R(2,max),a=R(1,s-1),b=s-a,t=pick(THINGS);return{text:`Quanto é ${a} + ${b}?`,say:`Quanto é ${a} mais ${b}?`,visual:`${objs(a,t.e)}<span class="op">+</span>${objs(b,t.e)}`,choices:numChoices(s,{min:1,max:max+2}),answer:String(s)}},
 subPic:(max)=>()=>{const a=R(2,max),b=R(1,a),t=pick(THINGS);return{text:`Tinha ${a} ${t.n}. Saíram ${b}. ${qnt(t)} ficaram?`,visual:`${objs(a,t.e,b)}${eq(`${a} − ${b} = ?`)}`,choices:numChoices(a-b,{min:0,max}),answer:String(a-b)}},
 nline:(smin,smax,step)=>()=>{const s=step*R(smin,smax),m=R(1,10),ans=s+m*step;return{text:'Que número está escondido na reta?',visual:numberLine(s,m,step),choices:numChoices(ans,{min:0,offs:[-step,step,-2*step,2*step]}),answer:String(ans)}},
 seq:(o)=>()=>{const st=pick(o.steps);const span=st*4;const lo=o.min||0;const s=lo+st*R(0,Math.max(0,Math.floor((o.max-lo-span)/st)));const up=Math.random()<.6;const terms=Array.from({length:5},(_,i)=>up?s+i*st:s+span-i*st);const m=R(0,4);
   const txt=st>1?`Pule de ${st} em ${st}. Qual número falta?`:up?'Os números estão subindo. Qual falta?':'Os números estão descendo. Qual falta?';
   return{text:txt,say:terms.every(x=>x<=100)?`${terms.map((t,i)=>i===m?'quanto':t).join('; ')}. Qual número falta?`:txt,visual:`<div class="seq">${terms.map((t,i)=>i===m?'<span class="sq hole">?</span>':`<span class="sq">${fmt(t)}</span>`).join('')}</div>`,choices:numChoices(terms[m],{min:0,offs:[-st,st,-1,1,2*st,10,-10]}),answer:String(terms[m])}},
 parity:(lo,hi)=>()=>{const want=Math.random()<.5?0:1;const s=new Set();let target;do{target=R(lo,hi)}while(target%2!==want);s.add(target);while(s.size<4){const x=R(lo,hi);if(x%2!==want)s.add(x)}
   return{text:`Qual destes números é ${want?'ímpar':'par'}?`,hint:'Pares terminam em 0, 2, 4, 6 ou 8.',choices:shuf([...s]).map(N),answer:String(target)}},
 prime:(hi)=>()=>{const ps=[],cs=[];for(let i=2;i<=hi;i++)(isPrime(i)?ps:cs).push(i);const askP=Math.random()<.6;const ans=pick(askP?ps:cs);const others=shuf(askP?cs:ps).slice(0,3);
   return{text:`Qual destes números ${askP?'é primo':'não é primo'}?`,hint:'Primo só pode ser dividido por 1 e por ele mesmo.',choices:shuf([ans,...others]).map(N),answer:String(ans)}},
 add:(A,B,o={})=>()=>{let a,b,t=0;do{a=R(...A);b=R(...B);t++}while(t<200&&((o.carry===false&&hasCarry(a,b))||(o.carry===true&&!hasCarry(a,b))));if(Math.random()<.5)[a,b]=[b,a];return arith(a,'+',b,a+b)},
 sub:(A,B,o={})=>()=>{let a,b,t=0;do{a=R(...A);b=R(...B);if(b>a)[a,b]=[b,a];t++}while(t<200&&((o.borrow===false&&hasBorrow(a,b))||(o.borrow===true&&!hasBorrow(a,b))));return arith(a,'−',b,a-b)},
 addsub:(A)=>()=>Math.random()<.5?G.add(A,A)():G.sub(A,A)(),
 doubles:()=>()=>{const a=R(2,10),d=pick([0,0,1,-1]),b=a+d;const txt=d===0?'Dobro!':d===1?'Dobro mais um!':'Dobro menos um!';const q=arith(a,'+',b,a+b);q.hint=`${txt} Pense em ${a} + ${a}.`;return q},
 mul:(A,B)=>()=>{let a=R(...A),b=R(...B);if(Math.random()<.5)[a,b]=[b,a];return arith(a,'×',b,a*b)},
 mulTens:(big)=>()=>{const a=R(2,9),b=big?R(11,99)*10:R(1,9)*10;const[x,y]=Math.random()<.5?[a,b]:[b,a];return arith(x,'×',y,a*b)},
 mulGroups:()=>()=>{const t=pick(THINGS),g=R(2,5),k=R(2,5);return{text:`São ${g} grupos com ${k} em cada. ${qnt(t)} ${t.n} ao todo?`,visual:`<div class="groups">${Array.from({length:g},()=>`<div class="grp" style="--k:${Math.min(k,3)}">${`<span>${t.e}</span>`.repeat(k)}</div>`).join('')}</div>${eq(`${g} × ${k} = ?`)}`,choices:numChoices(g*k,{min:1,offs:[-k,k,-g,g,1,-1]}),answer:String(g*k)}},
 mulArray:()=>()=>{const r=R(2,6),c=R(2,8);return{text:`Quantas bolinhas tem o arranjo de ${r} fileiras com ${c} em cada?`,visual:`<div class="objs" style="--cols:${c};font-size:1.6rem;gap:6px">${'<span>🔵</span>'.repeat(r*c)}</div>${eq(`${r} × ${c} = ?`)}`,choices:numChoices(r*c,{min:1,offs:[-c,c,-r,r,1,-1]}),answer:String(r*c)}},
 div:(D,Q,o={})=>()=>{const d=R(...D),q=R(...Q);if(o.rem){const r=R(1,d-1),a=d*q+r;const askR=Math.random()<.5;const w=askR?'o resto':'o quociente';
     return{text:`${fmt(a)} ÷ ${d}: qual é ${w}?`,say:small(a,d)?`${a} dividido por ${d}. Qual é ${w}?`:`Qual é ${w} desta divisão?`,visual:eq(`${fmt(a)} ÷ ${d}`),choices:numChoices(askR?r:q,{min:0,offs:[-1,1,-2,2,3]}),answer:String(askR?r:q)}}
   return arith(d*q,'÷',d,q)},
 divShare:()=>()=>{const t=pick(THINGS),k=R(2,4),q=R(2,5),n=k*q;return{text:`${n} ${t.n} divididos igualmente entre ${k} amigos. Quantos para cada um?`,visual:objs(n,t.e,0,Math.min(n,6)),choices:numChoices(q,{min:1,offs:[-1,1,2,-2]}),answer:String(q)}},
 miss:(op,R1,R2)=>()=>{let a=R(...R1),b=R(...R2),c;
   if(op==='+')c=a+b;else if(op==='−'){if(b>a)[a,b]=[b,a];c=a-b}else if(op==='×')c=a*b;else{const q=a;a=b*q;c=q}
   const pos=R(0,1),ans=pos?b:a,s=pos?`${fmt(a)} ${op} ? = ${fmt(c)}`:`? ${op} ${fmt(b)} = ${fmt(c)}`;
   return{text:'Que número completa a conta?',say:small(a,b,c)?'Que número completa? '+sayEq(s):'Que número completa a conta?',visual:eq(s),choices:numChoices(ans,{min:0,offs:[-1,1,-2,2,10,-10]}),answer:String(ans)}},
 opm:(ops,A,B)=>()=>{for(let t=0;t<300;t++){const a=R(...A),b=R(...B),op=pick(ops);const v=x=>x==='+'?a+b:x==='−'?a-b:x==='×'?a*b:(b&&a%b===0?a/b:NaN);const c=v(op);
     if(!(c>=0)||!Number.isInteger(c)||ops.some(o=>o!==op&&v(o)===c))continue;
     return{text:'Qual sinal está faltando?',say:small(a,b,c)?`${a}, qual sinal, ${b}, é igual a ${c}?`:'Qual sinal está faltando?',visual:eq(`${fmt(a)} ○ ${fmt(b)} = ${fmt(c)}`),cols:ops.length,choices:ops.map(o=>C(o,o,OPW[o])),answer:op}}
   return G.opm(['+','−'],[10,20],[1,9])()},
 mixed4:()=>()=>pick([G.add([10,99],[10,99]),G.sub([20,99],[1,50]),G.mul([2,10],[2,10]),G.div([2,10],[2,10])])(),
 ops:()=>()=>{const a=R(2,9),b=R(2,9),c=R(2,9);const forms=[[`${a} + ${b} × ${c}`,a+b*c,(a+b)*c],[`${a} × ${b} − ${c}`,a*b-c,a*(b-c)],[`(${a} + ${b}) × ${c}`,(a+b)*c,a+b*c],[`${a*c} ÷ ${c} + ${b}`,a+b,a*c/(c+b)],[`${a} + ${b*c} ÷ ${c}`,a+b,(a+b*c)/c],[`${a} × (${b} + ${c})`,a*(b+c),a*b+c]].filter(f=>f[1]>=0);
   const [s,ans,wrong]=pick(forms);
   return{text:`Quanto é ${s}?`,say:'Resolva a expressão. Primeiro os parênteses, depois vezes e dividido.',hint:'Primeiro ( ), depois × e ÷, por último + e −.',visual:eq(`${s} = ?`),choices:opts(ans,[Number.isInteger(wrong)?wrong:null,ans+1,ans-1,ans+c,ans+10]),answer:String(ans)}},
 props:()=>()=>{const a=R(2,9),b=R(2,9),c=R(2,9);const bank=[[`${a} + ${b} = ${b} + ${a}`,'comutativa'],[`${a} × ${b} = ${b} × ${a}`,'comutativa'],[`(${a} + ${b}) + ${c} = ${a} + (${b} + ${c})`,'associativa'],[`(${a} × ${b}) × ${c} = ${a} × (${b} × ${c})`,'associativa'],[`${a} + 0 = ${a}`,'elemento neutro'],[`${a} × 1 = ${a}`,'elemento neutro'],[`${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ${c}`,'distributiva']];const [s,ans]=pick(bank);
   return{text:'Qual propriedade foi usada?',visual:`<div class="eq" style="font-size:clamp(1.3rem,5vw,2.2rem)">${s}</div>`,txtc:1,choices:['comutativa','associativa','elemento neutro','distributiva'].map(x=>C(x,cap(x))),answer:ans}},
 cmp:(lo,hi)=>()=>{const a=R(lo,hi);const b=Math.random()<.18?a:R(lo,hi);const ans=a<b?'<':a>b?'>':'=';return{text:'Qual sinal completa?',say:small(a,b)?`Compare ${a} e ${b}. Qual sinal completa?`:'Qual sinal completa?',visual:eq(`${fmt(a)} ○ ${fmt(b)}`),hint:'🐊 A boca do jacaré abre para o número maior.',cols:3,choices:SIGNS(),answer:ans}},
 maxmin:(lo,hi)=>()=>{const s=new Set();while(s.size<4)s.add(R(lo,hi));const arr=[...s];const want=Math.random()<.5?'maior':'menor';const ans=want==='maior'?Math.max(...arr):Math.min(...arr);return{text:`Qual é o ${want} número?`,choices:arr.map(N),answer:String(ans)}},
 order:(lo,hi)=>()=>{const s=new Set();while(s.size<4)s.add(R(lo,hi));const base=[...s];const up=Math.random()<.5;const sorted=base.slice().sort((x,y)=>up?x-y:y-x);const list=[sorted];let g=0;while(list.length<3&&g<60){g++;const p=shuf(base);if(!list.some(o=>o.join()===p.join()))list.push(p)}
   return{text:`Qual lista está em ordem ${up?'crescente (do menor para o maior)':'decrescente (do maior para o menor)'}?`,txtc:1,cols:1,choices:shuf(list.map((o,i)=>C(o.join('|'),o.map(fmt).join(' · '),'esta lista'))),answer:sorted.join('|')}},
 groupsCmp:(which)=>()=>{const t=pick(THINGS);const a=R(1,10);let b=Math.random()<.22?a:R(1,10);const more=which==='mais';const ans=a===b?'=':(a>b)===more?'a':'b';
   return{text:`Qual grupo tem ${which}?`,cols:2,choices:[C('a',objs(a,t.e,0,Math.min(a,4)),'o primeiro grupo'),C('b',objs(b,t.e,0,Math.min(b,4)),'o segundo grupo'),Object.assign(C('=','Os dois têm igual','os dois têm igual'),{wide:1})],answer:ans}},
 place:(d)=>()=>{const n=R(10**(d-1),10**d-1);const ds=String(n);let p;do{p=R(0,d-1)}while(ds[d-1-p]==='0');const dig=+ds[d-1-p];const html=ds.split('').map((c,i)=>i===d-1-p?`<u>${c}</u>`:c).join('');
   const others=shuf(Array.from({length:d+1},(_,k)=>dig*10**k).filter(v=>v!==dig*10**p));
   return{text:'Qual é o valor do algarismo sublinhado?',visual:`<div class="bignum">${html}</div>`,choices:opts(dig*10**p,others),answer:String(dig*10**p)}},
 compose:(d)=>()=>{const n=R(10**(d-1),10**d-1);const ds=String(n);const names=[['unidade','unidades'],['dezena','dezenas'],['centena','centenas'],['unidade de milhar','unidades de milhar']];const parts=[];
   for(let p=d-1;p>=0;p--){const dg=+ds[d-1-p];if(dg)parts.push(`${dg} ${names[p][dg>1?1:0]}`)}
   const txt=parts.length>1?parts.slice(0,-1).join(', ')+' e '+parts[parts.length-1]:parts[0];const sw=+ds.split('').reverse().join('');
   return{text:`${txt}. Que número é esse?`,choices:opts(n,shuf([sw>=10**(d-1)?sw:null,n+10,n-10,n+100,n-100,n+1].filter(x=>x>0))),answer:String(n)}},
 round:(tos,lo,hi)=>()=>{const to=pick(tos);let n;do{n=R(lo,hi)}while(n%to===0);const ans=Math.round(n/to)*to;const nm={10:'dezena',100:'centena',1000:'unidade de milhar'}[to];const other=Math.floor(n/to)*to===ans?ans+to:ans-to;
   return{text:`Arredonde ${fmt(n)} para a ${nm} mais próxima.`,say:small(n)?`Arredonde ${n} para a ${nm} mais próxima.`:`Arredonde o número para a ${nm} mais próxima.`,visual:`<div class="bignum">${fmt(n)}</div>`,choices:opts(ans,[other,ans+2*to,ans-2*to,n]),answer:String(ans)}},
 estimate:()=>()=>{const a=R(1100,8900),b=R(1100,8900),ra=Math.round(a/1000)*1000,rb=Math.round(b/1000)*1000,ans=ra+rb;
   return{text:`Estime ${fmt(a)} + ${fmt(b)} arredondando para o milhar mais próximo.`,say:'Estime a soma arredondando para o milhar mais próximo.',visual:eq(`${fmt(a)} + ${fmt(b)} ≈ ?`),choices:opts(ans,[ans+1000,ans-1000,a+b,ans+2000]),answer:String(ans)}},
 estMul:()=>()=>{const a=R(12,98),b=R(12,98),ra=Math.round(a/10)*10,rb=Math.round(b/10)*10,ans=ra*rb;
   return{text:`Estime ${a} × ${b} arredondando para a dezena mais próxima.`,say:`Estime ${a} vezes ${b} arredondando para a dezena mais próxima.`,visual:eq(`${a} × ${b} ≈ ?`),choices:opts(ans,[a*b,ans+rb*10,ans-ra*10,ra+rb]),answer:String(ans)}},
 multiple:()=>()=>{const k=R(2,9);const ans=k*R(2,12);const others=[];while(others.length<3){const x=R(4,k*12+5);if(x%k&&!others.includes(x))others.push(x)}return{text:`Qual destes números é múltiplo de ${k}?`,choices:shuf([ans,...others]).map(N),answer:String(ans)}},
 divisor:()=>()=>{const n=pick([12,16,18,20,24,28,30,32,36,40,42,45,48,54,56,60,63,64,72,80,84,90,96,100]);const ds=[];for(let i=2;i<n;i++)if(n%i===0)ds.push(i);const ans=pick(ds);const others=[];while(others.length<3){const x=R(2,Math.min(n-1,30));if(n%x&&!others.includes(x))others.push(x)}
   return{text:`Qual destes números é divisor de ${n}?`,choices:shuf([ans,...others]).map(N),answer:String(ans)}},
 gcd:()=>()=>{let g,x,y;do{g=R(2,12);x=R(1,9);y=R(1,9)}while(x===y||gcdf(x,y)!==1);const a=g*x,b=g*y;
   return{text:`Qual é o MDC de ${a} e ${b}?`,say:small(a,b)?`Qual é o máximo divisor comum de ${a} e ${b}?`:'Qual é o máximo divisor comum destes números?',hint:'MDC é o maior número que divide os dois.',choices:opts(g,shuf([g*2,g+1,g-1>0?g-1:null,Math.min(a,b)])),answer:String(g)}},
 lcm:()=>()=>{let a,b;do{a=R(2,12);b=R(2,12)}while(a===b);const l=a*b/gcdf(a,b);
   return{text:`Qual é o MMC de ${a} e ${b}?`,say:`Qual é o mínimo múltiplo comum de ${a} e ${b}?`,hint:'MMC é o menor número que é múltiplo dos dois.',choices:opts(l,shuf([a*b,l*2,l+a,l+b,Math.max(a,b)])),answer:String(l)}},
 factor:()=>()=>{const f=[];const k=R(2,4);for(let i=0;i<k;i++)f.push(pick([2,2,2,3,3,5,7]));f.sort((x,y)=>x-y);const n=f.reduce((x,y)=>x*y,1);const str=a=>a.join(' × ');const ans=str(f);const c=new Set([ans]);let g=0;
   while(c.size<4&&g<80){g++;const m=f.slice();const t=R(0,2);if(t===0)m[R(0,m.length-1)]=pick([2,3,5,7]);else if(t===1)m.push(pick([2,3]));else if(m.length>2)m.splice(R(0,m.length-1),1);else m[0]=m[0]*2;m.sort((x,y)=>x-y);if(m.reduce((x,y)=>x*y,1)!==n)c.add(str(m))}
   return{text:`Qual é a fatoração em números primos de ${fmt(n)}?`,say:small(n)?`Qual é a fatoração em números primos de ${n}?`:'Qual é a fatoração em números primos?',txtc:1,choices:shuf([...c]).map(s=>C(s,s,s.replace(/×/g,'vezes'))),answer:ans}},
 power:()=>()=>{const b=R(2,10),e=b<=5?R(2,3):2;const ans=b**e;const sup={2:'²',3:'³'}[e];
   return{text:`Quanto é ${b}${sup}?`,say:`Quanto é ${b} elevado a ${e}?`,hint:`${b}${sup} = ${Array(e).fill(b).join(' × ')}`,visual:`<div class="bignum">${b}<sup>${e}</sup></div>`,choices:opts(ans,[b*e,ans+b,ans-b,b+e]),answer:String(ans)}},
 arith:(down)=>()=>{const st=R(2,25);const s=down?R(st*5,st*5+60):R(1,60);const terms=Array.from({length:5},(_,i)=>down?s-i*st:s+i*st);
   return{text:`Qual é o próximo número da sequência?`,say:terms.slice(0,4).every(t=>t<=100&&t>=0)?`${terms.slice(0,4).join('; ')}. Qual é o próximo?`:'Qual é o próximo número da sequência?',visual:`<div class="seq">${terms.slice(0,4).map(t=>`<span class="sq">${fmt(t)}</span>`).join('')}<span class="sq hole">?</span></div>`,choices:numChoices(terms[4],{min:0,offs:[-st,st,1,-1,2*st]}),answer:String(terms[4])}},
 geo:()=>()=>{const r=pick([2,2,3,3,4,5,10]),s=R(1,r>=4?3:6);const terms=Array.from({length:5},(_,i)=>s*r**i);
   return{text:'Cada número é multiplicado pelo mesmo valor. Qual é o próximo?',say:terms.slice(0,4).every(t=>t<=100)?`${terms.slice(0,4).join('; ')}. Qual é o próximo?`:'Qual é o próximo número da sequência?',visual:`<div class="seq">${terms.slice(0,4).map(t=>`<span class="sq">${fmt(t)}</span>`).join('')}<span class="sq hole">?</span></div>`,choices:opts(terms[4],[terms[3]+(terms[3]-terms[2]),terms[4]*r,terms[3]*2===terms[4]?terms[3]*3:terms[3]*2,terms[4]+r]),answer:String(terms[4])}},
 /* fractions */
 fEq:()=>()=>{const d=R(2,6),n=R(1,d-1),[x,y]=red(n,d);const k=R(2,4);
   if(Math.random()<.5)return{text:'Que número completa a fração equivalente?',say:'Que número completa a fração equivalente?',visual:`<div class="eq">${fracHTML(x,y)} = <span class="frac"><span class="hole">?</span><span>${y*k}</span></span></div>`,choices:numChoices(x*k,{min:1,offs:[-1,1,k,-k,2]}),answer:String(x*k)};
   const ans=[x*k,y*k];return{text:`Qual fração é equivalente a ${x}/${y}?`,say:`Qual fração é equivalente a ${fracSay(x,y)}?`,visual:`<div class="eq">${fracHTML(x,y)}</div>`,choices:fOptsRaw(ans,[[x*k+1,y*k],[x+k,y+k],[x*k,y*k+1],[y*k,x*k],[x*k-1,y*k]]),answer:`${ans[0]}/${ans[1]}`}},
 fSimp:()=>()=>{const y=pick([2,3,4,5,6,7,8]),x=R(1,y-1);const[a,b]=red(x,y);const k=pick([2,3,4,6]);const n=a*k,d=b*k;const half=k%2===0&&k>2?[n/2,d/2]:[n,d+1];
   return{text:`Qual é a forma mais simples de ${n}/${d}?`,say:'Qual é a forma mais simples desta fração?',visual:`<div class="eq">${fracHTML(n,d)}</div>`,choices:fOptsRaw([a,b],[half,[a+1,b],[a,b+1],[n,d],[b,a]],'str'),answer:`${a}/${b}`}},
 fCmp:(mode)=>()=>{let a,b,c,d;if(mode==='den'){b=d=R(3,10);a=R(1,b-1);c=R(1,d-1)}else if(mode==='num'){a=c=R(1,5);b=R(a+1,12);d=R(a+1,12)}else{b=R(2,10);d=R(2,10);a=R(1,b-1);c=R(1,d-1)}
   const l=a*d,r=c*b;const ans=l<r?'<':l>r?'>':'=';return{text:'Qual sinal completa?',say:`Compare ${fracSay(a,b)} e ${fracSay(c,d)}. Qual sinal completa?`,visual:`<div class="eq">${fracHTML(a,b)} <span class="hole">&nbsp;</span> ${fracHTML(c,d)}</div>`,cols:3,choices:SIGNS(),answer:ans}},
 fMax:()=>()=>{const out=[];const val=x=>x[0]/x[1];let g=0;while(out.length<4&&g<100){g++;const d=R(2,10),n=R(1,d-1);if(!out.some(o=>Math.abs(val(o)-n/d)<1e-9))out.push([n,d])}const want=Math.random()<.5?'maior':'menor';const ans=out.reduce((m,x)=>(want==='maior'?val(x)>val(m):val(x)<val(m))?x:m);
   return{text:`Qual é a ${want} fração?`,choices:shuf(out).map(([n,d])=>C(`${n}/${d}`,fracHTML(n,d),fracSay(n,d))),answer:`${ans[0]}/${ans[1]}`}},
 fAddS:(mode)=>()=>{const sub=mode==='mix'?Math.random()<.5:mode;const d=R(3,12);let a,b;do{a=R(1,d-1);b=sub?R(1,d-1):R(1,d-a)}while(sub&&a<=b);const n=sub?a-b:a+b;const op=sub?'−':'+';
   return{text:`Quanto é ${a}/${d} ${op} ${b}/${d}?`,say:`Quanto é ${fracSay(a,d)} ${OPW[op]} ${fracSay(b,d)}?`,visual:`<div class="eq">${fracHTML(a,d)} ${op} ${fracHTML(b,d)} = ?</div>`,choices:fOptsRaw([n,d],[[n,2*d],[n+1,d],[n-1>0?n-1:n+2,d],[sub?a+b:Math.abs(a-b),d]]),answer:`${n}/${d}`}},
 fAddD:(mode)=>()=>{const pairs=[[2,4],[2,6],[3,6],[2,8],[4,8],[3,9],[2,3],[3,4],[2,5],[4,6],[5,10],[2,10]];for(let t=0;t<50;t++){const sub=mode==='mix'?Math.random()<.5:mode;let[b,d]=shuf(pick(pairs));let a=R(1,b-1),c=R(1,d-1);if(sub&&a*d<c*b)[a,b,c,d]=[c,d,a,b];if(sub&&a*d===c*b)continue;
     const n=sub?a*d-c*b:a*d+c*b,den=b*d,op=sub?'−':'+';const ans=red(n,den);
     return{text:`Quanto é ${a}/${b} ${op} ${c}/${d}?`,say:`Quanto é ${fracSay(a,b)} ${OPW[op]} ${fracSay(c,d)}?`,visual:`<div class="eq">${fracHTML(a,b)} ${op} ${fracHTML(c,d)} = ?</div>`,choices:fOpts(ans,[[sub?Math.abs(a-c):a+c,b+d],[sub?Math.abs(a-c):a+c,Math.max(b,d)],[ans[0]+1,ans[1]],[ans[0],ans[1]+1]]),answer:fv(n,den)}}},
 fMulW:()=>()=>{const d=R(2,10),n=R(1,d-1),k=R(2,9);const ans=red(n*k,d);return{text:`Quanto é ${k} × ${n}/${d}?`,say:`Quanto é ${k} vezes ${fracSay(n,d)}?`,visual:`<div class="eq">${k} × ${fracHTML(n,d)} = ?</div>`,choices:fOpts(ans,[[n*k,d*k],[n+k,d],[n,d*k],[ans[0]+1,ans[1]]]),answer:fv(n*k,d)}},
 fMul:()=>()=>{if(Math.random()<.35)return G.fMulW()();const b=R(2,9),d=R(2,9),a=R(1,b-1),c=R(1,d-1);const ans=red(a*c,b*d);
   return{text:`Quanto é ${a}/${b} × ${c}/${d}?`,say:`Quanto é ${fracSay(a,b)} vezes ${fracSay(c,d)}?`,visual:`<div class="eq">${fracHTML(a,b)} × ${fracHTML(c,d)} = ?</div>`,choices:fOpts(ans,[[a+c,b+d],[a*d,b*c],[a*c,b+d],[ans[0]+1,ans[1]]]),answer:fv(a*c,b*d)}},
 fDiv:()=>()=>{const b=R(2,9),d=R(2,9),a=R(1,b-1),c=R(1,d-1);const ans=red(a*d,b*c);
   return{text:`Quanto é ${a}/${b} ÷ ${c}/${d}?`,say:`Quanto é ${fracSay(a,b)} dividido por ${fracSay(c,d)}?`,hint:'Dividir por uma fração é multiplicar pelo inverso dela.',visual:`<div class="eq">${fracHTML(a,b)} ÷ ${fracHTML(c,d)} = ?</div>`,choices:fOpts(ans,[[a*c,b*d],[b*c,a*d],[a,b*d],[ans[0]+1,ans[1]]]),answer:fv(a*d,b*c)}},
 /* decimals */
 dRep:(p)=>()=>{if(p===1){const k=R(1,9);return{text:'Que número decimal mostra a parte pintada?',hint:'A barra inteira vale 1.',visual:bar(10,k,'var(--teal)'),choices:sOpts(`0,${k}`,shuf([`0,${k===9?8:k+1}`,`0,0${k}`,`${k}`,`0,${10-k}`])),answer:`0,${k}`}}
   const k=R(1,99);const a=(k/100).toFixed(2).replace('.',',');return{text:'Que número decimal mostra a parte pintada?',hint:'O quadrado inteiro vale 1.',visual:grid100(k,'var(--teal)'),choices:sOpts(a,shuf([(k/10).toFixed(1).replace('.',','),((100-k)/100).toFixed(2).replace('.',','),(Math.min(k+10,99)/100).toFixed(2).replace('.',','),`${k}`])),answer:a}},
 dCmp:(p)=>()=>{const sc=10**p;let A=R(1,9*sc),B;if(Math.random()<.35&&p>1){B=Math.floor(A/10)*10+(A%10?0:5)}else B=Math.random()<.15?A:R(1,9*sc);const a=A/sc,b=B/sc;const ans=a<b?'<':a>b?'>':'=';
   return{text:'Qual sinal completa?',say:'Compare os números decimais. Qual sinal completa?',visual:eq(`${fmt(a)} ○ ${fmt(b)}`),cols:3,choices:SIGNS(),answer:ans}},
 dAr:(op,p,max)=>()=>{const sc=10**p;let A=R(1,max*sc),B=R(1,max*sc);if(op==='−'&&B>A)[A,B]=[B,A];const Cc=op==='+'?A+B:A-B;const ans=Cc/sc;
   return{text:`Quanto é ${fmt(A/sc)} ${op} ${fmt(B/sc)}?`,say:'Resolva a conta com números decimais.',visual:eq(`${fmt(A/sc)} ${op} ${fmt(B/sc)} = ?`),choices:nOpts(ans,[(Cc+1)/sc,(Cc-1)/sc,(Cc+sc)/sc,(Cc-sc)/sc,(Cc+10)/sc]),answer:String(ans)}},
 dArMix:(p,max)=>()=>G.dAr(Math.random()<.5?'+':'−',p,max)(),
 dPow10:()=>()=>{const A=R(11,999),p=R(1,2),sc=10**p,m=pick([10,100,1000]);const x=A/sc,ans=Math.round(A*m)/sc;const mul=Math.random()<.6;const res=mul?ans:A/(sc*m);
   return{text:`Quanto é ${fmt(x)} ${mul?'×':'÷'} ${fmt(m)}?`,say:mul?`Multiplique o número decimal por ${m===1000?'mil':m}.`:`Divida o número decimal por ${m===1000?'mil':m}.`,visual:eq(`${fmt(x)} ${mul?'×':'÷'} ${fmt(m)} = ?`),choices:nOpts(res,[res*10,res/10,mul?res*100:res/100,x]),answer:String(Math.round(res*1e6)/1e6)}},
 dMul:()=>()=>{const A=R(11,99),p=R(1,2),sc=10**p,k=R(2,9);const ans=Math.round(A*k)/sc;
   return{text:`Quanto é ${fmt(A/sc)} × ${k}?`,say:'Resolva a multiplicação com número decimal.',visual:eq(`${fmt(A/sc)} × ${k} = ?`),choices:nOpts(ans,[ans*10,ans/10,(A*k+1)/sc,(A+k)/sc]),answer:String(ans)}},
 dDiv:()=>()=>{if(Math.random()<.4)return G.dPow10()();const k=R(2,9),Q=R(11,99),p=1,sc=10;const ans=Q/sc,A=Q*k;
   return{text:`Quanto é ${fmt(A/sc)} ÷ ${k}?`,say:'Resolva a divisão com número decimal.',visual:eq(`${fmt(A/sc)} ÷ ${k} = ?`),choices:nOpts(ans,[Q,ans/10,(Q+1)/sc,(Q-1)/sc]),answer:String(ans)}},
 dRound:()=>()=>{const A=R(101,9999);if(A%10===0)return G.dRound()();const x=A/100;const whole=Math.random()<.5;const ans=whole?Math.round(x):Math.round(A/10)/10;
   return{text:`Arredonde ${fmt(x)} para ${whole?'o número inteiro':'o décimo'} mais próximo.`,say:`Arredonde o número para ${whole?'o número inteiro':'o décimo'} mais próximo.`,visual:`<div class="bignum">${fmt(x)}</div>`,choices:nOpts(ans,whole?[Math.floor(x)===ans?ans+1:ans-1,ans+2,x]:[Math.floor(A/10)/10===ans?ans+.1:ans-.1,Math.round(x),ans+1]),answer:String(ans)}},
 dToF:()=>()=>{const bank=[[.5,1,2],[.25,1,4],[.75,3,4],[.1,1,10],[.2,1,5],[.4,2,5],[.3,3,10],[.6,3,5],[.8,4,5],[.7,7,10],[.9,9,10]];const [x,n,d]=pick(bank);
   if(Math.random()<.5)return{text:`${fmt(x)} é igual a qual fração?`,say:'Este número decimal é igual a qual fração?',visual:`<div class="bignum">${fmt(x)}</div>`,choices:fOpts([n,d],shuf(bank.filter(b=>b[0]!==x)).map(b=>[b[1],b[2]])),answer:fv(n,d)};
   return{text:`${n}/${d} é igual a qual número decimal?`,say:`${fracSay(n,d)} é igual a qual número decimal?`,visual:`<div class="eq">${fracHTML(n,d)}</div>`,choices:nOpts(x,shuf(bank.filter(b=>b[0]!==x)).map(b=>b[0]).concat([n/10])),answer:String(x)}},
 divDec:()=>()=>{const b=pick([2,4,5,8,10]);let a;do{a=R(b+1,b*20)}while(a%b===0);const ans=a/b;
   return{text:`Quanto é ${a} ÷ ${b}?`,say:`Quanto é ${a} dividido por ${b}?`,hint:'O resultado tem vírgula.',visual:eq(`${a} ÷ ${b} = ?`),choices:nOpts(ans,[Math.floor(ans),ans+.5,ans-.5>0?ans-.5:ans+1,Math.floor(ans)+(a%b)/10]),answer:String(ans)}},
 /* percent & ratio */
 pConv:()=>()=>{const bank=[[50,1,2],[25,1,4],[75,3,4],[10,1,10],[20,1,5],[40,2,5],[30,3,10],[60,3,5],[80,4,5]];const [p,n,d]=pick(bank);const t=R(0,2);const others=shuf(bank.filter(b=>b[0]!==p));
   if(t===0)return{text:`${p}% é igual a qual fração?`,say:`${p} por cento é igual a qual fração?`,visual:`<div class="bignum">${p}%</div>`,choices:fOpts([n,d],others.map(b=>[b[1],b[2]])),answer:fv(n,d)};
   if(t===1)return{text:`${p}% é igual a qual número decimal?`,say:`${p} por cento é igual a qual número decimal?`,visual:`<div class="bignum">${p}%</div>`,choices:nOpts(p/100,[p/10,p,(p+5)/100,p/1000]),answer:String(p/100)};
   return{text:`Qual porcentagem é igual a ${n}/${d}?`,say:`Qual porcentagem é igual a ${fracSay(n,d)}?`,visual:`<div class="eq">${fracHTML(n,d)}</div>`,choices:opts(p,others.map(b=>b[0]),v=>C(v,`${v}%`,`${v} por cento`)),answer:String(p)}},
 pOf:()=>()=>{const p=pick([10,20,25,50,75]);const unit=100/gcdf(p,100);const base=unit*R(1,Math.max(2,Math.floor(200/unit)));const ans=p*base/100;
   return{text:`Quanto é ${p}% de ${fmt(base)}?`,say:small(base)?`Quanto é ${p} por cento de ${base}?`:`Quanto é ${p} por cento deste número?`,visual:eq(`${p}% de ${fmt(base)} = ?`),choices:opts(ans,[ans*2,ans/2,base-ans,ans+10,p].filter(Number.isInteger)),answer:String(ans)}},
 pMix:()=>()=>(Math.random()<.5?G.pConv():G.pOf())(),
 ratio:()=>()=>{let a,b;do{a=R(1,9);b=R(1,9)}while(a===b||gcdf(a,b)!==1);const k=R(2,5);const ans=`${a*k} : ${b*k}`;
   return{text:`Qual razão é equivalente a ${a} : ${b}?`,say:`Qual razão é equivalente a ${a} para ${b}?`,visual:`<div class="bignum">${a} : ${b}</div>`,txtc:1,choices:sOpts(ans,shuf([`${b*k} : ${a*k}`,`${a+k} : ${b+k}`,`${a*k} : ${b*k+1}`,`${a*k} : ${b}`])),answer:ans}},
 /* integers */
 iLine:()=>()=>{const s=R(-10,-2),m=R(0,10);const ans=s+m;return{text:'Que número está escondido na reta?',visual:numberLine(s,m),choices:iOpts(ans,[-ans,ans+1,ans-1,ans+2]),answer:String(ans)}},
 iCmp:()=>()=>{const a=R(-15,15);let b=R(-15,15);if(Math.random()<.4)b=-a;if(b===a&&a!==0)b=a-1;const ans=a<b?'<':a>b?'>':'=';
   return{text:'Qual sinal completa?',say:`Compare ${iSay(a)} e ${iSay(b)}. Qual sinal completa?`,visual:eq(`${fI(a)} ○ ${fI(b)}`),hint:'Na reta numérica, quem está mais à direita é maior.',cols:3,choices:SIGNS(),answer:ans}},
 iMin:()=>()=>{const s=new Set();while(s.size<4)s.add(R(-20,20));const arr=[...s];const want=Math.random()<.5?'maior':'menor';const ans=want==='maior'?Math.max(...arr):Math.min(...arr);return{text:`Qual é o ${want} número?`,choices:arr.map(v=>C(v,fI(v),iSay(v))),answer:String(ans)}},
 iAr:(ops)=>()=>{const op=pick(ops);let a=R(-12,12),b=R(-12,12),ans;
   if(op==='÷'){b=pick([-6,-5,-4,-3,-2,2,3,4,5,6]);const q=R(-9,9);a=b*q;ans=q}else{if(a===0)a=-3;if(b===0)b=4;ans=op==='+'?a+b:op==='−'?a-b:a*b}
   return{text:`Quanto é ${fI(a)} ${op} ${pI(b)}?`,say:`Quanto é ${iSay(a)} ${OPW[op]} ${iSay(b)}?`,hint:op==='×'||op==='÷'?'Sinais iguais dão positivo; sinais diferentes dão negativo.':'',visual:eq(`${fI(a)} ${op} ${pI(b)} = ?`),choices:iOpts(ans,[-ans,ans+1,ans-1,op==='−'?a+b:a-b]),answer:String(ans)}},
 /* units & time */
 uConv:(kinds)=>()=>{const T={m_cm:['m','cm',100],km_m:['km','m',1000],cm_mm:['cm','mm',10],kg_g:['kg','g',1000],L_mL:['L','mL',1000],h_min:['h','min',60],min_s:['min','s',60],sem_d:['semanas','dias',7],dia_h:['dias','horas',24],ano_mes:['anos','meses',12]};
   const UN={m:'metros',cm:'centímetros',km:'quilômetros',mm:'milímetros',kg:'quilos',g:'gramas',L:'litros',mL:'mililitros',h:'horas',min:'minutos',s:'segundos',semanas:'semanas',dias:'dias',horas:'horas',anos:'anos',meses:'meses'};
   const fem=['horas','semanas'];const [u1,u2,f]=T[pick(kinds)];const v=R(2,9);const ans=v*f;
   return{text:`${v} ${u1} = quantos ${u2}?`,say:`${v} ${UN[u1]} são ${fem.includes(UN[u2])?'quantas':'quantos'} ${UN[u2]}?`,visual:eq(`${v} ${u1} = ? ${u2}`),choices:opts(ans,[ans/10,ans*10,ans+f,ans-f,v+f].filter(Number.isInteger)),answer:String(ans)}},
 uChoose:()=>()=>{const bank=[['a massa de uma melancia','quilograma'],['a massa de uma maçã','grama'],['a água de uma piscina','litro'],['o remédio de uma colher','mililitro'],['o comprimento de um lápis','centímetro'],['a distância entre duas cidades','quilômetro'],['a altura de uma porta','metro'],['a massa de um elefante','tonelada']];const [x,ans]=pick(bank);
   const groups={massa:['grama','quilograma','tonelada'],cap:['litro','mililitro'],comp:['centímetro','metro','quilômetro']};const pool=['grama','quilograma','tonelada','litro','mililitro','centímetro','metro','quilômetro'];
   return{text:`Que unidade é melhor para medir ${x}?`,txtc:1,choices:sOpts(ans,shuf(pool)),answer:ans}},
 thermo:(neg)=>()=>{const min=neg?-20:0,max=neg?30:40,step=10;const t=neg?R(-9,14)*2:R(0,20)*2;
   return{text:'Qual é a temperatura no termômetro?',visual:thermoSVG(t,min,max,step),choices:opts(t,[t+2,t-2,t+10,t-10,-t].filter(x=>x>=min&&x<=max),v=>C(v,`${fI(v)} °C`,v<0?`menos ${-v} graus`:`${v} graus`)).map(c=>c),answer:String(t)}},
 clock:(quarter)=>()=>{const h=R(1,12),m=quarter?pick([0,15,30,45]):pick([0,30]);const f=(H,M)=>`${H}:${String(M).padStart(2,'0')}`;const sayT=(H,M)=>M===0?`${H} horas`:`${H} e ${M}`;
   const cands=[[h%12+1,m],[h,m===0?30:0],[m/5||12,h*5%60],[h===1?12:h-1,m]];const s=[[h,m]];for(const c of cands)if(s.length<4&&!s.some(x=>x[0]===c[0]&&x[1]===c[1])&&c[0]>=1&&c[0]<=12)s.push(c);
   return{text:'Que horas o relógio mostra?',visual:clockSVG(h,m),hint:'O ponteiro pequeno mostra as horas; o grande, os minutos.',choices:shuf(s).map(([H,M])=>C(f(H,M),f(H,M),sayT(H,M))),answer:f(h,m)}},
 /* geometry */
 aClass:()=>()=>{const k=pick(['agudo','reto','obtuso','raso']);const deg=k==='agudo'?R(20,75):k==='reto'?90:k==='obtuso'?R(110,160):180;
   return{text:'Como se chama este ângulo?',visual:angleSVG(deg),txtc:1,choices:['agudo','reto','obtuso','raso'].map(x=>C(x,cap(x))),answer:k}},
 aTri:()=>()=>{const a=R(30,90),b=R(20,150-a),c=180-a-b;
   return{text:`Um triângulo tem ângulos de ${a}° e ${b}°. Quanto mede o terceiro ângulo?`,say:small(a,b)?`Um triângulo tem ângulos de ${a} e ${b} graus. Quanto mede o terceiro ângulo?`:'Quanto mede o terceiro ângulo do triângulo?',hint:'A soma dos ângulos de um triângulo é 180°.',choices:opts(c,[180-a,c+10,c-10,360-a-b],v=>C(v,`${v}°`,small(v)?`${v} graus`:fmt(v))),answer:String(c)}},
 lines:()=>()=>{const k=pick(['paralelas','perpendiculares','concorrentes']);return{text:'Como são estas retas?',hint:'Perpendiculares se cruzam formando um ângulo reto.',visual:lineSVG(k),txtc:1,cols:3,choices:['paralelas','perpendiculares','concorrentes'].map(x=>C(x,cap(x))),answer:k}},
 triClass:()=>()=>{if(Math.random()<.5){const k=pick(['equilátero','isósceles','escaleno']);let s;if(k==='equilátero'){const a=R(3,9);s=[a,a,a]}else if(k==='isósceles'){const a=R(4,9),b=R(2,a+2);s=b===a?[a,a,a-1]:[a,a,b]}else{const a=R(4,9);s=[a,a+1,a+2]}
     return{text:`Um triângulo tem lados de ${s[0]} cm, ${s[1]} cm e ${s[2]} cm. Ele é:`,say:`Um triângulo tem lados de ${s[0]}, ${s[1]} e ${s[2]} centímetros. Como ele se chama?`,txtc:1,cols:3,choices:['equilátero','isósceles','escaleno'].map(x=>C(x,cap(x))),answer:k==='isósceles'&&s[2]===s[0]-1?'isósceles':k}}
   const k=pick(['acutângulo','retângulo','obtusângulo']);const a=k==='retângulo'?90:k==='obtusângulo'?R(100,140):R(50,80),b=R(20,Math.min(85,170-a)),c=180-a-b;if(k==='acutângulo'&&(c>=90))return G.triClass()();
   return{text:`Um triângulo tem ângulos de ${a}°, ${b}° e ${c}°. Ele é:`,say:'Olhe os ângulos do triângulo. Como ele se chama?',txtc:1,cols:3,choices:['acutângulo','retângulo','obtusângulo'].map(x=>C(x,cap(x))),answer:k}},
 quad:()=>()=>{const all=['quadrado','retângulo','losango','paralelogramo','trapézio'];const nm=pick(all);return{text:'Qual é o nome deste quadrilátero?',visual:quadSVG(nm,pick(COLS)),txtc:1,choices:sOpts(nm,shuf(all)).map(c=>Object.assign(c,{html:cap(c.html)})),answer:nm}},
 polyName:()=>()=>{const names={3:'triângulo',4:'quadrilátero',5:'pentágono',6:'hexágono',7:'heptágono',8:'octógono'};const n=R(3,8);return{text:`Quantos lados tem? Qual é o nome deste polígono?`,say:'Conte os lados. Qual é o nome deste polígono?',visual:polySVG(n,pick(COLS)),txtc:1,choices:sOpts(names[n],shuf(Object.values(names))).map(c=>Object.assign(c,{html:cap(c.html)})),answer:names[n]}},
 circleParts:()=>()=>{const all=['raio','diâmetro','centro','circunferência'];const k=pick(all);return{text:'Qual parte do círculo está destacada?',visual:circlePartSVG(k),txtc:1,choices:all.map(x=>C(x,cap(x))),answer:k}},
 symm:()=>()=>{const bank=[['quadrado',4],['retângulo',2],['triângulo',3],['losango',2],['pentágono',5],['hexágono',6]];const [nm,n]=pick(bank);
   return{text:`Quantos eixos de simetria tem este ${nm}?`,hint:'Eixo de simetria divide a figura em duas metades iguais, como um espelho.',visual:nm==='losango'?quadSVG('losango',pick(COLS)):nm==='retângulo'?shapeSVG('retângulo',pick(COLS)):nm==='quadrado'?shapeSVG('quadrado',pick(COLS)):polySVG(SHAPES[nm].s,pick(COLS)),choices:opts(n,[n+1,n-1,n*2,1].filter(x=>x>0)),answer:String(n)}},
 solidCounts:()=>()=>{const bank=[['cubo','faces',6],['cubo','arestas',12],['cubo','vértices',8],['pirâmide','faces',5],['pirâmide','arestas',8],['pirâmide','vértices',5],['prisma','faces',5],['prisma','arestas',9],['prisma','vértices',6]];const [s,w,n]=pick(bank);
   const art={cubo:'um cubo',pirâmide:'uma pirâmide de base quadrada',prisma:'um prisma triangular'}[s];const col=pick(COLS);
   return{text:`${w==='vértices'?'Quantos':'Quantas'} ${w} tem ${art}?`,visual:`<svg viewBox="0 0 100 100" class="fig" aria-hidden="true">${s==='prisma'?PRISM(col):SOLIDS[s](col)}</svg>`,choices:opts(n,[n+1,n-1,n+2,n-2,n*2]),answer:String(n)}},
 /* measurement */
 perim:()=>()=>{const w=R(2,12),h=R(2,9);const sq=Math.random()<.3;const W=sq?h:w;const ans=2*(W+h);
   return{text:`Qual é o perímetro deste ${sq?'quadrado':'retângulo'}?`,hint:'Perímetro é a soma de todos os lados.',visual:rectSVG(W,h),choices:opts(ans,[W*h,W+h,ans+2,ans-2]),answer:String(ans)}},
 areaGrid:()=>()=>{const w=R(2,7),h=R(2,5);return{text:'Quantos quadradinhos cabem na figura? Qual é a área?',say:'Qual é a área da figura em quadradinhos?',visual:gridArea(w,h),choices:opts(w*h,[2*(w+h),w*h+w,w*h-h,w+h]),answer:String(w*h)}},
 areaRect:()=>()=>{const w=R(2,12),h=R(2,9);return{text:'Qual é a área do retângulo?',hint:'Área = base × altura.',visual:rectSVG(w,h),choices:opts(w*h,[2*(w+h),w+h,w*h+w,w*h-h],unitC('cm²','centímetros quadrados')),answer:String(w*h)}},
 areaTri:()=>()=>{const b=R(2,10)*2,h=R(2,10);return{text:'Qual é a área do triângulo?',hint:'Área = base × altura ÷ 2.',visual:triSVG(b,h),choices:opts(b*h/2,[b*h,b+h,b*h/2+b,b*h/4].filter(Number.isInteger),unitC('cm²','centímetros quadrados')),answer:String(b*h/2)}},
 areaPar:()=>()=>{const b=R(3,12),h=R(2,9);return{text:'Qual é a área do paralelogramo?',hint:'Área = base × altura.',visual:parSVG(b,h),choices:opts(b*h,[b*h/2,2*(b+h),b+h,b*h+b].filter(Number.isInteger),unitC('cm²','centímetros quadrados')),answer:String(b*h)}},
 areaMix:()=>()=>pick([G.areaRect(),G.areaTri(),G.areaPar()])(),
 vol:(cube)=>()=>{let l,w,h;if(cube){l=w=h=R(2,6)}else{l=R(2,8);w=R(2,6);h=R(2,6)}const v=l*w*h;
   return{text:cube?'Qual é o volume do cubo?':'Qual é o volume da caixa?',hint:'Volume = comprimento × largura × altura.',visual:boxSVG(l,w,h),choices:opts(v,[l*w,l+w+h,v+l*w,2*(l*w+w*h+l*h)],unitC('cm³','centímetros cúbicos')),answer:String(v)}},
 circle:()=>()=>{const r=R(1,10);const area=Math.random()<.5;const ans=area?Math.round(314*r*r)/100:Math.round(628*r)/100;
   return{text:area?`Qual é a área de um círculo de raio ${r} cm? (use π = 3,14)`:`Qual é o comprimento da circunferência de raio ${r} cm? (use π = 3,14)`,say:area?'Qual é a área do círculo? Use pi igual a três vírgula catorze.':'Qual é o comprimento da circunferência? Use pi igual a três vírgula catorze.',visual:circlePartSVG('raio'),choices:nOpts(ans,area?[Math.round(628*r)/100,Math.round(314*r)/100,Math.round(314*r*r*2)/100]:[Math.round(314*r)/100,Math.round(314*r*r)/100,Math.round(628*r)/100+3.14]),answer:String(ans)}},
 /* coordinates */
 coord:(q,max,mode)=>()=>{const min=q===4?-max:(max<=3?1:0),lo=q===4?-max:1;const em=shuf(['⭐','🍎','🐶','🚗','🎈','🐸','💎','🏠']).slice(0,4);const pts=[];while(pts.length<4){const x=R(lo,max),y=R(lo,max);if(!pts.some(p=>p.x===x&&p.y===y)&&!(q===4&&(x===0||y===0)))pts.push({x,y,e:em[pts.length]})}
   const target=pick(pts);const m=mode==='mix'?pick(['obj','xy']):mode;const P=p=>`(${fI(p.x)}, ${fI(p.y)})`;
   if(m==='obj')return{text:`Que objeto está no ponto ${P(target)}?`,say:'Que objeto está neste ponto?',hint:'Primeiro ande na horizontal, depois na vertical.',visual:coordSVG(min,max,pts),choices:shuf(pts).map(p=>C(p.e,p.e,'este objeto')),answer:target.e};
   const cands=[{x:target.y,y:target.x},{x:target.x+1,y:target.y},{x:target.x,y:target.y-1},{x:-target.x,y:target.y}];
   return{text:`Quais são as coordenadas do ${target.e}?`,say:'Quais são as coordenadas deste objeto?',hint:'Coordenadas: (horizontal, vertical).',visual:coordSVG(min,max,pts),txtc:1,choices:sOpts(P(target),cands.map(P)),answer:P(target)}},
 /* statistics */
 mean:(n)=>()=>{for(let t=0;t<100;t++){const m=R(3,15);const xs=Array.from({length:n-1},()=>R(1,20));const last=m*n-xs.reduce((a,b)=>a+b,0);if(last<1||last>25)continue;xs.push(last);const L=shuf(xs);
     return{text:'Qual é a média destes números?',hint:'Some tudo e divida pela quantidade de números.',visual:`<div class="listnums">${L.map(x=>`<span>${x}</span>`).join('')}</div>`,choices:opts(m,[m+1,m-1,Math.max(...L),Math.round(L.reduce((a,b)=>a+b,0)/(n+1))]),answer:String(m)}}
   return G.mode()()},
 median:()=>()=>{const s=new Set();while(s.size<5)s.add(R(1,40));const L=[...s];const sorted=L.slice().sort((a,b)=>a-b);const ans=sorted[2];
   return{text:'Qual é a mediana destes números?',hint:'Coloque em ordem: a mediana é o número do meio.',visual:`<div class="listnums">${L.map(x=>`<span>${x}</span>`).join('')}</div>`,choices:opts(ans,[L[2],sorted[1],sorted[3],Math.round(L.reduce((a,b)=>a+b,0)/5)]),answer:String(ans)}},
 mode:()=>()=>{const m=R(1,15);const others=[];while(others.length<4){const x=R(1,15);if(x!==m&&others.filter(o=>o===x).length<1)others.push(x)}const L=shuf([m,m,m,...others]);
   return{text:'Qual é a moda destes números?',hint:'Moda é o número que aparece mais vezes.',visual:`<div class="listnums">${L.map(x=>`<span>${x}</span>`).join('')}</div>`,choices:opts(m,shuf(others)),answer:String(m)}},
 mmm:()=>()=>pick([G.mean(4),G.median(),G.mode()])(),
 probF:()=>()=>{const [A,B]=shuf(Object.keys(BALLC));const a=R(1,6),b=R(1,6),n=a+b;
   return{text:`Qual é a probabilidade de tirar uma bolinha ${A}?`,hint:'Probabilidade = casos favoráveis ÷ total de bolinhas.',visual:bag([...Array(a).fill(A),...Array(b).fill(B)]),choices:fOpts([a,n],[[a,b],[b,n],[1,n],[a,n+1]]),answer:fv(a,n)}},
 combos:(k)=>()=>{const a=R(2,5),b=R(2,4),c=k===3?R(2,3):1;const ans=a*b*c;
   const txt=k===3?`Você tem ${a} camisetas, ${b} shorts e ${c} bonés. Quantas combinações diferentes dá para fazer?`:`Você tem ${a} camisetas e ${b} shorts. Quantas combinações diferentes dá para fazer?`;
   return{text:txt,visual:`<div class="row" style="font-size:2rem;flex-direction:column">${'<span>'+'👕'.repeat(a)+'</span><span>'+'🩳'.repeat(b)+'</span>'+(k===3?'<span>'+'🧢'.repeat(c)+'</span>':'')}</div>`,choices:opts(ans,[a+b+(k===3?c:0),ans+1,ans-1,a*b+(k===3?c:0)]),answer:String(ans)}},
 /* pre-school */
 odd:()=>()=>{const [A,B]=shuf(Object.keys(CATS));const main=shuf(CATS[A]).slice(0,3);const odd=pick(CATS[B]);
   return{text:'Qual não combina com os outros?',cols:4,choices:shuf([...main,odd]).map(e=>C(e,e,e===odd?'este':'outro')),answer:odd}},
 sameColor:()=>()=>{const ks=shuf(Object.keys(COLORG));const [t,ans]=shuf(COLORG[ks[0]]).slice(0,2);const others=ks.slice(1).map(k=>pick(COLORG[k]));
   return{text:`Qual tem a mesma cor do ${t}?`,say:'Qual tem a mesma cor?',visual:`<div class="bignum" style="font-size:4.5rem">${t}</div>`,cols:4,choices:shuf([ans,...others]).map(e=>C(e,e,'este')),answer:ans}},
 sameShape:()=>()=>{const names=shuf(['círculo','quadrado','triângulo','retângulo','losango','hexágono']).slice(0,4);const t=names[0];const cs=shuf(COLS);
   return{text:'Qual tem a mesma forma?',visual:shapeSVG(t,cs[0]),choices:shuf(names).map((nm,i)=>C(nm,shapeSVG(nm,cs[i+1],'fig sm'),nm)),answer:t}},
 patShapes:()=>()=>{const names=shuf(['círculo','quadrado','triângulo','losango']);const cs=shuf(COLS);const unit=pick([[0,1],[0,1,2],[0,0,1]]);const seq=Array.from({length:7},(_,i)=>unit[i%unit.length]);const ans=unit[7%unit.length];
   const opts3=[...new Set([...unit,3])];
   return{text:'Qual forma vem depois?',visual:`<div class="pat">${seq.map(i=>shapeSVG(names[i],cs[i],'fig sm')).join('')}<span class="hole">?</span></div>`,cols:opts3.length,choices:shuf(opts3).map(i=>C(names[i],shapeSVG(names[i],cs[i],'fig sm'),names[i])),answer:names[ans]}},
 pos:()=>()=>{const [a,b,c]=shuf(POSI).slice(0,3);const up=Math.random()<.5;const art=x=>x.f?'da':'do';
   return{text:up?`O que está em cima ${art(b)} ${b.n}?`:`O que está embaixo ${art(b)} ${b.n}?`,visual:`<div class="stack"><span>${a.e}</span><span>${b.e}</span><span>${c.e}</span></div>`,cols:3,choices:shuf([a,b,c]).map(x=>C(x.e,x.e,x.n)),answer:up?a.e:c.e}},
 ordinal:()=>()=>{const row=shuf(POSI).slice(0,5);const k=R(0,4);const others=shuf(row.filter((_,i)=>i!==k)).slice(0,3);
   return{text:`Quem é o ${ORD[k]} da fila? A fila começa na bandeira.`,visual:`<div class="pat"><span>🏁</span>${row.map(x=>`<span>${x.e}</span>`).join('')}</div>`,cols:4,choices:shuf([row[k],...others]).map(x=>C(x.e,x.e,x.n)),answer:row[k].e}},
 sizeCmp:()=>()=>{const bank=[['mais pesado','mais leve',[['🐘','🐭'],['🚚','🚲'],['🍉','🍒'],['🐋','🐟']]],['mais alto','mais baixo',[['🦒','🐢'],['🌳','🌷'],['🏢','🏠']]],['mais comprido','mais curto',[['🐍','🐛'],['🚂','🚗']]]];const [big,smallW,pairs]=pick(bank);const [x,y]=pick(pairs);const askBig=Math.random()<.5;
   return{text:`Qual é ${askBig?big:smallW}?`,cols:2,choices:shuf([x,y]).map(e=>C(e,`<span style="font-size:3.2rem">${e}</span>`,'este')),answer:askBig?x:y}},
 hotCold:()=>()=>{const hot=['☀️','🔥','☕','🌋'],cold=['❄️','🧊','⛄','🍦'];const askHot=Math.random()<.5;const a=pick(hot),b=pick(cold);
   return{text:`Qual é ${askHot?'quente':'frio'}?`,cols:2,choices:shuf([a,b]).map(e=>C(e,`<span style="font-size:3.2rem">${e}</span>`,'este')),answer:askHot?a:b}}
};
