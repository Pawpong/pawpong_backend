import { ApiProperty } from '@nestjs/swagger';

import { ContestEntryDto } from './contest-entry.dto';

export class YesterdayTopEntryDto {
    @ApiProperty({ description: '순위 (1~3)' })
    rank: number;

    @ApiProperty({ type: ContestEntryDto })
    entry: ContestEntryDto;

    @ApiProperty({ description: '득표율 (0~100, 소수점 1자리)', example: 35.5 })
    voteRate: number;
}

export class ContestYesterdayTopResponseDto {
    @ApiProperty({ description: '콘테스트 ID' })
    contestId: string;

    @ApiProperty({ type: [YesterdayTopEntryDto] })
    ranking: YesterdayTopEntryDto[];
}
