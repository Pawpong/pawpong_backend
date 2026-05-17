import { ApiProperty } from '@nestjs/swagger';

import { ContestEntryDto } from './contest-entry.dto';

export class ContestEntriesResponseDto {
    @ApiProperty({ type: [ContestEntryDto] })
    items: ContestEntryDto[];

    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;
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
