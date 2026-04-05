import { Injectable } from '@nestjs/common';

import { ApplicationCreateRequestDto } from '../../dto/request/application-create-request.dto';

@Injectable()
export class AdopterApplicationStandardResponseBuilderService {
    build(dto: ApplicationCreateRequestDto): Record<string, any> {
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
