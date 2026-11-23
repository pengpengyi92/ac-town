# AC Town · PACD 资产托管小镇

**Author: PENGYI** · Version 1.0.1

[免登录试玩](https://pengpengyi92.github.io/ac-town/) · [CF 对公金融小镇](https://pengpengyi92.github.io/ac-town/cf/)

AC = Asset Custody，PACD = Pengyi Asset Custody Desk。Q 版 AC 在六个街区探索 55 个公开资料入口。点地面走路，点楼看机构用途和核对限制，再点「进入网站」打开资料原站。也可用建筑名录、键盘或手机操作。

本地：解压源码之后在根目录运行 `python -m http.server 8080 --bind 127.0.0.1`，访问 `http://127.0.0.1:8080`。无需 npm 安装；将六个网页文件放进任意静态服务器也可用。 `npm test` 运行模型和寻路测试。

[scene/](scene/) 包含可编辑 3D 源文件与 AC、六类建筑的 OBJ/MTL（导入时两个文件同目录），以及导出脚本。网页使用 `town-scene.js` 的完全一致副本；不需要下载 OBJ 才能在浏览器玩。

公开版只包含此游戏、原创示意模型、PACD 公开目录快照（2026-11-22）及测试。不查询账户或交易、不用机构 Logo、不代表原站背书。引用的原站和服务受各自条款约束；免登录的是游戏和源码下载，原站可能有地区或登录限制。本次分享未代作者授予额外开源许可证。
