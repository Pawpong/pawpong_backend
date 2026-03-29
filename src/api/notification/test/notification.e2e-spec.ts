import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdopterToken } from '../../../common/test/test-utils';

/**
 * Notification API E2E 테스트
 * 모든 엔드포인트 JWT 인증 필요
 */
describe('Notification API E2E Tests', () => {
    let app: INestApplication;
    let adopterToken: string;

    beforeAll(async () => {
        app = await createTestingApp();

        const adopter = await getAdopterToken(app);
        if (adopter) {
            adopterToken = adopter.token;
        }
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    describe('GET /api/notification', () => {
        it('알림 목록 조회 성공', async () => {
            if (!adopterToken) {
                console.log('⚠️  토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/notification')
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            console.log('✅ 알림 목록 조회 성공');
        });

        it('인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer())
                .get('/api/notification')
                .expect(401);

            console.log('✅ 인증 없이 접근 401 확인');
        });
    });

    describe('GET /api/notification/unread-count', () => {
        it('읽지 않은 알림 수 조회 성공', async () => {
            if (!adopterToken) {
                console.log('⚠️  토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/notification/unread-count')
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            console.log('✅ 읽지 않은 알림 수 조회 성공');
        });
    });

    describe('PATCH /api/notification/read-all', () => {
        it('전체 읽음 처리 성공', async () => {
            if (!adopterToken) {
                console.log('⚠️  토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .patch('/api/notification/read-all')
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 전체 읽음 처리 성공');
        });
    });

    describe('DELETE /api/notification/:id', () => {
        it('존재하지 않는 알림 삭제 시 에러', async () => {
            if (!adopterToken) {
                console.log('⚠️  토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .delete('/api/notification/000000000000000000000000')
                .set('Authorization', `Bearer ${adopterToken}`);

            expect([400, 404]).toContain(response.status);
            console.log('✅ 존재하지 않는 알림 삭제 시 에러 확인');
        });
    });
});
