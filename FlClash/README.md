# FlClash 使用教程 — 覆写脚本版

> 覆写脚本：`FlClash(mihomo).js`
> 适用客户端：**FlClash**（Android / Windows / macOS / Linux）
> 内核要求：FlClash >= **v0.8.85**

---

## 和 CMFA YAML 有什么区别？

| | 覆写脚本 `FlClash(mihomo).js` | 静态 YAML `CMFA(mihomo).yaml` |
|---|---|---|
| 节点分类 | **word-boundary 正则**，TW 不误伤 TWN | Go RE2 子串匹配，精度较低 |
| 订阅垃圾清理 | 自动剔除机场无用的 proxy-groups | 无法清理 |
| 家宽识别 | 自动识别家宽节点并建独立组 | 支持（filter 正则） |
| 空区域处理 | 无节点则**自动跳过**不建空组 | 可能产生空 url-test 组 |
| Smart + LightGBM | 不支持（内核限制） | 不支持（同） |

推荐用覆写脚本（动态分类更精确），想快速上手用 CMFA YAML。

---

## 快速开始（两步操作）

> ⚠️ **必须先「创建」脚本再「关联」到订阅，只粘贴不关联不会生效！**

### 第 1 步：创建覆写脚本

1. FlClash → 底部「配置」→ 顶部 **「覆写脚本」**
2. 点右上角 **+**
3. 输入名称（如 `Smart分流`），选择加载方式：
   - **URL**：填入 `https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/FlClash/FlClash(mihomo).js`
   - **粘贴**：浏览器打开上方链接，全选复制粘贴
4. 保存

### 第 2 步：关联到订阅

1. 返回配置页 → 点订阅卡片右上角 ⋮
2. **更多** → **覆写**
3. 选择刚才创建的覆写脚本 → 确定
4. 返回首页 → 下拉刷新（或重启 FlClash）

### 验证

点「代理」标签，应看到：
- **18 区域组**：🌍 全球节点、🇭🇰 香港节点……
- **31 业务组**：🤖 AI 服务、🎥 Netflix……

---

## 必改配置（手动设置）

导入脚本后，以下两项需要在 FlClash UI 手动设置，脚本无法注入：

### 外部资源（GeoX URL）
配置 → 订阅卡片 ⋮ → 编辑 → 外部资源：
```yaml
geox-url:
  geoip: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/geoip.dat
  mmdb: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb
  asn: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb
  geosite: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat
geo-auto-update: true
```

### 进阶配置（DNS）
配置 → 订阅卡片 ⋮ → 编辑 → 进阶配置：
```yaml
dns:
  use-hosts: false
  use-system-hosts: false
  respect-rules: true
  default-nameserver:
    - 223.5.5.5
    - 119.29.29.29
    - 1.1.1.1
    - 8.8.8.8
  nameserver:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
  proxy-server-nameserver:
    - https://cloudflare-dns.com/dns-query
    - https://dns.google/dns-query
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
  direct-nameserver:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
  fallback:
    - https://cloudflare-dns.com/dns-query
    - https://dns.google/dns-query
  fallback-filter:
    geoip: true
    geoip-code: CN
    ipcidr:
      - 240.0.0.0/4
      - 0.0.0.0/32
      - 127.0.0.0/8
      - 10.0.0.0/8
      - 192.168.0.0/16
    domain: []
```

---

## 常见问题

### Q: 为什么区域组是 url-test 而不是 smart？
FlClash 内核是标准 Mihomo，不支持 `type: smart` + LightGBM。

### Q: 换机场后需要重新配置吗？
不需要。覆写脚本换订阅后自动重新执行。

### Q: 脚本没生效？
确认两步都做了：（1）在「覆写脚本」里创建了脚本（2）在订阅的「更多 → 覆写」里关联了脚本。
