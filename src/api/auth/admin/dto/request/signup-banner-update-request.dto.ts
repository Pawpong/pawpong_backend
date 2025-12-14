import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional } from 'class-validator';

/**
 * 회원가입 배너 수정 요청 DTO
 */
export class SignupBannerUpdateRequestDto {
    @ApiProperty({
        description: '배너 이미지 파일명',
        example: 'signup-banners/abc123.png',
        required: false,
    })
    @IsString()
    @IsOptional()
    imageFileName?: string;

    @ApiProperty({
        description: '링크 타입',
        example: 'internal',
        enum: ['internal', 'external'],
        required: false,
    })
    @IsEnum(['internal', 'external'])
    @IsOptional()
    linkType?: string;

    @ApiProperty({
        description: '링크 URL',
        example: '/signup',
        required: false,
    })
    @IsString()
    @IsOptional()
    linkUrl?: string;

    @ApiProperty({
        description: '정렬 순서',
        example: 0,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    order?: number;

    @ApiProperty({
        description: '활성화 여부',
        example: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({
        description: '배너 제목',
        example: '브리더 회원가입 안내',
        required: false,
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({
        description: '배너 설명',
        example: '브리더 회원가입 페이지 배너',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;
}
