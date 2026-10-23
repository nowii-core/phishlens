export function classify(score) {
  if (score >= 80) return { level: 'CRITICO', color: '#e74c3c', advice: 'Non interagire. Segnala e cancella.' };
  if (score >= 60) return { level: 'ALTO', color: '#e67e22', advice: 'Molto probabilmente una truffa. Non cliccare nulla.' };
  if (score >= 40) return { level: 'MEDIO', color: '#f1c40f', advice: 'Sospetto. Verifica il mittente con altri canali.' };
  if (score >= 20) return { level: 'BASSO', color: '#3498db', advice: 'Alcuni segnali deboli. Attenzione.' };
  return { level: 'OK', color: '#2ecc71', advice: 'Nessun indicatore forte rilevato.' };
}

export function severityRank(s) {
  return ({ critical: 4, high: 3, medium: 2, low: 1 })[s] || 0;
}

export function sortFindings(findings) {
  return [...findings].sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}
