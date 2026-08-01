import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CommunityPostCommentUpdateRequestDto {
    @ApiProperty({ description: '수정할 댓글 본문 (1~1000자)', example: '수정된 댓글입니다.' })
    @IsString()
    @MinLength(1)
    @MaxLength(1000)
    body: string;
}
