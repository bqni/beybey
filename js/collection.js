/* ===== Ajout / modification de toupies + sauvegarde ===== */
const FM={id:0,ph:{}};
const TYPES4=[['','Choisir…'],['Attack','Attack'],['Déf','Déf'],['Stamina','Stamina'],['Balance','Balance']];
const gv=id=>{ const e=document.getElementById(id); return e?e.value.trim():''; };
function fmOpts(list,sel){ return list.map(([v,l])=>`<option value="${v}" ${v===sel?'selected':''}>${l}</option>`).join(''); }
function fmField(id,lab,val,mode,ph){ return `<label class="ff3"><span>${lab}</span><input class="nm ff" id="${id}" value="${esc(val===undefined||val===null?'':val)}" inputmode="${mode||'text'}" placeholder="${ph||''}" autocomplete="off" autocapitalize="${mode?'off':'words'}"></label>`; }
function fmStats(pre,a){ a=a||[]; return `<div class="fst fadv"><span>Stats au dos de la boîte</span>${['Att','Déf','End'].map((l,i)=>`<label><input class="nm ff" id="${pre}${i}" value="${a[i]===undefined?'':a[i]}" inputmode="numeric" placeholder="${l}" aria-label="${l}"></label>`).join('')}</div>`; }
function fmPhoto(k,lab){ const v=FM.ph[k]; return `<div class="fph"><div class="pimg sm" id="phv_${k}">${v?`<img src="${v}" alt="">`:''}</div><div><label class="chip phb"><input type="file" accept="image/*" hidden onchange="fmPick('${k}',this)">${lab}</label><button type="button" class="chip" id="phc_${k}" onclick="fmCrop('${k}')" ${v?'':'hidden'}>Recadrer</button><button type="button" class="chip" id="phx_${k}" onclick="fmRm('${k}')" ${v?'':'hidden'}>Retirer</button></div></div>`; }
function tpForm(id,pre,fromCat){
  const o=id?CUSTOM.find(x=>x.id===id):null, src=o||pre||null; FM.id=o?o.id:0; FM.tag=(src&&src.tag)||''; FM.ph={blade:phRes(src&&src.photoBlade),ratchet:phRes(src&&src.photoRatchet),bit:phRes(src&&src.photoBit)}; FM.rm={}; FM.orig=o?{blade:o.photoBlade,ratchet:o.photoRatchet,bit:o.photoBit}:{};
  o&&0;
  const adv=!!o||!!(src&&(src.statsBlade||src.statsRatchet||src.statsBit||src.dashBit||src.burstBit));
  const h=`<div class="fwrap${adv?' adv':''}"><div class="fh"><h2>${o?'Modifier la toupie':'Nouvelle toupie'}</h2><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></div>
  ${fromCat?'<div class="fhelp">Pré-rempli depuis le catalogue (Beydex). Vérifie les poids avec ta balance, et ajoute les stats et les photos si tu veux.</div>':''}<div class="fhelp fadv"><b>Où trouver les stats ?</b> Au dos de la boîte, chaque pièce (Blade, Ratchet, Bit) a ses barres : <b>Attack</b>, <b>Defense</b> et <b>Stamina</b>, avec un chiffre à côté. Recopie-les dans Att, Déf et End. Le ratchet a aussi une <b>Height</b> (hauteur), le bit un <b>Dash</b> et un <b>Burst</b>. Tout est facultatif, mais pour les stats remplis les 3 chiffres d'une pièce ou aucun.</div>
  ${o?'':`<label class="fadvt"><input type="checkbox" id="f_adv" ${adv?'checked':''} onchange="this.closest('.fwrap').classList.toggle('adv',this.checked)"><span>Stats avancées (Att / Déf / End, Dash, Burst)</span></label>`}
  <div class="fs">Général</div><div class="fg2"><label class="ff3"><span>Édition</span><select id="f_ed">${fmOpts([['','Choisir…'],['hasbro','Hasbro'],['tt','Takara Tomy']],src?(src.edition==='tt'?'tt':'hasbro'):'')}</select></label></div><div class="fg2"><label class="ff3"><span>Metal Coat</span><select id="f_mc">${fmOpts([['','Aucun']].concat(MCC.map(c=>[c,mcL(c)])),src&&src.metalCoat||'')}</select></label></div><div class="fg2"><label class="ff3"><span>Ligne</span><select id="f_ligne">${fmOpts([['','Choisir…'],['BX','BX'],['UX','UX'],['CX','CX']],src&&String(src.ligne).toUpperCase()||'')}</select></label><label class="ff3"><span>Type de la toupie</span><select id="f_t">${fmOpts(TYPES4,src?normT(src.typeToupie):'')}</select></label></div>
  <div class="fs">Blade <small>(sa photo sert aussi pour la toupie)</small></div>
  ${fmField('f_blade','Nom',src&&src.blade,'','Ex. Delta Unicorn')}${fmField('f_nom','Nom perso (optionnel)',src&&src.nom,'','Ex. Mon Antler défense')}<div class="fg2"><label class="ff3"><span>Type de la blade</span><select id="f_bty">${fmOpts(TYPES4,src?normT(src.typeBlade):'')}</select></label>${fmField('f_wb','Poids (g)',src&&src.poidsBlade,'decimal','Ex. 33')}</div>${fmStats('f_sb',src&&src.statsBlade)}${fmPhoto('blade','Photo de la blade')}
  <div class="fs">Ratchet <small>(facultatif)</small></div>
  <div class="fg2">${fmField('f_ratchet','Nom',src&&src.ratchet,'','Ex. 3-60')}${fmField('f_wr','Poids (g)',src&&src.poidsRatchet,'decimal','Ex. 6.2')}</div>${fmField('f_h','Hauteur',src&&src.hauteurRatchet,'numeric','Ex. 60')}${fmStats('f_sr',src&&src.statsRatchet)}${fmPhoto('ratchet','Photo du ratchet')}
  <div class="fs">Bit</div>
  <div class="fg2">${fmField('f_bit','Nom',src&&src.bit,'','Ex. GU')}${fmField('f_wbt','Poids (g)',src&&src.poidsBit,'decimal','Ex. 2.1')}</div><div class="fg2 fadv">${fmField('f_dash','Dash',src&&src.dashBit,'numeric','Ex. 30')}${fmField('f_burst','Burst',src&&src.burstBit,'numeric','Ex. 30')}</div>${fmStats('f_sbt',src&&src.statsBit)}${fmPhoto('bit','Photo du bit')}
  <div class="ferr" id="f_err" role="alert"></div>
  <div class="fact"><button class="go sm" onclick="fmSave()">Enregistrer</button><button class="chip" onclick="fmClose()">Annuler</button>${o?'<button class="chip dng" id="f_del" onclick="fmDel()">Supprimer</button>':''}</div></div>`;
  let f=document.getElementById('fm'); if(!f){ f=document.createElement('div'); f.id='fm'; document.body.appendChild(f); }
  f.innerHTML=h; fmShown(f);
}

const CAT=(typeof CATALOGUE!=='undefined'&&Array.isArray(CATALOGUE))?CATALOGUE:[];
function catPre(c){ const o={blade:c.b,ligne:c.l,typeBlade:c.bt,typeToupie:c.t,edition:c.e,ratchet:c.r,bit:c.bi}; if(c.wb) o.poidsBlade=c.wb; if(c.wr) o.poidsRatchet=c.wr; if(c.wbt) o.poidsBit=c.wbt; if(c.h) o.hauteurRatchet=c.h; if(c.ib) o.photoBlade=c.ib; if(c.ir) o.photoRatchet=c.ir; if(c.it) o.photoBit=c.it; if(c.mc) o.metalCoat=c.mc; if(c.tg) o.tag=c.tg; return o; }
let CPT=null,CPS={e:'hasbro'};
function cptBuild(){ if(CPT) return CPT; const B={},R={},I={};
  CAT.forEach(c=>{ if(c.b){ const k=c.e+'|'+c.b, x=B[k]||(B[k]={k:k,e:c.e,n:c.b,l:c.l,bt:c.bt}); if(!x.w&&c.wb) x.w=c.wb; if(!x.im&&c.ib) x.im=c.ib; }
    if(c.r){ const x=R[c.r]||(R[c.r]={n:c.r}); if(!x.w&&c.wr) x.w=c.wr; if(!x.h&&c.h) x.h=c.h; if(!x.im&&c.ir) x.im=c.ir; }
    if(c.bi){ const x=I[c.bi]||(I[c.bi]={n:c.bi}); if(!x.w&&c.wbt) x.w=c.wbt; if(!x.im&&c.it) x.im=c.it; } });
  CPT={B:B,R:R,I:I}; return CPT; }
const cpSort=(a,b)=>a.n.localeCompare(b.n,undefined,{numeric:true,sensitivity:'base'});
function addOpen(){
  if(!CAT.length) return tpForm();
  const h=`<div class="fwrap"><div class="fh"><h2>Ajouter une toupie</h2><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></div>
  <div class="fhelp">Comment veux-tu l'ajouter ?</div>
  <button class="addb" onclick="tpForm()">Manuellement</button><div class="mut note addn">Formulaire vide : tu remplis tout toi-même.</div>
  <button class="addb cat" onclick="catOpen()">Depuis le catalogue</button><div class="mut note addn">Tu choisis chaque pièce dans une liste, les poids et les photos se remplissent tout seuls.</div></div>`;
  let f=document.getElementById('fm'); if(!f){ f=document.createElement('div'); f.id='fm'; document.body.appendChild(f); }
  f.innerHTML=h; fmShown(f);
}
function catOpen(){
  cptBuild(); CPS={e:(st.ed==='tt'?'tt':'hasbro')};
  const row=(id,lab)=>`<div class="fs">${lab}</div><div class="cpr"><label class="ff3"><select id="${id}" onchange="cpSel()"></select></label><div class="cpp" id="${id}_p"></div></div>`;
  const h=`<div class="fwrap cpwrap"><div class="fh"><h2>Depuis le catalogue</h2><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></div>
  <div class="fhelp">Cherche ta toupie pour avoir son build d'origine, puis change les pièces si tu veux. Poids et photos se remplissent tout seuls, tu pourras tout corriger. Données et images de la communauté (Beydex), poids indicatifs.</div>
  <div class="fs">Édition</div><label class="ff3"><select id="cp_e" onchange="cpEd(this.value)">${fmOpts([['hasbro','Hasbro'],['tt','Takara Tomy']],CPS.e)}</select></label>
  <div class="fs">Toupie (build d'origine)</div><label class="ff3"><select id="cp_n" onchange="cpBey()"></select></label>
  ${row('cp_b','Blade')}${row('cp_r','Ratchet')}${row('cp_i','Bit')}
  <div class="ferr" id="f_err" role="alert"></div><div class="fact"><button class="go sm" id="cp_go" onclick="cpGo()" disabled>Enregistrer</button><button class="chip" onclick="fmClose()">Annuler</button></div></div>`;
  let f=document.getElementById('fm'); if(!f){ f=document.createElement('div'); f.id='fm'; document.body.appendChild(f); }
  f.innerHTML=h; fmShown(f);
  const P=CPT, ph=[['','Choisir…']];
  document.getElementById('cp_r').innerHTML=fmOpts([['','Aucun']].concat(Object.values(P.R).sort(cpSort).map(x=>[x.n,esc(x.n)])),'');
  document.getElementById('cp_i').innerHTML=fmOpts(ph.concat(Object.values(P.I).sort(cpSort).map(x=>[x.n,esc(x.n)])),'');
  cpEd(CPS.e);
}
function cpBey(){ const n=document.getElementById('cp_n'), c=n&&n.value!==''?CAT[+n.value]:null; if(!c) return;
  [['cp_b',c.e+'|'+c.b],['cp_r',c.r||''],['cp_i',c.bi||'']].forEach(([id,v])=>{ const s=document.getElementById(id); if(s){ s.value=v; s.dispatchEvent(new Event('change',{bubbles:true})); } }); }
function cpEd(e){ CPS.e=e; const nn=document.getElementById('cp_n'); if(nn){ nn.innerHTML=fmOpts([['','Choisir…']].concat(CAT.map((c,i)=>({c:c,i:i})).filter(x=>x.c.e===e).sort((a,b)=>a.c.n.localeCompare(b.c.n,undefined,{numeric:true,sensitivity:'base'})).map(x=>[String(x.i),esc(x.c.n)])),''); nn.dispatchEvent(new Event('change')); }
  const sel=document.getElementById('cp_b'); if(!sel) return;
  sel.innerHTML=fmOpts([['','Choisir…']].concat(Object.values(CPT.B).filter(x=>x.e===e).sort(cpSort).map(x=>[x.k,esc(x.n)])),''); sel.dispatchEvent(new Event('change')); }
function cpSel(){
  const g=id=>{ const s=document.getElementById(id); return s?s.value:''; };
  const it=[['cp_b',CPT.B[g('cp_b')]],['cp_r',CPT.R[g('cp_r')]],['cp_i',CPT.I[g('cp_i')]]];
  const nv=document.getElementById('cp_n'), pk=nv&&nv.value!==''?CAT[+nv.value]:null, bb=it[0][1], rr=it[1][1], ii=it[2][1];
  const sm=c=>bb&&ii&&c.e===bb.e&&c.b===bb.n&&(c.r||'')===(rr?rr.n:'')&&c.bi===ii.n, own=pk&&sm(pk)?pk:(bb&&ii?(CAT.find(c=>sm(c)&&!c.mc)||CAT.find(sm)||null):null);
  const bo=pk&&pk.bo&&bb&&pk.e===bb.e&&pk.b===bb.n?pk:null;
  const ow={cp_b:bo?{im:bo.ib,w:bo.wb}:own&&{im:own.ib,w:own.wb},cp_r:own&&{im:own.ir,w:own.wr},cp_i:own&&{im:own.it,w:own.wbt}};
  it.forEach(([id,x])=>{ const p=document.getElementById(id+'_p'); if(!p) return; const y=((own||(bo&&id==='cp_b'))&&x&&ow[id]&&ow[id].im)?ow[id]:x;
    p.innerHTML=x?((y.im?`<img src="${y.im}" alt="" loading="lazy">`:'<span class="cpn"></span>')+(y.w?`<small>${y.w} g</small>`:'')):''; });
  const go=document.getElementById('cp_go'); if(go) go.disabled=!(it[0][1]&&it[2][1]);
}
function cpGo(){
  const b=CPT.B[document.getElementById('cp_b').value], r=CPT.R[document.getElementById('cp_r').value], i=CPT.I[document.getElementById('cp_i').value];
  if(!b||!i) return;
  const nv=document.getElementById('cp_n'), pk=nv&&nv.value!==''?CAT[+nv.value]:null, same=c=>c.e===b.e&&c.b===b.n&&(c.r||'')===(r?r.n:'')&&c.bi===i.n;
  const bpk=!!(pk&&pk.bo&&pk.e===b.e&&pk.b===b.n), m=bpk?null:((pk&&same(pk))?pk:(CAT.find(c=>same(c)&&!c.mc)||CAT.find(same)));
  if(m) return cpSave(catPre(m));
  const o={blade:b.n,ligne:b.l,typeBlade:b.bt,edition:b.e,ratchet:r?r.n:'',bit:i.n};
  if(b.w) o.poidsBlade=b.w; if(r&&r.w) o.poidsRatchet=r.w; if(i.w) o.poidsBit=i.w; if(r&&r.h) o.hauteurRatchet=r.h;
  if(b.im) o.photoBlade=b.im; if(r&&r.im) o.photoRatchet=r.im; if(i.im) o.photoBit=i.im;
  if(pk&&pk.bo&&pk.e===b.e&&pk.b===b.n){ o.metalCoat=pk.mc; if(pk.ib) o.photoBlade=pk.ib; if(pk.wb) o.poidsBlade=pk.wb; }
  cpSave(o);
}
function cpSave(o){
  const box=document.getElementById('f_err'); if(!o.ratchet) o.ratchet='';
  if(!o.hauteurRatchet&&o.ratchet&&hNom(o.ratchet)) o.hauteurRatchet=hNom(o.ratchet);
  const er=cErr(o);
  if(er.length) return tpForm(0,o,true); // données incomplètes (combo perso) : on ouvre le formulaire pour compléter
  const nm=nmOf(o);
  const dp=T.find(x=>x.n===nm); if(dp){ if(dp._c) return dupMsg(dp); box.textContent='Une toupie « '+nm+' » existe déjà.'; box.scrollIntoView({block:'center'}); return; }
  o.id=Date.now(); const all=cLoad(); all.push(o);
  if(!cSave(all)){ box.textContent='Pas assez de place pour enregistrer. Retire une photo ou une toupie et réessaie.'; return; }
  try{ localStorage.setItem('arene_dirty',String(Date.now())); }catch(e){}
  location.reload();
}
function fmClose(){ if(typeof scStop==='function') scStop(); const f=document.getElementById('fm'); if(f){ f.classList.remove('show','wtabs'); f.style.bottom=''; f.innerHTML=''; } document.body.classList.remove('fmt'); document.documentElement.style.overflow=''; if(FMO&&FMO.isConnected){ try{ FMO.focus({preventScroll:true}); }catch(e){} } FMO=null; }
function fmRm(k){ FM.ph[k]=''; FM.rm[k]=true; fmPhShow(k); }
function fmPhShow(k){ const v=FM.ph[k],e=document.getElementById('phv_'+k),x=document.getElementById('phx_'+k); if(e) e.innerHTML=v?`<img src="${v}" alt="">`:''; if(x) x.hidden=!v; const cc=document.getElementById('phc_'+k); if(cc) cc.hidden=!v; }
var CR=null;
function crOpen(k,src){
  const im=new Image(); im.onload=()=>{
    let e=document.getElementById('cr'); if(!e){ e=document.createElement('div'); e.id='cr'; document.body.appendChild(e); }
    const V=Math.max(200,Math.min(320,innerWidth-80)),w=im.naturalWidth,h=im.naturalHeight,mn=V/Math.max(w,h),cv=V/Math.min(w,h);
    CR={k,im,V,w,h,mn,s:cv,x:0,y:0};
    CR.x=(V-w*CR.s)/2; CR.y=(V-h*CR.s)/2;
    e.innerHTML=`<div class="crb"><p>Glisse la photo pour la centrer, zoome avec le curseur.</p><canvas id="crc" width="${V}" height="${V}" style="width:${V}px;height:${V}px"></canvas><input type="range" id="crz" min="${mn}" max="${cv*4}" step="any" value="${CR.s}" aria-label="Zoom"><div class="fact"><button class="go sm" onclick="crOk()">Valider</button><button class="chip" onclick="crClose()">Annuler</button></div></div>`;
    e.classList.add('show'); const c=document.getElementById('crc'); let d=null;
    c.onpointerdown=ev=>{ d={px:ev.clientX,py:ev.clientY,x:CR.x,y:CR.y}; c.setPointerCapture(ev.pointerId); c.style.cursor='grabbing'; };
    c.onpointermove=ev=>{ if(!d) return; CR.x=d.x+(ev.clientX-d.px); CR.y=d.y+(ev.clientY-d.py); crDraw(); };
    c.onpointerup=c.onpointercancel=()=>{ d=null; c.style.cursor='grab'; };
    c.onwheel=ev=>{ ev.preventDefault(); crZoom(CR.s*(ev.deltaY<0?1.08:1/1.08)); };
    document.getElementById('crz').oninput=ev=>crZoom(+ev.target.value);
    crDraw();
  };
  im.onerror=()=>{ const r=document.getElementById('f_err'); if(r) r.textContent='Cette photo ne peut pas être lue. Essaie une autre image.'; };
  im.src=src;
}
function crClamp(){ const a=CR.w*CR.s,b=CR.h*CR.s,V=CR.V;
  CR.x=a>=V?Math.min(0,Math.max(V-a,CR.x)):Math.min(V-a,Math.max(0,CR.x));
  CR.y=b>=V?Math.min(0,Math.max(V-b,CR.y)):Math.min(V-b,Math.max(0,CR.y)); }
function crZoom(n){ const V=CR.V,cx=(V/2-CR.x)/CR.s,cy=(V/2-CR.y)/CR.s; n=Math.max(CR.mn,Math.min(CR.mn*0+n,CR.mn*0+document.getElementById('crz').max*1)); CR.s=n; CR.x=V/2-cx*n; CR.y=V/2-cy*n; document.getElementById('crz').value=n; crDraw(); }
function crDraw(){ crClamp(); const c=document.getElementById('crc'),x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,CR.V,CR.V); x.drawImage(CR.im,CR.x,CR.y,CR.w*CR.s,CR.h*CR.s); }
function crOk(){ const S=480,f=S/CR.V,c=document.createElement('canvas'); c.width=c.height=S; const x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,S,S); x.drawImage(CR.im,CR.x*f,CR.y*f,CR.w*CR.s*f,CR.h*CR.s*f); const k=CR.k; FM.ph[k]=c.toDataURL('image/jpeg',.78); FM.rm[k]=false; crClose(); fmPhShow(k); }
function crClose(){ const e=document.getElementById('cr'); if(e){ e.classList.remove('show'); e.innerHTML=''; } CR=null; }
function fmCrop(k){ if(FM.ph[k]) crOpen(k,FM.ph[k]); }
function fmPick(k,inp){
  const f=inp.files&&inp.files[0]; if(!f) return; const u=URL.createObjectURL(f);
  crOpen(k,u); setTimeout(()=>URL.revokeObjectURL(u),60000); inp.value=''; }
async function fmSave(){
  const arr=pre=>{ const v=[0,1,2].map(i=>gv(pre+i)); return v.every(x=>x!=='')?v.map(x=>+String(x).replace(',','.')):undefined; };
  const o={id:FM.id||Date.now(),blade:gv('f_blade'),ligne:gv('f_ligne'),typeBlade:gv('f_bty'),typeToupie:gv('f_t'),edition:gv('f_ed'),ratchet:gv('f_ratchet'),bit:gv('f_bit'),poidsBlade:gv('f_wb').replace(',','.'),poidsRatchet:gv('f_wr').replace(',','.'),poidsBit:gv('f_wbt').replace(',','.')};
  const nomv=gv('f_nom').trim(); if(nomv) o.nom=nomv; const prev0=cLoad().find(x=>x.id===o.id); if(prev0&&prev0.qty>1) o.qty=prev0.qty;
  const mcv=gv('f_mc'); if(mcv) o.metalCoat=mcv; if(FM.tag) o.tag=FM.tag; const h=gv('f_h'),da=gv('f_dash'),bu=gv('f_burst'); if(!h&&o.ratchet&&hNom(o.ratchet)) o.hauteurRatchet=hNom(o.ratchet); if(h) o.hauteurRatchet=+h; if(da) o.dashBit=+da; if(bu) o.burstBit=+bu;
  const sb=arr('f_sb'),sr=arr('f_sr'),sbt=arr('f_sbt'); if(sb) o.statsBlade=sb; if(sr) o.statsRatchet=sr; if(sbt) o.statsBit=sbt;
  const er=cErr(o); if(!o.edition) er.unshift('Choisis l\'édition : Hasbro ou Takara Tomy.'); const nm=nmOf(o);
  if(!er.length){ const dp=T.find(x=>x.n===nm&&x._c!==FM.id); if(dp){ if(dp._c&&!FM.id) return dupMsg(dp); er.push('Une toupie « '+nm+' » existe déjà.'); } }
  const box=document.getElementById('f_err'); if(er.length){ box.innerHTML=er.map(esc).join('<br>'); box.scrollIntoView({block:'center'}); return; }
  for(const [f,k] of PHF){ const v=FM.ph[k]; if(v){ o[f]=(typeof v==='string'&&v.indexOf('photos/')===0)?v:await pStore(o.id,k,v); } else if(!FM.rm[k]&&FM.orig[k]) o[f]=FM.orig[k]; else if(FM.rm[k]&&isMk(FM.orig[k])) idbDel('photos',FM.orig[k].slice(4)).catch(()=>{}); }
  const all=cLoad(),ix=all.findIndex(x=>x.id===o.id); ix>=0?all[ix]=o:all.push(o);
  if(!cSave(all)){ box.textContent='Pas assez de place pour enregistrer. Retire une photo ou une toupie et réessaie.'; return; }
  try{ localStorage.setItem('arene_dirty',String(Date.now())); }catch(e){}
  location.reload();
}
function bsDel(b,k){
  if(T.length<=1){ b.textContent=LT('Garde au moins une toupie'); return; }
  if(b.dataset.ok!=='1'){ b.dataset.ok='1'; b.textContent=LT('Confirmer ?'); setTimeout(()=>{ if(b.isConnected){ b.dataset.ok=''; b.textContent=LT('Supprimer'); } },3500); return; }
  const a=hdLoad(); k=decodeURIComponent(k); if(!a.includes(k)) a.push(k); hdSave(a); location.reload();
}
function cuQty(id,d,rl){
  const all=cLoad(), o=all.find(x=>x.id===id); if(!o) return;
  o.qty=Math.max(1,Math.min(99,(+o.qty||1)+d)); if(!cSave(all)) return;
  const x=T.find(t=>t._c===id); if(x) x.q=o.qty;
  if(rl){ try{ localStorage.setItem('arene_dirty',String(Date.now())); }catch(e){} location.reload(); return; }
  document.querySelectorAll('[data-q="'+id+'"]').forEach(e=>{ e.textContent=o.qty; });
  document.querySelectorAll('[data-qb="'+id+'"]').forEach(e=>{ e.textContent='×'+o.qty; e.hidden=o.qty<2; });
}
function dupMsg(x){ const b=document.getElementById('f_err'); if(!b) return; const q=x.q||1;
  b.innerHTML=esc(LT('Tu as déjà cette toupie'))+' ('+q+'). <button type="button" class="chip" onclick="cuQty('+x._c+',1,1)">'+esc(LT('Ajouter un exemplaire'))+'</button>'; b.scrollIntoView({block:'center'}); }
async function cuDel(b,id){
  if(b.dataset.ok!=='1'){ b.dataset.ok='1'; b.textContent=LT('Confirmer ?'); setTimeout(()=>{ if(b.isConnected){ b.dataset.ok=''; b.textContent=LT('Supprimer'); } },3500); return; }
  cSave(cLoad().filter(x=>x.id!==id)); for(const [,k] of PHF){ try{ await idbDel('photos',id+'_'+k); }catch(e){} } location.reload();
}
function bsRestore(){ hdSave([]); location.reload(); }
async function fmDel(){ const b=document.getElementById('f_del'); if(b.dataset.ok!=='1'){ b.dataset.ok='1'; b.textContent='Confirmer la suppression'; return; }
  cSave(cLoad().filter(x=>x.id!==FM.id)); for(const [,k] of PHF) { try{ await idbDel('photos',FM.id+'_'+k); }catch(e){} } location.reload(); }
function bkMsg(t){ const e=document.getElementById('bkmsg'); if(e) e.textContent=t; }
function bkDone(){ try{ localStorage.setItem('arene_lastbk',String(Date.now())); localStorage.removeItem('arene_bkrem'); }catch(e){} }
async function backupExport(){ try{ await PBOOT; }catch(e){}
  const d=new Date(),pad=n=>String(n).padStart(2,'0'),name='beybey-sauvegarde-'+d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'.json';
  const data={app:'arene-beyblade',v:1,date:d.toISOString(),toupies:cLoad().map(o=>{ const c=Object.assign({},o); PHF.forEach(([f])=>{ if(isMk(c[f])){ const v=IM[c[f]]; if(v) c[f]=v; else delete c[f]; } }); return c; }),historique:hLoad(),masquees:hdLoad(),profil:PRF,amis:fLoad(),reglages:{theme:document.documentElement.dataset.theme==='futurl'?'futurl':'futur',bg:BGS[bgMode]?bgMode:'actuel'}};
  const file=new File([JSON.stringify(data)],name,{type:'application/json'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){ navigator.share({files:[file],title:'Sauvegarde Beybey'}).then(()=>{ bkDone(); bkMsg('Sauvegarde exportée.'); }).catch(()=>{}); return; }
  try{ const a=document.createElement('a'); a.href=URL.createObjectURL(file); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); bkDone(); bkMsg('Sauvegarde téléchargée : '+name); }catch(e){ bkMsg('Impossible de créer le fichier sur cet appareil.'); }
}
function backupImport(inp,done){
  const f=inp.files&&inp.files[0]; if(!f) return; if(f.size>100e6){ bkMsg('Fichier trop gros pour une sauvegarde Beybey.'); inp.value=''; return; } const r=new FileReader();
  r.onload=async()=>{ let d; const wrote=[];
    try{ d=JSON.parse(r.result); if(!d||typeof d!=='object'||d.app!=='arene-beyblade') throw 0; }catch(e){ bkMsg('Ce fichier n\'est pas une sauvegarde Beybey.'); inp.value=''; return; }
    // Étape 1 : on prépare tout SANS toucher aux données existantes (seules les photos sont posées à part, et retirées si l'import échoue).
    // Étape 2 : on écrit tout d'un coup ; si une écriture échoue, on remet les anciennes valeurs.
    try{
      const have=cLoad(),names=new Set(T.map(x=>x.n)); let addT=0,addH=0;
      for(const o0 of (Array.isArray(d.toupies)?d.toupies.slice(0,1500):[])){ const o=cClean(o0); if(!o||cErr(o).length) continue; const nm=nmOf(o); if(have.some(x=>x.id===o.id)||names.has(nm)) continue;
        for(const [f,k] of PHF){ if(typeof o[f]==='string'&&o[f].indexOf('data:')===0){ const v=await pStore(o.id,k,o[f]); if(typeof v==='string'&&v.indexOf('idb:')===0) wrote.push(o.id+'_'+k); o[f]=v; } else if(!(typeof o[f]==='string'&&o[f].indexOf('photos/')===0)) delete o[f]; }
        have.push(o); names.add(nm); addT++; }
      const plan={}; plan[CKEY]=JSON.stringify(have);
      if(Array.isArray(d.masquees)){ const hd=hdLoad(); d.masquees.slice(0,2000).forEach(k=>{ if(typeof k==='string'&&k.length<80&&!hd.includes(k)) hd.push(k); }); plan['arene_hide']=JSON.stringify(hd); }
      let newTheme=null,newBg=null;
      if(d.reglages&&typeof d.reglages==='object'){ const rg=d.reglages; if(rg.theme==='futur'||rg.theme==='futurl'){ newTheme=rg.theme; plan['arene_theme']=rg.theme; } if(typeof rg.bg==='string'&&BGS[rg.bg]){ newBg=rg.bg; plan['arene_bg']=rg.bg; } }
      let newPrf=null;
      if(d.profil&&typeof d.profil==='object'&&ss(d.profil.n,20)&&!PRF.n){ newPrf=Object.assign({},PRF,{n:ss(d.profil.n,20)}); if(sid(d.profil.id)) newPrf.id=sid(d.profil.id); newPrf.hn=newPrf.n; if(/^a(0[1-9]|1[0-6])$/.test(d.profil.av)) newPrf.av=d.profil.av; plan[PKEY]=JSON.stringify(newPrf); }
      if(d.amis&&typeof d.amis==='object'&&!Array.isArray(d.amis)){ const F=fLoad(); Object.keys(d.amis).slice(0,500).forEach(k=>{ const i=sid(k), f=i&&i===k?fClean(d.amis[k],i):null; if(f&&!F[i]) F[i]=f; }); plan[FKEY]=JSON.stringify(F); }
      const hs=hLoad(); (Array.isArray(d.historique)?d.historique.slice(0,300):[]).forEach(h0=>{ const h=hClean(h0); if(h&&h.id&&!hs.some(x=>x.id===h.id)){ hs.push(h); addH++; } }); hs.sort((a,b)=>b.id-a.id); plan[HKEY]=JSON.stringify(hs.slice(0,300));
      const old={}, keys=Object.keys(plan); for(const k of keys) old[k]=localStorage.getItem(k);
      try{ for(const k of keys) localStorage.setItem(k,plan[k]); }
      catch(e){ for(const k of keys){ try{ if(old[k]===null) localStorage.removeItem(k); else localStorage.setItem(k,old[k]); }catch(x){} }
        for(const id of wrote){ try{ await idbDel('photos',id); }catch(x){} }
        bkMsg('Pas assez de place pour tout importer : rien n\'a été modifié.'); inp.value=''; return; }
      // Tout est écrit : on met à jour l'état en mémoire.
      if(newPrf) Object.assign(PRF,newPrf); if(newTheme) setTheme(newTheme); if(newBg) setBg(newBg);
      bkMsg('Importé : '+addT+' toupie'+(addT>1?'s':'')+' et '+addH+' match'+(addH>1?'s':'')+' en plus.'); if(done) setTimeout(done,900); else if(addT) setTimeout(()=>location.reload(),900);
    }catch(e){ for(const id of wrote){ try{ await idbDel('photos',id); }catch(x){} } bkMsg('L\'import a échoué : rien n\'a été modifié.'); } inp.value=''; };
  r.readAsText(f);
}
function setTab(t){ const f=document.getElementById('fm'); if(f&&f.classList.contains('wtabs')) fmClose(); st.tab=t; draw(); window.scrollTo(0,0); }

function partItems(){
  const P=x=>PH[x.n]||{};
  const TT=TF();
  if(st.cat==='ratchets') return TT.filter(x=>x.r).map(x=>({n:x.r+(x.mc?' · '+mcL(x.mc):''),w:x.wr,img:P(x).ratchet,ty:'',l:'',s:x.sr,h:x.h,ex:x.h?`Hauteur <b>${x.h}</b>`:''}));
  if(st.cat==='bits') return TT.map(x=>({n:x.bt+(x.mc?' · '+mcL(x.mc):''),w:x.wbt,img:P(x).bit,ty:x.t,l:'',s:x.sbt,dash:x.dash,burst:x.burst,ex:(x.dash!==''?`Dash <b>${x.dash}</b> · `:'')+(x.burst!==''?`Burst <b>${x.burst}</b>`:'')}));
  return TT.map(x=>({n:x.b+(x.mc?' · '+mcL(x.mc):''),w:x.wb,img:P(x).blade,ty:x.bty,l:x.l,s:x.sb,ex:''}));
}
function img(p,cls){ return p&&IM[p]?`<div class="pimg ${cls||''}"><img loading="lazy" onerror="this.remove()" src="${IM[p]}" alt=""></div>`:`<div class="pimg ${cls||''}"></div>`; }
function typ(t){ return t?`<span class="tp"><span class="dot" style="background:${TYPE[t]}"></span>${t}</span>`:''; }
const SC={A:'var(--stat-a)',D:'var(--stat-d)',S:'var(--stat-s)'};
function bars(a,mx){ if(!a) return ''; mx=mx||70; return '<div class="sb">'+['A','D','S'].map((k,i)=>`<i><span>${k}</span><u style="--w:${Math.min(100,a[i]/mx*100)}%;--c:${SC[k]}"></u><b>${a[i]}</b></i>`).join('')+'</div>'; }
const sum3=(...L)=>{ const v=L.filter(Boolean); return v.length?[0,1,2].map(i=>Math.round(v.reduce((s,a)=>s+a[i],0)*10)/10):null; };
const totSt=x=>sum3(x.sb,x.sr,x.sbt);
function card(x){
  const q=PH[x.n]||{}, g=v=>v===''?'—':v+' g';
  const pc=(lab,p,w,t,sa,xt,nm)=>`<div class="pc">${img(p,'xs')}<span>${lab}</span><em class="pnm">${nm?esc(nm):'—'}</em><b>${g(w)}</b>${t?typ(t):(xt||'<span class="tp">&nbsp;</span>')}${bars(sa)}</div>`;
  const T3=totSt(x), ex=[x.dash!==''?`Dash <b>${x.dash}</b>`:'',x.burst!==''?`Burst <b>${x.burst}</b>`:'',T3?`<em class="t3">Total <b>A ${T3[0]} · D ${T3[1]} · S ${T3[2]}</b></em>`:''].filter(Boolean).join('<span></span>');
  return `<details><summary>${img(q.blade)}<div class="rm"><div class="pname">${x.nom?esc(x.nom):x.dn}${x._c?`<span class="qty" data-qb="${x._c}" ${x.q>1?'':'hidden'}>×${x.q}</span>`:''}</div>${x.nom?`<div class="mut pcl">${esc(x.dn)}</div>`:''}<div class="meta"><span class="badge" style="--bc:${LINE_COL[x.l]}">${x.l}</span>${typ(x.t)}<span class="tp">${x.ed==='tt'?'Takara Tomy':'Hasbro'}</span></div>${x.mc?`<div class="meta"><span class="mcb"><i style="background:${MCH[x.mc]||'var(--text)'}"></i>Metal Coat · ${mcL(x.mc)}${x.tg?' · '+x.tg.split(' ')[0]:''}</span></div>`:''}</div><div class="tot">${x.tot}<small>g</small></div></summary><div class="exp">${pc('Blade',q.blade,x.wb,x.bty,x.sb,'',x.b)}${pc('Ratchet',q.ratchet,x.wr,'',x.sr,x.h?`<span class="tp">Hauteur <b>${x.h}</b></span>`:'',x.r)}${pc('Bit',q.bit,x.wbt,x.t,x.sbt,'',x.bt)}${ex?`<div class="ex">${ex}</div>`:''}${x._c?`<div class="eact"><button class="chip dng" onclick="cuDel(this,${x._c})">Supprimer</button><button class="chip" onclick="tpForm(${x._c})">Modifier</button><div class="qst" role="group" aria-label="Exemplaires"><button class="chip sq" onclick="cuQty(${x._c},-1)" aria-label="Moins">−</button><b data-q="${x._c}">${x.q}</b><button class="chip sq" onclick="cuQty(${x._c},1)" aria-label="Plus">+</button></div></div>`:x._k?`<div class="eact"><button class="chip dng" onclick="bsDel(this,'${encodeURIComponent(x._k)}')">Supprimer</button></div>`:''}</div></details>`;
}
function partCard(i){
  const bd=i.l?`<span class="badge" style="--bc:${LINE_COL[i.l]}">${i.l}</span>`:'';
  return `<div class="rw">${img(i.img)}<div class="rm"><div class="pname">${i.n}</div><div class="meta">${bd}${typ(i.ty)}</div>${(i.s||i.ex)?`<div class="stl">${i.s?`A <b>${i.s[0]}</b> · D <b>${i.s[1]}</b> · S <b>${i.s[2]}</b>`:''}${i.s&&i.ex?' · ':''}${i.ex||''}</div>`:''}</div><div class="tot">${i.w}<small>g</small></div></div>`;
}
function group(key,g){ return `<div class="gh">${key==='type'?`<span class="dot" style="background:${TYPE[g]}"></span>`:''}${g}</div>`; }
function collection(key){
  const L=sortList(TF().filter(x=>(!st.mc||x.mc)&&hit(x.n+' '+x.nom+' '+x.l+' '+x.t+' '+x.tg)),key,st.desc,(x,k)=>k==='nom'?(x.nom||x.n):k==='poids'?x.tot:k==='ligne'?LINE_ORDER.indexOf(x.l):k==='type'?TYPE_ORDER.indexOf(x.t):((totSt(x)||[0,0,0])[SI[k]]));
  let last=null,html='';
  for(const x of L){
    if(key==='ligne'||key==='type'){ const g=key==='ligne'?x.l:x.t; if(g!==last){ html+=group(key,g); last=g; } }
    html+=card(x);
  }
  return '<div class="list">'+(html||'<div class="empty">'+(T.length?'Aucun résultat':'Aucune toupie pour l\'instant. Ajoute la première avec le bouton ci-dessus.')+'</div>')+'</div>';
}
function parts(key){
  const L=sortList(partItems().filter(i=>hit(i.n)),key,st.desc,(x,k)=>k==='nom'?x.n:k==='type'?TYPE_ORDER.indexOf(x.ty):k==='haut'?(+x.h||0):k==='dash'?(+x.dash||0):k==='burst'?(+x.burst||0):k in SI?((x.s||[0,0,0])[SI[k]]):num(x.w));
  let last=null,html='';
  for(const i of L){
    if(key==='type'&&i.ty!==last){ html+=group(key,i.ty); last=i.ty; }
    html+=partCard(i);
  }
  return '<div class="list">'+(html||'<div class="empty">'+(T.length?'Aucun résultat':'Aucune toupie pour l\'instant. Ajoute la première avec le bouton ci-dessus.')+'</div>')+'</div>';
}
function renderList(){
  if(st.tab!=='toupies') return;
  const key=curKey();
  document.getElementById('main').innerHTML=st.view==='collection'?collection(key):parts(key);
}
const BD=[[0,0,0],[1,0,0]], BN=['',''];
var BP=null;
function bpOpen(n,k){ BP={n,k,q:''}; let f=document.getElementById('fm'); if(!f){ f=document.createElement('div'); f.id='fm'; document.body.appendChild(f); }
  fmShown(f); bpDraw(); }
function bpDraw(){ const f=document.getElementById('fm'); if(!f||!BP) return; const nm=[LT('Blade'),LT('Ratchet'),LT('Bit')][BP.k];
  f.innerHTML=`<div class="fwrap pkw"><div class="fh"><h2>${nm}</h2><button class="chip sq" onclick="bpClose()" aria-label="Fermer">✕</button></div>
    <label class="search pks">${IC.search}<input id="bp_q" type="search" placeholder="${LT('Chercher…')}" value="${esc(BP.q)}" oninput="bpQ(this.value)" autocomplete="off"></label>
    <div id="bp_l">${bpList()}</div></div>`;
  const e=document.getElementById('bp_q'); if(e&&!BP.q) setTimeout(()=>{ try{ e.focus({preventScroll:true}); }catch(x){} },60); }
function bpQ(v){ BP.q=v; const l=document.getElementById('bp_l'); if(l) l.innerHTML=bpList(); }
function bpClose(){ BP=null; fmClose(); }
function bpList(){
  const L=bdLists(), Ls=[L.bl,L.ra,L.bi][BP.k], no=L.nOwn[BP.k], q=BP.q.trim(), cur=BD[BP.n][BP.k];
  const row=(o,i)=>`<button class="pkr${i===cur?' cur':''}" onclick="bpPick(${i})">${img(o.img,'sm')}<span class="pkn"><b>${esc(o.n)}</b><small>${o.ty?typ(o.ty):''}${o.w?' <i>'+o.w+' g</i>':''}</small></span></button>`;
  const ok=o=>!q||pkOk(o.n,q), a=Ls.map((o,i)=>[o,i]).filter(x=>x[1]<no&&ok(x[0])), c=Ls.map((o,i)=>[o,i]).filter(x=>x[1]>=no&&ok(x[0]));
  let h='';
  if(a.length) h+=(c.length?`<div class="fs">${LT('Ma collection')}</div>`:'')+a.map(x=>row(x[0],x[1])).join('');
  if(c.length) h+=(a.length?`<div class="fs">${LT('Catalogue')}</div>`:'')+c.map(x=>row(x[0],x[1])).join('');
  return h||`<div class="mut note">${LT('Rien trouvé.')}</div>`;
}
var BFL=null;
function bpPick(i){ if(!BP) return; BD[BP.n][BP.k]=i; BFL=[BP.n,BP.k]; bpClose(); draw(); void document.body.offsetHeight; setTimeout(()=>{ BFL=null; document.querySelectorAll('.bsb.bsel').forEach(e=>e.classList.remove('bsel')); },900); }
function bdAsk(n){
  const h=`<div class="fwrap"><div class="fh"><h2>${LT('Nom du build')}</h2><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></div>
  <input class="nm" id="bdq" value="${esc(BN[n]||'')}" placeholder="${LT('Nom du build')}" aria-label="${LT('Nom du build')}" autocomplete="off" maxlength="40" onkeydown="if(event.key==='Enter'){event.preventDefault();bdSave(${n},document.getElementById('bdq_b'));}">
  <div class="mut note bmsg" id="bdq_m"></div>
  <button class="addb cat" id="bdq_b" onclick="bdSave(${n},this)">${LT('Enregistrer dans Mes toupies')}</button></div>`;
  let f=document.getElementById('fm'); if(!f){ f=document.createElement('div'); f.id='fm'; document.body.appendChild(f); }
  f.innerHTML=h; fmShown(f);
  setTimeout(()=>{ const e=document.getElementById('bdq'); if(e) e.focus(); },60);
}
async function bdSave(n,btn){
  const L=bdLists(), B=BD[n], b=L.bl[B[0]], r=b.integ?null:L.ra[B[1]], t=L.bi[B[2]], msg=document.getElementById('bm'+n);
  const say=m=>{ const d=document.getElementById('bdq_m'); const e=d||msg; if(e) e.textContent=m; };
  const qi=document.getElementById('bdq'); if(qi) BN[n]=qi.value;
  const nom=(BN[n]||'').trim();
  if(!nom){ if(qi) qi.focus(); return say(LT('Donne un nom à ton build pour l\'enregistrer.')); }
  if(!b||!t) return say(LT('Il manque une pièce.'));
  const Tb=b.cat?null:T[b.i], Tr=r&&!r.cat?T[r.i]:null, Tt=t.cat?null:T[t.i];
  const o={id:Date.now(),nom,
    blade:b.cat?b.c.n:Tb.b, ligne:b.cat?b.c.l:Tb.l, typeBlade:b.cat?b.c.bt:Tb.bty,
    typeToupie:(Tt&&Tt.t)||(t.cat&&t.ty)||(b.cat?b.tt:Tb.t), edition:b.cat?b.c.e:Tb.ed,
    ratchet:r?(r.cat?r.c.n:Tr.r):'', bit:t.cat?t.c.n:Tt.bt,
    poidsBlade:b.cat?b.c.w:Tb.wb, poidsRatchet:r?(r.cat?r.c.w:Tr.wr):'', poidsBit:t.cat?t.c.w:Tt.wbt};
  if(r){ const h=r.cat?r.c.h:(Tr.h||hNom(Tr.r)); const hh=h||hNom(o.ratchet); if(hh) o.hauteurRatchet=+hh; }
  if(Tt){ if(Tt.dash!=='') o.dashBit=+Tt.dash; if(Tt.burst!=='') o.burstBit=+Tt.burst; if(Tt.sbt) o.statsBit=Tt.sbt; }
  if(Tb&&Tb.sb) o.statsBlade=Tb.sb; if(Tr&&Tr.sr) o.statsRatchet=Tr.sr;
  const er=cErr(o); if(er.length) return say(LT(er[0]));
  const nm=nmOf(o), dp=T.find(x=>x.n===nm);
  if(dp) return say(LT('Tu as déjà cette toupie')+' : '+(dp.nom||dp.n)+'.');
  if(btn) btn.disabled=true;
  try{ for(const [f,k] of PHF){ const part=f==='photoBlade'?b:f==='photoRatchet'?r:t, src=f==='photoBlade'?Tb:f==='photoRatchet'?Tr:Tt;
      if(part&&part.cat){ if(part.c.im) o[f]=part.c.im; continue; }
      const pv=src&&src._p&&src._p[k]; if(!pv) continue; o[f]=isMk(pv)?await pStore(o.id,k,IM[pv]):pv; } }catch(e){}
  const all=cLoad(); all.push(o);
  if(!cSave(all)){ if(btn) btn.disabled=false; return say(LT('Pas assez de place pour enregistrer. Retire une photo ou une toupie et réessaie.')); }
  try{ localStorage.setItem('arene_dirty',String(Date.now())); }catch(e){}
  location.reload();
}
function bdLists(){
  const P=x=>PH[x.n]||{};
  const bl=T.map((x,i)=>({i,n:x.b,s:x.sb,w:x.wb,ty:x.bty,img:P(x).blade,integ:!x.r&&!x.sr}));
  const ra=T.map((x,i)=>({x,i})).filter(o=>o.x.r).map(o=>({i:o.i,n:o.x.r,s:o.x.sr,w:o.x.wr,h:o.x.h,img:P(o.x).ratchet}));
  const seen={},bi=[]; T.forEach((x,i)=>{ if(seen[x.bt]) return; seen[x.bt]=1; bi.push({i,n:x.bt,s:x.sbt,w:x.wbt,ty:x.t,dash:x.dash,burst:x.burst,img:P(x).bit}); });
  const nOwn=[bl.length,ra.length,bi.length];
  if(CAT.length){
    const C=cptBuild(), sb={},sr={},si={};
    bl.forEach(o=>sb[o.n]=1); ra.forEach(o=>sr[o.n]=1); bi.forEach(o=>si[o.n]=1);
    Object.values(C.B).sort(cpSort).forEach(c=>{ if(sb[c.n]) return; sb[c.n]=1;
      const integ=!CAT.some(x=>x.b===c.n&&x.e===c.e&&(x.r||x.bo));
      const f=CAT.find(x=>x.b===c.n&&x.e===c.e);
      if(c.im) IM[c.im]=c.im; bl.push({cat:1,c,n:c.n,w:c.w,ty:c.bt,img:c.im,integ,tt:f&&f.t}); });
    Object.values(C.R).sort(cpSort).forEach(c=>{ if(sr[c.n]) return; sr[c.n]=1; if(c.im) IM[c.im]=c.im; ra.push({cat:1,c,n:c.n,w:c.w,h:c.h,img:c.im}); });
    Object.values(C.I).sort(cpSort).forEach(c=>{ if(si[c.n]) return; si[c.n]=1; const f=CAT.find(x=>x.bi===c.n); if(c.im) IM[c.im]=c.im; bi.push({cat:1,c,n:c.n,w:c.w,ty:f&&f.t,dash:'',burst:'',img:c.im}); });
  }
  return {bl,ra,bi,nOwn};
}
function bdOne(n,L){
  const {bl,ra,bi}=L, B=BD[n];
  B[0]=Math.min(B[0],bl.length-1); B[1]=Math.min(B[1],ra.length-1); B[2]=Math.min(B[2],bi.length-1);
  const b=bl[B[0]], integ=b.integ, r=integ?null:ra[B[1]], t=bi[B[2]];
  const slot=(lab,o,k,dis)=>`<div class="bslot"><span class="sl">${lab}</span><button class="bsb${BFL&&BFL[0]===n&&BFL[1]===k?' bsel':''}" ${dis?'disabled':''} onclick="bpOpen(${n},${k})" aria-label="${lab} : ${o?esc(o.n):''}">${o?img(o.img,'sm'):'<div class="pimg sm"></div>'}<b>${dis?LT('Intégré'):esc(o.n)}</b></button></div>`;
  const parts=[b,r,t].filter(Boolean);
  const S3=sum3(b.s,r&&r.s,t.s);
  const w=Math.round(parts.reduce((a,o)=>a+wnum(o.w),0)*10)/10;
  const own=T.find(x=>x.b===b.n&&(x.r||'')===(r?r.n:'')&&x.bt===t.n);
  const col=n?'var(--pink)':'var(--accent)';
  const html=`<div class="pcard" style="--pc:${col}"><div class="bh"><div class="sl" style="color:${col}">${esc(b.n+' '+(r?r.n:'')+t.n)}</div><span class="bhb"><button class="chip" onclick="qrBuild(${n})">QR</button><button class="chip bsv" onclick="bdAsk(${n})">${LT('Enregistrer')}</button></span></div>
    <div class="bgrid">${slot('Blade',b,0)}${slot('Ratchet',r,1,integ)}${slot('Bit',t,2)}</div>
    <div class="mut note bmsg" id="bm${n}"></div></div>`;
  return {html,nm:b.n,w,S:S3||[0,0,0],h:r&&r.h?+r.h:null,dash:t.dash!==''?+t.dash:null,burst:t.burst!==''?+t.burst:null};
}
function buildUI(){
  const L=bdLists(), a=bdOne(0,L), b=bdOne(1,L);
  const row=(lab,x,y,win,unit)=>{
    if(x===null&&y===null) return '';
    const f=v=>v===null?'—':(Math.round(v*10)/10)+(unit||'');
    const d=(x!==null&&y!==null)?Math.round((y-x)*10)/10:null;
    const ca=win&&d!==null&&d<0?' cw a':win&&d===0?' tie':'', cb=win&&d!==null&&d>0?' cw b':win&&d===0?' tie':'';
    return `<div class="cr"><b class="${ca}">${f(x)}</b><span>${lab}${d?`<small>${d>0?'+':''}${d} pour ${esc(b.nm)}</small>`:''}</span><b class="${cb}">${f(y)}</b></div>`;
  };
  const rows=[row('Poids',a.w,b.w,true,' g'),...(a.S[0]+a.S[1]+a.S[2]+b.S[0]+b.S[1]+b.S[2]>0?[row('Attaque',a.S[0],b.S[0],true),row('Défense',a.S[1],b.S[1],true),row('Stamina',a.S[2],b.S[2],true)]:[]),row('Hauteur',a.h,b.h,false),row('Dash',a.dash,b.dash,true),row('Burst',a.burst,b.burst,true)].join('');
  return a.html+b.html+`<div class="pcard cmp"><div class="sl">Comparatif</div><div class="ch"><span style="color:var(--pa)">${esc(a.nm)}</span><span style="color:var(--pink)">${esc(b.nm)}</span></div>${rows}</div>`
    +`<div class="bfw"><button class="go" onclick="bfAsk()">Lancer un combat : ${esc(a.nm)} contre ${esc(b.nm)}</button><div class="mut note bfl">Attaque, Défense et Stamina n'apparaissent que si tu les as saisies : elles sont au dos des boîtes, à recopier à la main dans la fiche de la toupie (Modifier). <a href="#" onclick="st.view='collection';setTab('toupies');return false">Aller à mes toupies</a></div></div>`;
}
function bfAsk(){
  const L=bdLists(), na=bdOne(0,L).nm, nb=bdOne(1,L).nm;
  const h=`<div class="fwrap"><div class="fh"><h2>Combat : ${esc(na)} contre ${esc(nb)}</h2><button class="chip sq" onclick="fmClose()" aria-label="Fermer">✕</button></div>
  <div class="fs">Premier à</div><div class="chips" id="bfp">${[3,4,5,7,10].map(v=>`<button class="chip ${st.m.target===v?'on':''}" onclick="bfPick(${v})">${v} points</button>`).join('')}</div>
  <div class="fs">Série</div><div class="chips" id="bfb">${[[1,'Match unique'],[3,'BO3'],[5,'BO5'],[7,'BO7']].map(([v,l])=>`<button class="chip ${(st.m.bo||1)===v?'on':''}" onclick="bfBo(${v})">${l}</button>`).join('')}</div>
  <button class="addb cat" onclick="bfGo()">Lancer le combat</button></div>`;
  let f=document.getElementById('fm'); if(!f){ f=document.createElement('div'); f.id='fm'; document.body.appendChild(f); }
  f.innerHTML=h; fmShown(f);
}
function bfPick(v){ st.m.target=v; document.querySelectorAll('#bfp .chip').forEach(b=>b.classList.toggle('on',b.textContent.trim().indexOf(v+' ')===0)); }
function bfBo(v){ st.m.bo=v; document.querySelectorAll('#bfb .chip').forEach((b,i)=>b.classList.toggle('on',[1,3,5,7][i]===v)); }
function bfGo(){ st.m.rounds=0; fmClose(); buildFight(); }
function buildFight(){
  const L=bdLists(), biT=[], seen={}; T.forEach((x,i)=>{ if(seen[x.bt]) return; seen[x.bt]=1; biT.push(i); });
  const slot=n=>{ const B=BD[n], integ=!!(L.bl[B[0]]&&L.bl[B[0]].integ); const r=integ?-1:(RA[B[1]]===undefined?-1:RA[B[1]]); return {mode:'custom',src:'own',stock:0,blade:B[0],ratchet:r,bit:biT[B[2]]===undefined?0:biT[B[2]]}; };
  st.m.mode='simple'; st.m.p[0][0]=slot(0); st.m.p[1][0]=slot(1);
  startMatch();
}
function draw(){
  const h=document.getElementById('h'),sub=document.getElementById('sub'),c=document.getElementById('ctl'),m=document.getElementById('main');
  sub.textContent='';
  document.body.classList.toggle('ishome',st.tab==='home'); document.documentElement.classList.toggle('hmp',st.tab==='home');
  if(st.tab!=='home'&&HM.iv){ clearInterval(HM.iv); HM.iv=0; }
  if(st.tab==='home'){
    c.innerHTML=''; m.innerHTML=homeUI(); homeStart();
  }else if(st.tab==='build'){
    h.textContent='Build'; sub.textContent='Compose deux builds et compare-les';
    c.innerHTML=''; m.innerHTML=T.length?buildUI():emptyUI();
  }else if(st.tab==='amis'){
    h.textContent=LT('Amis'); sub.textContent=LT('Ajoute des potes et compare vos stats');
    c.innerHTML=''; m.innerHTML=friendsPage();
  }else if(st.tab==='profil'){
    h.textContent='Profil'; sub.textContent='Ton nom, ton avatar et tes stats';
    c.innerHTML=''; m.innerHTML='<div class="ops">'+pfUI()+'</div>';
  }else if(st.tab==='opts'){
    h.textContent='Options'; sub.textContent='Thème, fond et sauvegarde';
    c.innerHTML=''; m.innerHTML=optsUI();
  }else if(st.tab==='match'){
    h.textContent='Match'; sub.textContent='Choisis deux toupies et lance le combat';
    c.innerHTML=''; m.innerHTML=T.length?matchUI():emptyUI();
  }else{
    const col=st.view==='collection', TT=TF(), nR=TT.filter(x=>x.r).length;
    h.textContent=col?'Mes toupies':'Mes pièces';
    const frame='<div class="frame">'+[['collection','Collection',TT.length],['parts','Parts',TT.length*2+nR]].map(([k,l,n])=>`<button class="${st.view===k?'on':''}" onclick="setView('${k}')"><span>${l}</span><small>${n}</small></button>`).join('')+'</div>';
    const key=curKey();
    const bar=`<div class="bar"><label class="search">${IC.search}<input id="q" type="search" placeholder="Chercher…" value="${esc(st.q)}" oninput="setQ(this.value)" autocomplete="off"></label><select id="k" aria-label="Trier par" onchange="setKey(this.value)">${keysFor().map(([k,l])=>`<option value="${k}" ${k===key?'selected':''}>${l}</option>`).join('')}</select><button id="fl" class="chip fl" onclick="flip()" aria-label="Inverser l’ordre">${flipLbl()}</button></div>`;
    const chips=col?'':'<div class="chips">'+[['blades','Blades',TT.length],['ratchets','Ratchets',nR],['bits','Bits',TT.length]].map(([k,l,n])=>`<button class="chip ${st.cat===k?'on':''}" onclick="setCat('${k}')"><span>${l}</span><small> · ${n}</small></button>`).join('')+'</div>';
    const eds='<div class="chips ed">'+[['all','Tous',T.length],['hasbro','Hasbro',T.filter(x=>x.ed==='hasbro').length],['tt','Takara Tomy',T.filter(x=>x.ed==='tt').length]].map(([k,l,n])=>`<button class="chip ${st.ed===k?'on':''}" onclick="setEd('${k}')"><span>${l}</span><small> · ${n}</small></button>`).join('')+(T.some(x=>x.mc)?`<button class="chip ${st.mc?'on':''}" onclick="setMc()"><span>Metal Coat</span><small> · ${T.filter(x=>x.mc).length}</small></button>`:'')+'</div>';
    c.innerHTML=frame+bar+eds+chips+(col?'<button class="addb" onclick="addOpen()">+ Ajouter une toupie</button>':'');
    renderList();
  }
  document.getElementById('tabs').innerHTML=[['home','Accueil',IC.home],['toupies','Toupies',IC.grid],['build','Build',IC.build],['match','Match',IC.bolt],['opts','Options',IC.opts]].map(([k,l,i])=>`<button class="${st.tab===k?'on':''}" onclick="setTab('${k}')">${i}<span>${l}</span></button>`).join('');
  homeFit();
  a11yPass();
}
const wnum=v=>(typeof v==='string'&&v.includes('-'))?v.split('-').reduce((a,b)=>a+ +b,0)/2:num(v);
const RA=T.map((x,i)=>x.r?i:-1).filter(i=>i>=0);
const mk=()=>({mode:'none'});
