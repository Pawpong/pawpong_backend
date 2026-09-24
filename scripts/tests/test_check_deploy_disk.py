"""실제 Docker/파일을 변경하지 않고 운영 용량 검사와 SSH 배포 중단을 검증한다."""

import json
import os
from pathlib import Path
import shlex
import shutil
import subprocess
import tempfile
import textwrap
import unittest


REPO = Path(__file__).resolve().parents[2]
CHECK = REPO / "scripts/check-deploy-disk.sh"
GIB_KIB = 1024 * 1024


class DeployDiskTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="deploy disk test ")
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name).resolve()
        self.bin = self.root / "bin"
        self.bin.mkdir()
        self.docker_root = self.root / "docker storage"
        self.docker_root.mkdir()
        self.checkout = self.root / "checkout"
        (self.checkout / "scripts").mkdir(parents=True)
        shutil.copyfile(CHECK, self.checkout / "scripts/check-deploy-disk.sh")
        (self.checkout / "deploy.sh").write_text("exit 0\n")
        self.log = self.root / "calls.jsonl"
        self.fixture = {
            "blocks": [40 * GIB_KIB, 10 * GIB_KIB],
            "inodes": [1000000, 200000],
        }
        self.env = {
            **os.environ,
            "PATH": f"{self.bin}{os.pathsep}{os.environ['PATH']}",
            "TEST_CALLS": str(self.log),
            "TEST_DOCKER_ROOT": str(self.docker_root),
            "DEPLOY_MIN_FREE_GIB": "8",
            "DEPLOY_MIN_FREE_PERCENT": "10",
            "DEPLOY_MIN_FREE_INODE_PERCENT": "10",
            "COMMIT_SHA": "test-commit",
            "GAR_LOCATION": "test-registry.invalid",
            "GCP_PROJECT_ID": "test-project",
            "SERVICE_NAME": "test-service",
        }
        stub = textwrap.dedent("""\
            #!/usr/bin/env python3
            import json, os, sys
            from pathlib import Path
            command = Path(sys.argv[0]).name
            with open(os.environ['TEST_CALLS'], 'a') as log:
                log.write(json.dumps([command, *sys.argv[1:]]) + '\\n')
            fixture = json.loads(os.environ['TEST_FIXTURE'])
            if command == 'docker':
                if sys.argv[1:] == ['info', '--format', '{{.DockerRootDir}}']:
                    if fixture.get('docker_error'): sys.exit(1)
                    print(fixture.get('docker_root', os.environ['TEST_DOCKER_ROOT']))
                elif sys.argv[1] not in ['pull', 'tag']:
                    sys.exit('Unexpected Docker mutation')
            elif command == 'df':
                if fixture.get('df_error'): sys.exit(1)
                kind = 'inodes' if '--output=itotal,iavail' in sys.argv else 'blocks'
                values = fixture.get('paths', {}).get(sys.argv[-1], {}).get(kind, fixture[kind])
                print('TOTAL AVAILABLE')
                print(' '.join(map(str, values)))
            elif command == 'git' and sys.argv[1:] == ['rev-parse', 'HEAD']:
                print(os.environ['COMMIT_SHA'])
        """)
        for command in ["df", "docker", "git", "gcloud"]:
            executable = self.bin / command
            executable.write_text(stub)
            executable.chmod(0o755)

    def run_check(self, script=None):
        self.env["TEST_FIXTURE"] = json.dumps(self.fixture)
        args = ["bash", str(CHECK)] if script is None else ["bash", "-c", script]
        return subprocess.run(
            args, env=self.env, cwd=self.checkout, capture_output=True, text=True,
            timeout=15,
        )

    def calls(self):
        if not self.log.exists():
            return []
        return [json.loads(line) for line in self.log.read_text().splitlines()]

    def test_pass_checks_root_checkout_and_docker_using_read_only_commands(self):
        result = self.run_check()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("PASS", result.stdout)
        calls = self.calls()
        self.assertEqual(calls[0], ["docker", "info", "--format", "{{.DockerRootDir}}"])
        self.assertTrue(all(call[0] == "df" for call in calls[1:]))
        self.assertEqual(
            [call[-1] for call in calls[1:]],
            ["/", "/", str(self.checkout), str(self.checkout), str(self.docker_root), str(self.docker_root)],
        )

    def test_fails_when_only_docker_volume_is_low(self):
        self.fixture["paths"] = {str(self.docker_root): {"blocks": [40 * GIB_KIB, 7 * GIB_KIB]}}
        result = self.run_check()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn(f"{self.docker_root} has less than 8 GiB", result.stderr)

    def test_fails_when_root_is_low_even_with_separate_healthy_docker_volume(self):
        self.fixture["paths"] = {"/": {"blocks": [40 * GIB_KIB, 7 * GIB_KIB]}}
        self.assertNotEqual(self.run_check().returncode, 0)

    def test_fails_when_only_checkout_volume_is_low(self):
        self.fixture["paths"] = {str(self.checkout): {"blocks": [40 * GIB_KIB, 7 * GIB_KIB]}}
        result = self.run_check()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn(f"{self.checkout} has less than 8 GiB", result.stderr)

    def test_large_disk_requires_free_percentage_as_well_as_gib(self):
        self.fixture["blocks"] = [200 * GIB_KIB, 10 * GIB_KIB]
        result = self.run_check()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("less than 10% free blocks", result.stderr)

    def test_inode_exhaustion_fails_even_when_block_space_is_available(self):
        self.fixture["inodes"] = [1000000, 99999]
        result = self.run_check()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("less than 10% free inodes", result.stderr)

    def test_exact_thresholds_pass_without_percentage_rounding(self):
        self.fixture["blocks"] = [80 * GIB_KIB, 8 * GIB_KIB]
        self.fixture["inodes"] = [1000000, 100000]
        self.assertEqual(self.run_check().returncode, 0)
        self.fixture["blocks"][1] -= 1
        self.assertNotEqual(self.run_check().returncode, 0)

    def test_custom_positive_thresholds_are_applied(self):
        self.env.update(DEPLOY_MIN_FREE_GIB="4", DEPLOY_MIN_FREE_PERCENT="20", DEPLOY_MIN_FREE_INODE_PERCENT="50")
        self.fixture.update(blocks=[20 * GIB_KIB, 4 * GIB_KIB], inodes=[1000, 500])
        self.assertEqual(self.run_check().returncode, 0)
        self.fixture["inodes"][1] -= 1
        self.assertNotEqual(self.run_check().returncode, 0)

    def test_invalid_thresholds_fail_before_docker_or_df(self):
        for name, value in [
            ("DEPLOY_MIN_FREE_GIB", "0"), ("DEPLOY_MIN_FREE_GIB", "08"),
            ("DEPLOY_MIN_FREE_GIB", "1; touch unwanted"),
            ("DEPLOY_MIN_FREE_GIB", "9999999"),
            ("DEPLOY_MIN_FREE_PERCENT", "101"),
            ("DEPLOY_MIN_FREE_INODE_PERCENT", "-1"),
        ]:
            with self.subTest(name=name, value=value):
                before = self.env[name]
                self.env[name] = value
                self.assertNotEqual(self.run_check().returncode, 0)
                self.env[name] = before
        self.assertEqual(self.calls(), [])

    def test_missing_docker_or_df_measurement_fails_closed(self):
        for failure in ["docker_error", "df_error"]:
            with self.subTest(failure=failure):
                self.fixture[failure] = True
                self.assertNotEqual(self.run_check().returncode, 0)
                del self.fixture[failure]

    def test_unknown_or_malformed_capacity_fails_closed(self):
        for invalid in [["-", "-"], [0, 0], [100, 101], [100, -1], [100, "bad"], [100, 80, 20]]:
            with self.subTest(capacity=invalid):
                self.fixture["inodes"] = invalid
                self.assertNotEqual(self.run_check().returncode, 0)

    def test_nonlocal_or_missing_docker_root_fails(self):
        for path in ["relative/path", str(self.root / "missing")]:
            with self.subTest(path=path):
                self.fixture["docker_root"] = path
                self.assertNotEqual(self.run_check().returncode, 0)

    def deploy_script(self):
        # 워크플로의 실제 SSH 본문을 실행하여 검사 실패 뒤 pull이 진행되지 않음을 확인한다.
        lines = (REPO / ".github/workflows/prod-deploy.yml").read_text().splitlines()
        start = next(i for i, line in enumerate(lines) if "<< ENDSSH > deploy.log" in line) + 1
        end = next(i for i in range(start, len(lines)) if lines[i].strip() == "ENDSSH")
        script = textwrap.dedent("\n".join(lines[start:end])).replace("\\$", "$")
        return script.replace("/home/colding/pawpong_backend", shlex.quote(str(self.checkout)))

    def test_production_ssh_stops_before_any_pull_when_preflight_fails(self):
        self.fixture["blocks"][1] = 7 * GIB_KIB
        result = self.run_check(self.deploy_script())
        self.assertNotEqual(result.returncode, 0, result.stdout)
        docker_calls = [call for call in self.calls() if call[0] == "docker"]
        self.assertEqual(docker_calls, [["docker", "info", "--format", "{{.DockerRootDir}}"]])

    def test_production_ssh_pulls_all_three_images_only_after_successful_preflight(self):
        result = self.run_check(self.deploy_script())
        self.assertEqual(result.returncode, 0, result.stderr)
        calls = self.calls()
        pulls = [i for i, call in enumerate(calls) if call[:2] == ["docker", "pull"]]
        checks = [i for i, call in enumerate(calls) if call[0] == "df"]
        self.assertEqual(len(pulls), 3)
        self.assertEqual(len(checks), 6)
        self.assertLess(max(checks), min(pulls))


if __name__ == "__main__":
    unittest.main()
