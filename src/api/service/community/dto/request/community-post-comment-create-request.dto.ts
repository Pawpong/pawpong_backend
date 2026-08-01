import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CommunityPostCommentCreateRequestDto {
    @ApiProperty({ description: '댓글 본문 (1~1000자)', example: '너무 귀엽네요!' })
    @IsString()
    @MinLength(1)
    @MaxLength(1000)
    body: string;

    @ApiPropertyOptional({
        description: '답글 대상 댓글 ID (없으면 최상위 댓글)',
        example: '507f1f77bcf86cd799439044',
    })
    @IsOptional()
    @IsString()
    parentCommentId?: string;
}
