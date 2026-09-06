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

    // 가입 때 사전 정보를 작성한 사용자에게는 신청 화면이 같은 문항을 다시 묻지 않아
    // 해당 필드가 비어서 들어온다 — 저장 값이 사라지지 않도록 프로필로 채운다.
    const counselDefaultProfile = {
        selfIntroduction: '프로필 자기소개',
        dailyAbsenceHours: '프로필 6시간',
        livingSpaceDescription: '프로필 24평',
    };

    const baseDto = {
        privacyConsent: true,
        familyMembers: 'f',
        allFamilyConsent: true,
        canProvideBasicCare: true,
        canAffordMedicalExpenses: true,
    };

    it('요청 값이 비면 상담 사전 정보로 채운다', () => {
        const result = service.build(
            { ...baseDto, selfIntroduction: '', timeAwayFromHome: '', livingSpaceDescription: undefined } as any,
            counselDefaultProfile,
        );

        expect(result.selfIntroduction).toBe('프로필 자기소개');
        expect(result.timeAwayFromHome).toBe('프로필 6시간');
        expect(result.livingSpaceDescription).toBe('프로필 24평');
    });

    it('요청 값이 있으면 상담 사전 정보보다 요청 값을 우선한다', () => {
        const result = service.build(
            {
                ...baseDto,
                selfIntroduction: '요청 자기소개',
                timeAwayFromHome: '요청 2시간',
                livingSpaceDescription: '요청 원룸',
            } as any,
            counselDefaultProfile,
        );

        expect(result.selfIntroduction).toBe('요청 자기소개');
        expect(result.timeAwayFromHome).toBe('요청 2시간');
        expect(result.livingSpaceDescription).toBe('요청 원룸');
    });

    it('둘 다 없으면 빈 문자열이다', () => {
        const result = service.build({ ...baseDto, selfIntroduction: '' } as any);

        expect(result.selfIntroduction).toBe('');
        expect(result.timeAwayFromHome).toBe('');
        expect(result.livingSpaceDescription).toBe('');
    });
});
