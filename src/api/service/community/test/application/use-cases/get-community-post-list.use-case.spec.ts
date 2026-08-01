import { GetCommunityPostListUseCase } from '../../../application/use-cases/get-community-post-list.use-case';
import { CommunityPostMapperService } from '../../../domain/services/community-post-mapper.service';

const assetUrl = { toSignedUrl: () => undefined };
const mapper = new CommunityPostMapperService(assetUrl as any);

const makeSnap = (postId: string) => ({
    postId,
    authorId: 'a-1',
    authorModel: 'Adopter' as const,
    authorNickname: '닉',
    body: '본문',
    photos: [],
    visibility: 'public' as const,
    status: 'published' as const,
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    viewCount: 0,
    createdAt: new Date('2026-05-01T00:00:00.000Z'),
});

describe('GetCommunityPostListUseCase', () => {
    const reader = {
        listPosts: jest.fn(),
        readPostById: jest.fn(),
        listComments: jest.fn(),
        // 카드 미리보기 댓글 배치 조회. 대부분의 케이스는 댓글을 검증하지 않으므로 빈 배열로 둔다.
        listLatestCommentPerPost: jest.fn().mockResolvedValue([]),
    };
    const likePort = {
        like: jest.fn(),
        unlike: jest.fn(),
        isLiked: jest.fn(),
        findLikedPostIds: jest.fn().mockResolvedValue(new Set()),
    };
    const bookmarkPort = {
        save: jest.fn(),
        unsave: jest.fn(),
        listSavedPostIds: jest.fn(),
        findSavedPostIds: jest.fn().mockResolvedValue(new Set()),
    };
    const followReader = {
        listFolloweeIds: jest.fn().mockResolvedValue([]),
        isFollowing: jest.fn().mockResolvedValue(false),
    };
    const useCase = new GetCommunityPostListUseCase(
        reader as any,
        likePort as any,
        bookmarkPort as any,
        followReader as any,
        mapper,
    );

    beforeEach(() => jest.clearAllMocks());

    it('기본 인자 — sort=latest, page=1, pageSize=15, skip=0, limit=15', async () => {
        reader.listPosts.mockResolvedValueOnce({ snapshots: [], totalItems: 0 });
        await useCase.execute({});
        expect(reader.listPosts).toHaveBeenCalledWith({
            petType: undefined,
            category: undefined,
            authorId: undefined,
            sort: 'latest',
            skip: 0,
            limit: 15,
            status: 'published',
            viewerId: undefined,
            viewerFolloweeIds: undefined,
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

    it('비인증(userId 없음) → isSaved 모두 false, findSavedPostIds 미호출', async () => {
        reader.listPosts.mockResolvedValueOnce({ snapshots: [makeSnap('p-1')], totalItems: 1 });
        likePort.findLikedPostIds.mockResolvedValueOnce(new Set());

        const result = await useCase.execute({});

        expect(bookmarkPort.findSavedPostIds).not.toHaveBeenCalled();
        expect(result.items[0].isSaved).toBe(false);
    });

    it('인증(userId 있음) + 저장된 게시글 → isSaved: true', async () => {
        reader.listPosts.mockResolvedValueOnce({
            snapshots: [makeSnap('p-saved'), makeSnap('p-other')],
            totalItems: 2,
        });
        likePort.findLikedPostIds.mockResolvedValueOnce(new Set());
        bookmarkPort.findSavedPostIds.mockResolvedValueOnce(new Set(['p-saved']));

        const result = await useCase.execute({ userId: 'u-1' });

        expect(bookmarkPort.findSavedPostIds).toHaveBeenCalledWith('u-1', ['p-saved', 'p-other']);
        expect(result.items.find((i) => i.postId === 'p-saved')?.isSaved).toBe(true);
        expect(result.items.find((i) => i.postId === 'p-other')?.isSaved).toBe(false);
    });
});
