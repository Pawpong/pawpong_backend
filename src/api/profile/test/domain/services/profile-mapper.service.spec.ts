import { ProfileMapperService } from '../../../domain/services/profile-mapper.service';

const assetUrl = { toProfileImageUrl: (n?: string | null) => (n ? `signed/${n}` : undefined) };

describe('ProfileMapperService', () => {
    const mapper = new ProfileMapperService(assetUrl as any);

    it('toMyAdopterDto — 필수 필드 채움', () => {
        const dto = mapper.toMyAdopterDto({
            userId: 'a-1',
            nickname: '닉',
            profileImageFileName: 'pf.jpg',
            bio: 'hi',
            bpm: 30,
            followerCount: 5,
            favoriteBreederCount: 2,
        });
        expect(dto.role).toBe('adopter');
        expect(dto.profileImageUrl).toBe('signed/pf.jpg');
        expect(dto.favoriteBreederCount).toBe(2);
    });

    it('toBreederPublicDto — isFavorited 그대로 전달', () => {
        const dto = mapper.toBreederPublicDto(
            {
                breederId: 'b-1',
                nickname: '브',
                bio: '소개',
                longDescription: '긴 소개',
                bpm: 60,
                followerCount: 1600,
                level: 'elite',
                plan: 'pro',
                businessLocation: { city: '경남', district: '창원시' },
            },
            true,
        );
        expect(dto.isFavorited).toBe(true);
        expect(dto.level).toBe('elite');
    });

    it('toFavoriteBreederCardDto — addedAt 이 ISO string 으로 직렬화된다', () => {
        const dto = mapper.toFavoriteBreederCardDto({
            breederId: 'b-1',
            nickname: '브',
            breederLocation: '경남 창원',
            recentPetStatus: 'available',
            bpm: 60,
            level: 'elite',
            addedAt: new Date('2026-04-01T10:00:00.000Z'),
        });
        expect(dto.addedAt).toBe('2026-04-01T10:00:00.000Z');
        expect(dto.recentPetStatus).toBe('available');
    });
});
