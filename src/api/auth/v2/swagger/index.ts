import { applyDecorators } from '@nestjs/common';

import { ApiEndpoint, ApiPublicController } from '../../../../common/decorator/swagger.decorator';
import { RegisterAdopterV2RequestDto } from '../dto/request/register-adopter-v2-request.dto';
import { RegisterAdopterResponseDto } from '../../dto/response/register-adopter-response.dto';

export function ApiAuthV2Controller() {
    return ApiPublicController('인증 v2');
}

export function ApiRegisterAdopterV2Endpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '입양자 회원가입 v2',
            description: `
                v2 온보딩 시퀀스(계정 정보 → 회원 정보 → 간단한 조사 양식)의 마지막 단계에서 호출되는 가입 완료 API입니다.

                ## 추가 필드 (v1 대비)
                - realName: 실명 (상담 시 표시)
                - interestedBreedIds: 관심 품종 ID 배열
                - counselDefaultProfile: 첫 상담 prefill 용 사전 정보
                - termsAgreements: 활성 버전 기준 약관 동의 이력

                ## 부수 효과
                - 환영 알림 발행 (in-app, 알림톡, 이메일)
                - 토큰 발급 + Refresh 저장
            `,
            responseType: RegisterAdopterResponseDto,
            isPublic: true,
            successDescription: '입양자 회원가입 성공',
            successMessageExample: '입양자 회원가입이 완료되었습니다.',
        }),
    );
}

export { RegisterAdopterV2RequestDto };
