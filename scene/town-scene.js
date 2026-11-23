// AC Town authored procedural 3D assets. Units are abstract. Y is up.
export const SCENE_VERSION = '1.0.0';
export const DISTRICTS = {
  regulation: { label:'监管与资格', en:'REGULATION', code:'R', color:'#3b89eb', pale:'#d7edff', motif:'蓝色列柱与盾牌', hint:'用法定名称和活动类型查资格；资格不等于某只产品已委任。' },
  provider: { label:'银行与托管机构', en:'CUSTODIANS', code:'C', color:'#16a78f', pale:'#c5f5e2', motif:'青色金库与圆形锁', hint:'了解保管、核算、交收、监督等服务；业务介绍不是资格或委任证明。' },
  infrastructure: { label:'登记、存管与交收', en:'SETTLEMENT', code:'I', color:'#9265e6', pale:'#ebddff', motif:'紫色双塔与交收轨道', hint:'区分登记、存管、清算和交收；公开规则不授予参与权限。' },
  disclosure: { label:'产品披露与原件', en:'DISCLOSURE', code:'D', color:'#e59c2f', pale:'#fff0bd', motif:'琥珀色层叠档案', hint:'找招募说明书、基金合同、托管协议或更换公告，核产品及日期。' },
  crossborder: { label:'跨境与次托管', en:'CROSS-BORDER', code:'X', color:'#e8686c', pale:'#ffe1dd', motif:'珊瑚色拱桥与连接线', hint:'按市场、通道和法律实体核托管链，不外推到账户或权限。' },
  standards: { label:'行业标准', en:'STANDARDS', code:'S', color:'#5b962c', pale:'#e9f6c9', motif:'绿色规则台与分层罗盘', hint:'从原则理解风险控制，实际准入仍以适用规则和原件为准。' }
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
  const {district,id,x,z}=place;
  const {color,pale}=DISTRICTS[district], mesh=[];
  const v=[...id].reduce((n,ch)=>n+ch.charCodeAt(0),0)%3;
  const H=2.9+v*.24;
  box(mesh,0,.02,0,4.3,.17,4.3,'#fbf9ec',id);
  if(district==='regulation'){
    box(mesh,0,.19,-.13,3.7,H-.29,3.5,pale,id);
    for(const px of [-1.42,-.91,.91,1.42]) box(mesh,px,.25,1.64,.26,H-.33,.26,'#fbfdff',id);
    box(mesh,0,H-.06,0,4.04,.30,3.95,color,id);
    box(mesh,0,H+.24,-.08,2.6,.32,2.4,pale,id);
    round(mesh,0,H+.56,-.1,.61,.20,.55,color,id,6);
  } else if(district==='provider'){
    box(mesh,0,.19,-.13,3.78,H-.15,3.59,pale,id);
    box(mesh,0,H,.02,4.01,.28,3.92,color,id);
    round(mesh,0,H+.28,0,1.11,.38,1.09,color,id);
    round(mesh,0,H+.66,0,.65,.13,.65,'#ffde85',id,8);
    for(const px of [-1.25,1.25]) box(mesh,px,.62,1.71,.68,1.20,.06,color,id);
  } else if(district==='infrastructure'){
    box(mesh,0,.19,.04,3.82,1.88,3.55,pale,id);
    for(const px of [-1.09,1.09]){
      box(mesh,px,1.97,-.40,1.56,H-1.25,2.36,color,id);
      box(mesh,px,H+.71,-.40,1.64,.20,2.47,pale,id);
      box(mesh,px,2.51,.80,.93,.18,.11,'#f9f4ff',id);
    }
    box(mesh,0,2.71,.34,3.72,.19,.66,pale,id);
    for(const px of [-1.17,1.17])box(mesh,px,.23,1.72,.49,.88,.07,color,id);
  } else if(district==='disclosure'){
    box(mesh,0,.19,0,3.81,1.75,3.61,pale,id);
    for(let i=0;i<3;i++){
      const yy=1.94+i*.47;
      box(mesh,i*.12-.12,yy,-.12,3.81-i*.37,.35,3.56-i*.28,i%2?pale:color,id);
      box(mesh,-.93+i*.12,yy+.05,1.69-i*.14,.69,.19,.07,'#fffbee',id);
    }
    box(mesh,-.6,3.35,-.05,1.07,.19,.76,'#ffe2a3',id);
  } else if(district==='crossborder'){
    box(mesh,0,.19,-.34,2.62,1.79,2.53,pale,id);
    for (const px of [-1.47,1.47]){
      box(mesh,px,.22,.07,.75,H,3.37,pale,id);
      box(mesh,px,H+.21,.02,.94,.21,3.50,color,id);
      box(mesh,px,H+.43,-.45,.42,.34,.53,color,id);
    }
    box(mesh,0,H-.19,.73,3.67,.40,1.55,color,id);
    box(mesh,0,H+.21,.73,3.58,.16,1.62,'#fff0c9',id);
  } else {
    box(mesh,0,.19,0,3.71,1.27,3.55,pale,id);
    box(mesh,0,1.45,0,3.32,.22,3.19,color,id);
    round(mesh,0,1.66,0,1.31,1.24,1.29,pale,id,8);
    round(mesh,0,2.89,0,1.52,.21,1.46,color,id,8);
    round(mesh,0,3.10,0,.77,.47,.73,'#e1ef82',id,8);
    round(mesh,0,3.57,0,.35,.21,.35,color,id,8);
  }
  front(mesh,district==='infrastructure'?1.94:2.05,color,id);
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
  round(mesh,0,.23+bounce,0,.52,.58,.36,'#2d8283',null,10);
  box(mesh,0,.55+bounce,.33,.45,.25,.105,'#93efd2');
  round(mesh,-.59,.35+bounce,step,.14,.33,.17,'#ffd9a0',null,8);
  round(mesh,.59,.35+bounce,-step,.14,.33,.17,'#ffd9a0',null,8);
  round(mesh,0,.84+bounce,0,.65,.49,.49,'#ffe3ae',null,12);
  round(mesh,0,1.33+bounce,-.02,.69,.22,.55,'#37a698',null,12);
  round(mesh,0,1.54+bounce,-.03,.45,.10,.39,'#73d6b4',null,10);
  box(mesh,0,.967+bounce,.484,.42,.166,.045,'#314457');
  box(mesh,0,.85+bounce,.51,.10,.065,.035,'#d77569');
  return at(mesh,x,z);
}
