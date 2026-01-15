import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsMongoId } from 'class-validator';

/**
 * 댓글 작성 요청 DTO
 */
export class CreateCommentRequestDto {
    /**
     * 댓글 내용
     * @example "귀여운 강아지네요!"
     */
    @ApiProperty({
        description: '댓글 내용',
        example: '귀여운 강아지네요!',
        maxLength: 500,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    content: string;

    /**
     * 부모 댓글 ID (대댓글인 경우)
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiPropertyOptional({
        description: '부모 댓글 ID (대댓글인 경우)',
        example: '507f1f77bcf86cd799439011',
    })
    @IsOptional()
    @IsMongoId()
    parentId?: string;
}

/**
 * 댓글 수정 요청 DTO
 */
export class UpdateCommentRequestDto {
    /**
     * 수정할 댓글 내용
     * @example "수정된 댓글입니다"
     */
    @ApiProperty({
        description: '수정할 댓글 내용',
        example: '수정된 댓글입니다',
        maxLength: 500,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    content: string;
}
