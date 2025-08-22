#!/usr/bin/env bash
set -e
pushd react-vite
npm ci
npm run build
popd
# DO NOT run flask db upgrade here
