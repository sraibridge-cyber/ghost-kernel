#!/data/data/com.termux/files/usr/bin/bash
# GHOST v7.2 — Launch Both Handlers
cd ~/ghost-kernel
echo "Starting ghost_face.js on :7766..."
node src/ghost_face.js &
FACE_PID=$!
echo "Starting ghost_kernel.js on :7767..."
node src/ghost_kernel.js &
KERNEL_PID=$!
echo "GHOST v7.2 running | face=$FACE_PID kernel=$KERNEL_PID"
echo "Tab 1: http://localhost:7766 | Tab 2: http://localhost:7767"
trap "kill $FACE_PID $KERNEL_PID 2>/dev/null; echo GHOST stopped." INT TERM
wait
