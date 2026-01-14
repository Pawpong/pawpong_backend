import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, MaxLength } from 'class-validator';

/**
 * 동영상 업로드 URL 요청 DTO
 */
export class UploadVideoRequestDto {
    /**
     * 동영상 제목
     */
    @ApiProperty({
        description: '동영상 제목',
        example: '귀여운 강아지 일상',
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty({ message: '제목을 입력해주세요.' })
    @MaxLength(100, { message: '제목은 100자 이하로 입력해주세요.' })
    title: string;

    /**
     * 동영상 설명
     */
    @ApiPropertyOptional({
        description: '동영상 설명',
        example: '우리집 말티즈의 귀여운 일상을 담았습니다.',
        maxLength: 1000,
    })
    @IsString()
    @IsOptional()
    @MaxLength(1000, { message: '설명은 1000자 이하로 입력해주세요.' })
    description?: string;

    /**
     * 해시태그 목록
     */
    @ApiPropertyOptional({
        description: '해시태그 목록',
        example: ['말티즈', '강아지', '일상'],
        type: [String],
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    tags?: string[];
}
