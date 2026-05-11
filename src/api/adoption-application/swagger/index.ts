import { applyDecorators } from '@nestjs/common';

import { ApiController, ApiEndpoint } from '../../../common/decorator/swagger.decorator';
import { ADOPTION_APPLICATION_RESPONSE_MESSAGES } from '../constants/adoption-application-response-messages';
import { CreateAdoptionApplicationResponseDto } from '../dto/response/create-adoption-application-response.dto';

const PET_NOT_FOUND_RESPONSE = {
    status: 400,
    description: '분양 펫을 찾을 수 없거나 신청 불가 상태',
    errorExample: '해당 분양 펫을 찾을 수 없거나 신청할 수 없는 상태입니다.',
} as const;

const VALIDATION_ERROR_RESPONSE = {
    status: 400,
    description: '입력 검증 실패 (동의 필수, 텍스트 누락 등)',
    errorExample: '개인정보 수집 및 이용에 동의해야 신청이 가능합니다.',
} as const;

const CONFLICT_RESPONSE = {
    status: 409,
    description: '동일 adopter × pet 의 처리 중 신청이 이미 존재',
    errorExample: '이미 처리 중인 상담 신청이 있습니다.',
} as const;

export function ApiAdoptionApplicationProtectedController() {
    return ApiController('입양 신청 (v2)');
}

export function ApiCreateAdoptionApplicationEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '입양 신청서 제출 (v2)',
            description: `
                Figma 122:3 — v2 입양 신청 폼.

                ## 입력 요약
                - petId (필수): 분양 펫 ID
                - adoptionPlan / familyMembers (필수, 비어있을 수 없음)
                - 동의 4개 모두 true 필수: privacyConsent / basicCareConsent / emergencyCareConsent / allFamilyConsent

                ## 비즈니스 규칙
                - 분양 펫이 isActive=false 거나 status='adopted' 면 신청 불가 (400)
                - 동일 adopter × pet 의 처리 중(consultation_pending/consultation_completed) 신청 중복 시 409
                - 신규 신청은 항상 status='consultation_pending' 으로 시작

                ## 권한
                - JWT 인증 + StrictRolesGuard('adopter') — 브리더/관리자 호출 시 403
            `,
            responseType: CreateAdoptionApplicationResponseDto,
            successDescription: '입양 신청 접수 성공',
            successMessageExample: ADOPTION_APPLICATION_RESPONSE_MESSAGES.created,
            errorResponses: [VALIDATION_ERROR_RESPONSE, PET_NOT_FOUND_RESPONSE, CONFLICT_RESPONSE],
        }),
    );
}
