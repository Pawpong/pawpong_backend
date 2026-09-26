#!/usr/bin/env python3
"""Prune old production app images without deleting local rollback versions.

Dry-run by default. The main-only scheduled workflow passes --execute.
"""

import argparse
import json
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path


APP_IMAGE_NAMES = {"pawpong-backend", "pawpong-ai-agent", "pawpong-backup"}
REGISTRY_PREFIX = "asia-northeast3-docker.pkg.dev/pawpong/pawpong-docker"
APP_REPOSITORIES = APP_IMAGE_NAMES | {
    f"{REGISTRY_PREFIX}/{name}" for name in APP_IMAGE_NAMES
}
MIN_IMAGE_AGE_DAYS = 14
MIN_CACHE_AGE_HOURS = 24 * 30


def docker(*args: str) -> str:
    result = subprocess.run(["docker", *args], text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(f"docker {' '.join(args)} failed: {result.stderr.strip()}")
    return result.stdout.strip()


def image_id(value: str) -> str:
    return value.removeprefix("sha256:")


def app_reference(ref: str) -> bool:
    if ":" not in ref or ref == "<none>:<none>":
        return False
    repository = ref.rsplit(":", 1)[0]
    return repository in APP_REPOSITORIES


def protected_tags(history_file: Path, last_deploy_file: Path) -> set[str]:
    if not history_file.is_file():
        raise RuntimeError(f"Deployment history is missing: {history_file}")
    tags = {line.strip() for line in history_file.read_text().splitlines() if line.strip()}
    if not tags:
        raise RuntimeError("Deployment history is empty; refusing to prune images")
    if last_deploy_file.is_file():
        tags.update(line.strip() for line in last_deploy_file.read_text().splitlines() if line.strip())
    return tags


def candidate_references(
    images: list[dict],
    in_use_ids: set[str],
    rollback_tags: set[str],
    now: datetime,
) -> list[tuple[str, list[str]]]:
    cutoff = now - timedelta(days=MIN_IMAGE_AGE_DAYS)
    candidates = []
    for image in images:
        refs = image.get("RepoTags") or []
        if not refs or not all(app_reference(ref) for ref in refs):
            continue
        if image_id(image["Id"]) in in_use_ids:
            continue
        if any(
            ref.rsplit(":", 1)[-1] in rollback_tags | {"latest"}
            for ref in refs
        ):
            continue
        created = datetime.fromisoformat(image["Created"].replace("Z", "+00:00"))
        if created > cutoff:
            continue
        candidates.append((image["Id"], refs))
    return candidates


def inspect_images() -> list[dict]:
    ids = sorted(set(docker("image", "ls", "-aq", "--no-trunc").splitlines()))
    return json.loads(docker("image", "inspect", *ids)) if ids else []


def container_image_ids() -> set[str]:
    ids = docker("ps", "-aq", "--no-trunc").splitlines()
    if not ids:
        return set()
    return {
        image_id(value)
        for value in docker("inspect", "--format", "{{.Image}}", *ids).splitlines()
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--execute", action="store_true", help="Remove selected images and old build cache")
    parser.add_argument("--history-file", type=Path, default=Path(".deploy_history"))
    parser.add_argument("--last-deploy-file", type=Path, default=Path(".last_deploy"))
    args = parser.parse_args()

    history_tags = protected_tags(args.history_file, args.last_deploy_file)
    images = inspect_images()
    if not any("pawpong-backend:latest" in (image.get("RepoTags") or []) for image in images):
        raise RuntimeError("Current backend image is missing; refusing to prune images")
    in_use_ids = container_image_ids()
    candidates = candidate_references(images, in_use_ids, history_tags, datetime.now(timezone.utc))

    print(
        f"Mode: {'execute' if args.execute else 'dry-run'}; "
        f"rollback tags: {len(history_tags)}; old unused image IDs: {len(candidates)}"
    )
    for expected_id, refs in candidates:
        print(f"Candidate: {', '.join(refs)}")
        if args.execute:
            # Control/manual deploys do not share the Actions concurrency group.
            # Recheck the ID, tags and container references immediately before removal.
            current = json.loads(docker("image", "inspect", refs[0]))[0]
            if (
                current["Id"] != expected_id
                or set(current.get("RepoTags") or []) != set(refs)
                or image_id(expected_id) in container_image_ids()
            ):
                raise RuntimeError(f"Image changed during cleanup: {refs[0]}")
            for ref in refs:
                docker("image", "rm", ref)

    if args.execute:
        # The default image prune only removes dangling images; tagged rollback versions stay intact.
        print(docker("image", "prune", "--filter", f"until={MIN_IMAGE_AGE_DAYS * 24}h", "--force"))
        print(docker("builder", "prune", "--filter", f"until={MIN_CACHE_AGE_HOURS}h", "--force"))
    print(docker("system", "df"))
    print(docker("ps", "--format", "table {{.Names}}\\t{{.Status}}"))


if __name__ == "__main__":
    main()
