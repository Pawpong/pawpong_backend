import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import request from 'supertest';

import { createTestingApp, getAdminToken, getAdopterToken } from '../../../../../common/testing/test-utils';

describe('커뮤니티 신고 관리자 E2E', () => {
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

    async function seedReport(postId: string, overrides: Record<string, unknown> = {}): Promise<string> {
        const _id = new Types.ObjectId();
        await connection.collection('community_post_reports').insertOne({
            _id,
            postId: new Types.ObjectId(postId),
            reporterId: new Types.ObjectId(),
            reporterModel: 'Adopter',
            reporterNickname: '신고자',
            reason: 'spam',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        });
        return String(_id);
    }

    describe('GET /api/community-admin/reports', () => {
        it('비인증 → 401', async () => {
            await request(app.getHttpServer()).get('/api/community-admin/reports').expect(401);
        });

        it('입양자 토큰으로 접근 → 403', async () => {
            const adopterToken = await getAdopterToken(app);
            await request(app.getHttpServer())
                .get('/api/community-admin/reports')
                .set('Authorization', `Bearer ${adopterToken!.token}`)
                .expect(403);
        });

        it('관리자 토큰으로 신고 목록 조회 → 200', async () => {
            const postId = await seedPost();
            await seedReport(postId);
            await seedReport(postId);

            const adminToken = await getAdminToken(app);
            const res = await request(app.getHttpServer())
                .get('/api/community-admin/reports')
                .set('Authorization', `Bearer ${adminToken!}`)
                .expect(200);

            expect(res.body.data.items).toHaveLength(2);
            expect(res.body.data.pagination.totalItems).toBe(2);
        });

        it('status=pending 필터 → pending 신고만 반환', async () => {
            const postId = await seedPost();
            await seedReport(postId, { status: 'pending' });
            await seedReport(postId, { status: 'resolved' });

            const adminToken = await getAdminToken(app);
            const res = await request(app.getHttpServer())
                .get('/api/community-admin/reports?status=pending')
                .set('Authorization', `Bearer ${adminToken!}`)
                .expect(200);

            expect(res.body.data.items).toHaveLength(1);
            expect(res.body.data.items[0].status).toBe('pending');
        });
    });

    describe('POST /api/community-admin/reports/:reportId/resolve', () => {
        it('비인증 → 401', async () => {
            await request(app.getHttpServer())
                .post(`/api/community-admin/reports/${new Types.ObjectId()}/resolve`)
                .expect(401);
        });

        it('정상 resolve → 200 + 게시글 isActive=false', async () => {
            const postId = await seedPost();
            const reportId = await seedReport(postId);

            const adminToken = await getAdminToken(app);
            const res = await request(app.getHttpServer())
                .post(`/api/community-admin/reports/${reportId}/resolve`)
                .set('Authorization', `Bearer ${adminToken!}`)
                .expect(200);

            expect(res.body.data.action).toBe('resolve');

            const postDoc = await connection.collection('community_posts').findOne({ _id: new Types.ObjectId(postId) });
            expect(postDoc?.isActive).toBe(false);

            const reportDoc = await connection
                .collection('community_post_reports')
                .findOne({ _id: new Types.ObjectId(reportId) });
            expect(reportDoc?.status).toBe('resolved');
        });

        it('이미 처리된 신고 → 400', async () => {
            const postId = await seedPost();
            const reportId = await seedReport(postId, { status: 'resolved' });

            const adminToken = await getAdminToken(app);
            await request(app.getHttpServer())
                .post(`/api/community-admin/reports/${reportId}/resolve`)
                .set('Authorization', `Bearer ${adminToken!}`)
                .expect(400);
        });

        it('존재하지 않는 신고 → 400', async () => {
            const adminToken = await getAdminToken(app);
            await request(app.getHttpServer())
                .post(`/api/community-admin/reports/${new Types.ObjectId()}/resolve`)
                .set('Authorization', `Bearer ${adminToken!}`)
                .expect(400);
        });
    });

    describe('POST /api/community-admin/reports/:reportId/dismiss', () => {
        it('정상 dismiss → 200 + 게시글 isActive=true 유지', async () => {
            const postId = await seedPost();
            const reportId = await seedReport(postId);

            const adminToken = await getAdminToken(app);
            const res = await request(app.getHttpServer())
                .post(`/api/community-admin/reports/${reportId}/dismiss`)
                .set('Authorization', `Bearer ${adminToken!}`)
                .expect(200);

            expect(res.body.data.action).toBe('dismiss');

            const postDoc = await connection.collection('community_posts').findOne({ _id: new Types.ObjectId(postId) });
            expect(postDoc?.isActive).toBe(true);

            const reportDoc = await connection
                .collection('community_post_reports')
                .findOne({ _id: new Types.ObjectId(reportId) });
            expect(reportDoc?.status).toBe('dismissed');
        });

        it('이미 처리된 신고 → 400', async () => {
            const postId = await seedPost();
            const reportId = await seedReport(postId, { status: 'dismissed' });

            const adminToken = await getAdminToken(app);
            await request(app.getHttpServer())
                .post(`/api/community-admin/reports/${reportId}/dismiss`)
                .set('Authorization', `Bearer ${adminToken!}`)
                .expect(400);
        });
    });
});
