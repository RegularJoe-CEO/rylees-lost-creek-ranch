function goMap(){clearUI();SC.map()}
function goFish(){clearUI();SC.fish()}
function goRange(){clearUI();SC.range()}
function goTrap(){clearUI();SC.trap()}
function drawLake(extra){
 $('sc').innerHTML=sky()+hills()+'<rect y="390" width="360" height="250" fill="url(#water)"/>'+rylee(64,430)+pole(74,428)+friend(150,416)+(extra||'');
}
function sayNext(who,text,fn,label){
 say(who,text);
 acts([{t:label||'Keep going',fn:fn}]);
}
const SC={
title(){
 $('where').textContent='Lost Creek Ranch';
 $('sc').innerHTML=sky()+hills()+'<rect y="400" width="360" height="240" fill="url(#water)"/>'+rylee(70,430)+pole(78,430)+friend(150,418)+mama(250,430)+elvis(278,448)+'<g transform="translate(40 110)"><rect width="280" height="90" rx="8" fill="#5c3a22"/><rect x="6" y="6" width="268" height="78" rx="6" fill="#f3e2b0"/><text x="140" y="42" text-anchor="middle" font-size="22" fill="#3b2a18">Lost Creek Ranch</text></g>';
 sayNext('Friend','Sun is up, bud. Lost Creek is glass this morning. Mama packed lunch. Elvis already tried to eat a cracker wrapper.','dock1');
},
map(){
 $('where').textContent='The ranch';
 $('sc').innerHTML=sky()+hills()+'<rect y="430" width="360" height="210" fill="#2f5530"/><ellipse cx="80" cy="470" rx="70" ry="36" fill="#2e7a88"/><rect x="200" y="430" width="70" height="50" fill="#8b3a22"/>'+rylee(180,500)+friend(230,488);
 say('Friend','We can fish The Hole, walk the trapline, or shoot cans. I would start at the water. Numbers are easier when they belong to a bass.');
 acts([{t:'The Hole',fn:'goFish'},{t:'The Range',c:'pine',fn:'goRange'},{t:'Trapline',c:'ghost',fn:'goTrap'}]);
},
fish(){ $('where').textContent='The Hole'; drawLake(); sayNext('Friend','See that creel tag on your bag? Every fish we keep gets a number. That number has jobs. Hundreds, tens, and ones. Ready to put a fish on it?','castReady'); },
range(){
 $('where').textContent='The Range';
 $('sc').innerHTML=sky(1)+'<rect y="360" width="360" height="280" fill="#c4a46a"/>'+rylee(90,470)+friend(160,456);
 sayNext('Friend','Four cans on the fence. Before you shoot, look at the post. We are going to round it the way Miss writes it at school: a vertical number line.','rangeTalk');
},
trap(){
 $('where').textContent='The Trapline';
 $('sc').innerHTML=sky()+'<rect y="380" width="360" height="260" fill="#2f5530"/>'+rylee(80,500)+friend(150,486);
 sayNext('Friend','Humane traps. Anything we catch rides to the Jacksboro shelter. The line is a story problem you can walk.','trapTalk');
},
grandma(){
 $('where').textContent='Grandma porch';
 $('sc').innerHTML=sky(1)+'<rect y="360" width="360" height="280" fill="#3f6b3a"/><rect x="160" y="260" width="170" height="140" fill="#8b5a32"/>'+grandma(90,300)+rylee(50,340)+friend(150,360)+mama(280,400)+elvis(310,418);
 sayNext('Grandma','That is my boy. I saved you the good chair. Tell me what you learned out there before we skip a rock.','gmTalk');
}
};
function dock1(){sayNext('Mama','Yall be back before the heat. Friend, do not let him skip the numbers on the scale. That is school.','dock2')}
function dock2(){sayNext('Friend','Fair. We fish first. Then we read the scale the way Bluebonnet wants: what each digit is worth. Come on.','goMap')}
function castReady(){say('Friend','Nice and quiet. Soft cast past the grass. Tap Cast.');acts([{t:'Cast',fn:'cast'}])}
function cast(){clearUI();drawLake('<circle class="splash" cx="220" cy="470" r="18" fill="#d5f3f8"/>');sayNext('Friend','Good cast. Tip down. Let him take it...','bite','Wait')}
function bite(){drawLake(bass(230,470,0.9));say('Friend','FISH ON. Keep the rod bent. Reel him.');acts([{t:'Reel!',fn:'land'}])}
function land(){drawLake(bass(160,360,1.2));sayNext('Friend','That is a good Jacksboro bass. Not a giant. Perfect for the scale. Look: three digits.','scale1')}
function scale1(){
 $('sc').innerHTML=sky()+'<rect y="300" width="360" height="340" fill="#5c3a22"/><text x="180" y="380" text-anchor="middle" font-size="16" fill="#f3e2b0">wooden scale</text><text x="180" y="450" text-anchor="middle" font-size="56" font-weight="700" fill="#fff">285</text><text x="90" y="490" text-anchor="middle" font-size="12" fill="#d9c08a">hundreds</text><text x="180" y="490" text-anchor="middle" font-size="12" fill="#d9c08a">tens</text><text x="270" y="490" text-anchor="middle" font-size="12" fill="#d9c08a">ones</text>'+bass(180,560,1);
 sayNext('Friend','285 grams. Do not say two-eighty-five yet. In Bluebonnet we name the places. The 2 is not two. It is 2 hundreds.','scale2');
}
function scale2(){sayNext('Friend','2 hundreds. 8 tens. 5 ones. That is called unit form. School will write it like this: 2 hundreds 8 tens 5 ones.','scale3')}
function scale3(){sayNext('Friend','Same number, expanded: (2 x 100) + (8 x 10) + (5 x 1). That is just the jobs added up. 200 + 80 + 5.','scale4')}
function scale4(){sayNext('Friend','My bass is 264. Same hundreds. So we do not argue about the 2. We look next door, at the tens. 8 tens versus 6 tens.','scaleQ')}
function scaleQ(){
 say('Friend','Your tens are 8. Mine are 6. Who caught the heavier bass?');
 picks([{t:'Rylee. 285 is heavier',ok:1},{t:'Friend. 264 is heavier',hint:'Hundreds are the same. 8 tens is more than 6 tens. Yours wins.'}],scale5);
}
function scale5(){sayNext('Friend','Fish on. You compared left to right. That is the whole trick. Next bass jumped.','scale6')}
function scale6(){sayNext('Friend','Yours 412. Mine 420. Say it in unit form in your head: 4 hundreds 1 ten 2 ones versus 4 hundreds 2 tens 0 ones.','scaleQ2')}
function scaleQ2(){
 say('Friend','Hundreds match. Where do you look next?');
 picks([{t:'The tens. 2 tens beats 1 ten, so 420',ok:1},{t:'The ones. 2 is more than 0, so 412',hint:'Do not jump to ones. Places go left to right. Tens first.'}],scale7);
}
function scale7(){sayNext('Friend','Yes. Tens decide. Cooler time. Three crappie: 318, 381, 308. Same hundreds. Line them up by tens, then ones.','scaleQ3')}
function scaleQ3(){
 say('Friend','Lightest to heaviest. Start with the smallest tens.');
 picks([{t:'308, then 318, then 381',ok:1},{t:'318, then 308, then 381',hint:'308 has 0 tens. That is the lightest.'},{t:'381, then 318, then 308',hint:'That is heaviest first. We want the cooler list lightest first.'}],function(){ST.done.hole=1;save();clearUI();SC.grandma()});
}
function rangeTalk(){sayNext('Friend','A vertical number line stands up like a fence post. 40 at the bottom. 50 at the top. 45 is the middle mark.','rangeTalk2')}
function rangeTalk2(){sayNext('Friend','If the can is past 45, it rounds up to 50. If it is under 45, it stays at 40. That middle mark is the boss.','rangeShoot')}
function rangeShoot(){say('Friend','Take the far can.');acts([{t:'Shoot the far can',fn:'shoot'}])}
function shoot(){clearUI();sayNext('Friend','Clink. The tag says 47 yards. Find 47 on that fence-post line. 45 is the middle. 47 is past it.','shootQ')}
function shootQ(){
 say('Friend','Nearest ten. Which way does 47 go?');
 picks([{t:'Up to 50. It passed the middle.',ok:1},{t:'Down to 40. It is closer to 40.',hint:'45 is the middle. 47 is two steps past 45, so it goes up.'},{t:'Stay at 47.',hint:'Rounding means we pick a friendly ten. 47 is not the ten.'}],shoot2);
}
function shoot2(){sayNext('Friend','Now the pasture can. 352 feet. This time the friendly number is a hundred. Middle between 300 and 400 is 350.','shootQ2')}
function shootQ2(){
 say('Friend','352 compared to 350. Up or down?');
 picks([{t:'Up to 400. It passed 350.',ok:1},{t:'Down to 300.',hint:'352 is past the middle 350, so it goes up to 400.'},{t:'Stay at 350.',hint:'350 is the middle, not the answer. 352 already passed it.'}],function(){ST.done.range=1;save();clearUI();SC.grandma()});
}
function trapTalk(){sayNext('Friend','Twelve traps on the wire. Some empty, some full. School would draw a strip: one long bar cut into two pieces. Empty, and going to the shelter.','trapTalk2')}
function trapTalk2(){sayNext('Friend','The whole strip is 12. One piece is 5 empty. The other piece is what we do not know yet. We write 12 = 5 + n.','trapCheck')}
function trapCheck(){say('Friend','Walk the line with me.');acts([{t:'Check the line',fn:'checkTraps'}])}
function checkTraps(){
 clearUI();
 say('Friend','Twelve traps. Five empty. How many animals ride to the shelter? That is n.');
 picks([{t:'n = 7',ok:1},{t:'n = 17',hint:'Do not add the empty ones. The whole is 12. Take 5 away.'},{t:'n = 5',hint:'Five are empty. The other piece of the strip is the animals.'}],trap2);
}
function trap2(){sayNext('Friend','Good. Shelter board says room for 24. We already brought 11. Same strip: 24 is the whole. 11 is one piece. How many more can we help?','trapQ2')}
function trapQ2(){
 say('Friend','24 = 11 + n. What is n?');
 picks([{t:'n = 13',ok:1},{t:'n = 35',hint:'That adds the whole and the piece. We need what is left.'},{t:'n = 11',hint:'That is the piece we already have.'}],function(){ST.done.trap=1;save();clearUI();SC.grandma()});
}
function gmTalk(){sayNext('Friend','He read 285 as 2 hundreds 8 tens 5 ones. Compared left to right. That is the Bluebonnet way.','gmTalk2')}
function gmTalk2(){sayNext('Grandma','That is my boy. Numbers that belong to a fish stick better. Skip a rock for me.','porchGame')}
function porchGame(){say('Grandma','Three hops. You and me.');acts([{t:'Skip',fn:'skip'}]);window._sk=0}
function skip(){
 window._sk=(window._sk||0)+1;
 drawLake(grandma(200,400)+rylee(80,428));
 if(window._sk<3){say('Grandma',window._sk===1?'One hop. Tell me about the tens.':'Two hops. One more.');acts([{t:'Skip',fn:'skip'}])}
 else{ST.stars+=2;save();stars();say('Grandma','Three hops. You and me. That is a good day.');acts([{t:'Back to the ranch',c:'pine',fn:'goMap'}])}
}
stars();
SC.title();
