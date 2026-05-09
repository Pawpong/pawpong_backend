import { GetMyFavoriteBreedersUseCase } from '../../../application/use-cases/get-my-favorite-breeders.use-case';
import { ProfileMapperService } from '../../../domain/services/profile-mapper.service';

const assetUrl = { toProfileImageUrl: () => undefined };

describe('GetMyFavoriteBreedersUseCase', () => {
    const reader = { readAdopter: jest.fn(), readBreeder: jest.fn(), listFavoriteBreeders: jest.fn(), isFavoritedBy: jest.fn() };
    const mapper = new ProfileMapperService(assetUrl as any);
    const useCase = new GetMyFavoriteBreedersUseCase(reader as any, mapper);

    beforeEach(() => jest.clearAllMocks());

    it('빈 결과 — totalPages 최소 1, hasNextPage=false', async () => {
        reader.listFavoriteBreeders.mockResolvedValueOnce({ items: [], totalItems: 0 });
        const result = await useCase.execute('a-1', 1, 10);
        expect(result.items).toEqual([]);
        expect(result.pagination).toEqual({
            currentPage: 1,
            pageSize: 10,
            totalItems: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
        });
    });

    it('총 25, page=2, size=10 → 다음/이전 페이지 모두 true', async () => {
        reader.listFavoriteBreeders.mockResolvedValueOnce({
            items: Array.from({ length: 10 }, (_, i) => ({
                breederId: `b-${i}`,
                nickname: `b${i}`,
                breederLocation: '경남 창원',
                bpm: 0,
                addedAt: new Date('2026-04-01T10:00:00.000Z'),
            })),
            totalItems: 25,
        });

        const result = await useCase.execute('a-1', 2, 10);
        expect(result.items).toHaveLength(10);
        expect(result.pagination.totalPages).toBe(3);
        expect(result.pagination.hasNextPage).toBe(true);
        expect(result.pagination.hasPrevPage).toBe(true);
        expect(result.items[0].addedAt).toBe('2026-04-01T10:00:00.000Z');
    });

    it('reader 에 정확한 page/size 가 전달된다', async () => {
        reader.listFavoriteBreeders.mockResolvedValueOnce({ items: [], totalItems: 0 });
        await useCase.execute('a-1', 3, 5);
        expect(reader.listFavoriteBreeders).toHaveBeenCalledWith('a-1', { page: 3, pageSize: 5 });
    });
});
