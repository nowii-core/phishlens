import { SUSPICIOUS_TLDS } from '../../data/suspicious-tlds.js';
import { BRANDS } from '../../data/brands.js';
import { SHORTENERS } from '../../data/shorteners.js';

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 2) return 99;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
    }
  }
  return dp[m][n];
}

export function analyzeUrl(raw) {
  const findings = [];
  let score = 0;
  const add = (weight, id, message, severity, category = 'url') => {
    score += weight;
    findings.push({ id, message, severity, category, weight });
  };

  if (!raw || !raw.trim()) return { score: 0, findings: [], host: null };

  let input = raw.trim();
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(input)) input = 'http://' + input;

  let url;
  try { url = new URL(input); }
  catch { return { score: 100, findings: [{ id: 'invalid', message: 'URL non valido', severity: 'high', category: 'url', weight: 100 }], host: null }; }

  const host = url.hostname.toLowerCase();
  const tld = host.split('.').pop();
  const full = url.href;

  if (url.protocol === 'http:') add(15, 'http', 'Connessione non cifrata (HTTP)', 'medium');
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) add(30, 'ip-host', 'Host è un indirizzo IP', 'high');
  if (full.includes('@')) add(35, 'at-sign', 'URL contiene "@" (trucco credenziali)', 'critical');
  if (/xn--/.test(host)) add(25, 'punycode', 'Dominio punycode (possibile omografo)', 'high');
  if (SUSPICIOUS_TLDS.includes('.' + tld)) add(20, 'tld', 'TLD sospetto: .' + tld, 'medium');
  if (SHORTENERS.includes(host)) add(20, 'shortener', 'URL shortener (destinazione nascosta)', 'medium');
  if (host.split('.').length > 4) add(15, 'subdomains', 'Troppi sottodomini', 'medium');
  if (full.length > 100) add(10, 'long', 'URL insolitamente lungo', 'low');
  if (/%[0-9a-f]{2}/i.test(full)) add(10, 'encoded', 'Caratteri percent-encoded', 'low');
  if (url.port && url.port !== '80' && url.port !== '443') add(20, 'port', 'Porta non standard: ' + url.port, 'high');
  if (/\.(exe|scr|apk|zip|rar|js|vbs|bat|cmd|ps1|msi)$/i.test(url.pathname)) add(40, 'exec', 'URL punta a eseguibile/archivio', 'critical');
  if (/(login|verify|secure|account|update|confirm|signin|wallet|recovery|unlock|billing|invoice|payment|auth)/i.test(full)) add(15, 'keywords', 'Parole tipiche di phishing nel path', 'medium');
  if (/--/.test(full)) add(8, 'dashes', 'Doppi trattini nell URL', 'low');
  if ((host.match(/-/g) || []).length >= 2) add(10, 'hyphens', 'Molti trattini nel dominio', 'low');

  const parts = host.split('.');
  const label = parts.length >= 2 ? parts[parts.length - 2] : host;
  for (const brand of BRANDS) {
    const b = brand.toLowerCase();
    if (label === b) continue;
    if (label.length < 3) break;
    const d = levenshtein(label, b);
    if (d > 0 && d <= 2) { add(35, 'typo', 'Sembra imitare "' + brand + '" (distanza ' + d + ')', 'critical'); break; }
    if (label.includes(b) && label !== b && label.length <= b.length + 6) { add(25, 'impersonate', 'Contiene "' + brand + '" ma non è il dominio ufficiale', 'high'); break; }
  }

  return { score: Math.min(100, score), findings, host, tld };
}
