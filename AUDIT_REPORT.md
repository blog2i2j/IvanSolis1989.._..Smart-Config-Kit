# Smart-Config-Kit 全量兼容性审计报告

**审计日期：** 2026-04-25  
**审计基线：** Clash Party v5.2.8 (`Clash Party/ClashParty(mihomo-smart).js`)  
**审计范围：** 全部 10 份产物 + Passwall2 参考实现  
**审计方法：** 对照官方文档 + 权威配置源 + CLAUDE.md §1~§7

---

## 发现总览

| 严重程度 | 数量 | 涉及产物 |
|---------|------|---------|
| 🔴 **CRITICAL** | 4 | CMFA YAML (2), Passwall2 (2) |
| 🟡 **MAJOR** | 2 | CMFA YAML (2) |
| 🔵 **MINOR** | 4 | SingBox (2), v2rayN (2) |
| ⚪ **INFO** | 2 | OpenClash (1), SingBox README (1) |
| ✅ **PASS** | ✅ | OpenClash, Shadowrocket, Surge, Loon, QX |

---

## 🔴 CRITICAL — 必须立即修复

### C1. CMFA YAML: `jsdelivr.net` 路由目标错误

- **文件：** `Clash Meta For Android/CMFA(mihomo).yaml` 第 4116 行
- **现状：** `DOMAIN-SUFFIX,jsdelivr.net,☁️ 云与CDN`
- **基线：** `Clash Party/ClashParty(mihomo-smart).js` 第 1985 行 → `🚫 受限网站`
- **原因：** v5.2.1 FIX：jsdelivr 走受限网站组，避免 rule-provider 刷新时 DNS 循环依赖
- **修复：** 改为 `'DOMAIN-SUFFIX,jsdelivr.net,🚫 受限网站'`

### C2. CMFA YAML: `blued` 规则目标错误

- **文件：** `Clash Meta For Android/CMFA(mihomo).yaml` 第 3573 行
- **现状：** `RULE-SET,blued,📱 社交媒体`
- **基线：** `Clash Party/ClashParty(mihomo-smart).js` 第 1423 行 → `BIZ.CN_SITE` = `🏠 国内网站`
- **原因：** Blued 是国产同性交友 App，国内直连，不应走代理
- **修复：** 改为 `'RULE-SET,blued,🏠 国内网站'`

### C3. Passwall2: `geosite:kakaotalk` 应为 `geosite:kakao`

- **文件：** `Passwall2/` 全部 4 个文件（apply.sh 第 118 行, .conf 第 125 行, .list 第 14 行, README.md 第 187 行）
- **现状：** `geosite:kakaotalk`
- **正确：** `geosite:kakao`
- **原因：** v2fly domain-list-community 无 `kakaotalk` 类别，只有 `kakao`。此问题在 v2rayN 中已于 v5.2.5-v2n.2 修复，但从未移植到 Passwall2。
- **影响：** KakaoTalk 流量无法命中即时通讯分流，回退到 GFW → 代理
- **修复：** 全部 4 个文件将 `kakaotalk` 改为 `kakao`

### C4. Passwall2: 广告拦截排序矛盾

- **文件：** `Passwall2/` 相关文档
- **现状：** 广告拦截声明为"最高优先级"但放置在规则 #28（最后一条），位于 `国内网站`、`受限网站`、`国外网站`、`FINAL` 之后
- **影响：** 匹配 `geosite:cloudflare`（云与CDN规则 #22）的广告网络域名将被代理而非屏蔽
- **修复：** 说明广告拦截是系统级黑名单机制（iptables/防火墙），或是将 shunt rule 位置调整为首位

---

## 🟡 MAJOR — 建议修复

### M1. CMFA YAML: 缺失关键 GEOSITE/GEOIP 规则

**文件：** `Clash Meta For Android/CMFA(mihomo).yaml`

CMFA 的 rules 节只使用 RULE-SET，**完全没有**以下基线的 GEOSITE/GEOIP 规则（除 `GEOIP,CN` 外）：

| 缺失规则 | 基线位置 | 影响 |
|---------|---------|------|
| `GEOSITE,category-ads-all,🛑 广告拦截` | JS:1145 | 广告拦截覆盖不足（无 RULE-SET 等价替代） |
| `GEOSITE,private,DIRECT` + `GEOIP,private,DIRECT,no-resolve` | JS:1159-1160 | TUN 模式无私有 IP 保护（安全风险） |
| `IP-CIDR,172.90.1.130/32,DIRECT,no-resolve` | JS:1161 | 特定 GSC IP 未直连 |
| `DOMAIN,ip.cip.cc,DIRECT` | JS:1172 | GSCService 连接检查 DNS 可能失败 |
| `DST-PORT,26880,DIRECT`、`DST-PORT,33068,DIRECT`、`DST-PORT,6540,DIRECT` | JS:1175-1177 | 特定端口未直连 |

**修复建议：** 将以上规则加入 CMFA rules 节（紧接 `DST-PORT,7680,REJECT` 之后和 `DST-PORT,123,DIRECT` 之前）。

### M2. CMFA YAML: 结构性 GEOSITE 规则缺失

以下 GEOSITE/GEOIP 规则在 CMFA 中缺失，但它们有 **RULE-SET 等价替代**（功能基本等价，覆盖粒度略窄）：

| 缺失规则 | RULE-SET 替代 | 覆盖差异 |
|---------|--------------|---------|
| `GEOSITE,gfw,🚫 受限网站` | `RULE-SET,loyalsoldier-gfw` + `szkane-proxygfw` | 基本等价 |
| `GEOSITE,category-games,🎮 国外游戏` | 各游戏 RULE-SET（steam/epic/etc） | 粒度更细但缺 geosite 宽匹配 |
| `GEOSITE,tracker,🛰️ BT/PT Tracker` | `RULE-SET,privatetracker` | 基本等价 |
| `GEOIP,ID,🌐 国外网站,no-resolve` | 无替代 | 🟡 缺少印尼 IP 兜底 |
| `GEOIP,cloudflare/telegram/netflix` | RULE-SET IP 版本 | 基本等价 |

**修复建议：** 最低要求：补齐 `GEOIP,ID`。其他可作为后续优化。

---

## 🔵 MINOR — 已知但可接受

### m1. SingBox: 352/385 RULE-SET 静默丢弃（架构限制）

- **文件：** `SingBox/SingBox(sing-box)-full.json`（由生成器生成）
- **现状：** 生成器只转换 MetaCubeX（32 条）和 DustinWin（1 条）的 `.srs` 规则集。blackmatrix7（253 条）、Accademia（85 条）、ACL4SSR、szkane（大部分）共 352 条规则被静默丢弃。
- **已在 CHANGELOG v5.2.6-sing.4 中记录**，但缺口规模未充分传达。
- **blued 影响：** 作为 352 条丢弃规则之一，Blued 流量在 SingBox 中无法命中 `🏠 国内网站` 直连，会回退到 GFW 或 FINAL。
- **修复：** 在 `SingBox/README.md` 中明确说明规则集覆盖范围仅为基线的子集。

### m2. v2rayN: blued 无明确规则

- **文件：** `v2rayN/v2rayN(xray).json`
- **现状：** 无 blued 明确规则，流量通过 GFW 回退到 `proxy` 而非直连
- **影响：** 轻微（多一跳代理延迟，功能无损）
- **修复：** 可选添加 `domain:blued` 到 CN 站点规则（scki-050）

### m3. v2rayN: jsdelivr.net 分类为云与CDN

- **文件：** `v2rayN/v2rayN(xray).json` 第 529 行
- **现状：** `domain:jsdelivr.net` 在 `scki-031-cloud-cdn` → `proxy`
- **基线：** `🚫 受限网站` → 也是 `proxy`
- **影响：** Xray 只有三出站（proxy/direct/block），行为完全等价。零影响。

### m4. Passwall2: pi.ai / inflection.ai 分类

- **基线：** `inflection.ai,🚫 受限网站`、`pi.ai,🚫 受限网站`
- **现状：** 归类为 `🤖 AI 服务`
- **影响：** 实践中都走代理，行为等价。语义标签不同。

---

## ⚪ INFO — 建议改进

### i1. OpenClash: 脚本头部缺少 Build 日期

- **文件：** `OpenClash/OpenClash(mihomo).sh`、`OpenClash/OpenClash(mihomo-smart).sh`
- **现状：** 头部注释缺少 `Build: YYYY-MM-DD` 行（CLAUDE.md §1.3 要求）
- **修复：** 添加 `# Build: 2026-04-24` 到头部注释块

### i2. SingBox README: 规则集覆盖范围说明

- 建议在 `SingBox/README.md` 中添加关于规则集覆盖范围是基线子集的说明

---

## ✅ PASS — 通过审查

| 产物 | 状态 | 备注 |
|------|------|------|
| `OpenClash/OpenClash(mihomo).sh` | ✅ PASS | 28 业务组 ✓, 18 区域组 ✓, blued ✓, jsdelivr ✓ |
| `OpenClash/OpenClash(mihomo-smart).sh` | ✅ PASS | 同上 |
| `Shadowrocket/Shadowrocket.conf` | ✅ PASS | 46 组 ✓, 无死引用 ✓, FINAL ✓ |
| `Surge/Surge.conf` | ✅ PASS | 46 组 ✓, 无死引用 ✓, FINAL ✓ |
| `Loon/Loon.conf` | ✅ PASS | 46 组 ✓, 无死引用 ✓, FINAL ✓ |
| `Quantumult X/QuantumultX.conf` | ✅ PASS | 46 组 ✓, 无死引用 ✓, FINAL ✓ |
| `SingBox/SingBox(sing-box)-full.json` | ⚠️ 见 m1 | 47 outbounds ✓, 624 rules ✓, 架构限制已知 |
| `v2rayN/v2rayN(xray).json` | ⚠️ 见 m2-m3 | 32 items ✓, JSON 合法 |
| `Passwall2/` | ⚠️ 见 C3-C4 | 28 shunt rules ✓, 语法兼容 ✓ |

---

## 自检命令结果摘要

| 命令 | 期望 | 实际 | 状态 |
|------|------|------|------|
| CMFA 代理组数 | 46 | 46 | ✅ |
| CMFA `proxy: '🚫 受限网站'` | ≥ 300 | 391 | ✅ |
| OC Normal 业务组数 | 28 | 28 | ✅ |
| OC Full 业务组数 | 28 | 28 | ✅ |
| OC `proxy: DIRECT` | 0 | 0 | ✅ |
| OC `proxy: 🚫 受限网站` (Normal) | ≥ 130 | 392 | ✅ |
| OC `proxy: 🚫 受限网站` (Full) | ≥ 380 | 392 | ✅ |
| SR/Surge/Loon 代理组 | 46 | 46 | ✅ |
| QX 代理组 | 46 | 46 | ✅ |
| SingBox selector+urltest | 47 | 47 | ✅ |
| SingBox JSON 合法 | VALID | VALID | ✅ |
| v2rayN JSON 合法 | VALID | VALID | ✅ |
| 死引用 `🇸🇬 亚太节点` | 无输出 | 无输出 | ✅ |
| 死引用 `🎵 TikTok` | 无输出 | 无输出 | ✅ |

---

## 修复优先级建议

### P0 — 立即修复（CRITICAL）
1. CMFA: `jsdelivr.net` → `🚫 受限网站`（line 4116）
2. CMFA: `blued` → `🏠 国内网站`（line 3573）
3. Passwall2: `geosite:kakaotalk` → `geosite:kakao`（全部 4 文件）
4. Passwall2: 广告拦截排序说明或调整

### P1 — 下次发版（MAJOR）
5. CMFA: 补齐 `GEOSITE,category-ads-all`、`GEOSITE,private`、`GEOIP,private` 等缺失规则
6. CMFA: 补齐缺失的 DST-PORT 规则（26880、33068、6540）

### P2 — 文档改进（INFO）
7. OpenClash: 添加 Build 日期到头部注释
8. SingBox README: 说明规则集覆盖范围子集

### P3 — 可选优化（MINOR）
9. v2rayN: 添加 blued 直连规则
10. Passwall2: 添加 biliintl / szkane-bilihmt 分流
