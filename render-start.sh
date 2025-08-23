#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

VENV="/opt/render/project/src/.venv"
if [ -d "$VENV" ]; then
  source "$VENV/bin/activate"
fi

export FLASK_APP=app

flask db upgrade || echo "⚠️ migrations failed (continuing to boot)"

exec gunicorn --workers 2 --bind 0.0.0.0:${PORT:-10000} app:app
