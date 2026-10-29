// Demo rates in Tunisian dinars (TND). 1 USDT = 3.5 TND. Replace BTC with a real price API.
const RATES = { TND:1, D17:1, BTC:235375, USDT:3.5 };
const products = [
  {id:1,cat:'Laptops',name:'Aero 14 Ultra',specs:'14" OLED · 32 GB RAM · 1 TB SSD',tnd:5250,old:5790,c:['#00E5FF','#7B00FF'],t:'l'},
  {id:2,cat:'Laptops',name:'Forge 16 Pro',specs:'16" 240 Hz · RTX graphics · 32 GB',tnd:7700,c:['#FF36F7','#0066FF'],t:'l'},
  {id:3,cat:'Desktops',name:'Monolith X',specs:'24-core CPU · 64 GB · 2 TB NVMe',tnd:9800,c:['#0066FF','#7B00FF'],t:'d'},
  {id:4,cat:'Desktops',name:'Cube Mini',specs:'Compact · 16 GB · 512 GB SSD',tnd:2600,old:2990,c:['#00E5FF','#0066FF'],t:'m'},
  {id:5,cat:'Workstations',name:'Atlas Render',specs:'Dual GPU · 128 GB · 4 TB RAID',tnd:20600,c:['#7B00FF','#FF36F7'],t:'w'},
  {id:6,cat:'Mining and trading',name:'Ledger Rig 6',specs:'6-monitor trading desk · 64 GB',tnd:11550,old:12900,c:['#FF36F7','#00E5FF'],t:'t'},
  {id:7,cat:'Laptops',name:'Aero Air 13',specs:'13.3" · 16 GB · 512 GB SSD',tnd:3490,old:3900,c:['#00E5FF','#FF36F7'],t:'l'},
  {id:8,cat:'Laptops',name:'Blaze 17 Gaming',specs:'17" 360 Hz · RTX · 32 GB',tnd:10400,old:11500,c:['#FF36F7','#7B00FF'],t:'l'},
  {id:9,cat:'Desktops',name:'Titan Tower',specs:'16-core · 32 GB · 1 TB NVMe',tnd:5600,c:['#0066FF','#00E5FF'],t:'d'},
  {id:10,cat:'Desktops',name:'Pocket Mini M2',specs:'Ultra-compact · 8 GB · 256 GB',tnd:1490,old:1750,c:['#7B00FF','#00E5FF'],t:'m'},
  {id:11,cat:'Workstations',name:'Studio Duo',specs:'Dual Xeon · 256 GB · 8 TB',tnd:28900,c:['#00E5FF','#7B00FF'],t:'w'},
  {id:12,cat:'Mining and trading',name:'Trader Triple',specs:'3 monitors · 32 GB · 1 TB SSD',tnd:6900,c:['#0066FF','#FF36F7'],t:'t'}
];
const icons = {
  l:'<svg viewBox="0 0 64 44"><rect x="10" y="4" width="44" height="28" rx="3"/><path d="M4 38h56"/></svg>',
  d:'<svg viewBox="0 0 64 56"><rect x="6" y="4" width="52" height="34" rx="3"/><path d="M24 50h16M32 38v12"/></svg>'
};
const $ = s => document.querySelector(s);
const fmt = (n,c) => c==='BTC' ? n.toFixed(5)+' BTC' : (c==='USDT' ? n.toLocaleString('en-US',{maximumFractionDigits:2})+' USDT' : n.toLocaleString('en-US',{maximumFractionDigits:0})+' TND');
let cart = [], filter = 'All', payCur = 'TND';

/* ticker with gentle simulated movement */
const live = {BTC:{p:RATES.BTC,ch:1.8}, USDT:{p:3.5,ch:0.0}, ETH:{p:12180,ch:-0.6}};
let built=false;
function drawTicker(){
  if(!built){
    const h = Object.keys(live).map(k=>`<div class="tick"><strong>${k}</strong><span data-p="${k}"></span><span data-c="${k}"></span></div>`).join('')+'<div class="tick" style="color:var(--muted)">Demo prices</div>';
    $('#ticker').innerHTML = '<div class="track">'+h+h+'</div>'; built=true;
  }
  Object.entries(live).forEach(([k,v])=>{
    const t=v.p.toLocaleString('en-US',{maximumFractionDigits:k==='USDT'?2:0})+' TND';
    document.querySelectorAll(`[data-p="${k}"]`).forEach(e=>{if(e.textContent!==t){e.textContent=t;e.classList.remove('flash');void e.offsetWidth;e.classList.add('flash')}});
    document.querySelectorAll(`[data-c="${k}"]`).forEach(e=>{e.textContent=(v.ch>=0?'+':'')+v.ch.toFixed(2)+'%';e.className=v.ch>=0?'up':'down'});
  });
}
function updateBtc(){document.querySelectorAll('[data-tnd]').forEach(e=>e.textContent='≈ '+(e.dataset.tnd/RATES.BTC).toFixed(4)+' BTC')}
setInterval(()=>{
  const b = live.BTC, step = (Math.random()-.5)*210;
  b.p = Math.max(1000,b.p+step); b.ch += step/b.p*100; RATES.BTC = b.p;
  live.ETH.p += (Math.random()-.5)*28; live.ETH.ch += (Math.random()-.5)*.05;
  drawTicker(); updateBtc(); convert(); drawCart();
},4000);

/* products */
function art(p,v=0){
  const [a,b]=v===2?[p.c[1],p.c[0]]:p.c,i=p.id;
  const defs=`<defs><linearGradient id="s${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><linearGradient id="m${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef0fa"/><stop offset="1" stop-color="#7d839c"/></linearGradient></defs>`;
  const fan=(x,y,c)=>`<circle cx="${x}" cy="${y}" r="13" fill="#05060b" stroke="${c}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="4" fill="${c}"/>`;
  const mon=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#0b0c14" stroke="#aab0cc" stroke-width="1.5"/><rect x="${x+3}" y="${y+3}" width="${w-6}" height="${h-6}" rx="2" fill="url(#s${i})"/><path d="M${x+5} ${y+h-9} l${w*.2} -${h*.25} l${w*.2} ${h*.12} l${w*.2} -${h*.3} l${w*.2} ${h*.2}" fill="none" stroke="#fff" stroke-width="1.6" opacity=".85"/>`;
  const shapes={
    l:`<rect x="38" y="12" width="124" height="80" rx="7" fill="#12131c" stroke="#c9cfe6" stroke-width="2"/><rect x="44" y="18" width="112" height="68" rx="3" fill="url(#s${i})"/><path d="M44 70 Q80 50 110 66 T156 58 V86 H44Z" fill="#000" opacity=".35"/><path d="M18 96 H182 L172 110 Q170 114 164 114 H36 Q30 114 28 110Z" fill="url(#m${i})"/><rect x="84" y="97" width="32" height="4" rx="2" fill="#5b6078"/>`,
    d:`<rect x="70" y="6" width="60" height="116" rx="8" fill="#0d0e17" stroke="#9aa1c0" stroke-width="2"/><rect x="76" y="12" width="48" height="104" rx="4" fill="url(#s${i})" opacity=".22"/>${fan(100,36,a)}${fan(100,70,b)}${fan(100,102,a)}`,
    m:`${mon(55,6,90,42)}<rect x="96" y="48" width="8" height="8" fill="#8a90a8"/><rect x="50" y="62" width="100" height="40" rx="10" fill="url(#m${i})"/><rect x="62" y="76" width="30" height="4" rx="2" fill="${a}"/><circle cx="132" cy="78" r="5" fill="${b}"/>`,
    w:`<rect x="40" y="10" width="120" height="108" rx="10" fill="#0d0e17" stroke="#9aa1c0" stroke-width="2"/><rect x="48" y="18" width="104" height="92" rx="5" fill="url(#s${i})" opacity=".2"/>${fan(78,44,a)}${fan(122,44,b)}${fan(78,86,b)}${fan(122,86,a)}`,
    t:`${mon(6,34,58,44)}${mon(70,20,60,58)}${mon(136,34,58,44)}<rect x="96" y="78" width="8" height="14" fill="#8a90a8"/><rect x="78" y="92" width="44" height="6" rx="3" fill="url(#m${i})"/>`
  };
  const badge=p.old?`<span class="badge">-${Math.round((1-p.tnd/p.old)*100)}%</span>`:'';
  return `<svg class="pic" viewBox="${v===1?'45 25 110 75':'0 0 200 130'}" aria-hidden="true">${defs}<g ${v===2?'transform="translate(200,0) scale(-1,1)"':''}>${shapes[p.t]}</g></svg>${badge}`;
}
function drawFilters(){
  const cats = ['All',...new Set(products.map(p=>p.cat))];
  $('#filters').innerHTML = cats.map(c=>`<button class="chip" aria-pressed="${c===filter}" data-c="${c}">${c}</button>`).join('');
}
function drawProducts(){
  const list = products.filter(p=>filter==='All'||p.cat===filter);
  $('#grid').innerHTML = list.map((p,i)=>`
    <article class="card in" data-id="${p.id}" tabindex="0" style="animation-delay:${i*80}ms">
      <div class="art" style="--c1:${p.c[0]}66;--c2:${p.c[1]}88">${art(p)}</div>
      <h3>${p.name}</h3><p class="specs">${p.specs}</p>
      <div class="price"><div><b>${fmt(p.tnd,'TND')}</b>${p.old?`<s class="old">${fmt(p.old,'TND')}</s>`:''}</div>
      <button class="add" data-id="${p.id}">Add to cart</button></div>
    </article>`).join('');
}
$('#filters').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;filter=b.dataset.c;drawFilters();drawProducts()});
$('#grid').addEventListener('click',e=>{
  const b=e.target.closest('.add'); if(!b){const c=e.target.closest('.card'); if(c) openModal(c.dataset.id); return;}
  const p=products.find(x=>x.id==b.dataset.id); cart.push(p); drawCart(); toast(p.name+' added to cart');
  const c=$('#count'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
});

/* cart */
function drawCart(){
  $('#count').textContent = cart.length; $('#d17').hidden = payCur!=='D17';
  $('#items').innerHTML = cart.length ? cart.map((p,i)=>`<div class="item"><div><b>${p.name}</b><br><small style="color:var(--muted)">${fmt(p.tnd/RATES[payCur],payCur)}</small></div><button data-i="${i}" aria-label="Remove ${p.name}">Remove</button></div>`).join('')
    : '<p style="color:var(--muted)">Your cart is empty. Add a computer to get started.</p>';
  $('#pay').innerHTML = ['TND','D17','USDT'].map(c=>`<button data-c="${c}" aria-pressed="${c===payCur}">${c==='TND'?'Card (TND)':c==='D17'?'D17 wallet':c}</button>`).join('');
  $('#total').textContent = fmt(cart.reduce((s,p)=>s+p.tnd,0)/RATES[payCur],payCur);
}
$('#items').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cart.splice(+b.dataset.i,1);drawCart()});
$('#pay').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;payCur=b.dataset.c;drawCart()});
const drawer=$('#drawer');
const setCart = o => {drawer.classList.toggle('open',o);drawer.setAttribute('aria-hidden',!o)};
$('#openCart').onclick=()=>setCart(true); $('#closeCart').onclick=()=>setCart(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape')setCart(false)});
$('#checkout').onclick=()=>{
  if(!cart.length) return toast('Add a computer before checking out');
  toast(payCur==='D17'?'Order received. Send the total with D17 to confirm it.':'Order received. Payment instructions sent by email.'); cart=[]; drawCart(); setCart(false);
};

/* exchange */
let mode='usdt';
function convert(){
  const a=parseFloat($('#amtFrom').value)||0, r=RATES.USDT;
  $('#amtTo').value = mode==='usdt' ? (a*r/0.992).toFixed(2) : (a/r*0.992).toFixed(2);
  $('#rate').textContent=`1 USDT = ${r.toFixed(2)} TND`;
}
function setMode(m){
  const carry=$('#amtTo').value; mode=m;
  $('#dial').setAttribute('aria-checked',m==='tnd');
  $('#cF').textContent=m==='usdt'?'USDT':'TND'; $('#cT').textContent=m==='usdt'?'TND':'USDT';
  $('#dlbl').textContent=m==='usdt'?'You pay':'You receive';
  $('#amtFrom').value=carry||(m==='usdt'?300:1000); convert();
}
$('#dial').onclick=()=>setMode(mode==='usdt'?'tnd':'usdt');
$('#dial').addEventListener('keydown',e=>{if(['Enter',' ','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setMode(mode==='usdt'?'tnd':'usdt')}});
$('#amtFrom').addEventListener('input',convert);
$('#exBtn').onclick=()=>{
  const a=parseFloat($('#amtFrom').value)||0, w=$('#wallet').value.trim();
  if((mode==='usdt'?a:a/RATES.USDT)<20) return toast('The minimum purchase is 20 USDT (70 TND)');
  if(w.length<20) return toast('Enter a valid wallet address');
  toast('Order received. Payment details sent by email.');
};

/* toast */
let tt; function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2600)}

drawTicker(); drawFilters(); drawProducts(); drawCart(); convert();

/* product details and editable description */
let descs={};
try{descs=JSON.parse(localStorage.getItem('voltDesc')||'{}')}catch(e){}
const catDesc={Laptops:'Light enough to carry all day and fast enough for real work. Sharp display, quick storage and a battery built to last through meetings, study and travel.',Desktops:'A dependable machine for the desk. Quiet cooling, room to upgrade and steady performance for work, study and everyday use.',Workstations:'Built for heavy workloads such as 3D rendering, video editing and simulation. Extra cores, large memory and fast storage keep long jobs moving.','Mining and trading':'Made for people who watch the markets. Run several screens at once, keep charts and exchanges open, and stay stable through long sessions.'};
const defDesc=p=>catDesc[p.cat]||'';
let photos={}; try{photos=JSON.parse(localStorage.getItem('voltPhotos')||'{}')}catch(e){}
let idx=0;
const okImg=s=>typeof s==='string'&&s.startsWith('data:image/');
const slides=()=>[0,1,2].map(v=>({t:'svg',v})).concat((photos[cur.id]||[]).filter(okImg).map(s=>({t:'img',s})));
function showSlide(n){
  const s=slides(); idx=(n+s.length)%s.length; const it=s[idx];
  $('#mArt').innerHTML = it.t==='svg' ? art(cur,it.v) : `<img class="ph" src="${it.s}" alt="${cur.name} photo">`;
  $('#mThumbs').innerHTML = s.map((x,j)=>`<button class="th${j===idx?' on':''}" data-j="${j}" aria-label="Image ${j+1}">${x.t==='svg'?['Front','Detail','Side'][x.v]:`<img src="${x.s}" alt="">`}</button>`).join('');
  $('#mDel').hidden = it.t!=='img';
}
function shrink(f){return new Promise(res=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,700/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.75))};im.onerror=()=>res(null);im.src=r.result};r.onerror=()=>res(null);r.readAsDataURL(f)})}
function savePhotos(){try{localStorage.setItem('voltPhotos',JSON.stringify(photos))}catch(e){toast('Photos are shown, but this browser has no room to keep them')}}
$('#mArt').onclick=()=>showSlide(idx+1);
$('#mThumbs').addEventListener('click',e=>{const b=e.target.closest('.th');if(b)showSlide(+b.dataset.j)});
$('#mPhoto').onclick=()=>$('#mFile').click();
$('#mFile').onchange=async e=>{
  for(const f of e.target.files){const u=await shrink(f); if(u)(photos[cur.id]=photos[cur.id]||[]).push(u)}
  e.target.value=''; savePhotos(); showSlide(slides().length-1); toast('Photos added');
};
$('#mDel').onclick=()=>{photos[cur.id].splice(idx-3,1);savePhotos();showSlide(0)};
document.addEventListener('keydown',e=>{if(!modal.classList.contains('open')||e.target.tagName==='TEXTAREA')return;if(e.key==='ArrowRight')showSlide(idx+1);if(e.key==='ArrowLeft')showSlide(idx-1)});
let cur=null, lastFocus=null;
const modal=$('#modal');
function showDesc(){$('#mView').textContent=descs[cur.id]||defDesc(cur)}
function openModal(id){
  cur=products.find(x=>x.id==id); if(!cur) return;
  lastFocus=document.activeElement;
  showSlide(0); $('#mHl').innerHTML=cur.specs.split('·').map(s=>`<li>${s.trim()}</li>`).join('');
  $('#mTitle').textContent=cur.name; $('#mSpecs').textContent=cur.specs;
  $('#mPrice').textContent=fmt(cur.tnd,'TND');
  $('#mBtc').textContent='';
  showDesc(); $('#mView').hidden=false; $('#mDesc').hidden=true; $('#mSave').hidden=true; $('#mEdit').hidden=false;
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  $('#mClose').focus();
}
function closeModal(){
  modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow='';
  if(lastFocus) lastFocus.focus();
}
$('#mClose').onclick=closeModal;
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeModal()});
$('#grid').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.classList.contains('card'))openModal(e.target.dataset.id)});
$('#mEdit').onclick=()=>{
  $('#mDesc').value=descs[cur.id]||''; $('#mView').hidden=true; $('#mDesc').hidden=false;
  $('#mEdit').hidden=true; $('#mSave').hidden=false; $('#mDesc').focus();
};
$('#mSave').onclick=()=>{
  const v=$('#mDesc').value.trim();
  if(v) descs[cur.id]=v; else delete descs[cur.id];
  try{localStorage.setItem('voltDesc',JSON.stringify(descs))}catch(e){toast('Could not save in this browser');}
  showDesc(); $('#mView').hidden=false; $('#mDesc').hidden=true; $('#mSave').hidden=true; $('#mEdit').hidden=false;
  toast('Description saved');
};
$('#mAdd').onclick=()=>{
  cart.push(cur); drawCart(); toast(cur.name+' added to cart');
  const c=$('#count'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  closeModal();
};

/* pages: home banner, shop page, USDT page */
function route(){
  const h=location.hash.slice(1);
  const v=h==='shop'?'shop':h==='exchange'?'exchange':'home';
  document.body.dataset.view=v;
  if(h==='contact'){const f=document.getElementById('contact'); if(f) f.scrollIntoView(); return}
  window.scrollTo(0,0);
}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const h=a.getAttribute('href').slice(1);
  if(!['top','shop','exchange','contact'].includes(h)) return;
  e.preventDefault(); location.hash=h; route();
}));
window.addEventListener('hashchange',route);
route();

/* 3D banner: parallax tilt and floating spinning coins */
(function(){
  const hero=document.querySelector('.hero'), bg=document.querySelector('.bgz'), box=document.getElementById('bgcoins');
  if(!hero||!bg||!box) return;
  const col={'₿':['#00E5FF','#0066FF'],'₮':['#FF36F7','#7B00FF'],'∞':['#00E5FF','#FF36F7']};
  const list=[['₿',78,12,70,40,18,0],['₮',90,55,56,-30,14,0],['∞',62,68,44,25,20,1],['₿',50,8,30,-50,22,2],['₮',70,36,26,60,16,2],['∞',93,18,34,-20,24,1],['₿',8,80,40,30,19,1],['₮',40,82,28,-40,17,2]];
  box.innerHTML=list.map(([s,x,y,d,z,t,b])=>`<div class="c3w" style="--x:${x}%;--y:${y}%;--d:${d}px;--z:${z};--t:${t}s;--b:${b}px;--c1:${col[s][0]};--c2:${col[s][1]}"><div class="c3"><i>${s}</i><i>${s}</i></div></div>`).join('');
  if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  hero.addEventListener('pointermove',e=>{
    const r=hero.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    hero.style.setProperty('--mx',x*2); hero.style.setProperty('--my',y*2);
    bg.style.setProperty('--rx',(x*6)+'deg'); bg.style.setProperty('--ry',(-y*4)+'deg');
  });
  hero.addEventListener('pointerleave',()=>{
    hero.style.setProperty('--mx',0); hero.style.setProperty('--my',0);
    bg.style.setProperty('--rx','0deg'); bg.style.setProperty('--ry','0deg');
  });
})();

/* 3D tilt on cards */
if(matchMedia('(hover:hover)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches){
  const g=$('#grid');
  g.addEventListener('pointermove',e=>{const c=e.target.closest('.card');if(!c)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    c.style.setProperty('--ry',((x-.5)*14)+'deg');c.style.setProperty('--rx',((.5-y)*14)+'deg');c.style.setProperty('--mx',(x*100)+'%');c.style.setProperty('--my',(y*100)+'%')});
  g.addEventListener('pointerout',e=>{const c=e.target.closest('.card');if(c&&!c.contains(e.relatedTarget)){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')}});
}

/* scroll reveal */
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}}),{threshold:.15}) : null;
document.querySelectorAll('h2,.sub,.filters,.box,.list li').forEach((el,i)=>{
  if(!io) return; el.classList.add('rv'); el.style.transitionDelay=(el.matches('.list li')?(i%3)*120:0)+'ms'; io.observe(el);
});
