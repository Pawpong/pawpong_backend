# 운영 배포 디스크 사전 검사와 안전한 이미지 정리

2026-09-24 운영 루트 디스크가 100%에 도달해 이미지 다운로드 단계에서 배포가 중단됐다. 당시 약 47GB 디스크에 이미지 79개가 있었고 Docker가 표시한 이미지 크기 합은 약 44GB였다. 이미지 크기에는 공유 레이어가 포함되므로 이 합을 실제 회수 가능한 공간으로 해석하면 안 된다. 사용하지 않는 과거 이미지 태그만 선별 제거하여 복구했다.

## 배포 사전 검사

`.github/workflows/prod-deploy.yml`은 서버 코드 SHA 확인 후, backend·AI Agent·backup 이미지의 첫 `docker pull` 전에 `scripts/check-deploy-disk.sh`를 실행한다. 검사 실패 또는 측정 실패 시 SSH의 `set -e`로 배포를 중단한다. 검사 자체는 이미지·컨테이너·볼륨을 변경하지 않는다.

| 검사 | 기본 기준 | 직접 실행 환경 변수 | GitHub Actions repository variable |
| --- | --- | --- | --- |
| 사용 가능한 블록 용량 | 8GiB 이상 | `DEPLOY_MIN_FREE_GIB` | `PROD_DEPLOY_MIN_FREE_GIB` |
| 전체 블록 대비 사용 가능한 비율 | 10% 이상 | `DEPLOY_MIN_FREE_PERCENT` | `PROD_DEPLOY_MIN_FREE_PERCENT` |
| 전체 inode 대비 사용 가능한 비율 | 10% 이상 | `DEPLOY_MIN_FREE_INODE_PERCENT` | `PROD_DEPLOY_MIN_FREE_INODE_PERCENT` |

세 기준을 **모두** 만족해야 한다. 루트(`/`), 실행 디렉터리, 로컬 Docker daemon의 `DockerRootDir`을 각각 검사한다. Docker 저장소를 별도 디스크로 옮겨도 루트 디스크 부족을 놓치지 않는다. 같은 파일시스템이면 출력이 중복될 수 있다. 숫자는 양의 정수만 허용하며 비율은 1~100이다. GNU `df`가 있는 운영 Linux와 로컬 Docker daemon을 대상으로 한다. Docker Desktop의 VM 경로나 원격 Docker context를 검사하는 도구가 아니다.

```bash
# 배포 저장소 루트에서 실행. sudo 또는 환경 파일 source는 필요 없다.
bash scripts/check-deploy-disk.sh

# 예: 대형 이미지 배포 시 확보할 최소 공간을 상향한다.
DEPLOY_MIN_FREE_GIB=12 bash scripts/check-deploy-disk.sh
```

8GiB는 현재 장애 재발을 줄이기 위한 최소 운영 기준이며, 세 이미지의 다운로드·압축 해제 공간을 항상 보장하는 값은 아니다. 이미지가 커지면 기준을 높인다. 낮춰서 경고를 우회하지 말고 아래 절차로 공간을 확보하거나 디스크를 확장한다. 검사 뒤 다른 프로세스가 공간을 사용하는 것을 예약·차단하지는 않는다. 수동 배포나 Control 경로에서 이미지를 다운로드할 때도 **다운로드 전에** 이 검사를 실행한다.

## 정리 전 반드시 보존할 대상 확인

1. GitHub 배포, Control 배포, 수동 이미지 pull이 동시에 진행 중이지 않은지 확인한다. GitHub의 concurrency group은 다른 배포 경로까지 잠그지 않는다. 정리 동안 새 배포를 시작하지 않는다.
2. 실행 중이거나 **정지된 모든 컨테이너**가 참조하는 이미지 ID를 기록한다. 정지 컨테이너가 직전 롤백 대상일 수 있다. 컨테이너·볼륨은 정리 대상에 포함하지 않는다.
3. 실제 현재 서비스 이미지와 검증된 직전 롤백 이미지의 **전체 ID 및 SHA 태그**를 따로 기록한다. 배포 중인 새 이미지, AI Agent, backup worker의 필요한 버전도 보호한다. `latest`만으로 식별하지 않는다.

```bash
df -h /
df -i /
docker info --format '{{.DockerRootDir}}'
docker system df -v
docker container ls -a --no-trunc --format '{{.ID}} {{.Names}} {{.Status}}'

# 전체 inspect JSON에는 비밀 환경 변수가 있으므로 필요한 필드만 출력한다.
while IFS= read -r container_id; do
    docker container inspect --format '{{.Id}} {{.Image}} {{.Name}} {{.State.Status}}' "$container_id"
done < <(docker container ls -aq --no-trunc)

docker image ls --no-trunc --format '{{.Repository}}:{{.Tag}} {{.ID}} {{.CreatedAt}} {{.Size}}'
```

위 목록은 삭제 명령이 아닌 검토 자료다. DockerRootDir가 별도 마운트라면 출력된 경로에 대해서도 `df -h`와 `df -i`를 실행한다. 권한 또는 조회 오류가 있으면 전체 보호 대상을 확인하기 전에는 정리하지 않는다.

## 제한된 수동 정리

다음을 모두 확인한 이미지 태그만 후보로 선택한다.

- 저장소명이 정확히 승인한 Pawpong backend 저장소 또는 그 로컬 별칭 `pawpong-backend`이다. 부분 문자열 검색으로 다른 앱을 포함하지 않는다. AI/backup 정리가 필요하면 각각 따로 승인한 정확한 저장소로 범위를 정한다.
- 생성한 지 기본 30일 이상 지났고, 운영·정지 컨테이너 전체와 현재/롤백/배포 예정 보호 목록 어디에서도 ID를 사용하지 않는다. 장애 상황에서 더 짧은 기간을 사용할 때는 구체적인 SHA와 보호 목록을 다시 검토한다. 나이만으로 삭제하지 않는다.
- 같은 ID의 모든 태그를 확인했다. 다른 앱 저장소나 용도를 모르는 태그와 공유하는 ID는 자동 후보로 추론하지 않는다. 레이어가 공유되면 태그 삭제 후 공간이 거의 늘지 않을 수 있다.

삭제 직전에 컨테이너 목록과 후보의 ID를 다시 조회하여 검토 시점과 같음을 확인한다. 후보의 **명시적인 전체 태그**를 하나씩 지정하고, 강제 삭제 옵션을 사용하지 않는다.

```bash
# REPOSITORY:SHA는 위에서 직접 확인한 후보로 대체한다. latest를 지정하지 않는다.
docker image inspect --format '{{.Id}} {{.Created}} {{json .RepoTags}}' 'REPOSITORY:SHA'
docker image rm 'REPOSITORY:SHA'

# 같은 ID의 승인된 다른 태그가 있으면 각각 재확인 후 처리한다.
# 최대 10개 이미지 ID마다 멈추고, 기준이 충족되면 즉시 정리를 끝낸다.
bash scripts/check-deploy-disk.sh
```

참조 중이거나 충돌해서 삭제가 거부되면 그 후보를 건너뛴다. **`--force`, `docker system prune`, `docker image prune -a`, container/volume prune, 정지 컨테이너 제거, Docker 데이터 디렉터리 직접 삭제를 사용하지 않는다.** 무참조 이미지라도 롤백용으로 보존해야 할 수 있으므로 광범위한 prune은 이 절차를 대신하지 못한다. 컨테이너 참조는 삭제 시점까지 바뀔 수 있으므로 먼저 배포 동시 실행을 차단해야 한다.

확보할 수 있는 안전한 후보가 부족하면 보호 대상을 삭제하지 말고 디스크 확장 또는 별도의 보존 정책 결정을 진행한다. 공간 확보 후 서비스 health를 확인하고, 중단했던 배포를 재실행한다. 이 스크립트는 자동 정리·컨테이너 재시작·볼륨 삭제를 하지 않는다.

## 운영 주간 자동 정리

`main`의 `.github/workflows/prod-docker-cleanup.yml`은 매주 일요일 03:37 KST에 별도 작업으로 실행한다. 운영 배포와 같은 GitHub Actions concurrency group을 사용하므로 두 작업은 동시에 실행되지 않는다. `scripts/cleanup-prod-docker.py`는 기본값이 dry-run이며 CI에서만 `--execute`를 전달한다.

- `.deploy_history`와 `.last_deploy`의 모든 태그, `latest`, 실행 중이거나 정지된 컨테이너의 이미지 ID를 보호한다. 이력이 없거나 현재 `pawpong-backend:latest`가 없으면 삭제 전에 실패한다.
- 정확히 `pawpong-backend`, `pawpong-ai-agent`, `pawpong-backup`의 로컬 태그 또는 `asia-northeast3-docker.pkg.dev/pawpong/pawpong-docker/` 아래 같은 이름의 레지스트리 태그로만 구성된 이미지 ID 중 **14일 이상** 지난 후보만 명시적인 전체 태그로 삭제한다. 같은 ID에 다른 저장소 태그가 섞여 있으면 건너뛴다. 레지스트리 경로가 바뀌면 정리 코드도 함께 검토한다. 이는 30일 수동 기본 기준과 별도인, 이력·컨테이너를 자동 확인하는 운영 정책이다.
- 14일 지난 dangling 이미지는 Docker 기본 `image prune`으로, 30일 지난 미사용 빌드 캐시는 `builder prune`으로 정리한다. `image prune -a`, 강제 삭제, 컨테이너·볼륨·네트워크 삭제는 하지 않는다.
- Control 또는 수동 배포는 GitHub concurrency group에 포함되지 않는다. 해당 경로에서 동시에 배포 중이면 주간 정리와 시간을 분리해야 한다. 이미지 참조가 바뀌어 삭제 명령이 거부되면 강제하지 않고 작업을 실패시킨다.

주간 정리는 배포 전 용량 검사를 대체하지 않는다. 이미 여유 공간이 부족한 배포는 `scripts/check-deploy-disk.sh`에서 그대로 중단된다. `rollback.sh`가 이력의 일부 `control-env-*` 항목에 대해 로컬 이미지를 찾지 못하는 기존 문제도 주간 정리로 해결되지 않는다.

## 이번 변경에서 수정하지 않은 배포 위험

아래는 `main` 기준 `3f6d500d`에서 확인한 별도 개선 항목이다. 이 PR은 디스크 사전 검사와 수동 절차에 한정한다.

| 확인한 위치 | 현재 동작과 운영 주의점 |
| --- | --- |
| `deploy.sh`의 `LAST_IMAGE` / `.last_deploy` 기록 | CI가 새 이미지를 `latest`로 태그한 뒤 첫 이미지 태그를 기록한다. 직전 성공 이미지의 증거로 사용할 수 없다. 실제 컨테이너 `.Image`와 검증된 SHA를 보호한다. |
| `deploy.sh`의 `.deploy_history`, `rollback.sh`의 `sed -n '2p'` | 히스토리는 배포 성공 전에 append되며 오래된 순서다. 두 번째 행이 직전 성공 배포라는 보장이 없다. 히스토리 10행 제한은 이미지 보존·삭제 정책이 아니다. |
| `deploy.sh`의 성공 `exit 0` / 실패 `exit 1` 이후 구간 | 아래쪽 backup·monitoring 기동 구간에 도달하지 않는다. backup 이미지를 pull했다는 사실만으로 실행 중인 worker가 갱신됐다고 판단하지 않는다. |
| `deploy.sh`의 Kafka / AI Agent readiness | backend 교체 전에 무조건 검사하므로 이 서비스의 비정상 상태가 배포를 차단할 수 있다. 디스크 복구만으로 전체 readiness 성공을 단정하지 않는다. |
| `deploy.sh`의 현재 컨테이너 선택 | 8080 health 응답으로 현재 색상을 선택한다. 두 컨테이너가 모두 살아 있는 복구 상황에서는 실제 Nginx upstream도 확인한다. |
| `Dockerfile`의 builder `node_modules` 복사 | 개발 의존성을 포함한 전체 디렉터리가 이미지에 들어간다. 이미지 축소와 자동 보존 정책은 별도 검증 후 다룬다. |

Docker 공식 문서: [이미지 삭제](https://docs.docker.com/reference/cli/docker/image/rm/), [이미지 prune의 참조 기준](https://docs.docker.com/reference/cli/docker/image/prune/), [Docker 리소스 정리 범위](https://docs.docker.com/engine/manage-resources/pruning/).

## 변경 검증

```bash
bash -n scripts/check-deploy-disk.sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s scripts/tests -p 'test_check_deploy_disk.py' -v
```

테스트는 격리된 임시 경로에서 Docker와 `df` 출력만 대체한다. 부족한 블록/inode, 설정값 오류, 조회 실패, 별도 Docker 마운트, 경계값을 확인한다. 실제 production workflow의 SSH 본문도 대체 명령으로 실행하여 사전 검사 실패 시 **첫 이미지 pull 자체가 발생하지 않는 것**을 검증한다. 운영 호스트의 이미지나 컨테이너는 테스트에서 접근하지 않는다.
