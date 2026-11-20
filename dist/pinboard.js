/* Shared drag handling keeps link clicks distinct from intentional moves. */
(() => {
 let suppressed=null,suppressedUntil=0;
 window.addEventListener('click',e=>{if(suppressed?.contains(e.target)&&performance.now()<suppressedUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 function draggable(el,bounds,finish=()=>{}){
  let drag=null,suppressUntil=0;
  el.draggable=false;
  el.addEventListener('dragstart',e=>e.preventDefault());

  el.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;const r=el.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx:+el.dataset.dx||0,dy:+el.dataset.dy||0,r,moved:false};});
  el.addEventListener('pointermove',e=>{
   if(!drag||e.pointerId!==drag.id)return;
   const x=e.clientX-drag.x,y=e.clientY-drag.y;if(!drag.moved&&Math.hypot(x,y)<7)return;
   if(!drag.moved){drag.moved=true;el.setPointerCapture(e.pointerId);el.classList.add('dragging');}
   const b=bounds.getBoundingClientRect();
   const dx=drag.dx+Math.max(b.left-drag.r.left,Math.min(x,b.right-drag.r.right));
   const dy=drag.dy+Math.max(b.top-drag.r.top,Math.min(y,b.bottom-drag.r.bottom));
   el.dataset.dx=dx;el.dataset.dy=dy;el.style.translate=`${dx}px ${dy}px`;
  });
  function end(e){if(!drag||e.pointerId!==drag.id)return;if(drag.moved){suppressed=el;suppressedUntil=performance.now()+400;finish(el);}drag=null;el.classList.remove('dragging');if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);}
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
 }
 window.Portfolio.data.then(()=>{requestAnimationFrame(()=>document.querySelectorAll('.stamp').forEach(el=>draggable(el,document.querySelector('#stamp-scene'))));});
 const dialog=document.querySelector('#human-dialog'),notes=dialog.querySelector('.human-notes'),form=dialog.querySelector('form'),input=form.querySelector('#human-answer'),status=form.querySelector('.human-status'),opener=document.querySelector('.wmuh-link');
 const stack=dialog.querySelector('.note-stack');
 function compose(open){form.hidden=!open;stack.hidden=open;stack.setAttribute('aria-expanded',String(open));if(open)input.focus();else stack.focus();}
 stack.addEventListener('click',()=>compose(true));form.querySelector('.note-cancel').addEventListener('click',()=>compose(false));
 const colours={yellow:'#f0edc9',pink:'#efd0d2',blue:'#cecee9',green:'#d0edcc',lavender:'#eacded'};
 let selected='yellow',seeds=[],saved=[];
 const swatches=form.querySelector('.note-colours');
 Object.entries(colours).forEach(([name,colour])=>{const label=document.createElement('label');label.style.setProperty('--swatch',colour);label.innerHTML=`<input type="radio" name="note-colour" value="${name}" aria-label="${name}" ${name===selected?'checked':''}><span aria-hidden="true"></span>`;label.title=name;swatches.append(label);});
 swatches.addEventListener('change',e=>{selected=e.target.value;input.style.background=colours[selected];});
 // Whole-word matching for short terms avoids rejecting words such as "class".
 const explicit=['fuck','fucking','fucker','motherfucker','shit','bullshit','bitch','bitches','cunt','asshole','bastard','whore','slut','dick','cock','pussy','faggot','nigger','nigga','chutiya','chutia','chutiye','chutiyapa','madarchod','madharchod','behenchod','bhenchod','benchod','bhosdike','bhosdi','bhosda','bhosadike','bsdk','bkl','mc','bc','gandu','gaandu','gaand','gand','lund','loda','lauda','lavda','lawda','randi','harami','haramzada','haramkhor','kamina','kamine','saala','saale','tatti','jhant','jhaant','bhadwa','bhadwe','चूतिया','चुतिया','चूतिये','मादरचोद','मादरचो़द','बहनचोद','बहेंचोद','भोसड़ी','भोसडी','भोसड़ीके','गांडू','गांड','लंड','लौड़ा','रंडी','हरामी','हरामजादा','कमीना','कमीने','साला','साले'];
 const normalize=t=>t.normalize('NFKC').toLowerCase().replace(/[\u200b-\u200d\ufeff]/g,'').replace(/[@4]/g,'a').replace(/3/g,'e').replace(/[1!|]/g,'i').replace(/0/g,'o').replace(/[$5]/g,'s').replace(/7/g,'t');
 function clean(text){
  const n=normalize(text),tokens=n.split(/[^\p{L}\p{M}]+/u).filter(Boolean),compact=tokens.join('');
  if(explicit.some(w=>tokens.includes(w)))return false;
  const distinctive=explicit.filter(w=>w.length>=5&&!['saala','saale','kamine'].includes(w));
  if(distinctive.some(w=>compact.includes(w)))return false;
  if(/\b(?:f[\W_]*u[\W_]*c[\W_]*k|s[\W_]*h[\W_]*i[\W_]*t|b[\W_]*c|m[\W_]*c)\b/i.test(n))return false;
  return true;
 }
 window.Portfolio.cleanNote=clean;
 try{const data=JSON.parse(localStorage.getItem('tripti-wmuh')||'[]');if(Array.isArray(data))saved=data.map(n=>typeof n==='string'?{text:n,colour:'yellow'}:n).filter(n=>n&&typeof n.text==='string'&&clean(n.text)).slice(-60);}catch{}
 function save(){try{localStorage.setItem('tripti-wmuh',JSON.stringify(saved));return true;}catch{return false;}}
 const loaded=fetch('human-seeds.json').then(r=>r.json()).then(d=>seeds=d).catch(()=>{seeds=['making soup for someone'];});
 function place(item,i,owned){const note=document.createElement('article');note.className='human-note'+(owned?' owned-note':' seed-note');note.tabIndex=0;note.setAttribute('aria-label',item.text+'. Use arrow keys to move this note.');note.textContent=item.text;note.style.background=colours[item.colour]||colours.yellow;note.style.setProperty('--tilt',((i%5)-2)*2+'deg');const j=owned?Math.max(0,saved.indexOf(item)):i;const narrow=innerWidth<650;const col=j%(narrow?2:4),row=Math.floor(j/(narrow?2:4));note.style.left=(owned?(narrow?5:65)+col*(narrow?45:8):3+col*(narrow?40:13))+'%';note.style.top=(owned?(narrow?1040:80)+row*140:20+row*(narrow?140:118)+(col%2)*12)+'px';notes.style.minHeight=Math.max(narrow?1430:650,(owned?(narrow?1040:80):20)+(row+1)*145)+'px';note.style.setProperty('--tilt',((i*7%9)-4)+'deg');notes.append(note);
  requestAnimationFrame(()=>{if(!note.isConnected)return;const r=note.getBoundingClientRect(),b=notes.getBoundingClientRect();const x=Math.max(b.left-r.left,Math.min(Number(item.dx)||0,b.right-r.right)),y=Math.max(b.top-r.top,Math.min(Number(item.dy)||0,b.bottom-r.bottom));note.dataset.dx=x;note.dataset.dy=y;note.style.translate=`${x}px ${y}px`;});
  const persist=el=>{item.dx=+el.dataset.dx||0;item.dy=+el.dataset.dy||0;if(owned)save();};draggable(note,notes,persist);
  note.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const r=note.getBoundingClientRect(),b=notes.getBoundingClientRect(),step=e.shiftKey?30:10;let x=+note.dataset.dx||0,y=+note.dataset.dy||0;x+=e.key==='ArrowLeft'?Math.max(-step,b.left-r.left):e.key==='ArrowRight'?Math.min(step,b.right-r.right):0;y+=e.key==='ArrowUp'?Math.max(-step,b.top-r.top):e.key==='ArrowDown'?Math.min(step,b.bottom-r.bottom):0;note.dataset.dx=x;note.dataset.dy=y;note.style.translate=`${x}px ${y}px`;persist(note);});
 }
 opener.addEventListener('click',async()=>{dialog.showModal();document.body.classList.add('dialog-open');await loaded;notes.replaceChildren();seeds.forEach((text,i)=>place({text,colour:Object.keys(colours)[i%5]},i,false));saved.forEach((n,i)=>place(n,i+seeds.length,true));});
 dialog.querySelector('.human-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');opener.focus({preventScroll:true});});
 input.addEventListener('input',()=>input.removeAttribute('aria-invalid'));
 form.addEventListener('submit',e=>{e.preventDefault();const text=input.value.trim();if(!text)return;if(!clean(text)){status.textContent='Please rephrase without abusive language or swear words (Hindi or English).';input.setAttribute('aria-invalid','true');input.focus();return;}const item={text,colour:selected};saved.push(item);saved=saved.slice(-60);const persisted=save();place(item,notes.children.length,true);input.value='';compose(false);status.textContent=persisted?'Pinned! Saved in this browser.':'Pinned for this visit.';notes.lastElementChild.scrollIntoView({block:'nearest',behavior:'smooth'});});
})();
