import { AdopterApplicationStandardAnswerBuilderService } from '../../../domain/services/adopter-application-standard-answer-builder.service';

describe('AdopterApplicationStandardAnswerBuilderService', () => {
    const service = new AdopterApplicationStandardAnswerBuilderService();

    it('표준 응답 필드를 dto에서 추출한다', () => {
        const result = service.build({
            privacyConsent: true,
            selfIntroduction: '자기소개',
            familyMembers: '부모',
            allFamilyConsent: true,
            allergyTestInfo: '없음',
            timeAwayFromHome: '2h',
            livingSpaceDescription: 'apt',
            previousPetExperience: 'no',
            canProvideBasicCare: true,
            canAffordMedicalExpenses: true,
            preferredPetDescription: 'cute',
            desiredAdoptionTiming: 'now',
            additionalNotes: 'notes',
        } as any);

        expect(result.privacyConsent).toBe(true);
        expect(result.additionalNotes).toBe('notes');
    });

    it('선택 필드가 undefined면 그대로 undefined를 포함한다', () => {
        const result = service.build({
            privacyConsent: true,
            selfIntroduction: 's',
            familyMembers: 'f',
            allFamilyConsent: false,
            allergyTestInfo: 'a',
            timeAwayFromHome: 't',
            livingSpaceDescription: 'l',
            previousPetExperience: 'p',
            canProvideBasicCare: true,
            canAffordMedicalExpenses: true,
        } as any);
        expect(result.preferredPetDescription).toBeUndefined();
        expect(result.desiredAdoptionTiming).toBeUndefined();
    });
});
