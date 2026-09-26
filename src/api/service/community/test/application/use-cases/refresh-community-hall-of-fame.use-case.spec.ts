import { RefreshCommunityHallOfFameUseCase } from '../../../application/use-cases/refresh-community-hall-of-fame.use-case';
import { CommunityHallOfFameMapperService } from '../../../domain/services/community-hall-of-fame-mapper.service';
import { CommunityHallOfFamePeriodService } from '../../../domain/services/community-hall-of-fame-period.service';
import type { CommunityHallOfFameCandidate } from '../../../application/ports/community-hall-of-fame-post-reader.port';

const kst = (iso: string) => new Date(`${iso}+09:00`);

const candidate = (overrides: Partial<CommunityHallOfFameCandidate>): CommunityHallOfFameCandidate => ({
    postId: '507f1f77bcf86cd799439011',
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    photos: [],
    body: '본문',
    authorId: '507f1f77bcf86cd799439012',
    authorModel: 'Adopter',
    authorNickname: '포포',
    authorProfileImageFileName: null,
    ...overrides,
});

describe('명예의 전당 집계 유스케이스', () => {
    const setup = (existingPeriodKeys: string[] = []) => {
        const stored = new Set(existingPeriodKeys);

        const hallOfFamePort = {
            upsertOpen: jest.fn().mockResolvedValue(undefined),
            finalize: jest.fn().mockResolvedValue(true),
            findByPeriodKey: jest.fn((key: string) => Promise.resolve(stored.has(key) ? ({} as never) : null)),
            findFinalized: jest.fn(),
        };
        const postReaderPort = { findTopPosts: jest.fn().mockResolvedValue([]) };
        const assetUrl = { toSignedUrl: (name?: string | null) => (name ? `https://cdn/${name}` : undefined) };

        const useCase = new RefreshCommunityHallOfFameUseCase(
            hallOfFamePort as never,
            postReaderPort as never,
            new CommunityHallOfFamePeriodService(),
            new CommunityHallOfFameMapperService(assetUrl as never),
            { log: jest.fn(), logError: jest.fn() } as never,
        );

        return { useCase, hallOfFamePort, postReaderPort };
    };

    it('직전 회차를 확정하고 현재 회차를 재집계한다', async () => {
        const { useCase, hallOfFamePort } = setup(['2026-9-1']);

        await useCase.execute(kst('2026-09-15T10:00:00'));

        expect(hallOfFamePort.finalize).toHaveBeenCalledWith('2026-9-1');
        expect(hallOfFamePort.upsertOpen).toHaveBeenCalledWith(expect.objectContaining({ periodKey: '2026-9-2' }));
    });

    it('현재 회차 조회 범위는 KST 회차 경계와 일치한다', async () => {
        const { useCase, postReaderPort } = setup(['2026-9-1']);

        await useCase.execute(kst('2026-09-15T10:00:00'));

        expect(postReaderPort.findTopPosts).toHaveBeenLastCalledWith(
            kst('2026-09-11T00:00:00'),
            kst('2026-09-21T00:00:00'),
            3,
        );
    });

    it('직전 회차가 한 번도 집계되지 않았으면 확정 전에 한 번 집계한다', async () => {
        const { useCase, hallOfFamePort, postReaderPort } = setup([]);

        await useCase.execute(kst('2026-09-15T10:00:00'));

        // 직전(2026-9-1) → 현재(2026-9-2) 순으로 두 번 집계한다
        expect(postReaderPort.findTopPosts).toHaveBeenCalledTimes(2);
        expect(hallOfFamePort.upsertOpen).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({ periodKey: '2026-9-1' }),
        );
        expect(hallOfFamePort.upsertOpen).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ periodKey: '2026-9-2' }),
        );
    });

    it('글이 없는 회차는 빈 winners 로 저장한다 (폴백하지 않는다)', async () => {
        const { useCase, hallOfFamePort } = setup(['2026-9-2']);

        await useCase.execute(kst('2026-09-25T10:00:00'));

        expect(hallOfFamePort.upsertOpen).toHaveBeenCalledWith(expect.objectContaining({ winners: [] }));
    });

    it('조회 순서대로 1~3위를 매기고 표시용 값을 복사한다', async () => {
        const { useCase, hallOfFamePort, postReaderPort } = setup(['2026-9-1']);
        postReaderPort.findTopPosts.mockResolvedValue([
            candidate({ postId: '507f1f77bcf86cd799439021', likeCount: 6, commentCount: 1, photos: ['a.jpg'] }),
            candidate({ postId: '507f1f77bcf86cd799439022', likeCount: 4 }),
            candidate({ postId: '507f1f77bcf86cd799439023', likeCount: 3, commentCount: 2 }),
        ]);

        await useCase.execute(kst('2026-09-15T10:00:00'));

        const { winners } = hallOfFamePort.upsertOpen.mock.calls.at(-1)![0] as {
            winners: Array<{ rank: number; postId: string; photoFileName: string | null; authorNickname: string }>;
        };

        expect(winners.map((winner) => winner.rank)).toEqual([1, 2, 3]);
        expect(winners[0].photoFileName).toBe('a.jpg');
        // 사진 없는 글은 null — 폴백 이미지를 서버가 정하지 않는다
        expect(winners[1].photoFileName).toBeNull();
        expect(winners[0].authorNickname).toBe('포포');
    });
});
