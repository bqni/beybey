/* ===== Nettoyage des données reçues (QR, import, stockage) : tout est forcé en nombres ou en texte court ===== */
const nn=(v,d)=>{ v=typeof v==='number'||typeof v==='string'?Number(v):NaN; return isFinite(v)?Math.max(-1e9,Math.min(1e9,Math.round(v))):(d===undefined?0:d); };
const nid=v=>{ v=typeof v==='number'||typeof v==='string'?Number(v):NaN; return isFinite(v)?Math.max(0,Math.min(9e15,Math.round(v))):0; };
const ss=(v,n)=>typeof v==='string'||typeof v==='number'?String(v).slice(0,n||40):'';
const sid=v=>ss(v,200).replace(/[^A-Za-z0-9_-]/g,'').slice(0,20);
const sl=(v,n)=>Array.isArray(v)?v.slice(0,n||6).map(x=>ss(x,60)):[];
const stClean=s=>{ if(!Array.isArray(s)) return null; const t=(Array.isArray(s[0])||Array.isArray(s[1])||Array.isArray(s[2]))?s:[s,null,null];
  return [0,1,2].map(i=>{ const a=t[i]; return Array.isArray(a)?[Math.max(0,nn(a[0])),Math.max(0,nn(a[1])),Math.max(0,nn(a[2])),ss(a[3],60),Math.max(0,nn(a[4]))]:null; }); };
const hClean=r=>{ if(!r||typeof r!=='object'||Array.isArray(r)) return null; const o={id:nid(r.id),from:ss(r.from,20),cat:r.cat==='tournoi'?'tournoi':'simple',tg:nn(r.tg),bo:nn(r.bo),mn:nn(r.mn),r:nn(r.r),w:(r.w===0||r.w===1)?r.w:-1,
  s:[nn(r.s&&r.s[0]),nn(r.s&&r.s[1])],n:[ss(r.n&&r.n[0],20),ss(r.n&&r.n[1],20)],ids:[sid(r.ids&&r.ids[0]),sid(r.ids&&r.ids[1])],me:r.me?1:0,b:[sl(r.b&&r.b[0]),sl(r.b&&r.b[1])]};
  if(r.oid!==undefined&&r.oid!==null) o.oid=nid(r.oid); if(Array.isArray(r.pc)) o.pc=[sl(r.pc[0]),sl(r.pc[1])]; return o; };
const avOk=v=>typeof v==='string'&&/^a(0[1-9]|1[0-6])$/.test(v)?v:'';
const fClean=(f,id)=>{ if(!f||typeof f!=='object'||Array.isArray(f)) return null; const o={id,n:ss(f.n,20),note:ss(f.note,60),at:nid(f.at)}; const st=stClean(f.st); if(st) o.st=st; const av=avOk(f.av); if(av) o.av=av; return o; };
const tx=(v,n)=>ss(v,n||60).replace(/[<>"`\\]/g,'').replace(/'/g,'\u2019');
const pOk=v=>typeof v==='string'&&(/^idb:[\w-]{1,80}$/.test(v)||/^photos\/[\w\-./]{1,120}$/.test(v)||/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+\/=]+$/.test(v));
const stn=v=>Array.isArray(v)?v.slice(0,3).map(x=>(typeof x==='number'||(typeof x==='string'&&/^[0-9.,]{0,8}$/.test(x)))?x:''):undefined;
const cClean=o=>{ if(!o||typeof o!=='object'||Array.isArray(o)) return null;
  const c={id:nid(o.id)}; for(const k of ['nom','blade','ligne','typeBlade','typeToupie','edition','ratchet','bit','tag']) if(o[k]!==undefined&&o[k]!==null) c[k]=tx(o[k]);
  for(const k of ['poidsBlade','poidsRatchet','poidsBit']) if(o[k]!==undefined&&o[k]!==null) c[k]=typeof o[k]==='number'?(isFinite(o[k])?o[k]:''):(typeof o[k]==='string'?ss(o[k],12).replace(/[^0-9.,-]/g,''):'');
  if(o.hauteurRatchet!==undefined&&o.hauteurRatchet!==null&&o.hauteurRatchet!=='') c.hauteurRatchet=nn(o.hauteurRatchet);
  if(o.metalCoat!==undefined&&o.metalCoat!==null&&o.metalCoat!=='') c.metalCoat=tx(o.metalCoat,20); if(o.qty!==undefined) c.qty=Math.max(1,Math.min(99,nn(o.qty,1)));
  for(const k of ['dashBit','burstBit']) if(o[k]!==undefined&&o[k]!==null&&o[k]!=='') c[k]=nn(o[k]);
  for(const k of ['statsBlade','statsRatchet','statsBit']){ const v=stn(o[k]); if(v) c[k]=v; }
  for(const [k] of [['photoBlade'],['photoRatchet'],['photoBit']]) if(pOk(o[k])) c[k]=o[k];
  return c; };
/* ===== Collection perso : lecture / sauvegarde (validée) ===== */
function cLoad(){ try{ const a=JSON.parse(localStorage.getItem(CKEY)||'[]'); if(!Array.isArray(a)) return []; const L=a.map(cClean).filter(Boolean), seen=new Set(); L.forEach((c,i)=>{ if(c.id<1e12||seen.has(c.id)) c.id=1e12+i; seen.add(c.id); }); return L; }catch(e){ return []; } }
function cSave(a){ try{ localStorage.setItem(CKEY,JSON.stringify(a)); return true; }catch(e){ return false; } }
function cErr(o){ const E=[],n=v=>{ const x=String(v===undefined||v===null?'':v).replace(',','.').trim(); return x!==''&&/^[0-9.]+(-[0-9.]+)?$/.test(x); };
  if(!o.blade) E.push('Il manque le nom de la blade.'); if(!o.bit) E.push('Il manque le nom du bit.');
  if(!['BX','UX','CX'].includes(String(o.ligne||'').toUpperCase())) E.push('Choisis la ligne (BX, UX ou CX).');
  if(!normT(o.typeBlade)) E.push('Choisis le type de la blade.'); if(!normT(o.typeToupie)) E.push('Choisis le type de la toupie.');
  if(!n(o.poidsBlade)) E.push('Le poids de la blade doit être un nombre.'); if(!n(o.poidsBit)) E.push('Le poids du bit doit être un nombre.');
  if(o.ratchet&&!n(o.poidsRatchet)) E.push('Le poids du ratchet doit être un nombre.');
  return E; }
if(typeof TOUPIES==='undefined'||!Array.isArray(TOUPIES))
  fatal('data.js ne se charge pas',['Le fichier <b>data.js</b> est absent, vide ou contient une erreur : une virgule, une apostrophe ou une accolade oubliée. Compare avec un bloc qui marchait.']);
/* ===== Normalisation des données du catalogue ===== */
const hNom=n=>{ const m=String(n||'').match(/-(\d{2,3})$/); return m?+m[1]:''; };
document.addEventListener('change',e=>{ if(e.target&&e.target.id==='f_ratchet'){ const h=document.getElementById('f_h'); if(h&&!h.value){ const v=hNom(e.target.value); if(v) h.value=v; } } });
const NORM_T={attack:'Attack',attaque:'Attack',def:'Déf','déf':'Déf',defense:'Déf','défense':'Déf',stamina:'Stamina',endurance:'Stamina',balance:'Balance',equilibre:'Balance','équilibre':'Balance'};
const normT=v=>NORM_T[String(v||'').trim().toLowerCase()]||'';
const pw=v=>{ if(v===undefined||v===null||v==='') return ''; if(typeof v==='number') return v; const s=String(v).replace(/g/gi,'').replace(',','.').trim(); return /^[0-9.]+$/.test(s)?parseFloat(s):s; };
const avg=v=>typeof v==='string'&&v.includes('-')?v.split('-').reduce((a,b)=>a+ +b,0)/2:parseFloat(v);
const ERR=[];
const CUSTOM=cLoad().filter(o=>o&&!cErr(o).length);
const bkey=o=>[o.blade,o.ratchet||'',o.bit].join('|');
/* ===== Toupies masquées + liste complète (catalogue + collection) ===== */
function hdLoad(){ try{ const a=JSON.parse(localStorage.getItem('arene_hide')||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
function hdSave(a){ try{ localStorage.setItem('arene_hide',JSON.stringify(a)); return true; }catch(e){ return false; } }
const HID=hdLoad(), BASE=TOUPIES.filter(o=>!(o&&HID.includes(bkey(o)))), NBV=BASE.length;
const ALL=BASE.concat(CUSTOM);
/* Metal Coat : finition métallisée d'une toupie (couleur) */
/* ===== Couleurs MetalCoat ===== */
const MCC=['Black','Blue','Blue/Green','Bronze','Cyan','Gold','Green','Gunmetal','Magenta','Navy','Orange','Pink','Red','Silver','Violet','White','Yellow'];
const MCH={Black:'#2b2b2f',Blue:'#2f6bff','Blue/Green':'#1fb5a8',Bronze:'#b4793c',Cyan:'#22c7d6',Gold:'#e0b52a',Green:'#2fb457',Gunmetal:'#6b717c',Magenta:'#d6389a',Navy:'#1b2f72',Orange:'#f08a24',Pink:'#f08ab4',Red:'#e0343a',Silver:'#b9c0c9',Violet:'#8a4fd8',White:'#f2f2f2',Yellow:'#f2d625'};
const MCF={Black:'Noir',Blue:'Bleu','Blue/Green':'Bleu/Vert',Bronze:'Bronze',Cyan:'Cyan',Gold:'Or',Green:'Vert',Gunmetal:'Gunmetal',Magenta:'Magenta',Navy:'Bleu marine',Orange:'Orange',Pink:'Rose',Red:'Rouge',Silver:'Argent',Violet:'Violet',White:'Blanc',Yellow:'Jaune'};
const mcL=c=>LANG==='fr'?(MCF[c]||c):c;
const nmOf=o=>(o.blade+' '+(o.ratchet||'')+o.bit).replace('  ',' ').trim()+(o.metalCoat?' (Metal Coat: '+o.metalCoat+')':'');
const T=ALL.map((o,i)=>{
  const ERRX=ERR, ERR2={push:m=>{ if(i<NBV) ERRX.push(m); }}; 
  const nm=o.blade||('toupie n°'+(i+1));
  const l=String(o.ligne||'').trim().toUpperCase(), bty=normT(o.typeBlade), t=normT(o.typeToupie);
  const wb=pw(o.poidsBlade), wr=pw(o.poidsRatchet), wbt=pw(o.poidsBit);
  if(!o.blade) ERR2.push(nm+' : il manque <b>blade</b>');
  if(!o.bit) ERR2.push(nm+' : il manque <b>bit</b>');
  if(!['BX','UX','CX'].includes(l)) ERR2.push(nm+' : <b>ligne</b> doit être BX, UX ou CX');
  if(!bty) ERR2.push(nm+' : <b>typeBlade</b> doit être Attack, Déf, Stamina ou Balance');
  if(!t) ERR2.push(nm+' : <b>typeToupie</b> doit être Attack, Déf, Stamina ou Balance');
  if(wb===''||isNaN(avg(wb))) ERR2.push(nm+' : <b>poidsBlade</b> doit être un nombre');
  if(wbt===''||isNaN(avg(wbt))) ERR2.push(nm+' : <b>poidsBit</b> doit être un nombre');
  if(wr!==''&&isNaN(avg(wr))) ERR2.push(nm+' : <b>poidsRatchet</b> doit être un nombre (ou \'\' s\'il n\'y a pas de ratchet)');
  const hasTot=o.total!==undefined&&o.total!==null&&o.total!=='';
  const tot=hasTot?pw(o.total):Math.round((avg(wb)+(wr===''?0:avg(wr))+avg(wbt))*10)/10;
  const ar=v=>Array.isArray(v)&&v.length===3?v.map(Number):null;
  return {b:o.blade||'?',bty,l,t,r:o.ratchet||'',bt:o.bit||'?',wb,wr,wbt,tot,sb:ar(o.statsBlade),sr:ar(o.statsRatchet),sbt:ar(o.statsBit),h:o.hauteurRatchet||hNom(o.ratchet),dash:o.dashBit||'',burst:o.burstBit||'',_p:{blade:o.photoBlade,ratchet:o.photoRatchet,bit:o.photoBit},ed:o.edition==='tt'?'tt':'hasbro',nom:String(o.nom||'').trim(),mc:o.metalCoat||'',tg:o.tag||'',q:(+o.qty>1?Math.min(99,Math.floor(+o.qty)):1),_c:i>=NBV?o.id:0,_k:i<NBV?bkey(o):''};
});
if(ERR.length) fatal('Il y a une erreur dans data.js',[...ERR,'Corrige ça dans <b>data.js</b>, puis recharge la page.']);
T.forEach(x=>{ x.dn=(x.b+' '+(x.r||'')+x.bt).replace('  ',' ').trim(); x.n=x.dn+(x.mc?' (Metal Coat: '+x.mc+')':''); });
const IM={},PH={};
T.forEach(x=>{ PH[x.n]={}; for(const k of ['blade','ratchet','bit']){ const p=x._p[k]; if(p){ PH[x.n][k]=p; if(!isMk(p)) IM[p]=p; } } });
/* ---- Photos des toupies ajoutées : stockées dans IndexedDB (pas de limite de 5 Mo), le texte reste dans localStorage ---- */
/* ===== Photos : IndexedDB (photos perso) + chemins du catalogue ===== */
function isMk(v){ return typeof v==='string'&&v.indexOf('idb:')===0; }
const PHF=[['photoBlade','blade'],['photoRatchet','ratchet'],['photoBit','bit']];
const IDB={p:null};
function idbDb(){ if(!IDB.p) IDB.p=new Promise(res=>{ try{ const r=indexedDB.open('beybey',1);
  r.onupgradeneeded=()=>{ const d=r.result; if(!d.objectStoreNames.contains('photos')) d.createObjectStore('photos'); if(!d.objectStoreNames.contains('bak')) d.createObjectStore('bak'); };
  r.onsuccess=()=>res(r.result); r.onerror=()=>res(null); r.onblocked=()=>res(null); }catch(e){ res(null); } }); return IDB.p; }
function idbTx(store,mode,fn){ return idbDb().then(db=>{ if(!db) throw 0; return new Promise((res,rej)=>{ const tx=db.transaction(store,mode); let out; try{ out=fn(tx.objectStore(store)); }catch(e){ rej(e); return; } tx.oncomplete=()=>res(out&&out.result!==undefined?out.result:undefined); tx.onerror=tx.onabort=()=>rej(tx.error); }); }); }
const idbPut=(s,k,v)=>idbTx(s,'readwrite',o=>o.put(v,k));
const idbDel=(s,k)=>idbTx(s,'readwrite',o=>o.delete(k));
const idbGet=(s,k)=>idbTx(s,'readonly',o=>o.get(k));
function idbAll(s){ return idbDb().then(db=>{ if(!db) throw 0; return new Promise((res,rej)=>{ const out=[],c=db.transaction(s,'readonly').objectStore(s).openCursor(); c.onsuccess=()=>{ const x=c.result; if(x){ out.push([x.key,x.value]); x.continue(); } else res(out); }; c.onerror=()=>rej(c.error); }); }); }
function pStore(id,k,data){ const key=id+'_'+k; return idbPut('photos',key,data).then(()=>idbGet('photos',key)).then(v=>{ if(v!==data) throw 0; IM['idb:'+key]=data; return 'idb:'+key; }).catch(()=>data); }
const phRes=v=>isMk(v)?(IM[v]||''):(v||'');
async function photosBoot(){
  try{ navigator.storage&&navigator.storage.persist&&navigator.storage.persist(); }catch(e){}
  const db=await idbDb(); if(!db) return;
  let n=0; try{ (await idbAll('photos')).forEach(([k,v])=>{ IM['idb:'+k]=v; n++; }); }catch(e){}
  const raw=localStorage.getItem(CKEY),arr=cLoad();
  const isLeg=v=>typeof v==='string'&&v.indexOf('data:')===0;
  if(arr.some(o=>o&&PHF.some(([f])=>isLeg(o[f])))){
    try{ await idbPut('bak','arene_custom_'+Date.now(),raw); }catch(e){ return; }
    let ch=false;
    for(const o of arr){ if(!o) continue; for(const [f,k] of PHF){ if(isLeg(o[f])){ const m=await pStore(o.id,k,o[f]); if(isMk(m)){ o[f]=m; ch=true; } } } }
    if(ch&&!cSave(arr)){ /* échec : l'ancienne version reste intacte */ }
  }
  try{ const used=new Set(); cLoad().forEach(o=>o&&PHF.forEach(([f])=>{ if(isMk(o[f])) used.add(o[f].slice(4)); }));
    if(used.size) for(const [k] of await idbAll('photos')) if(!used.has(k)) await idbDel('photos',k); }catch(e){}
  if(n) draw();
}

const num=v=>parseFloat(String(v));

const LINE_ORDER=['BX','UX','CX'],TYPE_ORDER=['Attack','Déf','Stamina','Balance'];
const LINE_COL={BX:'var(--l-bx)',UX:'var(--l-ux)',CX:'var(--l-cx)'};
const DEF_DESC={nom:false,poids:true,ligne:false,type:false,att:true,def:true,end:true,haut:false,dash:true,burst:true};
