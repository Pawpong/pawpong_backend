# 운영 로그 보관

- Docker: 모든 서비스 json-file 로깅에 10MB × 3개 상한 적용. Redis는 기존 5MB × 2개 유지.
- 설정 변경은 컨테이너 재생성 시 적용됨. Kafka/Zookeeper 재생성은 채팅 중단 가능성이 있으므로 점검 시간에 순차 적용하고 health를 확인함. 데이터 볼륨 삭제 금지.
- Winston: combined 5MB × 10개, error 5MB × 5개, exception/rejection 각각 5MB × 3개. 개발 debug는 5MB × 3개.
- Nginx: 서버 기본 logrotate의 daily, rotate 14, compress 유지.
- systemd journal: 운영 서버 `/etc/systemd/journald.conf`에 SystemMaxUse=512M, SystemKeepFree=2G, MaxRetentionSec=14day 설정함.
- Loki: 기존 30일 보관 유지. Kafka 메시지 보관은 진단 로그와 다르므로 임의 삭제하지 않음.
- GitHub Actions: 전체 SSH 로그는 runner의 deploy.log 파일에만 저장. 환경변수로 전달하지 않음(Argument list too long 재발 방지).

2026-09-05: journalctl rotate/vacuum으로 오래된 시스템 저널 약 3.4GB 정리함. 저널 3.7GB → 294MB, 루트 디스크 68% → 61%. 삭제한 오래된 저널은 복구 불가. DB·이미지·환경설정 백업은 보존함.

로그 정리 시 Docker 활성 로그를 직접 truncate하거나 `/var/lib/docker`, 볼륨, 백업 디렉터리를 통째로 삭제하지 않음.
