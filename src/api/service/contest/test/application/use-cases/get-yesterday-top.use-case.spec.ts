import { GetYesterdayTopUseCase } from '../../../application/use-cases/get-yesterday-top.use-case';

const logger = {
    logStart: jest.fn(),
    logSuccess: jest.fn(),
    logWarning: jest.fn(),
    logError: jest.fn(),
};

const makeEntry = (
    overrides: Partial<{
        id: string;
        contestId: string;
        userId: string;
        userDisplayName: string;
        userProfileImageFileName: string | null;
        photoFileName: string;
        description: string;
        voteCount: number;
        rank: number | null;
        status: 'active' | 'hidden' | 'deleted';
        createdAt: Date;
    }> = {},
) => ({
    id: 'entry-1',
    contestId: 'contest-1',
    userId: 'user-1',
    userDisplayName: '닉네임',
    userProfileImageFileName: null,
    photoFileName: 'photo.jpg',
    description: '설명',
    voteCount: 0,
    rank: null,
    status: 'active' as const,
    createdAt: new Date('2026-05-01T00:00:00Z'),
    ...overrides,
});

const makeContest = (overrides = {}) => ({
    id: 'contest-1',
    title: '이번 주 콘테스트',
    description: '설명',
    benefitText: '',
    startDate: new Date('2026-05-19T00:00:00Z'),
    endDate: new Date('2026-05-25T23:59:59Z'),
    status: 'active' as const,
    participantCount: 3,
    createdAt: new Date('2026-05-19T00:00:00Z'),
    ...overrides,
});

describe('GetYesterdayTopUseCase', () => {
    const reader = {
        findActive: jest.fn(),
        findTopEntries: jest.fn(),
        countEntries: jest.fn(),
        findLatestEnded: jest.fn(),
        findAllEnded: jest.fn(),
        countAllEnded: jest.fn(),
        findEntries: jest.fn(),
        findEntryByUserId: jest.fn(),
        findEntryById: jest.fn(),
        findVotedEntryId: jest.fn(),
        findRandomEntry: jest.fn(),
    };

    const assetUrl = {
        generateSignedUrl: jest.fn((fileName: string) => Promise.resolve(`https://cdn.test/${fileName}`)),
    };

    const useCase = new GetYesterdayTopUseCase(reader as any, assetUrl as any, logger as any);

    beforeEach(() => {
        jest.clearAllMocks();
        assetUrl.generateSignedUrl.mockImplementation((fileName: string) =>
            Promise.resolve(`https://cdn.test/${fileName}`),
        );
    });

    // ─── 정상 케이스 ───────────────────────────────────────────────

    it('정상 — 엔트리 3개: voteRate 내림차순 TOP 3 반환, voteCount 항상 공개', async () => {
        reader.findActive.mockResolvedValue(makeContest({ participantCount: 10 }));
        reader.findTopEntries.mockResolvedValue([
            makeEntry({ id: 'e-1', voteCount: 5 }),
            makeEntry({ id: 'e-2', voteCount: 3 }),
            makeEntry({ id: 'e-3', voteCount: 1 }),
        ]);
        reader.countEntries.mockResolvedValue(10);

        const result = await useCase.execute();

        expect(result).not.toBeNull();
        expect(result!.ranking).toHaveLength(3);
        expect(result!.ranking[0].rank).toBe(1);
        expect(result!.ranking[0].entry.voteCount).toBe(5);
        expect(result!.ranking[1].entry.voteCount).toBe(3);
        expect(result!.ranking[2].entry.voteCount).toBe(1);
    });

    it('정상 — voteRate = (voteCount / totalEntries) * 100, 소수점 1자리 반올림', async () => {
        reader.findActive.mockResolvedValue(makeContest());
        reader.findTopEntries.mockResolvedValue([
            makeEntry({ id: 'e-1', voteCount: 3 }),
            makeEntry({ id: 'e-2', voteCount: 1 }),
        ]);
        reader.countEntries.mockResolvedValue(10);

        const result = await useCase.execute();

        expect(result!.ranking[0].voteRate).toBe(30);
        expect(result!.ranking[1].voteRate).toBe(10);
    });

    it('정상 — signed URL이 각 항목 photoUrl에 반영됨', async () => {
        reader.findActive.mockResolvedValue(makeContest());
        reader.findTopEntries.mockResolvedValue([makeEntry({ id: 'e-1', photoFileName: 'photo-1.jpg' })]);
        reader.countEntries.mockResolvedValue(5);

        const result = await useCase.execute();

        expect(result!.ranking[0].entry.photoUrl).toBe('https://cdn.test/photo-1.jpg');
    });

    it('정상 — 프로필 이미지가 있으면 profileImageUrl 반환, 없으면 null', async () => {
        reader.findActive.mockResolvedValue(makeContest());
        reader.findTopEntries.mockResolvedValue([
            makeEntry({ id: 'e-1', userProfileImageFileName: 'profile.jpg' }),
            makeEntry({ id: 'e-2', userProfileImageFileName: null }),
        ]);
        reader.countEntries.mockResolvedValue(5);

        const result = await useCase.execute();

        expect(result!.ranking[0].entry.userProfileImageUrl).toBe('https://cdn.test/profile.jpg');
        expect(result!.ranking[1].entry.userProfileImageUrl).toBeNull();
    });

    // ─── 엣지 케이스 ───────────────────────────────────────────────

    it('엣지 — 진행 중 콘테스트 없음 → null 반환', async () => {
        reader.findActive.mockResolvedValue(null);

        const result = await useCase.execute();

        expect(result).toBeNull();
        expect(reader.findTopEntries).not.toHaveBeenCalled();
    });

    it('엣지 — 엔트리가 1개뿐 → 1개만 반환', async () => {
        reader.findActive.mockResolvedValue(makeContest({ participantCount: 1 }));
        reader.findTopEntries.mockResolvedValue([makeEntry({ id: 'e-1', voteCount: 2 })]);
        reader.countEntries.mockResolvedValue(1);

        const result = await useCase.execute();

        expect(result!.ranking).toHaveLength(1);
        expect(result!.ranking[0].rank).toBe(1);
    });

    it('엣지 — 엔트리가 없음 → 빈 랭킹 반환', async () => {
        reader.findActive.mockResolvedValue(makeContest({ participantCount: 0 }));
        reader.findTopEntries.mockResolvedValue([]);
        reader.countEntries.mockResolvedValue(0);

        const result = await useCase.execute();

        expect(result!.ranking).toHaveLength(0);
    });

    it('엣지 — totalEntries = 0 → division by zero 방어, voteRate = 0', async () => {
        reader.findActive.mockResolvedValue(makeContest());
        reader.findTopEntries.mockResolvedValue([makeEntry({ id: 'e-1', voteCount: 0 })]);
        reader.countEntries.mockResolvedValue(0);

        const result = await useCase.execute();

        expect(result!.ranking[0].voteRate).toBe(0);
    });

    it('엣지 — voteCount = 0인 항목 → voteRate = 0', async () => {
        reader.findActive.mockResolvedValue(makeContest());
        reader.findTopEntries.mockResolvedValue([
            makeEntry({ id: 'e-1', voteCount: 0 }),
            makeEntry({ id: 'e-2', voteCount: 0 }),
        ]);
        reader.countEntries.mockResolvedValue(5);

        const result = await useCase.execute();

        expect(result!.ranking[0].voteRate).toBe(0);
        expect(result!.ranking[1].voteRate).toBe(0);
    });

    it('엣지 — rank는 배열 순서(1, 2, 3) 기준으로 부여', async () => {
        reader.findActive.mockResolvedValue(makeContest());
        reader.findTopEntries.mockResolvedValue([
            makeEntry({ id: 'e-1', voteCount: 10 }),
            makeEntry({ id: 'e-2', voteCount: 7 }),
            makeEntry({ id: 'e-3', voteCount: 3 }),
        ]);
        reader.countEntries.mockResolvedValue(20);

        const result = await useCase.execute();

        expect(result!.ranking[0].rank).toBe(1);
        expect(result!.ranking[1].rank).toBe(2);
        expect(result!.ranking[2].rank).toBe(3);
    });

    it('엣지 — contestId가 결과에 포함됨', async () => {
        reader.findActive.mockResolvedValue(makeContest({ id: 'contest-99' }));
        reader.findTopEntries.mockResolvedValue([makeEntry({ voteCount: 1 })]);
        reader.countEntries.mockResolvedValue(5);

        const result = await useCase.execute();

        expect(result!.contestId).toBe('contest-99');
    });
});
