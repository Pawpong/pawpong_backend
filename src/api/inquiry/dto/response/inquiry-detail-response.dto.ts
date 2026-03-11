import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 답변 상세 DTO
 */
export class InquiryAnswerDto {
    @ApiProperty({ description: '브리더 이름', example: '골든레인 리트리버' })
    breederName: string;

    @ApiProperty({ description: '답변 작성 시간', example: '2025. 06. 15. 답변 작성' })
    answeredAt: string;

    @ApiProperty({ description: '답변 내용' })
    content: string;

    @ApiPropertyOptional({ description: '브리더 프로필 이미지 URL' })
    profileImageUrl?: string;
}

/**
 * 문의 상세 응답 DTO
 */
export class InquiryDetailResponseDto {
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

    @ApiProperty({ description: '답변 수', example: 2 })
    answerCount: number;

    @ApiProperty({ description: '작성일', example: '2025. 02. 15.' })
    createdAt: string;

    @ApiProperty({ description: '작성자 닉네임', example: '입양자 닉네임' })
    authorNickname: string;

    @ApiProperty({ description: '첨부 이미지 URL 배열', type: [String] })
    imageUrls: string[];

    @ApiProperty({ description: '답변 목록', type: [InquiryAnswerDto] })
    answers: InquiryAnswerDto[];
}
