#!/data/data/com.termux/files/usr/bin/bash
# GHOST v7.2 — Termux Install Script
set -e
echo "GHOST v7.2 — Termux Bootstrap"
echo "Oracle: Kyle S. Whitlock | Harmony Labs"
pkg update && pkg upgrade -y
pkg install nodejs git -y
cd ~/ghost-kernel
npm install
mkdir -p data
if [ ! -f data/state.json ]; then
  echo '{"merkle_root":"0000000000000000","mu":0.5,"ingestions":0,"whitlock":0,"nodes":[]}' > data/state.json
  echo "state.json initialized"
fi
echo "GHOST v7.2 installed. Run: bash scripts/start.sh"
echo "  Tab 1: http://localhost:7766"
echo "  Tab 2: http://localhost:7767"
