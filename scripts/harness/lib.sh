#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

default_domains() {
  echo "adopter user-admin breeder-management breeder"
}

normalize_domains() {
  if [ "$#" -eq 0 ]; then
    default_domains
  else
    printf '%s\n' "$@"
  fi
}

domain_source_path() {
  case "$1" in
    adopter) echo "src/api/adopter" ;;
    user-admin) echo "src/api/user/admin" ;;
    breeder-management) echo "src/api/breeder-management" ;;
    breeder) echo "src/api/breeder" ;;
    *)
      echo "Unknown domain: $1" >&2
      return 1
      ;;
  esac
}

domain_contract_paths() {
  case "$1" in
    adopter) echo "src/api/adopter/test/contract/adopter.contract.e2e-spec.ts" ;;
    user-admin) echo "src/api/user/admin/test/contract/user-admin.contract.e2e-spec.ts" ;;
    breeder-management) echo "src/api/breeder-management/test/contract/breeder-management.contract.e2e-spec.ts" ;;
    breeder) echo "src/api/breeder/test/contract/breeder.contract.e2e-spec.ts" ;;
    *)
      echo "Unknown domain: $1" >&2
      return 1
      ;;
  esac
}

domain_e2e_paths() {
  case "$1" in
    adopter)
      echo "src/api/adopter/test/e2e/adopter.e2e-spec.ts src/api/adopter/admin/test/e2e/adopter-admin.e2e-spec.ts"
      ;;
    user-admin)
      echo "src/api/user/admin/test/e2e/user-admin.e2e-spec.ts"
      ;;
    breeder-management)
      echo "src/api/breeder-management/test/e2e/breeder-management-applications.e2e-spec.ts src/api/breeder-management/test/e2e/breeder-management-overview.e2e-spec.ts src/api/breeder-management/test/e2e/breeder-management-pets.e2e-spec.ts src/api/breeder-management/test/e2e/breeder-management-review-account.e2e-spec.ts src/api/breeder-management/test/e2e/breeder-management-verification.e2e-spec.ts src/api/breeder-management/admin/test/e2e/breeder-management-admin.e2e-spec.ts"
      ;;
    breeder)
      echo "src/api/breeder/test/e2e/breeder.e2e-spec.ts src/api/breeder/admin/test/e2e/breeder-admin.e2e-spec.ts src/api/breeder/admin/verification/test/e2e/breeder-verification-admin.e2e-spec.ts src/api/breeder/admin/report/test/e2e/breeder-report-admin.e2e-spec.ts"
      ;;
    *)
      echo "Unknown domain: $1" >&2
      return 1
      ;;
  esac
}
