import assert from 'node:assert/strict';
import {test} from 'node:test';
import {places} from '../places.js';
import {DISTRICTS,SPAWN,actorMesh,buildingMesh,districtLayout} from '../town-scene.js';
import {camera,isWalkable,route} from '../navigation.js';

test('55 distinct HTTPS PACD entries across six roles',()=>{
  assert.equal(places.length,55);
  assert.equal(new Set(places.map(p=>p.id)).size,55);
  assert.deepEqual(Object.keys(DISTRICTS).map(k=>places.filter(p=>p.district===k).length),[16,12,13,8,5,1]);
  assert.equal(new Set(places.map(p=>p.url)).size,55);
  for(const p of places){
    const u=new URL(p.url);
    assert.equal(u.protocol,'https:');
    assert.ok(!u.username&&!u.password&&p.scope&&p.limit);
  }
});
test('every building entrance is reachable without walking through building footprints',()=>{
  for(const key of Object.keys(DISTRICTS)){
    const plots=districtLayout(places,key);
    for(const plot of plots){
      assert.equal(isWalkable(plots,plot.x,plot.z),false);
      const walk=route(plots,SPAWN,plot.door);
      assert.deepEqual(walk[0],SPAWN);
      assert.deepEqual(walk.at(-1),plot.door);
      for(let i=0;i<walk.length;i++){
        assert.ok(isWalkable(plots,walk[i].x,walk[i].z));
        if(i){assert.equal(Math.abs(walk[i].x-walk[i-1].x)+Math.abs(walk[i].z-walk[i-1].z),1);}
      }
    }
  }
});
test('pointer camera unprojects ground and rotates real 3D projection',()=>{
  const positions=[[3,0,-8],[0,0,15],[-16,0,16]];
  for(const size of [[980,590],[360,365]])for(let i=0;i<4;i++){
    const c=camera(...size,Math.PI/4+i*Math.PI/2);
    for(const xyz of positions){
      const p=c.project(xyz), u=c.ground(p.x,p.y);
      assert.ok(Math.abs(u.x-xyz[0])<1e-8&&Math.abs(u.z-xyz[2])<1e-8);
      assert.ok(c.project([xyz[0],2,xyz[2]]).y<p.y);
    }
  }
});
test('mesh cases use different silhouettes and avatar walking changes geometry',()=>{
  const signatures=new Set(Object.keys(DISTRICTS).map(district=>buildingMesh({district,id:'sample',x:0,z:0}).length));
  assert.ok(signatures.size>=5);
  assert.notDeepEqual(actorMesh(0,15,0,false),actorMesh(0,15,.14,true));
});
test('out of bounds and obstructed targets are safely adjusted',()=>{
  const plots=districtLayout(places,'regulation');
  assert.deepEqual(route(plots,SPAWN,{x:999,z:999}).at(-1),{x:16,z:16});
  const res=route(plots,SPAWN,plots[0]).at(-1);
  assert.ok(isWalkable(plots,res.x,res.z));
  assert.deepEqual(route(plots,SPAWN,{x:NaN,z:0}),[]);
});
