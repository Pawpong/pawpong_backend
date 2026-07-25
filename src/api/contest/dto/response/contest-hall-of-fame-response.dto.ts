import { ApiProperty } from '@nestjs/swagger';

import { PageInfoDto } from '../../../../common/dto/pagination/page-info.dto';
import { ContestEntryDto, ContestInfoDto } from './contest-entry.dto';

export class HallOfFameItemDto {
    @ApiProperty({ description: '콘테스트 ID' })
    contestId: string;

    @ApiProperty({ description: '콘테스트 제목' })
    contestTitle: string;

    @ApiProperty({ description: '콘테스트 시작일 ISO' })
    startDate: string;

    @ApiProperty({ description: '콘테스트 종료일 ISO' })
    endDate: string;

    @ApiProperty({ description: '우승자 항목', type: ContestEntryDto })
    winner: ContestEntryDto;
}

/**
 * 명예의 전당 목록 응답.
 * 플랫폼 표준 페이지네이션 계약(`data: { items, pagination }`)을 따른다.
 */
export class ContestHallOfFameResponseDto {
    @ApiProperty({ type: [HallOfFameItemDto] })
    items: HallOfFameItemDto[];

    @ApiProperty({ type: PageInfoDto })
    pagination: PageInfoDto;
}

export class ContestPreviousRankingResponseDto {
    @ApiProperty({ type: ContestInfoDto })
    contest: ContestInfoDto;

    @ApiProperty({ description: '저번 콘테스트 1~3위', type: [ContestEntryDto] })
    ranking: ContestEntryDto[];
}
