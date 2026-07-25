import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import request from 'supertest';

import { createTestingApp, getAdopterToken, getBreederToken } from '../../../../common/testing/test-utils';

describe('커뮤니티 게시글 좋아요 E2E (v2)', () => {
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
        await connection.collection('community_post_likes').deleteMany({});
    });

    async function seedPost(overrides: Record<string, unknown> = {}): Promise<string> {
        const _id = new Types.ObjectId();
        await connection.collection('community_posts').insertOne({
            _id,
            authorId: new Types.ObjectId(),
            authorModel: 'Adopter',
            authorNickname: '닉네임',
            body: '본문',
            photos: [],
            likeCount: 0,
            commentCount: 0,
            saveCount: 0,
            viewCount: 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        });
        return String(_id);
    }

    describe('POST /api/v2/community/posts/:postId/like', () => {
        it('비인증 요청 → 401', async () => {
            const postId = await seedPost();
            await request(app.getHttpServer()).post(`/api/v2/community/posts/${postId}/like`).expect(401);
        });

        it('정상 좋아요 → 200 + liked: true + likeCount +1', async () => {
            const postId = await seedPost();
            const tokenRes = await getAdopterToken(app);
            expect(tokenRes).not.toBeNull();

            const res = await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/like`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .expect(200);

            expect(res.body.data.liked).toBe(true);
            expect(res.body.data.postId).toBe(postId);

            const doc = await connection.collection('community_posts').findOne({ _id: new Types.ObjectId(postId) });
            expect(doc?.likeCount).toBe(1);
        });

        it('중복 좋아요 → liked: false (멱등, likeCount 변화 없음)', async () => {
            const postId = await seedPost();
            const tokenRes = await getAdopterToken(app);

            await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/like`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .expect(200);

            const res = await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/like`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .expect(200);

            expect(res.body.data.liked).toBe(false);
            const doc = await connection.collection('community_posts').findOne({ _id: new Types.ObjectId(postId) });
            expect(doc?.likeCount).toBe(1);
        });

        it('존재하지 않는 게시글 → 400', async () => {
            const tokenRes = await getAdopterToken(app);
            const fakeId = new Types.ObjectId().toString();
            await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${fakeId}/like`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .expect(400);
        });

        it('isActive=false 게시글 → 400', async () => {
            const postId = await seedPost({ isActive: false });
            const tokenRes = await getAdopterToken(app);
            await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/like`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .expect(400);
        });

        it('브리더도 좋아요 가능', async () => {
            const postId = await seedPost();
            const tokenRes = await getBreederToken(app);
            expect(tokenRes).not.toBeNull();

            const res = await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/like`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .expect(200);

            expect(res.body.data.liked).toBe(true);
        });
    });

    describe('DELETE /api/v2/community/posts/:postId/like', () => {
        it('비인증 요청 → 401', async () => {
            const postId = await seedPost();
            await request(app.getHttpServer()).delete(`/api/v2/community/posts/${postId}/like`).expect(401);
        });

        it('좋아요 후 취소 → unliked: true + likeCount 0으로 복원', async () => {
            const postId = await seedPost();
            const tokenRes = await getAdopterToken(app);

            await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/like`)
                .set('Authorization', `Bearer ${tokenRes!.token}`);

            const res = await request(app.getHttpServer())
                .delete(`/api/v2/community/posts/${postId}/like`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .expect(200);

            expect(res.body.data.unliked).toBe(true);
            const doc = await connection.collection('community_posts').findOne({ _id: new Types.ObjectId(postId) });
            expect(doc?.likeCount).toBe(0);
        });

        it('좋아요 안 한 상태에서 취소 → unliked: false (멱등)', async () => {
            const postId = await seedPost();
            const tokenRes = await getAdopterToken(app);

            const res = await request(app.getHttpServer())
                .delete(`/api/v2/community/posts/${postId}/like`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .expect(200);

            expect(res.body.data.unliked).toBe(false);
        });

        it('likeCount가 0일 때 취소 → likeCount 0 유지 (음수 방지)', async () => {
            const postId = await seedPost({ likeCount: 0 });
            const tokenRes = await getAdopterToken(app);

            await request(app.getHttpServer())
                .delete(`/api/v2/community/posts/${postId}/like`)
                .set('Authorization', `Bearer ${tokenRes!.token}`);

            const doc = await connection.collection('community_posts').findOne({ _id: new Types.ObjectId(postId) });
            expect(doc?.likeCount).toBe(0);
        });

        it('존재하지 않는 게시글 → 400', async () => {
            const tokenRes = await getAdopterToken(app);
            const fakeId = new Types.ObjectId().toString();
            await request(app.getHttpServer())
                .delete(`/api/v2/community/posts/${fakeId}/like`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .expect(400);
        });
    });
});
