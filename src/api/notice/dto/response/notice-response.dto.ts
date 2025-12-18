import { ApiProperty } from '@nestjs/swagger';

/**
 * 공지사항 응답 DTO
 */
export class NoticeResponseDto {
    /**
     * 공지사항 ID
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiProperty({
        description: '공지사항 ID',
        example: '507f1f77bcf86cd799439011',
    })
    noticeId: string;

    /**
     * 공지사항 제목
     * @example "펫퐁 서비스 업데이트 안내"
     */
    @ApiProperty({
        description: '공지사항 제목',
        example: '펫퐁 서비스 업데이트 안내',
    })
    title: string;

    /**
     * 공지사항 내용
     * @example "안녕하세요 펫퐁입니다..."
     */
    @ApiProperty({
        description: '공지사항 내용',
        example: '안녕하세요 펫퐁입니다...',
    })
    content: string;

    /**
     * 작성자 이름
     * @example "관리자"
     */
    @ApiProperty({
        description: '작성자 이름',
        example: '관리자',
    })
    authorName: string;

    /**
     * 공지사항 상태
     * @example "published"
     */
    @ApiProperty({
        description: '공지사항 상태',
        example: 'published',
        enum: ['published', 'draft', 'archived'],
    })
    status: 'published' | 'draft' | 'archived';

    /**
     * 중요 공지 여부
     * @example false
     */
    @ApiProperty({
        description: '중요 공지 여부',
        example: false,
    })
    isPinned: boolean;

    /**
     * 조회수
     * @example 150
     */
    @ApiProperty({
        description: '조회수',
        example: 150,
    })
    viewCount: number;

    /**
     * 게시 시작일
     * @example "2025-01-15T00:00:00.000Z"
     */
    @ApiProperty({
        description: '게시 시작일',
        example: '2025-01-15T00:00:00.000Z',
        required: false,
    })
    publishedAt?: string;

    /**
     * 게시 종료일
     * @example "2025-12-31T23:59:59.999Z"
     */
    @ApiProperty({
        description: '게시 종료일',
        example: '2025-12-31T23:59:59.999Z',
        required: false,
    })
    expiredAt?: string;

    /**
     * 생성일
     * @example "2025-01-14T10:30:00.000Z"
     */
    @ApiProperty({
        description: '생성일',
        example: '2025-01-14T10:30:00.000Z',
    })
    createdAt: string;

    /**
     * 수정일
     * @example "2025-01-14T10:30:00.000Z"
     */
    @ApiProperty({
        description: '수정일',
        example: '2025-01-14T10:30:00.000Z',
    })
    updatedAt: string;
}
