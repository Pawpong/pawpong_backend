import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import request from 'supertest';

import { createTestingApp, getAdopterToken } from '../../../../common/testing/test-utils';

describe('커뮤니티 게시글 신고 E2E (v2)', () => {
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
        await connection.collection('community_post_reports').deleteMany({});
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

    describe('POST /api/v2/community/posts/:postId/report', () => {
        it('비인증 → 401', async () => {
            const postId = await seedPost();
            await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/report`)
                .send({ reason: 'spam' })
                .expect(401);
        });

        it('정상 신고 → 200 + { reported: true }', async () => {
            const postId = await seedPost();
            const tokenRes = await getAdopterToken(app);

            const res = await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/report`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ reason: 'spam' })
                .expect(200);

            expect(res.body.data.reported).toBe(true);
            expect(res.body.message).toBe('신고가 접수되었습니다.');

            const doc = await connection.collection('community_post_reports').findOne({});
            expect(doc).not.toBeNull();
            expect(doc?.reason).toBe('spam');
            expect(doc?.status).toBe('pending');
        });

        it('같은 유저 중복 신고 → 200 + { reported: false } 멱등', async () => {
            const postId = await seedPost();
            const tokenRes = await getAdopterToken(app);

            await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/report`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ reason: 'spam' })
                .expect(200);

            const res2 = await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/report`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ reason: 'spam' })
                .expect(200);

            expect(res2.body.data.reported).toBe(false);
        });

        it('존재하지 않는 게시글 → 400', async () => {
            const tokenRes = await getAdopterToken(app);
            await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${new Types.ObjectId()}/report`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ reason: 'spam' })
                .expect(400);
        });

        it('isActive=false 게시글 → 400', async () => {
            const postId = await seedPost({ isActive: false });
            const tokenRes = await getAdopterToken(app);
            await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/report`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ reason: 'spam' })
                .expect(400);
        });

        it('reason 누락 → 400', async () => {
            const postId = await seedPost();
            const tokenRes = await getAdopterToken(app);
            await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/report`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({})
                .expect(400);
        });

        it('유효하지 않은 reason → 400', async () => {
            const postId = await seedPost();
            const tokenRes = await getAdopterToken(app);
            await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/report`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ reason: 'invalid_reason' })
                .expect(400);
        });

        it('선택적 description 포함 → 200', async () => {
            const postId = await seedPost();
            const tokenRes = await getAdopterToken(app);

            const res = await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/report`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ reason: 'other', description: '상세 내용' })
                .expect(200);

            expect(res.body.data.reported).toBe(true);
            const doc = await connection.collection('community_post_reports').findOne({});
            expect(doc?.description).toBe('상세 내용');
        });
    });
});
