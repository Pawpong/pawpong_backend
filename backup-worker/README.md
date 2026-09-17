# prod 전용 백업 워커

운영 활성화 전 비공개 버킷·전용 읽기 계정·암호화 키·격리 복원 검증이 필요하다.
기본값은 비활성이다. 이 코드를 배포한 것과 실제 백업이 완료된 것은 다르다.

## Control 관리 키 (값은 저장소에 넣지 않음)

대상은 `pawpong-production`. 각 PATCH에 최신 expectedVersion을 사용한다.
여러 키 설정 중에는 PROD_BACKUP_ENABLED=false를 유지하고 마지막에 활성화한다.

| 키 | 용도 |
| --- | --- |
| SWAGGER_AUTH_USERNAME / SWAGGER_AUTH_PASSWORD | Swagger 전용 Basic 인증. 계정 로그인 비밀번호와 별개 |
| PROD_BACKUP_ENABLED | 워커와 관리자 요청 활성화. 기본 false |
| PROD_BACKUP_SCHEDULE_ENABLED | 매일 03:00 Asia/Seoul 자동 실행. 기본 false |
| PROD_BACKUP_MONGODB_URI | DB 경로가 정확히 /prod인 전용 read 계정 URI |
| PROD_BACKUP_S3_ENDPOINT / PROD_BACKUP_S3_REGION | SmileServ HTTPS endpoint/region |
| PROD_BACKUP_S3_BUCKET | 이미지 버킷과 다른 비공개 백업 전용 버킷 |
| PROD_BACKUP_S3_ACCESS_KEY / PROD_BACKUP_S3_SECRET_KEY | 백업 버킷의 정책·ACL 조회, PutObject/GetObject 최소 권한 |
| PROD_BACKUP_ENCRYPTION_KEY | 안전하게 생성한 32바이트 키의 base64. 키 버전별 별도 안전 보관 필수 |
| PROD_BACKUP_KEY_ID | 영숫자/밑줄/하이픈으로 된 키 버전 식별자 |

키 회전 후에도 과거 백업의 복호화 키는 보존한다. manifest에는 키 값이 아닌 keyId만 기록한다.
공개 ACL·와일드카드 Allow 정책은 거부한다. SmileServ가 정책 조회를 지원하지 않으면 자동 우회하지 않고 운영 구성을 확인한다.

## 로컬/운영 경계

- 로컬은 `.env`와 개발 전용 계정을 사용한다. `PROD_BACKUP_ENABLED=false`를 유지한다.
- 개발 문서만 공개하려면 `SWAGGER_DEVELOPMENT_PUBLIC=true`. production에서는 무시한다.
- 운영 CI는 `.env.production`을 읽기 검사만 한다. Control을 우회한 SSH 환경 파일 덮어쓰기를 하지 않는다.
- 백업 컨테이너에는 필요한 키만 전달한다. JWT·OAuth·결제 키를 전달하지 않는다.
- 테스트: `node --test backup-worker/runner.test.cjs` (운영 DB/S3 접근 없음).

## 운영 실행

CI가 생성한 `pawpong-backup:latest` 이미지가 필요하다. Control 키 설정 완료 후 명시적으로 실행한다.

```sh
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.backup.yml --profile backup up -d --no-deps backup
```

관리자 `/settings/backups`에서 수동 실행/최근 50건을 확인한다.
API는 GET/POST `/api/platform-admin/backups`, `canManageAdmins` 권한 필요.
POST 202는 접수이지 완료가 아니다. 실행 중인 워커가 없으면 503을 반환한다.
큐는 Redis DB 1의 `pawpong-prod-backup`. global concurrency=1, 수동 요청은 미완료 동안 deduplicate한다.
완료/실패 각각 최근 1,000건을 큐에 유지하며 장기 완료 이력은 S3 manifest에 남는다.

최대 암호화 파일 크기 2GiB, 작업 시간 1시간, 컬렉션 병렬도 1, 메모리512MB/CPU0.5.
스토리지 여유 공간을 사전에 확보한다. 강제 종료 시 전용 tmp 볼륨에 암호문이 남을 수 있으므로 운영 이력과 대조해 해당 작업 파일만 정리한다.
65분 graceful stop을 적용하여 실행 중 백업을 배포 때문에 자르지 않는다. 배포 중 백업 워커 교체는 시간이 걸릴 수 있다.
8GB 서버에서 백업은 추가512MB를 사용한다. 스왑 전 백업 작업을 마치거나 운영 사용량을 확인해야 한다.

자동 실행 중지: Control에서 SCHEDULE_ENABLED=false 후 워커 재생성. 전체 비활성화 시 큐에 대기 작업이 있는지 확인하고 기존 워커도 종료한다.
보관 기간 30일은 제안 상태다. 아직 S3 자동 삭제를 적용하지 않았다. 일반 사용자 데이터나 공개 이미지 파일을 삭제하는 경로는 없다.

## 복원 검증과 한계

암호화 파일 `archive.gz.enc`와 같은 prefix의 `manifest.json`을 인증된 경로로 가져온다.
manifest의 keyId에 해당하는 키, iv, tag로 AES-256-GCM 복호화하고 SHA-256을 검증한다.
복원은 별도 격리 DB에서만 `mongorestore --archive --gzip`으로 수행한다. 운영 복원 버튼은 제공하지 않는다.
현재 `restoreVerified=false`를 반환한다. 단위 암복호화 테스트는 실제 DB 복원 검증을 대체하지 않는다.

prod 한 개만 논리 덤프하므로 동시 쓰기에 대한 시점 일관성은 보장하지 않는다.
`--oplog` 전체 덤프로 다른 DB까지 가져오는 방식은 사용하지 않는다.
공식 문서: https://www.mongodb.com/docs/database-tools/mongodump/
