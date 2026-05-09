import { ListMyBreederPetPostingsUseCase } from '../../../application/use-cases/list-my-breeder-pet-postings.use-case';
import { BreederPetPostingCardMapperService } from '../../../domain/services/breeder-pet-posting-card-mapper.service';

const fakeAssetUrl = { toSignedUrl: (n: string) => `signed/${n}` } as any;

const buildSnapshot = (id: string, status: 'available' | 'reserved' | 'adopted' = 'available') => ({
    petId: id,
    name: '레오',
    breed: '레오파드게코',
    gender: 'female' as const,
    birthDate: new Date('2024-11-05'),
    price: 200000,
    status,
    photos: ['p/1.jpg', 'p/2.jpg', 'p/3.jpg'],
    representativePhotoIndex: 1,
    description: '귀여운 파이리',
    inquiryCount: 1,
    favoriteCount: 10,
    viewCount: 20,
    createdAt: new Date('2026-04-01T10:00:00.000Z'),
});

describe('ListMyBreederPetPostingsUseCase', () => {
    const reader = { listMyPostings: jest.fn() };
    const cardMapper = new BreederPetPostingCardMapperService(fakeAssetUrl);
    const useCase = new ListMyBreederPetPostingsUseCase(reader as any, cardMapper);

    beforeEach(() => jest.clearAllMocks());

    it('포트에 status / skip / limit 가 정확히 전달된다', async () => {
        reader.listMyPostings.mockResolvedValueOnce({ snapshots: [], totalItems: 0 });
        await useCase.execute({ breederId: 'b-1', status: 'available', page: 2, pageSize: 10 });
        expect(reader.listMyPostings).toHaveBeenCalledWith({
            breederId: 'b-1',
            status: 'available',
            skip: 10,
            limit: 10,
        });
    });

    it('대표 사진 인덱스로 primaryPhotoUrl 이 결정된다', async () => {
        reader.listMyPostings.mockResolvedValueOnce({
            snapshots: [buildSnapshot('p-1')],
            totalItems: 1,
        });
        const result = await useCase.execute({ breederId: 'b-1' });
        expect(result.items[0].primaryPhotoUrl).toBe('signed/p/2.jpg');
        expect(result.items[0].photoUrls).toEqual(['signed/p/1.jpg', 'signed/p/2.jpg', 'signed/p/3.jpg']);
    });

    it('representativePhotoIndex 가 photos.length 초과면 마지막 사진으로 clamp', async () => {
        reader.listMyPostings.mockResolvedValueOnce({
            snapshots: [{ ...buildSnapshot('p-1'), representativePhotoIndex: 99 }],
            totalItems: 1,
        });
        const result = await useCase.execute({ breederId: 'b-1' });
        expect(result.items[0].primaryPhotoUrl).toBe('signed/p/3.jpg');
    });

    it('페이지네이션 메타 정확 (총 25, page=3, size=10 → totalPages=3, hasNext=false, hasPrev=true)', async () => {
        reader.listMyPostings.mockResolvedValueOnce({
            snapshots: Array.from({ length: 5 }, (_, i) => buildSnapshot(`p-${i}`)),
            totalItems: 25,
        });
        const result = await useCase.execute({ breederId: 'b-1', page: 3, pageSize: 10 });
        expect(result.pagination.totalPages).toBe(3);
        expect(result.pagination.hasNextPage).toBe(false);
        expect(result.pagination.hasPrevPage).toBe(true);
    });

    it('pageSize 상한 60 적용', async () => {
        reader.listMyPostings.mockResolvedValueOnce({ snapshots: [], totalItems: 0 });
        await useCase.execute({ breederId: 'b-1', pageSize: 999 });
        expect(reader.listMyPostings).toHaveBeenCalledWith(expect.objectContaining({ limit: 60 }));
    });
});
