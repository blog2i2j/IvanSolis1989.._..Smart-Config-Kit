// FlClash 覆写脚本 — 最简测试版（无 emoji、不清空、不加规则）
// 目的：确认是哪一步导致标签消失

const main = (config) => {
  // 只加一个最简单的代理组
  if (config["proxy-groups"]) {
    config["proxy-groups"].unshift({
      name: "TestGroup",
      type: "select",
      proxies: ["DIRECT"]
    });
  }
  return config;
};
