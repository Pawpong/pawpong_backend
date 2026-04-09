import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Connection } from 'mongoose';
import request from 'supertest';

import { createTestingApp } from '../../../common/test/test-utils';

/**
 * 공지사항 종단간 테스트
 * 모든 엔드포인트가 공개
 */
describe('공지사항 종단간 테스트', () => {
    let app: INestApplication;
    let activeAnnouncementId: string;

    beforeAll(async () => {
        app = await createTestingApp();

        const connection = app.get<Connection>(getConnectionToken());
        const announcements = connection.collection('announcements');

        const firstAnnouncementId = new ObjectId();
        const secondAnnouncementId = new ObjectId();

        activeAnnouncementId = firstAnnouncementId.toString();

        await announcements.insertMany([
            {
                _id: firstAnnouncementId,
                title: '첫 번째 공지',
                content: '첫 번째 공지 내용',
                isActive: true,
                order: 1,
                createdAt: new Date('2026-01-02T00:00:00.000Z'),
                updatedAt: new Date('2026-01-02T00:00:00.000Z'),
            },
            {
                _id: secondAnnouncementId,
                title: '비활성 공지',
                content: '노출되면 안 되는 공지 내용',
                isActive: false,
                order: 0,
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
                updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            },
        ]);
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/announcement/list', () => {
        it('공지사항 목록 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/announcement/list')
                .expect(200);

            expect(response.body.items).toHaveLength(1);
            expect(response.body.items[0]).toMatchObject({
                announcementId: activeAnnouncementId,
                title: '첫 번째 공지',
                content: '첫 번째 공지 내용',
                isActive: true,
                order: 1,
            });
            expect(response.body.pagination).toMatchObject({
                currentPage: 1,
                pageSize: 10,
                totalItems: 1,
                totalPages: 1,
            });
            console.log('공지사항 목록 조회 성공');
        });
    });

    describe('GET /api/announcement/:announcementId', () => {
        it('활성 공지사항 상세 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/announcement/${activeAnnouncementId}`)
                .expect(200);

            expect(response.body).toMatchObject({
                announcementId: activeAnnouncementId,
                title: '첫 번째 공지',
                content: '첫 번째 공지 내용',
                isActive: true,
                order: 1,
            });
            console.log('활성 공지 상세 조회 성공');
        });

        it('존재하지 않는 공지 조회 시 에러', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/announcement/000000000000000000000000');

            expect([400, 404, 500]).toContain(response.status);
            console.log('존재하지 않는 공지 조회 시 에러 확인');
        });
    });
});
