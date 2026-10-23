import { KEYWORDS } from '../../data/keywords.js';
import { analyzeUrl } from './url.js';

export function analyzeText(text) {
  const findings = [];
  let score = 0;
  const add = (weight, id, message, severity, category = 'text') => {
    score += weight;
    findings.push({ id, message, severity, category, weight });
  };

  if (!text || !text.trim() || text.length < 5) return { score: 0, findings: [], urlCount: 0 };

  const lower = text.toLowerCase();
  let hits = 0;
  const seen = new Set();
  for (const k of KEYWORDS) {
    if (seen.has(k.term)) continue;
    if (lower.includes(k.term)) {
      seen.add(k.term);
      add(k.weight, 'kw-' + k.term.replace(/\s+/g, '-'), 'Parola chiave sospetta: "' + k.term + '"', k.severity);
      hits++;
      if (hits >= 10) break;
    }
  }

  if (/\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/.test(text)) add(25, 'iban', 'Possibile IBAN nel testo', 'high');
  if (/\b(?:\d[ -]*?){13,16}\b/.test(text)) add(20, 'card', 'Possibile numero carta', 'high');
  if (/\b(bc1[a-z0-9]{25,62}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/.test(text)) add(20, 'crypto', 'Possibile wallet crypto', 'medium');
  if (/(password|credenziali|pin|otp|codice di verifica|verification code|one-time)/i.test(text)) add(20, 'creds', 'Richiesta credenziali/OTP', 'high');
  if (/(bonifico|pagamento|acconto|fattura|rimborso|refund|invoice|wire transfer|payment)/i.test(text)) add(10, 'money', 'Richiesta economica', 'medium');
  if (/(urgente|immediat|entro 24|scade|sospeso|bloccato|urgent|expire|suspend|block|immediately)/i.test(text)) add(12, 'urgency', 'Linguaggio di urgenza', 'medium');
  if (/(hai vinto|sei stato selezionato|premio|vincitore|you have won|prize|claim your|lottery)/i.test(text)) add(25, 'prize', 'Promessa di premio/vincita', 'high');
  if (/(account.*sospeso|account.*bloccato|account.*suspend|verify your account|confirm your identity)/i.test(text)) add(20, 'account', 'Minaccia di sospensione account', 'high');

  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length > 40) {
    const upperRatio = (letters.match(/[A-Z]/g) || []).length / letters.length;
    if (upperRatio > 0.5) add(10, 'caps', 'Testo prevalentemente in MAIUSCOLO', 'low');
  }
  if ((text.match(/[!?]{3,}/g) || []).length > 0) add(8, 'punct', 'Punteggiatura eccessiva', 'low');
  if (/^(caro cliente|gentile cliente|dear customer|dear user|dear client)/i.test(text.trim())) add(10, 'generic', 'Saluto generico (non personalizzato)', 'low');

  const urls = text.match(/https?:\/\/[^\s<>"')\]]+/gi) || [];
  for (const u of urls.slice(0, 5)) {
    const r = analyzeUrl(u);
    if (r.score >= 50) { add(20, 'embedded-url', 'Link sospetto nel testo: ' + u.slice(0, 60), 'high'); break; }
  }

  return { score: Math.min(100, score), findings, urlCount: urls.length };
}
