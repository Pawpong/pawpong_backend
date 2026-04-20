import { BreederPublicPetDetailAssemblerService } from '../../../domain/services/breeder-public-pet-detail-assembler.service';

describe('BreederPublicPetDetailAssemblerService', () => {
    const service = new BreederPublicPetDetailAssemblerService();

    it('부모 정보가 있으면 father/mother를 구성한다', () => {
        const pet = {
            _id: { toString: () => 'p-1' },
            name: '초코',
            breed: '푸들',
            gender: 'M',
            birthDate: new Date(),
            price: 300000,
            status: 'available',
            photos: ['p.jpg'],
            vaccinations: [],
            healthRecords: [],
            parentInfo: {
                father: { _id: { toString: () => 'f-1' }, name: '아빠', breed: '푸들', photos: ['f.jpg'] },
                mother: { _id: { toString: () => 'm-1' }, name: '엄마', breed: '푸들', photos: [] },
            },
            createdAt: new Date(),
        } as any;
        const result = service.toResponse(pet);
        expect(result.father?.petId).toBe('f-1');
        expect(result.father?.photo).toBe('f.jpg');
        expect(result.mother?.photo).toBe('');
    });

    it('부모 정보가 없으면 undefined', () => {
        const pet = {
            _id: { toString: () => 'p-1' },
            name: '초코',
            breed: '푸들',
            gender: 'M',
            birthDate: new Date(),
            price: 100,
            status: 'available',
            createdAt: new Date(),
        } as any;
        const result = service.toResponse(pet);
        expect(result.father).toBeUndefined();
        expect(result.mother).toBeUndefined();
        expect(result.photos).toEqual([]);
    });
});
