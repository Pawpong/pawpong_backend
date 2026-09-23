#!/usr/bin/env bash

# 이미지 다운로드가 운영 파일시스템을 고갈시키기 전에 멈춘다. 이 검사는 아무것도 삭제하지 않는다.
set -euo pipefail
export LC_ALL=C

fail() {
    printf '[deploy-disk] ERROR: %s\n' "$*" >&2
    printf '[deploy-disk] See .kiro/specs/deploy-disk-preflight/runbook.md; no automatic cleanup was performed.\n' >&2
    exit 1
}

validate_threshold() {
    local name="$1" maximum="$2" value="${!1}"
    [[ "$value" =~ ^[1-9][0-9]{0,6}$ ]] || fail "$name must be a positive integer."
    (( value <= maximum )) || fail "$name must not exceed $maximum."
}

DEPLOY_MIN_FREE_GIB="${DEPLOY_MIN_FREE_GIB:-8}"
DEPLOY_MIN_FREE_PERCENT="${DEPLOY_MIN_FREE_PERCENT:-10}"
DEPLOY_MIN_FREE_INODE_PERCENT="${DEPLOY_MIN_FREE_INODE_PERCENT:-10}"
validate_threshold DEPLOY_MIN_FREE_GIB 1048576
validate_threshold DEPLOY_MIN_FREE_PERCENT 100
validate_threshold DEPLOY_MIN_FREE_INODE_PERCENT 100
minimum_kib=$((DEPLOY_MIN_FREE_GIB * 1024 * 1024))

# 운영 Linux의 GNU df를 사용한다. 열을 명시하여 긴 장치명/공백이 있는 경로에도 안전하게 읽는다.
read_capacity() {
    local kind="$1" path="$2" output
    if [[ "$kind" == blocks ]]; then
        output=$(df -k --output=size,avail -- "$path") || fail "Cannot read free blocks: $path"
    else
        output=$(df --output=itotal,iavail -- "$path") || fail "Cannot read free inodes: $path"
    fi
    # 알 수 없는 용량(예: inode '-' 또는 0)을 성공으로 취급하지 않는다.
    printf '%s\n' "$output" | awk '
        NR == 2 && NF == 2 && $1 ~ /^[0-9]+$/ && $2 ~ /^[0-9]+$/ && length($1) <= 15 && length($2) <= 15 {
            if ($1 > 0 && $2 <= $1) { total = $1; free = $2; valid = 1 }
        }
        END { if (NR != 2 || !valid) exit 1; print total, free }
    ' || fail "Invalid $kind capacity returned by df: $path"
}

docker_root=$(docker info --format '{{.DockerRootDir}}') || fail 'Cannot inspect the local Docker storage directory.'
[[ "$docker_root" == /* && -d "$docker_root" ]] || fail 'DockerRootDir must be an existing local absolute directory.'

printf '[deploy-disk] Required: >= %s GiB, >= %s%% free blocks, >= %s%% free inodes.\n' \
    "$DEPLOY_MIN_FREE_GIB" "$DEPLOY_MIN_FREE_PERCENT" "$DEPLOY_MIN_FREE_INODE_PERCENT"

# Docker가 별도 볼륨이어도 root와 checkout의 고갈을 놓치지 않는다. 같은 볼륨의 중복 검사는 무해하다.
for path in / "$PWD" "$docker_root"; do
    capacity=$(read_capacity blocks "$path") || exit 1
    read -r total_kib free_kib <<< "$capacity"
    capacity=$(read_capacity inodes "$path") || exit 1
    read -r total_inodes free_inodes <<< "$capacity"
    printf '[deploy-disk] %s: available=%s KiB, free blocks=%s%%, free inodes=%s%%\n' \
        "$path" "$free_kib" "$((free_kib * 100 / total_kib))" "$((free_inodes * 100 / total_inodes))"
    (( free_kib >= minimum_kib )) || fail "$path has less than $DEPLOY_MIN_FREE_GIB GiB available."
    (( free_kib * 100 >= total_kib * DEPLOY_MIN_FREE_PERCENT )) || fail "$path has less than $DEPLOY_MIN_FREE_PERCENT% free blocks."
    (( free_inodes * 100 >= total_inodes * DEPLOY_MIN_FREE_INODE_PERCENT )) || fail "$path has less than $DEPLOY_MIN_FREE_INODE_PERCENT% free inodes."
done

printf '[deploy-disk] PASS: capacity checks passed; no images, containers or volumes were changed.\n'
