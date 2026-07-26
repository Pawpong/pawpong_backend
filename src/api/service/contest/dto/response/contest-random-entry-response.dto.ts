import { ApiProperty } from '@nestjs/swagger';

import { ContestEntryDto } from './contest-entry.dto';

export class ContestRandomEntryResponseDto {
    @ApiProperty({
        description: '랜덤 투표 후보 항목. 후보 없음 또는 이미 투표한 경우 null',
        type: ContestEntryDto,
        nullable: true,
    })
    entry: ContestEntryDto | null;

    @ApiProperty({ description: '이번 콘테스트에서 이미 투표 완료 여부' })
    alreadyVoted: boolean;
}
