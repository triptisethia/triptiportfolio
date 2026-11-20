(() => {
'use strict';
const {data,read,save,navigate,reduced,esc:escapeHTML}=window.Portfolio;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let projects=[],currentFilter='all',routeName='',spread=false,drawerAnimation=null,drawerVersion=0;
const groups={interaction:['antisocial','posture','mautam','aqi','thela','buried'],visual:['specimen','remnant','aqi','thela','buried']};
const placements=[[49,68,-40,2,18,42,-7,22,21],[51,53,-16,3,42,40,3,73,22],[61,49,17,4,66,42,-4,28,53],[94,58,-24,2,31,75,-3,74,55],[76,90,-16,3,78,74,5,46,82]];
function selectHomeProjects(){
 const previous=read('portfolio-home-selection')||[];
 const returning=performance.getEntriesByType('navigation')[0]?.type!=='reload'&&/work-[a-z]+\.html/.test(document.referrer);
 if(returning&&previous.length===5&&previous.every(id=>projects.some(p=>p.id===id)))return previous;
 const pool=projects.map(p=>p.id);
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 const selected=pool.slice(0,5);
 if(pool.length>5&&selected.every(id=>previous.includes(id))){selected[4]=pool[5];}
 save('portfolio-home-selection',selected);return selected;
}
function stampMarkup(p,i){const [x,y,a,z,sx,sy,sa,mx,my]=placements[i];return `<a href="work-${p.id}.html?from=home" class="stamp project-polaroid" style="--x:${x}%;--y:${y}%;--angle:${a}deg;--z:${z};--sx:${sx}%;--sy:${sy}%;--sa:${sa}deg;--mx:${mx}%;--my:${my}%" aria-label="Open ${escapeHTML(p.title)}"><span class="polaroid-paper"><img src="${p.image}" alt="${escapeHTML(p.alt)}" draggable="false"><span class="polaroid-title">${escapeHTML(p.title)}</span><span class="polaroid-year mono">${p.year}</span></span></a>`;}

function renderProjects(){const list=currentFilter==='all'?projects:projects.filter(p=>groups[currentFilter].includes(p.id));$('#collection-count').textContent=String(list.length).padStart(2,'0');$('#project-list').innerHTML=list.map(p=>`<a class="project-item" href="work-${p.id}.html?from=works" aria-label="${escapeHTML(p.title)} — ${escapeHTML(p.description)}"><span class="project-image"><img src="${p.image}" alt="${escapeHTML(p.alt)}" loading="lazy"><span class="open-project" aria-hidden="true">↗</span></span><div class="project-caption"><div><h2>${escapeHTML(p.title)}</h2><span class="mono">${escapeHTML(p.tags.join(' / ').toUpperCase())}</span></div><p>${escapeHTML(p.description)}</p><span class="year">${p.year}</span></div></a>`).join('');}
function setFilter(filter){currentFilter=Object.hasOwn(groups,filter)?filter:'all';window.portfolioFilter=currentFilter;$$('[data-filter]').forEach(b=>{const active=b.dataset.filter===currentFilter;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});renderProjects();}
function setSpread(on){spread=on;$('#home-view').classList.toggle('spread',on);document.body.classList.toggle('stamps-open',on);$('#stamp-toggle')?.setAttribute('aria-expanded',String(on));$('.spread-close').hidden=!on;$('.sidebar').inert=on;$('.intro').inert=on;$('#works-open').inert=on;if(on)$('.spread-close').focus({preventScroll:true});else $('#stamp-toggle')?.focus({preventScroll:true});}
function route(){
 let target=location.hash.slice(1)||'home';
 if(target.startsWith('project/')){const id=target.split('/')[1];location.replace(projects.some(p=>p.id===id)?'work-'+id+'.html':'index.html#works');return;}
 if(!['home','about','works'].includes(target)){history.replaceState(null,'','#home');target='home';}
 document.body.classList.toggle('about-open',target==='about');const previous=routeName;routeName=target;const collection=target==='works';if(spread)setSpread(false);
 const panel=$('#works-panel');
 drawerAnimation?.cancel();panel.classList.remove('drawer-closing');panel.hidden=!collection;
 document.body.classList.toggle('collection-open',collection);document.body.style.overflow=collection?'hidden':'';$('#scene').inert=false;$('#works-open').setAttribute('aria-expanded',String(collection));
 $$('.view').forEach(v=>v.hidden=collection||v.id!==target+'-view');
 $$('.nav-link').forEach(a=>{const active=a.dataset.nav===target;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 $('#navigation').classList.remove('open');$('.mobile-menu').setAttribute('aria-expanded','false');
 document.title=(target==='home'?'Tripti Sethia':target[0].toUpperCase()+target.slice(1)+' — Tripti Sethia')+' — Interaction Designer';
 if(collection){const origin=read('portfolio-origin');setFilter(origin?.hash==='#works'?origin.filter:'all');$('#works-panel').scrollTop=origin?.hash==='#works'?origin.scroll:0;$('#works-panel').focus({preventScroll:true});if(origin?.focus){const a=$$('#project-list a').find(a=>a.getAttribute('href')===origin.focus);a?.focus({preventScroll:true});}}
 else{window.scrollTo({top:0,behavior:'instant'});if(previous==='works')$('#works-open').focus({preventScroll:true});else $('#main').focus({preventScroll:true});}
}
$('#works-open').addEventListener('click',()=>{save('portfolio-origin',null);navigate('#works');});
$('[data-action="close-works"]').addEventListener('click',()=>navigate('#home'));
$('[data-action="top"]').addEventListener('click',()=>{$('#works-panel').scrollTo({top:0,behavior:reduced()?'instant':'smooth'});$('#works-title').tabIndex=-1;$('#works-title').focus({preventScroll:true});});
$('#stamp-toggle')?.addEventListener('click',()=>setSpread(!spread));$('.spread-close').addEventListener('click',()=>setSpread(false));
$('.mobile-menu').addEventListener('click',()=>{const on=$('#navigation').classList.toggle('open');$('.mobile-menu').setAttribute('aria-expanded',String(on));if(on)$('#navigation a').focus();});
document.addEventListener('click',e=>{if(!e.target.closest('.sidebar')&&$('#navigation').classList.contains('open')){$('#navigation').classList.remove('open');$('.mobile-menu').setAttribute('aria-expanded','false');}});
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{setFilter(b.dataset.filter);save('portfolio-origin',{hash:'#works',filter:currentFilter,scroll:0});}));
document.addEventListener('keydown',e=>{
 if($('dialog[open]'))return;
 if(e.key==='Escape'){if(spread)setSpread(false);else if(routeName==='works')navigate('#home');else if($('#navigation').classList.contains('open')){$('#navigation').classList.remove('open');$('.mobile-menu').setAttribute('aria-expanded','false');$('.mobile-menu').focus();}}
 if(e.key==='Tab'&&spread){const root=spread?$('#home-view'):$('#works-panel');const focusables=[...root.querySelectorAll('a[href],button:not([disabled])')].filter(el=>!el.closest('[inert]')&&el.getClientRects().length);const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===root)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
});
addEventListener('hashchange',route);addEventListener('portfolio-route',route);
addEventListener('pageshow',e=>{if(e.persisted&&projects.length)route();});
function clock(){$('#local-time').textContent=new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).toUpperCase()+' · IST';}
data.then(d=>{projects=[...d.projects].sort((a,b)=>Number(b.year)-Number(a.year));$('#portrait-image').src=d.portrait;$('#stamp-scene').innerHTML=selectHomeProjects().map((id,i)=>stampMarkup(projects.find(p=>p.id===id),i)).join('');$$('[data-filter="all"] sup').forEach(el=>el.textContent=String(projects.length).padStart(2,'0'));clock();setInterval(clock,1000);route();}).catch(()=>{$('#stamp-scene').innerHTML='<p class="load-error">Projects could not load. <a href="work-aqi.html">Read a case study</a> or refresh to try again.</p>';});
})();

(() => {
 const trigger=document.querySelector('.portrait-play'),figure=trigger.closest('figure'),video=trigger.querySelector('video'),bio=document.querySelector('#portrait-bio');
 let pinned=false;
 const show=()=>{bio.hidden=false;trigger.setAttribute('aria-expanded','true');figure.classList.add('bio-open');video.muted=true;video.play().then(()=>trigger.classList.add('playing')).catch(()=>{});};
 const hide=()=>{bio.hidden=true;trigger.setAttribute('aria-expanded','false');figure.classList.remove('bio-open');video.pause();video.currentTime=0;trigger.classList.remove('playing');};
 figure.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')show();});
 figure.addEventListener('pointerleave',()=>{if(!pinned&&!figure.contains(document.activeElement))hide();});
 trigger.addEventListener('focus',show);
 figure.addEventListener('focusout',e=>{if(!figure.contains(e.relatedTarget)){pinned=false;hide();}});
 trigger.addEventListener('click',()=>{pinned=!pinned;pinned?show():hide();});
 document.addEventListener('pointerdown',e=>{if(!figure.contains(e.target)){pinned=false;hide();}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){pinned=false;hide();}});
 addEventListener('hashchange',()=>{pinned=false;hide();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){pinned=false;hide();}});
})();

