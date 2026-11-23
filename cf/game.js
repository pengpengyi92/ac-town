import {places} from './places.js';
import {DISTRICTS, SPAWN, districtLayout, actorMesh, buildingMesh, streetFurniture} from './town-scene.js';
import {camera, route} from './navigation.js';

const $=id=>document.getElementById(id), canvas=$('map'), ctx=canvas.getContext('2d');
let district='consumer', plots=[], city=[], selected=null, angle=Math.PI/4;
let position={...SPAWN}, steps=[], destination=null, raf=0,last=0,phase=0;
let W=0,H=0,DPR=1,cam=null,hit=[];
const visited=new Set();
const keys=Object.keys(DISTRICTS);
const controls=new Map();
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');

function mark(state,label){
  canvas.dataset.motion=state;
  $('movement').textContent=label;
}
function updatePosition(){
  canvas.dataset.x=position.x.toFixed(3);
  canvas.dataset.z=position.z.toFixed(3);
}
function initTabs(){
  for(const key of keys){
    const info=DISTRICTS[key];
    const button=document.createElement('button'), cap=document.createElement('span'), name=document.createElement('span');
    button.type='button';
    button.dataset.district=key;
    button.style.setProperty('--chip',info.pale);
    cap.className='cap';cap.textContent=info.code;cap.setAttribute('aria-hidden','true');
    name.textContent=info.label;
    button.append(cap,name);
    button.addEventListener('click',()=>{ $('search').value='';switchDistrict(key,true); });
    $('districts').append(button);controls.set(key,button);
  }
}
function switchDistrict(key, reset=true) {
  district=key;
  plots=districtLayout(places,key);
  city=plots.flatMap(buildingMesh).concat(streetFurniture(plots));
  const info=DISTRICTS[key];
  document.documentElement.style.setProperty('--accent',info.color);
  document.documentElement.style.setProperty('--soft',info.pale);
  $('district-label').textContent=info.label;
  $('district-en').textContent=info.en+'  /  '+plots.length+' 栋';
  $('poi-hint').textContent=info.motif+' · '+info.hint;
  for(const [d,b] of controls)b.setAttribute('aria-pressed',String(d===district));
  if(reset){
    selected=null;
    goHome();
    clearDetail();
  }
  directory();
  paint();
}
function directory() {
  const query=$('search').value.trim().normalize('NFKC').toLowerCase();
  const rows=query?places.filter(p=>[p.name,p.region,p.id,DISTRICTS[p.district].label].some(s=>s.normalize('NFKC').toLowerCase().includes(query))):plots;
  $('list-count').textContent=query?rows.length+' 个结果':rows.length+' 栋';
  const pane=$('directory'), previous=pane.scrollTop;
  pane.replaceChildren();
  for(const p of rows) {
    const button=document.createElement('button'), code=document.createElement('span'), title=document.createElement('span');
    button.className='item';button.type='button';button.dataset.place=p.id;
    button.setAttribute('aria-pressed',String(selected?.id===p.id));
    button.style.setProperty('--chip',DISTRICTS[p.district].pale);
    code.className='item-code';code.textContent=p.id;
    title.className='item-name';title.textContent=p.name;
    button.append(code,title);
    button.addEventListener('click',()=>{
      const id=p.id;
      select(p);
      pane.querySelector('[data-place="'+id+'"]')?.focus({preventScroll:true});
      if(window.innerWidth<=830)$('detail').scrollIntoView({block:'start',behavior:reduce.matches?'instant':'smooth'});
    });
    pane.append(button);
  }
  if(rows.length===0){
    const p=document.createElement('p');p.className='empty';p.textContent='未找到建筑，试试机构名、编号或地区。';pane.append(p);
  }
  pane.scrollTop=previous;
}
function clearDetail(){
  $('poi-id').textContent='小镇入口';
  $('poi-name').textContent='你好，我是 CF';
  $('poi-scope').textContent='点击地面带我散步，点击任一栋楼看这里为什么和资产托管有关。';
  $('poi-limit').hidden=true;
  $('enter').hidden=true;
  $('enter').removeAttribute('href');
  $('source-note').hidden=true;
}
function select(p){
  if(p.district!==district)switchDistrict(p.district,true);
  const plot=plots.find(row=>row.id===p.id);
  if(!plot)return;
  selected=plot;
  visited.add(plot.id);
  $('progress').textContent='已探索 '+visited.size+' / '+places.length;
  $('poi-id').textContent=plot.id+' · '+plot.region;
  $('poi-name').textContent=plot.name;
  $('poi-scope').textContent='和对公金融的关系：'+plot.scope;
  $('poi-limit').textContent='核对边界：'+plot.limit;
  $('poi-limit').hidden=false;
  const url=new URL(plot.url);
  if(url.protocol==='https:'&&!url.username&&!url.password){
    $('enter').href=url.href;$('domain').textContent=url.hostname;$('enter').hidden=false;
  }
  $('source-note').hidden=plot.district!=='controlled';
  directory();
  walk(plot.door,plot);
}
function walk(to,plot=null){
  steps=route(plots,position,to);
  destination=plot;
  if(!steps.length){mark('idle','CF 无法到达这个位置');return;}
  mark('walking',plot?'CF 正走向 '+plot.id+' 的入口':'CF 正在街上走路');
  paint();
  if(!raf){last=0;raf=requestAnimationFrame(frame);}
}
function goHome(){
  if(raf){cancelAnimationFrame(raf);raf=0;}
  steps=[];destination=null;
  position={...SPAWN};
  mark('idle','点击地面走路 · 点击建筑看简介');
  updatePosition();paint();
}
function frame(now){
  raf=0;
  const dt=last?Math.min((now-last)/1000,.05):0;last=now;
  let travel=(reduce.matches?20:10.3)*dt;
  while(steps.length){
    const p=steps[0], dx=p.x-position.x,dz=p.z-position.z,len=Math.hypot(dx,dz);
    if(len<1e-6||travel>=len){
      position={...p};steps.shift();travel-=len;
    }else{position.x+=dx*travel/len;position.z+=dz*travel/len;break;}
  }
  phase+=dt;updatePosition();
  if(!steps.length){ mark('arrived',destination?'CF 已到达 '+destination.id+' 的入口':'CF 已到达');destination=null; }
  paint();
  if(steps.length)raf=requestAnimationFrame(frame);
}
function shape(points,fill,stroke,lineWidth=1){
  ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
  for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
  ctx.closePath();ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}
}
function rect(x,z,x1,z1,y,color,stroke){
  shape([[x,y,z],[x,y,z1],[x1,y,z1],[x1,y,z]].map(cam.project),color,stroke);
}
function groundDisc(x,z,rx,rz,color,y=.003,stroke){
  shape(Array.from({length:20},(_,i)=>{
    const a=i*Math.PI/10;
    return cam.project([x+Math.cos(a)*rx,y,z+Math.sin(a)*rz]);
  }),color,stroke);
}
function paintGround(){
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#f1f2ff');bg.addColorStop(1,'#c6d4ed');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#6f85a92b';
  for(let y=11;y<H;y+=18)for(let x=11;x<W;x+=18)ctx.fillRect(x,y,1.1,1.1);
  rect(-17,-17,17,17,-.65,'#9abcb4');
  rect(-17,-17,17,17,0,'#dfe9ca','#a8c7ae');
  rect(-16.1,-16.1,16.1,16.1,.0004,'#e7eed9','#b5cbb5');
  for(const z of [-14.5,-7.55,-.5,6.5,13.5]){
    rect(-16,z-.75,16,z+.75,.001,'#f8f6dd');
    for(let x=-15.5;x<16;x+=1.25)rect(x,z-.024,x+.52,z+.024,.0011,'#dbddc3');
  }
  for(const x of [-16,-8,0,8,16])rect(x-.68,-15,x+.68,15,.0015,'#f5f4d8');
  groundDisc(0,15,1.48,1.25,'#b8e4c8',.003,'#78b59e');
  groundDisc(0,15,.91,.79,'#cee9be',.004,'#9dbea2');
  if(selected)rect(selected.x-2.28,selected.z-2.28,selected.x+2.28,selected.z+2.28,.005,DISTRICTS[district].pale,DISTRICTS[district].color);
  if(steps.length){
    const line=[position,...steps].map(p=>cam.project([p.x,.014,p.z]));
    ctx.save();ctx.beginPath();ctx.moveTo(line[0].x,line[0].y);
    for(const p of line.slice(1))ctx.lineTo(p.x,p.y);
    ctx.setLineDash([5,4]);ctx.lineWidth=2;ctx.strokeStyle='#25796e';ctx.stroke();ctx.restore();
    const p=steps.at(-1);
    groundDisc(p.x,p.z,.43,.43,'#f7faf0',.021,'#348d82');
  }
  groundDisc(position.x,position.z,.69,.60,'#214b4731',.028);
}
function orientation(points){
  let result=0;
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length];result+=a.x*b.y-a.y*b.x;
  }
  return result;
}
function pill(x,y,name,fill,ink,active=false,selectId=null){
  ctx.font=(active?'800 ':'700 ')+(W<550?'10px ':'11px ')+'ui-monospace, Consolas, monospace';
  const w=ctx.measureText(name).width+12,h=W<550?17:19;
  const box=[{x:x-w/2,y:y-h/2},{x:x+w/2,y:y-h/2},{x:x+w/2,y:y+h/2},{x:x-w/2,y:y+h/2}];
  ctx.beginPath();ctx.roundRect(box[0].x,box[0].y,w,h,4);
  ctx.fillStyle=fill;ctx.fill();
  if(active){ctx.strokeStyle=ink;ctx.lineWidth=1.3;ctx.stroke();}
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=ink;ctx.fillText(name,x,y+.3);
  if(selectId)hit.push({id:selectId,points:box});
}
function nameplate(plot){
  const distinct={F01:'Wind / GEL',F02:'同花顺 iFinD',F03:'Choice',O01:'企业公示系统',O03:'执行信息网',O04:'裁判文书网',O05:'国家知识产权局',O10:'全国股转',O11:'中国货币网',O12:'中债信息网',O13:'NAFMII',O16:'海关信用公示',R01:'人行企业征信',R02:'动产融资登记',R03:'受益所有人备案',G01:'香港公司查册',G02:'HKEXnews',G03:'ACRA Bizfile',G04:'Companies House',G05:'SEC EDGAR',G06:'GLEIF / LEI'};
  if(W<720)return plot.id;
  const name=distinct[plot.id]??plot.name.split(/[｜（]/)[0];
  if([...name].length>13)return Array.from(name).slice(0,11).join('')+'…';
  return name;
}
function paint(){
  if(!ctx||!W||!H)return;
  cam=camera(W,H,angle);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  paintGround();
  const actor=actorMesh(position.x,position.z,phase,steps.length>0&&!reduce.matches);
  const meshes=city.concat(actor).map(f=>{
    const points=f.points.map(cam.project);
    return{...f,points,depth:points.reduce((n,p)=>n+p.depth,0)/points.length};
  }).filter(f=>orientation(f.points)<-.02).sort((a,b)=>a.depth-b.depth);
  hit=[];
  for(const f of meshes){
    shape(f.points,f.color);
    if(f.id)hit.push(f);
  }
  for(const plot of plots) {
    const base=cam.project([plot.x,0,plot.z+2.85]);
    const current=selected?.id===plot.id;
    pill(base.x,base.y+2,nameplate(plot),current?'#173b3f':'#f8fff5',current?'#f9fff1':'#30474e',current,plot.id);
  }
  const pos=cam.project([position.x,1.66,position.z]);
  pill(pos.x,pos.y-10,'CF','#293d68','#f5ffed',true);
}
function resize(){
  const b=canvas.getBoundingClientRect();
  W=b.width;H=b.height;DPR=Math.min(devicePixelRatio||1,2);
  const bw=Math.round(W*DPR),bh=Math.round(H*DPR);
  if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh;}
  paint();
}
function contains(poly,x,y){
  let inPoly=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const a=poly[i],b=poly[j];
    if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inPoly=!inPoly;
  }
  return inPoly;
}
canvas.addEventListener('click',event=>{
  if(!cam)return;
  const b=canvas.getBoundingClientRect(),x=event.clientX-b.left,y=event.clientY-b.top;
  for(let i=hit.length-1;i>=0;i--){
    if(contains(hit[i].points,x,y)){
      select(plots.find(p=>p.id===hit[i].id));
      if(window.innerWidth<=830)$('detail').scrollIntoView({block:'start',behavior:reduce.matches?'instant':'smooth'});
      return;
    }
  }
  const p=cam.ground(x,y);
  if(Math.abs(p.x)<=17&&Math.abs(p.z)<=17)walk(p);
});
function turn(d){angle+=d*Math.PI/2;paint();canvas.dataset.angle=angle.toFixed(3);}
canvas.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();
  const moves={arrowup:[0,-3],w:[0,-3],arrowdown:[0,3],s:[0,3],arrowleft:[-3,0],a:[-3,0],arrowright:[3,0],d:[3,0]};
  if(key in moves){
    e.preventDefault();
    const [x,z]=moves[key],c=Math.cos(angle-Math.PI/4),s=Math.sin(angle-Math.PI/4);
    walk({x:position.x+x*c+z*s,z:position.z-x*s+z*c});
  }else if(key==='q'||key==='e'){ e.preventDefault();turn(key==='q'?-1:1); }
});
$('rotate-left').addEventListener('click',()=>turn(-1));
$('rotate-right').addEventListener('click',()=>turn(1));
$('reset').addEventListener('click',goHome);
$('back-to-map').addEventListener('click',()=>{
  canvas.scrollIntoView({block:'center',behavior:reduce.matches?'instant':'smooth'});
  canvas.focus({preventScroll:true});
});
$('search').addEventListener('input',directory);
initTabs();switchDistrict(district);resize();
new ResizeObserver(resize).observe(canvas);
