#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

cd "$REPO_ROOT"

DOMAINS=($(normalize_domains "$@"))

CONTRACT_PATHS=()
for domain in "${DOMAINS[@]}"; do
  CONTRACT_PATHS+=($(domain_contract_paths "$domain"))
done

echo "[contract] ${DOMAINS[*]}"
yarn test:e2e "${CONTRACT_PATHS[@]}" --runInBand --forceExit
