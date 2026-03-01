import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, MaxLength, ArrayMaxSize } from 'class-validator';

/**
 * 문의 작성 요청 DTO
 */
export class InquiryCreateRequestDto {
    /**
     * 질문 제목
     */
    @ApiProperty({ description: '질문 제목', example: '리트리버 입양 전 마당 펜스 높이 관련 질문입니다' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    /**
     * 질문 내용
     */
    @ApiProperty({
        description: '질문 내용',
        example: '아이와 함께 자랄 대형견을 찾다가 리트리버 입양을 결정했습니다...',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(5000)
    content: string;

    /**
     * 질문 유형 (common: 공통질문, direct: 1:1질문)
     */
    @ApiProperty({ description: '질문 유형', enum: ['common', 'direct'], example: 'common' })
    @IsEnum(['common', 'direct'])
    type: 'common' | 'direct';

    /**
     * 반려동물 종류
     */
    @ApiProperty({ description: '반려동물 종류', enum: ['dog', 'cat'], example: 'dog' })
    @IsEnum(['dog', 'cat'])
    animalType: 'dog' | 'cat';

    /**
     * 1:1 질문 대상 브리더 ID (type이 direct인 경우 필수)
     */
    @ApiPropertyOptional({ description: '1:1 질문 대상 브리더 ID', example: '507f1f77bcf86cd799439011' })
    @IsString()
    @IsOptional()
    targetBreederId?: string;

    /**
     * 첨부 이미지 URL 배열 (최대 4장)
     */
    @ApiPropertyOptional({ description: '첨부 이미지 URL 배열 (최대 4장)', type: [String] })
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(4)
    @IsOptional()
    imageUrls?: string[];
}

/**
 * 문의 수정 요청 DTO
 */
export class InquiryUpdateRequestDto {
    /**
     * 질문 제목
     */
    @ApiPropertyOptional({ description: '질문 제목', example: '수정된 질문 제목입니다' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    @IsOptional()
    title?: string;

    /**
     * 질문 내용
     */
    @ApiPropertyOptional({
        description: '질문 내용',
        example: '수정된 질문 내용입니다...',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(5000)
    @IsOptional()
    content?: string;

    /**
     * 첨부 이미지 URL 배열 (최대 4장)
     */
    @ApiPropertyOptional({ description: '첨부 이미지 URL 배열 (최대 4장)', type: [String] })
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(4)
    @IsOptional()
    imageUrls?: string[];
}

/**
 * 답변 작성 요청 DTO
 */
export class InquiryAnswerCreateRequestDto {
    /**
     * 답변 내용
     */
    @ApiProperty({
        description: '답변 내용',
        example: '리트리버는 점프력도 좋지만, 호기심이 많아 담장 너머를 보려다 사고가 나기 쉽습니다...',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(5000)
    content: string;
}
