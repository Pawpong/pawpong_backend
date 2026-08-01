import { applyDecorators } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiPublicController } from '../../../../common/decorator/swagger.decorator';
import { SubmitContestEntryRequestDto } from '../dto/request/submit-contest-entry-request.dto';
import { ContestCurrentResponseDto } from '../dto/response/contest-current-response.dto';
import {
    ContestEntriesResponseDto,
    ContestSubmitResponseDto,
    ContestVoteResponseDto,
} from '../dto/response/contest-entries-response.dto';
import { ContestEntryDto } from '../dto/response/contest-entry.dto';
import {
    ContestHallOfFameResponseDto,
    ContestPreviousRankingResponseDto,
} from '../dto/response/contest-hall-of-fame-response.dto';
import { ContestRandomEntryResponseDto } from '../dto/response/contest-random-entry-response.dto';
import { ContestWeeklyTopResponseDto } from '../dto/response/contest-weekly-top-response.dto';
import { ContestYesterdayTopResponseDto } from '../dto/response/contest-yesterday-top-response.dto';

const TAG = '콘테스트';

/** 공개(선택적 인증) 콘테스트 컨트롤러 Swagger 태그 */
export function ApiContestPublicController() {
    return ApiPublicController(TAG);
}

/** 인증 필수 콘테스트 컨트롤러 Swagger 태그 + BearerAuth */
export function ApiContestProtectedController() {
    return ApiController(TAG);
}

export function ApiGetCurrentContestEndpoint() {
    return ApiEndpoint({
        summary: '현재 콘테스트 조회',
        description: '진행 중인 콘테스트 정보 + 실시간 1~3위 랭킹을 반환합니다. 콘테스트가 없으면 data: null.',
        responseType: ContestCurrentResponseDto,
        supportsOptionalAuth: true,
    });
}

export function ApiGetContestEntriesEndpoint() {
    return ApiEndpoint({
        summary: '투표 항목 목록 조회',
        description: '현재 콘테스트의 항목 목록을 voteCount 내림차순으로 반환합니다.',
        responseType: ContestEntriesResponseDto,
        supportsOptionalAuth: true,
    });
}

export function ApiSubmitContestEntryEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '콘테스트 참여',
            description: `사진+설명으로 현재 콘테스트에 참여합니다. 유저당 1회 제한.

**호출 순서**
1. \`POST /v2/upload/single\` — 이미지 업로드 후 \`fileName\` 획득
2. \`POST /v2/contest/entry\` — \`photoFileName\`(1번 결과) + \`description\` 전송

**프론트엔드 전용 기능 (백엔드 API 없음)**
- 임시저장: 작성 중인 이미지·설명을 클라이언트 로컬 스토리지에 저장. 서버 API 없음.
- 위치(핀) 버튼: UI 장식 요소. 위치 데이터를 서버에 저장하지 않음.`,
            responseType: ContestSubmitResponseDto,
        }),
        ApiBody({ type: SubmitContestEntryRequestDto }),
    );
}

export function ApiVoteContestEntryEndpoint() {
    return ApiEndpoint({
        summary: '투표하기',
        description: '항목에 투표합니다. 콘테스트당 1회 제한. 자신의 항목에는 투표 불가.',
        responseType: ContestVoteResponseDto,
    });
}

export function ApiGetMyContestEntryEndpoint() {
    return ApiEndpoint({
        summary: '나의 참여 항목 조회',
        description: '현재 콘테스트에서 내가 올린 항목을 조회합니다. 없으면 data: null.',
        responseType: ContestEntryDto,
    });
}

export function ApiGetPreviousRankingEndpoint() {
    return ApiEndpoint({
        summary: '저번 콘테스트 랭킹',
        description: '가장 최근 종료된 콘테스트의 1~3위를 반환합니다. 이전 콘테스트가 없으면 data: null.',
        responseType: ContestPreviousRankingResponseDto,
        isPublic: true,
    });
}

export function ApiGetHallOfFameEndpoint() {
    return ApiEndpoint({
        summary: '명예의 전당 목록',
        description: '역대 콘테스트 우승자 목록을 최신순으로 반환합니다.',
        responseType: ContestHallOfFameResponseDto,
        isPublic: true,
    });
}

export function ApiGetYesterdayTopEndpoint() {
    return ApiEndpoint({
        summary: '어제 기준 TOP 3 조회',
        description:
            '현재 진행 중인 콘테스트에서 득표율(voteRate) 기준 TOP 3를 반환합니다. 진행 중인 콘테스트가 없으면 data: null.',
        responseType: ContestYesterdayTopResponseDto,
        supportsOptionalAuth: true,
    });
}

export function ApiGetRandomContestEntryEndpoint() {
    return ApiEndpoint({
        summary: '랜덤 투표 후보 조회',
        description: `투표하러가기 클릭 시 호출. 이번 주 active 항목 중 본인 항목을 제외한 랜덤 1개를 반환합니다.
- 이미 투표한 경우: entry: null, alreadyVoted: true
- 투표 가능한 항목 없음: entry: null, alreadyVoted: false
- 투표 전이므로 voteCount는 항상 null`,
        responseType: ContestRandomEntryResponseDto,
    });
}

export function ApiGetWeeklyTopEndpoint() {
    return ApiEndpoint({
        summary: '지난주 TOP 3 조회',
        description:
            '가장 최근 종료된 콘테스트의 voteCount 기준 TOP 3를 반환합니다. 홈 화면 명예의 전당 영역 연동용. 종료된 콘테스트가 없으면 data: null.',
        responseType: ContestWeeklyTopResponseDto,
        isPublic: true,
    });
}
