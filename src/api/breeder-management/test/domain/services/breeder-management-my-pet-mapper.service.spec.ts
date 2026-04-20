import { BreederManagementMyPetMapperService } from '../../../domain/services/breeder-management-my-pet-mapper.service';

describe('BreederManagementMyPetMapperService', () => {
    const service = new BreederManagementMyPetMapperService();

    function makePet(overrides: any = {}): any {
        return {
            _id: 'p-1',
            name: '초코',
            breed: '푸들',
            gender: 'M',
            birthDate: new Date('2024-01-01'),
            price: 300000,
            status: 'available',
            isActive: true,
            photos: ['a.jpg', 'b.jpg'],
            viewCount: 50,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }

    it('petId는 pet.petId > _id 순으로 결정한다', () => {
        const result = service.toItem(makePet({ petId: 'custom-id' }), new Map());
        expect(result.petId).toBe('custom-id');
        const result2 = service.toItem(makePet(), new Map());
        expect(result2.petId).toBe('p-1');
    });

    it('applicationCountMap에서 count를 가져온다', () => {
        const result = service.toItem(makePet(), new Map([['p-1', 7]]));
        expect(result.applicationCount).toBe(7);
    });

    it('Map에 없으면 0', () => {
        const result = service.toItem(makePet(), new Map());
        expect(result.applicationCount).toBe(0);
    });

    it('birthDate가 잘못되면 ageInMonths는 0', () => {
        const result = service.toItem(makePet({ birthDate: 'invalid' }), new Map());
        expect(result.ageInMonths).toBe(0);
    });

    it('photos가 없으면 mainPhoto는 빈 문자열, photoCount는 0', () => {
        const result = service.toItem(makePet({ photos: undefined }), new Map());
        expect(result.mainPhoto).toBe('');
        expect(result.photoCount).toBe(0);
    });
});
