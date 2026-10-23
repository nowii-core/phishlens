import { analyzeUrl } from '../js/analyzers/url.js';
import { analyzeText } from '../js/analyzers/text.js';
import { analyzeHeaders } from '../js/analyzers/headers.js';
import { classify } from '../js/scoring.js';

export const tests = [
  { name: 'URL legittimo (google.com) → score basso', run: () => analyzeUrl('https://google.com').score < 30 },
  { name: 'URL con IP → score alto', run: () => analyzeUrl('http://192.168.1.1/admin').score >= 30 },
  { name: 'Typosquatting paypa1 → score alto', run: () => analyzeUrl('http://paypa1.com/login').score >= 50 },
  { name: 'HTTP non cifrato → segnalato', run: () => analyzeUrl('http://example.com').findings.some(f => f.id === 'http') },
  { name: 'TLD sospetto .tk → segnalato', run: () => analyzeUrl('http://example.tk').findings.some(f => f.id === 'tld') },
  { name: 'URL con @ → critico', run: () => analyzeUrl('http://legit.com@evil.tk').findings.some(f => f.id === 'at-sign') },
  { name: 'URL con .exe → critico', run: () => analyzeUrl('http://example.com/file.exe').findings.some(f => f.id === 'exec') },
  { name: 'Punycode → segnalato', run: () => analyzeUrl('http://xn--pypal-4ve.com').findings.some(f => f.id === 'punycode') },
  { name: 'Testo innocuo → score basso', run: () => analyzeText('Ciao, come stai? Ci vediamo domani per un caffè.').score < 20 },
  { name: 'Testo phishing IT → score alto', run: () => analyzeText('Caro cliente, il tuo account è sospeso. Verifica immediatamente le credenziali entro 24 ore cliccando qui.').score >= 40 },
  { name: 'Testo con IBAN → segnalato', run: () => analyzeText('Bonifico a IBAN IT60X0542811101000000123456').findings.some(f => f.id === 'iban') },
  { name: 'Testo con OTP → segnalato', run: () => analyzeText('Inserisci il codice OTP che hai ricevuto.').findings.some(f => f.id === 'creds') },
  { name: 'Header con DMARC fail → alto', run: () => analyzeHeaders('Authentication-Results: mx; spf=fail; dmarc=fail').score >= 30 },
  { name: 'Header con mismatch Reply-To → segnalato', run: () => analyzeHeaders('From: a@good.com\nReply-To: b@evil.com').findings.some(f => f.id === 'reply-mismatch') },
  { name: 'Display name spoofing → critico', run: () => analyzeHeaders('From: "PayPal" <attacker@evil.tk>').findings.some(f => f.id === 'display-spoof') },
  { name: 'classify(85) → CRITICO', run: () => classify(85).level === 'CRITICO' },
  { name: 'classify(0) → OK', run: () => classify(0).level === 'OK' }
];

export function runAll() {
  const results = tests.map(t => {
    try { return { name: t.name, pass: t.run(), error: null }; }
    catch (e) { return { name: t.name, pass: false, error: e.message }; }
  });
  const passed = results.filter(r => r.pass).length;
  return { results, passed, total: results.length, ok: passed === results.length };
}
