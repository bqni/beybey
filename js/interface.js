/* ===== État de l'interface, icônes et tri ===== */
const SI={att:0,def:1,end:2};
let EDV='all'; try{ const e=localStorage.getItem('arene_ed'); if(e==='hasbro'||e==='tt') EDV=e; }catch(e){}
const st={tab:'home',view:'collection',cat:'blades',ed:EDV,key:'nom',desc:false,q:'',a:0,b:1,son:true,voix:false};
try{ if(localStorage.getItem('arene_son')==='0') st.son=false; }catch(e){}
function zoomSet(v){ try{ localStorage.setItem('arene_zoom',v?'1':'0'); }catch(e){} document.querySelector('meta[name=viewport]').content=v?'width=device-width, initial-scale=1, viewport-fit=cover':'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'; draw(); }
function zoomOn(){ try{ return localStorage.getItem('arene_zoom')==='1'; }catch(e){ return false; } }
function sonSet(v){ st.son=!!v; try{ localStorage.setItem('arene_son',v?'1':'0'); }catch(e){} draw(); }
let AC=null,run=0;
const sv=(p)=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const IC={home:sv('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h4.5v-5.5h4V20h4.5V10"/>'),grid:sv('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
  build:sv('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>'),
  bolt:sv('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
  opts:sv('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>'),
  search:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>'};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const hit=(s)=>!st.q||s.toLowerCase().includes(st.q.trim().toLowerCase());

function sortList(list,key,desc,val){
  const d=desc?-1:1;
  return [...list].sort((x,y)=>{
    const a=val(x,key),b=val(y,key);
    const c=typeof a==='string'?a.localeCompare(b,'fr'):a-b;
    return c?d*c:x.n.localeCompare(y.n,'fr');
  });
}
function keysFor(){
  const S=[['att','Attaque'],['def','Défense'],['end','Stamina']];
  if(st.view==='collection') return [['nom','Nom'],['poids','Poids'],['ligne','Ligne'],['type','Type'],...S];
  return st.cat==='ratchets'?[['nom','Nom'],['poids','Poids'],['haut','Hauteur'],...S]:st.cat==='bits'?[['nom','Nom'],['poids','Poids'],['type','Type'],['dash','Dash'],['burst','Burst'],...S]:[['nom','Nom'],['poids','Poids'],['type','Type'],...S];
}
function curKey(){ return keysFor().some(a=>a[0]===st.key)?st.key:'nom'; }
function flipLbl(){ const t=['nom','ligne','type'].includes(curKey()); return st.desc?(t?'Z→A':'9→1'):(t?'A→Z':'1→9'); }
function setKey(k){ st.key=k; st.desc=DEF_DESC[k]; const f=document.getElementById('fl'); if(f) f.textContent=flipLbl(); renderList(); }
function flip(){ st.desc=!st.desc; draw(); }
function setView(v){ st.view=v; draw(); }
function setCat(c){ st.cat=c; draw(); }
function setMc(){ st.mc=!st.mc; draw(); }
function setEd(e){ st.ed=e; try{ localStorage.setItem('arene_ed',e); }catch(x){} draw(); }
const TF=()=>st.ed==='all'?T:T.filter(x=>x.ed===st.ed);
function setQ(v){ st.q=v; renderList(); }
/* ===== Options : notice, thème, fond, son ===== */
const NOTICE=[
 ['Installer l\'appli (iPhone et Android)','<p><b>iPhone</b> : ouvre le site dans <b>Safari</b>, touche le bouton Partager, puis <b>Sur l\'écran d\'accueil</b>.</p><p><b>Android</b> : ouvre le site dans <b>Chrome</b>, touche le menu (les 3 points), puis <b>Installer l\'application</b> ou <b>Ajouter à l\'écran d\'accueil</b>.</p><p>L\'icône s\'ouvre ensuite en plein écran, comme une vraie appli. Si l\'ancien nom ou l\'ancienne icône reste affiché après une mise à jour, supprime le raccourci et rajoute-le. Joue toujours depuis l\'icône : le navigateur et l\'icône ne partagent pas leurs données.</p>'],
 ['Ajouter une toupie','<p>Onglet <b>Toupies</b>, bouton <b>+ Ajouter une toupie</b>.</p><ul><li>Remplis la ligne (BX, UX ou CX), les types, les noms et les poids en grammes.</li><li>Pas de ratchet (ratchet intégré à la blade) : laisse la partie Ratchet vide.</li><li>Les stats sont au dos de la boîte : chaque pièce (blade, ratchet, bit) a 3 barres Attack, Defense et Stamina avec un chiffre à côté. Recopie-les dans Att, Déf et End, les 3 ou aucun. Le ratchet a aussi une Height, le bit un Dash et un Burst.</li><li><b>Après chaque ajout (ou modification), pense à sauvegarder</b> : Options, puis Exporter. Tes toupies et tes photos sont gardées dans le navigateur, elles peuvent disparaître s\'il nettoie ses données.</li><li>3 photos : une pour la blade (elle sert aussi pour la toupie), une pour le ratchet, une pour le bit. Après le choix de la photo, tu la déplaces et la zoomes pour la centrer (bouton Recadrer pour la reprendre ensuite). Elle est ensuite allégée toute seule.</li></ul><p>Pour changer ou supprimer une toupie ajoutée, ouvre sa fiche et touche <b>Modifier</b>.</p>'],
 ['Sauvegarde et autre appareil','<p>Tes toupies ajoutées, ton historique et tes réglages sont gardés <b>uniquement sur cet appareil</b>. Sur iPhone, Safari et l\'icône de l\'écran d\'accueil ne partagent rien : joue toujours depuis l\'icône.</p><ul><li><b>Exporter</b> crée un fichier de sauvegarde (sur iPhone : « Enregistrer dans Fichiers »).</li><li><b>Importer</b> ajoute le contenu d\'un fichier à ce que tu as déjà, sans rien écraser.</li></ul><p>Pense à exporter de temps en temps, surtout avant de vider les données du navigateur.</p>'],
 ['Match et historique','<ul><li><b>Match simple</b> : une toupie par joueur.</li><li><b>Match 3v3</b> : trois toupies par joueur, une par round, chacune une seule fois.</li><li><b>Tournoi</b> : arrive plus tard.</li><li>Points : Spin Finish 1, Over Finish 2, Burst Finish 2, Xtreme Finish 3. Premier à 4 par défaut.</li><li>La croix ✕ quitte le match en cours (avec confirmation). Un match quitté n\'est pas enregistré.</li></ul><p>L\'historique des matchs terminés apparaît sous le bouton Lancer le match, séparé par catégorie. Annuler le dernier point d\'un match fini le retire de l\'historique.</p>'],
 ['Build et comparatif','<p>Compose deux builds (blade, ratchet, bit) et compare-les. Sur chaque ligne, le gagnant prend la couleur de son camp : vert pour A, rose pour B. Les égalités sont grisées. Pour le poids, la toupie la plus lourde gagne.</p>']
];
function ntToggle(i){ const e=document.getElementById('nt'+i); if(!e) return; const o=e.classList.toggle('open'); e.querySelector('.nth').setAttribute('aria-expanded',o); }
function noticeUI(){ return '<div class="optl">Notice</div><div class="nts">'+NOTICE.map(([t,b],i)=>`<div class="ntc" id="nt${i}"><button class="nth" onclick="ntToggle(${i})" aria-expanded="false"><span>${t}</span><i aria-hidden="true">+</i></button><div class="ntb">${b}</div></div>`).join('')+'</div>'; }
function optSet(k,v){ if(k==='lang'){ setLang(v); return; } if(k==='theme') setTheme(v); else setBg(v); draw(); }
function optsUI(){
  const th=document.documentElement.dataset.theme||'futur';
  const seg=(k,list,cur,f3)=>'<div class="frame'+(f3?' f3':'')+'">'+list.map(([v,l])=>`<button class="${cur===v?'on':''}" onclick="optSet('${k}','${v}')"><span>${l}</span></button>`).join('')+'</div>';
  const thS='<div class="frame thi">'+[['futur','Sombre',IC_MOON],['futurl','Clair',IC_SUN]].map(([v,l,i])=>`<button class="${th===v?'on':''}" onclick="optSet('theme','${v}')" aria-label="${l}" title="${l}"><span>${i}</span></button>`).join('')+'</div>';
  const son='<div class="frame"><button class="'+(st.son?'on':'')+'" onclick="sonSet(1)"><span>Activé</span></button><button class="'+(st.son?'':'on')+'" onclick="sonSet(0)"><span>Désactivé</span></button></div>';
  const bgS='<select class="bgsel" onchange="optSet(\'bg\',this.value)" aria-label="Fond d\'écran">'+[['actuel','Grille'],['hex','Hexagones'],['sparks','Particules']].map(([v,l])=>'<option value="'+v+'"'+(bgMode===v?' selected':'')+'>'+l+'</option>').join('')+'</select>';
  return '<div class="ops"><div class="optl">Mes données</div><div class="frame bkf"><button onclick="backupExport()"><span>Exporter</span></button><button onclick="document.getElementById(\'imp\').click()"><span>Importer</span></button></div><input type="file" id="imp" accept="application/json,.json" hidden onchange="backupImport(this)"><div class="mut note" id="bkmsg" aria-live="polite">'+CUSTOM.length+' toupie'+(CUSTOM.length>1?'s':'')+' ajoutée'+(CUSTOM.length>1?'s':'')+' · '+hLoad().length+' match'+(hLoad().length>1?'s':'')+' dans l\'historique. Exporte pour sauvegarder ou changer d\'appareil.</div><div class="op2"><div><div class="optl">Langue</div>'+seg('lang',[['fr','Français'],['en','English']],LANG,false)+'</div><div><div class="optl">Son</div>'+son+'</div></div><div class="op2"><div><div class="optl">Fond d\'écran</div>'+bgS+'</div><div><div class="optl">Thème</div>'+thS+'</div></div><div class="mut note">Les réglages et les données sont gardés sur cet appareil.</div>'+(HID.length?'<div class="optl">Toupies de base</div><div class="frame"><button onclick="bsRestore()"><span>Remettre les toupies de base</span><small>'+HID.length+'</small></button></div>':'')+'<div class="mut note">Beybey 1.0 · Catalogue des toupies : Beydex (données et images de la communauté, github.com/catgamer109/Beydex-Public-Resources). Mesures (diamètres, bits) : Beyblade X Viewer (beyblade.phstudy.org) et 競技玩具研究所 (kyoganken.web.fc2.com), avec leur accord. Projet de fan, non affilié à Takara Tomy ni à Hasbro.</div>'+'<div class="mut note"><a href="CREDITS.txt" target="_blank" rel="noopener">Crédits et licences</a></div>'+'<div class="zmo"><span class="mut">Zoom de la page (pincer pour agrandir)</span><span class="zmb"><button class="'+(zoomOn()?'':'on')+'" onclick="zoomSet(0)" aria-pressed="'+(!zoomOn())+'">Bloqué</button><button class="'+(zoomOn()?'on':'')+'" onclick="zoomSet(1)" aria-pressed="'+zoomOn()+'">Autorisé</button></span></div>'+noticeUI()+'</div>';
}
/* ===== Accessibilité : fenêtres, Échap, états des boutons ===== */
let FMO=null;
function fmShown(f){
  if(!f.classList.contains('show')) FMO=document.activeElement&&document.activeElement!==document.body?document.activeElement:null;
  f.setAttribute('role','dialog'); f.setAttribute('aria-modal','true'); f.setAttribute('aria-label','Fenêtre');
  const wt=!!f.querySelector('.hall'), tb=document.getElementById('tabs'); f.classList.toggle('wtabs',wt); document.body.classList.toggle('fmt',wt); f.style.bottom=wt&&tb?tb.offsetHeight+'px':''; f.setAttribute('aria-modal',wt?'false':'true');
  f.classList.add('show'); f.scrollTop=0; document.documentElement.style.overflow='hidden'; a11yPass(f);
}
function a11yPass(root){
  (root||document).querySelectorAll('.frame button,.chips .chip').forEach(b=>{ if(b.hasAttribute('onclick')) b.setAttribute('aria-pressed',b.classList.contains('on')?'true':'false'); });
  const t=document.getElementById('tabs'); if(t&&!root) t.querySelectorAll('button').forEach(b=>{ if(b.classList.contains('on')) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
}
addEventListener('keydown',e=>{ if(e.key!=='Escape') return; if(document.getElementById('cr')||(typeof csOpen!=='undefined'&&csOpen)) return; const f=document.getElementById('fm'); if(f&&f.classList.contains('show')){ e.preventDefault(); fmClose(); } });
