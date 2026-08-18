function goMap(){clearUI();SC.map()}
function goFish(){clearUI();SC.fish()}
function goRange(){clearUI();SC.range()}
function goTrap(){clearUI();SC.trap()}
function drawLake(extra){
 $('sc').innerHTML=sky()+hills()+'<rect y="390" width="360" height="250" fill="url(#water)"/>'+rylee(64,430)+pole(74,428)+friend(150,416)+(extra||'');
}
const SC={
title(){
 $('where').textContent='Lost Creek Ranch';
 $('sc').innerHTML=sky()+hills()+'<rect y="400" width="360" height="240" fill="url(#water)"/>'+rylee(70,430)+pole(78,430)+friend(150,418)+mama(250,430)+elvis(278,448)+'<g transform="translate(40 110)"><rect width="280" height="90" rx="8" fill="#5c3a22"/><rect x="6" y="6" width="268" height="78" rx="6" fill="#f3e2b0"/><text x="140" y="42" text-anchor="middle" font-size="22" fill="#3b2a18">Lost Creek Ranch</text></g>';
 say('Friend','Sun is up, bud. Fish are hitting at The Hole.');
 acts([{t:"Let's go fishing",fn:'goMap'}]);
},
map(){
 $('where').textContent='The ranch';
 $('sc').innerHTML=sky()+hills()+'<rect y="430" width="360" height="210" fill="#2f5530"/><ellipse cx="80" cy="470" rx="70" ry="36" fill="#2e7a88"/><rect x="200" y="430" width="70" height="50" fill="#8b3a22"/>'+rylee(180,500)+friend(230,488);
 say('Friend','Start at the water.');
 acts([{t:'The Hole',fn:'goFish'},{t:'The Range',c:'pine',fn:'goRange'},{t:'Trapline',c:'ghost',fn:'goTrap'}]);
},
fish(){$('where').textContent='The Hole';drawLake();say('Friend','Tap Cast.');acts([{t:'Cast',fn:'cast'}])},
range(){
 $('where').textContent='The Range';
 $('sc').innerHTML=sky(1)+'<rect y="360" width="360" height="280" fill="#c4a46a"/>'+rylee(90,470)+friend(160,456);
 say('Friend','Four cans on the fence.');
 acts([{t:'Shoot the far can',fn:'shoot'}]);
},
trap(){
 $('where').textContent='The Trapline';
 $('sc').innerHTML=sky()+'<rect y="380" width="360" height="260" fill="#2f5530"/>'+rylee(80,500)+friend(150,486);
 say('Friend','Humane traps. We take them to the shelter.');
 acts([{t:'Check the line',fn:'checkTraps'}]);
},
grandma(){
 $('where').textContent='Grandma porch';
 $('sc').innerHTML=sky(1)+'<rect y="360" width="360" height="280" fill="#3f6b3a"/><rect x="160" y="260" width="170" height="140" fill="#8b5a32"/>'+grandma(90,300)+rylee(50,340)+friend(150,360);
 say('Grandma','That is my boy. I saved you the good chair.');
 acts([{t:'Sit with Grandma',fn:'porchGame'}]);
}
};
function cast(){clearUI();drawLake('<circle class="splash" cx="220" cy="470" r="18" fill="#d5f3f8"/>');say('Friend','Good cast...');setTimeout(bite,1100)}
function bite(){drawLake(bass(230,470,0.9));say('Friend','FISH ON. Reel him.');acts([{t:'Reel!',fn:'land'}])}
function land(){drawLake(bass(160,360,1.2));say('Friend','A good bass. Weigh him.');acts([{t:'Weigh him',fn:'weigh1'}])}
function weigh1(){
 $('sc').innerHTML=sky()+'<rect y="300" width="360" height="340" fill="#5c3a22"/><text x="180" y="420" text-anchor="middle" font-size="48">285 g</text>'+bass(180,520,1);
 say('Friend','Yours 285. Mine 264. Who is heavier?');
 picks([{t:'Rylee 285',ok:1},{t:'Friend 264',hint:'285 is more than 264.'}],weigh2);
}
function weigh2(){say('Friend','Yours 412. Mine 420.');picks([{t:'412',hint:'420 is more.'},{t:'420',ok:1}],weigh3)}
function weigh3(){say('Friend','Lightest to heaviest: 318, 381, 308.');picks([{t:'308, 318, 381',ok:1},{t:'318, 308, 381',hint:'308 is smallest.'},{t:'381, 318, 308',hint:'Heaviest first.'}],function(){clearUI();SC.grandma()})}
function shoot(){clearUI();say('Friend','47 yards. Nearest ten?');picks([{t:'50 yards',ok:1},{t:'40 yards',hint:'47 is past 45.'},{t:'70 yards',hint:'Nearest ten.'}],shoot2)}
function shoot2(){say('Friend','352 feet. Nearest hundred?');picks([{t:'300',hint:'Past 350, go up.'},{t:'400',ok:1},{t:'350',hint:'Nearest hundred.'}],function(){clearUI();SC.grandma()})}
function checkTraps(){clearUI();say('Friend','12 traps, 5 empty. How many to the shelter?');picks([{t:'7',ok:1},{t:'17',hint:'12 take away 5.'},{t:'5',hint:'Five are empty.'}],trap2)}
function trap2(){say('Friend','Room for 24. Brought 11. How many more?');picks([{t:'13',ok:1},{t:'35',hint:'Not adding.'},{t:'11',hint:'Already have 11.'}],function(){clearUI();SC.grandma()})}
function porchGame(){say('Grandma','Skip a rock three times.');acts([{t:'Skip',fn:'skip'}]);window._sk=0}
function skip(){
 window._sk=(window._sk||0)+1;
 drawLake(grandma(200,400)+rylee(80,428));
 if(window._sk<3){say('Grandma',window._sk===1?'One hop.':'Two hops.');acts([{t:'Skip',fn:'skip'}])}
 else{ST.stars+=2;save();stars();say('Grandma','Three hops. That is a good day.');acts([{t:'Back to the ranch',c:'pine',fn:'goMap'}])}
}
stars();SC.title();
