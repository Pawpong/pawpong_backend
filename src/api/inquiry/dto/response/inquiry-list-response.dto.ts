import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 최신 답변 정보 (목록용)
 */
export class LatestAnswerDto {
    @ApiProperty({ description: '브리더 이름', example: '골든레인 리트리버' })
    breederName: string;

    @ApiProperty({ description: '답변 작성 시간', example: '2025. 06. 15. 답변 작성' })
    answeredAt: string;

    @ApiProperty({ description: '답변 내용', example: '리트리버는 점프력도 좋지만...' })
    content: string;

    @ApiPropertyOptional({ description: '브리더 프로필 이미지 URL' })
    profileImageUrl?: string;
}

/**
 * 문의 목록 아이템 DTO
 */
export class InquiryListItemDto {
    @ApiProperty({ description: '문의 ID' })
    id: string;

    @ApiProperty({ description: '질문 제목' })
    title: string;

    @ApiProperty({ description: '질문 내용' })
    content: string;

    @ApiProperty({ description: '질문 유형', enum: ['common', 'direct'] })
    type: 'common' | 'direct';

    @ApiProperty({ description: '반려동물 종류', enum: ['dog', 'cat'] })
    animalType: 'dog' | 'cat';

    @ApiProperty({ description: '조회수', example: 42 })
    viewCount: number;

    @ApiProperty({ description: '답변 수', example: 3 })
    answerCount: number;

    @ApiPropertyOptional({ description: '최신 답변', type: LatestAnswerDto })
    latestAnswer?: LatestAnswerDto;

    @ApiProperty({ description: '작성일', example: '2025-06-10' })
    createdAt: string;
}

/**
 * 문의 목록 응답 DTO (무한 스크롤용)
 */
export class InquiryListResponseDto {
    @ApiProperty({ description: '문의 목록', type: [InquiryListItemDto] })
    data: InquiryListItemDto[];

    @ApiProperty({ description: '다음 페이지 존재 여부', example: true })
    hasMore: boolean;
}
