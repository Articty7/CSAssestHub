#!/usr/bin/env bash
set -e

# Install Python deps
python -m pip install --upgrade pip
pip install -r requirements.txt

# Build the frontend
pushd react-vite
npm ci
npm run build
popd
