#!/usr/bin/env bash
set -euo pipefail

# Ensure we're in the app root
cd "$(dirname "$0")"

# Activate Render's virtualenv
VENV="/opt/render/project/src/.venv"
if [ -d "$VENV" ]; then
  # shellcheck disable=SC1090
  source "$VENV/bin/activate"
fi

export FLASK_APP=app

# Run migrations (don’t block boot if they fail)
flask db upgrade || echo "⚠️ migrations failed (continuing to boot)"

# Start the app
exec gunicorn --workers 2 --bind 0.0.0.0:${PORT:-10000} app:app
