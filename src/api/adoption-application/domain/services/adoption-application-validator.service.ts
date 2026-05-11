import { BadRequestException, Injectable } from '@nestjs/common';

import type { CreateAdoptionApplicationV2Command } from '../../application/types/adoption-application.type';

/**
 * v2 입양 신청 폼 입력 정합성 검증.
 *
 * Figma 122:3 의 필수 체크박스 / 텍스트 비어있음 / 가족 동의 미체크 케이스를 도메인 레벨에서 강제한다.
 * (class-validator 로 표현하기 어려운 cross-field 규칙)
 */
@Injectable()
export class AdoptionApplicationValidatorService {
    validate(command: CreateAdoptionApplicationV2Command): void {
        if (!command.privacyConsent) {
            throw new BadRequestException('개인정보 수집 및 이용에 동의해야 신청이 가능합니다.');
        }
        if (!command.basicCareConsent) {
            throw new BadRequestException('정기 예방접종/건강검진/훈련 등 기본 케어 가능 여부에 동의해야 합니다.');
        }
        if (!command.emergencyCareConsent) {
            throw new BadRequestException('예상치 못한 질병/사고 치료비 감당 가능 여부에 동의해야 합니다.');
        }
        if (!command.allFamilyConsent) {
            throw new BadRequestException('모든 가족 구성원의 입양 동의 체크가 필요합니다.');
        }

        const adoptionPlan = command.adoptionPlan?.trim() ?? '';
        if (adoptionPlan.length === 0) {
            throw new BadRequestException('입양 계획을 작성해 주세요.');
        }

        const familyMembers = command.familyMembers?.trim() ?? '';
        if (familyMembers.length === 0) {
            throw new BadRequestException('함께 거주하는 가족 구성원을 입력해 주세요.');
        }
    }
}
