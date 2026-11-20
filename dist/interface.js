/* Shared navigation, dialogs and feedback across the portfolio. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const home = !document.documentElement.dataset.project;
  const base = home ? '' : 'index.html';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = key => { try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; } };
  const save = (key, value) => { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {} };
  let trigger = null, toastTimer, navigating = false;
  document.body.insertAdjacentHTML('beforeend', `<dialog id="command-dialog" aria-labelledby="command-title"><div class="dialog-top"><span id="command-title" class="label">GO SOMEWHERE</span><button data-action="close-dialog" aria-label="Close command palette">ESC</button></div><input id="command-input" type="search" placeholder="Search projects or pages…" aria-label="Search projects or pages" autocomplete="off"><div id="command-results"></div><p id="command-status" class="sr-only" role="status"></p><div class="command-footer mono">↑ ↓ NAVIGATE &nbsp; ↵ OPEN &nbsp; ESC CLOSE</div></dialog><dialog id="resume-dialog" aria-labelledby="resume-title"><div class="dialog-top"><span id="resume-title" class="mono">TRIPTI SETHIA / RÉSUMÉ</span><div><a href="assets/resume.pdf" target="_blank" rel="noopener">Open PDF ↗</a><button data-action="close-dialog" aria-label="Close résumé">×</button></div></div><iframe title="Tripti Sethia résumé"></iframe></dialog><div id="toast" role="status" aria-live="polite"></div>`);
  function toast(message) { $('#toast').textContent=message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3000); }
  let projects=[];
  const data=fetch('projects.json').then(r=>{if(!r.ok)throw Error('Unable to load projects');return r.json();}).then(d=>{projects=d.projects.filter(p=>!p.hidden);if($('#command-dialog').open)renderCommands();return {...d,projects};});
  data.catch(()=>toast('Project list could not load. Please refresh to try again.'));
  function renderCommands() {
    const q=$('#command-input').value.trim().toLowerCase();
    const items=[{title:'Home',href:base+'#home',tag:'PAGE'},{title:'All work',href:base+'#works',tag:'COLLECTION'},{title:'About Tripti',href:base+'#about',tag:'PAGE'},{title:'Email Tripti',href:'mailto:triptisethia13@gmail.com',tag:'CONTACT'},...projects.map(p=>({title:p.title,href:`work-${p.id}.html`,tag:p.year,terms:p.tags.join(' ')}))].filter(p=>(p.title+' '+(p.terms||'')).toLowerCase().includes(q));
    $('#command-results').innerHTML=items.length?items.map(p=>`<a href="${p.href}"><span>${esc(p.title)}</span><span class="mono">${p.tag} ↗</span></a>`).join(''):'<p class="empty-results">No matches. Try a project name or discipline.</p>';
    $('#command-status').textContent=`${items.length} results`;
  }
  function open(id) { const previous=$('dialog[open]');if(previous)previous.close();trigger=document.activeElement;const d=$(id);d.showModal();document.body.classList.add('dialog-open');if(id==='#command-dialog'){$('#command-input').value='';renderCommands();$('#command-input').focus();}else if(id==='#resume-dialog'){d.querySelector('iframe').src='assets/resume.pdf';} }
  function close() { $('dialog[open]')?.close(); }
  document.querySelectorAll('#command-dialog,#resume-dialog').forEach(d=>{
    d.addEventListener('close',()=>{document.body.classList.remove('dialog-open');if(trigger?.isConnected&&!trigger.closest('[inert]'))trigger.focus({preventScroll:true});});
    d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
  });
  function navigate(href) {
    if(navigating)return;
    const url=new URL(href,location.href);
    if(url.origin!==location.origin)return;
    if(url.pathname===location.pathname){close();if(url.hash===location.hash){window.dispatchEvent(new Event('portfolio-route'));}else location.hash=url.hash;return;}
    if(home&&/work-/.test(url.pathname)){
      const from=location.hash==='#works'?'works':'home';url.searchParams.set('from',from);
      save('portfolio-origin',{hash:'#'+from,filter:window.portfolioFilter||'all',scroll:$('#works-panel')?.scrollTop||0,focus:document.activeElement?.getAttribute('href')});
    }
    close();navigating=true;location.assign(url.href);
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-action]');
    if(b){if(b.dataset.action==='resume')open('#resume-dialog');if(b.dataset.action==='close-dialog')close();if(b.dataset.action==='email'){navigator.clipboard?.writeText('triptisethia13@gmail.com').then(()=>toast('Email copied: triptisethia13@gmail.com')).catch(()=>toast('Email: triptisethia13@gmail.com'));if(!navigator.clipboard)toast('Email: triptisethia13@gmail.com');}}
    const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||a.target==='_blank'||a.hasAttribute('download'))return;
    const url=new URL(a.href,location.href);if(url.origin!==location.origin)return;
    if(url.pathname===location.pathname&&!home)return;
    if(!/\/(index|work-[a-z]+)\.html$/.test(url.pathname)&&url.pathname!=='/')return;
    if(a.hash==='#main'){e.preventDefault();$('#main')?.focus();return;}
    e.preventDefault();navigate(a.href);
  });
  $('#command-input').addEventListener('input',renderCommands);
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if($('#command-dialog').open)close();else if(!$('#image-viewer')?.open)open('#command-dialog');return;}
    if(!$('#command-dialog').open)return;
    const links=[...document.querySelectorAll('#command-results a')];
    if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();const i=links.indexOf(document.activeElement);links[i<0?(e.key==='ArrowDown'?0:links.length-1):(i+(e.key==='ArrowDown'?1:-1)+links.length)%links.length]?.focus();}
    if(e.key==='Enter'&&document.activeElement===$('#command-input')){e.preventDefault();links[0]?.click();}
  });
  addEventListener('pageshow',()=>{navigating=false;document.body.classList.remove('leaving');$('.paper-transition')?.classList.remove('run');});
  window.Portfolio={data,read,save,navigate,toast,open,close,reduced,esc};
})();

/* Small red cursor, matching the reference's simple dot. */
(() => {
 const fine=matchMedia('(any-pointer: fine)'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const dot=document.createElement('div');dot.className='reference-cursor';dot.setAttribute('aria-hidden','true');document.body.append(dot);
 addEventListener('pointermove',e=>{
  if(!fine.matches||e.pointerType==='touch')return;
  dot.style.opacity='1';dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';
  dot.classList.toggle('is-link',!!e.target.closest('a,button,input,[role="slider"]'));
 },{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>dot.style.opacity='0');
 addEventListener('blur',()=>dot.style.opacity='0');
})();
