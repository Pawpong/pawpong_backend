import importlib.util
import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch


SCRIPT = Path(__file__).resolve().parents[1] / "cleanup-prod-docker.py"
SPEC = importlib.util.spec_from_file_location("cleanup_prod_docker", SCRIPT)
cleanup = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(cleanup)


class CandidateSelectionTest(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 9, 26, tzinfo=timezone.utc)
        self.old = (self.now - timedelta(days=20)).isoformat()
        self.new = (self.now - timedelta(days=2)).isoformat()

    def image(self, identifier, refs, created=None):
        return {"Id": f"sha256:{identifier}", "RepoTags": refs, "Created": created or self.old}

    def test_only_old_unused_unprotected_app_images_are_selected(self):
        registry = cleanup.REGISTRY_PREFIX
        images = [
            self.image("old", ["pawpong-backend:old", f"{registry}/pawpong-backend:old"]),
            self.image("rollback", ["pawpong-backend:rollback"]),
            self.image("shared", ["pawpong-backend:old", f"{registry}/pawpong-backend:rollback"]),
            self.image("latest", ["pawpong-backend:latest", f"{registry}/pawpong-backend:old"]),
            self.image("running", ["pawpong-ai-agent:old"]),
            self.image("stopped", [f"{registry}/pawpong-backup:old"]),
            self.image("recent", ["pawpong-ai-agent:new"], self.new),
            self.image("unrelated", ["grafana/grafana:old"]),
            self.image("other-registry", ["third-party/pawpong-backend:old"]),
        ]

        self.assertEqual(
            cleanup.candidate_references(images, {"running", "stopped"}, {"rollback"}, self.now),
            [("sha256:old", ["pawpong-backend:old", f"{registry}/pawpong-backend:old"])],
        )

    def test_history_must_exist_and_last_deployment_is_protected(self):
        with tempfile.TemporaryDirectory() as directory:
            history = Path(directory) / ".deploy_history"
            last = Path(directory) / ".last_deploy"
            with self.assertRaisesRegex(RuntimeError, "missing"):
                cleanup.protected_tags(history, last)
            history.write_text("older\ncurrent\n")
            last.write_text("previous\n")
            self.assertEqual(cleanup.protected_tags(history, last), {"older", "current", "previous"})

    def test_execution_removes_only_selected_tagged_image(self):
        old = (datetime.now(timezone.utc) - timedelta(days=20)).isoformat()
        images = [
            self.image("current", ["pawpong-backend:latest"], old),
            self.image("rollback", ["pawpong-backend:rollback"], old),
            self.image("unused", ["pawpong-backend:unused"], old),
        ]
        commands = []

        def fake_docker(*args):
            commands.append(args)
            if args == ("image", "inspect", "pawpong-backend:unused"):
                return json.dumps([images[2]])
            return ""

        with tempfile.TemporaryDirectory() as directory:
            history = Path(directory) / ".deploy_history"
            history.write_text("rollback\n")
            argv = ["cleanup-prod-docker.py", "--execute", "--history-file", str(history)]
            with (
                patch.object(cleanup, "inspect_images", return_value=images),
                patch.object(cleanup, "container_image_ids", return_value=set()),
                patch.object(cleanup, "docker", side_effect=fake_docker),
                patch("sys.argv", argv),
                redirect_stdout(io.StringIO()),
            ):
                cleanup.main()

        self.assertIn(("image", "rm", "pawpong-backend:unused"), commands)
        self.assertFalse(any(cmd[:2] == ("image", "rm") and cmd[-1] != "pawpong-backend:unused" for cmd in commands))
        self.assertIn(("image", "prune", "--filter", "until=336h", "--force"), commands)
        self.assertFalse(any("--all" in cmd or "-a" in cmd for cmd in commands))


if __name__ == "__main__":
    unittest.main()
