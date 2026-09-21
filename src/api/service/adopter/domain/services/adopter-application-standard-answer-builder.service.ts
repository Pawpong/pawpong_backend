import { Injectable } from '@nestjs/common';

import type { AdopterApplicationCreateCommand } from '../../application/types/adopter-application-command.type';
import type { AdopterApplicationStandardResponsesRecord } from '../../types/adopter-application.type';

/** 가입 시 저장해 둔 상담 사전 정보 (공통 신청서) */
export type CounselDefaultProfileFallback = {
    selfIntroduction?: string;
    dailyAbsenceHours?: string;
    livingSpaceDescription?: string;
};

const firstFilled = (...values: Array<string | undefined>): string => values.find((value) => value?.trim()) ?? '';

@Injectable()
export class AdopterApplicationStandardAnswerBuilderService {
    /**
     * 표준 문항 답변 조립.
     *
     * 신청 화면은 가입 때 사전 정보를 이미 작성한 사용자에게 같은 문항을 다시 묻지 않는다.
     * 그래서 요청 본문의 해당 필드가 비어 오는데, 그대로 저장하면 브리더가 받는 신청서에서
     * 항목이 사라진다 — 비어 있으면 프로필에 저장된 값으로 채운다.
     * 신청서는 제출 시점 값으로 확정돼야 하므로 참조가 아니라 복사한다.
     */
    build(
        dto: AdopterApplicationCreateCommand,
        counselDefaultProfile?: CounselDefaultProfileFallback,
    ): AdopterApplicationStandardResponsesRecord {
        return {
            privacyConsent: dto.privacyConsent,
            selfIntroduction: firstFilled(dto.selfIntroduction, counselDefaultProfile?.selfIntroduction),
            familyMembers: dto.familyMembers,
            allFamilyConsent: dto.allFamilyConsent,
            allergyTestInfo: dto.allergyTestInfo ?? '',
            timeAwayFromHome: firstFilled(dto.timeAwayFromHome, counselDefaultProfile?.dailyAbsenceHours),
            livingSpaceDescription: firstFilled(
                dto.livingSpaceDescription,
                counselDefaultProfile?.livingSpaceDescription,
            ),
            previousPetExperience: dto.previousPetExperience ?? '',
            canProvideBasicCare: dto.canProvideBasicCare,
            canAffordMedicalExpenses: dto.canAffordMedicalExpenses,
            preferredPetDescription: dto.preferredPetDescription,
            desiredAdoptionTiming: dto.desiredAdoptionTiming,
            additionalNotes: dto.additionalNotes,
        };
    }
}
