#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PORT="${1:-8080}"
echo "🛡️  PhishLens — http://localhost:$PORT"
if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server "$PORT"
elif command -v python >/dev/null 2>&1; then
  python -m SimpleHTTPServer "$PORT"
elif command -v npx >/dev/null 2>&1; then
  npx --yes serve -l "$PORT"
else
  echo "❌  Installa Python 3 o Node.js." >&2; exit 1
fi
