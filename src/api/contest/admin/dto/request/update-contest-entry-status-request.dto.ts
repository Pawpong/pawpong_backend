import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateContestEntryStatusRequestDto {
    @ApiProperty({
        description: '변경할 상태. hidden: 숨김 처리, deleted: 소프트 삭제',
        enum: ['hidden', 'deleted'],
        example: 'hidden',
    })
    @IsIn(['hidden', 'deleted'])
    status: 'hidden' | 'deleted';
}
