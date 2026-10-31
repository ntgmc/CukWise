export function sourceStatus(http: number, body: string) {
  if ([401, 403, 429].includes(http) || /<title[^>]*>[^<]*(?:验证|Verification|Just a moment)/i.test(body)) return "needs-browser";
  if ([404, 410].includes(http) || /<title[^>]*>\s*(?:404|页面不存在|页面未找到|Lego head)/i.test(body)) return "missing";
  return http >= 200 && http < 300 ? "reachable" : "unavailable";
}
