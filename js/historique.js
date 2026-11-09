/* ===== Historique des matchs (par catégorie, gardé sur l'appareil) ===== */
const HKEY='arene_hist';
function hLoad(){ try{ const a=JSON.parse(localStorage.getItem(HKEY)||'[]'); if(!Array.isArray(a)) return []; const L=a.map(hClean).filter(Boolean), seen=new Set(); L.forEach((r,i)=>{ if(r.id<1e12||seen.has(r.id)){ r.id=1e9-1-i; r.oid=r.oid===undefined?undefined:r.oid; } seen.add(r.id); }); return L; }catch(e){ return []; } }
function hSave(a){ try{ localStorage.setItem(HKEY,JSON.stringify(a.slice(0,300))); }catch(e){} }
const isMe=n=>{ const k=nz(n); return !!k&&(k===nz(PRF.n)||(PRF.al||[]).includes(k)); };
function histFlip(r){ // remet un match dans mon point de vue (moi en premier) : noms, scores, toupies, résultat
  const f=a=>Array.isArray(a)?[a[1],a[0]]:a; r.n=f(r.n); r.s=f(r.s); r.b=f(r.b); if(r.pc) r.pc=f(r.pc);
  r.ids=[PRF.id,(r.ids&&r.ids[0])||'']; r.w=r.w<0?-1:1-r.w; r.me=1; return r; }
function histAdd(){
  try{
    const names=[0,1].map(p=>(G.tour?G.used[p]:[G.cur[p]]).map(sl=>resolve(G.M.p[p][sl]).name));
    const pcs=[0,1].map(p=>(G.tour?G.used[p]:[G.cur[p]]).map(sl=>resolve(G.M.p[p][sl]).pc.filter(Boolean).join(' · ')));
    const rec={id:Date.now(),pc:pcs,cat:G.tour?'tournoi':'simple',n:[G.M.names[0],G.M.names[1]],b:names,s:[G.score[0],G.score[1]],tg:G.M.target,bo:G.bo>1?G.bo:0,mn:G.mn,r:G.hist.length,me:G.M.me?1:0,ids:[G.M.me?PRF.id:((G.M.ids&&G.M.ids[0])||''),(G.M.ids&&G.M.ids[1])||''],w:G.score[0]>G.score[1]?0:G.score[1]>G.score[0]?1:-1};
    if(!rec.me&&isMe(rec.n[1])&&isMe(rec.n[0])===false) histFlip(rec);
    const a=hLoad(); a.unshift(rec); hSave(a); G.hid=rec.id;
  }catch(e){}
}
function histDel(id){ hSave(hLoad().filter(r=>r.id!==id)); }
function histClear(cat){ if(confirm(LT(cat==='all'?'Vider tout l\'historique ?':'Vider l\'historique de cette catégorie ?'))){ hSave(cat==='all'?[]:hLoad().filter(r=>r.cat!==cat)); fmClose(); drawMatch(); } }
function histRows(L){
  const when=id=>{ if(id<1e12) return LT('Date inconnue'); const d=new Date(id); return d.toLocaleDateString(LOC,{day:'numeric',month:'short'})+' · '+d.toLocaleTimeString(LOC,{hour:'2-digit',minute:'2-digit'}); };
  return L.map(r=>{
    const w=r.w,nm=i=>`<span class="hn ${w===i?'hw':''}" style="color:${i?'var(--pink)':'var(--pa)'}">${esc(r.n[i])}</span>`;
    return `<div class="hr"><div class="hd mut">${when(r.id)} · ${r.r} round${r.r>1?'s':''} · à ${r.tg}${r.bo?' · BO'+r.bo+' · M'+r.mn:''}</div><div class="hm">${nm(0)}<b class="hsc">${r.s[0]} – ${r.s[1]}</b>${nm(1)}</div>${r.pc?`<div class="hs mut hpc"><div style="color:var(--pa)">${r.pc[0].map(esc).join(' | ')}</div><div style="color:var(--pink)">${r.pc[1].map(esc).join(' | ')}</div></div>`:`<div class="hs mut">${r.b[0].map(esc).join(' · ')} <i>vs</i> ${r.b[1].map(esc).join(' · ')}</div>`}${w<0?'<div class="mut">Égalité</div>':''}</div>`;
  }).join('');
}
function histUI(cat){
  const L=hLoad().filter(r=>r.cat===cat),title=cat==='tournoi'?'Match 3v3':'Match simple';
  return `<div class="pcard hist"><div class="hh"><div class="sl">Historique · ${title}</div><button class="chip" onclick="histAll('${cat}')">${L.length>5?LT('Tout voir')+' ('+L.length+')':LT('Ouvrir')}</button></div>${L.length?`<div class="mut">${L.length} match${L.length>1?'s':''} terminé${L.length>1?'s':''}</div>${histRows(L.slice(0,5))}`:'<div class="mut">Aucun match pour l\'instant. Termine un match pour le retrouver ici.</div>'}</div>`;
}
function histAll(cat){
  const L=hLoad().filter(r=>cat==='all'||r.cat===cat),S=pfStats(L),pct=S.n?Math.round(100*S.w/S.n)+'%':'—';
  const c=(v,l)=>`<div class="pfc"><b>${v}</b><span>${l}</span></div>`;
  shOpen(`<div class="fwrap hall"><div class="fh"><h2>Historique</h2><span class="bhb"><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></span></div>
    <div class="frame f3 hseg">${[['all','Global'],['simple','Match simple'],['tournoi','Match 3v3']].map(([k,l])=>`<button class="${k===cat?'on':''}" onclick="histAll('${k}')"><span>${LT(l)}</span></button>`).join('')}</div>
    <div class="pfg">${c(L.length,'Matchs')}${c(S.w,'Victoires')}${c(S.l,'Défaites')}${c(pct,'Réussite')}</div>
    ${S.top?`<div class="mtop"><span class="mut">${LT('Toupie la plus jouée ici :')}</span> <b>${esc(S.top)}</b> <small>×${S.topn}</small></div>`:''}
    <div class="mut note">${PRF.n?LT('Les stats comptent seulement tes matchs (pas ceux joués en invité).'):LT('Entre ton nom dans Profil pour compter tes stats.')}</div>
    <div class="hscroll">${histRows(L)}</div><div class="hbar"><button class="chip hclr" onclick="scOpen(0)">${LT('Scanner')}</button>${L.length?`<button class="chip hclr" onclick="rsShow()">Partager la session</button><button class="chip dng hclr" onclick="histClear('${cat}')">Vider</button>`:''}</div></div>`);
}
function serieEnd(){
  const [a,b]=G.score; G.cw=a>b?0:b>a?1:-1; G.sw=-1;
  if(G.bo>1&&G.cw>=0){ G.wins[G.cw]++; if(G.wins[G.cw]>=Math.ceil(G.bo/2)) G.sw=G.cw; }
}
function nextMatch(){
  if(!G||G.phase!=='over'||G.bo<2||G.sw>=0) return; playSnd('next');
  G.mn++; G.round=1; G.score=[0,0]; G.hist=[]; G.used=[[],[]]; G.cur=[0,0]; G.pick=[null,null]; G.ready=[false,false]; G.hid=null; G.cw=-1; G.t=0; G.t0=0;
  G.phase=G.tour?'pick':'ready'; ST.fid=-1; arena();
}
function endRound(){
  stopTimer(); G.t=Date.now()-G.t0;
  const t=G.M.target;
  G.phase=(G.score[0]>=t||G.score[1]>=t||(G.max&&G.round>=G.max))?'over':'scored';
  if(G.phase==='over'){ serieEnd(); histAdd(); [784,988,1319].forEach((f,i)=>setTimeout(()=>beep(f,.4,.35),i*220)); buzz([120,60,120,60,300]); }
  arena();
}
function score(p,pts,k){
  if(!G||G.phase!=='fight') return;
  G.score[p]+=pts; G.hist.push({p,pts,k,t:Date.now()-G.t0});
  playSnd('sc'); buzz(50); endRound();
}
function nul(){ if(!G||G.phase!=='fight') return; playSnd('nul'); G.hist.push({p:-1,pts:0,t:Date.now()-G.t0}); endRound(); }
function undo(){
  if(!G||G.phase==='fight'||!G.hist.length) return;
  if(G.hid){ histDel(G.hid); G.hid=null; }
  if(G.phase==='over'&&G.bo>1&&G.cw>=0){ G.wins[G.cw]--; G.cw=-1; G.sw=-1; }
  const h=G.hist.pop(); if(h.p>=0) G.score[h.p]-=h.pts;
  G.phase='fight'; G.t0=Date.now()-h.t; arena(); startTimer();
}
function nextRound(){
  if(!G||G.phase!=='scored') return; playSnd('next');
  G.round++; G.pick=[null,null]; G.ready=[false,false]; G.phase=G.tour?'pick':'ready'; arena();
}
function ctx(){ if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==='suspended') AC.resume(); return AC; }
function beep(f,d,v){
  if(!st.son) return;
  try{ const a=ctx(),t=a.currentTime,o=a.createOscillator(),g=a.createGain(),lp=a.createBiquadFilter();
    o.type='sine'; o.frequency.value=f*.7; lp.type='lowpass'; lp.frequency.value=900;
    const vol=(v||.3)*.16, dur=Math.max(d,.16);
    g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.05);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(lp); lp.connect(g); g.connect(a.destination); o.start(t); o.stop(t+dur+.02);
  }catch(e){}
}
function say(txt,lang){
  if(!st.voix||!('speechSynthesis' in window)) return;
  try{ const u=new SpeechSynthesisUtterance(txt); u.lang=lang; u.rate=1.05; speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(e){}
}
function buzz(p){ try{ if(navigator.vibrate) navigator.vibrate(p); }catch(e){} }
const wait=ms=>new Promise(r=>setTimeout(r,ms));

/* ===== Listes déroulantes maison (lisibles dans les deux thèmes) ===== */
let csOpen=null,csLk=0;
function csClose(){ if(csOpen){ csOpen.list.remove(); csOpen.btn.setAttribute('aria-expanded','false'); csOpen=null; } }
function csShow(sel,btn){
  csClose(); csLk=Date.now();
  const l=document.createElement('div'); l.className='csl'; l.setAttribute('role','listbox');
  const srch=sel.options.length>12, nrm=t=>String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,''); let sq=null;
  if(srch){ sq=document.createElement('input'); sq.type='search'; sq.className='csq'; sq.placeholder=LT('Rechercher…'); sq.autocomplete='off'; sq.setAttribute('autocapitalize','off'); sq.setAttribute('aria-label',LT('Rechercher…'));
    sq.oninput=()=>{ const n=nrm(sq.value); l.querySelectorAll('.cso').forEach(it=>{ it.style.display=(!n||!it.dataset.v||it.dataset.v.indexOf(n)>-1)?'':'none'; }); }; l.appendChild(sq); }
  [...sel.options].forEach((o,i)=>{ const it=document.createElement('div'); it.className='cso'+(i===sel.selectedIndex?' on':''); it.setAttribute('role','option'); it.tabIndex=-1; if(o.value!=='') it.dataset.v=nrm(o.textContent); it.textContent=o.textContent;
    it.onclick=()=>{ csClose(); if(sel.selectedIndex!==i){ sel.selectedIndex=i; sel.dispatchEvent(new Event('change',{bubbles:true})); } btn.focus&&0; };
    l.appendChild(it); });
  document.body.appendChild(l);
  if(srch){ const fm=document.getElementById('fm'); if(fm&&fm.contains(btn)) fm.scrollTop+=btn.getBoundingClientRect().top-90; }
  const r=btn.getBoundingClientRect(),h=Math.min(l.scrollHeight,Math.round(innerHeight*(srch?.34:.5)),320);
  l.style.minWidth=r.width+'px'; l.style.maxHeight=h+'px';
  const below=innerHeight-r.bottom, up=r.top>h+8&&below<h+8;
  l.style.left=Math.max(4,Math.min(r.left,innerWidth-l.offsetWidth-4))+'px';
  l.style.top=(up?r.top-h-4:r.bottom+4)+'px';
  const on=l.querySelector('.on'); if(on) l.scrollTop=on.offsetTop-l.clientHeight/2+on.offsetHeight/2;
  btn.setAttribute('aria-expanded','true'); csOpen={list:l,btn}; if(sq) sq.focus({preventScroll:true});
  l.addEventListener('keydown',e=>{ const q=e.target===sq, its=[...l.querySelectorAll('.cso')].filter(x=>x.style.display!=='none'),i=its.indexOf(document.activeElement);
    if(e.key==='Escape'){ csClose(); btn.focus(); } else if(e.key==='ArrowDown'){ e.preventDefault(); const t=its[i+1]||its[0]; t&&t.focus(); } else if(e.key==='ArrowUp'){ e.preventDefault(); const t=q?its[0]:(its[i-1]||its[its.length-1]); t&&t.focus(); } else if(e.key==='Enter'||(e.key===' '&&!q)){ e.preventDefault(); const t=q?(its.find(x=>x.dataset.v)||its[0]):document.activeElement; t&&t.click&&t.click(); } });
}
function csEnhance(root){
  root.querySelectorAll('select:not([data-cs])').forEach(sel=>{
    sel.dataset.cs='1';
    const w=document.createElement('div'); w.className='cs';
    const b=document.createElement('button'); b.type='button'; b.className='csb'; b.setAttribute('aria-haspopup','listbox'); b.setAttribute('aria-expanded','false');
    if(sel.id==='k') w.classList.add('cs-auto');
    const lab=()=>{ const o=sel.options[sel.selectedIndex]; b.textContent=o?o.textContent:''; };
    sel.addEventListener('change',lab); lab(); b.disabled=sel.disabled; b.onclick=e=>{ e.preventDefault(); if(csOpen&&csOpen.btn===b) csClose(); else csShow(sel,b); };
    b.onkeydown=e=>{ if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault(); csShow(sel,b); const f=csOpen&&csOpen.list.querySelector('.on')||csOpen.list.firstChild; f&&f.focus(); } };
    sel.parentNode.insertBefore(w,sel); w.appendChild(b); w.appendChild(sel); sel.classList.add('csn');
  });
}
document.addEventListener('click',e=>{ if(csOpen&&!csOpen.list.contains(e.target)&&!csOpen.btn.contains(e.target)) csClose(); },true);
let csW=innerWidth; addEventListener('resize',()=>{ if(innerWidth!==csW){ csW=innerWidth; csClose(); } }); addEventListener('scroll',e=>{ if(Date.now()-csLk<900) return; if(csOpen&&e.target&&e.target.nodeType===1&&csOpen.list.contains(e.target)) return; if(csOpen&&e.target===csOpen.list) return; csClose(); },true);
new MutationObserver(()=>csEnhance(document.body)).observe(document.body,{childList:true,subtree:true});
csEnhance(document.body);

