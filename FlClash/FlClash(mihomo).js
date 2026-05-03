// FlClash 覆写脚本 — 严格按内置模板格式
// 版本：v5.3.2-flclash.2 (2026-05-03)

var prependRule = [
  "DOMAIN-SUFFIX,example.com,🧪 测试组",
];

function main(config) {
  // 把新规则放在最前面
  config["rules"] = prependRule.concat(config["rules"]);

  // 加一个测试代理组
  var testProxies = [];
  if (config.proxies && config.proxies.length > 0) {
    for (var i = 0; i < config.proxies.length && i < 5; i++) {
      if (config.proxies[i] && config.proxies[i].name) {
        testProxies.push(config.proxies[i].name);
      }
    }
  }
  testProxies.push("DIRECT");

  config["proxy-groups"].push({
    "name": "🧪 测试组",
    "type": "select",
    "proxies": testProxies,
  });

  return config;
}
