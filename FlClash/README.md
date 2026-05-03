# FlClash 使用教程 — 覆写脚本版

> 覆写脚本：`FlClash(mihomo).js`
> 适用客户端：**FlClash**（Android / Windows / macOS / Linux）
> 内核要求：FlClash >= **v0.8.85**（覆写脚本功能自该版本引入）
> 当前版本：**v5.3.2-flclash.1**（跟随 Clash Party 主线）

---

## 和 CMFA YAML 有什么区别？

FlClash 用户现在有 **两种选择**：

| | 覆写脚本 `FlClash(mihomo).js` | 静态 YAML `CMFA(mihomo).yaml` |
|---|---|---|
| 节点分类 | **word-boundary 正则**，TW 不误伤 TWN | Go RE2 子串匹配，精度较低 |
| 订阅垃圾清理 | 自动剔除机场自带的无用 proxy-groups | 无法清理（静态文件不含清理逻辑） |
| 家宽识别 | 自动识别家宽节点并建独立组 | 支持（filter 正则） |
| 信息节点过滤 | 自动过滤「剩余流量」「到期时间」等 | 不支持 |
| 空区域处理 | 该区域无节点则**自动跳过**，不建空组 | 可能产生空 url-test 组 |
| Smart + LightGBM | 不支持（FlClash 内核限制） | 不支持（同） |
| 导入复杂度 | 稍高（需粘贴脚本） | 低（直接导入 YAML 文件） |

**推荐**：如果你追求节点分类精度和订阅兼容性，用覆写脚本版。如果只想快速上手，用 CMFA YAML 版。

---

## 快速开始（3 步）

### 第 1 步：导入机场订阅

1. 打开 FlClash → 底部「配置」标签 → 右上角 **+** → **URL**
2. 粘贴机场提供的订阅地址 → 提交
3. 点击订阅卡片右上角 ⋮ → **同步**，确认节点列表加载成功

### 第 2 步：粘贴覆写脚本

1. 点击订阅卡片右上角 ⋮ → **覆写**
2. 开启「启用覆写」开关
3. 切换到「**脚本**」标签
4. 删除编辑器里的默认内容
5. 打开本仓库的 [`FlClash(mihomo).js`](./FlClash(mihomo).js)，**全选复制**
6. 粘贴到 FlClash 脚本编辑器中 → 右上角 **保存**

### 第 3 步：验证生效

1. 返回首页 → 下拉刷新或重启 FlClash
2. 点底部「代理」标签，应看到：
   - **18 区域组**（9 全部 + 9 家宽）：🌍 全球节点、🇭🇰 香港节点……
   - **31 业务组**：🤖 AI 服务、🎥 Netflix、📱 社交媒体……
3. 点底部「连接」标签，访问几个网站验证分流正确

---

## 常见问题

### Q: 为什么区域组是 url-test 而不是 smart？
FlClash 内核是标准 Mihomo，不支持 `type: smart` + LightGBM。`url-test`（按 gstatic 延迟择优）是标准内核下的最优选择。

### Q: 换机场后需要重新配置吗？
不需要。覆写脚本存在 FlClash 本地，换订阅后**自动重新执行**——节点分类、家宽识别、规则注入全部自动完成。

### Q: 脚本报错怎么办？
1. 确认 FlClash 版本 >= v0.8.85（设置 → 关于）
2. 检查脚本是否完整粘贴（不丢行、不截断）
3. 提 Issue 到本仓库，附上 FlClash 日志截图

### Q: 能和图形化覆写规则同时用吗？
可以。图形化覆写规则在脚本**之前**合并（配置流水线：订阅 → 图形化覆写合并 → 脚本评估 → YAML 编码），两者互不干扰。

### Q: 脚本更新后怎么升级？
重新打开 [`FlClash(mihomo).js`](./FlClash(mihomo).js)，全选复制，替换 FlClash 中的旧脚本内容，保存即可。

---

## 协议支持

FlClash 底层是 Mihomo 内核，协议支持与 CMFA 完全一致：

| 协议 | 支持 |
|---|:-:|
| Shadowsocks (SS) / SSR | ✅ |
| VMess / VLESS（含 REALITY + XTLS-Vision） | ✅ |
| Trojan（含 Trojan-Go） | ✅ |
| Hysteria v1/v2 / TUIC v5 | ✅ |
| WireGuard / AnyTLS / ShadowTLS / Snell v4 | ✅ |

---

## 相关链接

- [FlClash GitHub](https://github.com/chen08209/FlClash)
- [覆写脚本 API 参考教程 (Issue #1510)](https://github.com/chen08209/FlClash/issues/1510)
- [FlClash DeepWiki 配置管理文档](https://deepwiki.com/chen08209/FlClash/6-build-and-deployment)
- [CMFA YAML 静态版（备用方案）](../Clash%20Meta%20For%20Android/CMFA(mihomo).yaml)
