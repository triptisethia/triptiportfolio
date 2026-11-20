(() => {
 const desk=document.querySelector('.about-desk');
 if(!desk)return;
 const objects=[...desk.querySelectorAll('.desk-object')];
 let previous=[];
 function shuffle(){
  const pool=[...objects];
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  let selected=pool.slice(0,6);
  if(previous.length&&selected.every(item=>previous.includes(item))){const outside=pool.find(item=>!previous.includes(item));selected[5]=outside;}
  objects.forEach(item=>{item.hidden=true;item.setAttribute('aria-expanded','false');});
  selected.forEach((item,i)=>{item.dataset.slot=i;item.hidden=false;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)item.animate([{opacity:0},{opacity:1}],{duration:350,delay:i*25,fill:'backwards'});});
  previous=selected;
 }
 desk.querySelector('.desk-shuffle').addEventListener('click',shuffle);shuffle();
 objects.forEach(item=>item.addEventListener('click',()=>{
  const open=item.getAttribute('aria-expanded')!=='true';
  objects.forEach(other=>other.setAttribute('aria-expanded','false'));
  item.setAttribute('aria-expanded',String(open));
 }));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')objects.forEach(item=>item.setAttribute('aria-expanded','false'));});
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.desk-object'))objects.forEach(item=>item.setAttribute('aria-expanded','false'));});
})();
