import { BRANDS } from '../../data/brands.js';

export function analyzeHeaders(raw) {
  const findings = [];
  let score = 0;
  const add = (weight, id, message, severity, category = 'headers') => {
    score += weight;
    findings.push({ id, message, severity, category, weight });
  };

  if (!raw || !raw.trim()) return { score: 0, findings: [] };

  const get = (name) => {
    const re = new RegExp('^' + name + ':\\s*(.+)$', 'im');
    const m = raw.match(re);
    return m ? m[1].trim() : null;
  };

  const auth = get('Authentication-Results') || get('ARC-Authentication-Results') || '';
  if (/spf\s*=\s*fail/i.test(auth)) add(30, 'spf', 'SPF fallito', 'high');
  if (/dkim\s*=\s*fail/i.test(auth)) add(25, 'dkim', 'DKIM fallito', 'high');
  if (/dmarc\s*=\s*fail/i.test(auth)) add(35, 'dmarc', 'DMARC fallito', 'critical');
  if (/spf\s*=\s*softfail/i.test(auth)) add(15, 'spf-soft', 'SPF softfail', 'medium');

  const from = get('From');
  const replyTo = get('Reply-To');
  const returnPath = get('Return-Path');
  const subject = get('Subject') || '';
  const received = get('Received') || '';

  const extractDomain = (v) => { const m = v && v.match(/@([\w.-]+)/); return m ? m[1].toLowerCase() : null; };
  const fromDom = extractDomain(from);
  const replyDom = extractDomain(replyTo);
  const returnDom = extractDomain(returnPath);

  if (fromDom && replyDom && fromDom !== replyDom) add(30, 'reply-mismatch', 'Reply-To (' + replyDom + ') diverso da From (' + fromDom + ')', 'high');
  if (fromDom && returnDom && fromDom !== returnDom) add(20, 'return-mismatch', 'Return-Path (' + returnDom + ') diverso da From (' + fromDom + ')', 'medium');

  const dnMatch = from && from.match(/^"?([^"<]+)"?\s*</);
  const dn = dnMatch ? dnMatch[1].toLowerCase().trim() : null;
  if (dn && fromDom) {
    for (const brand of BRANDS) {
      const b = brand.toLowerCase();
      if (dn.includes(b) && !fromDom.includes(b)) { add(30, 'display-spoof', 'Display name imita "' + brand + '" ma dominio è ' + fromDom, 'critical'); break; }
    }
  }

  if (!received) add(15, 'no-received', 'Nessun header Received (possibile invio diretto)', 'medium');

  if (/(urgent|winner|prize|verify|suspend|account|password|bank|invoice|refund)/i.test(subject))
    add(10, 'subject-suspicious', 'Oggetto sospetto: "' + subject.slice(0, 80) + '"', 'medium');
  if (/[!?]{2,}/.test(subject)) add(5, 'subject-punct', 'Punteggiatura eccessiva nell oggetto', 'low');

  return { score: Math.min(100, score), findings };
}
