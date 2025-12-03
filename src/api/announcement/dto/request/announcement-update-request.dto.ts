import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 공지사항 수정 요청 DTO
 * 관리자만 사용 가능
 */
export class AnnouncementUpdateRequestDto {
    /**
     * 공지사항 제목
     * @example "2025년 1월 서비스 업데이트 안내 (수정)"
     */
    @ApiProperty({
        description: '공지사항 제목',
        example: '2025년 1월 서비스 업데이트 안내 (수정)',
        required: false,
    })
    @IsString()
    @IsOptional()
    title?: string;

    /**
     * 공지사항 내용
     * @example "수정된 공지사항 내용입니다..."
     */
    @ApiProperty({
        description: '공지사항 내용',
        example: '수정된 공지사항 내용입니다...',
        required: false,
    })
    @IsString()
    @IsOptional()
    content?: string;

    /**
     * 활성화 여부
     * @example false
     */
    @ApiProperty({
        description: '활성화 여부 (true: 노출, false: 비활성화)',
        example: false,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    /**
     * 정렬 순서
     * @example 1
     */
    @ApiProperty({
        description: '정렬 순서 (낮은 숫자가 먼저 표시됨)',
        example: 1,
        required: false,
    })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    order?: number;
}
