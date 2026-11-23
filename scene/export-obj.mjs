import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {DISTRICTS,SCENE_VERSION,actorMesh,buildingMesh} from './town-scene.js';

const out=resolve(process.argv[2]??fileURLToPath(new URL('./models/',import.meta.url)));
const objects=Object.keys(DISTRICTS).map((district,i)=>({
  name:district, faces:buildingMesh({district,id:'KIT'+i,x:(i%3)*6,z:Math.floor(i/3)*6})
}));
objects.push({name:'AC_avatar',faces:actorMesh(6,12)});
const obj=['# AC Town authored model kit '+SCENE_VERSION,'mtllib ac-town-kit.mtl'], materials=new Map();
let index=1;
for(const {name,faces} of objects){
  obj.push('o '+name);
  for(const f of faces){
    const color='m'+f.color.slice(1);
    materials.set(color,f.color);
    for(const xyz of f.points)obj.push('v '+xyz.map(n=>n.toFixed(5)).join(' '));
    obj.push('usemtl '+color,'f '+f.points.map(()=>index++).join(' '));
  }
}
const mtl=['# AC Town flat color materials'];
for(const [name,hex] of materials){
  const channels=[1,3,5].map(i=>(parseInt(hex.slice(i,i+2),16)/255).toFixed(6));
  mtl.push('newmtl '+name,'Kd '+channels.join(' '),'illum 1','');
}
mkdirSync(out,{recursive:true});
writeFileSync(join(out,'ac-town-kit.obj'),obj.join('\n')+'\n');
writeFileSync(join(out,'ac-town-kit.mtl'),mtl.join('\n').trimEnd()+'\n');
console.log(objects.length+' editable objects exported to '+out);
