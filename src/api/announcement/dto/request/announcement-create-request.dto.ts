import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 공지사항 생성 요청 DTO
 * 관리자만 사용 가능
 */
export class AnnouncementCreateRequestDto {
    /**
     * 공지사항 제목
     * @example "2025년 1월 서비스 업데이트 안내"
     */
    @ApiProperty({
        description: '공지사항 제목',
        example: '2025년 1월 서비스 업데이트 안내',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    /**
     * 공지사항 내용
     * @example "안녕하세요, Pawpong입니다. 2025년 1월 서비스 업데이트 사항을 안내드립니다..."
     */
    @ApiProperty({
        description: '공지사항 내용',
        example: '안녕하세요, Pawpong입니다. 2025년 1월 서비스 업데이트 사항을 안내드립니다...',
    })
    @IsString()
    @IsNotEmpty()
    content: string;

    /**
     * 활성화 여부
     * @example true
     */
    @ApiProperty({
        description: '활성화 여부 (true: 노출, false: 비활성화)',
        example: true,
        required: false,
        default: true,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    /**
     * 정렬 순서
     * @example 0
     */
    @ApiProperty({
        description: '정렬 순서 (낮은 숫자가 먼저 표시됨)',
        example: 0,
        required: false,
        default: 0,
    })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    order?: number;
}
