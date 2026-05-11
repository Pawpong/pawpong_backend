import { AdoptionApplicationPersistMapperService } from '../../../domain/services/adoption-application-persist-mapper.service';
import type {
    AdoptionApplicationContext,
    CreateAdoptionApplicationV2Command,
} from '../../../application/types/adoption-application.type';

const command: CreateAdoptionApplicationV2Command = {
    adopterId: 'a-1',
    petId: 'p-1',
    adoptionPlan: '  좋은 환경에서 키울 예정  ',
    familyMembers: '  배우자 1명, 자녀 1명  ',
    privacyConsent: true,
    basicCareConsent: true,
    emergencyCareConsent: true,
    allFamilyConsent: true,
};

const context: AdoptionApplicationContext = {
    breederId: 'b-1',
    petName: '레오파드 게코',
    adopterName: '홍길동',
    adopterEmail: 'h@test.com',
    adopterPhone: '010-1234-5678',
};

describe('AdoptionApplicationPersistMapperService', () => {
    const mapper = new AdoptionApplicationPersistMapperService();

    it('text trim 처리 + 동의 → StandardApplicationData 호환 형태로 변환', () => {
        const data = mapper.toPersistData(command, context);

        expect(data.standardResponses.adoptionPlan).toBe('좋은 환경에서 키울 예정');
        expect(data.standardResponses.familyMembers).toBe('배우자 1명, 자녀 1명');
        expect(data.standardResponses.canProvideBasicCare).toBe(true);
        expect(data.standardResponses.canAffordMedicalExpenses).toBe(true);
        expect(data.standardResponses.privacyConsent).toBe(true);
        expect(data.standardResponses.allFamilyConsent).toBe(true);
    });

    it('context 의 비정규화 필드 + status=consultation_pending 고정 + formVersion=v2 태깅', () => {
        const data = mapper.toPersistData(command, context);
        expect(data.breederId).toBe('b-1');
        expect(data.adopterId).toBe('a-1');
        expect(data.petId).toBe('p-1');
        expect(data.petName).toBe('레오파드 게코');
        expect(data.adopterName).toBe('홍길동');
        expect(data.status).toBe('consultation_pending');
        expect(data.formVersion).toBe('v2');
    });
});
