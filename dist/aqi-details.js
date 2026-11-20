
(() => {
 const data={date:['Calendar grid','Dates and months use a format already present in everyday routines.'],value:['Colour intensity','Light yellow, orange and dark red make the calendar’s relative levels visible at a glance.'],pollutant:['Pollutant label','A short label identifies the pollutant alongside its colour, so the reader has more than a number.'],body:['Anatomical cue','Body-based language connects an abstract environmental measure to the subject of health.']};
 document.querySelectorAll('[data-encoding]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('[data-encoding]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  document.querySelector('.aqi-example').dataset.layer=b.dataset.encoding;
  document.querySelector('#encoding-title').textContent=data[b.dataset.encoding][0];
  document.querySelector('#encoding-copy').textContent=data[b.dataset.encoding][1];
 }));
 const years=[140,130,160,195,180,210];
 document.querySelectorAll('[data-aqi-year]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('[data-aqi-year]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  const y=Number(b.dataset.aqiYear),v=Number(b.dataset.aqiValue),prev=years[y-2021];
  document.querySelector('.aqi-trend-detail').textContent=y+' · '+v+' AQI'+(prev?' — '+(v>prev?'+':'')+(v-prev)+' compared with '+(y-1)+'.':' — the first year in the presentation’s series.');
 }));
 const seasons={winter:['Winter · November–January','The presentation links winter pollution to inversion conditions that trap particles close to the ground.'],summer:['Summer · March–May','The presentation highlights resuspended dust and heat-driven ozone peaks.'],monsoon:['Monsoon · July–September','The presentation describes rain removing airborne particles, improving air quality relative to drier periods.']};
 document.querySelectorAll('[data-season]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('[data-season]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  document.querySelector('.aqi-season-result').dataset.seasonActive=b.dataset.season;
  document.querySelector('#season-title').textContent=seasons[b.dataset.season][0];
  document.querySelector('#season-copy').textContent=seasons[b.dataset.season][1];
 }));
})();
