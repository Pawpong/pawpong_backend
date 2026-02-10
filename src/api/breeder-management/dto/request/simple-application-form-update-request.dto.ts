import { IsArray, IsString, ValidateNested, ArrayMaxSize, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 간소화된 커스텀 질문 DTO
 * 프론트엔드에서 질문 텍스트만 입력받는 경우
 */
export class SimpleCustomQuestionDto {
    /**
     * 질문 내용
     * @example "방문 가능한 시간대를 알려주세요"
     */
    @ApiProperty({
        description: '질문 내용 (최소 2자, 최대 200자)',
        example: '방문 가능한 시간대를 알려주세요',
        minLength: 2,
        maxLength: 200,
    })
    @IsString({ message: '질문은 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '질문 내용을 입력해주세요.' })
    @MinLength(2, { message: '질문은 최소 2자 이상이어야 합니다.' })
    @MaxLength(200, { message: '질문은 최대 200자까지 입력 가능합니다.' })
    question: string;
}

/**
 * 간소화된 입양 신청 폼 수정 요청 DTO
 *
 * 질문 텍스트만 받아서 자동으로 기본값 설정:
 * - type: 'textarea' (고정)
 * - required: false (선택)
 * - id: 자동 생성 (custom_timestamp_index)
 * - order: 배열 순서
 *
 * **제한사항:**
 * - 최대 5개까지만 추가 가능
 * - 질문당 최소 2자, 최대 200자
 */
export class SimpleApplicationFormUpdateRequestDto {
    /**
     * 커스텀 질문 배열 (최대 5개)
     */
    @ApiProperty({
        description: '커스텀 질문 배열 (최대 5개, 질문당 2~200자)',
        type: [SimpleCustomQuestionDto],
        maxItems: 5,
        example: [
            { question: '방문 가능한 시간대를 알려주세요' },
            { question: '선호하는 반려동물의 성격을 알려주세요' },
        ],
    })
    @IsArray({ message: '질문 배열 형식이 올바르지 않습니다.' })
    @ArrayMaxSize(5, { message: '커스텀 질문은 최대 5개까지만 추가할 수 있습니다.' })
    @ValidateNested({ each: true })
    @Type(() => SimpleCustomQuestionDto)
    questions: SimpleCustomQuestionDto[];
}
