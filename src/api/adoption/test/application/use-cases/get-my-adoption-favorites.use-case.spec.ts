import { GetMyAdoptionFavoritesUseCase } from '../../../application/use-cases/get-my-adoption-favorites.use-case';
import { AdoptionPetMapperService } from '../../../domain/services/adoption-pet-mapper.service';

const buildSnapshot = (id: string, status: 'available' | 'reserved' | 'adopted' = 'available') => ({
    id,
    breederId: 'b-1',
    name: '레오',
    breed: '레오파드게코',
    petType: 'reptile' as const,
    gender: 'female' as const,
    birthDate: new Date('2024-11-05'),
    price: 200000,
    status,
    photos: ['p/1.jpg', 'p/2.jpg'],
    inquiryCount: 0,
    favoriteCount: 1,
    viewCount: 0,
    createdAt: new Date('2026-04-01T10:00:00.000Z'),
    updatedAt: new Date('2026-04-01T10:00:00.000Z'),
});

describe('GetMyAdoptionFavoritesUseCase', () => {
    const favoriteReader = {
        listMyFavoritedPets: jest.fn(),
        isFavorited: jest.fn(),
        findFavoritedPetIds: jest.fn(),
    };
    const assetUrlPort = { generateSignedUrl: jest.fn(async (n: string) => `signed/${n}`) };
    const mapper = new AdoptionPetMapperService();
    const useCase = new GetMyAdoptionFavoritesUseCase(favoriteReader as any, assetUrlPort as any, mapper);

    beforeEach(() => jest.clearAllMocks());

    it('포트에 status / skip / limit 가 정확히 전달된다', async () => {
        favoriteReader.listMyFavoritedPets.mockResolvedValueOnce({ snapshots: [], totalItems: 0 });
        await useCase.execute({ adopterId: 'a-1', status: 'available', page: 2, pageSize: 10 });
        expect(favoriteReader.listMyFavoritedPets).toHaveBeenCalledWith('a-1', {
            statusFilter: 'available',
            skip: 10,
            limit: 10,
        });
    });

    it('모든 카드의 isFavorited 는 true 로 고정된다', async () => {
        favoriteReader.listMyFavoritedPets.mockResolvedValueOnce({
            snapshots: [buildSnapshot('p-1'), buildSnapshot('p-2')],
            totalItems: 2,
        });
        const result = await useCase.execute({ adopterId: 'a-1' });
        expect(result.items).toHaveLength(2);
        expect(result.items.every((it) => it.isFavorited)).toBe(true);
        expect(result.items[0].photoUrls).toEqual(['signed/p/1.jpg', 'signed/p/2.jpg']);
        expect(result.items[0].primaryPhotoUrl).toBe('signed/p/1.jpg');
    });

    it('페이지네이션 메타가 정확하다 (총 25, page=2, size=10)', async () => {
        favoriteReader.listMyFavoritedPets.mockResolvedValueOnce({
            snapshots: Array.from({ length: 10 }, (_, i) => buildSnapshot(`p-${i}`)),
            totalItems: 25,
        });
        const result = await useCase.execute({ adopterId: 'a-1', page: 2, pageSize: 10 });
        expect(result.pagination.totalPages).toBe(3);
        expect(result.pagination.hasNextPage).toBe(true);
        expect(result.pagination.hasPrevPage).toBe(true);
    });

    it('pageSize 상한 60 적용 (요청 999 → 60)', async () => {
        favoriteReader.listMyFavoritedPets.mockResolvedValueOnce({ snapshots: [], totalItems: 0 });
        await useCase.execute({ adopterId: 'a-1', pageSize: 999 });
        expect(favoriteReader.listMyFavoritedPets).toHaveBeenCalledWith('a-1', expect.objectContaining({ limit: 60 }));
    });
});
