import { ApiProperty } from '@nestjs/swagger';

import { ContestEntryDto, ContestInfoDto } from './contest-entry.dto';

export class ContestCurrentResponseDto {
    @ApiProperty({ type: ContestInfoDto })
    contest: ContestInfoDto;

    @ApiProperty({ description: '현재 실시간 1~3위', type: [ContestEntryDto] })
    ranking: ContestEntryDto[];

    @ApiProperty({ description: '내가 투표한 항목 ID (미로그인/미투표 시 null)', nullable: true })
    myVotedEntryId: string | null;

    @ApiProperty({ description: '내가 이미 참여했는지 여부' })
    hasEntry: boolean;
}
