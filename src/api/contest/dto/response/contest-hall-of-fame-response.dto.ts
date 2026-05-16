import { ApiProperty } from '@nestjs/swagger';

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

export class ContestHallOfFameResponseDto {
    @ApiProperty({ type: [HallOfFameItemDto] })
    items: HallOfFameItemDto[];

    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;
}

export class ContestPreviousRankingResponseDto {
    @ApiProperty({ type: ContestInfoDto })
    contest: ContestInfoDto;

    @ApiProperty({ description: '저번 콘테스트 1~3위', type: [ContestEntryDto] })
    ranking: ContestEntryDto[];
}
