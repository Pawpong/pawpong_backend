import { GetCommunityPostListUseCase } from '../../../application/use-cases/get-community-post-list.use-case';
import { CommunityPostMapperService } from '../../../domain/services/community-post-mapper.service';

const assetUrl = { toSignedUrl: () => undefined };
const mapper = new CommunityPostMapperService(assetUrl as any);

describe('GetCommunityPostListUseCase', () => {
    const reader = { listPosts: jest.fn(), readPostById: jest.fn(), listComments: jest.fn() };
    const useCase = new GetCommunityPostListUseCase(reader as any, mapper);

    beforeEach(() => jest.clearAllMocks());

    it('기본 인자 — sort=latest, page=1, pageSize=15, skip=0, limit=15', async () => {
        reader.listPosts.mockResolvedValueOnce({ snapshots: [], totalItems: 0 });
        await useCase.execute({});
        expect(reader.listPosts).toHaveBeenCalledWith({
            petType: undefined,
            category: undefined,
            sort: 'latest',
            skip: 0,
            limit: 15,
        });
    });

    it('pageSize 상한 60 적용', async () => {
        reader.listPosts.mockResolvedValueOnce({ snapshots: [], totalItems: 0 });
        await useCase.execute({ page: 2, pageSize: 999 });
        expect(reader.listPosts.mock.calls[0][0]).toMatchObject({ skip: 60, limit: 60 });
    });

    it('totalItems → totalPages 계산 + 빈 페이지 메타', async () => {
        reader.listPosts.mockResolvedValueOnce({ snapshots: [], totalItems: 0 });
        const result = await useCase.execute({ page: 1, pageSize: 10 });
        expect(result.items).toEqual([]);
        expect(result.pagination).toMatchObject({
            currentPage: 1,
            pageSize: 10,
            totalItems: 0,
            hasNextPage: false,
            hasPrevPage: false,
        });
    });

    it('필터(petType + category)가 그대로 전달된다', async () => {
        reader.listPosts.mockResolvedValueOnce({ snapshots: [], totalItems: 0 });
        await useCase.execute({ petType: 'reptile', category: '레오파드', sort: 'popular' });
        expect(reader.listPosts.mock.calls[0][0]).toMatchObject({
            petType: 'reptile',
            category: '레오파드',
            sort: 'popular',
        });
    });
});
