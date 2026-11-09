/* ===== Partage par QR (toupie ou deck) + réception ===== */
const QRB='https://bqni.github.io/beybey/';
const LIBS={};
function libLoad(src,test){ if(test()) return Promise.resolve(true); return LIBS[src]||(LIBS[src]=new Promise(res=>{ const e=document.createElement('script'); e.src=src; e.onload=()=>res(test()); e.onerror=()=>{ LIBS[src]=null; res(false); }; document.head.appendChild(e); })); }
const b64e=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d=s=>{ s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; return decodeURIComponent(escape(atob(s))); };
const edS=e=>e==='tt'?'t':'h';
function slotDesc(c){
  if(!c||c.mode==='none') return null;
  if(c.src==='cat'){
    if(c.mode==='custom'){ const b=cptBuild().B[c.cb]; return b&&c.ci?[edS(b.e),b.n,c.cr||'',c.ci]:null; }
    const x=c.cg>=0?CAT[c.cg]:null; return x?[edS(x.e),x.b,x.r||'',x.bi||'']:null;
  }
  if(c.mode==='stock'){ const x=T[c.stock]; return x?[edS(x.ed),x.b,x.r||'',x.bt]:null; }
  const bl=T[c.blade],ra=c.ratchet>=0?T[c.ratchet]:null,bi=T[c.bit];
  return bl&&bi?[edS(bl.ed),bl.b,ra?ra.r:'',bi.bt]:null;
}
function descSlot(d){
  if(!Array.isArray(d)||!CAT.length) return null; const P=cptBuild(), k=(d[0]==='t'?'tt':'hasbro')+'|'+d[1];
  let b=P.B[k]; if(!b) b=Object.values(P.B).find(y=>y.n===d[1]); if(!b||!P.I[d[3]]||(d[2]&&!P.R[d[2]])) return null;
  return {mode:'custom',src:'cat',stock:0,blade:0,ratchet:-1,bit:0,cg:-1,cb:b.k,cr:d[2]||'',ci:d[3]};
}
function shOpen(h){ let f=document.getElementById('fm'); if(!f){ f=document.createElement('div'); f.id='fm'; document.body.appendChild(f); } f.innerHTML=h; fmShown(f); }
function shMsg(t,m){ shOpen(`<div class="fwrap"><div class="fh"><h2>${t}</h2><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></div><div class="fhelp">${m}</div><div class="fact"><button class="go sm" onclick="fmClose()">OK</button></div></div>`); }
let QRU='';
async function qrShow(list){
  if(!list.length&&!PRF.n) return shMsg(LT('Mon QR'),LT('Ajoute ton nom dans Profil pour partager ta fiche.'));
  if(list.some(d=>!d)) return shMsg(LT('Partager'),LT('Choisis d\'abord une toupie complète.'));
  if(list.some(d=>!descSlot(d))) return shMsg(LT('Partager'),LT('Cette toupie contient une pièce absente du catalogue : elle ne peut pas encore être partagée par QR.'));
  await libLoad('lib/qrcode.js',()=>typeof qrcode==='function');
  QRU=QRB+'#s='+b64e(JSON.stringify({v:1,n:PRF.n||'',i:PRF.id,a:avOk(PRF.av)||undefined,st:stShare(),t:list}));
  let svg=''; try{ const q=qrcode(0,'L'); q.addData(QRU); q.make(); svg=q.createSvgTag({cellSize:4,margin:0,scalable:true}); }catch(e){ svg=''; }
  if(!svg) return shMsg(LT('Partager'),LT('Impossible de créer le QR sur cet appareil.'));
  const rows=list.map(d=>{ const r=resolve(descSlot(d)); return `<div class="rcr">${img(r.img,'sm')}<div><b>${esc(r.name)}</b><div class="mut">${r.w} g</div></div></div>`; }).join('');
  shOpen(`<div class="fwrap"><div class="fh"><h2>${!list.length?LT('Ma fiche ami'):list.length>1?LT('Partager mon deck'):LT('Partager ma toupie')}</h2><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></div>
    <div class="qrbox" role="img" aria-label="QR code">${svg}</div>
    <div class="mut note qrn">${!list.length?LT('Ton ami ouvre Beybey, va dans Amis (depuis l\'accueil) et touche Scanner. Il reçoit ton nom et tes stats.'):LT('Ton ami ouvre Beybey, va dans Match et touche Scanner.')}${PRF.n?'':' '+LT('Ajoute ton nom dans Profil pour qu\'il s\'affiche chez lui.')}</div>
    <div class="rcl">${rows}</div>
    <div class="fact"><button class="chip" onclick="qrSend()">${LT('Envoyer le lien')}</button><button class="chip" onclick="fmClose()">${LT('Fermer')}</button></div></div>`);
}
function qrSend(){ try{ if(navigator.share){ navigator.share({title:'Beybey',url:QRU}).catch(()=>{}); return; } navigator.clipboard.writeText(QRU).then(()=>shMsg(LT('Lien copié'),LT('Colle-le dans un message.'))); }catch(e){} }
function qrSlots(p){ const n=st.m.mode==='tournoi'?3:1; qrShow([...Array(n).keys()].map(k=>slotDesc(st.m.p[p][k]))); }
function qrBuild(n){
  const L=bdLists(),B=BD[n],b=L.bl[B[0]],r=b&&!b.integ?L.ra[B[1]]:null,t=L.bi[B[2]]; if(!b||!t) return;
  qrShow([[edS(b.cat?b.c.e:T[b.i].ed),b.cat?b.c.n:T[b.i].b,r?(r.cat?r.c.n:T[r.i].r):'',t.cat?t.c.n:T[t.i].bt]]);
}
/* scanner */
let SCN=null;
function scStop(){ if(!SCN) return; clearTimeout(SCN.t); try{ SCN.s&&SCN.s.getTracks().forEach(t=>t.stop()); }catch(e){} SCN=null; }
async function scOpen(p){
  scStop(); SCN={p};
  shOpen(`<div class="fwrap"><div class="fh"><h2>${LT('Scanner un QR')}</h2><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></div>
    <div class="scw"><video id="scv" playsinline muted autoplay></video></div><div class="mut note" id="scm" aria-live="polite">${LT('Vise le QR de ton ami.')}</div></div>`);
  const m=t=>{ const e=document.getElementById('scm'); if(e) e.textContent=t; };
  if(!(await libLoad('lib/jsQR.js',()=>typeof jsQR==='function'))) return m(LT('Impossible de charger le lecteur de QR (connexion ?).'));
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia) return m(LT('La caméra n\'est pas disponible ici.'));
  try{ const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false}); if(!SCN){ s.getTracks().forEach(t=>t.stop()); return; } SCN.s=s;
    const v=document.getElementById('scv'); v.srcObject=s; await v.play(); const cv=document.createElement('canvas'), cx=cv.getContext('2d',{willReadFrequently:true});
    const tick=()=>{ if(!SCN) return;
      if(v.videoWidth){ const k=Math.min(1,520/v.videoWidth); cv.width=Math.round(v.videoWidth*k); cv.height=Math.round(v.videoHeight*k); cx.drawImage(v,0,0,cv.width,cv.height);
        const d=cx.getImageData(0,0,cv.width,cv.height), r=jsQR(d.data,cv.width,cv.height,{inversionAttempts:'dontInvert'});
        const mm=r&&r.data&&r.data.match(/#([sr])=([A-Za-z0-9_-]+)/);
        if(mm){ const p=SCN.p; scStop(); if(mm[1]==='r') rrOpen(mm[2]); else rcOpen(mm[2],p); return; } }
      SCN.t=setTimeout(tick,120); };
    tick();
  }catch(e){ m(LT('Caméra refusée. Autorise-la dans les réglages de l\'iPhone pour scanner.')); }
}
/* réception */
let RC=null;
function rcOpen(code,p){
  let d; try{ d=JSON.parse(b64d(code)); }catch(e){ return shMsg(LT('QR non reconnu'),LT('Ce QR ne vient pas de Beybey.')); }
  if(!d||typeof d!=='object') return shMsg(LT('QR non reconnu'),LT('Ce QR ne vient pas de Beybey.'));
  if(sid(d.i)&&(p===-1||!(Array.isArray(d.t)&&d.t.length))) return frRecv(d);
  let slots; try{ slots=(Array.isArray(d.t)?d.t:[]).slice(0,3).map(descSlot); }catch(e){ slots=[]; }
  if(!slots.length||slots.some(x=>!x)) return shMsg(LT('QR non reconnu'),LT('Une pièce de cette toupie est absente de ton catalogue.'));
  const from=ss(d.n,20).trim()||LT('Invité'); RC={from,slots,p,id:sid(d.i),st:stClean(d.st),av:avOk(d.a)};
  const rows=slots.map(sl=>{ const r=resolve(sl); return `<div class="rcr">${img(r.img,'sm')}<div><b>${esc(r.name)}</b><div class="mut">${r.w} g</div></div></div>`; }).join('');
  shOpen(`<div class="fwrap"><div class="fh"><h2>${slots.length>1?LT('Deck reçu'):LT('Toupie reçue')}</h2><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></div>
    <div class="fhelp">${LT('De')} <b>${esc(from)}</b></div><div class="rcl">${rows}</div>
    <div class="mut note">${LT('« Jouer avec » ne touche pas à ta collection ni à tes stats.')}</div>
    <div class="fact"><button class="go sm" onclick="rcPlay()">${LT('Jouer avec')}</button><button class="chip" onclick="rcAdd(this)">${LT('Ajouter à ma collection')}</button></div><div class="mut note" id="rcm" aria-live="polite"></div></div>`);
}
function frRecv(d){
  const id=sid(d.i), nm=ss(d.n,20).trim()||LT('Invité'), S=stClean(d.st), g=S&&S[0];
  if(id===PRF.id) return shMsg(LT('Ma fiche ami'),LT('C\'est ta propre fiche.'));
  const had=!!fLoad()[id]; fUpsert(id,nm,S,avOk(d.a));
  shOpen(`<div class="fwrap"><div class="fh"><h2>${LT('Ami ajouté')}</h2><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></div>
    <div class="fhelp">${favH({n:nm,av:avOk(d.a)},'')} <b>${esc(nm)}</b>${g?' · '+(g[0]||0)+' '+LT('matchs')+', '+(g[1]||0)+' '+LT('victoires'):''}</div>
    <div class="mut note">${had?LT('Sa fiche est mise à jour.'):LT('Il est dans ta liste d\'amis. Tu peux lui ajouter une note.')}</div>
    ${frLinkH({id,n:nm})}
    <div class="fact"><button class="go sm" onclick="frOpen('${id}')">${LT('Voir la fiche')}</button><button class="chip" onclick="fmClose()">${LT('Fermer')}</button></div></div>`);
  if(st.tab==='opts'||st.tab==='amis') draw(); else if(st.tab==='match') drawMatch();
}
function rcPlay(){
  const p=RC.p===undefined?1:RC.p, M=st.m; if(RC.slots.length>1) M.mode='tournoi';
  const n=M.mode==='tournoi'?3:1;
  if(RC.slots.length>1||n===1) RC.slots.slice(0,n).forEach((s,k)=>{ M.p[p][k]=s; });
  else { let k=M.p[p].findIndex(x=>!x||x.mode==='none'); if(k<0) k=0; M.p[p][k]=RC.slots[0]; }
  M.names[p]=RC.from; M.ids[p]=RC.id||''; if(RC.id) fUpsert(RC.id,RC.from,RC.st,RC.av); if(p===0) M.me=(RC.id?RC.id===PRF.id:RC.from===PRF.n);
  fmClose(); if(st.tab!=='match') setTab('match'); else drawMatch();
}
function rcAdd(btn){
  const P=cptBuild(), all=cLoad(), have=new Set(T.map(x=>x.n)), say=t=>{ const e=document.getElementById('rcm'); if(e) e.textContent=t; }; let add=0;
  RC.slots.forEach((s,k)=>{
    const b=P.B[s.cb], r=s.cr?P.R[s.cr]:null, i=P.I[s.ci], f=CAT.find(x=>x.bi===i.n);
    const o={id:Date.now()+k,nom:'',blade:b.n,ligne:b.l,typeBlade:b.bt,typeToupie:(f&&f.t)||b.bt,edition:b.e,ratchet:r?r.n:'',bit:i.n,poidsBlade:b.w,poidsRatchet:r?r.w:'',poidsBit:i.w};
    if(r&&r.h) o.hauteurRatchet=+r.h; if(b.im) o.photoBlade=b.im; if(r&&r.im) o.photoRatchet=r.im; if(i.im) o.photoBit=i.im;
    if(cErr(o).length) return; const nm=nmOf(o); if(have.has(nm)) return; have.add(nm); all.push(o); add++; });
  if(!add) return say(LT('Tu as déjà tout ça dans ta collection.'));
  if(!cSave(all)) return say(LT('Pas assez de place pour enregistrer.'));
  btn.disabled=true; say(LT('Ajouté à ta collection.')); setTimeout(()=>location.reload(),700);
}
window.addEventListener('load',()=>{ const k=location.hash.slice(1,3); if(k==='s='||k==='r='){ const c=location.hash.slice(3); try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){} setTimeout(()=>k==='r='?rrOpen(c):rcOpen(c),400); } });
/* ===== Amis ===== */
const FKEY='arene_amis';
function fLoad(){ try{ const F=JSON.parse(localStorage.getItem(FKEY)||'{}')||{}, O={}; if(typeof F!=='object'||Array.isArray(F)) return {}; for(const k in F){ const i=sid(k); if(i&&i===k){ const f=fClean(F[k],i); if(f) O[i]=f; } } return O; }catch(e){ return {}; } }
function fSave(o){ try{ localStorage.setItem(FKEY,JSON.stringify(o)); }catch(e){} }
function fUpsert(id,n,sts,av){ id=sid(id); if(!id||id===PRF.id) return; const F=fLoad(), f=F[id]||{id,n:'',note:''}; if(ss(n,20)) f.n=ss(n,20); if(av!==undefined){ const a=avOk(av); if(a) f.av=a; else delete f.av; } const c=stClean(sts); if(c){ f.st=c; f.at=Date.now(); } F[id]=f; fSave(F); }
function friendsPage(q){
  FRL=false; q=q||''; const F=Object.values(fLoad()).sort((a,b)=>String(a.n).localeCompare(b.n)), all=F.length;
  const btns='<div class="frame"><button onclick="qrShow([])"><span>'+LT('Code')+'</span></button><button onclick="scOpen(-1)"><span>'+LT('Scanner')+'</span></button></div>';
  if(!all) return '<div class="ops frp"><div class="pcard frempty"><b>'+LT('Pas encore d\'amis')+'</b><p class="mut">'+LT('Pour ajouter un pote, scanne son code QR. Il peut l\'afficher avec le bouton Code, et toi tu peux montrer le tien de la même façon.')+'</p></div>'+btns+'</div>';
  const L=q?F.filter(f=>nz(f.n+' '+(f.note||'')).includes(nz(q))):F;
  return '<div class="ops frp">'+btns+(all>6?'<input class="nm frn" id="frq" value="'+esc(q)+'" placeholder="'+LT('Chercher un ami…')+'" oninput="frSearch(this.value)" aria-label="'+LT('Chercher')+'">':'')+'<div class="optl">'+LT('Amis')+' ('+all+')</div><div class="flist pcard" id="frl">'+frRows(L)+'</div></div>';
}
const favH=(f,c)=>`<span class="fav ${c||''}">${f.av?`<img src="${avSrc(f.av)}" alt="">`:`<i>${esc(((f.n||'?').trim()[0]||'?').toUpperCase())}</i>`}</span>`;
function frRows(L){ return L.map(f=>`<button class="frow" onclick="frOpen('${f.id}')">${favH(f)}<span class="frt"><b>${esc(f.n)}</b>${f.note?`<span class="mut">${esc(f.note)}</span>`:''}</span></button>`).join('')||`<div class="mut note">${LT('Aucun résultat')}</div>`; }
function frSearch(q){ const F=Object.values(fLoad()).sort((a,b)=>String(a.n).localeCompare(b.n)); document.getElementById('frl').innerHTML=frRows(q?F.filter(f=>nz(f.n+' '+(f.note||'')).includes(nz(q))):F); }
let FRL=false;
function frList(q){
  FRL=true; q=q||''; const F=Object.values(fLoad()).sort((a,b)=>String(a.n).localeCompare(b.n)), all=F.length;
  const L=q?F.filter(f=>nz(f.n+' '+(f.note||'')).includes(nz(q))):F;
  shOpen(`<div class="fwrap hall"><div class="fh"><h2>${LT('Amis')} (${all})</h2><button class="chip sq" onclick="FRL=false;fmClose()" aria-label="Fermer">✕</button></div>
    <div class="frame"><button onclick="scOpen(-1)"><span>${LT('Scanner')}</span></button><button onclick="qrShow([])"><span>${LT('Mon QR')}</span></button></div>
    ${all>6?`<input class="nm frn" id="frq" value="${esc(q)}" placeholder="${LT('Chercher un ami…')}" oninput="frList(this.value)" aria-label="${LT('Chercher')}">`:''}
    <div class="hscroll"><div class="flist pcard">${L.map(f=>`<button class="frow" onclick="frOpen('${f.id}')"><b>${esc(f.n)}</b>${f.note?`<span class="mut">${esc(f.note)}</span>`:''}</button>`).join('')||`<div class="mut note">${LT('Aucun résultat')}</div>`}</div></div></div>`);
  if(q){ const e=document.getElementById('frq'); if(e){ e.focus(); e.setSelectionRange(q.length,q.length); } }
}
let FRC='';
function frCat(id,v){ FRC=v; frOpen(id); }
function frH2H(f){
  const L=hLoad().filter(r=>r.me&&(!FRC||r.cat===FRC)&&((r.ids&&r.ids[1])?r.ids[1]===f.id:nz(r.n[1])===nz(f.n))); let w=0,l=0;
  L.forEach(r=>{ if(r.w===0) w++; else if(r.w===1) l++; }); return {n:L.length,w,l};
}
function frLinkL(f){ // noms tapés à la main (sans fiche ami) dans mon historique, des deux côtés, y compris les matchs joués par d'autres
  const m={}; hLoad().forEach(r=>{ if(!r.n) return; [0,1].forEach(j=>{ if(j===0&&r.me) return; if(r.ids&&r.ids[j]) return; const k=nz(r.n[j]); if(!k||k===nz(f.n)) return; (m[k]=m[k]||{k,n:r.n[j],c:0}).c++; }); });
  return Object.values(m).sort((a,b)=>b.c-a.c); }
function frLinkH(f){ const L=frLinkL(f); if(!L.length) return '';
  return `<div class="optl" style="padding:0">${LT('Matchs sous un autre nom')}</div><div class="mut note">${LT('Des matchs ont été joués contre un nom tapé à la main. Si c\'est lui, touche son nom pour les relier à sa fiche.')}</div><div class="flist pcard">${L.map(x=>`<button class="frow" onclick="frLink('${f.id}','${encodeURIComponent(x.k).replace(/'/g,'%27')}')"><b>${esc(x.n)}</b><span class="mut">${x.c} match${x.c>1?'s':''}</span></button>`).join('')}</div>`; }
function frLink(id,k){ const f=fLoad()[id]; if(!f) return; try{ k=decodeURIComponent(k); }catch(e){ return; }
  const L=hLoad(); let c=0;
  L.forEach(r=>{ if(!r.n) return; [0,1].forEach(j=>{ if(j===0&&r.me) return; if(r.ids&&r.ids[j]) return; if(nz(r.n[j])!==k) return; r.n[j]=f.n; r.ids=[(r.ids&&r.ids[0])||'',(r.ids&&r.ids[1])||'']; r.ids[j]=f.id; c++; }); });
  if(c){ hSave(L); } if(st.tab==='match') drawMatch(); frOpen(id); }
async function frSend(id){ // envoie à un ami tous nos matchs ensemble (lien), même anciens : il les ajoute à son historique
  const f=fLoad()[id]; if(!f) return; let list=hLoad().filter(r=>r.me&&r.ids&&r.ids[1]===id).slice(0,60);
  if(!list.length) return shMsg(LT('Envoyer nos matchs'),LT('Aucun match avec lui.'));
  let code=''; while(list.length){ code=await packJ(sessPack(list)); if((QRB+'#r='+code).length<=8000||list.length===1) break; list=list.slice(0,Math.max(1,list.length-5)); }
  QRU=QRB+'#r='+code; qrSend(); }
function frOpen(id){
  const f=fLoad()[id]; if(!f) return; const H=frH2H(f), S0=f.st, S=S0&&(Array.isArray(S0[0])?S0[FRC==='simple'?1:FRC==='tournoi'?2:0]:(FRC?null:S0)), c=(v,l)=>`<div class="pfc"><b>${v}</b><span>${l}</span></div>`;
  const when=f.at?new Date(f.at).toLocaleDateString(LOC,{day:'numeric',month:'short'}):'';
  shOpen(`<div class="fwrap"><div class="fh"><h2 class="fht">${favH(f,'big')}<span>${esc(f.n)}</span></h2><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></div>
    <input class="nm frn" id="frn" value="${esc(f.note||'')}" maxlength="60" placeholder="${LT('Note (ex. : mon pote du club)')}" oninput="frNote('${id}',this.value)" aria-label="${LT('Note')}">
    ${catSeg(FRC,`frCat('${id}',`)}<div class="optl" style="padding:0">${LT('Toi contre')} ${esc(f.n)}</div>
    <div class="pfg">${c(H.n,LT('Matchs'))}${c(H.w,LT('Victoires'))}${c(H.l,LT('Défaites'))}${c(H.n?Math.round(100*H.w/H.n)+'%':'—',LT('Réussite'))}</div>
    ${S?`<div class="optl" style="padding:0">${LT('Ses stats')}${when?' · '+LT('au scan du')+' '+when:''}</div><div class="pfg">${c(S[0]||0,LT('Matchs'))}${c(S[1]||0,LT('Victoires'))}${c(S[2]||0,LT('Défaites'))}${c(S[0]?Math.round(100*S[1]/S[0])+'%':'—',LT('Réussite'))}</div>${S[3]?`<div class="mut note">${LT('Toupie la plus jouée')} : <b>${esc(S[3])}</b> ×${S[4]||0}</div>`:''}`:`<div class="mut note">${LT('Scanne sa toupie pour voir ses stats.')}</div>`}
    ${frLinkH(f)}
    ${H.n?`<button class="chip" onclick="frSend('${id}')">${LT('Envoyer nos matchs')}</button><div class="mut note">${LT('Envoie à ton ami un lien avec vos matchs (même anciens) : il les ajoute à son historique.')}</div>`:''}
    <div class="fact"><button class="chip dng" onclick="frDel(this,'${id}')">${LT('Retirer')}</button><button class="chip" onclick="FRL?frList():fmClose()">${LT(FRL?'Retour':'Fermer')}</button></div></div>`);
}
function frNote(id,v){ const F=fLoad(); if(F[id]){ F[id].note=String(v).slice(0,60); fSave(F); } }
function frDel(b,id){  if(b.dataset.ok!=='1'){ b.dataset.ok='1'; b.textContent=LT('Confirmer ?'); setTimeout(()=>{ if(b.isConnected){ b.dataset.ok=''; b.textContent=LT('Retirer'); } },3500); return; } const F=fLoad(); delete F[id]; fSave(F); if(FRL&&Object.keys(F).length){ frList(); } else { FRL=false; fmClose(); } if(st.tab==='opts'||st.tab==='amis') draw(); else if(st.tab==='match') drawMatch(); }

/* ===== Partage des résultats d'une session (un seul code, plusieurs joueurs) ===== */
const u8b64=u=>{ let s=''; u.forEach(c=>{ s+=String.fromCharCode(c); }); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); };
const b64u8=s=>{ s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; return Uint8Array.from(atob(s),c=>c.charCodeAt(0)); };
async function packJ(o){ const j=JSON.stringify(o); try{ if(typeof CompressionStream==='function'){ const z=new Blob([j]).stream().pipeThrough(new CompressionStream('deflate-raw')); return 'z'+u8b64(new Uint8Array(await new Response(z).arrayBuffer())); } }catch(e){} return 'p'+b64e(j); }
async function unpackJ(c){ try{ if(typeof c!=='string'||c.length>20000) return null; if(c[0]==='z'){ const z=new Blob([b64u8(c.slice(1))]).stream().pipeThrough(new DecompressionStream('deflate-raw')), rd=z.getReader(), dec=new TextDecoder(); let out='',n=0; for(;;){ const {done,value}=await rd.read(); if(done) break; n+=value.length; if(n>262144){ rd.cancel(); return null; } out+=dec.decode(value,{stream:true}); } return JSON.parse(out+dec.decode()); } return JSON.parse(b64d(c.slice(1))); }catch(e){ return null; } }
function sessAll(){ const L=hLoad(); if(!L.length) return []; const t0=L[0].id; return L.filter(r=>t0-r.id<21600000).slice(0,40); }
const pcOf=(r,i)=>r.pc?r.pc[i]:(r.b[i]||[]);
function sessPack(list){
  const P=[], ix=(id,n)=>{ const k=id||('n:'+nz(n)); let i=P.findIndex(p=>p.k===k); if(i<0){ P.push({k,id:id||'',n:String(n||'')}); i=P.length-1; } return i; };
  const M=list.map(r=>{ const a=ix(r.me?PRF.id:((r.ids&&r.ids[0])||''),r.n[0]), b=ix((r.ids&&r.ids[1])||'',r.n[1]); return [r.id,r.cat==='tournoi'?1:0,r.tg,r.bo||0,r.mn||0,r.r,r.w,r.s[0],r.s[1],a,b,pcOf(r,0),pcOf(r,1)]; });
  return {v:2,n:PRF.n||'',i:PRF.id,a:avOk(PRF.av)||undefined,st:stShare(),p:P.map(p=>[p.id,p.n]),m:M};
}
async function rsShow(){
  const all=sessAll(); if(!all.length) return shMsg(LT('Partager'),LT('Aucun match à partager.'));
  await libLoad('lib/qrcode.js',()=>typeof qrcode==='function');
  let list=all, code='';
  while(list.length){ code=await packJ(sessPack(list)); if((QRB+'#r='+code).length<=900||list.length===1) break; list=list.slice(0,Math.max(1,list.length-2)); }
  QRU=QRB+'#r='+code;
  let svg=''; try{ const q=qrcode(0,'L'); q.addData(QRU); q.make(); svg=q.createSvgTag({cellSize:4,margin:0,scalable:true}); }catch(e){}
  if(!svg) return shMsg(LT('Partager'),LT('Impossible de créer le QR sur cet appareil.'));
  const names=[...new Set(list.flatMap(r=>[r.n[0],r.n[1]]))];
  shOpen(`<div class="fwrap"><div class="fh"><h2>${LT('Partager la session')}</h2><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></div>
    <div class="fhelp">${names.map(esc).join(', ')} · ${list.length} match${list.length>1?'s':''}${list.length<all.length?' ('+LT('les plus récents')+')':''}</div>
    <div class="qrbox" role="img" aria-label="QR code">${svg}</div>
    <div class="mut note qrn">${LT('Chaque joueur ouvre Beybey, va dans Match, touche Scanner et vise ce QR. Il récupère seulement ses matchs.')}</div>
    <div class="fact"><button class="chip" onclick="qrSend()">${LT('Envoyer le lien')}</button><button class="chip" onclick="fmClose()">${LT('Fermer')}</button></div></div>`);
}
let RR=null;
function rrMe(){ const P=RR.d.p; let i=P.findIndex(p=>p[0]&&p[0]===PRF.id); if(i<0&&PRF.n) i=P.findIndex(p=>nz(p[1])===nz(PRF.n)); if(i<0) i=P.findIndex(p=>(PRF.al||[]).includes(nz(p[1]))); return i; }
async function rrOpen(code){
  let d=await unpackJ(code); if(!d||typeof d!=='object'||d.v!==2||!Array.isArray(d.m)||!Array.isArray(d.p)) return shMsg(LT('QR non reconnu'),LT('Ce QR ne vient pas de Beybey.'));
  const P=d.p.slice(0,12).map(p=>[sid(Array.isArray(p)&&p[0]),ss(Array.isArray(p)&&p[1],20)]);
  d={v:2,n:ss(d.n,20),i:sid(d.i),a:avOk(d.a),st:stClean(d.st),p:P,m:d.m.slice(0,60).filter(Array.isArray).map(x=>[nid(x[0]),x[1]?1:0,nn(x[2]),nn(x[3]),nn(x[4]),nn(x[5]),nn(x[6]),nn(x[7]),nn(x[8]),nn(x[9],-1),nn(x[10],-1),sl(x[11]),sl(x[12])]).filter(x=>P[x[9]]&&P[x[10]])};
  RR={d,from:d.n.trim()||LT('Invité'),me:undefined}; rrRender();
}
function rrRender(){
  const d=RR.d,P=d.p; if(RR.me===undefined||RR.me<0) RR.me=rrMe(); const me=RR.me;
  if(me<0){
    shOpen(`<div class="fwrap"><div class="fh"><h2>${LT('Qui es-tu ?')}</h2><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></div>
      <div class="fhelp">${LT('Ton nom ne figure pas dans ce QR. Touche le tien :')}</div>
      <div class="flist pcard">${P.map((p,i)=>`<button class="frow" onclick="rrPick(${i})"><b>${esc(p[1])}</b></button>`).join('')}</div></div>`); return;
  }
  const mine=d.m.filter(x=>x[9]===me||x[10]===me);
  const rows=mine.map(x=>{ const fl=x[10]===me&&x[9]!==me, a=fl?x[10]:x[9], b=fl?x[9]:x[10], sa=fl?x[8]:x[7], sb=fl?x[7]:x[8]; return `<div class="hr"><div class="hm"><span class="hn" style="color:var(--pa)">${esc(P[a][1])}</span><b class="hsc">${sa} – ${sb}</b><span class="hn" style="color:var(--pink)">${esc(P[b][1])}</span></div></div>`; }).join('');
  shOpen(`<div class="fwrap hall"><div class="fh"><h2>${LT('Résultats reçus')}</h2><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></div>
    <div class="fhelp">${LT('De')} <b>${esc(RR.from)}</b> · ${mine.length} match${mine.length>1?'s':''} ${LT('avec toi')} (${esc(P[me][1])})</div><div class="hscroll">${rows||`<div class="mut">${LT('Aucun match avec toi.')}</div>`}
    <div class="mut note">${LT('Ils seront ajoutés à ton historique, de ton point de vue, et comptés dans tes stats.')}</div></div>
    <div class="fact rrb">${mine.length?`<button class="go sm" onclick="rrAdd(this)">${LT('Ajouter à mon historique')}</button>`:''}<button class="chip" onclick="rrWho()">${LT('Ce n\'est pas moi')}</button><button class="chip" onclick="fmClose()">${LT('Fermer')}</button></div><div class="mut note" id="rcm" aria-live="polite"></div></div>`);
}
function rrWho(){ RR.me=-2; const d=RR.d; shOpen(`<div class="fwrap"><div class="fh"><h2>${LT('Qui es-tu ?')}</h2><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></div><div class="flist pcard">${d.p.map((p,i)=>`<button class="frow" onclick="rrPick(${i})"><b>${esc(p[1])}</b></button>`).join('')}</div></div>`); }
function rrPick(i){ RR.me=i; RR.picked=true; rrRender(); }
function rrAdd(btn){
  const d=RR.d,P=d.p,me=RR.me,from=sid(d.i)||String(d.n||'?').slice(0,20); const L=hLoad().filter(r=>!(r.from===from&&(r.oid===1e9||r.oid===undefined&&r.id<1e12))); let add=0;
  if(RR.picked){ const nm=nz(P[me][1]); if(nm&&nm!==nz(PRF.n)){ PRF.al=PRF.al||[]; if(!PRF.al.includes(nm)) PRF.al.push(nm); pfSave(); } }
  d.m.forEach(x=>{ if(x[9]!==me&&x[10]!==me) return; if(L.some(r=>r.oid===x[0]&&r.from===from)) return;
    const fl=x[10]===me&&x[9]!==me, o=fl?x[9]:x[10], sa=fl?x[8]:x[7], sb=fl?x[7]:x[8], w=x[6]<0?-1:(fl?1-x[6]:x[6]), pa=fl?x[12]:x[11], pb=fl?x[11]:x[12];
    let id=x[0]; while(L.some(r=>r.id===id)) id++;
    L.push({id,oid:x[0],from,cat:x[1]?'tournoi':'simple',tg:x[2],bo:x[3],mn:x[4],r:x[5],w,s:[sa,sb],n:[PRF.n||P[me][1],P[o][1]],ids:[PRF.id,sid(P[o][0])],pc:[pa,pb],b:[pa,pb],me:x[0]<(PRF.rst||0)?0:1});
    if(sid(P[o][0])) fUpsert(P[o][0],P[o][1],null); add++; });
  if(sid(d.i)&&sid(d.i)!==PRF.id) fUpsert(d.i,d.n,d.st,d.a);
  L.sort((a,b)=>b.id-a.id); hSave(L); btn.disabled=true;
  const e=document.getElementById('rcm'); if(e) e.textContent=add?LT('Ajouté à ton historique.'):LT('Déjà dans ton historique.');
  setTimeout(()=>{ fmClose(); if(st.tab==='match') drawMatch(); else if(st.tab==='opts'||st.tab==='amis') draw(); },900);
}

function emptyUI(){ return '<div class="empty">Tu n\'as pas encore de toupie.</div><button class="addb" onclick="setTab(\'toupies\')">Aller ajouter une toupie</button>'; }
function mSet(k,v){ st.m[k]=v; drawMatch(); }

function slotUI(p,s){
  const c=st.m.p[p][s], lab=st.m.mode==='tournoi'?`<div class="sl">Toupie ${s+1}</div>`:'';
  if(!c||c.mode==='none') return `<div class="slot">${lab}<button class="slotadd" onclick="pkOpen(${p},${s})"><span>+</span> Ajouter une toupie</button></div>`;
  const r=resolve(c), pcs=r.pc.filter(Boolean).map(esc).join(' · ');
  return `<div class="slot">${lab}<div class="prv">${img(r.img,'sm')}<div class="grow"><b>${esc(r.name)}</b><div class="mut prm">${typ(r.ty)}<span>${r.w?r.w+' g':''}</span></div><div class="mut pcl">${pcs}</div></div><button class="chip" onclick="pkOpen(${p},${s},1)">Changer</button></div></div>`;
}
