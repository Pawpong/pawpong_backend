import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * 후기 답글 작성/수정 요청 DTO
 */
export class ReviewReplyRequestDto {
    /**
     * 답글 내용 (최대 800자)
     */
    @ApiProperty({
        description: '답글 내용',
        example: '소중한 후기 감사합니다. 행복한 반려생활 되시길 바랍니다!',
        maxLength: 800,
    })
    @IsString()
    @IsNotEmpty({ message: '답글 내용을 입력해주세요.' })
    @MaxLength(800, { message: '답글은 최대 800자까지 입력 가능합니다.' })
    content: string;
}
