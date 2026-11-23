import {LIMIT} from './town-scene.js';

export function isWalkable(plots,x,z){
  return Number.isInteger(x)&&Number.isInteger(z)&&Math.abs(x)<=LIMIT&&Math.abs(z)<=LIMIT
    && !plots.some(p=>Math.abs(p.x-x)<=2&&Math.abs(p.z-z)<=2);
}
function nearest(plots,p){
  const x0=Math.max(-LIMIT,Math.min(LIMIT,Math.round(p.x)));
  const z0=Math.max(-LIMIT,Math.min(LIMIT,Math.round(p.z)));
  if(isWalkable(plots,x0,z0))return{x:x0,z:z0};
  let best=null, diff=Infinity;
  for(let x=-LIMIT;x<=LIMIT;x++)for(let z=-LIMIT;z<=LIMIT;z++){
    const d=(x-x0)**2+(z-z0)**2;
    if(d<diff&&isWalkable(plots,x,z)){best={x,z};diff=d;}
  }
  return best;
}
export function route(plots,from,to){
  if(![from.x,from.z,to.x,to.z].every(Number.isFinite))return [];
  const first=nearest(plots,from), last=nearest(plots,to);
  if(!first||!last)return [];
  const key=(x,z)=>x+','+z, end=key(last.x,last.z);
  const start={...first,prev:null};
  const queue=[start], seen=new Set([key(first.x,first.z)]);
  for(let i=0;i<queue.length;i++){
    const a=queue[i];
    if(key(a.x,a.z)===end){
      const steps=[];
      for(let n=a;n;n=n.prev)steps.push({x:n.x,z:n.z});
      return steps.reverse();
    }
    for(const [dx,dz] of [[0,-1],[1,0],[0,1],[-1,0]]){
      const x=a.x+dx,z=a.z+dz,k=key(x,z);
      if(!seen.has(k)&&isWalkable(plots,x,z)){seen.add(k);queue.push({x,z,prev:a});}
    }
  }
  return [];
}
export function camera(w,h,azimuth=Math.PI/4){
  const c=Math.cos(azimuth), s=Math.sin(azimuth);
  const scale=Math.min((w-14)/51,(h-83)/32), ox=w*.5,oy=h*.55;
  return{
    scale,
    project([x,y,z]){
      const n=s*x+c*z;
      return {x:ox+(c*x-s*z)*scale,y:oy+(.52*n-.854*y)*scale,depth:.854*n+.52*y};
    },
    ground(u,v){
      const a=(u-ox)/scale,b=(v-oy)/(.52*scale);
      return{x:c*a+s*b,z:-s*a+c*b};
    }
  };
}
