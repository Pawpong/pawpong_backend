import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import request from 'supertest';

import { createTestingApp, getAdopterToken } from '../../../../common/testing/test-utils';

describe('커뮤니티 댓글/답글 CRUD E2E (v2)', () => {
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

    describe('POST /api/v2/community/posts/:postId/comments', () => {
        it('비인증 → 401', async () => {
            const postId = await seedPost();
            await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/comments`)
                .send({ body: '댓글' })
                .expect(401);
        });

        it('정상 댓글 작성 → 200 + commentId 반환 + commentCount +1', async () => {
            const postId = await seedPost();
            const tokenRes = await getAdopterToken(app);

            const res = await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ body: '댓글 내용입니다.' })
                .expect(200);

            expect(res.body.data.commentId).toBeDefined();
            expect(res.body.message).toBe('댓글이 등록되었습니다.');

            const doc = await connection.collection('community_posts').findOne({ _id: new Types.ObjectId(postId) });
            expect(doc?.commentCount).toBe(1);
        });

        it('답글(parentCommentId) → 201 + commentId 반환', async () => {
            const postId = await seedPost();
            const tokenRes = await getAdopterToken(app);

            const commentRes = await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ body: '부모 댓글' })
                .expect(200);

            const parentId = commentRes.body.data.commentId;

            const replyRes = await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ body: '답글입니다.', parentCommentId: parentId })
                .expect(200);

            expect(replyRes.body.data.commentId).toBeDefined();

            const doc = await connection.collection('community_posts').findOne({ _id: new Types.ObjectId(postId) });
            expect(doc?.commentCount).toBe(2);
        });

        it('빈 body → 400', async () => {
            const postId = await seedPost();
            const tokenRes = await getAdopterToken(app);
            await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ body: '   ' })
                .expect(400);
        });

        it('존재하지 않는 게시글 → 400', async () => {
            const tokenRes = await getAdopterToken(app);
            await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${new Types.ObjectId()}/comments`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ body: '댓글' })
                .expect(400);
        });

        it('isActive=false 게시글 → 400', async () => {
            const postId = await seedPost({ isActive: false });
            const tokenRes = await getAdopterToken(app);
            await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ body: '댓글' })
                .expect(400);
        });
    });

    describe('PATCH /api/v2/community/comments/:commentId', () => {
        it('비인증 → 401', async () => {
            await request(app.getHttpServer())
                .patch(`/api/v2/community/comments/${new Types.ObjectId()}`)
                .send({ body: '수정' })
                .expect(401);
        });

        it('정상 수정 → 200 + updated: true', async () => {
            const postId = await seedPost();
            const tokenRes = await getAdopterToken(app);

            const createRes = await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ body: '원래 댓글' });

            const commentId = createRes.body.data.commentId;

            const res = await request(app.getHttpServer())
                .patch(`/api/v2/community/comments/${commentId}`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ body: '수정된 댓글' })
                .expect(200);

            expect(res.body.data.updated).toBe(true);

            const doc = await connection
                .collection('community_post_comments')
                .findOne({ _id: new Types.ObjectId(commentId) });
            expect(doc?.body).toBe('수정된 댓글');
        });

        it('타인 댓글 수정 → 403', async () => {
            const postId = await seedPost();
            const token1 = await getAdopterToken(app);
            const token2 = await getAdopterToken(app);

            const createRes = await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${token1!.token}`)
                .send({ body: '댓글' });

            const commentId = createRes.body.data.commentId;

            await request(app.getHttpServer())
                .patch(`/api/v2/community/comments/${commentId}`)
                .set('Authorization', `Bearer ${token2!.token}`)
                .send({ body: '수정' })
                .expect(403);
        });

        it('존재하지 않는 댓글 → 400', async () => {
            const tokenRes = await getAdopterToken(app);
            await request(app.getHttpServer())
                .patch(`/api/v2/community/comments/${new Types.ObjectId()}`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ body: '수정' })
                .expect(400);
        });
    });

    describe('DELETE /api/v2/community/comments/:commentId', () => {
        it('비인증 → 401', async () => {
            await request(app.getHttpServer()).delete(`/api/v2/community/comments/${new Types.ObjectId()}`).expect(401);
        });

        it('정상 삭제 → 200 + deleted: true + commentCount -1', async () => {
            const postId = await seedPost();
            const tokenRes = await getAdopterToken(app);

            const createRes = await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .send({ body: '댓글' });

            const commentId = createRes.body.data.commentId;

            const res = await request(app.getHttpServer())
                .delete(`/api/v2/community/comments/${commentId}`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .expect(200);

            expect(res.body.data.deleted).toBe(true);

            const postDoc = await connection.collection('community_posts').findOne({ _id: new Types.ObjectId(postId) });
            expect(postDoc?.commentCount).toBe(0);

            const commentDoc = await connection
                .collection('community_post_comments')
                .findOne({ _id: new Types.ObjectId(commentId) });
            expect(commentDoc?.isActive).toBe(false);
        });

        it('타인 댓글 삭제 → 403', async () => {
            const postId = await seedPost();
            const token1 = await getAdopterToken(app);
            const token2 = await getAdopterToken(app);

            const createRes = await request(app.getHttpServer())
                .post(`/api/v2/community/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${token1!.token}`)
                .send({ body: '댓글' });

            const commentId = createRes.body.data.commentId;

            await request(app.getHttpServer())
                .delete(`/api/v2/community/comments/${commentId}`)
                .set('Authorization', `Bearer ${token2!.token}`)
                .expect(403);
        });

        it('존재하지 않는 댓글 → 400', async () => {
            const tokenRes = await getAdopterToken(app);
            await request(app.getHttpServer())
                .delete(`/api/v2/community/comments/${new Types.ObjectId()}`)
                .set('Authorization', `Bearer ${tokenRes!.token}`)
                .expect(400);
        });
    });
});
