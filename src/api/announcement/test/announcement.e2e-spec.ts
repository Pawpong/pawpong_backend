import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp } from '../../../common/test/test-utils';

/**
 * Announcement (공지사항 팝업/배너) API E2E 테스트
 * 모든 엔드포인트가 Public
 */
describe('Announcement API E2E Tests', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestingApp();
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/announcement/list', () => {
        it('공지사항 목록 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/announcement/list')
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('✅ 공지사항 목록 조회 성공');
        });
    });

    describe('GET /api/announcement/:announcementId', () => {
        it('존재하지 않는 공지 조회 시 에러', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/announcement/000000000000000000000000');

            expect([400, 404, 500]).toContain(response.status);
            console.log('✅ 존재하지 않는 공지 조회 시 에러 확인');
        });
    });
});
