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
