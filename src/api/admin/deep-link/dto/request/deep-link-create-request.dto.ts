import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';
import { DEEP_LINK_SLUG_PATTERN } from '../../../../service/deep-link/domain/services/deep-link-policy';

/** HTTP 입력만 담당하며 URL과 텍스트 정책은 도메인에서 다시 검증한다. */
export class DeepLinkCreateRequestDto {
    @ApiPropertyOptional({ description: '생략 시 자동 생성, 고유 슬러그', maxLength: 80 })
    @ValidateIf((_object, value) => value !== undefined)
    @IsString()
    @MaxLength(80)
    @Matches(DEEP_LINK_SLUG_PATTERN)
    slug?: string;

    @ApiProperty({ description: '공유 페이지 제목', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    title: string;

    @ApiPropertyOptional({ description: '공유 페이지 설명', default: '', maxLength: 500 })
    @ValidateIf((_object, value) => value !== undefined)
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiProperty({ description: 'Pawpong 앱 내부 경로', example: '/explore', maxLength: 500 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    targetPath: string;

    @ApiPropertyOptional({ description: 'HTTPS 이미지 URL 또는 빈 문자열', default: '', maxLength: 2048 })
    @ValidateIf((_object, value) => value !== undefined)
    @IsString()
    @MaxLength(2048)
    imageUrl?: string;

    @ApiPropertyOptional({ description: '공개 조회 허용 여부', default: true })
    @ValidateIf((_object, value) => value !== undefined)
    @IsBoolean()
    isActive?: boolean;
}

/** PUT 요청은 전달된 필드만 변경하며 null은 허용하지 않는다. */
export class DeepLinkUpdateRequestDto extends PartialType(DeepLinkCreateRequestDto, { skipNullProperties: false }) {}
