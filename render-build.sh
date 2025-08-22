#!/usr/bin/env bash
set -Eeuo pipefail
set -x  # echo commands

# 1) Python deps
python -V
pip install --upgrade pip
pip install -r requirements.txt

# 2) Frontend build
pushd react-vite
npm ci
npm run build
popd

# 3) DB migrations (needs DATABASE_URL set in Render)
export FLASK_APP=app
flask db upgrade
