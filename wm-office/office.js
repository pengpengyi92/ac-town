(function(root){
  "use strict";
  const data = root.WMData || (typeof require==="function"?require("./data.js"):null);
  const {desks}=data;
  const cap=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
  const length=v=>Math.hypot(...v);
  const norm=v=>{const n=length(v);return v.map(x=>x/n);};
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const target=[0,1.04,-0.42];
  function camera(w,h,angle=0){
    const f=norm([Math.sin(angle)*20,13.4,Math.cos(angle)*20]);
    const r=norm(cross([0,1,0],f)),u=cross(f,r);
    const hx=Math.max(11.85,7.95*w/h),hy=h/w*hx;
    return {f,r,u,hx,hy,w,h};
  }
  function project(v,c){
    const d=v.map((x,i)=>x-target[i]);
    return [(0.5+dot(d,c.r)/(2*c.hx))*c.w,(0.5-dot(d,c.u)/(2*c.hy))*c.h];
  }
  const entrance={x:-1.0,z:3.55};
  function walkable(x,z){
    if(x< -8.5 || x>8.5 || z< -4.4 || z>4.92) return false;
    return !desks.some(d=>Math.abs(x-d.x)<2.08&&Math.abs(z-d.z)<1.05);
  }
  function approach(i){const d=desks[i];return {x:d.x,z:d.z+1.52};}
  function pathTo(start,i){
    const q=approach(i);
    const behind=desks.some(d=>Math.abs(start.x-d.x)<2.09 && start.z<d.z-1.04);
    const path=[];
    if(behind){
      const d=desks.find(k=>Math.abs(start.x-k.x)<2.09 && start.z<k.z-1.04);
      path.push({x:cap(d.x+(d.x>0?-2.30:2.30),-8.45,8.45),z:start.z});
    }
    const offset=path.length?path[0].x:start.x;
    path.push({x:offset,z:2.80},{x:q.x,z:2.80},q);
    return path;
  }
  const color=h=>[parseInt(h.slice(1,3),16)/255,parseInt(h.slice(3,5),16)/255,parseInt(h.slice(5,7),16)/255];
  const quad=[[0,1,2],[0,2,3]];
  function face(a,points,n,fill){
    const col=color(fill);
    for(const t of quad) for(const k of t) a.push(...points[k],...n,...col);
  }
  function box(a,x,y,z,w,h,d,fill,transform){
    const v=[
      [x-w/2,y-h/2,z-d/2],[x+w/2,y-h/2,z-d/2],[x+w/2,y+h/2,z-d/2],[x-w/2,y+h/2,z-d/2],
      [x-w/2,y-h/2,z+d/2],[x+w/2,y-h/2,z+d/2],[x+w/2,y+h/2,z+d/2],[x-w/2,y+h/2,z+d/2]
    ].map(p=>transform?transform(p,false):p);
    for(const [ix,n] of [
      [[0,1,2,3],[0,0,-1]],[[4,5,6,7],[0,0,1]],[[0,4,7,3],[-1,0,0]],[[1,5,6,2],[1,0,0]],
      [[2,3,7,6],[0,1,0]],[[0,1,5,4],[0,-1,0]]
    ]) face(a,ix.map(i=>v[i]),transform?transform(n,true):n,fill);
  }
  function ellipsoid(a,x,y,z,rx,ry,rz,fill,transform,steps=9,rings=6){
    const col=color(fill);
    const sample=(i,k)=>{
      const ang=i/steps*2*Math.PI,phi=Math.PI*(k/rings);
      const p=[Math.cos(ang)*Math.sin(phi),Math.cos(phi),Math.sin(ang)*Math.sin(phi)];
      const pos=[x+p[0]*rx,y+p[1]*ry,z+p[2]*rz];
      const n=norm([p[0]/rx,p[1]/ry,p[2]/rz]);
      return [transform?transform(pos,false):pos,transform?transform(n,true):n];
    };
    for(let k=0;k<rings;k++) for(let i=0;i<steps;i++){
      const q=[sample(i,k),sample(i+1,k),sample(i+1,k+1),sample(i,k+1)];
      for(const t of quad) for(const v of t) a.push(...q[v][0],...q[v][1],...col);
    }
  }
  function deskGeometry(a,d,i){
    const x=d.x,z=d.z,c=d.color;
    box(a,x,0.025,z+0.02,4.46,0.05,3.2,["#28394a","#30354c","#3e3342"][i]);
    box(a,x,0.052,z+1.58,4.42,.033,.055,c);
    box(a,x,0.05,z+.65,4.25,.022,.032,"#718986");
    box(a,x,.97,z,4.0,.17,1.48,"#ba9d81");
    box(a,x,.875,z+.73,4.05,.05,.07,"#dbc5a7");
    for(const s of [-1,1]){
      box(a,x+s*1.78,.47,z+.03,.15,.88,1.22,"#35505c");
      box(a,x+s*1.78,.05,z+.03,.28,.11,1.28,"#293c49");
    }
    box(a,x-1.38,.61,z-.04,.49,.52,1.10,"#506875");
    for(const yy of [.53,.72]) box(a,x-1.38,yy,z+.53,.36,.035,.055,"#9ab2b8");
    box(a,x+.14,1.28,z-.26,.12,.43,.15,"#3d5363");
    box(a,x+.14,1.08,z-.25,.76,.08,.42,"#485f6d");
    box(a,x+.14,1.75,z-.31,1.78,.87,.155,"#a6c8ca");
    box(a,x+.14,1.75,z-.219,1.63,.72,.029,"#163340");
    box(a,x-.22,2.01,z-.195,.72,.045,.014,c);
    box(a,x+.73,2.01,z-.195,.22,.045,.014,"#c6e0e6");
    for(let k=0;k<8;k++){
      const y=i===0?[.10,.13,.18,.11,.25,.27,.19,.31][k]:i===1?[.20,.25,.20,.31,.27,.31,.32,.24][k]:[.11,.15,.22,.29,.23,.13,.34,.16][k];
      box(a,x-.51+k*.177,1.49+y/2,z-.195,.108,y,.012,k%3===0?"#b9e4e1":c);
    }
    box(a,x+.14,1.09,z+.40,1.14,.065,.35,"#354856");
    for(let q=0;q<10;q++) box(a,x-.33+q*.104,1.128,z+.39,.064,.014,.25,"#789299");
    box(a,x+.92,1.10,z+.43,.17,.065,.25,"#354a55");
    box(a,x-1.05,1.12,z+.29,.54,.16,.58,["#58ad96","#748fd3","#b99878"][i]);
    box(a,x-1.05,1.213,z+.29,.50,.024,.51,"#d4dcd3");
    box(a,x-1.05,1.235,z+.28,.38,.018,.38,["#accb9f","#b6b2eb","#ead1a3"][i]);
    box(a,x-1.50,1.14,z+.0,.22,.22,.21,"#d6cdae");
    box(a,x-1.50,1.258,z,.13,.015,.13,"#785b42");
    box(a,x+1.51,1.11,z-.36,.40,.12,.31,"#3a515b");
    box(a,x+1.51,1.35,z-.36,.075,.46,.079,"#8da3a9");
    ellipsoid(a,x+1.51,1.64,z-.36,.13,.15,.13,c);
    box(a,x+1.08,.35,z+1.12,.09,.68,.09,"#607982");
    box(a,x+1.08,.61,z+1.12,.69,.14,.55,["#578883","#65749a","#866b67"][i]);
    box(a,x+1.08,.88,z+1.37,.69,.58,.13,["#578883","#65749a","#866b67"][i]);
    box(a,x+1.08,.14,z+1.12,.72,.07,.09,"#526772");
    box(a,x+1.08,.14,z+1.12,.09,.07,.66,"#526772");
  }
  function buildRoom(){
    const a=[];
    box(a,0,-.64,0,19.55,.66,11.65,"#293d50");
    box(a,0,-.278,0,19.62,.09,11.71,"#72b3ba");
    box(a,0,-.145,0,19.25,.25,11.35,"#859b9b");
    for(let x=0;x<16;x++) for(let z=0;z<10;z++){
      const t=["#7e9896","#8ca39e","#809c99","#90a49c"][(x*5+z*11+x*z)%4];
      box(a,-9.02+x*1.202,-.034,-5.10+z*1.13,1.185,.064,1.111,t);
    }
    box(a,0,.018,2.90,17.85,.036,1.20,"#56747d");
    for(let x=-8.45;x<=8.5;x+=.90) box(a,x,.045,2.90,.47,.018,.030,"#a4c8c7");
    for(const d of desks) for(let z=.50;z<=2.8;z+=.45) box(a,d.x,.052,z,.045,.017,.22,d.color);
    box(a,0,.30,-5.47,18.90,.63,.32,"#63808a");
    box(a,0,2.81,-5.47,18.90,.21,.32,"#aec7c9");
    for(let i=0;i<13;i++){
      const x=-8.7+i*1.45;
      box(a,x,1.74,-5.44,.105,2.09,.23,"#b2c8ca");
      if(i<12){
        box(a,x+.72,1.75,-5.53,1.24,1.83,.051,["#436779","#355969","#3e6679"][i%3]);
        for(let q=0;q<5;q++){
          const tall=.15+.11*((i*7+q*3)%9);
          box(a,x+.21+q*.25,.85+tall/2,-5.486,.19,tall,.021,["#5e8492","#50788a","#6d8c9a"][q%3]);
        }
        box(a,x+.72,2.46,-5.482,1.20,.034,.022,"#a0bdc4");
      }
    }
    box(a,-9.35,.37,-1.87,.26,.79,6.63,"#708992");
    box(a,-9.35,.822,-1.87,.30,.12,6.63,"#bad0cd");
    box(a,9.34,.26,-2.0,.23,.55,5.86,"#718d95");
    box(a,9.34,.604,-2.0,.28,.14,5.86,"#c1d2c7");
    for(const [x,z] of [[-8.1,-4.26],[8.07,-4.30],[-8.07,4.23],[8.0,4.23]]){
      box(a,x,.25,z,.67,.48,.68,"#8b9c87");
      box(a,x,.49,z,.63,.095,.65,"#576c61");
      box(a,x,.78,z,.10,.60,.10,"#496d58");
      for(let i=0;i<6;i++){
        const p=i*Math.PI/3;
        ellipsoid(a,x+Math.cos(p)*.21,1.01+(i%3)*.11,z+Math.sin(p)*.23,.23,.16,.22,
          ["#58967b","#79ad88","#447b6d"][i%3]);
      }
    }
    for(let i=0;i<3;i++){
      const x=-5.75+i*5.75;
      box(a,x,1.06,-4.78,3.27,.20,.53,"#b8a58d");
      box(a,x,.54,-4.78,3.24,.89,.48,"#58727e");
      for(let k=-1;k<=1;k++) {
        box(a,x+k*1.07,.54,-4.52,.96,.72,.05,"#6f8c94");
        box(a,x+k*1.07,.74,-4.48,.35,.035,.06,"#b5ccca");
      }
      for(let k=0;k<5;k++) box(a,x-1.20+k*.14,1.36+(k%2)*.055,-4.72,.11,.45+(k%2)*.11,.30,["#88b4ad","#b3ac9c","#93a5c2"][k%3]);
    }
    for(const d of desks) deskGeometry(a,d,desks.indexOf(d));
    return new Float32Array(a);
  }
  function avatarMesh(wm,time,moving){
    const a=[],s=Math.sin(wm.angle),c=Math.cos(wm.angle);
    const swing=moving?Math.sin(time*10)*.12:0;
    const bob=moving?Math.abs(Math.sin(time*10))*.08:0;
    const tr=(p,n)=>[c*p[0]+s*p[2]+(n?0:wm.x),p[1]+(n?0:bob),-s*p[0]+c*p[2]+(n?0:wm.z)];
    ellipsoid(a,wm.x,.07,wm.z,.64,.03,.50,"#51696c",null,14,4);
    for(const side of [-1,1]){
      box(a,side*.18,.33,side*swing,.23,.58,.24,"#35495c",tr);
      box(a,side*.18,.105,.06+side*swing,.28,.17,.39,"#263642",tr);
      box(a,side*.39,1.0,-side*swing,.18,.58,.25,"#d9e8df",tr);
      ellipsoid(a,side*.39,.67,-side*swing,.10,.12,.11,"#edbc95",tr);
    }
    box(a,0,1.00,0,.58,.62,.37,"#ecf2df",tr);
    box(a,0,1.0,.192,.10,.53,.024,"#498c79",tr);
    box(a,.16,1.13,.197,.18,.09,.026,"#59ccab",tr);
    ellipsoid(a,0,1.56,.015,.302,.354,.287,"#e8b48d",tr,13,8);
    ellipsoid(a,0,1.75,-.059,.315,.212,.268,"#2b4448",tr,13,6);
    ellipsoid(a,-.22,1.56,-.056,.108,.20,.15,"#2b4448",tr);
    for(const xx of [-.103,.103]) box(a,xx,1.56,.280,.052,.057,.025,"#29434c",tr);
    box(a,0,1.423,.273,.12,.025,.018,"#a06362",tr);
    return new Float32Array(a);
  }
  function renderer(canvas){
    const gl=canvas.getContext("webgl",{alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:"low-power"});
    if(!gl) return null;
    const vertex=
      "attribute vec3 p;attribute vec3 n;attribute vec3 c;uniform vec3 r,u,f,t;uniform vec2 e;"+
      "varying vec3 shade;void main(){vec3 d=p-t;gl_Position=vec4(dot(d,r)/e.x,dot(d,u)/e.y,-dot(d,f)/30.0,1.0);"+
      "vec3 light=normalize(vec3(-0.43,0.83,0.36));float a=max(0.0,dot(normalize(n),light));shade=c*(0.66+0.34*a);}";
    const fragment="precision mediump float;varying vec3 shade;void main(){gl_FragColor=vec4(shade,1.0);}";
    function shader(typ,src){const s=gl.createShader(typ);gl.shaderSource(s,src);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));return s;}
    const program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const loc=Object.fromEntries(["r","u","f","t","e"].map(x=>[x,gl.getUniformLocation(program,x)]));
    const at=["p","n","c"].map(x=>gl.getAttribLocation(program,x));
    const scene=buildRoom();
    const roomBuffer=gl.createBuffer(),movingBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,roomBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,scene,gl.STATIC_DRAW);
    gl.clearColor(0,0,0,0);gl.enable(gl.DEPTH_TEST);
    function draw(buffer,num){
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      at.forEach((ind,i)=>{gl.enableVertexAttribArray(ind);gl.vertexAttribPointer(ind,3,gl.FLOAT,false,36,12*i);});
      gl.drawArrays(gl.TRIANGLES,0,num/9);
    }
    return {
      render(c,wm,time,moving){
        const ratio=Math.min(1.65,root.devicePixelRatio||1);
        const w=Math.round(c.w*ratio),h=Math.round(c.h*ratio);
        if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.uniform3fv(loc.r,c.r);gl.uniform3fv(loc.u,c.u);gl.uniform3fv(loc.f,c.f);
        gl.uniform3fv(loc.t,target);gl.uniform2f(loc.e,c.hx,c.hy);
        draw(roomBuffer,scene.length);
        const mesh=avatarMesh(wm,time,moving);
        gl.bindBuffer(gl.ARRAY_BUFFER,movingBuffer);gl.bufferData(gl.ARRAY_BUFFER,mesh,gl.DYNAMIC_DRAW);
        draw(movingBuffer,mesh.length);
      }
    };
  }
  const api={camera,project,entrance,approach,pathTo,walkable,renderer,buildRoom,avatarMesh};
  if(typeof module!=="undefined"&&module.exports) module.exports=api;else root.WMOffice=api;
})(globalThis);
