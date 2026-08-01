import { ApiProperty } from '@nestjs/swagger';

export class CommunityPostDeleteResponseDto {
    @ApiProperty({ description: '소프트 삭제 완료', example: true })
    deleted: true;
}
