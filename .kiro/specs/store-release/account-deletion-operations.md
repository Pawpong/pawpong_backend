# 영구 삭제 운영

기존 일반 탈퇴/복구를 유지하고 `POST /api/v2/account-deletion`은 본인 JWT와 `confirmation: DELETE_PERMANENTLY`로 별도 접수한다. 접수 트랜잭션이 계정을 잠그고 refresh/push/심사 자격을 폐기한다. 자동 worker는 30초마다 최대 두 작업을 DB lease로 처리한다. MongoDB replica set/transaction 지원이 필요하다.

상태는 `pending → processing → completed`; 일시 오류는 `retryable`, 소유권 검토가 남은 파일은 `review_required`다. 파일 삭제 또는 Apple 연결 해제 전송 실패를 완료로 표시하지 않는다. Apple의 과거 연동 토큰이 없는 계정은 자체 데이터 삭제를 진행하며 `appleConnectionRemovalRequired`로 직접 연결 해제를 안내한다. 공개 조회는 UUID+256bit 영수증만 받으며 서버에는 hash만 저장한다. BFF가 영수증을 먼저 생성/쿠키에 저장하면 접수 응답 유실 후에도 상태를 확인할 수 있다.

## 검토 및 재시도

운영 환경변수는 보안 환경에서 주입한다. 아래 명령을 실제 계정에 실행하려면 운영자가 해당 요청과 파일 소유권을 확인해야 한다. 이 문서 작성 과정에서 실제 삭제는 실행하지 않았다.

```sh
# 기본은 읽기만 수행. job 접수/계정 삭제/인덱스 생성/파일 삭제 없음.
pnpm exec ts-node src/scripts/process-account-deletion.ts --job REQUEST_UUID
# 검토 대상 객체 키만 조회(고객 내용/receipt/token을 출력하지 않음)
pnpm exec ts-node src/scripts/process-account-deletion.ts --job REQUEST_UUID --list-review-files
# 특정 요청 재시도. 자동 worker는 CLI에서 비활성화됨.
pnpm exec ts-node src/scripts/process-account-deletion.ts --job REQUEST_UUID --apply
# 업로드 기록 등으로 본인 파일임을 별도 확인한 정확한 한 키만 승인 후 처리
pnpm exec ts-node src/scripts/process-account-deletion.ts --job REQUEST_UUID --apply --approve-file 'folder/exact-object-key.jpg'
```

기존 일반 업로드에는 소유자 원장이 없어 UUID/URL만으로 소유권을 증명할 수 없다. 서버가 생성한 본인 videoId/AI jobId 전용 경로 외에는 자동 삭제하지 않는다. 다른 계정이 참조하는 파일은 위 승인으로도 삭제할 수 없으며 참조와 실제 소유권을 별도 조정해야 한다. DB 개인정보 정리는 이미 끝났더라도 검토 파일이 남으면 완료가 아니다. 게시 전 취소한 과거 업로드처럼 DB/Redis에 참조 자체가 없는 고아 파일은 특정 계정으로 식별할 수 없으며 삭제 범위로 확인됐다고 주장하지 않는다.

진행 중인 AI/동영상 작업은 종료될 때까지 재시도 상태를 유지한다. 영구 실패한 외부 작업은 운영자가 원래 작업 큐/상태를 확인해야 하며 삭제 job을 임의 완료로 바꾸지 않는다. 오래된 스토리지/CDN/백업 및 외부 수신자가 이미 저장한 사본을 이 worker가 즉시 지울 수는 없다. 별도 백업 수명/복원 시 삭제 재적용은 운영 정책 확인이 필요하다.

접수 전에 발급된 S3 직접 업로드 URL은 600초 동안 유효하므로 `ai-image/source/`와 `videos/raw/` 파일은 manifest 수집 후 최소 600초 동안 운영 승인도 거부한다. 파일 목록의 `notBefore`를 확인한다. `account_write_leases`가 남은 계정은 이전 HTTP/채팅 쓰기가 끝나기 전에는 수집/DB삭제/완료하지 않는다. 이 쓰기 lease에는 자동 만료가 없다. 수동 복구 전에는 원래 API 프로세스가 종료됐고 실행 중인 handler가 없다는 사실을 운영자가 확인해야 한다. 생성 시각이 오래됐다는 이유만으로 일괄 삭제하면 안 된다.

본인 커뮤니티/댓글/채팅 메시지·문의/답변·후기는 삭제 표시로 바꾸고 첨부를 제거한다. 상대방 원문/공유 채팅방은 유지하며 상대방이 보는 복제 프로필/상담 개인정보는 정리한다. 분양 동물/부모 동물/임시저장, 관계/투표/신고/푸시/심사 자격도 소유 범위에 따라 제거한다. 특정한 1년/5년 보존기간을 새로 도입하지 않는다. 운영 채널에 이미 전달된 메시지/별도 백업은 이 DB job 범위 밖임을 운영자가 확인해야 한다.
