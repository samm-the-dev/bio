#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

# Initialize toolbox submodule so AI context and skills are available
git submodule update --init --recursive

# Install dependencies
npm install
