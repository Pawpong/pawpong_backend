import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import request from 'supertest';

import { createTestingApp } from '../../../../common/testing/test-utils';

describe('커뮤니티 종단간 테스트 (v2 read-only slice)', () => {
    let app: INestApplication;
    let connection: Connection;

    beforeAll(async () => {
        app = await createTestingApp();
        connection = app.get<Connection>(getConnectionToken());
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await connection.collection('community_posts').deleteMany({});
        await connection.collection('community_post_comments').deleteMany({});
    });

    async function seedPost(overrides: Record<string, unknown> = {}): Promise<string> {
        const _id = new Types.ObjectId();
        await connection.collection('community_posts').insertOne({
            _id,
            authorId: new Types.ObjectId(),
            authorModel: 'Adopter',
            authorNickname: '닉네임',
            authorProfileImageFileName: 'pf.jpg',
            title: '제목',
            body: 'A'.repeat(200),
            photos: ['photos/1.jpg', 'photos/2.jpg'],
            petType: 'reptile',
            category: '레오파드',
            likeCount: 7,
            commentCount: 0,
            saveCount: 1,
            viewCount: 42,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        });
        return String(_id);
    }

    async function seedComment(postId: string, overrides: Record<string, unknown> = {}): Promise<string> {
        const _id = new Types.ObjectId();
        await connection.collection('community_post_comments').insertOne({
            _id,
            postId: new Types.ObjectId(postId),
            authorId: new Types.ObjectId(),
            authorModel: 'Breeder',
            authorNickname: '브리더',
            parentCommentId: null,
            body: '댓글 내용',
            likeCount: 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        });
        return String(_id);
    }

    describe('GET /api/v2/community/posts', () => {
        it('빈 목록 — 200 + items 빈 배열 + 페이지네이션 메타', async () => {
            const res = await request(app.getHttpServer()).get('/api/v2/community/posts').expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.code).toBe(200);
            expect(res.body.data.items).toEqual([]);
            expect(res.body.data.pagination).toMatchObject({
                currentPage: 1,
                pageSize: 15,
                totalItems: 0,
                hasNextPage: false,
                hasPrevPage: false,
            });
        });

        it('카드 응답 계약 — bodyExcerpt 120자 cutoff + photoUrls 배열 + 카운트', async () => {
            await seedPost();
            const res = await request(app.getHttpServer()).get('/api/v2/community/posts').expect(200);

            expect(res.body.data.items).toHaveLength(1);
            const card = res.body.data.items[0];
            expect(card.bodyExcerpt.length).toBeLessThanOrEqual(121);
            expect(card.bodyExcerpt.endsWith('…')).toBe(true);
            expect(Array.isArray(card.photoUrls)).toBe(true);
            expect(card.photoUrls).toHaveLength(2);
            expect(card.likeCount).toBe(7);
            expect(card.commentCount).toBe(0);
            expect(card.petType).toBe('reptile');
            expect(card.category).toBe('레오파드');
        });

        it('petType 필터 — 다른 종류는 제외', async () => {
            await seedPost({ petType: 'dog', category: '비숑' });
            await seedPost({ petType: 'reptile', category: '레오파드' });
            const res = await request(app.getHttpServer())
                .get('/api/v2/community/posts?petType=dog')
                .expect(200);
            expect(res.body.data.items).toHaveLength(1);
            expect(res.body.data.items[0].petType).toBe('dog');
        });

        it('잘못된 petType 값 → 400 (DTO 검증)', async () => {
            await request(app.getHttpServer()).get('/api/v2/community/posts?petType=fish').expect(400);
        });

        it('pageSize 상한 위반(>60) → 400', async () => {
            await request(app.getHttpServer()).get('/api/v2/community/posts?pageSize=999').expect(400);
        });

        it('isActive=false 게시글은 목록에 포함되지 않는다', async () => {
            await seedPost({ isActive: false });
            const res = await request(app.getHttpServer()).get('/api/v2/community/posts').expect(200);
            expect(res.body.data.items).toEqual([]);
            expect(res.body.data.pagination.totalItems).toBe(0);
        });
    });

    describe('GET /api/v2/community/posts/:postId', () => {
        it('존재하지 않는 ObjectId → 400 (missing-post 계약)', async () => {
            const fakeId = new Types.ObjectId().toString();
            const res = await request(app.getHttpServer())
                .get(`/api/v2/community/posts/${fakeId}`)
                .expect(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('해당 게시글을 찾을 수 없습니다.');
        });

        it('상세 — body 전문 + commentPreview 첫 5개 까지', async () => {
            const postId = await seedPost();
            for (let i = 0; i < 7; i++) {
                await seedComment(postId, { body: `c${i}`, createdAt: new Date(Date.now() + i * 1000) });
            }
            const res = await request(app.getHttpServer())
                .get(`/api/v2/community/posts/${postId}`)
                .expect(200);
            expect(res.body.data.body.length).toBe(200);
            expect(res.body.data.commentPreview).toHaveLength(5);
        });
    });

    describe('GET /api/v2/community/posts/:postId/comments', () => {
        it('잘못된 postId — page=1 일관되게 400', async () => {
            const fakeId = new Types.ObjectId().toString();
            await request(app.getHttpServer())
                .get(`/api/v2/community/posts/${fakeId}/comments`)
                .expect(400);
        });

        it('잘못된 postId — page=2 에서도 동일하게 400 (일관 계약)', async () => {
            const fakeId = new Types.ObjectId().toString();
            const res = await request(app.getHttpServer())
                .get(`/api/v2/community/posts/${fakeId}/comments?page=2`)
                .expect(400);
            expect(res.body.error).toBe('해당 게시글을 찾을 수 없습니다.');
        });

        it('정상 페이지네이션 — 시간 asc 정렬', async () => {
            const postId = await seedPost();
            for (let i = 0; i < 3; i++) {
                await seedComment(postId, {
                    body: `c${i}`,
                    createdAt: new Date(Date.parse('2026-05-01T00:00:00Z') + i * 1000),
                });
            }
            const res = await request(app.getHttpServer())
                .get(`/api/v2/community/posts/${postId}/comments`)
                .expect(200);
            expect(res.body.data.items.map((c: { body: string }) => c.body)).toEqual(['c0', 'c1', 'c2']);
            expect(res.body.data.pagination.totalItems).toBe(3);
        });

        it('isActive=false 게시글의 댓글 endpoint → 400 (소프트 삭제 일관성)', async () => {
            const postId = await seedPost({ isActive: false });
            await request(app.getHttpServer())
                .get(`/api/v2/community/posts/${postId}/comments`)
                .expect(400);
        });
    });
});
