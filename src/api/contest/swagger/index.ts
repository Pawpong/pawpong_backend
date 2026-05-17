import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { ContestCurrentResponseDto } from '../dto/response/contest-current-response.dto';
import {
    ContestEntriesResponseDto,
    ContestSubmitResponseDto,
    ContestVoteResponseDto,
} from '../dto/response/contest-entries-response.dto';
import {
    ContestHallOfFameResponseDto,
    ContestPreviousRankingResponseDto,
} from '../dto/response/contest-hall-of-fame-response.dto';

function ApiContestTag() {
    return ApiTags('contest');
}

export function ApiGetCurrentContestEndpoint() {
    return applyDecorators(
        ApiContestTag(),
        ApiOperation({
            summary: '현재 콘테스트 조회',
            description: '진행 중인 콘테스트 정보 + 실시간 1~3위 랭킹을 반환합니다. 콘테스트가 없으면 data: null.',
        }),
        ApiResponse({ status: 200, type: ApiResponseDto }),
    );
}

export function ApiGetContestEntriesEndpoint() {
    return applyDecorators(
        ApiContestTag(),
        ApiOperation({
            summary: '투표 항목 목록 조회',
            description: '현재 콘테스트의 항목 목록을 voteCount 내림차순으로 반환합니다.',
        }),
        ApiResponse({ status: 200, type: ApiResponseDto }),
    );
}

export function ApiSubmitContestEntryEndpoint() {
    return applyDecorators(
        ApiContestTag(),
        ApiOperation({
            summary: '콘테스트 참여',
            description: '사진+설명으로 현재 콘테스트에 참여합니다. 유저당 1회 제한.',
        }),
        ApiResponse({ status: 200, type: ApiResponseDto }),
    );
}

export function ApiVoteContestEntryEndpoint() {
    return applyDecorators(
        ApiContestTag(),
        ApiOperation({
            summary: '투표하기',
            description: '항목에 투표합니다. 콘테스트당 1회 제한. 자신의 항목에는 투표 불가.',
        }),
        ApiResponse({ status: 200, type: ApiResponseDto }),
    );
}

export function ApiGetMyContestEntryEndpoint() {
    return applyDecorators(
        ApiContestTag(),
        ApiOperation({
            summary: '나의 참여 항목 조회',
            description: '현재 콘테스트에서 내가 올린 항목을 조회합니다. 없으면 data: null.',
        }),
        ApiResponse({ status: 200, type: ApiResponseDto }),
    );
}

export function ApiGetPreviousRankingEndpoint() {
    return applyDecorators(
        ApiContestTag(),
        ApiOperation({ summary: '저번 콘테스트 랭킹', description: '가장 최근 종료된 콘테스트의 1~3위를 반환합니다.' }),
        ApiResponse({ status: 200, type: ApiResponseDto }),
    );
}

export function ApiGetHallOfFameEndpoint() {
    return applyDecorators(
        ApiContestTag(),
        ApiOperation({
            summary: '명예의 전당 목록',
            description: '역대 콘테스트 우승자 목록을 최신순으로 반환합니다.',
        }),
        ApiResponse({ status: 200, type: ApiResponseDto }),
    );
}
