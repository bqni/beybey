/* ===== Fond du site : Grille (CSS) / Hexagones / Particules ===== */
const BGS={actuel:1,hex:1,sparks:1}; let bgMode='actuel',bgRun=0;
function bgPal(){ return document.documentElement.dataset.theme==='futurl'?{a:[214,20,111],b:[18,160,90],g:.07}:{a:[57,255,140],b:[255,45,149],g:.07}; }
const rg=(c,a)=>`rgba(${c[0]},${c[1]},${c[2]},${a})`, rr=(a,b)=>a+Math.random()*(b-a);
const BG={cv:null,w:0,h:0,d:1,t0:0,hex:null,cells:[],sp:[]};
function bgSize(){ const cv=BG.cv,d=Math.min(1.5,devicePixelRatio||1);BG.d=d;BG.w=innerWidth;BG.h=innerHeight;cv.width=Math.round(BG.w*d);cv.height=Math.round(BG.h*d);BG.hex=null;BG.sp=[];BG.cells=[]; }
function bgHexLayer(P){ const S=28,hh=S*Math.sqrt(3),o=document.createElement('canvas');o.width=BG.cv.width;o.height=BG.cv.height;const c=o.getContext('2d');c.scale(BG.d,BG.d);c.strokeStyle=rg(P.a,P.g);c.lineWidth=1;BG.pts=[];
  for(let col=0,x=0;x<BG.w+S*2;col++,x+=S*1.5)for(let y=(col%2)*hh/2;y<BG.h+hh;y+=hh){ BG.pts.push([x,y]);c.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i;c.lineTo(x+S*Math.cos(a),y+S*Math.sin(a));}c.closePath();c.stroke(); }
  BG.hexS=S;BG.hex=o;BG.hexTheme=document.documentElement.dataset.theme; }
function bgFrame(t,id){
  if(id!==bgRun) return; requestAnimationFrame(tt=>bgFrame(tt,id));
  if(document.hidden||!BG.cv) return;
  if(t-(BG.last||0)<32) return; BG.last=t; const fm=document.getElementById('fm'); if(fm&&fm.classList.contains('show')) return;
  const c=BG.cv.getContext('2d'),P=bgPal(); c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,BG.cv.width,BG.cv.height); c.setTransform(BG.d,0,0,BG.d,0,0);
  if(bgMode==='hex'){
    if(!BG.hex||BG.hexTheme!==document.documentElement.dataset.theme) bgHexLayer(P);
    c.drawImage(BG.hex,0,0,BG.w,BG.h);
    if(!BG.cells.length) for(let i=0;i<10;i++) BG.cells.push({p:BG.pts[Math.floor(rr(0,BG.pts.length))],ph:rr(0,6),sp:rr(.5,1.1),k:i%3===0});
    const S=BG.hexS;
    BG.cells.forEach(e=>{ const a=Math.max(0,Math.sin(t/1000*e.sp+e.ph)); if(a<=0){ if(Math.random()<.02) e.p=BG.pts[Math.floor(rr(0,BG.pts.length))]; return; }
      c.beginPath();for(let i=0;i<6;i++){const an=Math.PI/3*i;c.lineTo(e.p[0]+S*Math.cos(an),e.p[1]+S*Math.sin(an));}c.closePath();
      c.fillStyle=rg(e.k?P.b:P.a,a*.18);c.fill();c.strokeStyle=rg(e.k?P.b:P.a,a*.5);c.lineWidth=1;c.stroke(); });
  } else if(bgMode==='sparks'){
    const dt=Math.min(.05,(t-(BG.t0||t))/1000);BG.t0=t;
    if(!BG.sp.length) for(let i=0;i<70;i++) BG.sp.push({x:rr(0,BG.w),y:rr(0,BG.h),r:rr(.9,2.6),v:rr(22,70),k:i%4===0,ph:rr(0,6),dr:rr(8,22),f:rr(.4,1)});
    BG.sp.forEach(p=>{ p.y-=p.v*dt; p.x+=Math.sin(t/1000*p.f+p.ph)*p.dr*dt;
      if(p.y<-10){ p.y=BG.h+10; p.x=rr(0,BG.w); }
      const a=.3+.6*Math.abs(Math.sin(t/800*p.f+p.ph)),col=p.k?P.b:P.a;
      c.fillStyle=rg(col,a);c.shadowColor=rg(col,.9);c.shadowBlur=10;c.beginPath();c.arc(p.x,p.y,p.r,0,7);c.fill(); });
    c.shadowBlur=0;
  }
}
function setBg(m){ if(!BGS[m]) m='actuel'; bgMode=m; document.documentElement.dataset.bg=m; try{ localStorage.setItem('arene_bg',m); }catch(e){}
    bgRun++; BG.t0=0; BG.sp=[]; BG.cells=[]; if(m!=='actuel'){ BG.cv=document.getElementById('bgc'); bgSize(); requestAnimationFrame(t=>bgFrame(t,bgRun)); } }
addEventListener('resize',()=>{ if(bgMode!=='actuel') bgSize(); });
{ let m='actuel'; try{ m=localStorage.getItem('arene_bg')||'actuel'; }catch(e){} setBg(m); }
/* Les toupies viennent de data.js */
function fatal(titre,lignes){
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  document.body.innerHTML='<div style="padding:24px;font:16px/1.5 system-ui,sans-serif;color:#E5E7EB;background:#111318;min-height:100vh"><h2 style="color:#E58FB4;margin:0 0 12px">'+esc(titre)+'</h2>'+lignes.map(l=>'<p>'+esc(l)+'</p>').join('')+'</div>';
  throw new Error(titre);
}
const CKEY='arene_custom';
