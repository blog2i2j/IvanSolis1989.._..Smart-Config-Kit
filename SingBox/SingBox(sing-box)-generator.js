const fs = require('fs');
const vm = require('vm');

const clashScript = fs.readFileSync('Clash Party/ClashParty(mihomo-smart).js', 'utf8');
const baseConfig = JSON.parse(fs.readFileSync('SingBox/SingBox(sing-box).json', 'utf8'));

const sandbox = { console };
vm.createContext(sandbox);
vm.runInContext(clashScript + '\nthis.__main = main;', sandbox);
if (typeof sandbox.__main !== 'function') throw new Error('main() not found');

function p(name) {
  return { name, type: 'trojan', server: 'example.com', port: 443, password: 'x', tls: true };
}

const proxies = [
  p('🇭🇰 HK-01'), p('🇭🇰 HK-02'),
  p('🇹🇼 TW-01'),
  p('🇯🇵 JP-01'), p('🇰🇷 KR-01'),
  p('🇸🇬 SG-01'), p('印尼 Jakarta 01'),
  p('🇺🇸 US-01'), p('🇺🇸 US-02'),
  p('🇪🇺 DE-01'), p('🇨🇦 CA-01'),
  p('🇿🇦 South Africa-01'),
  p('🇨🇳 回国专线-01')
];

const clashConfig = { proxies, 'proxy-groups': [], rules: [] };
const out = sandbox.__main(clashConfig);
const providers = out['rule-providers'] || {};
const rules = out.rules || [];
const ADS_OUTBOUND = '🛑 广告拦截';

function isRejectTarget(target) {
  return target === 'REJECT' || target === ADS_OUTBOUND;
}

function toSingRule(ruleText, availableRuleSets) {
  if (typeof ruleText !== 'string') return null;
  const parts = ruleText.split(',');
  const type = parts[0];

  if (type === 'RULE-SET') {
    if (!availableRuleSets.has(parts[1])) return null;
    if (isRejectTarget(parts[2])) return { rule_set: [parts[1]], action: 'reject' };
    return { rule_set: [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'DOMAIN-SUFFIX') {
    if (isRejectTarget(parts[2])) return { domain_suffix: [parts[1]], action: 'reject' };
    return { domain_suffix: [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'DOMAIN') {
    if (isRejectTarget(parts[2])) return { domain: [parts[1]], action: 'reject' };
    return { domain: [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'DOMAIN-KEYWORD') {
    if (isRejectTarget(parts[2])) return { domain_keyword: [parts[1]], action: 'reject' };
    return { domain_keyword: [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'IP-CIDR' || type === 'IP-CIDR6' || type === 'SRC-IP-CIDR') {
    if (isRejectTarget(parts[2])) return { ip_cidr: [parts[1]], action: 'reject' };
    return { ip_cidr: [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'GEOIP') {
    if (parts[1] === 'private') {
      if (isRejectTarget(parts[2])) return { ip_is_private: true, action: 'reject' };
      return { ip_is_private: true, action: 'route', outbound: parts[2] };
    }
    if (isRejectTarget(parts[2])) return { geoip: [parts[1]], action: 'reject' };
    return { geoip: [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'PROCESS-NAME') {
    if (isRejectTarget(parts[2])) return { process_name: [parts[1]], action: 'reject' };
    return { process_name: [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'DST-PORT') {
    const port = Number(parts[1]);
    if (isRejectTarget(parts[2])) return { port: Number.isFinite(port) ? [port] : [parts[1]], action: 'reject' };
    return { port: Number.isFinite(port) ? [port] : [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'GEOSITE') {
    const tag = `geosite-${parts[1]}`;
    if (!availableRuleSets.has(tag)) return null;
    if (isRejectTarget(parts[2])) return { rule_set: [tag], action: 'reject' };
    return { rule_set: [tag], action: 'route', outbound: parts[2] };
  }
  if (type === 'NETWORK') {
    if (isRejectTarget(parts[2])) return { network: parts[1], action: 'reject' };
    return { network: parts[1], action: 'route', outbound: parts[2] };
  }
  if (type === 'MATCH') {
    return { action: 'route', outbound: parts[1] };
  }
  return null;
}

function toSrsUrl(url, tag) {
  if (!url) return null;
  if (/\.srs$/i.test(url)) return url;

  const metaRulesDat = url.match(/^(https:\/\/(?:fastly\.|cdn\.)?jsdelivr\.net\/gh\/MetaCubeX\/meta-rules-dat)@meta\/geo\/(geosite|geoip)\/(.+)\.mrs$/i);
  if (metaRulesDat) {
    return `${metaRulesDat[1]}@sing/geo/${metaRulesDat[2]}/${metaRulesDat[3]}.srs`;
  }

  if (tag === 'anti-ad' && /DustinWin\/ruleset_geodata@mihomo-ruleset\/ads\.mrs$/i.test(url)) {
    return 'https://fastly.jsdelivr.net/gh/DustinWin/ruleset_geodata@sing-box-ruleset/ads.srs';
  }

  return null;
}

const extraGeoSiteTags = Array.from(new Set(
  rules
    .map((r) => String(r).split(','))
    .filter((p) => p[0] === 'GEOSITE' && p[1])
    .map((p) => `geosite-${p[1]}`)
)).map((tag) => ({
  type: 'remote',
  tag,
  format: 'binary',
  url: `https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@sing/geo/geosite/${tag.replace('geosite-', '')}.srs`,
  download_detour: '🌍 全球节点',
  update_interval: '1d'
}));

const ruleSet = Object.entries(providers).map(([tag, info]) => {
  const url = toSrsUrl(info.url, tag);
  if (!url) return null;
  return {
    type: 'remote',
    tag,
    format: 'binary',
    url,
    download_detour: '🌍 全球节点',
    update_interval: '1d'
  };
}).filter(Boolean);

const availableRuleSets = new Set([...ruleSet, ...extraGeoSiteTags].map((item) => item.tag));
const convertedRules = rules.map((rule) => toSingRule(rule, availableRuleSets)).filter(Boolean);
const skippedProviders = Object.keys(providers).length - ruleSet.length;
const skippedRules = rules.length - convertedRules.length;

baseConfig.route.rule_set = [...ruleSet, ...extraGeoSiteTags];
baseConfig.route.rules = convertedRules;
baseConfig.route.final = '🐟 漏网之鱼';

fs.writeFileSync('SingBox/SingBox(sing-box)-full.json', JSON.stringify(baseConfig, null, 2) + '\n');

console.log(`providers=${ruleSet.length} extra_geosite=${extraGeoSiteTags.length} skipped_providers=${skippedProviders} rules=${convertedRules.length} skipped_rules=${skippedRules}`);
