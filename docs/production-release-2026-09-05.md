# 2026-09-05 운영 전환 검증

## 데이터 보호

- 운영과 로컬 백업 환경이 같은 Atlas `prod` DB를 바라봄을 확인했다.
- 로컬 비공개 백업: `~/pawpong-backups/prod-2026-09-05T07-10-39-522Z-xD65CY/`.
- 29개 컬렉션, 496개 문서. 격리된 MongoDB 7에서 문서와 인덱스 복원 성공.
- SHA256: `c3d5084795fb85c4d3ddd64c750dc6c2054dd42a31afe60b964b922d91e29cae`.
- 라이브 논리 백업이므로 여러 컬렉션에 걸친 동시 쓰기의 단일 시점 일관성은 보장하지 않는다.

## FAQ AI 안내

- `POST /api/v2/home/support/inquiry`: `{question: string (1..2000), userType: adopter|breeder}`.
- 응답은 표준 봉투 안의 `{sources: [{faqId, question, answer}], needsHumanSupport}`.
- AI는 공개 FAQ ID를 최대 3개 선택한다. 사용자에게는 DB의 승인된 FAQ 원문만 제공한다.
- 문의 접수·계정 변경·의학적 진단을 실행하지 않는다. 근거가 없으면 담당자 연결이 필요함을 표시한다.
- 기존 OpenAI 키는 GitHub Secret `PAWPONG_OPENAI_API_KEY`로 전달하며 저장소와 로그에 노출하지 않는다.
- 모델 기본값 `gpt-4o-mini`, JSON 출력 검증, 시간 제한, 재시도 없음.
- 공개 문의 본문은 HTTP 로그에서 마스킹한다.
- 요청 제한은 백엔드 인스턴스별 IP당 5회/분, 전체 60회/분이며 다중 인스턴스 통합 제한은 아니다.

## 배포와 복구

- main CI가 백엔드와 AI Agent 이미지를 같은 커밋으로 빌드한다.
- Agent의 Kafka 및 키 설정 확인 후 백엔드 `/api/health/ready`를 확인하고 Nginx를 전환한다.
- Nginx 변경 전 설정 백업을 보관하고 문법 검사·reload 실패 시 이전 설정을 복구한다.
- 직전 백엔드 컨테이너와 이미지는 삭제하지 않는다. Agent는 단일 인스턴스여서 교체 중 AI 기능의 짧은 중단이 가능하다.
- 웹은 별도 Vercel 점검 페이지로 유지한다. 백엔드 및 프론트 검증 후에만 해제한다.
- 이 문서는 배포 절차 기록이며 배포 성공 선언이 아니다. 최종 CI와 운영 검증 결과를 별도 확인한다.
