import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { ApiEndpoint, ApiPublicController } from '../../../common/decorator/swagger.decorator';
import { InquiryCreateRequestDto, InquiryAnswerCreateRequestDto, InquiryUpdateRequestDto } from '../dto/request/inquiry-create-request.dto';
import { InquiryCreateResponseDto } from '../dto/response/inquiry-create-response.dto';
import { InquiryDetailResponseDto } from '../dto/response/inquiry-detail-response.dto';
import { InquiryListResponseDto } from '../dto/response/inquiry-list-response.dto';
import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../domain/services/inquiry-response-message.service';

const INQUIRY_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '해당 문의에 접근할 권한이 없습니다.',
};

const INQUIRY_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '문의를 찾을 수 없음',
    errorExample: '문의를 찾을 수 없습니다.',
};

export function ApiInquiryController() {
    return ApiPublicController('문의');
}

export function ApiGetMyInquiriesEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '내 문의 목록 조회',
            description: `
                입양자 본인이 작성한 문의 목록을 조회합니다.

                ## 주요 기능
                - common/direct 문의를 모두 포함합니다.
                - animalType으로 강아지/고양이 문의를 필터링할 수 있습니다.
                - 잘못된 page, limit 값은 기존 계약대로 기본값으로 처리됩니다.
            `,
            responseType: InquiryListResponseDto,
            successDescription: '내 문의 목록 조회 성공',
            successMessageExample: INQUIRY_RESPONSE_MESSAGE_EXAMPLES.myInquiriesRetrieved,
            errorResponses: [INQUIRY_FORBIDDEN_RESPONSE],
        }),
        ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지 크기', example: 15 }),
        ApiQuery({
            name: 'animalType',
            required: false,
            enum: ['dog', 'cat'],
            description: '동물 종류 필터',
            example: 'dog',
        }),
    );
}

export function ApiGetBreederInquiriesEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '브리더 문의 목록 조회',
            description: `
                브리더에게 들어온 1:1 문의 목록을 조회합니다.

                ## 주요 기능
                - answered=true면 답변 완료 목록을 조회합니다.
                - answered=false면 미답변 목록을 조회합니다.
                - 잘못된 page, limit 값은 기존 계약대로 기본값으로 처리됩니다.
            `,
            responseType: InquiryListResponseDto,
            successDescription: '브리더 문의 목록 조회 성공',
            successMessageExample: INQUIRY_RESPONSE_MESSAGE_EXAMPLES.breederInquiriesRetrieved,
            errorResponses: [INQUIRY_FORBIDDEN_RESPONSE],
        }),
        ApiQuery({
            name: 'answered',
            required: false,
            type: Boolean,
            description: '답변 완료 여부',
            example: false,
        }),
        ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지 크기', example: 15 }),
    );
}

export function ApiGetInquiryListEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '문의 목록 조회',
            description: `
                공개 공통 문의 목록을 조회합니다.

                ## 주요 기능
                - 인증 없이 조회할 수 있습니다.
                - animalType으로 강아지/고양이 문의를 필터링할 수 있습니다.
                - sort는 latest_answer, latest, most_viewed를 지원합니다.
                - 잘못된 page, limit 값은 기존 계약대로 기본값으로 처리됩니다.
            `,
            responseType: InquiryListResponseDto,
            isPublic: true,
            successDescription: '문의 목록 조회 성공',
            successMessageExample: INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryListRetrieved,
        }),
        ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지 크기', example: 15 }),
        ApiQuery({
            name: 'animalType',
            required: false,
            enum: ['dog', 'cat'],
            description: '동물 종류 필터',
            example: 'cat',
        }),
        ApiQuery({
            name: 'sort',
            required: false,
            enum: ['latest_answer', 'latest', 'most_viewed'],
            description: '정렬 기준',
            example: 'latest_answer',
        }),
    );
}

export function ApiGetInquiryDetailEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '문의 상세 조회',
            description: `
                문의 상세 정보와 답변 목록을 조회합니다.

                ## 주요 기능
                - 조회 시 조회수가 1 증가합니다.
                - 공통 문의는 누구나 조회할 수 있습니다.
                - 1:1 문의는 작성자 또는 대상 브리더만 조회할 수 있습니다.
            `,
            responseType: InquiryDetailResponseDto,
            isPublic: true,
            successDescription: '문의 상세 조회 성공',
            successMessageExample: INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDetailRetrieved,
            errorResponses: [INQUIRY_FORBIDDEN_RESPONSE, INQUIRY_NOT_FOUND_RESPONSE],
        }),
    );
}

export function ApiCreateInquiryEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '문의 작성',
            description: `
                입양자가 새로운 문의를 작성합니다.

                ## 주요 기능
                - common(공통) 또는 direct(1:1) 문의를 생성할 수 있습니다.
                - direct 문의는 targetBreederId가 필요합니다.
                - 첨부 이미지는 최대 4장까지 지원합니다.
            `,
            responseType: InquiryCreateResponseDto,
            successDescription: '문의 작성 성공',
            successMessageExample: INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryCreated,
            additionalModels: [InquiryCreateRequestDto],
            errorResponses: [INQUIRY_FORBIDDEN_RESPONSE, INQUIRY_NOT_FOUND_RESPONSE],
        }),
    );
}

export function ApiUpdateInquiryEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '문의 수정',
            description: `
                작성자 본인이 문의를 수정합니다.

                ## 주요 기능
                - 답변이 달린 문의는 수정할 수 없습니다.
                - 제목, 내용, 첨부 이미지 목록을 수정할 수 있습니다.
            `,
            successDescription: '문의 수정 성공',
            successMessageExample: INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryUpdated,
            nullableData: true,
            additionalModels: [InquiryUpdateRequestDto],
            errorResponses: [INQUIRY_FORBIDDEN_RESPONSE, INQUIRY_NOT_FOUND_RESPONSE],
        }),
    );
}

export function ApiDeleteInquiryEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '문의 삭제',
            description: `
                작성자 본인이 문의를 삭제합니다.

                ## 주요 기능
                - 답변이 달린 문의는 삭제할 수 없습니다.
                - 삭제 후 응답 데이터는 null로 반환됩니다.
            `,
            successDescription: '문의 삭제 성공',
            successMessageExample: INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDeleted,
            nullableData: true,
            errorResponses: [INQUIRY_FORBIDDEN_RESPONSE, INQUIRY_NOT_FOUND_RESPONSE],
        }),
    );
}

export function ApiCreateInquiryAnswerEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '답변 작성',
            description: `
                브리더가 문의에 답변을 작성합니다.

                ## 주요 기능
                - 1:1 문의는 대상 브리더만 답변할 수 있습니다.
                - 답변 첨부 이미지는 최대 4장까지 지원합니다.
                - 성공 시 응답 데이터는 null로 반환됩니다.
            `,
            successDescription: '답변 작성 성공',
            successMessageExample: INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryAnswerCreated,
            nullableData: true,
            additionalModels: [InquiryAnswerCreateRequestDto],
            errorResponses: [INQUIRY_FORBIDDEN_RESPONSE, INQUIRY_NOT_FOUND_RESPONSE],
        }),
    );
}
