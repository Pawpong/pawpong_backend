import { LikeCommunityPostUseCase } from '../../../application/use-cases/like-community-post.use-case';

describe('커뮤니티 좋아요 알림 — 이동 경로', () => {
    function setup() {
        const builder: Record<string, jest.Mock> = {};
        for (const name of ['type', 'title', 'content', 'metadata', 'targetUrl']) {
            builder[name] = jest.fn().mockReturnValue(builder);
        }
        builder.send = jest.fn().mockResolvedValue({});

        const notificationDispatch = { to: jest.fn().mockReturnValue(builder) };
        const useCase = new LikeCommunityPostUseCase(
            {
                existsActivePost: jest.fn().mockResolvedValue(true),
                readPostById: jest.fn().mockResolvedValue({
                    authorId: 'author-1',
                    authorModel: 'Adopter',
                }),
            } as any,
            { like: jest.fn().mockResolvedValue({ alreadyLiked: false }) } as any,
            { readAuthorSnapshot: jest.fn().mockResolvedValue({ authorNickname: '홍길동' }) } as any,
            notificationDispatch as any,
        );
        return { useCase, builder };
    }

    it('프론트 실제 라우트인 단수 /community/post/{id} 로 보낸다', async () => {
        const { useCase, builder } = setup();

        await useCase.execute('post-1', 'liker-1', 'Adopter');
        // 알림은 fire-and-forget 이라 마이크로태스크가 비워질 때까지 기다린다.
        await new Promise((resolve) => setImmediate(resolve));

        expect(builder.targetUrl).toHaveBeenCalledWith('/community/post/post-1');
    });

    it('존재하지 않는 복수형 /community/posts 로 보내지 않는다', async () => {
        const { useCase, builder } = setup();

        await useCase.execute('post-1', 'liker-1', 'Adopter');
        await new Promise((resolve) => setImmediate(resolve));

        const url = builder.targetUrl.mock.calls[0]?.[0] as string;
        expect(url).not.toContain('/community/posts/');
    });
});
