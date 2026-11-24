(function (root) {
  "use strict";
  const desks = [
    { id:"research", label:"选品室", short:"选品", x:-5.75, z:-1.75, color:"#81ebcf" },
    { id:"operations", label:"上架运营台", short:"运行", x:0, z:-2.25, color:"#a5b7ff" },
    { id:"monitor", label:"存续监控台", short:"维持运行", x:5.75, z:-1.75, color:"#ffc986" }
  ];
  const refs = {
    csrc:{ guide:"public-fund-disclosure", title:"证监会 · 公募基金信息披露", url:"https://www.csrc.gov.cn/csrc/c106256/c1653985/content.shtml", note:"核招募说明书、基金合同和公告；确认份额、生效日和期限。" },
    eid:{ guide:"fund-filing-search", title:"证监会 · 基金电子披露平台", url:"https://eid.csrc.gov.cn/fund", note:"查募集、运作和临时披露。入口可受网络限制，离线不影响任务。" },
    amac:{ guide:"private-fund-register", title:"中基协 · 管理人与私募基金公示",url:"https://gs.amac.org.cn/",note:"参考登记和公示，不等于合规代销、现售或质量认证。" },
    issuer:{ guide:"distributor-notice", title:"平安基金 · 销售机构公告示例",url:"https://fund.pingan.com/main/aV2/20260907/80933.shtml",note:"区分管理人、销售方和公告日期，不据此推断准入或当前可买。" },
    overview:{ guide:"private-bank-products", title:"平安银行 · 私行产品公开介绍",url:"https://bank.pingan.com/privatebank/invest_products.shtml",note:"理解产品类型。页面不代表本游戏产品、现售或银行内部流程。" },
    nfra:{ guide:"bank-agency-rules", title:"金融监管总局 · 商业银行代销办法",url:"https://www.nfra.gov.cn/cn/view/pages/rulesDetail.html?docId=1242774",note:"关注合作机构、产品准入与存续期管理；游戏阈值和角色是虚构的。" },
    full:{ guide:"holding-period-service", title:"代销办法全文 · 上海市政府转载",url:"https://www.shanghai.gov.cn/rzfwgj/20251020/df3cdfa45fa94fdd80d6eda78da1f2e8.html",note:"查第46–49条：持续关注风险与披露，保持存量服务。"}
  };
  const task = (title, intro, facts, options, answer, reason, handoff, links) =>
    ({title,intro,facts,options,answer,reason,handoff,links});
  const cases = {
    pub:{ label:"公募基金", product:"合成 · 青屿稳健 A 份额", signal:"资金可能在 30 天内用到。先看条款，再看收益。", tasks:[
      task("收益第一，能进短钱货架吗？","分行希望给这笔资金找一个 30 天内可用的候选。",[
        "候选甲：短窗净值 +9%，最短持有 90 天。",
        "候选乙（青屿 A）：短窗 +1.5%，无最低持有；异常赎回和到账条款待核。",
        "两者皆为虚构；净值历史表现不保证未来。"
      ],["优先甲，先让它进货架，90 天以后再说。","甲不用于这个需求；乙补赎回、到账和同份额资料后再送独立复核。","乙随时开放，所以一定当天到账，直接通过。"],1,
      "持有期超过资金使用期限是硬冲突。乙的开放频率不等于到账时间，缺文件时仍不能给准入结论。",
      "已记录流动性约束与缺件；下一站核上线版本。",["eid","csrc"]),
      task("审批的是 A 份额，页面却是 C","后续模拟独立审查已完成，运营准备同步获准的青屿 A 份额。",[
        "获准记录：A 份额，资料 v2，下一工作日生效。",
        "一个渠道预览：C 份额、资料 v1；培训材料仍在说旧期限。",
        "一个渠道显示正常，不代表所有渠道都同步。"
      ],["品牌是同一个，两个份额看起来差不多，全部上线。","先发布，待分行反馈再改。","拦下错配渠道，核份额、版本和生效日；同步获准的 FAQ，留回退。"],2,
      "审批对象是具体份额、版本和渠道。不能用同品牌代替一致性核验；发布必须有证据、复核和回退。",
      "渠道核对和退回路径已留档；进入存续监测。",["issuer","nfra"]),
      task("披露补来一份，能恢复新增吗？","后续离线校验通过，情景进入存续期。一家渠道仍展示旧风险资料。",[
        "重大披露缺口此前已转人工评估。",
        "管理人提供更正文件 v3，但该渠道尚未核生效，独立复核未齐。",
        "存量客户仍需要查询、披露协作和适用服务。"
      ],["新增停在待核，保留存量服务；核 v3、生效渠道与独立复核，再提恢复。","更正文件已到，所有渠道马上恢复。","暂停新增，连存量查询和通知都撤掉。"],0,
      "修复材料到达不等于可以恢复。当前版本、渠道及适用复核要一致；存量服务有独立责任。",
      "轮班完成：新增待核、存量继续；待下一窗口复核。",["full","csrc"])
    ]},
    pe:{ label:"私募股权", product:"合成 · 星沄长期股权", signal:"资金分配和剩余估值是两回事。先把结构画清楚。", tasks:[
      task("账面 1.75 倍，可以推进吗？","管理人介绍一项假想 PE 暴露，先做候选尽调。",[
        "合成金额：承诺 100、实缴 64、已分配 20、剩余估值 92。",
        "DPI = 0.3125，TVPI = 1.75；后者包含未实现估值。",
        "销售路径与发行主体的文件缺失，回款仍不确定。"
      ],["TVPI 超过 1.5 倍，推进上架。","记录估值与分配，保持 HOLD；补产品、发行／销售及缴款和退出证明。","有管理人登记，就自动具备银行销售路径。"],1,
      "估值不能当现金，管理人登记不能代替产品结构、合同和准入。没证据就暂停研究推进。",
      "已保留缺件清单；下一站演练同结构、不同版本的合成核对。",["amac","overview","nfra"]),
      task("获准的是 v2，分行拿到 v1","本关独立设定：假想载体和渠道已获准，接手上线核对。",[
        "获准 v2：发行方、销售方、GP 已分别记录；缴款安排和风险材料在附件。",
        "分行预览仍用 v1，缴款日和风险揭示副本不同。",
        "产品经理可提报和协调，不能代签或对外承诺收益。"
      ],["按 v1 办理，结束后再补资料。","让 GP 口头确认并取代渠道复核。","停在待核，锁定当前主体和版本；复核范围、缴款和适当性材料后再交授权人。"],2,
      "主体、版本、生效日和使用范围都要匹配；不能把 GP 说明当银行分销批准。",
      "合成上架证据进入人工复核，文件版本留档；准备监控交接。",["amac","nfra"]),
      task("分配纠正了，还有另一件未关","两项存续事件同时出现，值班系统收到一条更正。",[
        "事件 A：分配时间更正文件已复核。",
        "事件 B：缴款通知 v2 尚未复核；旧 v1 回执不能套用。",
        "存量仍有查询、披露协作和缴款条款解释需求。"
      ],["仅关闭 A，B 仍暂停新增待核；存量继续服务，不承诺分配或日期。","A 已经改好，恢复全部新增。","新增冻结，因此不再接受老客户的查询。"],0,
      "并发事件要分别关闭。存量服务不依赖新增开关；获准人员仍须按证据决定后续动作。",
      "轮班完成：A 已核、B 待核；把存量服务交到下一班。",["full","amac"])
    ]}
  };
  function empty() { return {mode:"pub", rounds:{pub:{done:0,retries:0},pe:{done:0,retries:0}}}; }
  function restore(raw) {
    const s=empty();
    if (!raw || typeof raw!=="object") return s;
    s.mode = raw.mode==="pe"?"pe":"pub";
    for(const id of ["pub","pe"]){
      const q=raw.rounds && raw.rounds[id];
      if(q && Number.isInteger(q.done) && q.done>=0 && q.done<=3) s.rounds[id].done=q.done;
      if(q && Number.isInteger(q.retries) && q.retries>=0 && q.retries<100000) s.rounds[id].retries=q.retries;
    }
    return s;
  }
  function decide(state, desk, choice) {
    const q=state.rounds[state.mode];
    if (!Number.isInteger(desk) || desk<0 || desk>2 || desk!==q.done || !Number.isInteger(choice) || choice<0 || choice>2) return "locked";
    const t=cases[state.mode].tasks[desk];
    if(choice!==t.answer){q.retries++;return "retry";}
    q.done++;
    return "passed";
  }
  const api={desks,refs,cases,empty,restore,decide};
  if(typeof module!=="undefined"&&module.exports) module.exports=api;
  else root.WMData=api;
})(globalThis);
