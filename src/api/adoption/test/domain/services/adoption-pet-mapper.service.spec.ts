import { AdoptionPetMapperService } from '../../../domain/services/adoption-pet-mapper.service';

describe('AdoptionPetMapperService', () => {
    const service = new AdoptionPetMapperService();

    const baseSnapshot = {
        id: 'pet-1',
        breederId: 'breeder-1',
        name: '테스트 동물',
        breed: '비숑',
        petType: 'dog' as const,
        gender: 'male' as const,
        birthDate: new Date('2025-01-15'),
        price: 1500000,
        status: 'available' as const,
        photos: ['photos/a.jpg'],
        inquiryCount: 1,
        favoriteCount: 5,
        viewCount: 20,
        createdAt: new Date('2025-02-01'),
        updatedAt: new Date('2025-02-01'),
    };

    it('favoriteCount < 임계치 + forcePopular=undefined 이면 isPopular=false', () => {
        const result = service.toItem({ ...baseSnapshot, favoriteCount: 5 }, ['url'], false);
        expect(result.isPopular).toBe(false);
    });

    it('favoriteCount >= 10 이면 isPopular=true 로 자동 표시', () => {
        const result = service.toItem({ ...baseSnapshot, favoriteCount: 10 }, ['url'], false);
        expect(result.isPopular).toBe(true);
    });

    it('forcePopular=true 면 favoriteCount 와 무관하게 isPopular=true', () => {
        const result = service.toItem({ ...baseSnapshot, favoriteCount: 0 }, ['url'], false, true);
        expect(result.isPopular).toBe(true);
    });

    it('photoUrls 의 첫 번째가 primaryPhotoUrl 로 매핑된다', () => {
        const result = service.toItem(baseSnapshot, ['url-a', 'url-b'], false);
        expect(result.primaryPhotoUrl).toBe('url-a');
        expect(result.photoUrls).toEqual(['url-a', 'url-b']);
    });

    it('photoUrls 가 비어있으면 primaryPhotoUrl 은 빈 문자열', () => {
        const result = service.toItem(baseSnapshot, [], false);
        expect(result.primaryPhotoUrl).toBe('');
    });

    it('birthDate 가 12개월 미만이면 "n개월" 으로 표시', () => {
        const recentBirth = new Date();
        recentBirth.setMonth(recentBirth.getMonth() - 6);
        const result = service.toItem({ ...baseSnapshot, birthDate: recentBirth }, ['url'], false);
        expect(result.ageDescription).toContain('개월');
    });

    it('isFavorited 값이 응답에 그대로 반영된다', () => {
        const result = service.toItem(baseSnapshot, ['url'], true);
        expect(result.isFavorited).toBe(true);
    });
});
