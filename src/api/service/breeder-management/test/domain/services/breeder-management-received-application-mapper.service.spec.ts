import { BreederManagementReceivedApplicationMapperService } from '../../../domain/services/breeder-management-received-application-mapper.service';

describe('BreederManagementReceivedApplicationMapperService', () => {
    const service = new BreederManagementReceivedApplicationMapperService();

    it('adopterId 객체에서 nickname과 _id를 추출한다', () => {
        const result = service.toItem({
            _id: 'app-1',
            adopterId: { _id: 'u-1', nickname: '닉' },
            adopterName: '이름',
            status: 'pending',
            standardResponses: {},
            appliedAt: new Date(),
        } as any);
        expect(result.adopterId).toBe('u-1');
        expect(result.adopterNickname).toBe('닉');
    });

    it('adopterId가 문자열이면 그대로 사용', () => {
        const result = service.toItem({
            _id: 'app-1',
            adopterId: 'u-1',
            status: 'pending',
            standardResponses: {},
            appliedAt: new Date(),
        } as any);
        expect(result.adopterId).toBe('u-1');
        expect(result.adopterNickname).toBe('알 수 없음');
    });

    it('preferredPetDescription은 preferredPetInfo에 담긴다', () => {
        const result = service.toItem({
            _id: 'app-1',
            status: 'pending',
            standardResponses: { preferredPetDescription: '작은 강아지' },
            appliedAt: new Date(),
        } as any);
        expect(result.preferredPetInfo).toBe('작은 강아지');
    });

    it('petId가 null/undefined면 undefined', () => {
        const result = service.toItem({
            _id: 'app-1',
            status: 'pending',
            standardResponses: {},
            appliedAt: new Date(),
            petId: null,
        } as any);
        expect(result.petId).toBeUndefined();
    });
});
