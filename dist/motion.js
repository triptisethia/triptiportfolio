(() => {
 'use strict';
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const headline=document.querySelector('.hero-title');
 if(headline){
  const label=headline.textContent.replace(/\s+/g,' ').trim();headline.setAttribute('aria-label',label);headline.textContent='';
  label.split(' ').forEach((word,i)=>{if(i)headline.append(' ');const wrap=document.createElement('span');wrap.className='proximity-word';wrap.setAttribute('aria-hidden','true');[...word].forEach(c=>{const letter=document.createElement('span');letter.className='proximity-letter';letter.textContent=c;wrap.append(letter);});headline.append(wrap);});
  const letters=[...headline.querySelectorAll('.proximity-letter')];let frame=0,point=null;
  const reset=()=>{point=null;letters.forEach(l=>{l.style.fontVariationSettings="'wght' 400, 'wdth' 100";l.style.color='';});};
  function update(){frame=0;if(!point||reduced()||headline.closest('[hidden]'))return;const boxes=letters.map(l=>l.getBoundingClientRect());letters.forEach((l,i)=>{const b=boxes[i],distance=Math.hypot(point.x-b.x-b.width/2,point.y-b.y-b.height/2),strength=Math.max(0,1-distance/180);l.style.fontVariationSettings=`'wght' ${400+400*strength}, 'wdth' 100`;l.style.color=distance<85?'#a92e3c':'';});}
  addEventListener('pointermove',e=>{if(reduced()||e.pointerType==='touch')return;point={x:e.clientX,y:e.clientY};if(!frame)frame=requestAnimationFrame(update);},{passive:true});
  document.documentElement.addEventListener('pointerleave',reset);addEventListener('blur',reset);addEventListener('hashchange',reset);
  function measure(){if(!headline.getClientRects().length)return;reset();letters.forEach(l=>l.style.width='');const widths=letters.map(l=>l.getBoundingClientRect().width);letters.forEach((l,i)=>l.style.width=widths[i]+'px');}
  document.fonts.ready.then(measure);addEventListener('resize',measure);addEventListener('hashchange',()=>requestAnimationFrame(measure));
 }
 document.querySelectorAll('.nav-link').forEach(a=>{
  const label=a.textContent;a.setAttribute('aria-label',label);a.textContent='';
  [...label].forEach((c,i)=>{const s=document.createElement('span');s.className='nav-letter';s.textContent=c;s.style.setProperty('--i',i);s.setAttribute('aria-hidden','true');a.append(s);});
 });
 document.querySelectorAll('.socials a,.socials button,.contact-label,.contact-actions a,.contact-actions button,.email-large').forEach(el=>{
  const original=el.textContent;el.setAttribute('aria-label',el.getAttribute('aria-label')||original);let timer;
  const restore=()=>{clearInterval(timer);timer=null;el.textContent=original;};
  const scramble=()=>{if(reduced()||timer)return;let tick=0;timer=setInterval(()=>{tick++;el.textContent=[...original].map((c,i)=>/\s/.test(c)||i<tick*original.length/10?c:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random()*26)]).join('');if(tick>=10)restore();},50);};
  el.addEventListener('pointerenter',scramble);el.addEventListener('focus',scramble);el.addEventListener('pointerleave',restore);el.addEventListener('blur',restore);
 });
 // Adapted from the supplied Scramble In and Random Letter Swap examples.
 function revealHome(){
  if(reduced())return;
  const roots=document.querySelectorAll('.sidebar .identity,.sidebar .discipline,.sidebar .label,.nav-link,.socials a,.socials button,.intro-copy p,.hero-title,.stamp-front,.works-card,.command-hint,.edition');
  roots.forEach((el,index)=>{
   if(!el.getClientRects().length)return;
   const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];
   while(walker.nextNode())if(walker.currentNode.textContent.trim())nodes.push({node:walker.currentNode,text:walker.currentNode.textContent});
   const length=nodes.reduce((n,item)=>n+item.text.length,0);if(!length)return;
   const label=el.getAttribute('aria-label');if(!label)el.setAttribute('aria-label',el.textContent);
   const started=performance.now()+Math.min(index*45,450),duration=Math.min(1600,Math.max(500,length*14));
   const chars='abcdefghijklmnopqrstuvwxyz!@#$%&';
   function step(now){
    const progress=Math.max(0,Math.min(1,(now-started)/duration)),count=Math.floor(progress*length);let offset=0;
    nodes.forEach(item=>{item.node.textContent=[...item.text].map((c,i)=>{const n=offset+i;return /\s/.test(c)||n<count?c:n<count+5?chars[Math.floor(Math.random()*chars.length)]:'\u00a0';}).join('');offset+=item.text.length;});
    if(progress<1)requestAnimationFrame(step);else{nodes.forEach(item=>item.node.textContent=item.text);if(!label)el.removeAttribute('aria-label');}
   }
   requestAnimationFrame(step);
  });
  document.querySelectorAll('.stamp,.works-card').forEach(el=>el.animate([{opacity:0},{opacity:1}],{duration:650,fill:'backwards'}));
 }
 const brand=document.querySelector('.brand-name');
 if(brand){
  let animations=[],swapVersion=0;
  function swap(text){
   const version=++swapVersion;
   animations.forEach(a=>a.cancel());animations=[];
   const old=brand.dataset.target||'tripti';brand.textContent='';
   const order=Array.from({length:Math.max(old.length,text.length)},(_,i)=>i).sort(()=>Math.random()-.5);
   order.forEach((_,i)=>{const cell=document.createElement('span');cell.className='swap-cell';const a=document.createElement('span'),b=document.createElement('span');a.textContent=old[i]||'\u00a0';b.textContent=text[i]||'\u00a0';b.className='swap-next';cell.append(a,b);brand.append(cell);if(!reduced()){const timing={duration:440,delay:order.indexOf(i)*25,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'};animations.push(a.animate({transform:['translateY(0)','translateY(-110%)']},timing),b.animate({transform:['translateY(110%)','translateY(0)']},timing));}else{a.style.visibility='hidden';b.style.transform='none';}});
   Promise.all(animations.map(a=>a.finished.catch(()=>{}))).then(()=>{if(version===swapVersion)brand.textContent=text;});brand.dataset.target=text;
  }
  const link=brand.closest('a');link.addEventListener('pointerenter',()=>swap('~(˘▾˘~)'));link.addEventListener('pointerleave',()=>swap('tripti'));link.addEventListener('focus',()=>swap('~(˘▾˘~)'));link.addEventListener('blur',()=>swap('tripti'));
 }
 const role=document.querySelector('.discipline');
 if(role){
  const words=['INTERACTION\nDESIGNER','RESEARCHER','STORYTELLER','CREATIVE'];let index=0;
  role.setAttribute('aria-label','Interaction designer, researcher, storyteller, creative');
  role.style.whiteSpace='pre-line';
  setInterval(()=>{if(document.hidden||document.body.classList.contains('arriving'))return;index=(index+1)%words.length;role.textContent=words[index];if(!reduced())role.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'ease-out'});},2400);
 }

 const returningFromProject=performance.getEntriesByType('navigation')[0]?.type!=='reload'&&/work-[a-z]+\.html/.test(document.referrer);
 if(!returningFromProject&&!reduced()&&(!location.hash||location.hash==='#home')){
  const cover=document.createElement('div');cover.className='arrival-loader';cover.setAttribute('aria-hidden','true');
  cover.innerHTML='<div class="arrival-label">(Loading —<br><span>0</span>%)</div>';
  document.body.append(cover);document.body.classList.add('arriving');
  const start=performance.now();let ready=false;
  Promise.allSettled([document.fonts.ready,window.Portfolio.data]).then(()=>ready=true);
  function finish(){cover.remove();document.body.classList.remove('arriving');revealHome();}
  function progress(now){
   if(reduced()){finish();return;}
   const elapsed=now-start,p=Math.min(ready?100:94,elapsed/29);
   cover.querySelector('.arrival-label span').textContent=Math.floor(p);
   if(p>=100){finish();return;}
   if(elapsed>6500){finish();return;}requestAnimationFrame(progress);
  }
  requestAnimationFrame(progress);
 }
})();

