
(() => {
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function selected(attr,b){$$('['+attr+']').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}
const bodyEffects={"brain": ["Brain", "Particle pollution is associated with increased stroke risk."], "throat": ["Throat", "Exposure can irritate the airways and contribute to coughing."], "lungs": ["Lungs", "Fine particles can worsen breathing difficulties and existing lung disease."], "heart": ["Heart", "Exposure is linked to heart attacks and irregular heartbeat."], "liver": ["Liver", "Studies in older adults report associations with changes in liver enzymes."]};
$$('[data-body-part]').forEach(b=>b.addEventListener('click',()=>{selected('data-body-part',b);const d=bodyEffects[b.dataset.bodyPart];$('#body-effect-title').textContent=d[0];$('#body-effect-copy').textContent=d[1];}));
const stakeholders={
elders:['Older adults','High interest, lower power. Their everyday exposure makes them the primary audience, but they have limited control over city-wide pollution.'],
doctors:['Doctors','High interest, higher power. They can explain health risks and help translate environmental information into appropriate care.'],
policy:['Policymakers','High interest, higher power. They can shape standards, priorities and public communication.'],
government:['Government','High interest, higher power. Public institutions can coordinate monitoring, services and pollution-control measures.'],
planners:['Urban planners','High interest, higher power. Decisions about streets, land use and infrastructure influence exposure over time.']};
$$('[data-stakeholder]').forEach(b=>b.addEventListener('click',()=>{selected('data-stakeholder',b);const d=stakeholders[b.dataset.stakeholder];$('#stakeholder-title').textContent=d[0];$('#stakeholder-copy').textContent=d[1];}));
// Same fit / zoom / bounded drag model as the system-design giga map.
const v=$('.aqi-map-viewport'),c=$('.aqi-map-canvas');const W=1000,H=600;let fit=1,scale=1,x=0,y=0,drag=null;
function draw(){const w=v.clientWidth,h=v.clientHeight;x=W*scale<=w?(w-W*scale)/2:Math.min(0,Math.max(w-W*scale,x));y=H*scale<=h?(h-H*scale)/2:Math.min(0,Math.max(h-H*scale,y));c.style.transform='translate('+x+'px,'+y+'px) scale('+scale+')';$('.map-level').textContent=Math.round(scale/fit*100)+'%';v.classList.toggle('zoomed',scale>fit*1.01);$('[data-map-action=out]').disabled=scale<=fit+.001;$('[data-map-action=in]').disabled=scale>=fit*4-.001;}
function reset(){fit=Math.min(v.clientWidth/W,v.clientHeight/H);scale=fit;x=y=0;draw();}
function zoom(f){const n=Math.max(fit,Math.min(fit*4,scale*f));x=v.clientWidth/2-(v.clientWidth/2-x)*n/scale;y=v.clientHeight/2-(v.clientHeight/2-y)*n/scale;scale=n;draw();}
$$('[data-map-action]').forEach(b=>b.addEventListener('click',()=>b.dataset.mapAction==='fit'?reset():zoom(b.dataset.mapAction==='in'?1.5:1/1.5)));
v.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button')||scale<=fit*1.01)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,ox:x,oy:y};v.setPointerCapture(e.pointerId);});
v.addEventListener('pointermove',e=>{if(!drag)return;x=drag.ox+e.clientX-drag.x;y=drag.oy+e.clientY-drag.y;draw();});
['pointerup','pointercancel','lostpointercapture'].forEach(t=>v.addEventListener(t,()=>drag=null));
v.addEventListener('keydown',e=>{if(e.target!==v)return;if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();if(e.key==='+'||e.key==='=')zoom(1.5);else if(e.key==='-')zoom(1/1.5);else if(e.key==='0')reset();else {x+=e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0;y+=e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0;draw();}});
new ResizeObserver(reset).observe(v);reset();
})();
