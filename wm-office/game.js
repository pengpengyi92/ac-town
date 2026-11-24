(function () {
  "use strict";
  const D=window.WMData,O=window.WMOffice;
  const $=id=>document.getElementById(id);
  const make=(tag,text,cls)=>{
    const n=document.createElement(tag);
    if(text!==undefined) n.textContent=text;
    if(cls) n.className=cls;
    return n;
  };
  const action=(text,cls,fn)=>{
    const n=make("button",text,cls);
    n.type="button";n.addEventListener("click",fn);return n;
  };
  const storageKey="pengyi-wm-desk-shift-v1";
  let state=D.empty();
  try {state=D.restore(JSON.parse(localStorage.getItem(storageKey)));} catch (_) {}
  let stage=0, feedback=null;
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
  const canvas=$("world"),arena=$("arena"),mission=$("mission"),info=$("info");
  const pins=Array.from(document.querySelectorAll("[data-desk]"));
  const steps=Array.from(document.querySelectorAll("[data-go]"));
  const wm={...O.entrance,angle:.48};
  let targetAngle=.30, viewAngle=targetAngle, engine=null, path=[], destination=null, last=0, dirty=true, near=-1;
  const keys=new Set();
  const round=()=>state.rounds[state.mode],pack=()=>D.cases[state.mode];
  function save(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch(_){}}
  function announce(s){$("live").textContent=s;}
  function links(ids){
    const ul=make("ul",undefined,"links");
    for(const id of [...new Set(ids)]){
      const link=D.refs[id],li=make("li"),a=make("a",link.title);
      a.href=new URL("../wm-library/"+link.guide+"/",window.location.href).href;
      a.target="_blank";a.rel="noopener noreferrer";
      li.append(a,make("span",link.note));ul.append(li);
    }
    return ul;
  }
  function updatePanel(){
    const q=round(),t=pack();
    $("headerProgress").textContent=q.done+" / 3";
    $("pubMode").setAttribute("aria-pressed",String(state.mode==="pub"));
    $("peMode").setAttribute("aria-pressed",String(state.mode==="pe"));
    $("signal").replaceChildren(make("b",t.product),make("p",t.signal));
    for(let i=0;i<3;i++){
      steps[i].parentElement.classList.toggle("is-next",i===q.done);
      steps[i].parentElement.classList.toggle("is-done",i<q.done);
      steps[i].querySelector(".step-status").textContent=i<q.done?"已交接":i===q.done?"当前任务":"待解锁";
      pins[i].classList.toggle("is-next",i===q.done);
    }
    const n=$("notebook");
    if(q.done===3){
      const d=D.desks.map((desk,i)=>desk.short+"已完成").join(" · ");
      n.replaceChildren(make("b","本班已交接"),make("p",d+"。修正次数 "+q.retries+"。可换另一类产品继续。"));
      $("next").textContent="交班 · 切换案例";
    }else{
      const latest=q.done>0?t.tasks[q.done-1].handoff:"先到选品室，桌上的资料可以边玩边查。";
      n.replaceChildren(make("b","交接记录"),make("p",latest));
      $("next").textContent="前往"+D.desks[q.done].label;
    }
    dirty=true;
  }
  function renderTask(focus){
    const t=pack().tasks[stage],q=round(),desk=D.desks[stage];
    $("taskKicker").textContent=String(stage+1).padStart(2,"0")+" / "+desk.label+" · "+pack().label;
    const body=$("taskBody");
    const title=make("h2",t.title);title.id="taskTitle";
    const summary=make("p",t.intro);
    const facts=make("ul",undefined,"facts");
    for(const line of t.facts) facts.append(make("li",line));
    body.replaceChildren(title,summary,facts);
    if(feedback){
      const n=make("p",feedback.text,feedback.ok?"feedback":"feedback bad");
      n.setAttribute("role",feedback.ok?"status":"alert");body.append(n);
    }
    if(stage>q.done){
      const s=make("p","先完成「"+D.desks[q.done].short+"」。本桌资料可先查阅。","locked");
      body.append(s,action("前往当前任务","primary",()=>{mission.close();gotoDesk(q.done);}));
    }else if(stage===q.done){
      body.append(make("h3","在终端提交你的判断"));
      const opts=make("div",undefined,"options");
      for(let i=0;i<t.options.length;i++){
        const b=action("","",()=>answer(i));
        b.append(make("span",String.fromCharCode(65+i),"choice-key"),make("span",t.options[i]));
        opts.append(b);
      }
      body.append(opts);
    }else{
      if(!feedback) body.append(make("p",t.handoff,"feedback"));
      const btn=q.done===3
        ?action("完成本班","primary",()=>{mission.close();if (round().done===3) $("next").focus();})
        :action("前往"+D.desks[q.done].label,"primary",()=>{mission.close();gotoDesk(q.done);});
      btn.id="afterTask";body.append(btn);
    }
    const r=make("details",undefined,"dialog-group");
    r.append(make("summary","这张桌的资料入口"),links(t.links));
    body.append(r);
    if(focus) (body.querySelector(".options button")||$("afterTask")||$("taskClose")).focus();
  }
  function answer(i){
    const t=pack().tasks[stage],result=D.decide(state,stage,i);
    if(result==="locked") return;
    feedback=result==="passed"
      ?{ok:true,text:"判断正确。"+t.reason}
      :{ok:false,text:"先别交接。"+t.reason+" 请重试。"};
    save();updatePanel();renderTask(true);
    announce(result==="passed"?"任务已交接":"决定需要重试");
  }
  function openTask(i){
    if(info.open) info.close();
    path=[];destination=null;stage=i;feedback=null;
    renderTask(false);
    if(!mission.open) mission.showModal();
    renderTask(true);
  }
  function gotoDesk(i){
    if(mission.open) mission.close();
    if(!engine||reduce.matches){
      Object.assign(wm,O.approach(i));wm.angle=Math.PI;dirty=true;openTask(i);return;
    }
    path=O.pathTo(wm,i);destination=i;keys.clear();
    announce("正在前往"+D.desks[i].label);
  }
  function switchMode(id){
    if(state.mode===id) return;
    state.mode=id;save();path=[];destination=null;keys.clear();
    Object.assign(wm,{...O.entrance,angle:.48});dirty=true;
    if(mission.open) mission.close();
    updatePanel();announce("切换到"+pack().label);
  }
  function displayInfo(type){
    const b=$("infoBody");
    if(type==="help"){
      const h=make("h2","操作说明");h.id="infoTitle";
      b.replaceChildren(h,make("p","用 WASD 或方向键移动 WM，走近电脑后按 E。也可以点击地图标牌或右侧任务，WM 会自动走过去。"),
        make("p","顺序是选品、运行、维持运行。错题可重试；两类班次分别记在本浏览器。所有业务资料与状态是合成演练。只有点开资料链接才访问外部网站。"));
    }else if(type==="references"){
      const h=make("h2","三张桌的资料入口");h.id="infoTitle";
      b.replaceChildren(h,make("p","官方站点供查证，不是推介或实时数据源。合成案例不对应任何现售产品。"));
      for(let i=0;i<3;i++){
        b.append(make("h3",D.desks[i].label),links([...D.cases.pub.tasks[i].links,...D.cases.pe.tasks[i].links]));
      }
    }else{
      const h=make("h2","重开"+pack().label+"班次？");h.id="infoTitle";
      const controls=make("div",undefined,"dialog-actions");
      controls.append(action("取消","quiet",()=>info.close()),action("重开本班","primary",()=>{
        state.rounds[state.mode]={done:0,retries:0};save();
        Object.assign(wm,{...O.entrance,angle:.48});path=[];destination=null;dirty=true;
        updatePanel();info.close();announce("已经重开本班");
      }));
      b.replaceChildren(h,make("p","清空这一类的已完成任务和修正次数，不影响另一类班次。"),controls);
    }
    if(!info.open) info.showModal();
  }
  $("helpOpen").addEventListener("click",()=>displayInfo("help"));
  $("referencesOpen").addEventListener("click",()=>displayInfo("references"));
  $("restart").addEventListener("click",()=>displayInfo("restart"));
  $("infoClose").addEventListener("click",()=>info.close());
  $("taskClose").addEventListener("click",()=>mission.close());
  $("pubMode").addEventListener("click",()=>switchMode("pub"));
  $("peMode").addEventListener("click",()=>switchMode("pe"));
  $("next").addEventListener("click",()=>{
    if(round().done===3) switchMode(state.mode==="pub"?"pe":"pub");
    else gotoDesk(round().done);
  });
  $("rotate").addEventListener("click",()=>{targetAngle=targetAngle>0?-.30:.30;dirty=true;});
  $("nearby").addEventListener("click",()=>{if(near>=0)openTask(near);});
  pins.forEach((pin,i)=>pin.addEventListener("click",()=>gotoDesk(i)));
  steps.forEach((step,i)=>step.addEventListener("click",()=>gotoDesk(i)));
  const travel=new Set(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"]);
  window.addEventListener("keydown",e=>{
    if(mission.open||info.open||e.altKey||e.ctrlKey||e.metaKey)return;
    const k=e.key.toLowerCase();
    if(travel.has(k)&&!(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))){
      if(!engine)return;
      e.preventDefault();path=[];destination=null;keys.add(k);
    }else if(k==="e"&&near>=0&&!e.repeat){e.preventDefault();openTask(near);}
  });
  window.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener("blur",()=>keys.clear());
  function updateProximity(){
    let closest=-1,dist=1.5;
    for(let i=0;i<3;i++){const d=O.approach(i),dd=Math.hypot(wm.x-d.x,wm.z-d.z);if(dd<dist){closest=i;dist=dd;}}
    if(near!==closest){
      near=closest;
      $("nearby").disabled=near<0;
      $("nearby").textContent=near<0?"走近工作桌":"操作电脑 · "+D.desks[near].short;
    }
  }
  const pos=(el,x,y)=>{el.style.left=x+"px";el.style.top=y+"px";};
  function frame(ms){
    const dt=last?Math.min(.035,(ms-last)/1000):0;last=ms;
    let moving=false;
    if(!mission.open&&!info.open){
      if(path.length){
        let next=path[0],dx=next.x-wm.x,dz=next.z-wm.z,dist=Math.hypot(dx,dz),max=dt*11.8;
        if(dist<=max||dist<.005){
          wm.x=next.x;wm.z=next.z;path.shift();moving=true;
          if(!path.length&&destination!==null){const i=destination;wm.angle=Math.PI;openTask(i);}
        }else if(max>0){wm.x+=dx/dist*max;wm.z+=dz/dist*max;wm.angle=Math.atan2(dx,dz);moving=true;}
      }else if(keys.size){
        const on=(a,b)=>Number(keys.has(a)||keys.has(b));
        const x=on("d","arrowright")-on("a","arrowleft");
        const z=on("s","arrowdown")-on("w","arrowup");
        const n=Math.hypot(x,z);
        if(n>0&&dt){const vx=x/n*dt*5.0,vz=z/n*dt*5.0;
          if(O.walkable(wm.x+vx,wm.z)) wm.x+=vx;
          if(O.walkable(wm.x,wm.z+vz)) wm.z+=vz;
          wm.angle=Math.atan2(x,z);moving=true;
        }
      }
    }
    if(moving) dirty=true;
    if(Math.abs(targetAngle-viewAngle)>.0008){
      viewAngle=reduce.matches?targetAngle:viewAngle+(targetAngle-viewAngle)*Math.min(1,dt*9.5);
      dirty=true;
    }
    if(dirty){
      const w=arena.clientWidth,h=arena.clientHeight;
      if(w>0&&h>0){
        const c=O.camera(w,h,viewAngle);
        engine.render(c,wm,ms/1000,moving&&!reduce.matches);
        for(let i=0;i<3;i++){
          const d=D.desks[i],xy=O.project([d.x,2.85,d.z-.08],c);
          const inset=w<500?54:69;
          const px=Math.max(inset,Math.min(w-inset,xy[0]));
          pos(pins[i],px,xy[1]+(w<410&&i===1?(w<375?27:10):0));
        }
        const p=O.project([wm.x,2.24,wm.z],c);pos($("avatarTag"),p[0],p[1]);
        updateProximity();dirty=moving;
      }
    }
    requestAnimationFrame(frame);
  }
  updatePanel();
  try{engine=O.renderer(canvas);}catch(e){console.warn("3D renderer unavailable",e.message);}
  if(engine){
    arena.dataset.renderer="webgl";
    if(window.ResizeObserver)new ResizeObserver(()=>{dirty=true;}).observe(arena);
    window.addEventListener("resize",()=>{dirty=true;});
    requestAnimationFrame(frame);
  }else{
    arena.dataset.renderer="fallback";
    arena.classList.add("webgl-unavailable");$("fallback").hidden=false;
  }
})();
