import { Injectable } from '@nestjs/common';

import type {
    AdoptionApplicationContext,
    AdoptionApplicationPersistData,
    CreateAdoptionApplicationV2Command,
} from '../../application/types/adoption-application.type';

/**
 * v2 입양 신청 — command + context → persist data 매퍼.
 *
 * trim 처리 후 StandardApplicationData 호환 형태로 변환한다.
 */
@Injectable()
export class AdoptionApplicationPersistMapperService {
    toPersistData(
        command: CreateAdoptionApplicationV2Command,
        context: AdoptionApplicationContext,
    ): AdoptionApplicationPersistData {
        return {
            breederId: context.breederId,
            adopterId: command.adopterId,
            adopterName: context.adopterName,
            adopterEmail: context.adopterEmail,
            adopterPhone: context.adopterPhone,
            petId: command.petId,
            petName: context.petName,
            status: 'consultation_pending',
            formVersion: 'v2',
            standardResponses: {
                privacyConsent: command.privacyConsent,
                familyMembers: command.familyMembers.trim(),
                allFamilyConsent: command.allFamilyConsent,
                canProvideBasicCare: command.basicCareConsent,
                canAffordMedicalExpenses: command.emergencyCareConsent,
                adoptionPlan: command.adoptionPlan.trim(),
            },
        };
    }
}
