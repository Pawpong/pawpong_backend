import { Injectable } from '@nestjs/common';

import type { AdopterApplicationCreateCommand } from '../../application/types/adopter-application-command.type';

@Injectable()
export class AdopterApplicationStandardResponseBuilderService {
    build(dto: AdopterApplicationCreateCommand): Record<string, any> {
        return {
            privacyConsent: dto.privacyConsent,
            selfIntroduction: dto.selfIntroduction,
            familyMembers: dto.familyMembers,
            allFamilyConsent: dto.allFamilyConsent,
            allergyTestInfo: dto.allergyTestInfo,
            timeAwayFromHome: dto.timeAwayFromHome,
            livingSpaceDescription: dto.livingSpaceDescription,
            previousPetExperience: dto.previousPetExperience,
            canProvideBasicCare: dto.canProvideBasicCare,
            canAffordMedicalExpenses: dto.canAffordMedicalExpenses,
            preferredPetDescription: dto.preferredPetDescription,
            desiredAdoptionTiming: dto.desiredAdoptionTiming,
            additionalNotes: dto.additionalNotes,
        };
    }
}
