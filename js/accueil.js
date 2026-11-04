/* ===== Accueil : arène animée + raccourcis ===== */
const HM={on:0,iv:0,phase:'fight',tNext:0,hist:[],wins:[]};
const HME=[['Spin',3],['Over',3],['Burst',2],['Xtreme',2],['nul',1]], HMT=['Attack','Déf','Stamina','Balance'];
const hmWp=l=>{ let n=l.reduce((s,e)=>s+e[1],0)*Math.random(); for(const e of l){ if((n-=e[1])<0) return e[0]; } return l[0][0]; };
function homeRound(){
  ST.hp=[0,1].map(()=>({ty:HMT[Math.floor(Math.random()*4)],w:rnd(28,48)}));
  stInit('battle'); ST.fid=-1; HM.phase='fight'; HM.tNext=performance.now()+rnd(3000,8500); }
function homeTick(){
  if(st.tab!=='home'||G||!document.getElementById('hstg')) return;
  const now=performance.now(); if(now<HM.tNext) return;
  if(HM.phase==='fight'){
    let k,n=0; do{ k=hmWp(HME); }while(HM.hist.slice(-2).includes(k)&&++n<8); HM.hist.push(k);
    const ra=ST.hp[0].w/(ST.hp[0].w+ST.hp[1].w); let w=Math.random()<ra?0:1;
    if(HM.wins.length>=2&&HM.wins[HM.wins.length-1]===w&&HM.wins[HM.wins.length-2]===w) w=1-w; HM.wins.push(w);
    stFinish({p:k==='nul'?-1:w,k}); HM.phase='after'; HM.tNext=now+(k==='Spin'||k==='nul'?5200:3600);
  } else homeRound(); }
function homeFit(){
  if(st.tab!=='home') return; const c=document.getElementById('hstg'), t=document.getElementById('tabs'); if(!c||!t) return;
  const land=matchMedia('(orientation:landscape) and (max-height:520px)').matches, ref=document.querySelector(land?'.hm-go':'.hm-grid'); if(!ref) return;
  const maxW=land?Math.min(380,(window.visualViewport?visualViewport.height:innerHeight)):Math.min(380,c.parentElement.clientWidth||380), base=land?100:maxW; c.style.width=base+'px';
  const slack=t.getBoundingClientRect().top-ref.getBoundingClientRect().bottom-(land?8:14);
  c.style.width=Math.max(land?100:220,Math.min(maxW,Math.floor(base+slack)))+'px';
}
let hfT=[]; function homeFitLater(){ hfT.forEach(clearTimeout); hfT=[0,120,350,800].map(d=>setTimeout(()=>{ if(st.tab==='home') homeFit(); },d)); }
addEventListener('resize',homeFitLater); addEventListener('orientationchange',homeFitLater); addEventListener('pageshow',homeFitLater);
if(window.visualViewport) visualViewport.addEventListener('resize',homeFitLater);
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>homeFit());
function homeStart(){ if(!HM.iv) HM.iv=setInterval(homeTick,120); homeRound(); ST.loop=++stId; ST.last=performance.now(); const id=ST.loop; requestAnimationFrame(()=>stLoop(id)); }
const IC_SUN=sv('<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>');
const IC_MOON=sv('<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z"/>');
function homeTheme(){ setTheme(document.documentElement.dataset.theme==='futurl'?'futur':'futurl'); draw(); }
function homeGo(k){
  if(k==='toupies'){ st.view='collection'; setTab('toupies'); }
  else if(k==='hist') histAll('all');
  else if(k==='fr') setTab('amis');
  else if(k==='pf') setTab('profil');
  else setTab(k); }
function hmMe(){
  const S=pfStats(), p=S.n?Math.round(100*S.w/S.n):0, C=2*Math.PI*20.5, nm=(PRF.n||'').trim();
  return `<button class="hm-me" onclick="homeGo('pf')" aria-label="${esc(nm||LT('Profil'))}"><span class="hm-av"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="20.5" fill="none" stroke="var(--frame)" stroke-width="2"/><circle cx="22" cy="22" r="20.5" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="${C*p/100} ${C}" transform="rotate(-90 22 22)"/></svg><i>${PRF.av?'<img src="'+avSrc(PRF.av)+'" alt="">':esc((nm[0]||'?').toUpperCase())}</i>${S.n?'<em>'+p+'%</em>':''}</span><span class="hm-nm">${esc(nm||LT('Profil'))}</span><span class="hm-w"><small>V :</small><b>${String(S.w).padStart(2,'0')}</b></span></button>`;
}
function homeUI(){
  const nT=T.length, nH=hLoad().length, nF=Object.keys(fLoad()).length, dark=(document.documentElement.dataset.theme||'futur')!=='futurl';
  const b=(k,l,s)=>`<button class="hmb" onclick="homeGo('${k}')"><span>${l}</span><small>${s}</small></button>`;
  return `<div class="hmx"><div class="hm-top">${hmMe()}<div class="hm-r"><button class="hm-ic" onclick="homeTheme()" aria-label="${dark?'Passer en thème clair':'Passer en thème sombre'}">${dark?IC_MOON:IC_SUN}</button></div></div>
    <div class="hm-logo" role="heading" aria-level="1">BEYBEY</div>
    <div class="hm-arena"><canvas id="hstg" aria-hidden="true"></canvas></div>
    <button class="go hm-go" onclick="setTab('match')">MATCH</button>
    <div class="hm-grid"><div class="hm-cl">${b('toupies','Collection',nT+' toupies')}${b('build','Build','assembler')}${b('hist','Historique',nH+' matchs')}</div><div class="hm-cr">${b('pf','Profil',esc(PRF.n||'—'))}${b('fr','Amis',nF+(nF>1?' amis':' ami'))}${b('opts','Options','sauvegarde')}</div></div></div>`;
}

/* ===== Bienvenue (premier lancement) ===== */
const WKEY='arene_welcome';
function wlDone(){ try{ localStorage.setItem(WKEY,'1'); }catch(e){} const e=document.getElementById('wlc'); if(e) e.remove(); draw(); }
function wlGo(){ const v=document.getElementById('wln').value; if(v.trim()) pfSet(v); wlDone(); }
function wlImp(inp){ try{ localStorage.setItem(WKEY,'1'); }catch(e){} backupImport(inp,()=>location.reload()); }
function wlInit(){
  let seen=true; try{ const L=localStorage; seen=L.getItem(WKEY)!==null; if(!seen&&(PRF.n||L.getItem('arene_hist')||L.getItem('arene_custom')||L.getItem('arene_amis'))){ L.setItem(WKEY,'1'); seen=true; } }catch(e){}
  if(seen) return;
  const d=document.createElement('div'); d.id='wlc'; d.className='wlc'; d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true'); d.setAttribute('aria-label',LT('Bienvenue !'));
  d.innerHTML='<div><h2>'+LT('Bienvenue !')+'</h2><input class="nm" id="wln" maxlength="16" placeholder="'+LT('Ton nom')+'" autofocus autocomplete="off" onkeydown="if(event.key===\'Enter\')wlGo()" aria-label="'+LT('Ton nom')+'"><button class="go" onclick="wlGo()">'+LT('Commencer')+'</button><label class="lnk" style="display:flex;align-items:center;justify-content:center"><input type="file" accept=".json,application/json" hidden onchange="wlImp(this)">'+LT('Importer ma sauvegarde')+'</label><div class="mut note" id="bkmsg"></div></div>';
  document.body.appendChild(d);
}
wlInit();

draw();

/* ===== Rappel de sauvegarde après un ajout ===== */
function rmShow(msg){ if(document.getElementById('rm')) return; const e=document.createElement('div'); e.id='rm'; e.setAttribute('role','status');
  e.innerHTML='<div>'+(msg||'<b>Toupie enregistrée.</b> Pense à faire une sauvegarde : Options, puis Exporter. Sans ça, tu peux tout perdre si le navigateur nettoie ses données.')+'</div><div class="fact"><button class="go sm" onclick="rmClose();setTab(\'opts\')">Aller à la sauvegarde</button><button class="chip" onclick="rmClose()">Plus tard</button></div>'; document.body.appendChild(e); }
function rmClose(){ const e=document.getElementById('rm'); if(e) e.remove(); }
try{ const lb=+localStorage.getItem('arene_lastbk')||0, sh=+localStorage.getItem('arene_bkrem')||0, now=Date.now();
  if(lb&&now-lb>30*864e5&&now-sh>3*864e5&&(CUSTOM.length||hLoad().length)){ localStorage.setItem('arene_bkrem',String(now)); setTimeout(()=>rmShow('<b>Ça fait plus de 30 jours</b> que tu n\'as pas sauvegardé. Fais un export dans Options pour ne rien perdre.'),1200); } }catch(e){}
// Rappel après un ajout : "arene_dirty" note l'heure du DERNIER ajout non sauvegardé (il survit à la fermeture de l'appli).
// Le rappel arrive 90 s après cet ajout ; si l'appli a été fermée avant, il vient dès la réouverture.
// Il disparaît dès qu'une sauvegarde est faite, et il n'est montré qu'une fois toutes les 6 h au plus.
try{ const t0=+localStorage.getItem('arene_dirty')||0; if(t0){ setTimeout(()=>{ try{
    if(+localStorage.getItem('arene_dirty')!==t0) return;
    const now=Date.now(), lb=+localStorage.getItem('arene_lastbk')||0, la=+localStorage.getItem('arene_bkadd')||0;
    if(lb>=t0||now-la<216e5){ localStorage.removeItem('arene_dirty'); return; }
    localStorage.removeItem('arene_dirty'); localStorage.setItem('arene_bkadd',String(now)); rmShow(); }catch(e){} },Math.max(1200,t0+90000-Date.now())); } }catch(e){}
['gesturestart','gesturechange','gestureend'].forEach(g=>document.addEventListener(g,e=>e.preventDefault()));
const PBOOT=photosBoot().catch(()=>{});
function updShow(){ const o=document.getElementById('rm'); if(o) o.remove(); const e=document.createElement('div'); e.id='rm'; e.setAttribute('role','status');
  e.innerHTML='<div><b>Nouvelle version disponible.</b> Recharge pour en profiter. Tes données ne sont pas touchées.</div><div class="fact"><button class="go sm" onclick="location.reload()">Recharger</button><button class="chip" onclick="rmClose()">Plus tard</button></div>'; document.body.appendChild(e); }
try{ if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
  // Bandeau « nouvelle version » : seulement si une version était déjà active quand la mise à jour a été trouvée (pas à la toute première installation).
  let upd=false; navigator.serviceWorker.addEventListener('controllerchange',()=>{ if(upd) updShow(); });
  addEventListener('load',()=>navigator.serviceWorker.register('sw.js').then(reg=>{
    reg.addEventListener('updatefound',()=>{ if(navigator.serviceWorker.controller) upd=true; });
    document.addEventListener('visibilitychange',()=>{ if(!document.hidden) reg.update().catch(()=>{}); }); }).catch(()=>{})); } }catch(e){}
// iPhone : après le clavier (noms des joueurs, recherche…), la barre du bas pouvait rester coincée au milieu de l'écran.
// Quand plus aucun champ n'est actif et que la vue est décalée, on remet la page d'aplomb.
try{ const vv=window.visualViewport; let tm; const fixVp=()=>{ clearTimeout(tm); tm=setTimeout(()=>{
    const a=document.activeElement; if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
    if(vv&&(Math.abs(vv.height-innerHeight)>1||vv.offsetTop>1||vv.pageTop>scrollY+1)){ scrollTo(scrollX,scrollY); const tb=document.getElementById('tabs'); if(tb){ tb.style.display='none'; void tb.offsetHeight; tb.style.display=''; } } },150); };
  if(vv){ vv.addEventListener('resize',fixVp); vv.addEventListener('scroll',fixVp); }
  document.addEventListener('focusout',fixVp); addEventListener('orientationchange',fixVp); addEventListener('pageshow',fixVp);
}catch(e){}
