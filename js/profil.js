/* ===== Profil du joueur (propriétaire de l'appareil) ===== */
const PKEY='arene_profil';
let PRF=(()=>{ let r={}; try{ r=JSON.parse(localStorage.getItem(PKEY)||'{}')||{}; }catch(e){} if(typeof r!=='object'||Array.isArray(r)) r={}; return {n:ss(r.n,20),hn:ss(r.hn,20),id:sid(r.id),al:Array.isArray(r.al)?r.al.slice(0,20).map(x=>ss(x,20)).filter(Boolean):[],rst:nn(r.rst),av:/^a(0[1-9]|1[0-6])$/.test(r.av)?r.av:''}; })();
function pfSave(){ try{ localStorage.setItem(PKEY,JSON.stringify(PRF)); }catch(e){} }
if(!PRF.id){ try{ PRF.id=Array.from(crypto.getRandomValues(new Uint8Array(7))).map(b=>b.toString(36).padStart(2,'0')).join(''); }catch(e){ PRF.id=Math.random().toString(36).slice(2,12); } pfSave(); }
const nz=s=>String(s||'').trim().toLowerCase();
function pfReset(b){
  if(b.dataset.ok!=='1'){ b.dataset.ok='1'; b.textContent=LT('Confirmer ?'); setTimeout(()=>{ if(b.isConnected){ b.dataset.ok=''; b.textContent=LT('Remettre mes stats à zéro'); } },3500); return; }
  const L=hLoad(); L.forEach(r=>{ r.me=0; }); hSave(L); PRF.rst=Date.now(); pfSave(); draw();
}
function pfCommit(){
  const nn=PRF.n||'', old=PRF.hn||'';
  if(nn&&old&&nn!==old){ const L=hLoad(); L.forEach(r=>{ if(r.me&&r.n&&r.n[0]===old) r.n[0]=nn; }); hSave(L); }
  if(nn&&nn!==old){ PRF.hn=nn; pfSave(); }
}
function pfSet(v){ const was=st.m.me||!st.m.names[0]||st.m.names[0]===LT('Joueur 1'); PRF.n=String(v||'').trim().slice(0,16); pfSave(); if(was){ st.m.names[0]=PRF.n||LT('Joueur 1'); st.m.me=!!PRF.n; } }
function pfStats(L0,cat){
  const L=(L0||hLoad()).filter(r=>r.me&&(!cat||r.cat===cat)); let w=0,l=0,d=0; const use={};
  L.forEach(r=>{ if(r.w===0) w++; else if(r.w===1) l++; else d++; (r.b&&r.b[0]||[]).forEach(n=>{ if(n) use[n]=(use[n]||0)+1; }); });
  const top=Object.entries(use).sort((a,b)=>b[1]-a[1])[0];
  return {n:L.length,w,l,d,top:top?top[0]:'',topn:top?top[1]:0};
}
const stShare=()=>[undefined,'simple','tournoi'].map(c=>{ const S=pfStats(null,c); return [S.n,S.w,S.l,S.top,S.topn]; });
let PFC='';
const catSeg=(cur,fn)=>'<div class="frame f3 cseg">'+[['','Tout'],['simple','Simple'],['tournoi','3v3']].map(([v,l])=>`<button class="${cur===v?'on':''}" onclick="${fn}'${v}')"><span>${l}</span></button>`).join('')+'</div>';
function pfCat(v){ PFC=v; draw(); }
const AVN=16, avSrc=a=>'avatars/'+a+'.webp';
function avClose(){ const e=document.getElementById('avp'); if(e) e.remove(); }
function pfAv(a){ PRF.av=PRF.av===a?'':a; pfSave(); avClose(); draw(); }
function avPick(){ avClose(); let o=''; for(let i=1;i<=AVN;i++){ const a='a'+String(i).padStart(2,'0'); o+=`<button class="avo${PRF.av===a?' on':''}" onclick="pfAv('${a}')" aria-pressed="${PRF.av===a}" aria-label="Avatar ${i}"><img src="${avSrc(a)}" alt=""></button>`; }
  const d=document.createElement('div'); d.id='avp'; d.className='wlc'; d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true'); d.setAttribute('aria-label',LT('Avatar')); d.onclick=e=>{ if(e.target===d) avClose(); };
  d.innerHTML=`<div class="avbox"><h2>${LT('Avatar')}</h2><div class="avg">${o}</div>${PRF.av?`<button class="lnk" style="background:none;border:0;color:var(--text);font:inherit;font-size:var(--fs-sm);text-decoration:underline;cursor:pointer" onclick="pfAv('${PRF.av}')">${LT('Enlever l\'avatar')}</button>`:''}<button class="chip" onclick="avClose()">${LT('Fermer')}</button></div>`;
  document.body.appendChild(d); }
function pfAvUI(){ const nm=(PRF.n||'?').trim(); return `<div class="avrow"><span class="avcur">${PRF.av?`<img src="${avSrc(PRF.av)}" alt="">`:`<i>${esc((nm[0]||'?').toUpperCase())}</i>`}</span><button class="chip" onclick="avPick()">${LT('Changer l\'avatar')}</button></div>`; }
function pfUI(){
  const S=pfStats(null,PFC||undefined),pct=S.n?Math.round(100*S.w/S.n):0,c=(v,l)=>`<div class="pfc"><b>${v}</b><span>${l}</span></div>`;
  return '<div class="optl">Mon profil</div><div class="pcard pf" style="--pc:var(--pa)"><input class="nm" id="pfn" value="'+esc(PRF.n||'')+'" placeholder="Ton nom" maxlength="16" oninput="pfSet(this.value)" onchange="pfCommit()" aria-label="Ton nom">'+pfAvUI()
   +(PRF.n?catSeg(PFC,'pfCat(')+'<div class="pfg">'+c(S.n,'Matchs')+c(S.w,'Victoires')+c(S.l,'Défaites')+c(S.n?pct+'%':'—','Réussite')+'</div>'+'<div class="pfc pft"><span>Toupie la plus jouée</span><b>'+(S.top?esc(S.top)+' <small>×'+S.topn+'</small>':'—')+'</b></div>'+(S.n?'<button class="chip dng pfrs" onclick="pfReset(this)">Remettre mes stats à zéro</button>':'<div class="mut note">Aucun match compté pour l\'instant. Tu es toujours le joueur 1 par défaut.</div>')
    :'<div class="mut note">Entre ton nom : tu seras le joueur 1 par défaut et tes stats seront comptées.</div>')+'</div>';
}
function mName(p,v){
  st.m.names[p]=v; if(st.m.ids[p]){ st.m.ids[p]=''; }
  if(p===0&&PRF.n){ const me=v.trim()===PRF.n; if(me!==!!st.m.me) st.m.me=me; }
  noteRefresh();
}
function frChip(p){ const id=st.m.ids[p], f=id&&fLoad()[id]; return f?' <button class="chip" onclick="FRL=false;frOpen(\''+id+'\')">Profil de '+esc(f.n)+'</button>':''; }
function meNoteHTML(){
  if(!PRF.n) return frChip(0);
  return (st.m.me?'<span class="mut">Tes stats sont comptées.</span>':'<span class="mut">Stats non comptées (invité).</span> <button class="chip" onclick="mMe()">Revenir à '+esc(PRF.n)+'</button>')+frChip(0);
}
function noteRefresh(){ const a=document.getElementById('meNote'); if(a) a.innerHTML=meNoteHTML(); const b=document.getElementById('fnote1'); if(b) b.innerHTML=frChip(1); }
function mMe(){ st.m.me=true; st.m.names[0]=PRF.n; st.m.ids[0]=''; drawMatch(); }
st.m={mode:'simple',target:4,bo:1,rounds:0,names:[PRF.n||LT('Joueur 1'),LT('Joueur 2')],me:!!PRF.n,ids:['',''],p:[[mk(),mk(),mk()],[mk(),mk(),mk()]]};
const PCOL=['var(--pa)','var(--pink)'];
let G=null,tmr=null;

function resolve(c){
  if(!c||c.mode==='none') return {name:'',blade:'—',img:'',w:'',ty:'',pc:[]};
  if(c.src==='cat'&&typeof CAT!=='undefined'&&CAT.length){
    const none={name:LT('Choisir dans le catalogue…'),blade:'—',img:'',w:'',ty:'',pc:[]};
    if(c.mode==='custom'){ const P=cptBuild(), b=P.B[c.cb], r=P.R[c.cr], i=P.I[c.ci]; if(!b||!i) return none;
      if(b.im) IM[b.im]=b.im; return {pc:[b.n,r?r.n:'',i.n],name:b.n+' '+(r?r.n:'')+i.n,blade:b.n,img:b.im||'',w:Math.round(((+b.w||0)+(r?+r.w||0:0)+(+i.w||0))*10)/10,ty:normT(b.bt)}; }
    const x=c.cg>=0?CAT[c.cg]:null; if(!x) return none;
    if(x.ib) IM[x.ib]=x.ib; return {pc:[x.b,x.r||'',x.bi||''],name:x.n,blade:x.b,img:x.ib||'',w:Math.round(((+x.wb||0)+(+x.wr||0)+(+x.wbt||0))*10)/10,ty:x.t};
  }
  if(c.mode==='stock'){ const x=T[c.stock],ph=PH[x.n]||{}; return {pc:[x.b,x.r||'',x.bt||''],name:x.nom||x.n,blade:x.b,img:ph.blade,w:x.tot,ty:x.t}; }
  const bl=T[c.blade],ra=c.ratchet>=0?T[c.ratchet]:null,bi=T[c.bit],ph=PH[bl.n]||{};
  const w=wnum(bl.wb)+(ra?wnum(ra.wr):0)+wnum(bi.wbt);
  return {pc:[bl.b,ra?ra.r:'',bi.bt],name:bl.b+' '+(ra?ra.r:'')+bi.bt,blade:bl.b,img:ph.blade,w:Math.round(w*10)/10,ty:bl.bty};
}
function opt(list,sel){ return list.map(([v,l])=>`<option value="${v}" ${v==sel?'selected':''}>${l}</option>`).join(''); }
function drawMatch(){ document.getElementById('main').innerHTML=T.length?matchUI():emptyUI(); }
