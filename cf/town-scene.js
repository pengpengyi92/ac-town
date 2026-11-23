// CF Town authored procedural 3D assets. Units are abstract. Y is up.
export const SCENE_VERSION='1.0.0';
export const DISTRICTS={
  consumer:{label:'企业线索街',en:'BUSINESS INTELLIGENCE',code:'Q',color:'#2476ae',pale:'#d6edff',motif:'蓝色查册亭与放大镜',hint:'先用平台找主体和股权线索，结论要回公示、公告或权威原件。'},
  vertical:{label:'产业与招采街',en:'INDUSTRY & PROCUREMENT',code:'P',color:'#ba763b',pale:'#ffead7',motif:'暖铜工坊与起重架',hint:'查科创、供应链和招投标线索；一份采购记录不等于授信或收入兑现。'},
  financial:{label:'金融数据塔',en:'MARKET DATA',code:'F',color:'#7463cb',pale:'#eae3ff',motif:'紫色阶梯数据塔',hint:'比对财务、债券和市场线索；关键数字回公司报告或市场正式资料。'},
  mainland_public:{label:'公示与公告区',en:'PUBLIC RECORDS',code:'O',color:'#15897b',pale:'#c8f0e6',motif:'青绿档案厅与公示柱',hint:'在监管、公示或披露原站核对法律实体、公告版本、日期和案号。'},
  controlled:{label:'授权办理区',en:'AUTHORISED SERVICES',code:'A',color:'#b65364',pale:'#ffe0e4',motif:'朱红门禁与金色锁',hint:'这里只去原站公开入口或办理说明；实际查询、材料或费用以原站规则为准。'},
  international:{label:'跨境登记区',en:'CROSS-BORDER REGISTRIES',code:'G',color:'#4260ad',pale:'#dfe6ff',motif:'靛蓝双塔与连桥',hint:'按司法辖区查注册、申报和 LEI；登记状态不等于所有权、担保能力或信贷结论。'}
};
export const LIMIT = 16;
export const SPAWN = { x:0, z:15 };
export const CELLS = [-12,-4,4,12];

export function districtLayout(rows, key) {
  return rows.filter(row => row.district===key).map((row,i)=>{
    const x=CELLS[i%4], z=-11+Math.floor(i/4)*7;
    return {...row,x,z,door:{x,z:z+3}};
  });
}

function face(mesh, points, color, id) { mesh.push({points,color,id}); }
function prism(mesh, ring, low, high, color, id) {
  const top=ring.map(([x,z])=>[x,high,z]);
  face(mesh,top,color,id);
  const shades=[.78,.90,.70,.85];
  ring.forEach(([x,z],i)=>{
    const [a,b]=ring[(i+1)%ring.length];
    face(mesh,[[x,low,z],[a,low,b],[a,high,b],[x,high,z]],shade(color,shades[i%4]),id);
  });
}
function shade(hex, k) {
  const n=parseInt(hex.slice(1),16);
  return '#'+[n>>16,(n>>8)&255,n&255].map(c=>Math.round(c*k).toString(16).padStart(2,'0')).join('');
}
function box(mesh, x,y,z, w,h,d, c,id) {
  const l=x-w/2,r=x+w/2,f=z-d/2,b=z+d/2;
  prism(mesh,[[l,f],[l,b],[r,b],[r,f]],y,y+h,c,id);
}
function round(mesh,x,y,z,rx,h,rz,color,id, sides=12) {
  const ring=Array.from({length:sides},(_,i)=>{
    const a=-(i+.5)*Math.PI*2/sides;
    return [x+Math.cos(a)*rx,z+Math.sin(a)*rz];
  });
  prism(mesh,ring,y,y+h,color,id);
}
function front(mesh,h, color,id) {
  box(mesh,0,.06,2.04,1.1,.12,.65,'#ddd9d4',id);
  box(mesh,0,.20,1.878,.87,1.42,.09,'#263852',id);
  box(mesh,0,h-.39,1.94,2.40,.19,.16,color,id);
}
function at(mesh,x,z){return mesh.map(f=>({...f,points:f.points.map(([a,b,c])=>[a+x,b,c+z])}));}

export function buildingMesh(place) {
  const {district,id,x,z}=place, {color,pale}=DISTRICTS[district], mesh=[];
  const v=[...id].reduce((n,ch)=>n+ch.charCodeAt(0),0)%3, h=2.58+v*.23;
  box(mesh,0,.02,0,4.3,.16,4.3,'#f6f2df',id);
  if(district==='consumer'){
    box(mesh,0,.18,-.12,3.70,h,3.45,pale,id);
    box(mesh,0,1.82,1.66,3.92,.21,.80,color,id);
    for(const a of [-1.16,1.16])box(mesh,a,.54,1.63,.68,.77,.10,color,id);
    box(mesh,0,h+.16,-.15,3.92,.28,3.72,color,id);
    round(mesh,-.36,h+.46,-.24,.72,.24,.72,color,id);
    round(mesh,-.36,h+.71,-.24,.50,.11,.50,'#fff7d8',id);
    box(mesh,.48,h+.48,.48,.69,.21,.26,color,id);
  } else if(district==='vertical'){
    box(mesh,0,.18,0,3.76,1.97,3.58,pale,id);
    box(mesh,0,2.15,-.31,3.86,.38,3.35,color,id);
    for(const a of [-1.34,1.29])box(mesh,a,2.53,-.78,.30,1.06,.31,color,id);
    box(mesh,.33,3.48,-.78,3.67,.19,.23,color,id);
    box(mesh,1.66,2.83,-.78,.085,.69,.085,'#5d4935',id);
    box(mesh,1.66,2.72,-.78,.30,.16,.27,'#f3b664',id);
    for(const a of [-1.22,1.22])box(mesh,a,.36,1.80,.65,.93,.08,color,id);
  } else if(district==='financial'){
    box(mesh,0,.18,.05,3.80,1.54,3.65,pale,id);
    for(const [i,w] of [1.12,1.04,.86].entries()){
      const bx=(i-1)*1.1, yy=1.73+i*.52+v*.12;
      box(mesh,bx,1.72,-.45,w,yy-1.16,2.52,color,id);
      box(mesh,bx,yy+.56,-.45,w+.08,.15,2.59,pale,id);
    }
    box(mesh,0,1.24,1.93,3.1,.15,.24,'#f8d278',id);
  } else if(district==='mainland_public'){
    box(mesh,0,.19,-.14,3.72,h-.20,3.48,pale,id);
    for(const a of [-1.43,-.94,.94,1.43])box(mesh,a,.23,1.61,.27,h-.25,.28,'#fbfff5',id);
    box(mesh,0,h-.02,0,3.99,.29,3.84,color,id);
    for(let i=0;i<3;i++)box(mesh,(i-1)*.14,h+.29+i*.16,-.22,2.52-i*.25,.12,2.02,'#ffedb9',id);
  } else if(district==='controlled'){
    box(mesh,0,.19,0,3.72,h-.1,3.70,pale,id);
    box(mesh,0,h+.10,0,3.94,.30,3.91,color,id);
    round(mesh,0,h+.42,-.22,.74,.39,.69,color,id,10);
    box(mesh,0,h+.64,-.22,.83,.31,.67,'#f5cd70',id);
    for(const a of [-1.45,1.45])box(mesh,a,.19,1.83,.47,1.94,.40,color,id);
    box(mesh,0,1.88,1.9,3.26,.20,.42,'#e9a4af',id);
  } else {
    box(mesh,0,.18,-.14,3.72,1.40,3.56,pale,id);
    for(const a of [-1.13,1.13]){
      box(mesh,a,1.59,-.37,1.34,h-1.26,2.55,color,id);
      box(mesh,a,h+.33,-.37,1.48,.17,2.61,pale,id);
    }
    box(mesh,0,2.64,.71,3.69,.32,1.12,'#8da6e9',id);
    round(mesh,0,2.99,.15,.55,.40,.51,'#f9d47a',id,10);
  }
  front(mesh,2.10,color,id);
  return at(mesh,x,z);
}

export function streetFurniture(plots) {
  const mesh=[];
  const corners=[[-15.9,-14.8],[15.8,-14.7],[-15.7,14.7],[15.7,14.7],[.08,-14.7]];
  for(const [x,z] of corners){
    box(mesh,x,.02,z,1.15,.17,1.13,'#bfc9b8');
    round(mesh,x,.17,z,.14,.8,.16,'#90724e',null,7);
    round(mesh,x,.77,z,.72,.52,.72,'#66a36f',null,8);
    round(mesh,x,1.27,z,.48,.49,.49,'#8ebf77',null,8);
  }
  for(const p of plots){
    const x=p.x-2.48,z=p.z+2.25;
    box(mesh,x,.035,z,.36,.09,.38,'#bec5af');
    box(mesh,x,.12,z,.07,1.02,.08,'#384e51');
    box(mesh,x,1.13,z,.26,.16,.25,'#ffe6a7');
  }
  return mesh;
}

export function actorMesh(x,z,phase=0,walking=false) {
  const mesh=[], step=walking?Math.sin(phase*12)*.21:0;
  const bounce=walking?Math.abs(step)*.5:0;
  round(mesh,-.22,.03,.05+step,.24,.22,.29,'#223954');
  round(mesh,.22,.03,.05-step,.24,.22,.29,'#223954');
  round(mesh,0,.23+bounce,0,.52,.58,.36,'#294271',null,10);
  box(mesh,0,.55+bounce,.33,.45,.25,.105,'#efc475');
  round(mesh,-.59,.35+bounce,step,.14,.33,.17,'#ffd9a0',null,8);
  round(mesh,.59,.35+bounce,-step,.14,.33,.17,'#ffd9a0',null,8);
  round(mesh,0,.84+bounce,0,.65,.49,.49,'#ffe3ae',null,12);
  round(mesh,0,1.33+bounce,-.02,.69,.22,.55,'#52659b',null,12);
  round(mesh,0,1.54+bounce,-.03,.45,.10,.39,'#9aaad2',null,10);
  box(mesh,0,.967+bounce,.484,.42,.166,.045,'#314457');
  box(mesh,0,.85+bounce,.51,.10,.065,.035,'#d77569');
  return at(mesh,x,z);
}
