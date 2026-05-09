import { GetMyAdoptedListUseCase } from '../../../application/use-cases/get-my-adopted-list.use-case';
import { AdoptionPetMapperService } from '../../../domain/services/adoption-pet-mapper.service';

const buildPetSnapshot = (id: string) => ({
    id,
    breederId: 'b-1',
    name: '레오',
    breed: '레오파드게코',
    petType: 'reptile' as const,
    gender: 'female' as const,
    birthDate: new Date('2024-11-05'),
    price: 200000,
    status: 'adopted' as const,
    photos: ['p/1.jpg'],
    inquiryCount: 1,
    favoriteCount: 10,
    viewCount: 20,
    createdAt: new Date('2025-12-01T00:00:00.000Z'),
    updatedAt: new Date('2025-12-08T00:00:00.000Z'),
});

describe('GetMyAdoptedListUseCase', () => {
    const recordReader = { listMyAdopted: jest.fn() };
    const assetUrlPort = { generateSignedUrl: jest.fn(async (n: string) => `signed/${n}`) };
    const mapper = new AdoptionPetMapperService();
    const useCase = new GetMyAdoptedListUseCase(recordReader as any, assetUrlPort as any, mapper);

    beforeEach(() => jest.clearAllMocks());

    it('포트에 adopterId/skip/limit 가 정확히 전달된다', async () => {
        recordReader.listMyAdopted.mockResolvedValueOnce({ items: [], totalItems: 0 });
        await useCase.execute({ adopterId: 'a-1', page: 2, pageSize: 10 });
        expect(recordReader.listMyAdopted).toHaveBeenCalledWith({ adopterId: 'a-1', skip: 10, limit: 10 });
    });

    it('adoptedAt 이 ISO 8601 string 으로 직렬화 + isFavorited=false 고정', async () => {
        recordReader.listMyAdopted.mockResolvedValueOnce({
            items: [
                { pet: buildPetSnapshot('p-1'), adoptedAt: new Date('2025-12-08T00:00:00.000Z') },
            ],
            totalItems: 1,
        });
        const result = await useCase.execute({ adopterId: 'a-1' });
        expect(result.items).toHaveLength(1);
        expect(result.items[0].adoptedAt).toBe('2025-12-08T00:00:00.000Z');
        expect(result.items[0].isFavorited).toBe(false);
        expect(result.items[0].photoUrls).toEqual(['signed/p/1.jpg']);
    });

    it('페이지네이션 메타 정확 (총 12, page=2, size=5 → totalPages=3)', async () => {
        recordReader.listMyAdopted.mockResolvedValueOnce({
            items: Array.from({ length: 5 }, (_, i) => ({
                pet: buildPetSnapshot(`p-${i}`),
                adoptedAt: new Date('2025-12-08T00:00:00.000Z'),
            })),
            totalItems: 12,
        });
        const result = await useCase.execute({ adopterId: 'a-1', page: 2, pageSize: 5 });
        expect(result.pagination.totalPages).toBe(3);
        expect(result.pagination.hasNextPage).toBe(true);
        expect(result.pagination.hasPrevPage).toBe(true);
    });

    it('pageSize 상한 60 적용', async () => {
        recordReader.listMyAdopted.mockResolvedValueOnce({ items: [], totalItems: 0 });
        await useCase.execute({ adopterId: 'a-1', pageSize: 999 });
        expect(recordReader.listMyAdopted).toHaveBeenCalledWith(expect.objectContaining({ limit: 60 }));
    });
});
