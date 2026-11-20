(() => {
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],data=window.BuriedData;
function select(attr,index){$$('['+attr+']').forEach(b=>b.setAttribute('aria-pressed',String(+b.getAttribute(attr)===index)));}
let stage=0;
function showStage(i){stage=i;select('data-stage',i);const d=data.stages[i];$('#stage-number').textContent=String(i+1).padStart(2,'0');$('#stage-title').textContent=d[0];$('#stage-copy').textContent=d[1];$('#stage-insight').textContent=d[2];$('#stage-next').textContent=i===5?'Back to first stage ↺':'Next stage →';}
$$('[data-stage]').forEach(b=>b.addEventListener('click',()=>showStage(+b.dataset.stage)));$('#stage-next').addEventListener('click',()=>showStage((stage+1)%6));
const categories=[['Religious places',31,'The largest category in the research chart, bringing attention to pilgrimage routes and mass religious gatherings.'],['Transport hubs',4,'Railway stations and footbridges connect high arrival volumes with constrained routes.'],['Political rallies',3,'Rally grounds bring together event planning, crowd movement and political authority.'],['Other gatherings',6,'The source groups celebrity, charity and sports gatherings together in this category.']];
$$('[data-category]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.category,d=categories[i];select('data-category',i);$('#category-count').textContent=d[1];$('#category-name').textContent=d[0];$('#category-copy').textContent=d[2];}));
$$('[data-group]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.group,d=data.groups[i];select('data-group',i);$('#group-axis').textContent=d[0];$('#group-title').textContent=d[1];$('#group-list').replaceChildren(...d[2].map(x=>{const li=document.createElement('li');li.textContent=x;return li;}));}));
$$('[data-cluster]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.cluster,d=data.clusters[i];select('data-cluster',i);$('#cluster-title').textContent=d[0];$('#cluster-copy').textContent=d[1];$('#cluster-lever').textContent=d[3];$('#cluster-chain').replaceChildren(...d[2].map(x=>{const li=document.createElement('li');li.textContent=x;return li;}));}));
$$('[data-buried-point]').forEach(point=>{
 function activate(){
  const d=data.powerPoints[+point.dataset.buriedPoint];
  $$('#buried-power .power-point,#buried-power .power-quadrant').forEach(el=>el.classList.remove('active'));
  point.classList.add('active');$('#buried-power .power-quadrant[data-q="'+d.key+'"]').classList.add('active');
  $('#buried-power-caption').textContent=d.name+' — '+d.quadrant+'. '+d.description+'.';
 }
 point.addEventListener('pointerenter',activate);point.addEventListener('focus',activate);point.addEventListener('click',activate);
});
// A bounded map viewer: normal scrolling remains available until visitors zoom.
const viewport=$('#map-viewport'),canvas=$('.buried-map-canvas'),img=$('#giga-image');let fit=1,scale=1,x=0,y=0,drag=null;const W=2380,H=3368;
canvas.style.width=W+'px';canvas.style.height=H+'px';
function clamp(){const w=viewport.clientWidth,h=viewport.clientHeight;x=W*scale<=w?(w-W*scale)/2:Math.min(0,Math.max(w-W*scale,x));y=H*scale<=h?(h-H*scale)/2:Math.min(0,Math.max(h-H*scale,y));}
function draw(){clamp();canvas.style.transform=`translate(${x}px,${y}px) scale(${scale})`;$('#map-zoom').textContent=Math.round(scale/fit*100)+'%';viewport.classList.toggle('is-zoomed',scale>fit*1.05);$('[data-zoom="out"]').disabled=scale<=fit+.0001;$('[data-zoom="in"]').disabled=scale>=fit*8-.0001;}
function markView(name){$$('[data-map-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mapView===name)));}
function reset(){fit=Math.min((viewport.clientWidth-32)/W,(viewport.clientHeight-32)/H);scale=fit;x=0;y=0;markView('all');draw();}
function zoom(factor){let next=Math.max(fit,Math.min(fit*8,scale*factor));const cx=viewport.clientWidth/2,cy=viewport.clientHeight/2;x=cx-(cx-x)*next/scale;y=cy-(cy-y)*next/scale;scale=next;markView('');draw();}
$$('[data-zoom]').forEach(b=>b.addEventListener('click',()=>b.dataset.zoom==='fit'?reset():zoom(b.dataset.zoom==='in'?1.5:1/1.5)));
const views={context:[.5,.15,2.1],system:[.5,.5,2.15],leverage:[.5,.84,2.1]};
$$('[data-map-view]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.mapView;if(k==='all'){reset();return;}const [cx,cy,z]=views[k];scale=Math.min(fit*8,Math.max(fit*2,(viewport.clientWidth-35)/W*z/2));x=viewport.clientWidth/2-W*cx*scale;y=viewport.clientHeight/2-H*cy*scale;markView(k);draw();}));
viewport.addEventListener('pointerdown',e=>{if(e.button!==0||scale<=fit*1.05)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,ox:x,oy:y};viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');});
viewport.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;x=drag.ox+e.clientX-drag.x;y=drag.oy+e.clientY-drag.y;draw();});
function end(){drag=null;viewport.classList.remove('dragging');}viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);viewport.addEventListener('lostpointercapture',end);
viewport.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='='){e.preventDefault();zoom(1.5);}else if(e.key==='-'){e.preventDefault();zoom(1/1.5);}else if(e.key==='0'){e.preventDefault();reset();}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();x+=e.key==='ArrowLeft'?60:e.key==='ArrowRight'?-60:0;y+=e.key==='ArrowUp'?60:e.key==='ArrowDown'?-60:0;draw();}});
new ResizeObserver(reset).observe(viewport);img.addEventListener('load',reset);reset();
})();

