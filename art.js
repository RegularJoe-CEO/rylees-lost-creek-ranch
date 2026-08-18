const $=id=>document.getElementById(id);
const ST=JSON.parse(localStorage.getItem('lcr3')||'{"stars":0,"done":{}}');
const save=()=>localStorage.setItem('lcr3',JSON.stringify(ST));
const stars=()=>$('stars').textContent=ST.stars;
let HIST=[];
let LAST=null;
function go(name){
  if(typeof name!=='string' || !window[name]) return;
  if(HIST[HIST.length-1]!==name) HIST.push(name);
  LAST=name;
  clearUI();
  window[name]();
}
function back(){
  if(HIST.length>1){ HIST.pop(); const n=HIST[HIST.length-1]; LAST=n; clearUI(); window[n](); }
  else ranch();
}
function ranch(){ HIST=['map']; LAST='map'; clearUI(); map(); }
function hear(){ if(LAST){ clearUI(); window[LAST](); } }
function say(who,text){$('talk').classList.remove('hide');$('talk').innerHTML='<strong>'+who+'</strong>'+text}
function acts(btns){$('acts').innerHTML=btns.map(b=>'<button class="btn '+(b.c||'')+'" onclick="'+(b.fn.indexOf('(')>=0?b.fn:'go(\''+b.fn+'\')')+'">'+b.t+'</button>').join('')}
function sayNext(who,text,fn,label){ say(who,text); acts([{t:label||'Next',fn:fn}]); }
function picks(opts,nextName){
  $('acts').innerHTML='';
  $('choice').classList.remove('hide');
  $('choice').innerHTML=opts.map((o,i)=>'<button class="pick" id="p'+i+'">'+o.t+'</button>').join('')+'<button class="btn ghost" onclick="hear()">Hear it again</button>';
  opts.forEach((o,i)=>{$('p'+i).onclick=()=>{
    if(o.ok){$('p'+i).classList.add('ok');ST.stars++;save();stars();setTimeout(function(){go(nextName)},550)}
    else{$('p'+i).classList.add('no');say('Friend',o.hint||'Look at the place we just talked about.')}
  };});
}
function clearUI(){$('talk').classList.add('hide');$('acts').innerHTML='';$('choice').classList.add('hide');$('choice').innerHTML=''}
function sky(dusk){
  return '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+(dusk?'#e39b5a':'#6eb7c8')+'"/><stop offset="1" stop-color="'+(dusk?'#f3d7a0':'#d5ec9a')+'"/></linearGradient><linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e7a88"/><stop offset="1" stop-color="#1c4e58"/></linearGradient></defs><rect width="360" height="640" fill="url(#sky)"/><circle cx="292" cy="78" r="34" fill="#f4e27a"/>';
}
function hills(){return '<path d="M-20 310 C60 250 120 280 180 250 C240 220 300 270 380 240 L380 420 L-20 420Z" fill="#3f6b3a"/><path d="M-20 360 C80 300 160 340 230 310 C300 280 340 330 380 300 L380 430 L-20 430Z" fill="#2f5530"/>'}
function rylee(x,y){return '<g transform="translate('+x+' '+y+')"><ellipse cx="0" cy="46" rx="16" ry="6" fill="#0003"/><rect x="-11" y="18" width="22" height="22" rx="4" fill="#3f7a46"/><rect x="-10" y="38" width="8" height="16" fill="#3c4a2e"/><rect x="2" y="38" width="8" height="16" fill="#3c4a2e"/><circle cx="0" cy="8" r="11" fill="#efc39a"/><path d="M-11 6 C-12 -6 12 -6 11 6 L8 4 C4 -2 -4 -2 -8 4Z" fill="#5a3218"/><circle cx="-3.5" cy="8" r="1.3" fill="#2a1c10"/><circle cx="3.5" cy="8" r="1.3" fill="#2a1c10"/></g>'}
function friend(x,y){return '<g transform="translate('+x+' '+y+')"><ellipse cx="0" cy="62" rx="22" ry="7" fill="#0003"/><rect x="-18" y="20" width="36" height="30" rx="5" fill="#8b3a22"/><rect x="-16" y="24" width="32" height="4" fill="#d9c08a"/><rect x="-14" y="48" width="11" height="18" fill="#3d2a1c"/><rect x="3" y="48" width="11" height="18" fill="#3d2a1c"/><circle cx="0" cy="6" r="14" fill="#efc39a"/><path d="M-12 10 C-14 22 14 22 12 10 C8 18 -8 18 -12 10" fill="#7a3a22"/><path d="M-13 2 C-16 -8 16 -8 13 2" fill="#4a2a16"/><circle cx="-5" cy="5" r="1.5" fill="#2a1c10"/><circle cx="5" cy="5" r="1.5" fill="#2a1c10"/></g>'}
function mama(x,y){return '<g transform="translate('+x+' '+y+')"><rect x="-10" y="20" width="20" height="26" rx="6" fill="#c45c6a"/><circle cx="0" cy="8" r="10" fill="#efc39a"/><path d="M-11 -2 C-16 16 -8 28 -4 22 C-2 10 2 10 4 22 C8 28 16 16 11 -2 C6 -8 -6 -8 -11 -2" fill="#4a2c18"/></g>'}
function elvis(x,y){return '<g transform="translate('+x+' '+y+')"><rect x="-7" y="14" width="14" height="12" rx="4" fill="#e8d08a"/><circle cx="0" cy="6" r="7" fill="#efc39a"/><path d="M-7 4 C-6 -3 6 -3 7 4" fill="#5a3218"/><circle cx="-2" cy="6" r="1" fill="#2a1c10"/><circle cx="2" cy="6" r="1" fill="#2a1c10"/></g>'}
function grandma(x,y){return '<g transform="translate('+x+' '+y+')"><rect x="-12" y="22" width="24" height="26" rx="5" fill="#7a4aa0"/><rect x="-14" y="22" width="28" height="8" fill="#efe6c8"/><circle cx="0" cy="10" r="11" fill="#efc39a"/><path d="M-12 6 C-14 -6 14 -6 12 6 C8 2 -8 2 -12 6" fill="#cfc4a0"/><circle cx="-4" cy="10" r="1.2" fill="#2a1c10"/><circle cx="4" cy="10" r="1.2" fill="#2a1c10"/></g>'}
function bass(x,y,s){return '<g class="bob" transform="translate('+x+' '+y+') scale('+(s||1)+')"><ellipse cx="0" cy="0" rx="42" ry="18" fill="#3f7a3a"/><path d="M38 0 L58 -12 L54 0 L58 12Z" fill="#3f7a3a"/><circle cx="-22" cy="-2" r="3" fill="#e8e0c0"/><circle cx="-22" cy="-2" r="1.4" fill="#1a1a12"/></g>'}
function pole(x,y){return '<g transform="translate('+x+' '+y+')"><line x1="0" y1="0" x2="70" y2="-90" stroke="#6b4423" stroke-width="3"/><line x1="70" y1="-90" x2="120" y2="-20" stroke="#cde" stroke-width="1"/></g>'}
function drawLake(extra){$('sc').innerHTML=sky()+hills()+'<rect y="390" width="360" height="250" fill="url(#water)"/>'+rylee(64,430)+pole(74,428)+friend(150,416)+(extra||'')}
function places(n){
  var s=String(n);
  while(s.length<3)s='0'+s;
  return '<g transform="translate(40 330)"><rect width="280" height="150" rx="16" fill="#1f4a3a"/><text x="140" y="36" text-anchor="middle" fill="#f3e2b0" font-size="14">scale</text>'+
    [0,1,2].map(function(i){var lab=['hundreds','tens','ones'][i];return '<g transform="translate('+(20+i*90)+' 52)"><rect width="80" height="70" rx="10" fill="#fff"/><text x="40" y="46" text-anchor="middle" font-size="36" font-weight="700">'+s[i]+'</text><text x="40" y="88" text-anchor="middle" font-size="11" fill="#f3e2b0">'+lab+'</text></g>';}).join('')+'</g>';
}
function vline(val){
  return '<g transform="translate(250 250)"><line x1="0" y1="0" x2="0" y2="180" stroke="#1c1916" stroke-width="4"/><circle cy="0" r="6" fill="#1c1916"/><circle cy="90" r="6" fill="#c45c12"/><circle cy="180" r="6" fill="#1c1916"/><text x="14" y="6" font-size="14">50</text><text x="14" y="96" font-size="14" fill="#c45c12">45</text><text x="14" y="186" font-size="14">40</text><circle cy="'+(180-((val-40)/10)*180)+'" r="10" fill="#f3c14a" stroke="#1c1916" stroke-width="2"/><text x="-70" y="'+(184-((val-40)/10)*180)+'" font-size="16" font-weight="700">'+val+'</text></g>';
}
function strip(whole,part){
  var w=260,a=part/whole*w;
  return '<g transform="translate(50 360)"><rect width="'+w+'" height="44" rx="8" fill="#e8d7a8"/><rect width="'+a+'" height="44" rx="8" fill="#c45c12"/><text x="'+a/2+'" y="28" text-anchor="middle" fill="#fff" font-size="16">'+part+'</text><text x="'+(a+(w-a)/2)+'" y="28" text-anchor="middle" font-size="16">n</text><text x="130" y="68" text-anchor="middle" font-size="14">whole = '+whole+'</text></g>';
}
