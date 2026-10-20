/* ================= Bonus games (open in any grade) ================= */
// tint per tens row of the 1–100 table, so each "dezena" has its own color
const ROWTINT=['#FFE3EA','#FFE9D6','#FFF3C9','#DDF5E6','#D4F3EF','#DCE8FF','#E9E0FF','#FCE0F0','#E6EDF7','#F4E6D8'];
const rowOf=n=>Math.floor((n-1)/10);
function tableSlice(n,mode){
  // three rows of the 1–100 table around n; "first" mode only shows the first number of each row
  const r=rowOf(n),r0=Math.max(0,Math.min(7,r-1));let h='';
  for(let row=r0;row<r0+3;row++)for(let c=1;c<=10;c++){const v=row*10+c;const hide=v===n;const show=!hide&&(mode==='full'||c===1||Math.abs(v-n)===1&&mode==='near');
    h+=`<span class="tcell${hide?' q':''}" style="background:${ROWTINT[row]}">${hide?'?':show?v:''}</span>`}
  return `<div class="tslice">${h}</div>`;
}
const BONUS=[
 {id:'bn100',name:'Números de 1 a 100',icon:'💯',color:'var(--pink)',acts:[
  {name:'Explorar a tabela',kind:'explore',hint:'Toque e ouça'},
  {name:'Antes e depois',kind:'quiz',hint:'Antecessor e sucessor',gen:()=>{const n=R(2,99),before=Math.random()<.5,ans=before?n-1:n+1;
    return{text:`Qual número vem ${before?'antes':'depois'} do ${n}?`,hint:before?'Antes = um a menos.':'Depois = um a mais.',visual:`<div class="seq">${before?'<span class="sq hole">?</span>':''}<span class="sq">${n}</span>${before?'':'<span class="sq hole">?</span>'}</div>`,choices:numChoices(ans,{min:1,max:100,offs:[-1,1,2,-2,10,-10]}),answer:String(ans)}}},
  {name:'Vizinhos',kind:'quiz',hint:'Quem mora ao lado?',gen:()=>{const n=R(2,99),ans=`${n-1} e ${n+1}`;
    const cands=[`${n-2} e ${n+2}`,`${n-10} e ${n+10}`,`${n} e ${n+1}`,`${n+1} e ${n+2}`,`${n-2} e ${n-1}`].filter(s=>s.split(' e ').every(x=>+x>=1&&+x<=100));
    return{text:`Quais são os vizinhos do ${n}?`,hint:'Um vem antes, o outro vem depois.',visual:`<div class="seq"><span class="sq hole">?</span><span class="sq">${n}</span><span class="sq hole">?</span></div>`,txtc:1,choices:sOpts(ans,shuf(cands)),answer:ans}}},
  {name:'Número escondido',kind:'quiz',hint:'Ache pela posição',gen:()=>{const n=R(1,100),mode=pick(['full','near','first']);
    return{text:'Que número está escondido na tabela?',hint:mode==='first'?'Cada fileira começa num número terminado em 1.':'Olhe os vizinhos e a fileira de cima.',visual:tableSlice(n,mode),choices:numChoices(n,{min:1,max:100,offs:[-1,1,-10,10,9,11]}),answer:String(n)}}},
  {name:'Ditado',kind:'quiz',hint:'Ouça e toque',gen:()=>{const n=R(1,100);
    return{text:`Toque no número ${n}`,grid:1,cols:10,choices:Array.from({length:100},(_,i)=>C(i+1,String(i+1))),answer:String(n)}}},
  {name:'Em ordem!',kind:'seq',hint:'Toque em sequência'}
 ]},
 {id:'bntab',name:'Tabuada',icon:'✖️',color:'var(--teal)',tab:1,acts:[
  {name:'Ver a tabuada',kind:'tabex',hint:'Toque e ouça'},
  {name:'Grupos',kind:'quiz',hint:'Conte os grupinhos',gen:()=>{const n=tabN(),g=R(2,5),t=pick(THINGS);
    return{text:`São ${g} grupos com ${n} em cada. ${qnt(t)} ${t.n} ao todo?`,hint:`Some ${g} vezes o número ${n}.`,visual:`<div class="groups">${Array.from({length:g},()=>`<div class="grp" style="--k:${n<=3?n:n===4?2:n<=6?3:n<=8?4:5}">${`<span>${t.e}</span>`.repeat(n)}</div>`).join('')}</div>${eq(`${g} × ${n} = ?`)}`,choices:numChoices(g*n,{min:1,offs:[-n,n,-1,1,2*n]}),answer:String(g*n)}}},
  {name:`Pulando`,kind:'quiz',hint:'De tanto em tanto',gen:()=>{const n=tabN(),k0=R(1,6),m=R(1,4),terms=Array.from({length:5},(_,i)=>(k0+i)*n);
    return{text:`Pule de ${n} em ${n}. Qual número falta?`,say:`${terms.map((t,i)=>i===m?'quanto':t).join('; ')}. Qual número falta?`,hint:`Cada número é ${n} a mais que o anterior.`,visual:`<div class="seq">${terms.map((t,i)=>i===m?'<span class="sq hole">?</span>':`<span class="sq">${t}</span>`).join('')}</div>`,choices:numChoices(terms[m],{min:1,max:100,offs:[-n,n,-1,1,10,-10]}),answer:String(terms[m])}}},
  {name:'Quanto é?',kind:'quiz',hint:'Responda a conta',gen:()=>{const n=tabN(),k=R(1,10);const q=arith(n,'×',k,n*k);q.hint=k===1?'Vezes 1 fica o mesmo número.':k===10?'Vezes 10 é só colocar um zero no fim.':`Lembre da tabuada do ${n}. Some ${k} vezes o número ${n}.`;q.choices=numChoices(n*k,{min:0,max:100,offs:[-n,n,-k,k,1,-1]});return q}},
  {name:'Qual falta?',kind:'quiz',hint:'Descubra o número',gen:()=>{const n=tabN(),k=R(1,10),p=n*k;
    return{text:`${n} vezes qual número é ${p}?`,say:`${n} vezes quanto é igual a ${p}?`,hint:`Conte de ${n} em ${n} até chegar no ${p}. Quantos pulos?`,visual:eq(`${n} × ? = ${p}`),choices:numChoices(k,{min:1,max:10,offs:[-1,1,2,-2]}),answer:String(k)}}},
  {name:'Em ordem!',kind:'seq',hint:'Toque em sequência'}
 ]}
];
// chosen multiplication table (0 = mixed, a new one for every question)
const TAB={n:0};
const tabN=()=>TAB.n||R(2,10);
const tabSay=(n,k)=>`${n} vezes ${k} é igual a ${n*k}.`;
const bkey=(b,ai)=>`1:${b.id}${ai}`;
const BONUS_SAY=['Toque em um número para ouvir.','Toque nos números em ordem, do menor para o maior!','Escolha uma tabuada e toque numa conta para ouvir.','Pule de tanto em tanto: toque nos números da tabuada em ordem!'];
