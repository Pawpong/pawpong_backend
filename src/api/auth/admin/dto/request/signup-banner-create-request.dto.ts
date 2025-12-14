import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

/**
 * 회원가입 배너 생성 요청 DTO
 */
export class SignupBannerCreateRequestDto {
    @ApiProperty({
        description: '배너 이미지 파일명',
        example: 'signup-banners/abc123.png',
    })
    @IsString()
    @IsNotEmpty()
    imageFileName: string;

    @ApiProperty({
        description: '링크 타입 (internal: 내부 링크, external: 외부 링크)',
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
        description: '정렬 순서 (낮을수록 먼저 표시)',
        example: 0,
    })
    @IsNumber()
    @IsNotEmpty()
    order: number;

    @ApiProperty({
        description: '활성화 여부',
        example: true,
        default: true,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({
        description: '배너 제목 (관리용)',
        example: '브리더 회원가입 안내',
        required: false,
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({
        description: '배너 설명 (관리용)',
        example: '브리더 회원가입 페이지 배너',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;
}
