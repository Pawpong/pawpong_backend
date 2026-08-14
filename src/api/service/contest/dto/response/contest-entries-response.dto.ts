import { ApiProperty } from '@nestjs/swagger';

import { PageInfoDto } from '../../../../../common/dto/pagination/page-info.dto';
import { ContestEntryDto } from './contest-entry.dto';

/**
 * 투표 항목 목록 응답.
 * 플랫폼 표준 페이지네이션 계약(`data: { items, pagination }`)을 따른다.
 */
export class ContestEntriesResponseDto {
    @ApiProperty({ type: [ContestEntryDto] })
    items: ContestEntryDto[];

    @ApiProperty({ type: PageInfoDto })
    pagination: PageInfoDto;
}

export class ContestSubmitResponseDto {
    @ApiProperty({ description: '생성된 항목 ID' })
    entryId: string;
}

export class ContestVoteResponseDto {
    @ApiProperty({ description: '투표된 항목 ID' })
    entryId: string;

    @ApiProperty({ description: '투표 후 총 투표 수' })
    newVoteCount: number;
}

export class ContestVoteCancelResponseDto {
    @ApiProperty({ description: '투표가 취소된 항목 ID' })
    entryId: string;

    @ApiProperty({ description: '취소 후 총 투표 수' })
    newVoteCount: number;
}
