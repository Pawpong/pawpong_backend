import { ApiProperty } from '@nestjs/swagger';

import { ContestEntryDto } from './contest-entry.dto';

export class ContestWeeklyTopResponseDto {
    @ApiProperty({ description: 'ISO 8601 주차 키 (예: "2026-W21")', example: '2026-W21' })
    weekKey: string;

    @ApiProperty({ type: [ContestEntryDto], description: '지난주 voteCount 기준 TOP 3 항목' })
    topEntries: ContestEntryDto[];

    @ApiProperty({ description: '집계 기준 시각 ISO (해당 콘테스트 종료일)', example: '2026-05-24T23:59:59.000Z' })
    calculatedAt: string;
}
