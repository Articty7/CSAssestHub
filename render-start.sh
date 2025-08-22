#!/usr/bin/env bash
set -Eeuo pipefail
# Gunicorn must bind to $PORT on Render
exec gunicorn -w 2 -b 0.0.0.0:$PORT app:app
