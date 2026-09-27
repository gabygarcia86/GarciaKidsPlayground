(() => {
"use strict";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const loading = document.getElementById("loading");
const W = 1600, H = 900, ROUNDS = 10;

const ASSET_PATHS = {
  background:"assets/background.png",
  knight:"assets/knight.png",
  goblinSword:"assets/goblin_sword.png",
  goblinMace:"assets/goblin_mace.png",
  goblinArcher:"assets/goblin_archer.png",
  question:"assets/question_banner.png",
  choice:"assets/choice_board.png",
  tip:"assets/tip_sign.png"
};

const images = {};
const assetsReady = Promise.all(Object.entries(ASSET_PATHS).map(([key,src]) => new Promise((resolve,reject)=>{
  const img = new Image(); img.onload=()=>{images[key]=img;resolve();}; img.onerror=()=>reject(new Error(`Could not load ${src}`)); img.src=src;
})));

function q(id, prompt, correct, wrong1, wrong2){ return {id,prompt,choices:[correct,wrong1,wrong2],correct}; }

const firstGradeQuestions = [
    q("f001","Which word rhymes with cat?","hat","dog","sun"),
    q("f002","Which word rhymes with dog?","frog","fish","book"),
    q("f003","Which word rhymes with sun?","fun","tree","cake"),
    q("f004","Which word rhymes with cake?","lake","moon","bed"),
    q("f005","Which word rhymes with bee?","tree","ball","cup"),
    q("f006","Which word rhymes with light?","kite","leaf","rain"),
    q("f007","Which word rhymes with boat?","goat","bird","star"),
    q("f008","Which word rhymes with mouse?","house","chair","sock"),
    q("f009","Which word rhymes with blue?","shoe","red","green"),
    q("f010","Which word rhymes with play?","day","car","fish"),
    q("f011","Which word starts with the same sound as moon?","milk","sun","leaf"),
    q("f012","Which word starts with the same sound as fish?","fan","map","top"),
    q("f013","Which word starts with the same sound as ball?","bat","cat","sun"),
    q("f014","Which word starts with the same sound as rabbit?","rain","kite","moon"),
    q("f015","Which word starts with the same sound as turtle?","top","pig","fan"),
    q("f016","Which word starts with the same sound as goat?","game","book","leaf"),
    q("f017","Which word starts with the same sound as sun?","sock","map","rain"),
    q("f018","Which word starts with the same sound as kite?","king","dog","fish"),

    q("f019","The puppy is very ___. It likes to run and play.","happy","square","cold"),
    q("f020","I wear shoes on my ___.","feet","ears","nose"),
    q("f021","We use our eyes to ___.","see","jump","taste"),
    q("f022","A bird can ___.","fly","read","drive"),
    q("f023","At night, the sky is usually ___.","dark","loud","soft"),
    q("f024","Ice feels ___.","cold","hot","dry"),
    q("f025","A lemon tastes ___.","sour","round","quiet"),
    q("f026","We sleep in a ___.","bed","spoon","shoe"),
    q("f027","A cow says ___.","moo","meow","quack"),
    q("f028","A fish lives in ___.","water","sand","trees"),
    q("f029","We use a spoon to ___.","eat","sleep","write"),
    q("f030","The opposite of big is ___.","small","tall","wide"),
    q("f031","The opposite of up is ___.","down","over","near"),
    q("f032","The opposite of hot is ___.","cold","fast","dry"),
    q("f033","The opposite of fast is ___.","slow","high","hard"),
    q("f034","The opposite of day is ___.","night","week","sun"),
    q("f035","Which word means almost the same as glad?","happy","angry","sleepy"),
    q("f036","Which word means almost the same as tiny?","small","huge","loud"),

    q("f037","Sam has a red ball. What color is Sam's ball?","red","blue","green"),
    q("f038","Mia has two cats. How many cats does Mia have?","two","three","one"),
    q("f039","Ben puts on his coat because it is cold. Why does Ben wear a coat?","It is cold.","It is bedtime.","He is swimming."),
    q("f040","Lily sees a bee on a flower. Where is the bee?","on a flower","under a bed","in a cup"),
    q("f041","Noah eats cereal in the morning. When does Noah eat cereal?","in the morning","at midnight","after dinner"),
    q("f042","Ava has a yellow kite. What does Ava have?","a kite","a bike","a book"),
    q("f043","The frog jumps into the pond. Where does the frog jump?","into the pond","onto a roof","into a box"),
    q("f044","Leo reads a book before bed. What does Leo read?","a book","a map","a sign"),
    q("f045","Emma gives the dog some water. What does the dog get?","water","milk","juice"),
    q("f046","The bus stops by the school. Where does the bus stop?","by the school","at the beach","in the kitchen"),
    q("f047","Zoe plants a seed in the dirt. What does Zoe plant?","a seed","a rock","a toy"),
    q("f048","Max wears boots in the rain. What does Max wear?","boots","sandals","slippers"),
    q("f049","The baby is sleeping in the crib. Who is sleeping?","the baby","the teacher","the farmer"),
    q("f050","The apple is on the table. Where is the apple?","on the table","under the rug","in the bathtub"),
    q("f051","Nina has a pet rabbit named Snow. What kind of pet does Nina have?","a rabbit","a turtle","a fish"),
    q("f052","Owen kicks the soccer ball. What does Owen kick?","the soccer ball","the door","the chair"),
    q("f053","The brown dog runs to the gate. What color is the dog?","brown","purple","yellow"),
    q("f054","Ella drinks milk with lunch. What does Ella drink?","milk","tea","soda"),

    q("f055","Which is a complete sentence?","The dog runs.","the blue dog","under the chair"),
    q("f056","Which word is a naming word?","apple","jump","quickly"),
    q("f057","Which word is an action word?","run","blue","chair"),
    q("f058","Which word names a person?","teacher","school","laugh"),
    q("f059","Which word names a place?","park","sing","soft"),
    q("f060","Which word names a thing?","pencil","skip","happy"),
    q("f061","Which word is a color?","purple","seven","jump"),
    q("f062","Which word tells what someone can do?","dance","yellow","table"),
    q("f063","Which word should begin with a capital letter?","Monday","dog","apple"),
    q("f064","Which mark goes at the end of a question?","?","!","."),

    q("f065","Which word has the short a sound, like apple?","map","moon","feet"),
    q("f066","Which word has the short e sound, like egg?","bed","bike","boat"),
    q("f067","Which word has the short i sound, like igloo?","pig","cake","rope"),
    q("f068","Which word has the short o sound, like octopus?","fox","seed","kite"),
    q("f069","Which word has the short u sound, like umbrella?","sun","moon","feet"),
    q("f070","Which word has two syllables?","rabbit","cat","fish"),
    q("f071","Which word has one syllable?","frog","tiger","apple"),
    q("f072","Which word belongs with cat, dog, and rabbit?","pet","chair","rain"),
    q("f073","Which word belongs with red, blue, and green?","color","animal","food"),
    q("f074","Read: 'The hen sits on her eggs.' What is sitting on the eggs?","the hen","the duck","the pig"),
    q("f075","Read: 'Jay opens his umbrella.' What is Jay holding?","an umbrella","a sandwich","a pencil"),
    q("f076","Which word rhymes with ring?","sing","road","duck"),
    q("f077","Which word starts with the same sound as desk?","duck","sun","map"),
    q("f078","The opposite of wet is ___.","dry","soft","long"),
    q("f079","Which word is an action word?","clap","green","window"),
    q("f080","Which mark belongs at the end of 'What is your name___'?","?","!","." )
  ];

  // -------- THIRD GRADE BANK: 80 QUESTIONS --------
  const thirdGradeQuestions = [
    q("t001","Which word means nearly the same as enormous?","huge","tiny","quiet"),
    q("t002","Which word means nearly the same as rapid?","fast","slow","soft"),
    q("t003","Which word means nearly the same as silent?","quiet","bright","rough"),
    q("t004","Which word means nearly the same as begin?","start","finish","carry"),
    q("t005","Which word means nearly the same as clever?","smart","sleepy","empty"),
    q("t006","Which word is the opposite of ancient?","modern","old","broken"),
    q("t007","Which word is the opposite of narrow?","wide","thin","small"),
    q("t008","Which word is the opposite of include?","exclude","invite","collect"),
    q("t009","Which word is the opposite of arrive?","leave","enter","visit"),
    q("t010","Which word is the opposite of gentle?","rough","kind","quiet"),

    q("t011","In the sentence 'The exhausted runner sat down,' what does exhausted mean?","very tired","very excited","very hungry"),
    q("t012","In the sentence 'The glass is fragile, so carry it carefully,' what does fragile mean?","easy to break","very heavy","hard to see"),
    q("t013","In the sentence 'We were eager to open the gift,' what does eager mean?","excited and ready","afraid to move","too tired to care"),
    q("t014","In the sentence 'The tiny ant carried a crumb,' what does tiny mean?","very small","very loud","very fast"),
    q("t015","In the sentence 'The path was slippery after the rain,' what does slippery mean?","hard to stand on","easy to see through","full of flowers"),
    q("t016","In the sentence 'Maya glanced at the clock,' what does glanced mean?","looked quickly","stared for an hour","covered it up"),
    q("t017","In the sentence 'The puppy wandered away from the yard,' what does wandered mean?","moved around without a clear plan","fell asleep","barked loudly"),
    q("t018","In the sentence 'The class gathered around the table,' what does gathered mean?","came together","ran away","became quiet"),
    q("t019","In the sentence 'Dad repaired the loose wheel,' what does repaired mean?","fixed","painted","lost"),
    q("t020","In the sentence 'The crowd cheered loudly,' what is a crowd?","a group of people","one person","a kind of animal"),

    q("t021","Which sentence uses the correct past tense?","Yesterday, we walked home.","Yesterday, we walk home.","Yesterday, we walking home."),
    q("t022","Which sentence uses the correct plural?","Three foxes ran away.","Three fox ran away.","Three foxs ran away."),
    q("t023","Choose the sentence with correct capitalization.","My aunt lives in Florida.","my aunt lives in Florida.","My aunt lives in florida."),
    q("t024","Choose the sentence with correct punctuation.","Where are you going?","Where are you going.","Where are you going!"),
    q("t025","Which word is the verb in 'The rabbit hopped quickly'?","hopped","rabbit","quickly"),
    q("t026","Which word is the noun in 'The bright sun warmed us'?","sun","bright","warmed"),
    q("t027","Which word is the adjective in 'We saw a shiny coin'?","shiny","saw","coin"),
    q("t028","Which word is the adverb in 'The turtle moved slowly'?","slowly","turtle","moved"),
    q("t029","Which sentence is written in the future tense?","We will visit Grandma tomorrow.","We visited Grandma yesterday.","We visit Grandma every Sunday."),
    q("t030","Which word best completes the sentence: 'Jamal and I ___ ready.'","are","is","am"),
    q("t031","Which word best completes the sentence: 'The dogs ___ barking.'","are","is","was"),
    q("t032","Which sentence uses their correctly?","Their bikes are by the fence.","There bikes are by the fence.","They're bikes are by the fence."),
    q("t033","Which sentence uses they're correctly?","They're going to the park.","Their going to the park.","There going to the park."),
    q("t034","Which sentence uses there correctly?","Put the box over there.","Put the box over their.","Put the box over they're."),
    q("t035","Which sentence has a compound word?","We saw a rainbow.","We saw a cloud.","We saw rain."),
    q("t036","Which word has a prefix meaning 'not'?","unhappy","replay","preview"),

    q("t037","The prefix re- in reread means ___.","again","before","not"),
    q("t038","The prefix pre- in preview means ___.","before","again","under"),
    q("t039","The suffix -ful in helpful means ___.","full of","without","small"),
    q("t040","The suffix -less in fearless means ___.","without","again","before"),
    q("t041","What is the root word in jumping?","jump","jumping","ing"),
    q("t042","What is the root word in kindness?","kind","ness","kinder"),
    q("t043","Which word is made from two smaller words?","sunflower","yellow","garden"),
    q("t044","Which word is a contraction for 'do not'?","don't","doesn't","didn't"),
    q("t045","Which word is a contraction for 'we are'?","we're","were","where"),
    q("t046","Which word is a contraction for 'I will'?","I'll","I'm","I'd"),

    q("t047","Lena packed an umbrella because dark clouds filled the sky. What will probably happen?","It may rain.","It will snow indoors.","The sun will get brighter."),
    q("t048","Marco practiced the piano every day for the concert. Why did he practice?","He wanted to play well.","He wanted the piano to disappear.","He forgot about the concert."),
    q("t049","The sidewalk was wet, and puddles filled the street. What probably happened earlier?","It rained.","It was very windy.","It snowed for a week."),
    q("t050","Ava put the ice cream in the freezer. Why?","To keep it frozen.","To make it warmer.","To turn it into soup."),
    q("t051","Ben whispered in the library. Why did he whisper?","Libraries are quiet places.","He was outdoors.","He wanted everyone to hear him."),
    q("t052","The lights went out during the storm, so Mia found a flashlight. Why?","She needed light.","She wanted to cool the room.","She was going swimming."),
    q("t053","Carlos wore a helmet before riding his bike. Why?","To protect his head.","To keep his feet warm.","To carry groceries."),
    q("t054","Nora watered the drooping plant. What was she trying to do?","Help the plant recover.","Make the plant smaller.","Turn the leaves blue."),

    q("t055","Read: 'Kai found a wallet on the playground. He gave it to his teacher.' What does this show about Kai?","He is honest.","He is careless.","He is impatient."),
    q("t056","Read: 'The puppy scratched at the door and wagged its tail.' What does the puppy probably want?","To go outside.","To take a nap.","To eat a book."),
    q("t057","Read: 'The room became quiet when the principal began speaking.' Why did the room become quiet?","People were listening.","Everyone went home.","The lights turned off."),
    q("t058","Read: 'A robin pulled a worm from the grass and flew to its nest.' What will it most likely do next?","Feed the worm to its babies.","Build a snowman.","Go swimming."),
    q("t059","Read: 'Tara checked the recipe twice before baking.' Why did she check it twice?","To make sure she followed the steps.","To make the food colder.","To finish without reading."),
    q("t060","Read: 'The campers zipped their tents and stored food safely.' What were they preparing for?","A night outdoors.","A school test.","A day at the library."),
    q("t061","Read: 'The dog hid under the table when thunder boomed.' How was the dog probably feeling?","scared","proud","bored"),
    q("t062","Read: 'Eli smiled when he saw his name on the winner list.' How did Eli probably feel?","happy","angry","sleepy"),

    q("t063","Which is the best title for a paragraph about how bees help flowers grow?","How Bees Help Flowers","My Favorite Shoes","A Rainy Bus Ride"),
    q("t064","Which sentence is a fact?","A week has seven days.","Summer is the best season.","Cats are the cutest pets."),
    q("t065","Which sentence is an opinion?","Chocolate ice cream is delicious.","Ice cream is frozen.","A cone can hold ice cream."),
    q("t066","Which word would come first in dictionary order?","apple","banana","zebra"),
    q("t067","Which guide words could appear on a page containing the word 'garden'?","game - gate","fish - flag","hat - hill"),
    q("t068","Which sentence gives a reason?","I wore boots because it was raining.","I wore boots.","My boots are blue."),
    q("t069","Which transition word shows what happens next?","then","because","although"),
    q("t070","Which transition word can show a final step?","finally","first","before"),
    q("t071","Which sentence compares two things?","The kitten is softer than the puppy.","The kitten is sleeping.","The puppy barked."),
    q("t072","Which sentence shows cause and effect?","The snow melted because the sun came out.","The snow was white.","The sun is a star."),
    q("t073","Which sentence uses a comma correctly?","After lunch, we went outside.","After lunch we, went outside.","After, lunch we went outside."),
    q("t074","Which word best completes the sentence: 'The kitten ___ beneath the couch.'","hid","hide","hiding yesterday"),
    q("t075","Read: 'Rina brought an extra sandwich and shared it with a classmate who forgot lunch.' What trait does Rina show?","kindness","selfishness","carelessness"),
    q("t076","Read: 'The wind bent the trees and sent leaves spinning across the yard.' What is the weather probably like?","windy","calm","foggy"),
    q("t077","Which word means nearly the same as purchase?","buy","sell","borrow"),
    q("t078","The suffix -er in teacher means ___.","a person who does something","without something","before something"),
    q("t079","Which sentence is written from first-person point of view?","I carried my backpack to class.","She carried her backpack to class.","Jordan carried a backpack to class."),
    q("t080","Which detail best supports the idea that a storm is coming?","Dark clouds are gathering.","The flowers are blooming.","The sidewalk is dry.")
  ];

  

const banks = { first:firstGradeQuestions, third:thirdGradeQuestions };

const state = {
  screen:"select", level:null, round:0, score:0, attempts:0, questions:[],
  sound:true, locked:false, choices:[], mouse:{x:-999,y:-999},
  anim:null, wrongIndex:-1, wrongUntil:0, message:"", messageBad:false,
  particles:[], flash:0
};

const answerRects = [
  {x:560,y:630,w:260,h:250},
  {x:845,y:630,w:260,h:250},
  {x:1130,y:630,w:260,h:250}
];
const goblinRects = [
  {x:555,y:385,w:270,h:270,img:"goblinSword"},
  {x:842,y:375,w:280,h:280,img:"goblinMace"},
  {x:1128,y:382,w:275,h:275,img:"goblinArcher"}
];
const levelButtons = [
  {x:355,y:500,w:390,h:220,level:"first",badge:"1",title:"1st Grade Reading",sub:"Rhymes • sounds • simple sentences"},
  {x:855,y:500,w:390,h:220,level:"third",badge:"3",title:"3rd Grade Reading",sub:"Vocabulary • grammar • comprehension"}
];

function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

function freshQuestions(level){
  const bank=banks[level], key=`readingKnightCanvasUsed_${level}`;
  let used=[]; try{used=JSON.parse(localStorage.getItem(key)||"[]");}catch(e){}
  let available=bank.filter(item=>!used.includes(item.id));
  if(available.length<ROUNDS){ used=[]; available=[...bank]; }
  const picked=shuffle(available).slice(0,ROUNDS);
  try{localStorage.setItem(key,JSON.stringify([...used,...picked.map(x=>x.id)]));}catch(e){}
  return picked;
}

function startGame(level){
  state.level=level; state.round=0; state.score=0; state.attempts=0; state.locked=false;
  state.questions=freshQuestions(level); state.screen="game"; state.particles=[]; state.flash=0;
  playSound("start"); loadRound();
}
function loadRound(){
  state.attempts=0; state.locked=false; state.anim=null; state.wrongIndex=-1; state.message=""; state.messageBad=false;
  state.choices=shuffle(state.questions[state.round].choices); state.disabledChoices=[false,false,false];
}
function returnToSelection(){ state.screen="select"; state.anim=null; state.particles=[]; }
function finishGame(){
  state.screen="summary"; playSound("finish");
  for(let i=0;i<28;i++) spawnSpark(800,420,Math.random()*Math.PI*2,150+Math.random()*230,"#ffd45a");
}

function answer(index){
  if(state.screen!=="game" || state.locked) return;
  const qn=state.questions[state.round];
  const chosen=state.choices[index];
  if(!chosen || state.disabledChoices?.[index]) return;
  state.attempts++;
  if(chosen===qn.correct){
    state.locked=true;
    const points=state.attempts===1?100:state.attempts===2?50:25;
    state.score+=points; state.message=`Correct! +${points}`; state.messageBad=false;
    state.anim={type:"hit",index,start:performance.now(),duration:850,points};
    playSound("correct");
    const r=goblinRects[index]; for(let i=0;i<18;i++) spawnSpark(r.x+r.w/2,r.y+r.h/2,Math.random()*Math.PI*2,90+Math.random()*220,i%2?"#ffe06b":"#9af04c");
  }else{
    state.disabledChoices[index]=true; state.wrongIndex=index; state.wrongUntil=performance.now()+520; state.message=state.attempts===1?"Not quite — try another goblin!":"Keep going — the right answer is still here!"; state.messageBad=true; playSound("wrong");
  }
}

function spawnSpark(x,y,a,speed,color){ state.particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-80,life:0,max:.7+Math.random()*.5,color,size:5+Math.random()*8}); }
function update(dt,now){
  for(const p of state.particles){ p.life+=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=360*dt; }
  state.particles=state.particles.filter(p=>p.life<p.max);
  if(state.wrongIndex>=0 && now>state.wrongUntil) state.wrongIndex=-1;
  if(state.anim && state.anim.type==="hit"){
    const t=(now-state.anim.start)/state.anim.duration;
    if(t>=1){ state.round++; state.anim=null; if(state.round>=ROUNDS) finishGame(); else loadRound(); }
  }
}

function roundedRectPath(x,y,w,h,r){
  r=Math.min(r,w/2,h/2); ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
function fillRound(x,y,w,h,r,fill,stroke=null,lw=1){ roundedRectPath(x,y,w,h,r); ctx.fillStyle=fill; ctx.fill(); if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();} }
function shadowText(text,x,y,size,color="#fff",align="center",weight=900,shadow="#12264a",shadowY=4){
  ctx.save(); ctx.font=`${weight} ${size}px Trebuchet MS, Arial`; ctx.textAlign=align; ctx.textBaseline="middle"; ctx.lineJoin="round"; ctx.lineWidth=Math.max(3,size*.12); ctx.strokeStyle=shadow; ctx.strokeText(text,x,y+shadowY); ctx.fillStyle=color; ctx.fillText(text,x,y); ctx.restore();
}
function wrapText(text,maxWidth,fontSize,maxLines=4){
  ctx.font=`900 ${fontSize}px Trebuchet MS, Arial`; const words=text.split(/\s+/); const lines=[]; let line="";
  for(const word of words){ const test=line?line+" "+word:word; if(ctx.measureText(test).width>maxWidth && line){ lines.push(line); line=word; if(lines.length===maxLines-1) break; } else line=test; }
  const used=lines.join(" ").split(/\s+/).filter(Boolean).length;
  if(lines.length===maxLines-1 && used<words.length){ let rest=words.slice(used).join(" "); while(ctx.measureText(rest+"…").width>maxWidth && rest.includes(" ")) rest=rest.slice(0,rest.lastIndexOf(" ")); lines.push(rest+"…"); }
  else if(line) lines.push(line);
  return lines;
}
function drawWrapped(text,x,y,maxWidth,fontSize,lineHeight,color="#183361",align="center",maxLines=4){
  const lines=wrapText(text,maxWidth,fontSize,maxLines); ctx.save(); ctx.font=`900 ${fontSize}px Trebuchet MS, Arial`; ctx.textAlign=align; ctx.textBaseline="middle"; ctx.fillStyle=color; ctx.lineJoin="round"; ctx.strokeStyle="rgba(255,255,255,.35)"; ctx.lineWidth=2;
  const total=(lines.length-1)*lineHeight; lines.forEach((line,i)=>{ const yy=y-total/2+i*lineHeight; ctx.strokeText(line,x,yy); ctx.fillText(line,x,yy); }); ctx.restore();
}
function drawImageContain(img,x,y,w,h,alpha=1,scale=1,rotation=0){
  const ar=img.width/img.height, br=w/h; let dw,dh; if(ar>br){dw=w;dh=w/ar}else{dh=h;dw=h*ar}
  ctx.save(); ctx.globalAlpha=alpha; ctx.translate(x+w/2,y+h/2); ctx.rotate(rotation); ctx.scale(scale,scale); ctx.drawImage(img,-dw/2,-dh/2,dw,dh); ctx.restore();
}
function drawImageCover(img,x,y,w,h){
  const ar=img.width/img.height, br=w/h; let sw=img.width,sh=img.height,sx=0,sy=0; if(ar>br){sw=img.height*br;sx=(img.width-sw)/2}else{sh=img.width/br;sy=(img.height-sh)/2} ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
}

function drawBackground(){ drawImageCover(images.background,0,0,W,H); }
function drawVignette(){ const g=ctx.createRadialGradient(800,440,300,800,450,980); g.addColorStop(0,"rgba(0,0,0,0)"); g.addColorStop(1,"rgba(5,17,35,.24)"); ctx.fillStyle=g;ctx.fillRect(0,0,W,H); }

function drawSelect(){
  drawBackground(); drawVignette(); ctx.fillStyle="rgba(8,26,55,.24)";ctx.fillRect(0,0,W,H);
  drawImageContain(images.question,280,54,1040,345,.98);
  shadowText("READING KNIGHT",825,154,64,"#183361","center",1000,"#fff2bd",2);
  shadowText("PINK CASTLE DEFENSE",825,219,29,"#7e3b68","center",1000,"#ffe4a8",2);
  shadowText("Choose your reading adventure",800,382,34,"#fff9dd","center",1000,"#17375f",4);
  levelButtons.forEach((b,i)=>{
    const hover=pointIn(b,state.mouse.x,state.mouse.y); drawImageContain(images.choice,b.x,b.y,b.w,b.h,1,hover?1.035:1);
    shadowText(b.badge,b.x+b.w/2,b.y+64,50,"#fff6ce","center",1000,"#4f2c12",3);
    shadowText(b.title,b.x+b.w/2,b.y+135,30,"#fff9e6","center",1000,"#4b280f",4);
    drawWrapped(b.sub,b.x+b.w/2,b.y+180,b.w-70,17,21,"#ffe8b8","center",2);
  });
  shadowText("10 rounds • 100 / 50 / 25 points by attempt",800,792,24,"#fff1c4","center",900,"#17375f",3);
  shadowText("Questions stay fresh across replays until the pool cycles.",800,830,19,"#e5f3ff","center",800,"#17375f",3);
}

function drawHud(){
  // top-left reading-level panel
  fillRound(24,20,390,120,26,"rgba(9,27,52,.93)","#b38345",6);
  const g=ctx.createRadialGradient(82,77,5,82,77,52);g.addColorStop(0,"#ffe88b");g.addColorStop(.55,"#ffbd27");g.addColorStop(1,"#a9650f");ctx.fillStyle=g;ctx.beginPath();ctx.arc(82,78,48,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#70410c";ctx.lineWidth=6;ctx.stroke();
  shadowText("🛡",82,80,42,"#eaf1ff","center",900,"#27427c",2);
  const levelName=state.level==="first"?"1st Grade Reading":"3rd Grade Reading";
  shadowText(levelName,245,68,28,"#fff","center",1000,"#061329",3);
  const hearts=Math.max(1,5-state.attempts+1); for(let i=0;i<5;i++) shadowText(i<hearts?"♥":"♡",175+i*43,111,32,i<hearts?"#ff4d57":"#b5bfd0","center",1000,"#6e1523",2);

  // question banner
  drawImageContain(images.question,430,6,755,250);
  const qn=state.questions[state.round];
  if(qn){ const len=qn.prompt.length; const fs=len>105?26:len>78?29:len>52?33:38; drawWrapped(qn.prompt,845,104,535,fs,fs*1.08,"#183361","center",4); }
  shadowText(`Round ${state.round+1} of ${ROUNDS}`,846,183,20,"#77481c","center",1000,"#ffe8ae",1);
  if(state.message) shadowText(state.message,846,214,18,state.messageBad?"#b52a39":"#367d20","center",1000,"#fff0be",1);

  // score and buttons
  fillRound(1200,28,215,84,22,"rgba(8,25,49,.95)","#b38345",6); ctx.fillStyle="#ffc62e";ctx.beginPath();ctx.arc(1248,70,34,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#8b5511";ctx.lineWidth=5;ctx.stroke(); shadowText("★",1248,69,29,"#fff2a0","center",1000,"#9c650e",2); shadowText(String(state.score),1332,69,38,"#fff","center",1000,"#071326",3);
  drawSquareButton(1435,28,68,"🔊",state.sound?"#237bd8":"#6f7480");
  drawSquareButton(1511,28,68,"✕","#d34d52");
}
function drawSquareButton(x,y,s,label,color){ fillRound(x,y,s,s,18,color,"#0d3972",5); shadowText(label,x+s/2,y+s/2+1,30,"#fff","center",1000,"rgba(0,0,0,.35)",2); }

function drawGame(now){
  drawBackground(); drawVignette(); drawHud();
  // knight
  let kx=10,ky=418,kw=420,kh=420,ks=1,rot=0;
  if(state.anim&&state.anim.type==="hit"){
    const t=Math.min(1,(now-state.anim.start)/state.anim.duration); const pulse=Math.sin(Math.min(1,t/.48)*Math.PI); kx+=pulse*95; rot=-pulse*.04; ks=1+pulse*.025;
  }
  drawImageContain(images.knight,kx,ky,kw,kh,1,ks,rot);

  const letters=["A","B","C"];
  goblinRects.forEach((r,i)=>{
    let alpha=1,scale=1,rotation=0,dx=0;
    if(state.wrongIndex===i){ const q=(state.wrongUntil-now)/520; dx=Math.sin(q*46)*12; }
    if(state.anim&&state.anim.type==="hit"&&state.anim.index===i){ const t=Math.min(1,(now-state.anim.start)/state.anim.duration); if(t>.24){ const p=(t-.24)/.76; alpha=1-p; scale=1-p*.45; rotation=p*.22; } }
    drawImageContain(images[r.img],r.x+dx,r.y,r.w,r.h,alpha,scale,rotation);
    const b=answerRects[i]; const disabled=!!state.disabledChoices?.[i]; const hover=!state.locked&&!disabled&&pointIn(b,state.mouse.x,state.mouse.y); drawImageContain(images.choice,b.x,b.y,b.w,b.h,alpha*(disabled?0.62:1),hover?1.025:1);
    shadowText(letters[i],b.x+b.w/2,b.y+61,42,"#fff6d2","center",1000,"#4f2d12",3);
    if(state.choices[i]){ const ans=state.choices[i]; const fs=ans.length>26?18:ans.length>18?21:ans.length>12?24:28; drawWrapped(ans,b.x+b.w/2,b.y+166,b.w-48,fs,fs*1.05,"#fff9dc","center",3); }
  });

  // tip sign
  drawImageContain(images.tip,1395,570,188,250,.98);
  drawWrapped("Read the question and choose the goblin with the correct answer!",1489,680,118,17,21,"#fff4cf","center",5);

  // progress
  fillRound(445,822,700,58,20,"rgba(8,25,49,.94)","#b38345",6); fillRound(490,842,610,22,11,"#0a1b33","#39577f",3);
  const progress=(state.round+(state.anim?Math.min(1,(now-state.anim.start)/state.anim.duration):0))/ROUNDS; const grd=ctx.createLinearGradient(490,0,1100,0);grd.addColorStop(0,"#ffb61f");grd.addColorStop(1,"#ffe064"); fillRound(493,845,Math.max(0,604*progress),16,8,grd);
  shadowText("Battle Progress",800,814,18,"#e7f0ff","center",1000,"#071326",2);

  // particles
  for(const p of state.particles){ const a=1-p.life/p.max; ctx.save();ctx.globalAlpha=a;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size*a,0,Math.PI*2);ctx.fill();ctx.restore(); }
}

function drawSummary(){
  drawBackground(); drawVignette(); ctx.fillStyle="rgba(6,20,42,.44)";ctx.fillRect(0,0,W,H);
  drawImageContain(images.question,340,72,920,305);
  shadowText("CASTLE SAVED!",800,160,62,"#193663","center",1000,"#fff0b8",2);
  const label=state.level==="first"?"1st Grade Reading":"3rd Grade Reading"; shadowText(`${label} • 10 rounds complete`,800,225,24,"#7c4c1d","center",1000,"#ffe8a8",1);
  ctx.save(); const g=ctx.createRadialGradient(800,460,20,800,460,120);g.addColorStop(0,"#fff5a2");g.addColorStop(.55,"#ffc933");g.addColorStop(1,"#a56810");ctx.fillStyle=g;ctx.beginPath();ctx.arc(800,460,118,0,Math.PI*2);ctx.fill();ctx.lineWidth=9;ctx.strokeStyle="#693d0b";ctx.stroke();ctx.restore();
  shadowText(String(state.score),800,447,68,"#643b08","center",1000,"#fff3a7",2); shadowText("POINTS",800,510,22,"#6c420a","center",1000,"#ffe9a0",1);
  const stars=state.score>=900?3:state.score>=650?2:1; shadowText("★".repeat(stars)+"☆".repeat(3-stars),800,606,54,"#ffde59","center",1000,"#80520e",3);
  const msg=state.score>=900?"Amazing reading! The kingdom is cheering!":state.score>=650?"Great job! You sent the goblins running!":"Nice work! The pink castle is safe!"; shadowText(msg,800,670,30,"#fff8d7","center",1000,"#17375f",3);
  const b={x:625,y:730,w:350,h:105}; drawImageContain(images.choice,b.x,b.y,b.w,b.h,1,pointIn(b,state.mouse.x,state.mouse.y)?1.03:1); shadowText("PLAY AGAIN",800,788,30,"#fff8dc","center",1000,"#4f2b10",3);
}

function draw(now){ ctx.clearRect(0,0,W,H); if(state.screen==="select") drawSelect(); else if(state.screen==="game") drawGame(now); else drawSummary(); }
let last=performance.now(); function loop(now){ const dt=Math.min(.033,(now-last)/1000); last=now; update(dt,now); draw(now); requestAnimationFrame(loop); }

function pointIn(r,x,y){ return x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h; }
function canvasPoint(evt){ const rect=canvas.getBoundingClientRect(); return {x:(evt.clientX-rect.left)*W/rect.width,y:(evt.clientY-rect.top)*H/rect.height}; }
function onPointerMove(e){state.mouse=canvasPoint(e)}
function onPointerDown(e){
  e.preventDefault(); const p=canvasPoint(e); state.mouse=p;
  if(state.screen==="select"){
    for(const b of levelButtons) if(pointIn(b,p.x,p.y)) return startGame(b.level);
  } else if(state.screen==="game"){
    if(pointIn({x:1435,y:28,w:68,h:68},p.x,p.y)){state.sound=!state.sound;if(state.sound)playSound("tap");return;}
    if(pointIn({x:1511,y:28,w:68,h:68},p.x,p.y)){returnToSelection();return;}
    for(let i=0;i<answerRects.length;i++) if(pointIn(answerRects[i],p.x,p.y) && !state.disabledChoices?.[i]) return answer(i);
  } else {
    if(pointIn({x:625,y:730,w:350,h:105},p.x,p.y)) returnToSelection();
  }
}
canvas.addEventListener("pointermove",onPointerMove); canvas.addEventListener("pointerdown",onPointerDown);
window.addEventListener("keydown",e=>{
  if(state.screen==="game"&&["1","2","3"].includes(e.key)) answer(Number(e.key)-1);
  if(e.key==="Escape") returnToSelection();
});

let audioCtx=null;
function tone(freq,dur,type="sine",vol=.05,delay=0){ if(!state.sound)return; try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)(); const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol,audioCtx.currentTime+delay);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+delay+dur);o.connect(g);g.connect(audioCtx.destination);o.start(audioCtx.currentTime+delay);o.stop(audioCtx.currentTime+delay+dur);}catch(e){} }
function playSound(k){
  if(k==="correct"){tone(523,.12,"triangle",.06);tone(659,.14,"triangle",.06,.11);tone(784,.2,"triangle",.06,.23)}
  else if(k==="wrong"){tone(180,.15,"square",.03);tone(135,.2,"square",.025,.11)}
  else if(k==="finish"){tone(523,.11,"triangle",.06);tone(659,.11,"triangle",.06,.12);tone(784,.11,"triangle",.06,.24);tone(1046,.28,"triangle",.06,.36)}
  else if(k==="start"){tone(392,.09,"triangle",.04);tone(523,.17,"triangle",.045,.09)}
  else tone(520,.07,"sine",.025);
}

assetsReady.then(()=>{loading.style.display="none";requestAnimationFrame(loop)}).catch(err=>{loading.textContent="Game assets could not load. Keep the assets folder next to index.html.";console.error(err)});
})();
