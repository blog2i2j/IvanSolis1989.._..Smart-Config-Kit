# FlClash — 变更日志

> FlClash 覆写脚本 `FlClash(mihomo).js`，使用标准 Mihomo 内核的 url-test 区域组。
> 基线：Clash Party Normal（规则与策略 100% 对齐）。

---

## v5.3.2-flclash.1 (2026-05-03)

- 初始版本，基于 Clash Party Normal v5.3.2 完整移植
  - 18 url-test 区域组（9 全部 + 9 家宽）+ 31 业务策略组（含 13 流媒体平台组）
  - 371+ rule-providers，覆盖 AI/流媒体/游戏/金融/社交/开发等全部场景
  - word-boundary 正则节点分类（REGION_DB 同 Clash Party v5.3.2）
  - 家宽自动识别 + 信息节点过滤
  - 订阅垃圾 proxy-groups / rules / rule-providers 自动清理
  - TLS 指纹自动注入（client-fingerprint）
- 适配 FlClash 覆写脚本环境：
  - `console.log` → 条件包装（兼容 QuickJS 引擎）
  - 全局设置精简：移除 `geox-url`/`geodata-mode`/TUN/端口覆写（由 FlClash App UI 管理）
  - **QuickJS FFI 修复**：数组操作改用原地修改（`splice`+`push`），避免重赋值（`= []`）在 Dart↔QuickJS 桥接层丢失
  - **必改配置文档化**：GeoX URL（外部资源）+ DNS（进阶配置）写入 README §第 4 步
  - 版本号独立：`v5.3.2-flclash.1`（跟随 Clash Party 主线）
- 与 CMFA YAML 并行提供（用户二选一）
