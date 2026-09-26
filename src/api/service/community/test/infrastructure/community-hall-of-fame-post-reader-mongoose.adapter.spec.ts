import { CommunityHallOfFamePostReaderMongooseAdapter } from '../../infrastructure/community-hall-of-fame-post-reader-mongoose.adapter';

describe('명예의 전당 후보 조회 어댑터', () => {
    const setup = (docs: unknown[] = []) => {
        const chain = {
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(docs),
        };
        const postModel = { find: jest.fn().mockReturnValue(chain) };

        return { adapter: new CommunityHallOfFamePostReaderMongooseAdapter(postModel as never), postModel, chain };
    };

    const doc = (body: string) => ({
        _id: { toString: () => body },
        likeCount: 0,
        commentCount: 0,
        saveCount: 0,
        photos: [],
        body,
        authorId: { toString: () => 'author' },
        authorModel: 'Adopter' as const,
        authorNickname: '포포',
        authorProfileImageFileName: null,
    });

    const start = new Date('2026-09-10T15:00:00.000Z');
    const end = new Date('2026-09-20T15:00:00.000Z');

    it('기간·공개·활성 조건으로 조회한다', async () => {
        const { adapter, postModel } = setup();

        await adapter.findTopPosts(start, end, 3);

        expect(postModel.find).toHaveBeenCalledWith({
            // endDate 는 배타적 상한이라 $lt 여야 한다. $lte 면 다음 회차 첫 글이 섞인다.
            createdAt: { $gte: start, $lt: end },
            isActive: true,
            status: { $ne: 'draft' },
            visibility: { $nin: ['followers', 'private'] },
        });
    });

    it("status 를 'published' 로 못 박지 않는다", async () => {
        const { adapter, postModel } = setup();

        await adapter.findTopPosts(start, end, 3);

        // 마이그레이션 전 레거시 글은 status 가 없다. 'published' 로 좁히면
        // 커뮤니티 목록에는 보이는데 명예의 전당에만 안 뜨는 글이 생긴다.
        const filter = postModel.find.mock.calls[0][0] as { status: unknown; visibility: unknown };
        expect(filter.status).not.toBe('published');
        expect(filter.status).toEqual({ $ne: 'draft' });

        // visibility 도 같은 이유다 — 레거시 글에는 필드 자체가 없어 'public' 으로 좁히면 통째로 빠진다.
        expect(filter.visibility).not.toBe('public');
        expect(filter.visibility).toEqual({ $nin: ['followers', 'private'] });
    });

    it('좋아요 우선, 동점이면 댓글 → 저장 → 먼저 올라온 글 순으로 정렬한다', async () => {
        const { adapter, chain } = setup();

        await adapter.findTopPosts(start, end, 3);

        // 가중합이 아니라 단계적 tie-break 다. 키 순서 자체가 규칙이다.
        expect(chain.sort).toHaveBeenCalledWith({
            likeCount: -1,
            commentCount: -1,
            saveCount: -1,
            createdAt: 1,
        });
        expect(chain.limit).toHaveBeenCalledWith(3);
    });

    it('운영 9/11~20 회차 데이터가 기대한 순위로 나온다', async () => {
        // 좋아요 3 동점에서 댓글 2건인 글이 3위가 되는 실제 사례.
        // 정렬은 MongoDB 가 수행하므로, 여기서는 그 결과를 그대로 받아 순위가 매겨지는지만 확인한다.
        const { adapter } = setup([
            { ...doc('저녁에는 사냥놀이'), likeCount: 6, commentCount: 1 },
            { ...doc('컬러차트'), likeCount: 4, commentCount: 0 },
            { ...doc('강아지'), likeCount: 3, commentCount: 2 },
        ]);

        const candidates = await adapter.findTopPosts(start, end, 3);

        expect(candidates.map((candidate) => candidate.body)).toEqual(['저녁에는 사냥놀이', '컬러차트', '강아지']);
        expect(candidates).toHaveLength(3);
    });

    it('문서를 후보 형태로 변환한다', async () => {
        const { adapter } = setup([
            {
                _id: { toString: () => 'post-1' },
                likeCount: 6,
                commentCount: 1,
                saveCount: 0,
                photos: ['a.jpg'],
                body: '저녁에는 사냥놀이',
                authorId: { toString: () => 'author-1' },
                authorModel: 'Adopter',
                authorNickname: '포포',
                authorProfileImageFileName: undefined,
            },
        ]);

        const [first] = await adapter.findTopPosts(start, end, 3);

        expect(first.postId).toBe('post-1');
        expect(first.authorProfileImageFileName).toBeNull();
        expect(first.photos).toEqual(['a.jpg']);
    });
});
