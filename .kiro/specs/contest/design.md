# Design — contest 도메인

## Overview

콘테스트(우리 아이 자랑/명예의 전당) 도메인. 진행 중 콘테스트 조회, 출품(entry), 투표,
명예의 전당/주간·어제·지난주 랭킹, 랜덤 투표 후보, 내 출품을 제공한다.
관리자(admin)는 출품 숨김/삭제를 담당.

상태: 구현 완료(dev). 최근 보강 — 항목/명예의전당 목록 표준 페이지네이션, 어제/지난주 TOP3, 랜덤 후보,
투표 취소(2026-08-14, 프론트 ContestVoteButton 요청 — 취소 후 같은 콘테스트 재투표 가능).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`. 공개+인증 혼합.

```
controller/            current, entries, entry(출품), vote, hall-of-fame, weekly/yesterday/previous, random, me
application/use-cases/ 조회/출품/투표 유스케이스
application/ports/      entry/vote reader·writer
infrastructure/* · repository/*  mongoose + storage
admin/                 콘테스트 관리(숨김/삭제)
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/contest/current` | 진행 중 콘테스트 |
| GET | `/api/v2/contest/entries` | 출품 목록(페이지네이션) |
| POST | `/api/v2/contest/entry` | 출품 등록 |
| GET | `/api/v2/contest/hall-of-fame` | 명예의 전당 |
| GET | `/api/v2/contest/me/entry` | 내 출품 |
| GET | `/api/v2/contest/previous-ranking` | 지난주 랭킹 |
| GET | `/api/v2/contest/random-entry` | 랜덤 투표 후보 |
| POST | `/api/v2/contest/vote/{entryId}` | 투표 |
| DELETE | `/api/v2/contest/vote/{entryId}` | 투표 취소 (내가 투표한 항목만, 취소 후 재투표 가능) |
| GET | `/api/v2/contest/weekly-top` | 주간 TOP |
| GET | `/api/v2/contest/yesterday-top` | 어제 TOP3 |
| PATCH | `/api/contest-admin/entries/{entryId}/status` | 콘테스트 항목 상태 변경 |

## Data Models

응답 DTO (dto/response): contest-current, contest-entries, contest-entry, contest-hall-of-fame,
contest-weekly-top, contest-yesterday-top, contest-random-entry.

스키마: `contest`, `contest-entry`, `contest-vote`.

## Correctness Properties

### Property 1: 투표 멱등/중복 방지
동일 유저의 동일 출품 중복 투표를 방지하며 집계는 실제 투표 수와 일치한다.
취소는 "내가 그 항목에 남긴 투표"만 지울 수 있고(다른 항목 지목 시 400), 취소 시 voteCount 를
음수 없이 되돌리며 unique index(contestId+voterId) 상 재투표가 가능해진다.
**확정 불변식**: 확정 결과 소비자(명예의 전당, previous-ranking, weekly-top)는 전부 `status === 'ended'`
기준으로 읽는다. 즉 결과 확정은 콘테스트 문서에 대한 status flip 이라는 "쓰기"로만 진입한다.
투표/취소는 repository 의 멀티 도큐먼트 트랜잭션이 원자적으로 수행한다: 열림 조건
(`status=active` AND `endDate 미경과`)부로 콘테스트 문서를 갱신하는 게이트 → 투표 기록 생성/삭제 →
voteCount 증감이 한 트랜잭션이다. 게이트가 콘테스트 문서에 쓰기를 걸므로 종료 flip 과는 문서 단위
쓰기 충돌로 직렬화된다 — flip 커밋 이후에 커밋되는 투표/취소는 존재할 수 없다.
부분 반영(기록-집계 불일치)은 트랜잭션 특성상 발생하지 않는다.

endDate 는 두 역할을 한다: (1) 사전 필터 — 만료된 콘테스트로의 진입을 게이트 이전에 거부,
(2) 지연 종료 자기 치유 — 만료됐는데 아직 active 인 콘테스트를 감지한 순간 `finalizeExpiredContest` 가
status 를 ended 로 확정 write 한다 (flip 을 수행하는 별도 스케줄러가 없어도 확정이 쓰기로 진입함을 보장).
시간 경과 자체는 쓰기가 아니므로 "마감 직전에 게이트를 통과해 마감 수 ms 후 커밋되는 표"는 존재할 수
있는데, 이는 마감 전에 행사된 표라 정상 집계 대상이다 — 확정(=flip 쓰기) 이후의 커밋은 게이트 직렬화로
불가능하다는 것이 지켜야 할 불변식이다.

결과는 ok/closed/duplicate(취소는 ok/closed/not_voted) 유니언으로 반환되어 유스케이스가 계약된
400 메시지로 매핑한다. e2e 인프라는 이 경로를 실제로 실행하기 위해 MongoMemoryReplSet(단일 노드)을 사용한다.
**Validates: Requirements 1.1**

### Property 2: 출품 제약
1인 출품 제약·진행 중 콘테스트 한정 등 출품 규칙을 강제한다.
**Validates: Requirements 1.2**

### Property 3: 랭킹 일관성
랭킹/TOP 응답은 집계된 투표 수 기준으로 정렬되며 표준 페이지네이션을 따른다.
**Validates: Requirements 1.3**

## Error Handling

- 마감/없는 콘테스트·출품: `BadRequestException`(400).
- 응답은 `ApiResponseDto<T>` 래핑, 목록은 표준 `PaginationResponse`.

## Testing Strategy

출품/투표/랭킹 유스케이스 unit + e2e. 중복 투표·정렬 검증.
