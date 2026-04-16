#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

cd "$REPO_ROOT"

DOMAINS=($(normalize_domains "$@"))

echo "[regression] arch"
"$REPO_ROOT/scripts/harness/arch.sh" "${DOMAINS[@]}"

echo "[regression] unit"
yarn test --runInBand

E2E_PATHS=()
for domain in "${DOMAINS[@]}"; do
  E2E_PATHS+=($(domain_e2e_paths "$domain"))
done

echo "[regression] e2e ${DOMAINS[*]}"
yarn test:e2e "${E2E_PATHS[@]}" --runInBand --forceExit

echo "[regression] contract ${DOMAINS[*]}"
"$REPO_ROOT/scripts/harness/contract.sh" "${DOMAINS[@]}"

echo "[regression] ok"
