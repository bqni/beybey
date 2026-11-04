/* ===== Page « Choisir une toupie » : collection + catalogue dans une seule liste ===== */
let PK=null;
const pkNorm=x=>String(x||'').toLowerCase();
function pkOpen(p,s,edit){
  PK={p,s,q:'',t:null};
  const c=st.m.p[p][s];
  if(edit&&c&&c.mode!=='none'){ const t=JSON.parse(JSON.stringify(c));
    if(t.mode==='stock'){ if(t.src==='cat'){ const x=CAT[t.cg]; if(x){ t.cb=x.e+'|'+x.b; t.cr=x.r||''; t.ci=x.bi||''; t._b=[t.cb,t.cr,t.ci]; } } else { const x=T[t.stock]; if(x){ t.blade=t.stock; t.ratchet=x.r?t.stock:-1; t.bit=t.stock; t._b=[t.blade,t.ratchet,t.bit]; } } }
    PK.t=t; }
  let f=document.getElementById('fm'); if(!f){ f=document.createElement('div'); f.id='fm'; document.body.appendChild(f); }
  fmShown(f); pkDraw();
}
function pkDraw(){
  const f=document.getElementById('fm'); if(!f||!PK) return;
  const who=esc(st.m.names[PK.p]||'')+(st.m.mode==='tournoi'?' · '+LT('Toupie')+' '+(PK.s+1):'');
  if(PK.t){ f.innerHTML=pkStep2(who); return; }
  f.innerHTML=`<div class="fwrap pkw"><div class="fh"><h2>Choisir une toupie</h2><button class="chip sq" onclick="pkClose()" aria-label="Fermer">✕</button></div>
    <div class="mut pkwho">${who}</div>
    <label class="search pks">${IC.search}<input id="pk_q" type="search" placeholder="Chercher…" value="${esc(PK.q)}" oninput="pkQ(this.value)" autocomplete="off"></label>
    <div id="pk_l">${pkList()}</div></div>`;
  const q=document.getElementById('pk_q'); if(q&&!PK.q) setTimeout(()=>{ try{ q.focus({preventScroll:true}); }catch(e){} },60);
}
function pkQ(v){ PK.q=v; const l=document.getElementById('pk_l'); if(l) l.innerHTML=pkList(); }
function pkOk(txt,q){ const w=pkNorm(q).split(/\s+/).filter(Boolean), h=pkNorm(txt); return w.every(x=>h.includes(x)); }
function pkRow(kind,i,name,im,ty,w,tag){ return `<button class="pkr" onclick="pkPick('${kind}',${i})">${img(im,'sm')}<span class="pkn"><b>${esc(name)}</b><small>${typ(ty)}${w?' <i>'+w+' g</i>':''}</small></span>${tag?`<em>${esc(tag)}</em>`:''}</button>`; }
function pkList(){
  const q=PK.q.trim(), own=T.map((x,i)=>({x,i})).filter(o=>!q||pkOk(o.x.n+' '+o.x.nom+' '+o.x.b+' '+(o.x.r||'')+' '+o.x.bt,q));
  let h=own.length?`<div class="fs">${LT('Ma collection')}</div>`+own.map(o=>pkRow('own',o.i,o.x.nom||o.x.n,(PH[o.x.n]||{}).blade,o.x.t,o.x.tot,'')).join(''):'';
  if(CAT.length){
    if(!q) h+=`<div class="fs">${LT('Catalogue')}</div><div class="mut note">${LT('Tape un nom pour chercher dans le catalogue.')}</div>`;
    else{
      const ed=x=>x.e==='tt'?'Takara Tomy':'Hasbro', m=CAT.map((x,i)=>({x,i})).filter(o=>pkOk(o.x.n+' '+o.x.b+' '+(o.x.r||'')+' '+o.x.bi,q));
      h+=`<div class="fs">${LT('Catalogue')}</div>`+(m.length?m.slice(0,40).map(o=>{ if(o.x.ib) IM[o.x.ib]=o.x.ib; return pkRow('cat',o.i,o.x.n,o.x.ib,o.x.t,Math.round(((+o.x.wb||0)+(+o.x.wr||0)+(+o.x.wbt||0))*10)/10,ed(o.x)); }).join('')+(m.length>40?`<div class="mut note">${LT('Affine ta recherche pour voir les autres.')}</div>`:''):`<div class="mut note">${LT('Rien dans le catalogue.')}</div>`);
    }
  }
  return h||`<div class="mut note">${LT('Rien trouvé.')}</div>`;
}
function pkPick(kind,i){
  if(kind==='own'){ const x=T[i]; PK.t={mode:'stock',src:'own',stock:i,blade:i,ratchet:x.r?i:-1,bit:i,cg:-1,cb:'',cr:'',ci:'',_b:[i,x.r?i:-1,i]}; }
  else{ const x=CAT[i]; PK.t={mode:x.bi?'stock':'custom',src:'cat',stock:0,blade:0,ratchet:-1,bit:0,cg:i,cb:x.e+'|'+x.b,cr:x.r||'',ci:x.bi||''}; if(x.bi) PK.t._b=[x.e+'|'+x.b,x.r||'',x.bi]; }
  pkDraw();
}
function pkPartSel(k,v){ const t=PK.t; if(!t) return; if(t.src==='cat'){ t[['cb','cr','ci'][k]]=v; } else { t[['blade','ratchet','bit'][k]]=+v; } t.mode='custom'; pkDraw(); }
function pkChanged(t){ const b=t._b; if(!b) return true; const cur=t.src==='cat'?[t.cb,t.cr,t.ci]:[t.blade,t.ratchet,t.bit]; return cur.some((v,k)=>v!==b[k]); }
function ppItems(k){
  const t=PK.t, ed=x=>x.e==='tt'?'Takara Tomy':'Hasbro', out=[];
  if(t.src==='cat'){ const P=cptBuild();
    if(k===0) Object.values(P.B).sort(cpSort).forEach(x=>out.push({v:x.k,n:x.n,img:x.im,ty:x.bt,w:x.w,tag:ed(x)}));
    if(k===1){ out.push({v:'',n:LT('Aucun')}); Object.values(P.R).sort(cpSort).forEach(x=>out.push({v:x.n,n:x.n,img:x.im,w:x.w})); }
    if(k===2) Object.values(P.I).sort(cpSort).forEach(x=>out.push({v:x.n,n:x.n,img:x.im,w:x.w}));
    return {out,cur:[t.cb,t.cr,t.ci][k]}; }
  const seen={}, add=(v,n,img,ty,w)=>{ if(seen[n]) return; seen[n]=1; out.push({v,n,img,ty,w}); };
  const cur=[t.blade,t.ratchet,t.bit][k], cn=cur>=0&&T[cur]?[T[cur].b,T[cur].r,T[cur].bt][k]:null;
  if(k===1) out.push({v:-1,n:LT('Aucun')});
  T.forEach((x,i)=>{ const P=PH[x.n]||{}; if(k===0) add(i,x.b,P.blade,x.bty,x.wb); else if(k===1&&x.r) add(i,x.r,P.ratchet,'',x.wr); else if(k===2) add(i,x.bt,P.bit,x.t,x.wbt); });
  out.forEach(o=>{ if(o.img&&!IM[o.img]) IM[o.img]=o.img; });
  return {out,cur,cn};
}
function ppOpen(k){ PP={k,q:''}; ppDraw(); }
function ppDraw(){ const f=document.getElementById('fm'); if(!f||!PK||!PP) return; const nm=[LT('Blade'),LT('Ratchet'),LT('Bit')][PP.k];
  f.innerHTML=`<div class="fwrap pkw"><div class="fh"><h2>${nm}</h2><button class="chip sq" onclick="ppClose()" aria-label="Fermer">✕</button></div>
    <label class="search pks">${IC.search}<input id="pp_q" type="search" placeholder="${LT('Chercher…')}" value="${esc(PP.q)}" oninput="ppQ(this.value)" autocomplete="off"></label>
    <div id="pp_l">${ppList()}</div></div>`;
  const e=document.getElementById('pp_q'); if(e&&!PP.q) setTimeout(()=>{ try{ e.focus({preventScroll:true}); }catch(x){} },60); }
function ppQ(v){ PP.q=v; const l=document.getElementById('pp_l'); if(l) l.innerHTML=ppList(); }
function ppClose(){ PP=null; pkDraw(); }
function ppList(){
  const {out,cur,cn}=ppItems(PP.k), q=PP.q.trim(), t=PK.t;
  const h=out.map((o,i)=>[o,i]).filter(x=>!q||pkOk(x[0].n,q)||x[0].v===-1&&false).map(([o,i])=>{ const on=t.src==='cat'?o.v===cur:(o.v===-1?cur===-1:o.n===cn);
    return `<button class="pkr${on?' cur':''}" onclick="ppPick(${i})">${img(o.img,'sm')}<span class="pkn"><b>${esc(o.n)}</b><small>${o.ty?typ(o.ty):''}${o.w?' <i>'+o.w+' g</i>':''}</small></span>${o.tag?`<em>${esc(o.tag)}</em>`:''}</button>`; }).join('');
  return h||`<div class="mut note">${LT('Rien trouvé.')}</div>`;
}
function ppPick(i){ if(!PK||!PP) return; const o=ppItems(PP.k).out[i]; if(!o) return; const k=PP.k; PP=null; pkPartSel(k,o.v); }
var PP=null;
function pkStep2(who){
  const t=PK.t, cat=t.src==='cat';
  const pic=(im)=>{ if(im&&!IM[im]) IM[im]=im; return im; };
  let parts;
  if(cat){ const P=cptBuild(), b=P.B[t.cb], rr=P.R[t.cr], ii=P.I[t.ci];
    parts=[[b&&b.n||LT('Choisir…'),b&&b.im,b&&b.w],[rr?rr.n:LT('Aucun'),rr&&rr.im,rr&&rr.w],[ii&&ii.n||LT('Choisir…'),ii&&ii.im,ii&&ii.w]]; }
  else{ const B=T[t.blade], R=t.ratchet>=0?T[t.ratchet]:null, I=T[t.bit], P=CAT.length?cptBuild():null;
    const fb=(k,n)=>{ if(!P||!n) return ''; if(k==='b'){ const x=P.B[(B&&B.ed||'hasbro')+'|'+n]||Object.values(P.B).find(y=>y.n===n); return x&&x.im||''; } const x=(k==='r'?P.R:P.I)[n]; return x&&x.im||''; };
    parts=[[B?B.b:'',B&&((PH[B.n]||{}).blade||fb('b',B.b)),B&&B.wb],[R?R.r:LT('Aucun'),R&&((PH[R.n]||{}).ratchet||fb('r',R.r)),R&&R.wr],[I?I.bt:'',I&&((PH[I.n]||{}).bit||fb('i',I.bt)),I&&I.wbt]]; }
  const labs=['Blade','Ratchet','Bit'];
  const sel=`<div class="g3 pkpics">${parts.map((x,k)=>`<div class="bslot"><span class="sl">${labs[k]}</span><button class="bsb" onclick="ppOpen(${k})" aria-label="${labs[k]} : ${esc(x[0])}">${img(pic(x[1]),'sm')}<b>${esc(x[0])}</b><i>${x[2]?x[2]+' g':'&nbsp;'}</i></button></div>`).join('')}</div>`+(cat?`<div class="mut note">${LT("Catalogue : rien n'est ajouté à ta collection.")}</div>`:'');
  const r=resolve(t), ok=cat?(t.mode==='stock'||!!(t.cb&&t.ci)):true;
  return `<div class="fwrap pkw"><div class="fh"><h2>Choisir une toupie</h2><button class="chip sq" onclick="pkClose()" aria-label="Fermer">✕</button></div>
    <div class="mut pkwho">${who}</div>
    <div class="prv pkprv">${img(r.img,'sm')}<div class="grow"><b>${esc(r.name)}</b><div class="mut prm">${typ(r.ty)}<span>${r.w?r.w+' g':''}</span></div></div></div>
    <div class="fhelp">${LT('Touche une pièce pour la changer.')}</div>${sel}
    <div class="fact"><button class="go sm" onclick="pkSave()" ${ok?'':'disabled'}>${LT('Choisir cette toupie')}</button><button class="chip" onclick="pkBack()">${LT('Retour')}</button></div></div>`;
}
function pkBack(){ if(PK){ PK.t=null; pkDraw(); } }
function pkSave(){
  if(!PK||!PK.t) return; const t=JSON.parse(JSON.stringify(PK.t));
  if(t.src==='cat'&&t.mode==='custom'&&!(t.cb&&t.ci)) return;
  t.mode=(t._b&&!pkChanged(t))?'stock':'custom';
  delete t._b; st.m.p[PK.p][PK.s]=t; pkClose(); drawMatch();
}
function pkClose(){ PK=null; PP=null; const f=document.getElementById('fm'); if(f){ f.classList.remove('show'); f.innerHTML=''; } document.documentElement.style.overflow=''; }
function matchUI(){
  const M=st.m;
  if(M.mode==='bracket') return '<div class="top">'+'<div class="frame f3">'+[['simple','Simple'],['tournoi','3v3'],['bracket','Tournoi<small>bientôt</small>']].map(([k,l])=>`<button class="${M.mode===k?'on':''}" ${k==='bracket'?'disabled':''} onclick="mSet('mode','${k}')"><span>${l}</span></button>`).join('')+'</div></div>'
    +'<div class="pcard soon"><div class="sl">Tournoi</div><b>Arrive bientôt</b><div class="mut">Un tableau à élimination directe : tu ajoutes les joueurs, chacun enregistre ses toupies, et c\'est parti.</div></div>';
  const n=M.mode==='tournoi'?3:1;
  const modes='<div class="frame f3">'+[['simple','Simple'],['tournoi','3v3'],['bracket','Tournoi<small>bientôt</small>']].map(([k,l])=>`<button class="${M.mode===k?'on':''}" ${k==='bracket'?'disabled':''} onclick="mSet('mode','${k}')"><span>${l}</span></button>`).join('')+'</div>';
  const rules=`<div class="rules"><label>Premier à<select onchange="mSet('target',+this.value)">${opt([3,4,5,7,10].map(v=>[v,v+' points']),M.target)}</select></label><label>Série<select onchange="mSet('bo',+this.value)">${opt([[1,'Match unique'],[3,'BO3'],[5,'BO5'],[7,'BO7']],M.bo||1)}</select></label></div>`;
  const note=M.mode==='tournoi'?'<div class="mut note">3 toupies par joueur, une par round, chacune une seule fois. Fin après 3 rounds ou au score.</div>':'';
  const players=[0,1].map(p=>`<div class="pcard p${p}" style="--pc:${PCOL[p]}"><input class="nm" value="${esc(M.names[p])}" oninput="mName(${p},this.value)" aria-label="Nom du joueur ${p+1}">${p===0?'<div class="menote" id="meNote">'+meNoteHTML()+'</div>':'<div class="menote" id="fnote1">'+frChip(1)+'</div>'}${Array.from({length:n},(_,s)=>slotUI(p,s)).join('')}<div class="pqr"><button class="chip" onclick="scOpen(${p})">Scanner</button><button class="chip" onclick="qrSlots(${p})">Partager</button></div></div>`).join('');
  return '<div class="top">'+modes+rules+'</div>'+note+'<div class="pls">'+players+'</div>'+(slotsOk()?'':`<div class="mut note nsl">Ajoute une toupie à chaque emplacement pour lancer le match.</div>`)+`<div class="act"><button class="go" onclick="startMatch()" ${slotsOk()?'':'disabled'}>Lancer le match</button></div>`+histUI(M.mode);
}

const fmt=ms=>{const t=Math.floor(ms/100),s=Math.floor(t/10);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')+'.'+(t%10);};
const cur=p=>resolve(G.M.p[p][G.cur[p]]);
const setOv=h=>{document.getElementById('ov').innerHTML=h;};
const xbtn='<button class="x" onclick="askQuit()" aria-label="Quitter">✕</button>';
function stopTimer(){ clearInterval(tmr); tmr=null; }
function startTimer(){ stopTimer(); tmr=setInterval(()=>{const e=document.getElementById('tm'); if(e&&G) e.textContent=fmt(Date.now()-G.t0);},100); }

function slotsOk(){ const n=st.m.mode==='tournoi'?3:1; return [0,1].every(p=>[...Array(n).keys()].every(k=>st.m.p[p][k]&&st.m.p[p][k].mode!=='none')); }
function startMatch(){
  if(!slotsOk()) return;
  try{ ctx(); }catch(e){}
  const M=JSON.parse(JSON.stringify(st.m)),tour=M.mode==='tournoi';
  stopTimer(); run++;
  G={M,tour,bo:M.bo||1,wins:[0,0],mn:1,cw:-1,sw:-1,round:1,score:[0,0],hist:[],used:[[],[]],cur:[0,0],pick:[null,null],t:0,t0:0,
     max:tour?Math.min(3,M.rounds||3):M.rounds,phase:tour?'pick':'ready',ready:[false,false]};
  document.getElementById('ov').classList.add('show'); arena(); goLandscape();
}
function goLandscape(){
  try{
    const d=document.documentElement, f=d.requestFullscreen||d.webkitRequestFullscreen;
    const lock=()=>{ try{ screen.orientation.lock('landscape').catch(()=>{}); }catch(e){} };
    if(f){ const p=f.call(d); if(p&&p.then) p.then(lock).catch(lock); else lock(); } else lock();
  }catch(e){}
}
function leaveLandscape(){
  try{ screen.orientation.unlock(); }catch(e){}
  try{ if(document.fullscreenElement) document.exitFullscreen(); }catch(e){}
}
let QT=0;
function askQuit(){
  if(!G||G.phase==='pick'||G.phase==='over'||Date.now()-QT<3500){ QT=0; stopMatch(); return; }
  QT=Date.now(); const b=document.querySelector('#ov button.x'); if(!b) return;
  const t=LT('Quitter ?'); b.classList.add('ask'); b.textContent=t;
  setTimeout(()=>{ if(Date.now()-QT>=3400){ QT=0; if(b.isConnected){ b.classList.remove('ask'); b.textContent='✕'; } } },3500);
}
function stopMatch(){ leaveLandscape(); run++; stopTimer(); try{ speechSynthesis.cancel(); }catch(e){} document.getElementById('ov').classList.remove('show'); G=null; if(st.tab==='match') draw(); }
function pickSlot(p,s){ G.pick[p]=s; arena(); }
function confirmPick(){ G.cur=[G.pick[0],G.pick[1]]; G.ready=[false,false]; G.phase='ready'; arena(); }

function pickUI(){
  const imgp=r=>img(r.img,'sm');
  const col=p=>`<div class="pk s${p} p${p}" style="--pc:${PCOL[p]}"><div class="pnm">${esc(G.M.names[p])}</div>`+[0,1,2].map(s=>{
    const r=resolve(G.M.p[p][s]),u=G.used[p].includes(s);
    return `<button class="pks ${G.pick[p]===s?'on':''}" ${u?'disabled':''} onclick="pickSlot(${p},${s})">${imgp(r)}<span><b>${esc(r.blade)}</b><small>${u?'Déjà utilisée':esc(r.name)}</small></span></button>`;
  }).join('')+'</div>';
  const ok=G.pick[0]!==null&&G.pick[1]!==null;
  setOv(`<div class="arena pickv"><div class="ahd">${xbtn}<span>Round ${G.round}</span><span></span></div><div class="mid mut">Chaque joueur choisit sa toupie pour ce round</div>${col(0)}${col(1)}<div class="foot"><button class="go" ${ok?'':'disabled'} onclick="confirmPick()">Valider</button></div></div>`);
}
const FIN=[['Spin',1],['Over',2],['Burst',2],['Xtreme',3]];
const FL=k=>k?k+' Finish':'';
function side(p){
  const r=cur(p),on=G.phase==='fight',rd=G.phase==='ready';
  const ctl=rd?`<button class="rdy ${G.ready[p]?'on':''}" onclick="setReady(${p})">Prêt<i>${G.ready[p]?' ✓':''}</i></button>`
    :`<div class="pts">${FIN.map(([k,n])=>`<button ${on?'':'disabled'} onclick="score(${p},${n},'${k}')"><span>${FL(k)}</span><b>+${n}</b></button>`).join('')}</div>`;
  return `<div class="side s${p} p${p}" style="--pc:${PCOL[p]}"><div class="si"><div class="pnm">${esc(G.M.names[p])}</div>${img(r.img)}<div class="bn">${esc(r.blade)}</div><div class="bs">${r.name===r.blade?'':esc(r.name)}</div><div class="sc">${G.score[p]}</div></div>${ctl}</div>`;
}
const SND={};
function loadSnd(){ ['p1','p2','sc','nul','next','cd'].forEach(k=>{ try{ const a=new Audio('sons/'+(k==='cd'&&LANG!=='fr'?'cd_en':k)+'.mp3'); a.preload='auto'; SND[k]=a; }catch(e){} }); }
function playSnd(k){ if(!st.son||!SND[k]) return; try{ SND[k].currentTime=0; const r=SND[k].play(); if(r&&r.catch) r.catch(()=>{}); }catch(e){} }
loadSnd();
function setReady(p){
  if(!G||G.phase!=='ready') return;
  G.ready[p]=!G.ready[p]; if(G.ready[p]) playSnd(p?'p2':'p1'); else beep(400,.1,.15); buzz(30); arena();
  if(G.ready[0]&&G.ready[1]) setTimeout(()=>{ if(G&&G.phase==='ready'&&G.ready[0]&&G.ready[1]) launch(); },350);
}
function winText(){
  const [a,b]=G.score,t=G.M.target,n=G.M.names;
  const w=a>=t?0:b>=t?1:a>b?0:b>a?1:-1;
  if(G.bo>1&&G.phase==='over'&&G.sw>=0) return `${esc(n[G.sw])} remporte la série ${G.wins[G.sw]} à ${G.wins[1-G.sw]}`;
  return w<0?`Égalité ${a} à ${b}`:`${esc(n[w])} gagne ${a} à ${b}`;
}
/* ===== Mini-scène : les deux toupies ===== */
const ST={mode:'',tops:[],fx:[],rings:[],bolts:[],frags:[],fin:null,fid:-1,xh:[],nA:-Math.PI/2,flash:0,shake:0,loop:0,last:0,col:["#39ff8c","#ff2d95"],R:.145};
let stId=0;
const rnd=(a,b)=>a+Math.random()*(b-a);
/* comportement selon le type et le poids de la toupie */
const PF={
 'Attack':{k:1.6,sw:1.2,vmin:1.3,vmax:2.3,seek:1.4,rad:0,mass:.95,w:32,dec:1.9,n:3,a0:-.7,a1:.15},
 'Déf':{k:3.4,sw:.5,vmin:.45,vmax:1,seek:0,rad:0,mass:1.35,w:20,dec:1.4,n:6,a0:-.33,a1:.33},
 'Stamina':{k:1.4,sw:1.1,vmin:.7,vmax:1.15,seek:0,rad:.5,mass:.9,w:24,dec:.8,n:2,a0:-.95,a1:.95},
 'Balance':{k:2.2,sw:.9,vmin:.9,vmax:1.7,seek:.4,rad:0,mass:1,w:26,dec:1.5,n:3,a0:-.55,a1:.38}
};
function stProf(p){ let r=null; try{ r=G?cur(p):(ST.hp&&ST.hp[p]); }catch(e){}
  const b=PF[(r&&r.ty)||'Balance']||PF.Balance, wt=Math.min(1.25,Math.max(.8,((r&&+r.w)||38)/38));
  const XA={'Attack':3.2,'Déf':1.6,'Stamina':2.4,'Balance':2.4};
  return Object.assign({},b,{mass:b.mass*wt,rs:.92+(b.mass*wt-1)*.3,xa:XA[(r&&r.ty)||'Balance']||2.4}); }
function stTop(p,x,y,vx,vy,w){const pf=stProf(p);return{p,pf,rs:pf.rs,m:pf.mass,x,y,vx,vy,ang:rnd(0,6.28),w:(w?pf.w*w/26:pf.w)*(p?-1:1),w0:w?pf.w*w/26:pf.w,s:1,al:1,fall:0,wob:rnd(0,6),hid:false,free:false,big:false};}
function stInit(m){
  ST.mode=m;ST.fin=null;ST.fid=-1;ST.xh=[];ST.fx=[];ST.rings=[];ST.bolts=[];ST.frags=[];ST.flash=0;ST.shake=0;
  ST.tops=m==='idle'?[stTop(0,-.6,.05,0,0,8),stTop(1,.6,-.05,0,0,8)]:[stTop(0,-.5,.25,1.1,-.5,26),stTop(1,.5,-.25,-1.1,.5,26)];
  ST.tops.forEach(t=>{ if(m!=='idle'){const k=t.pf.vmin/.9; t.vx*=k; t.vy*=k;} });
}
function stSpark(x,y,n,sp,cols){for(let i=0;i<n;i++){const a=rnd(0,6.28),v=rnd(.3,1)*sp;ST.fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rnd(.25,.6),max:.6,c:cols?cols[i%cols.length]:'#fff'});}}
function stRing(x,y,c,max,sz){ST.rings.push({x,y,t:0,max:max||.5,c,sz:sz||1});}
function stBolt(x,y,a){const pts=[[x,y]];let px=x,py=y;for(let i=0;i<6;i++){px+=Math.cos(a+rnd(-.7,.7))*.16;py+=Math.sin(a+rnd(-.7,.7))*.16;pts.push([px,py]);}ST.bolts.push({pts,life:.35});}
const XZ={a:Math.PI/2,xh:.5,oc:.72,oh:.2};
function stGap(th){ let d=Math.abs(Math.atan2(Math.sin(th-XZ.a),Math.cos(th-XZ.a))); return false; }
function stRailR(th){ const d=Math.abs(Math.atan2(Math.sin(th-ST.nA),Math.cos(th-ST.nA))); const v=d<.24?1:d<.36?(.36-d)/.12:0; return .93-.25*v; }
function stRelease(t,sp,inward,tang,notch){
  const a=t.rl.a,dir=t.rl.dir,nx=Math.cos(a),ny=Math.sin(a),tx=-ny*dir,ty=nx*dir;
  t.vx=tx*sp*tang-nx*sp*inward; t.vy=ty*sp*tang-ny*sp*inward; t.rl=null; t.xc=2.2; t.bt=notch?1:.6;
  ST.xh.push({a,life:notch?.7:.4,c:ST.rail,n:notch}); stSpark(t.x,t.y,notch?16:7,notch?2:1.2,[ST.rail,'#fff',ST.col[t.p]]); ST.flash=Math.max(ST.flash,notch?.3:.12);
}
function stRide(t,dt){
  const rl=t.rl,R=ST.R*t.rs;
  rl.t+=dt; rl.w=Math.min(rl.w+rl.acc*dt,5.2); rl.a+=rl.dir*rl.w*dt;
  const rad=stRailR(rl.a)-R; t.x=Math.cos(rl.a)*rad; t.y=Math.sin(rl.a)*rad;
  rl.sp=(rl.sp||0)-dt; if(rl.sp<0){ rl.sp=.07; ST.xh.push({a:rl.a,life:.25,c:ST.rail,n:false}); stSpark(t.x,t.y,2,.5,[ST.rail,'#fff']); }
  const da=Math.atan2(Math.sin(rl.a-ST.nA),Math.cos(rl.a-ST.nA));
  if(rl.t>.3&&Math.abs(da)<.22){ stRelease(t,rl.w*(1-R),1.0,.45,true); }
  else if(rl.t>rl.dur){ stRelease(t,rl.w*(1-R),.55,.8,false); }
  else { t.vx=0; t.vy=0; }
}
function stMove(t,dt){
  if(t.rl&&!t.calm){ stRide(t,dt); return; }
  const calm=t.calm,pf=t.pf,R=ST.R*t.rs;
  if(calm){ t.vx-=(t.x-(t.tx||0))*3*dt; t.vy-=(t.y-(t.ty||0))*3*dt; const f=Math.exp(-dt*1.6);t.vx*=f;t.vy*=f; }
  else{
    const d0=Math.hypot(t.x,t.y)||.001,dir=t.p?-1:1;
    t.vx-=t.x*pf.k*dt; t.vy-=t.y*pf.k*dt;
    /* bol évasé : une pente continue du rail jusqu'au centre, de plus en plus creuse vers le milieu */
    { const sm=Math.min(1,d0/.3), F=-(1.5*sm+2.2*Math.exp(-(d0/.2)*(d0/.2))*d0/.2); t.vx+=t.x/d0*F*dt; t.vy+=t.y/d0*F*dt; }
    t.vx+=-t.y*pf.sw*dt*dir; t.vy+=t.x*pf.sw*dt*dir;
    if(pf.rad){ const e=(pf.rad-d0)*3*dt; t.vx+=t.x/d0*e; t.vy+=t.y/d0*e; }
    if(pf.seek){ const o=ST.tops[1-t.p]; if(o&&!o.hid&&!o.free){ const dx=o.x-t.x,dy=o.y-t.y,dd=Math.hypot(dx,dy)||1; t.vx+=dx/dd*pf.seek*dt; t.vy+=dy/dd*pf.seek*dt; } }
    t.nt=(t.nt===undefined?rnd(.3,.9):t.nt)-dt; t.bt=Math.max(0,(t.bt||0)-dt);
    if(t.nt<0){ t.nt=rnd(.45,1.2);
      if(pf.rad) pf.rad=rnd(.3,.75);
      const o=ST.tops[1-t.p],lunge=Math.random()<(pf.seek>1?.5:pf.rad?.3:.22);
      if(lunge&&o&&!o.hid&&!o.free){ const dx=o.x-t.x,dy=o.y-t.y,dd=Math.hypot(dx,dy)||1,pw=1.3+Math.random()*.9; t.vx+=dx/dd*pw; t.vy+=dy/dd*pw; t.bt=.5; stSpark(t.x,t.y,5,.7,[ST.col[t.p]]); }
      else { const an=rnd(0,6.28),pw=.5+Math.random()*.8; t.vx+=Math.cos(an)*pw; t.vy+=Math.sin(an)*pw; } }
    const sp=Math.hypot(t.vx,t.vy),vmax=pf.vmax*(t.bt>0?1.9:1);
    if(sp<pf.vmin){const k=sp>.01?pf.vmin/sp:1;t.vx*=k;t.vy*=k;if(sp<=.01)t.vx=pf.vmin;} else if(sp>vmax){t.vx*=vmax/sp;t.vy*=vmax/sp;}
  }
  t.x+=t.vx*dt; t.y+=t.vy*dt;
  const d=Math.hypot(t.x,t.y),lim=stRailR(Math.atan2(t.y,t.x))-R;
  if(d>lim){const nx=t.x/d,ny=t.y/d,dp=t.vx*nx+t.vy*ny; t.x=nx*lim;t.y=ny*lim;
    if(!calm&&(t.xc||0)<=0){
      /* le bit crânté s'accroche aux crans de la X-line : il roule le long du rail en accélérant */
      const an=Math.atan2(t.y,t.x),dir=(-t.vy*nx+t.vx*ny)>=0?1:-1,ts=Math.abs(-t.vy*nx+t.vx*ny);
      t.rl={a:an,dir,w:Math.max(1.6,ts/lim+.9),acc:pf.xa*(.8+Math.random()*.5),dur:.45+Math.random()*.55,t:0,sp:0}; t.vx=0;t.vy=0;
      stSpark(t.x,t.y,5,.9,[ST.rail,'#fff']);
    } else if(dp>0){ t.vx-=1.3*dp*nx; t.vy-=1.3*dp*ny; } }
  t.xc=Math.max(0,(t.xc||0)-dt);
}
function stCollide(){
  const [a,b]=ST.tops; if(a.hid||b.hid||a.free||b.free) return false;
  const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),m=ST.R*(a.rs+b.rs);
  if(d>=m||d<.001) return false;
  const nx=dx/d,ny=dy/d,rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
  if(rel<0){a.rl=null;b.rl=null;const j=-2*rel/(1/a.m+1/b.m);a.vx-=j/a.m*nx;a.vy-=j/a.m*ny;b.vx+=j/b.m*nx;b.vy+=j/b.m*ny;
    const pw=-rel,now=performance.now();
    if(pw>.4&&now-(ST.cd||0)>260){ ST.cd=now; const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
      stSpark(mx,my,Math.round(3+pw*4),.8+pw*.6,[ST.col[0],ST.col[1],'#fff']);
      if(pw>1.5&&Math.random()<.45) stRing(mx,my,[ST.col[0],ST.col[1],'#fff'][Math.floor(Math.random()*3)],.25+Math.random()*.15,.35+Math.random()*.3);
      ST.flash=Math.max(ST.flash,Math.min(.35,pw*.12)); }}
  const o=(m-d),ia=1/a.m,ib=1/b.m,sm=ia+ib; a.x-=nx*o*ia/sm;a.y-=ny*o*ia/sm;b.x+=nx*o*ib/sm;b.y+=ny*o*ib/sm; return true;
}
function stFinish(h){
  const a=ST.tops[0],b=ST.tops[1],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
  [a,b].forEach(t=>{t.calm=false;t.rl=null;});
  a.vx=dx/d*1.9;a.vy=dy/d*1.9;b.vx=-dx/d*1.9;b.vy=-dy/d*1.9;
  ST.fin={t:0,k:h.p<0?'nul':h.k,W:h.p<0?-1:h.p,L:h.p<0?-1:1-h.p,hit:false,ti:0};ST.mode='fin';
}
function stImpact(f){
  f.hit=true; const T=ST.tops,a=T[0],b=T[1];
  const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,k=f.k;
  const L=f.L>=0?T[f.L]:null,W=f.W>=0?T[f.W]:null;
  let nx=0,ny=0; if(L&&W){const d=Math.hypot(L.x-W.x,L.y-W.y)||1;nx=(L.x-W.x)/d;ny=(L.y-W.y)/d;}
  stSpark(mx,my,22,2.2,[ST.col[0],ST.col[1],'#fff']); stRing(mx,my,'#fff',.45); ST.flash=.9;
  const rt=L&&W?Math.min(1.7,Math.max(.6,Math.sqrt(W.m/L.m))):1; /* le plus lourd éjecte plus fort */
  if(k==='Spin'){ L.tx=nx*.4;L.ty=ny*.4;W.tx=-nx*.4;W.ty=-ny*.4; L.vx=nx*.5;L.vy=ny*.5;W.vx=-nx*.5;W.vy=-ny*.5;L.calm=true;L.dec=true;W.calm=true; }
  else if(k==='nul'){ const d=Math.hypot(b.x-a.x,b.y-a.y)||1,ux=(b.x-a.x)/d,uy=(b.y-a.y)/d; a.vx=-ux*.7;a.vy=-uy*.7;b.vx=ux*.7;b.vy=uy*.7;a.tx=-ux*.4;a.ty=-uy*.4;b.tx=ux*.4;b.ty=uy*.4; a.calm=b.calm=true;a.dec=b.dec=true; }
  else if(k==='Over'){ const aL=Math.atan2(L.y,L.x),a1=XZ.a-XZ.oc,a2=XZ.a+XZ.oc,df=(u,v)=>Math.abs(Math.atan2(Math.sin(u-v),Math.cos(u-v))),ang=df(aL,a1)<df(aL,a2)?a1:a2; f.zone=ang===a1?'o1':'o2';
    const ex=Math.cos(ang)*1.4-L.x,ey=Math.sin(ang)*1.4-L.y,el=Math.hypot(ex,ey)||1,ux=.65*ex/el+.35*nx,uy=.65*ey/el+.35*ny,ul=Math.hypot(ux,uy)||1; nx=ux/ul;ny=uy/ul;
    L.free=true;L.vx=nx*3.4*rt;L.vy=ny*3.4*rt;W.vx=-nx*.5;W.vy=-ny*.5;W.calm=true;ST.shake=.25; }
  else if(k==='Burst'){ L.hid=true; ST.shake=.4; stRing(L.x,L.y,ST.col[L.p],.7);
    for(let i=0;i<7;i++){const an=i/7*6.28+rnd(-.2,.2),v=rnd(1.2,2.6);ST.frags.push({x:L.x,y:L.y,vx:Math.cos(an)*v,vy:Math.sin(an)*v,rot:rnd(0,6),vr:rnd(-14,14),sz:rnd(.07,.14),p:L.p,ring:i%3===0});}
    W.vx=-nx*.6;W.vy=-ny*.6;W.calm=true; }
  else if(k==='Xtreme'){ f.zone='x'; { const ex=Math.cos(XZ.a)*1.3-L.x,ey=Math.sin(XZ.a)*1.3-L.y,el=Math.hypot(ex,ey)||1,ux=.65*ex/el+.35*nx,uy=.65*ey/el+.35*ny,ul=Math.hypot(ux,uy)||1; nx=ux/ul;ny=uy/ul; }
    L.free=true;L.big=true;L.vx=nx*5.4*rt;L.vy=ny*5.4*rt;W.vx=-nx*.8;W.vy=-ny*.8;W.calm=true;W.w*=1.35;ST.shake=.7;ST.flash=1;
    stRing(mx,my,ST.col[W.p],.8);stRing(mx,my,'#fff',.6); for(let i=0;i<6;i++) stBolt(mx,my,i/6*6.28+rnd(-.3,.3)); }
}
function stStep(dt){
  const T=ST.tops;
  if(ST.mode==='idle'){T.forEach(t=>{t.ang+=t.w*dt;t.y+=Math.sin(performance.now()/500+t.p*3)*.0015;});}
  else{
    const f=ST.fin;
    if(f){ f.t+=dt;
      if(!f.hit){ T.forEach(t=>{t.x+=t.vx*dt;t.y+=t.vy*dt;});
        if(Math.hypot(T[1].x-T[0].x,T[1].y-T[0].y)<ST.R*(T[0].rs+T[1].rs)*1.03||f.t>.9) stImpact(f);
      } else { f.ti+=dt; }
    }
    T.forEach((t,i)=>{
      t.ang+=t.w*dt;
      if(f&&!f.hit) return;
      if(t.free){ t.x+=t.vx*dt;t.y+=t.vy*dt;const f2=Math.exp(-dt*.25);t.vx*=f2;t.vy*=f2;
        const d=Math.hypot(t.x,t.y);
        if(t.big) t.s=1+.7*Math.sin(Math.min(1,f.ti*2.2)*3.14)+(d>1?-.25*Math.min(1,(d-1)/.8):0); else t.s=1-.45*Math.min(1,Math.max(0,(d-1)/.7));
        if(d>1.25) t.al=Math.max(0,t.al-dt*1.1);
      }
      else if(t.hid){}
      else if(t.dec){ t.w*=Math.exp(-dt*(t.pf.dec||1.5)); stMove(t,dt);
        if(Math.abs(t.w)<5){t.fall=Math.min(1,t.fall+dt*1.2);} if(t.fall>=1)t.w*=.9; t.wob+=dt*(8+6*t.fall); }
      else stMove(t,dt);
    });
    if(!f||!f.hit) stCollide();
    else if(f.k==='Xtreme') T.forEach(t=>{if(!t.free&&!t.hid)t.glow=1;});
    ST.frags.forEach(g=>{g.x+=g.vx*dt;g.y+=g.vy*dt;const fr=Math.exp(-dt*1.7);g.vx*=fr;g.vy*=fr;g.rot+=g.vr*dt;g.vr*=Math.exp(-dt*1.1);
      const d=Math.hypot(g.x,g.y);if(d>1.3){g.vx-=g.x/d*3*dt;g.vy-=g.y/d*3*dt;}});
  }
  ST.fx=ST.fx.filter(s=>(s.life-=dt)>0);ST.fx.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.vx*=.94;s.vy*=.94;});
  ST.rings=ST.rings.filter(r=>(r.t+=dt)<r.max);
  ST.bolts=ST.bolts.filter(b=>(b.life-=dt)>0); ST.xh=ST.xh.filter(h=>(h.life-=dt)>0);
  ST.flash*=Math.exp(-dt*4.5);ST.shake*=Math.exp(-dt*3.5);
}
function stDrawTop(c,t,sc){
  if(t.hid||t.al<=0) return;
  const r=ST.R*sc*t.s*t.rs,col=ST.col[t.p],sp=Math.min(1,Math.abs(t.w)/t.w0);
  c.save();c.translate(t.x*sc,t.y*sc);c.globalAlpha=t.al*(1-.4*t.fall);
  c.fillStyle='rgba(0,0,0,.5)';c.beginPath();c.ellipse(r*.18*t.s,r*.3*t.s,r*1.02,r*.9,0,0,7);c.fill();
  if(t.dec){const amp=(1-sp)*(1-t.fall)*r*.35;c.translate(Math.cos(t.wob)*amp,Math.sin(t.wob*1.3)*amp);}
  if(t.fall){c.rotate(t.wob*0+.5);c.scale(1,1-.32*t.fall);c.rotate(-.5);}
  c.shadowColor=col;c.shadowBlur=(t.glow?18:6+9*sp)*(ST.dpr||1)*(1-.8*t.fall);
  c.fillStyle='#070b0c';c.beginPath();c.arc(0,0,r,0,7);c.fill();
  c.shadowBlur=0;
  c.rotate(t.ang);
  if(sp>.6){c.globalAlpha*=.22;c.fillStyle=col;c.beginPath();c.arc(0,0,r,0,7);c.fill();c.globalAlpha=t.al*(1-.4*t.fall);}
  c.fillStyle=col;
  const nb=t.pf.n;for(let i=0;i<nb;i++){c.save();c.rotate(i*6.2832/nb);c.globalAlpha*=.85;c.beginPath();c.moveTo(r*.18,0);c.arc(0,0,r*.98,t.pf.a0,t.pf.a1);c.lineTo(r*.18,0);c.closePath();c.fill();c.restore();}
  c.strokeStyle=col;c.lineWidth=Math.max(1.5,r*.1);c.beginPath();c.arc(0,0,r*.99,0,7);c.stroke();
  c.fillStyle='#e8fff2';c.beginPath();c.arc(0,0,r*.22,0,7);c.fill();
  c.fillStyle='#070b0c';c.beginPath();c.arc(0,0,r*.09,0,7);c.fill();
  c.restore();
}
function stDraw(cv){
  const dpr=Math.min(2,window.devicePixelRatio||1),s=cv.clientWidth; if(!s) return;
  ST.dpr=dpr; if(cv.width!==Math.round(s*dpr)){cv.width=cv.height=Math.round(s*dpr);}
  const cs=getComputedStyle(cv);ST.rail=cs.getPropertyValue('--stg-rail').trim()||'#39ff88';ST.col=[cs.getPropertyValue('--pa').trim()||'#39ff8c',cs.getPropertyValue('--pink').trim()||'#ff2d95'];
  const c=cv.getContext('2d'),W=cv.width,sc=W/2*.6,kk=Math.min(1,Math.max(.5,sc/dpr/110)); /* kk : traits et lueurs plus fins quand l'arène est petite */
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,W);
  c.translate(W/2+rnd(-1,1)*ST.shake*W*.03,W/2+rnd(-1,1)*ST.shake*W*.03);
  { const rg0=cs.getPropertyValue('--stg-ring').trim()||'#aebcc2',x=sc*1.25,y0=-sc*1.2,y1=sc*1.5,k=sc*.3;
    const poly=(d)=>{ c.beginPath();c.moveTo(-x+k+d,y0+d);c.lineTo(x-k-d,y0+d);c.lineTo(x-d,y0+k+d);c.lineTo(x-d,y1-k-d);c.lineTo(x-k-d,y1-d);c.lineTo(-x+k+d,y1-d);c.lineTo(-x+d,y1-k-d);c.lineTo(-x+d,y0+k+d);c.closePath(); };
    c.save();poly(0);c.fillStyle='rgba(120,140,150,.10)';c.fill();c.strokeStyle=rg0;c.globalAlpha=.4;c.lineWidth=1.6*dpr;c.stroke();
    c.save();poly(0);c.clip();c.globalAlpha=1;c.fillStyle='rgba(0,0,0,.22)';c.fillRect(-x,sc*.62,2*x,y1);c.restore();
    c.globalAlpha=.18;c.lineWidth=dpr;poly(sc*.07);c.stroke();
    c.globalAlpha=.7;c.fillStyle='#02060a';c.strokeStyle=rg0;c.lineWidth=dpr;
    [[-.95,-.72],[.95,-.72],[-Math.sin(.55)*1.27,Math.cos(.55)*1.27],[Math.sin(.55)*1.27,Math.cos(.55)*1.27]].forEach(([px,py])=>{ c.beginPath();c.rect(px*sc-sc*.045,py*sc-sc*.045,sc*.09,sc*.09);c.fill();c.stroke(); });
    c.restore(); }
  const g=c.createRadialGradient(0,0,0,0,0,sc);g.addColorStop(0,(cs.getPropertyValue('--stg-a').trim()||'#10191c'));g.addColorStop(1,(cs.getPropertyValue('--stg-b').trim()||'#050809'));
  c.fillStyle=g;c.beginPath();c.arc(0,0,sc,0,7);c.fill();
  
  const rg=cs.getPropertyValue('--stg-ring').trim()||'#aebcc2';c.shadowColor=rg;c.shadowBlur=6*dpr*kk;c.strokeStyle=rg;c.lineWidth=2.6*dpr*kk;c.beginPath();c.arc(0,0,sc,0,7);c.stroke();c.shadowBlur=0;
  { /* stade BX-10 : 3 sorties du même côté (2 Over dans les coins, 1 Xtreme au centre) + Tornado Ridge au centre */
    const ring=cs.getPropertyValue('--stg-ring').trim()||'#aebcc2', f=ST.fin&&ST.fin.hit?ST.fin:null, pul=.5+.5*Math.sin(performance.now()/240);
    c.save();
    const bowl=c.createRadialGradient(0,0,sc*.15,0,0,sc*.93);bowl.addColorStop(0,'rgba(255,255,255,0)');bowl.addColorStop(.7,'rgba(255,255,255,.035)');bowl.addColorStop(1,'rgba(255,255,255,.10)');
    c.fillStyle=bowl;c.beginPath();c.arc(0,0,sc*.93,0,7);c.fill();
    c.strokeStyle=ring;
    c.globalAlpha=1;
    { const g2=c.createRadialGradient(0,0,0,0,0,sc*.93);g2.addColorStop(0,'rgba(0,0,0,.6)');g2.addColorStop(.35,'rgba(0,0,0,.3)');g2.addColorStop(.75,'rgba(0,0,0,.08)');g2.addColorStop(1,'rgba(255,255,255,.12)');c.fillStyle=g2;c.beginPath();c.arc(0,0,sc*.93,0,7);c.fill();
      c.strokeStyle='rgba(255,255,255,.2)';c.lineWidth=dpr;c.beginPath();c.arc(0,0,sc*.28,0,7);c.stroke(); }
    const glow=(hot,col)=>{c.lineWidth=2*dpr;c.strokeStyle=hot?'#fff':col;c.shadowColor=col;c.shadowBlur=(hot?16:5)*dpr;c.globalAlpha=hot?.65+.35*pul:.9;};
    const label=(txt,x,y,fs,hot,col)=>{ if(!hot) return; c.save();c.globalAlpha=hot?1:.85;c.fillStyle=hot?'#fff':col;c.font=`800 ${Math.round(sc*fs)}px system-ui,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(txt,x,y);c.restore();};
    /* Over : deux poches dans les coins avant, hors du cercle */
    [['o1',XZ.a-XZ.oc],['o2',XZ.a+XZ.oc]].forEach(([id,a])=>{
      const hot=f&&f.zone===id; c.save();c.translate(Math.cos(a)*sc*1.4,Math.sin(a)*sc*1.4);c.rotate(a);
      const L=sc*.22,Wd=sc*.17,r=sc*.07;
      c.beginPath();c.moveTo(-L+r,-Wd);c.lineTo(L-r,-Wd);c.arcTo(L,-Wd,L,-Wd+r,r);c.lineTo(L,Wd-r);c.arcTo(L,Wd,L-r,Wd,r);c.lineTo(-L+r,Wd);c.arcTo(-L,Wd,-L,Wd-r,r);c.lineTo(-L,-Wd+r);c.arcTo(-L,-Wd,-L+r,-Wd,r);c.closePath();
      c.fillStyle=hot?'rgba(255,255,255,.5)':'#000';c.fill();glow(hot,ring);c.stroke();c.restore();
      label('OVER',Math.cos(a)*sc*1.4,Math.sin(a)*sc*1.4,.085,hot,ring); });
    /* Xtreme : fente en arc juste sous le cercle, au centre avant */
    { const hot=f&&f.zone==='x',h=XZ.xh,r0=sc*1.08,r1=sc*1.37; c.save();c.rotate(XZ.a);
      { const P=(r,a)=>[Math.cos(a)*r,Math.sin(a)*r], e=sc*.06, d=e/r1*1.4, q=(p,r,a)=>c.quadraticCurveTo(p[0],p[1],...P(r,a));
        c.beginPath(); c.moveTo(...P(r1,-h+d)); c.arc(0,0,r1,-h+d,h-d);
        q(P(r1,h),r1-e,h); c.lineTo(...P(r0+e,h));
        q(P(r0,h),r0,h-d*1.3); c.arc(0,0,r0,h-d*1.3,-h+d*1.3,true);
        q(P(r0,-h),r0+e,-h); c.lineTo(...P(r1-e,-h));
        q(P(r1,-h),r1,-h+d); c.closePath(); }
      c.fillStyle=hot?'rgba(255,255,255,.5)':'#000';c.fill();glow(hot,'#ff5a4f');c.stroke();c.restore();
      label('XTREME',0,sc*1.225,.1,hot,'#ff5a4f'); }
    c.restore(); }
  c.save();c.strokeStyle=ST.col[0];c.globalAlpha=.0;c.restore();
  { const gr=ST.rail;
    const rr=th=>sc*stRailR(th);
    c.save(); c.lineJoin='round';
    c.strokeStyle=gr; c.shadowColor=gr; c.shadowBlur=7*dpr*kk; c.lineWidth=3.4*dpr*kk; c.globalAlpha=.95;
    c.beginPath(); { let pen=false; for(let th=0;th<=6.2832+.001;th+=.03){ if(stGap(th)){pen=false;continue;} const r=rr(th); pen?c.lineTo(Math.cos(th)*r,Math.sin(th)*r):c.moveTo(Math.cos(th)*r,Math.sin(th)*r); pen=true; } } c.stroke();
    c.shadowBlur=0; c.globalAlpha=.85; c.strokeStyle=gr; c.lineWidth=dpr*1.2*kk;
    for(let th=0;th<6.2832;th+=.11){ if(stGap(th)) continue; const r=rr(th),r2=r-sc*.055; c.beginPath(); c.moveTo(Math.cos(th)*r,Math.sin(th)*r); c.lineTo(Math.cos(th)*r2,Math.sin(th)*r2); c.stroke(); }
    c.shadowBlur=0;
    ST.xh.forEach(h=>{ c.globalAlpha=Math.min(1,h.life*3); c.strokeStyle='#fff'; c.shadowColor=gr; c.shadowBlur=10*dpr; c.lineWidth=2.2*dpr; c.beginPath(); for(let th=h.a-.35;th<=h.a+.35;th+=.03){ const r=rr(th); th>h.a-.35?c.lineTo(Math.cos(th)*r,Math.sin(th)*r):c.moveTo(Math.cos(th)*r,Math.sin(th)*r); } c.stroke(); });
    c.restore(); }
  if(ST.flash>.02){const fg=c.createRadialGradient(0,0,0,0,0,sc);fg.addColorStop(0,`rgba(255,255,255,${ST.flash*.45})`);fg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=fg;c.beginPath();c.arc(0,0,sc,0,7);c.fill();}
  ST.rings.forEach(r=>{const k=r.t/r.max;c.globalAlpha=1-k;c.strokeStyle=r.c;c.lineWidth=3*dpr*(1-k)+1;c.beginPath();c.arc(r.x*sc,r.y*sc,(.08+k*.9*(r.sz||1))*sc,0,7);c.stroke();});c.globalAlpha=1;
  ST.frags.forEach(g=>{const col=ST.col[g.p],z=g.sz*sc;c.save();c.translate(g.x*sc,g.y*sc);c.rotate(g.rot);c.globalAlpha=.9;c.fillStyle=col;c.strokeStyle=col;c.shadowColor=col;c.shadowBlur=5*dpr;
    if(g.ring){c.lineWidth=z*.5;c.beginPath();c.arc(0,0,z,0,2.2);c.stroke();}else{c.beginPath();c.moveTo(0,0);c.arc(0,0,z*1.6,-.5,.45);c.closePath();c.fill();}c.restore();});
  const T=ST.tops,order=[...T].sort((a,b)=>(b.free?1:0)-(a.free?1:0)); order.forEach(t=>stDrawTop(c,t,sc));
  ST.bolts.forEach(b=>{c.globalAlpha=Math.min(1,b.life*4);c.strokeStyle='#fff';c.shadowColor='#fff';c.shadowBlur=6*dpr;c.lineWidth=1.5*dpr;c.beginPath();b.pts.forEach((p,i)=>i?c.lineTo(p[0]*sc,p[1]*sc):c.moveTo(p[0]*sc,p[1]*sc));c.stroke();});c.globalAlpha=1;c.shadowBlur=0;
  ST.fx.forEach(s=>{c.globalAlpha=Math.max(0,s.life/s.max);c.fillStyle=s.c;c.fillRect(s.x*sc-1.5,s.y*sc-1.5,3*dpr/1.5,3*dpr/1.5);});c.globalAlpha=1;
}
function stLoop(id){
  if(id!==ST.loop) return;
  const cv=document.getElementById('stg')||document.getElementById('hstg'); if(!cv){ST.loop=0;return;}
  const now=performance.now(),dt=Math.min(.033,(now-ST.last)/1000||.016);ST.last=now;
  stStep(dt);stDraw(cv);requestAnimationFrame(()=>stLoop(id));
}
function mountStage(){
  const cv=document.getElementById('stg'); if(!cv||!G){ST.loop=0;return;}
  const ph=G.phase;
  if(ph==='ready'){ if(ST.mode!=='idle') stInit('idle'); }
  else if(ph==='fight'){ if(ST.mode!=='battle') stInit('battle'); }
  else if(ph==='scored'||ph==='over'){
    const h=G.hist[G.hist.length-1];
    if(h&&ST.fid!==G.hist.length){ if(ST.mode!=='battle'&&ST.mode!=='fin') stInit('battle'); if(ST.mode==='fin') stInit('battle'); ST.fid=G.hist.length; stFinish(h); }
  }
  stDraw(cv);
  if(!ST.loop){ST.loop=++stId;ST.last=performance.now();requestAnimationFrame(()=>stLoop(ST.loop));}
}
function arena(){
  if(!G) return;
  if(G.phase==='pick') return pickUI();
  const h=G.hist[G.hist.length-1];
  const last=h?(h.p>=0?`${esc(G.M.names[h.p])} +${h.pts}${h.k?' · '+FL(h.k):''}`:'Round nul'):'';
  const mid={
    ready:`<canvas id="stg"></canvas><div class="mut">Quand vous êtes prêts, appuyez chacun sur <b>Prêt</b> : le 3, 2, 1 part tout seul</div>`,
    fight:`<div class="tm" id="tm">${fmt(Date.now()-G.t0)}</div><canvas id="stg"></canvas><button class="chip" onclick="nul()">Round nul</button>`,
    scored:`<div class="tm">${fmt(G.t)}</div><canvas id="stg"></canvas><div class="bn2">${last}</div><div class="row2"><button class="chip" onclick="undo()">Annuler</button><button class="go sm" onclick="nextRound()">Round suivant</button></div>`,
    over:`<div class="win">${winText()}</div>${G.bo>1?`<div class="bn2">${esc(G.M.names[0])} ${G.wins[0]} – ${G.wins[1]} ${esc(G.M.names[1])}</div>`:''}<canvas id="stg"></canvas><div class="row2"><button class="chip" onclick="undo()">Annuler</button><button class="chip" onclick="stopMatch()">Fermer</button><button class="chip" onclick="rsShow()">Partager</button>${G.bo>1&&G.sw<0?'<button class="go sm" onclick="nextMatch()">Match suivant</button>':'<button class="go sm" onclick="startMatch()">Rejouer</button>'}</div>`
  }[G.phase];
  setOv(`<div class="arena"><div class="ahd">${xbtn}<span>${G.bo>1?'BO'+G.bo+' · '+G.wins[0]+'–'+G.wins[1]+' · Match '+G.mn+' · ':''}Round ${G.round}${G.max?' sur '+G.max:''}</span><span>Premier à ${G.M.target}</span></div><div class="mid">${mid}</div>${side(0)}${side(1)}</div>`);
  mountStage();
}
const cdc=p=>{ const r=cur(p); return `<div class="cdc p${p}" style="--pc:${PCOL[p]}"><div class="cdp"><div class="pnm">${esc(G.M.names[p])}</div>${img(r.img)}</div><div class="cdn"><div class="bn">${esc(r.blade)}</div><div class="bs">${r.name===r.blade?'':esc(r.name)}</div></div></div>`; };
async function launch(){
  if(!G||G.phase!=='ready') return;
  const id=++run; G.phase='count';
  if(G.tour) G.cur.forEach((s,p)=>{ if(!G.used[p].includes(s)) G.used[p].push(s); });
  setOv('<div class="cd" id="cd" onclick="cancelCount()"><div class="rays"></div><div class="flash"></div><div class="cdw">'+cdc(0)+'<div class="ringw"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="rd" cx="50" cy="50" r="49.5"/><circle class="rt" cx="50" cy="50" r="46"/><circle class="rg" id="rg" cx="50" cy="50" r="46" pathLength="100"/></svg><div id="big"></div></div><div class="cdvs">VS</div>'+cdc(1)+'</div><div class="lines"><i></i><i></i></div></div>');
  const big=document.getElementById('big'), cd=document.getElementById('cd'), rg=document.getElementById('rg');
  const words=LANG==='fr'?['','un','deux','trois']:['','one','two','three'],SL=LANG==='fr'?'fr-FR':'en-US';
  const show=n=>{ big.className=''; big.textContent=n; cd.classList.remove('fl'); void cd.offsetWidth; cd.classList.add('fl'); buzz(60); };
  const hyper=()=>{ big.className='txt'; big.textContent=LANG==='fr'?'Hyper vitesse':'Let it rip!'; cd.classList.remove('fl'); void cd.offsetWidth; cd.classList.add('hv'); buzz([200,60,200]); };
  if(st.son&&SND.cd){
    /* le son dit « 3, 2, 1, Hyper vitesse » : les flashs suivent les mots (temps en secondes) */
    const T=LANG==='fr'?[[3,.1],[2,1.1],[1,1.9]]:[[3,.1],[2,1.2],[1,2.0]],HV=LANG==='fr'?2.7:3.3,END=4.4;
    try{ SND.cd.currentTime=0; const r=SND.cd.play(); if(r&&r.catch) r.catch(()=>{}); }catch(e){}
    const t0=performance.now(), at=async s=>{ const d=s*1000-(performance.now()-t0); if(d>0) await wait(d); };
    for(const [n,s] of T){ await at(s); if(id!==run) return; show(n); }
    await at(HV); if(id!==run) return; hyper();
    await at(END);
  }else{
    for(const n of [3,2,1]){
      if(id!==run) return;
      show(n); beep(660,.25); say(words[n],SL);
      await wait(1000);
    }
    if(id!==run) return;
    hyper(); beep(1100,.8,.4); say(LT('Hyper vitesse'),SL);
    await wait(900);
  }
  if(id!==run||!G) return;
  G.phase='fight'; G.t0=Date.now(); arena(); startTimer();
}
function cancelCount(){
  if(!G||G.phase!=='count') return;
  run++; try{ speechSynthesis.cancel(); }catch(e){} try{ SND.cd.pause(); }catch(e){}
  if(G.tour) G.cur.forEach((s,p)=>{ const i=G.used[p].lastIndexOf(s); if(i>=0) G.used[p].splice(i,1); });
  G.ready=[false,false]; G.phase='ready'; arena();
}
