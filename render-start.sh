#!/usr/bin/env bash
set -e
export FLASK_APP=app

# Option A: fail fast if migrations can’t run (strict)
# flask db upgrade

# Option B: don’t block boot on a transient DB issue (lenient)
flask db upgrade || echo "⚠️ migrations failed (continuing to boot)"

exec gunicorn --workers 2 --bind 0.0.0.0:$PORT app:app
