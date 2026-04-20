import { BreedAdminResultMapperService } from '../../../../domain/services/breed-admin-result-mapper.service';

describe('BreedAdminResultMapperService', () => {
    const service = new BreedAdminResultMapperService();

    it('snapshot을 result로 매핑한다', () => {
        const snapshot = {
            id: 'b-1',
            petType: 'dog',
            category: 'large',
            categoryDescription: '대형견',
            breeds: ['골든리트리버'],
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-02-01T00:00:00.000Z'),
        };
        expect(service.toResult(snapshot)).toEqual(snapshot);
    });
});
