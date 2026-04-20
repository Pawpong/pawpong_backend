#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

cd "$REPO_ROOT"

DOMAINS=($(normalize_domains "$@"))

echo "[arch] typecheck"
yarn typecheck

for domain in "${DOMAINS[@]}"; do
  path="$(domain_source_path "$domain")"
  echo "[arch] scanning $domain ($path)"

  if rg -n "@InjectModel" "$path" --glob '!**/repository/**'; then
    echo "[arch] failed: @InjectModel found outside repository in $domain" >&2
    exit 1
  fi

  if rg -n "ApiResponseDto\\.success\\([^\\n]*'" "$path"; then
    echo "[arch] failed: inline success message found in $domain" >&2
    exit 1
  fi

  app_domain_paths=()
  [ -d "$path/application" ] && app_domain_paths+=("$path/application")
  [ -d "$path/domain" ] && app_domain_paths+=("$path/domain")
  if [ "${#app_domain_paths[@]}" -gt 0 ] && rg -n "StorageService|MailService|MailTemplateService|DiscordWebhookService|JwtService" "${app_domain_paths[@]}"; then
    echo "[arch] failed: concrete infra dependency found in application/domain for $domain" >&2
    exit 1
  fi
done

echo "[arch] ok"
