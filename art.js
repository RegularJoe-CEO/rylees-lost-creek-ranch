const $=id=>document.getElementById(id);
const ST=JSON.parse(localStorage.getItem('lcr3')||'{"stars":0,"done":{}}');
const save=()=>localStorage.setItem('lcr3',JSON.stringify(ST));
const stars=()=>$('stars').textContent=ST.stars;
let HIST=[], LAST=null;
let SPOT={Friend:[58,62],Mama:[74,60],Grandma:[34,50],Rylee:[24,62]};
function go(name){
  if(typeof name==='function'){name();return}
  if(typeof name!=='string'||!window[name])return;
  if(HIST[HIST.length-1]!==name)HIST.push(name);
  LAST=name;clearUI();window[name]();
}
function back(){
  if(HIST.length>1){HIST.pop();const n=HIST[HIST.length-1];LAST=n;clearUI();if(window[n])window[n]();else ranch()}
  else ranch();
}
function ranch(){HIST=['map'];LAST='map';clearUI();if(window.map)map();else if(window.goMap)goMap()}
function hear(){if(typeof LAST==='function')LAST();else if(LAST&&window[LAST]){clearUI();window[LAST]()}}
function say(who,text){
  const el=$('talk');
  el.className='speech '+(who||'Friend').toLowerCase();
  el.innerHTML='<strong>'+who+'</strong>'+text;
  const p=SPOT[who]||[50,55];
  el.style.left=p[0]+'%';el.style.top=p[1]+'%';
}
function acts(btns){$('acts').innerHTML=btns.map(b=>'<button class="btn '+(b.c||'')+'" onclick="'+(b.fn.indexOf('(')>=0?b.fn:"go('"+b.fn+"')")+'">'+b.t+'</button>').join('')}
function sayNext(who,text,fn,label){say(who,text);acts([{t:label||'Next',fn:fn}])}
function picks(opts,nextName){
  $('acts').innerHTML='';
  $('choice').classList.remove('hide');
  $('choice').innerHTML=opts.map((o,i)=>'<button class="pick" id="p'+i+'">'+o.t+'</button>').join('')+'<button class="btn ghost" onclick="hear()">Hear it again</button>';
  opts.forEach((o,i)=>{$('p'+i).onclick=()=>{
    if(o.ok){$('p'+i).classList.add('ok');ST.stars++;save();stars();setTimeout(function(){go(nextName)},550)}
    else{$('p'+i).classList.add('no');say('Friend',o.hint||'Look at the place we just talked about.')}
  }});
}
function clearUI(){$('talk').className='speech hide';$('acts').innerHTML='';$('choice').classList.add('hide');$('choice').innerHTML=''}
function sky(dusk){
  return '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+(dusk?'#f08a4a':'#7ec8de')+'"/><stop offset=".55" stop-color="'+(dusk?'#f6c98a':'#b7e0a8')+'"/><stop offset="1" stop-color="'+(dusk?'#f3d7a0':'#d7ec9c')+'"/></linearGradient><linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a8f9c"/><stop offset="1" stop-color="#1a4d58"/></linearGradient></defs><rect width="360" height="640" fill="url(#sky)"/><circle cx="298" cy="72" r="36" fill="'+(dusk?'#ffd08a':'#ffe27a')+'"/><circle cx="70" cy="90" r="18" fill="#fff8" /><circle cx="92" cy="86" r="24" fill="#fff6"/><circle cx="118" cy="94" r="16" fill="#fff7"/>';
}
function hills(){return '<path d="M-20 318 C50 258 110 292 176 252 C250 208 310 268 390 238 L390 430 L-20 430Z" fill="#3d7340"/><path d="M-20 368 C70 312 150 350 228 318 C304 286 342 338 390 312 L390 440 L-20 440Z" fill="#2d5a34"/>'}
function tree(x,y,s){return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')"><rect x="-5" y="28" width="10" height="36" rx="2" fill="#6a4224"/><ellipse cx="0" cy="10" rx="26" ry="30" fill="#2f6d38"/><ellipse cx="-10" cy="-4" rx="16" ry="18" fill="#3f8a46"/><ellipse cx="12" cy="2" rx="14" ry="16" fill="#246030"/></g>'}
function dock(){return '<g><rect x="0" y="428" width="150" height="16" fill="#8a562c"/><rect x="8" y="424" width="134" height="5" fill="#c0894a"/><rect x="18" y="444" width="10" height="50" fill="#6b3e1c"/><rect x="110" y="444" width="10" height="50" fill="#6b3e1c"/><rect x="0" y="428" width="150" height="3" fill="#5a3416"/></g>'}
function reeds(x){return '<g transform="translate('+x+' 470)" fill="#1f4a30"><path d="M0 40 C-4 10 -2 -10 2 -20"/><path d="M8 40 C10 8 16 -6 12 -22"/><path d="M16 40 C14 16 20 0 22 -12"/></g>'}
function rylee(x,y){
  return '<g transform="translate('+x+' '+y+')"><ellipse cx="0" cy="58" rx="16" ry="6" fill="#0003"/><rect x="-8" y="40" width="7" height="18" rx="2" fill="#2d3d55"/><rect x="2" y="40" width="7" height="18" rx="2" fill="#2d3d55"/><rect x="-7" y="54" width="8" height="5" rx="2" fill="#3a2a1a"/><rect x="3" y="54" width="8" height="5" rx="2" fill="#3a2a1a"/><rect x="-12" y="18" width="24" height="24" rx="6" fill="#3f7a46"/><rect x="-12" y="34" width="24" height="6" fill="#2f5a36"/><rect x="-16" y="20" width="6" height="16" rx="3" fill="#efc39a"/><rect x="10" y="20" width="6" height="16" rx="3" fill="#efc39a"/><circle cx="0" cy="6" r="12" fill="#f0c49a"/><path d="M-12 2 C-14 -10 -6 -16 0 -16 C8 -16 14 -10 12 2 C8 -6 4 -8 0 -8 C-5 -8 -9 -6 -12 2Z" fill="#5a3218"/><path d="M-11 4 C-10 -2 10 -2 11 4" fill="#5a3218"/><circle cx="-4" cy="7" r="1.5" fill="#2a1c10"/><circle cx="4" cy="7" r="1.5" fill="#2a1c10"/><path d="M-3 12 Q0 15 3 12" fill="none" stroke="#b57a55" stroke-width="1.2"/></g>';
}
function friend(x,y){
  return '<g transform="translate('+x+' '+y+')"><ellipse cx="0" cy="78" rx="24" ry="8" fill="#0003"/><rect x="-16" y="52" width="13" height="26" rx="3" fill="#3d2a1c"/><rect x="4" y="52" width="13" height="26" rx="3" fill="#3d2a1c"/><rect x="-15" y="74" width="14" height="6" rx="2" fill="#2a1c12"/><rect x="3" y="74" width="14" height="6" rx="2" fill="#2a1c12"/><rect x="-22" y="22" width="44" height="36" rx="7" fill="#8b3a22"/><rect x="-22" y="34" width="44" height="5" fill="#d9c08a"/><rect x="-22" y="46" width="44" height="5" fill="#6e2c18"/><rect x="-26" y="26" width="8" height="22" rx="4" fill="#efc39a"/><rect x="18" y="26" width="8" height="22" rx="4" fill="#efc39a"/><circle cx="0" cy="4" r="16" fill="#f0c49a"/><path d="M-16 0 C-18 -14 18 -14 16 0 C10 -8 -10 -8 -16 0" fill="#5c2e16"/><path d="M-14 8 C-16 26 16 26 14 8 C8 18 -8 18 -14 8" fill="#8a3d22"/><path d="M-8 16 C-4 22 4 22 8 16" fill="#6a2e18"/><circle cx="-5.5" cy="3" r="1.7" fill="#2a1c10"/><circle cx="5.5" cy="3" r="1.7" fill="#2a1c10"/><path d="M-4 8 Q0 11 4 8" fill="none" stroke="#b57a55" stroke-width="1.3"/></g>';
}
function mama(x,y){
  return '<g transform="translate('+x+' '+y+')"><ellipse cx="0" cy="58" rx="14" ry="5" fill="#0003"/><path d="M-12 22 C-14 50 -8 56 0 56 C8 56 14 50 12 22Z" fill="#c45c6a"/><rect x="-8" y="44" width="6" height="14" rx="2" fill="#efc39a"/><rect x="2" y="44" width="6" height="14" rx="2" fill="#efc39a"/><circle cx="0" cy="8" r="11" fill="#f0c49a"/><path d="M-12 2 C-16 10 -14 28 -6 26 C-2 12 2 12 6 26 C14 28 16 10 12 2 C8 -10 -8 -10 -12 2Z" fill="#4a2c18"/><path d="M-10 22 C-12 30 -8 34 -6 28" fill="none" stroke="#4a2c18" stroke-width="3" stroke-linecap="round"/><path d="M10 22 C12 30 8 34 6 28" fill="none" stroke="#4a2c18" stroke-width="3" stroke-linecap="round"/><circle cx="-3.5" cy="8" r="1.3" fill="#2a1c10"/><circle cx="3.5" cy="8" r="1.3" fill="#2a1c10"/><path d="M-2 13 Q0 15 2 13" fill="none" stroke="#b57a55" stroke-width="1.1"/></g>';
}
function elvis(x,y){
  return '<g transform="translate('+x+' '+y+')"><ellipse cx="0" cy="34" rx="10" ry="4" fill="#0003"/><rect x="-8" y="16" width="16" height="14" rx="6" fill="#e8d08a"/><rect x="-6" y="28" width="5" height="8" rx="2" fill="#efc39a"/><rect x="1" y="28" width="5" height="8" rx="2" fill="#efc39a"/><circle cx="0" cy="7" r="8" fill="#f0c49a"/><path d="M-8 4 C-7 -5 7 -5 8 4" fill="#5a3218"/><circle cx="-2.4" cy="7" r="1.1" fill="#2a1c10"/><circle cx="2.4" cy="7" r="1.1" fill="#2a1c10"/><circle cx="0" cy="12" r="1.4" fill="#e8a0a0"/></g>';
}
function grandma(x,y){
  return '<g transform="translate('+x+' '+y+')"><ellipse cx="0" cy="64" rx="18" ry="6" fill="#0003"/><path d="M-16 48 L-12 20 H12 L16 48Z" fill="#6b4a28"/><rect x="-14" y="24" width="28" height="30" rx="6" fill="#7a4aa0"/><rect x="-16" y="24" width="32" height="8" fill="#efe6c8"/><circle cx="0" cy="10" r="12" fill="#f0c49a"/><path d="M-13 6 C-15 -8 15 -8 13 6 C8 0 -8 0 -13 6" fill="#d8d0b8"/><circle cx="-4" cy="10" r="1.3" fill="#2a1c10"/><circle cx="4" cy="10" r="1.3" fill="#2a1c10"/><path d="M-3 15 Q0 18 3 15" fill="none" stroke="#b57a55" stroke-width="1.2"/><rect x="-18" y="20" width="5" height="4" rx="1" fill="#cfc4a0"/><rect x="13" y="20" width="5" height="4" rx="1" fill="#cfc4a0"/></g>';
}
function bass(x,y,s){return '<g class="bob" transform="translate('+x+' '+y+') scale('+(s||1)+')"><ellipse cx="0" cy="0" rx="46" ry="20" fill="#4a8a3a"/><ellipse cx="-6" cy="-4" rx="20" ry="8" fill="#6aaa52"/><path d="M40 0 L62 -14 L56 0 L62 14Z" fill="#3f7a32"/><path d="M-8 -18 L0 -8 L10 -16" fill="#3f7a32"/><circle cx="-24" cy="-3" r="3.4" fill="#e8e0c0"/><circle cx="-24" cy="-3" r="1.6" fill="#1a1a12"/><path d="M-36 4 Q-30 8 -24 4" fill="none" stroke="#2a4a22" stroke-width="1.4"/></g>'}
function pole(x,y){return '<g transform="translate('+x+' '+y+')"><line x1="0" y1="0" x2="78" y2="-102" stroke="#6b4423" stroke-width="3.5"/><line x1="78" y1="-102" x2="128" y2="-18" stroke="#d7e8ee" stroke-width="1.2"/></g>'}
function drawLake(extra){
  SPOT={Friend:[58,60],Rylee:[26,60],Mama:[74,58],Grandma:[50,48]};
  $('sc').innerHTML=sky()+hills()+tree(300,300,.9)+tree(20,320,.7)+'<rect y="400" width="360" height="240" fill="url(#water)"/>'+dock()+reeds(200)+reeds(240)+rylee(70,418)+pole(80,416)+friend(168,400)+(extra||'');
}
function places(n){
  var s=String(n);while(s.length<3)s='0'+s;
  SPOT={Friend:[50,36]};
  return '<g transform="translate(40 300)"><rect width="280" height="160" rx="18" fill="#1f4a3a"/><text x="140" y="32" text-anchor="middle" fill="#f3e2b0" font-size="14">wooden scale</text>'+[0,1,2].map(function(i){var lab=['hundreds','tens','ones'][i];return '<g transform="translate('+(20+i*90)+' 48)"><rect width="80" height="74" rx="12" fill="#fff"/><text x="40" y="48" text-anchor="middle" font-size="36" font-weight="700">'+s[i]+'</text><text x="40" y="96" text-anchor="middle" font-size="11" fill="#f3e2b0">'+lab+'</text></g>'}).join('')+'</g>';
}
function vline(val){
  SPOT={Friend:[28,46]};
  return '<g transform="translate(250 240)"><rect x="-18" y="-16" width="36" height="212" rx="8" fill="#c4a46a"/><line x1="0" y1="0" x2="0" y2="180" stroke="#1c1916" stroke-width="4"/><circle cy="0" r="6" fill="#1c1916"/><circle cy="90" r="6" fill="#c45c12"/><circle cy="180" r="6" fill="#1c1916"/><text x="16" y="6" font-size="14">50</text><text x="16" y="96" font-size="14" fill="#c45c12">45</text><text x="16" y="186" font-size="14">40</text><circle cy="'+(180-((val-40)/10)*180)+'" r="10" fill="#f3c14a" stroke="#1c1916" stroke-width="2"/><text x="-78" y="'+(184-((val-40)/10)*180)+'" font-size="16" font-weight="700">'+val+' yd</text></g>';
}
function strip(whole,part){
  SPOT={Friend:[50,42]};
  var w=260,a=part/whole*w;
  return '<g transform="translate(50 340)"><rect width="'+w+'" height="48" rx="10" fill="#e8d7a8"/><rect width="'+a+'" height="48" rx="10" fill="#c45c12"/><text x="'+a/2+'" y="30" text-anchor="middle" fill="#fff" font-size="16">'+part+'</text><text x="'+(a+(w-a)/2)+'" y="30" text-anchor="middle" font-size="16">n</text><text x="130" y="74" text-anchor="middle" font-size="14">whole = '+whole+'</text></g>';
}
