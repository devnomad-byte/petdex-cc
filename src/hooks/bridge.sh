#!/bin/bash
PORT_FILE="$HOME/.petdex-cc/data/port.lock"
PORT=17321
if [ -f "$PORT_FILE" ]; then
  PORT=$(cat "$PORT_FILE" 2>/dev/null || echo "17321")
fi
cat | curl -s -X POST "http://localhost:$PORT/event" \
  -H "Content-Type: application/json" \
  -d @- > /dev/null 2>&1 &
