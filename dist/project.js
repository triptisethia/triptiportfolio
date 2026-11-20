(() => {
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],{read,reduced,navigate}=window.Portfolio;
const origin=read('portfolio-origin'),from=new URLSearchParams(location.search).get('from');
const returnHash=from==='works'?'#works':from==='home'?'#home':origin?.hash==='#works'?'#works':'#home';
$$('[data-return]').forEach(a=>{a.href='index.html'+returnHash;a.setAttribute('aria-label',returnHash==='#works'?'Back to Work':'Back to Home');});
$$('.next-card').forEach(a=>{const url=new URL(a.href,location.href);url.searchParams.set('from',returnHash.slice(1));a.href=url.href;});
const sections=[$('#project-content'),...$$('.project-section'),$('#up-next')],rail=$('#section-rail'),links=$$('#section-rail a');
let active=0,queued=false;
$('#section-dots').innerHTML=sections.map(()=>'<span></span>').join('');const dots=$$('#section-dots span');
function goSection(i){const target=sections[Math.max(0,Math.min(sections.length-1,i))];history.replaceState(null,'','#'+target.id);target.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});target.tabIndex=-1;target.focus({preventScroll:true});}
links.forEach((a,i)=>a.addEventListener('click',e=>{e.preventDefault();goSection(i);}));
rail.addEventListener('keydown',e=>{const i=links.indexOf(document.activeElement);if(i<0)return;if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?links.length-1:Math.max(0,Math.min(links.length-1,i+(e.key==='ArrowRight'?1:-1)));links[next].focus();}});
$('#section-prev').addEventListener('click',()=>{if(active===0){window.scrollTo({top:0,behavior:reduced()?'instant':'smooth'});$('.project-hero h1').tabIndex=-1;$('.project-hero h1').focus({preventScroll:true});}else goSection(active-1);});
$('#section-next').addEventListener('click',()=>{if(active===0&&sections[0].getBoundingClientRect().top>innerHeight*.4)goSection(0);else goSection(active+1);});
function update(){let i=0;sections.forEach((s,j)=>{if(s.getBoundingClientRect().top<innerHeight*.4)i=j;});if(innerHeight+scrollY>=document.documentElement.scrollHeight-4)i=sections.length-1;const changed=i!==active||!links[i].hasAttribute('aria-current');active=i;links.forEach((a,j)=>{if(j===i)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');dots[j].classList.toggle('active',j===i);});if(changed&&!rail.contains(document.activeElement)){const link=links[i];rail.scrollTo({left:link.offsetLeft-(rail.clientWidth-link.offsetWidth)/2,behavior:reduced()?'instant':'smooth'});}const max=document.documentElement.scrollHeight-innerHeight;$('#reading-progress').textContent=Math.round(max>0?scrollY/max*100:0)+'% read';$('#section-prev').disabled=scrollY<20;$('#section-next').disabled=i===sections.length-1;}
addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{update();queued=false;});}},{passive:true});addEventListener('resize',update);addEventListener('load',()=>{update();const id=location.hash.slice(1);const target=id&&document.getElementById(id);if(target)target.scrollIntoView({behavior:'instant',block:'start'});});update();
const images=$$('.section-content img').filter(im=>!im.closest('a,button,.story-widget,.cat-stage,.mzf-book,.mzf-leaf,.dl-circuit-img,.sl-demo,.buried-map-viewport')),viewer=$('#image-viewer');let selected=0,returnFocus=null;
function setImage(i){selected=(i+images.length)%images.length;const im=images[selected];$('#image-error').hidden=true;$('#expanded-image').hidden=false;$('#expanded-image').src=im.currentSrc||im.src;$('#expanded-image').alt=im.alt;$('#expanded-caption').textContent=im.closest('figure')?.querySelector('figcaption')?.textContent||im.alt;$('#image-count').textContent=`${String(selected+1).padStart(2,'0')} / ${String(images.length).padStart(2,'0')}`;$('#image-prev').hidden=$('#image-next').hidden=images.length<2;}
function openImage(i,trigger){returnFocus=trigger;setImage(i);viewer.showModal();document.body.classList.add('dialog-open');}
images.forEach((im,i)=>{const b=document.createElement('button');b.className='image-trigger';b.type='button';b.setAttribute('aria-label','Expand image: '+(im.alt||'Project image'));im.replaceWith(b);b.append(im);const icon=document.createElement('span');icon.className='image-expand';icon.textContent='↗';icon.setAttribute('aria-hidden','true');b.append(icon);b.addEventListener('click',()=>openImage(i,b));});
viewer.addEventListener('close',()=>{document.body.classList.remove('dialog-open');returnFocus?.focus({preventScroll:true});});$('#expanded-image').addEventListener('error',()=>{$('#image-error').hidden=false;$('#expanded-image').hidden=true;});$('#viewer-close').addEventListener('click',()=>viewer.close());$('#image-prev').addEventListener('click',()=>setImage(selected-1));$('#image-next').addEventListener('click',()=>setImage(selected+1));viewer.addEventListener('click',e=>{if(e.target===viewer||e.target===viewer.querySelector('figure'))viewer.close();});
document.addEventListener('keydown',e=>{if(viewer.open){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopImmediatePropagation();setImage(selected+(e.key==='ArrowRight'?1:-1));}return;}if(e.key==='Escape'&&!$('dialog[open]'))navigate('index.html'+returnHash);});
$$('.tt-plan,.tt-rings,#ttDial').forEach(svg=>svg.setAttribute('role','group'));
$$('.tt-z,.tt-ring,.tt-q .tt-chip').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');if(!el.getAttribute('aria-label'))el.setAttribute('aria-label',el.textContent.trim()||el.dataset.z||el.dataset.ring);el.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();el.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});});
$$('.tt-ins').forEach(b=>{b.setAttribute('aria-expanded','false');b.addEventListener('click',()=>b.setAttribute('aria-expanded',String(b.classList.contains('open'))));});
['ttEveNote','ttMatrixCap','ttDayKind','slStatus'].forEach(id=>{const el=document.getElementById(id);if(el)el.setAttribute('aria-live','polite');});
const sync=()=>$$('.dl-part-chip,.tt-eve-stop,#ttVendors button,.tt-wedge,.tt-ring').forEach(el=>el.setAttribute('aria-pressed',String(el.classList.contains('active'))));sync();document.addEventListener('click',sync);document.addEventListener('keydown',sync);
})();

/* Explicit feedback and a reversible action for the posture demonstration. */
(() => {
 const range=document.getElementById('slRange');if(!range)return;
 const controls=document.createElement('div');controls.className='posture-controls';
 const readout=document.createElement('output');readout.htmlFor='slRange';
 const reset=document.createElement('button');reset.type='button';reset.textContent='Reset to upright ↺';
 const update=()=>{readout.textContent='Lean input · '+range.value+' / '+range.max;};
 range.addEventListener('input',update);reset.addEventListener('click',()=>{range.value='0';range.dispatchEvent(new Event('input',{bubbles:true}));update();});
 controls.append(readout,reset);range.closest('label').after(controls);update();
})();


/* Reveal only when visible: content remains readable without scripting. */
(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('micro-reveal');observer.unobserve(entry.target);}}),{threshold:.15});document.querySelectorAll('.section-heading,.case-tldr,.project-next .next-heading').forEach(el=>observer.observe(el));})();
