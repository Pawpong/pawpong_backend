import { AdopterFavoriteRecordMapperService } from '../../../domain/services/adopter-favorite-record-mapper.service';

describe('AdopterFavoriteRecordMapperService', () => {
    const service = new AdopterFavoriteRecordMapperService();

    it('브리더 정보로 즐겨찾기 레코드를 생성한다', () => {
        const breeder = {
            name: '브리더A',
            profileImageFileName: 'img.png',
            profile: { location: { city: '서울', district: '강남구' } },
        } as any;
        const result = service.toRecord('b-1', breeder);
        expect(result.favoriteBreederId).toBe('b-1');
        expect(result.breederName).toBe('브리더A');
        expect(result.breederProfileImageUrl).toBe('img.png');
        expect(result.breederLocation).toBe('서울 강남구');
        expect(result.addedAt).toBeInstanceOf(Date);
    });

    it('profileImageFileName/location이 없으면 빈 문자열', () => {
        const breeder = { name: '브리더' } as any;
        const result = service.toRecord('b-2', breeder);
        expect(result.breederProfileImageUrl).toBe('');
        expect(result.breederLocation).toBe(' ');
    });
});
