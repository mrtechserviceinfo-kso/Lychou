const $=s=>document.querySelector(s),RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
/* ---- cœurs en feu d’artifice ---- */
const fx=$('#fx'),c2=fx.getContext('2d');let P=[];
function sz(){fx.width=innerWidth;fx.height=innerHeight}sz();addEventListener('resize',sz);
function burst(x,y,n=18){const cols=['#ff5c93','#ffc86b','#b8a1ff','#fff3f7'];for(let i=0;i<n;i++){const a=Math.random()*6.28,v=2+Math.random()*5;P.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2,s:8+Math.random()*16,l:1,c:cols[i%4]})}}
function heart(c,x,y,s){c.beginPath();c.moveTo(x,y+s*.3);c.bezierCurveTo(x-s,y-s*.4,x-s*.5,y-s,x,y-s*.45);c.bezierCurveTo(x+s*.5,y-s,x+s,y-s*.4,x,y+s*.3);c.fill()}
(function loop(){c2.clearRect(0,0,fx.width,fx.height);P=P.filter(p=>p.l>0);for(const p of P){p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.l-=.012;c2.globalAlpha=Math.max(p.l,0);c2.fillStyle=p.c;heart(c2,p.x,p.y,p.s)}c2.globalAlpha=1;requestAnimationFrame(loop)})();
addEventListener('pointerdown',e=>{if(!e.target.closest('video,#lb'))burst(e.clientX,e.clientY,10)});
/* ---- cœur 3D en particules ---- */
(function(){
const cv=$('#gl'),r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});
const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(55,1,.1,500);cam.position.z=48;
function tex(){const k=document.createElement('canvas');k.width=k.height=64;const g=k.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'#fff');gr.addColorStop(.4,'rgba(255,255,255,.6)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(k)}
const T=tex(),N=7000,pos=new Float32Array(N*3),col=new Float32Array(N*3),a=new THREE.Color('#ff3d7f'),b=new THREE.Color('#ffc86b');
for(let i=0;i<N;i++){const t=Math.random()*6.2832,k=1-Math.pow(Math.random(),3);
const x=16*Math.pow(Math.sin(t),3),y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
pos.set([x*k,(y+2)*k,(Math.random()-.5)*9*Math.sqrt(k)*(1.1-Math.abs(x)/20)],i*3);
const c=a.clone().lerp(b,Math.random()*.6);col.set([c.r,c.g,c.b],i*3)}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
const heartPts=new THREE.Points(g,new THREE.PointsMaterial({size:1.1,map:T,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
heartPts.position.y=6;sc.add(heartPts);
const M=1500,sp=new Float32Array(M*3);for(let i=0;i<M*3;i++)sp[i]=(Math.random()-.5)*220;
const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
const stars=new THREE.Points(sg,new THREE.PointsMaterial({size:1.2,map:T,color:0xb8a1ff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sc.add(stars);
let mx=0,my=0;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
function rs(){const w=cv.clientWidth,h=cv.clientHeight;r.setSize(w,h,false);r.setPixelRatio(Math.min(devicePixelRatio,2));cam.aspect=w/h;cam.position.z=w<h?72:48;cam.updateProjectionMatrix()}rs();addEventListener('resize',rs);
let vis=true;new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(cv);
const clk=new THREE.Clock();
(function tick(){requestAnimationFrame(tick);if(!vis)return;const t=clk.getElapsedTime(),beat=1+.06*Math.pow(Math.sin(t*3),8)+.03*Math.sin(t*1.5);
heartPts.scale.setScalar(beat);heartPts.rotation.y=RM?0:t*.35+mx*1.2;heartPts.rotation.x=my*.5;stars.rotation.y=t*.02;r.render(sc,cam)})();
})();
/* ---- compteur ---- */
const ck=$('#clock'),inp=$('#since');
try{inp.value=localStorage.getItem('since')||''}catch(e){}
function draw(){if(!inp.value){ck.innerHTML='';return}const d=Math.max(0,Date.now()-new Date(inp.value+'T00:00:00').getTime()),s=Math.floor(d/1e3);
const v=[['jours',Math.floor(s/86400)],['heures',Math.floor(s/3600)%24],['minutes',Math.floor(s/60)%60],['secondes',s%60]];
ck.innerHTML=v.map(x=>`<div><b>${x[1]}</b><span>${x[0]}</span></div>`).join('')}
inp.onchange=()=>{try{localStorage.setItem('since',inp.value)}catch(e){}draw();burst(innerWidth/2,innerHeight/2,40)};draw();setInterval(draw,1000);
/* ---- anneau 3D ---- */
const ring=$('#ring'),fig=[...ring.children],n=fig.length;let ang=0,vel=0,drag=false,lx=0,moved=0;
function layout(){const w=fig[0].offsetWidth,R=Math.round(w/2/Math.tan(Math.PI/n))+30;fig.forEach((f,i)=>f.style.transform=`rotateY(${i*360/n}deg) translateZ(${R}px)`);ring.dataset.r=R}layout();addEventListener('resize',layout);
const st=$('#stage');
st.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;moved=0;st.style.cursor='grabbing'});
addEventListener('pointerup',()=>{drag=false;st.style.cursor='grab'});
addEventListener('pointermove',e=>{if(!drag)return;const d=e.clientX-lx;lx=e.clientX;moved+=Math.abs(d);vel=d*.25;ang+=vel});
let see=false;new IntersectionObserver(e=>see=e[0].isIntersecting).observe(st);
(function spin(){requestAnimationFrame(spin);if(!see)return;if(!drag){vel*=.95;ang+=vel+(RM?0:.12)}ring.style.transform=`translateZ(-${ring.dataset.r}px) rotateY(${ang}deg)`})();
const lb=$('#lb');fig.forEach(f=>f.addEventListener('click',()=>{if(moved>6)return;lb.querySelector('img').src=f.querySelector('img').src;lb.classList.add('on')}));
lb.onclick=()=>lb.classList.remove('on');addEventListener('keydown',e=>{if(e.key==='Escape')lb.classList.remove('on')});
/* ---- inclinaison vidéo ---- */
const tl=$('#tilt'),ti=tl.firstElementChild;
tl.addEventListener('pointermove',e=>{const b=tl.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;ti.style.transform=`rotateY(${x*18}deg) rotateX(${-y*18}deg)`});
tl.addEventListener('pointerleave',()=>ti.style.transform='');
/* ---- cartes ---- */
const R=[['Ton sourire','Il éclaire mes pires journées en une seconde.'],['Ton regard','Il dit tout, même quand tu ne dis rien.'],['Ta douceur','Près de toi, je me sens chez moi.'],['Ton rire','Mon son préféré au monde.'],['Ta force','Tu me donnes envie d’être au meilleur de moi.'],['Toi, tout simplement','Pas besoin de raison. Je t’aime, c’est tout.']];
$('#cards').innerHTML=R.map(x=>`<button class="card" aria-label="${x[0]}"><i><em>${x[0]}</em><u>${x[1]}</u></i></button>`).join('');
document.querySelectorAll('.card').forEach(c=>c.onclick=e=>{c.classList.toggle('on');const b=c.getBoundingClientRect();burst(b.left+b.width/2,b.top+b.height/2,8)});
/* ---- lettre ---- */
const TXT=`Mon Bb Lychou,

Je ne sais pas par où commencer, alors je commence par l’essentiel : je t’aime.

Je t’aime dans les grands moments comme dans les petits silences. Avec toi, même les journées les plus ordinaires ont une lumière à part. Ton sourire règle tout, ton regard me rassure, et ta présence fait de moi quelqu’un de meilleur.

Merci d’être là, d’être toi, d’être à moi. Je choisis de t’aimer aujourd’hui, demain, et tous les jours d’après.

Avec tout mon amour ♥`;
let typing=false;$('#open').onclick=function(){if(typing)return;typing=true;this.style.display='none';const L=$('#letter');let i=0;burst(innerWidth/2,innerHeight/2,30);(function t(){L.textContent=TXT.slice(0,i++);if(i<=TXT.length)setTimeout(t,RM?0:34)})()};
/* ---- la question ---- */
const yes=$('#yes'),no=$('#no'),ask=$('#ask');let sc=1;
function dodge(e){e&&e.preventDefault();const w=ask.clientWidth-no.offsetWidth,h=ask.clientHeight-no.offsetHeight;no.style.left=Math.random()*w+'px';no.style.top=Math.random()*h+'px';sc=Math.min(sc+.18,2.2);yes.style.transform=`scale(${sc})`}
no.addEventListener('pointerenter',dodge);no.addEventListener('click',dodge);
yes.onclick=()=>{ask.style.display='none';$('#yes-msg').style.display='block';let k=0;const id=setInterval(()=>{burst(Math.random()*innerWidth,Math.random()*innerHeight*.6,26);if(++k>14)clearInterval(id)},260)};
/* ---- musique douce (WebAudio) ---- */
let ac,on=false,tm;const CH=[[220,261.6,329.6],[174.6,220,261.6],[261.6,329.6,392],[196,246.9,293.7]];let ci=0,ni=0;
function note(f){const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=f*(ni%6>2?2:1);g.gain.setValueAtTime(0,ac.currentTime);g.gain.linearRampToValueAtTime(.07,ac.currentTime+.05);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+1.6);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+1.7)}
$('#music').onclick=function(){if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();on=!on;this.style.opacity=on?1:.6;this.style.boxShadow=on?'0 0 20px #ff5c93':'none';clearInterval(tm);if(on){ac.resume();tm=setInterval(()=>{const c=CH[ci%4];note(c[ni%3]);ni++;if(ni%6===0)ci++},420)}};
