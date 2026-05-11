import { CommunityPostMapperService } from '../../../domain/services/community-post-mapper.service';

const assetUrl = { toSignedUrl: (n?: string | null) => (n ? `signed/${n}` : undefined) };

const snapshot = {
    postId: 'p-1',
    authorId: 'a-1',
    authorModel: 'Adopter' as const,
    authorNickname: '닉',
    authorProfileImageFileName: 'pf.jpg',
    title: '제목',
    body: 'A'.repeat(150),
    photos: ['p/1.jpg', 'p/2.jpg', ''],
    petType: 'reptile' as const,
    category: '레오파드',
    likeCount: 10,
    commentCount: 5,
    saveCount: 2,
    viewCount: 100,
    createdAt: new Date('2026-05-01T00:00:00.000Z'),
};

describe('CommunityPostMapperService', () => {
    const mapper = new CommunityPostMapperService(assetUrl as any);

    it('toCard — bodyExcerpt 120자 자르기 + 빈 사진명은 photoUrls 에서 제외', () => {
        const card = mapper.toCard(snapshot);
        expect(card.bodyExcerpt.length).toBeLessThanOrEqual(121);
        expect(card.bodyExcerpt.endsWith('…')).toBe(true);
        expect(card.photoUrls).toEqual(['signed/p/1.jpg', 'signed/p/2.jpg']);
        expect(card.primaryPhotoUrl).toBe('signed/p/1.jpg');
        expect(card.authorProfileImageUrl).toBe('signed/pf.jpg');
    });

    it('toCard — 짧은 본문은 ellipsis 없이 그대로', () => {
        const card = mapper.toCard({ ...snapshot, body: '짧음' });
        expect(card.bodyExcerpt).toBe('짧음');
        expect(card.bodyExcerpt.endsWith('…')).toBe(false);
    });

    it('toDetail — 본문 전문 + commentPreview 그대로 전달', () => {
        const detail = mapper.toDetail(snapshot, [
            {
                commentId: 'c-1',
                postId: 'p-1',
                authorId: 'a-2',
                authorModel: 'Breeder',
                authorNickname: 'b',
                parentCommentId: null,
                body: '댓글',
                likeCount: 0,
                createdAt: '2026-05-01T00:00:00.000Z',
            },
        ]);
        expect(detail.body.length).toBe(150);
        expect(detail.commentPreview).toHaveLength(1);
        expect(detail.photoUrls).toEqual(['signed/p/1.jpg', 'signed/p/2.jpg']);
    });

    it('toComment — parentCommentId 가 string 으로 직렬화, createdAt ISO', () => {
        const c = mapper.toComment({
            commentId: 'c-1',
            postId: 'p-1',
            authorId: 'a-2',
            authorModel: 'Breeder',
            authorNickname: 'b',
            authorProfileImageFileName: undefined,
            parentCommentId: 'c-parent',
            body: '답글',
            likeCount: 3,
            createdAt: new Date('2026-05-02T03:04:05.000Z'),
        });
        expect(c.parentCommentId).toBe('c-parent');
        expect(c.createdAt).toBe('2026-05-02T03:04:05.000Z');
        expect(c.authorProfileImageUrl).toBeUndefined();
    });
});
