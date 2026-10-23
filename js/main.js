import { analyzeUrl } from './analyzers/url.js';
import { analyzeText } from './analyzers/text.js';
import { analyzeHeaders } from './analyzers/headers.js';
import { classify, sortFindings } from './scoring.js';
import { registerSW } from './pwa.js'; // Importiamo il PWA

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Limite di sicurezza per non far crashare il browser
const MAX_PAYLOAD_SIZE = 50000; // 50k caratteri

// --- ROUTING ---
function navigateTo(viewName) {
  $$('.nav-item').forEach(x => x.classList.remove('active'));
  $(`.nav-item[data-view="${viewName}"]`).classList.add('active');
  $$('.view').forEach(x => x.classList.remove('active'));
  $(`#view-${viewName}`).classList.add('active');
  if (viewName === 'history') HistoryLog.render();
}
$$('.nav-item').forEach(item => item.addEventListener('click', (e) => { e.preventDefault(); navigateTo(item.dataset.view); }));

// --- HISTORY LOG ---
const HistoryLog = {
  get() { return JSON.parse(localStorage.getItem('phishlens_history') || '[]'); },
  add(type, target, score, result) {
    const h = HistoryLog.get();
    h.unshift({ id: Date.now(), date: new Date().toISOString(), type, target, score, result });
    localStorage.setItem('phishlens_history', JSON.stringify(h.slice(0, 50)));
    HistoryLog.render();
  },
  clear() { localStorage.removeItem('phishlens_history'); HistoryLog.render(); },
  render() {
    const tbody = $('#history-tbody');
    const h = HistoryLog.get();
    if (h.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding: 2rem;">No scans recorded.</td></tr>';
      return;
    }
    tbody.innerHTML = h.map(item => {
      let sc = 'safe';
      if (item.score >= 80) sc = 'crit'; else if (item.score >= 60) sc = 'high'; else if (item.score >= 40) sc = 'med';
      const dateStr = new Date(item.date).toLocaleString('it-IT');
      const shortTarget = item.target.length > 50 ? item.target.substring(0, 50) + '...' : item.target;
      return `<tr>
        <td style="color:var(--text-muted);">${dateStr}</td>
        <td><span class="ticker-tag" style="background:rgba(128,128,128,0.1); color:var(--text);">${item.type}</span></td>
        <td style="word-break: break-all;">${escapeHtml(shortTarget)}</td>
        <td class="history-score ${sc}">${item.score}</td>
        <td><button class="history-btn" onclick="window.loadHistoryItem(${item.id})">View</button></td>
      </tr>`;
    }).join('');
  }
};

window.loadHistoryItem = (id) => {
  const item = HistoryLog.get().find(x => x.id === id);
  if (!item) return;
  navigateTo('scanner');
  $('#results-state').classList.remove('hidden');
  $('#empty-state').classList.add('hidden');
  $('#loading-state').classList.add('hidden');
  renderResults(item.result, item.target, item.type, false);
};
$('#clear-history-btn').addEventListener('click', HistoryLog.clear);

// --- TEMA ---
$('#theme-toggle').addEventListener('click', () => {
  const html = document.documentElement;
  const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  $('#icon-moon').classList.toggle('hidden', newTheme === 'light');
  $('#icon-sun').classList.toggle('hidden', newTheme === 'dark');
});

// --- RENDER ---
function renderResults(result, label, type, saveToHistory = true) {
  const c = classify(result.score);
  const findings = sortFindings(result.findings || []);
  
  const findingsHtml = findings.length
    ? findings.map(f => `
        <li class="finding-row sev-${f.severity}">
          <span class="finding-id">${f.id.substring(0, 6).toUpperCase()}</span>
          <span class="finding-sev">${f.severity.toUpperCase()}</span>
          <span class="finding-desc">${escapeHtml(f.message)}</span>
        </li>`).join('')
    : `<li class="finding-row sev-safe">
        <span class="finding-id">PASS</span><span class="finding-sev">OK</span>
        <span class="finding-desc">No threats detected.</span>
       </li>`;

  let colorClass = 'sev-safe';
  if (result.score >= 80) colorClass = 'sev-critical';
  else if (result.score >= 60) colorClass = 'sev-high';
  else if (result.score >= 40) colorClass = 'sev-medium';
  else if (result.score >= 20) colorClass = 'sev-low';

  $('#score-value').textContent = result.score;
  $('#score-badge').textContent = c.level;
  $('#score-advice').textContent = c.advice;
  $('#findings-list').innerHTML = findingsHtml;
  $('#score-hero').className = `score-hero ${colorClass}`;

  const rawData = {
    timestamp: new Date().toISOString(),
    target: label,
    type: type,
    score: result.score,
    classification: c.level,
    advice: c.advice,
    findings: result.findings || []
  };
  $('#json-output').textContent = JSON.stringify(rawData, null, 2);

  $('#empty-state').classList.add('hidden');
  $('#loading-state').classList.add('hidden');
  $('#results-state').classList.remove('hidden');

  // Salva l'URL per condivisione
  window.currentScanUrl = label;

  if (saveToHistory) HistoryLog.add(type, label, result.score, result);
}

// --- SCANSIONE CON LIMITE ---
async function executeScan(btnId, textId, type, analyzerFunc, inputVal) {
  if (inputVal.length > MAX_PAYLOAD_SIZE) {
    alert(`Error: Payload exceeds maximum size of ${MAX_PAYLOAD_SIZE} characters. Truncating for analysis.`);
    inputVal = inputVal.substring(0, MAX_PAYLOAD_SIZE);
  }

  const btn = $(`#${btnId}`);
  const text = $(`#${textId}`);
  
  btn.disabled = true;
  text.textContent = "Processing...";
  $('#results-state').classList.add('hidden');
  $('#empty-state').classList.add('hidden');
  $('#loading-state').classList.remove('hidden');

  await new Promise(r => setTimeout(r, 800)); 
  const result = analyzerFunc(inputVal);
  renderResults(result, inputVal, type);
  
  btn.disabled = false;
  text.textContent = "Run Diagnostic";
}

// --- INIZIALIZZAZIONE ---
document.addEventListener('DOMContentLoaded', () => {
  
  // Registra Service Worker (PWA)
  registerSW();

  // Check URL Param per condivisione (?u=...)
  const urlParams = new URLSearchParams(window.location.search);
  const sharedUrl = urlParams.get('u');
  if (sharedUrl) {
    $('#url-input').value = sharedUrl;
    executeScan('url-btn', 'url-btn-text', 'URL', analyzeUrl, sharedUrl);
  }

  // Tabs Input
  $$('.tab').forEach(t => t.addEventListener('click', () => {
    $$('.tab').forEach(x => x.classList.remove('active'));
    $$('.form-group').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    $(`.form-group[data-panel="${t.dataset.tab}"]`).classList.add('active');
  }));

  // Tabs Output
  $$('.out-tab').forEach(t => t.addEventListener('click', () => {
    $$('.out-tab').forEach(x => x.classList.remove('active'));
    $$('.out-content').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    $(`.out-content[data-out-content="${t.dataset.out}"]`).classList.add('active');
  }));

  // Bottoni Scanner
  $('#url-btn').addEventListener('click', () => {
    const v = $('#url-input').value.trim();
    if (v) executeScan('url-btn', 'url-btn-text', 'URL', analyzeUrl, v);
  });
  $('#text-btn').addEventListener('click', () => {
    const v = $('#text-input').value;
    if (v.trim()) executeScan('text-btn', 'text-btn-text', 'TEXT', analyzeText, v);
  });
  $('#headers-btn').addEventListener('click', () => {
    const v = $('#headers-input').value;
    if (v.trim()) executeScan('headers-btn', 'headers-btn-text', 'HEADERS', analyzeHeaders, v);
  });

  // PASTE BUTTONS (Appunti)
  $('#paste-url-btn').addEventListener('click', async () => {
    try { $('#url-input').value = await navigator.clipboard.readText(); } catch(e) { alert('Permesso clipboard negato.'); }
  });
  $('#paste-text-btn').addEventListener('click', async () => {
    try { $('#text-input').value = await navigator.clipboard.readText(); } catch(e) { alert('Permesso clipboard negato.'); }
  });
  $('#paste-headers-btn').addEventListener('click', async () => {
    try { $('#headers-input').value = await navigator.clipboard.readText(); } catch(e) { alert('Permesso clipboard negato.'); }
  });

  // DRAG & DROP per file
  ['#text-input', '#headers-input'].forEach(sel => {
    const el = $(sel);
    el.addEventListener('dragover', (e) => { e.preventDefault(); el.style.borderColor = 'var(--primary)'; });
    el.addEventListener('dragleave', (e) => { e.preventDefault(); el.style.borderColor = 'var(--panel-border)'; });
    el.addEventListener('drop', async (e) => {
      e.preventDefault();
      el.style.borderColor = 'var(--panel-border)';
      const file = e.dataTransfer.files[0];
      if (file) el.value = await file.text();
    });
  });

  // Clear
  $('#clear-btn').addEventListener('click', () => {
    $('#results-state').classList.add('hidden');
    $('#empty-state').classList.remove('hidden');
    $('#url-input').value = '';
    $('#text-input').value = '';
    $('#headers-input').value = '';
  });

  // Download JSON
  $('#export-btn').addEventListener('click', () => {
    const data = $('#json-output').textContent;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Share Link
  $('#share-btn').addEventListener('click', () => {
    const target = window.currentScanUrl;
    if (!target) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?u=${encodeURIComponent(target)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      const btn = $('#share-btn');
      const orig = btn.textContent;
      btn.textContent = 'Link Copied!';
      setTimeout(() => btn.textContent = orig, 2000);
    });
  });

  // Esempi
  $$('.example-btn').forEach(b => {
    b.addEventListener('click', () => {
      $('#text-input').value = b.dataset.content || '';
      $('#text-btn').click();
    });
  });
  
  // Invio su input
  $('#url-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') $('#url-btn').click();
  });

  HistoryLog.render();
});