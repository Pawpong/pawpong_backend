import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsEnum, IsDateString } from 'class-validator';

/**
 * 공지사항 생성 요청 DTO
 */
export class NoticeCreateRequestDto {
    /**
     * 공지사항 제목
     * @example "펫퐁 서비스 업데이트 안내"
     */
    @ApiProperty({
        description: '공지사항 제목',
        example: '펫퐁 서비스 업데이트 안내',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    /**
     * 공지사항 내용
     * @example "안녕하세요 펫퐁입니다. 다음과 같이 서비스가 업데이트됩니다..."
     */
    @ApiProperty({
        description: '공지사항 내용',
        example: '안녕하세요 펫퐁입니다. 다음과 같이 서비스가 업데이트됩니다...',
    })
    @IsString()
    @IsNotEmpty()
    content: string;

    /**
     * 공지사항 상태
     * @example "published"
     */
    @ApiProperty({
        description: '공지사항 상태',
        example: 'published',
        enum: ['published', 'draft', 'archived'],
        default: 'published',
    })
    @IsEnum(['published', 'draft', 'archived'])
    @IsOptional()
    status?: 'published' | 'draft' | 'archived';

    /**
     * 중요 공지 여부 (상단 고정)
     * @example false
     */
    @ApiProperty({
        description: '중요 공지 여부 (상단 고정)',
        example: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    isPinned?: boolean;

    /**
     * 게시 시작일 (선택)
     * @example "2025-01-15T00:00:00.000Z"
     */
    @ApiProperty({
        description: '게시 시작일 (선택)',
        example: '2025-01-15T00:00:00.000Z',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    publishedAt?: string;

    /**
     * 게시 종료일 (선택)
     * @example "2025-12-31T23:59:59.999Z"
     */
    @ApiProperty({
        description: '게시 종료일 (선택)',
        example: '2025-12-31T23:59:59.999Z',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    expiredAt?: string;
}
