import { ApiProperty } from '@nestjs/swagger';

/**
 * 공지사항 응답 DTO
 * 공개 API 및 관리자 API에서 사용
 */
export class AnnouncementResponseDto {
    /**
     * 공지사항 고유 ID
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiProperty({
        description: '공지사항 고유 ID',
        example: '507f1f77bcf86cd799439011',
    })
    announcementId: string;

    /**
     * 공지사항 제목
     * @example "2025년 1월 서비스 업데이트 안내"
     */
    @ApiProperty({
        description: '공지사항 제목',
        example: '2025년 1월 서비스 업데이트 안내',
    })
    title: string;

    /**
     * 공지사항 내용
     * @example "안녕하세요, Pawpong입니다. 2025년 1월 서비스 업데이트 사항을 안내드립니다..."
     */
    @ApiProperty({
        description: '공지사항 내용',
        example: '안녕하세요, Pawpong입니다. 2025년 1월 서비스 업데이트 사항을 안내드립니다...',
    })
    content: string;

    /**
     * 활성화 여부
     * @example true
     */
    @ApiProperty({
        description: '활성화 여부 (true: 노출, false: 비활성화)',
        example: true,
    })
    isActive: boolean;

    /**
     * 정렬 순서
     * @example 0
     */
    @ApiProperty({
        description: '정렬 순서 (낮은 숫자가 먼저 표시됨)',
        example: 0,
    })
    order: number;

    /**
     * 등록 일시
     * @example "2025-01-15T10:30:00.000Z"
     */
    @ApiProperty({
        description: '등록 일시',
        example: '2025-01-15T10:30:00.000Z',
    })
    createdAt: Date;

    /**
     * 수정 일시
     * @example "2025-01-15T15:45:00.000Z"
     */
    @ApiProperty({
        description: '수정 일시',
        example: '2025-01-15T15:45:00.000Z',
    })
    updatedAt: Date;
}
