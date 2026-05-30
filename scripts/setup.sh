#!/bin/bash
set -e

echo "🚀 Make My Day — setup"

cd "$(dirname "$0")/../web"

echo "📦 Installing web dependencies…"
npm install

echo "✅ Done! Start the app with:"
echo "   cd web && npm run dev   →  http://localhost:3001"
