"""dev 서버(pm2)용 실행기 — 백엔드 .env 를 읽어 환경 변수로 넣고 app.main 을 띄운다.

셸 `source .env` 는 값에 특수문자가 있으면 깨지므로 KEY=VALUE 를 직접 파싱한다.
이미 설정된 환경 변수는 덮어쓰지 않는다 (pm2 --update-env 로 넘긴 값이 우선).
운영은 Docker(docker-compose.yml)로 띄우므로 이 파일을 쓰지 않는다.
"""

import os
import runpy
import sys
from pathlib import Path

AGENT_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = Path(os.environ.get("AI_AGENT_ENV_FILE", AGENT_DIR.parent / ".env"))

if ENV_FILE.exists():
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

os.chdir(AGENT_DIR)
sys.path.insert(0, str(AGENT_DIR))
runpy.run_module("app.main", run_name="__main__")
