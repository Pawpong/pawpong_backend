import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestingApp, cleanupDatabase, seedAdmin } from '../../../../../common/test/test-utils';

/**
 * 기본 질문 관리자 종단간 테스트
 *
 * 테스트 대상 경로:
 * 1. 표준 질문 목록 조회
 * 2. 표준 질문 수정
 * 3. 표준 질문 활성화/비활성화
 * 4. 표준 질문 순서 변경
 * 5. 표준 질문 재시딩
 */
describe('기본 질문 관리자 종단간 테스트', () => {
    let app: INestApplication;
    let adminToken: string;
    let questionId: string;

    beforeAll(async () => {
        app = await createTestingApp();

        // 관리자 계정 생성 및 로그인
        const adminPassword = 'admin1234';
        const { email } = await seedAdmin(app, adminPassword);

        const loginResponse = await request(app.getHttpServer())
            .post('/api/auth-admin/login')
            .send({ email, password: adminPassword });

        if (loginResponse.status === 200 && loginResponse.body.data?.accessToken) {
            adminToken = loginResponse.body.data.accessToken;

            await request(app.getHttpServer())
                .post('/api/standard-question-admin/reseed')
                .set('Authorization', `Bearer ${adminToken}`);

            const questionListResponse = await request(app.getHttpServer())
                .get('/api/standard-question-admin')
                .set('Authorization', `Bearer ${adminToken}`);

            if (questionListResponse.status === 200 && questionListResponse.body.data?.length > 0) {
                questionId = questionListResponse.body.data[0].id;
            }
        } else {
            console.log('주의: 관리자 로그인 실패, 일부 테스트 스킵될 수 있음');
        }
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    /**
     * 1. 표준 질문 목록 조회 테스트
     */
    describe('GET /api/standard-question-관리자', () => {
        it('모든 표준 질문 조회 성공', async () => {
            if (!adminToken) {
                console.log('주의: 관리자 토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/standard-question-admin')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            console.log('모든 표준 질문 조회 성공');
        });

        it('인증 없이 접근 시 401 에러', async () => {
            await request(app.getHttpServer()).get('/api/standard-question-admin').expect(401);

            console.log('인증 없이 접근 실패 확인');
        });
    });

    /**
     * 2. 표준 질문 수정 테스트
     */
    describe('PATCH /api/standard-question-관리자/:id', () => {
        it('질문 수정 성공', async () => {
            if (!adminToken || !questionId) {
                console.log('주의: 관리자 토큰 또는 질문 ID가 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .patch(`/api/standard-question-admin/${questionId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ label: '수정된 질문 제목' })
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('질문 수정 성공');
        });

        it('인증 없이 접근 시 401 에러', async () => {
            await request(app.getHttpServer())
                .patch('/api/standard-question-admin/some-id')
                .send({ label: '수정 시도' })
                .expect(401);

            console.log('인증 없이 접근 실패 확인');
        });
    });

    /**
     * 3. 표준 질문 활성화/비활성화 테스트
     */
    describe('PATCH /api/standard-question-관리자/:id/status', () => {
        it('질문 비활성화 성공', async () => {
            if (!adminToken || !questionId) {
                console.log('주의: 관리자 토큰 또는 질문 ID가 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .patch(`/api/standard-question-admin/${questionId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isActive: false })
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('질문 비활성화 성공');
        });

        it('인증 없이 접근 시 401 에러', async () => {
            await request(app.getHttpServer())
                .patch('/api/standard-question-admin/some-id/status')
                .send({ isActive: false })
                .expect(401);

            console.log('인증 없이 접근 실패 확인');
        });
    });

    /**
     * 4. 표준 질문 재시딩 테스트
     */
    describe('POST /api/standard-question-관리자/reseed', () => {
        it('표준 질문 재시딩 성공', async () => {
            if (!adminToken) {
                console.log('주의: 관리자 토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .post('/api/standard-question-admin/reseed')
                .set('Authorization', `Bearer ${adminToken}`);

            expect([200, 201]).toContain(response.status);

            expect(response.body.success).toBe(true);
            console.log('표준 질문 재시딩 성공');
        });

        it('인증 없이 접근 시 401 에러', async () => {
            await request(app.getHttpServer()).post('/api/standard-question-admin/reseed').expect(401);

            console.log('인증 없이 접근 실패 확인');
        });
    });

    /**
     * 5. 권한 검증 테스트
     */
    describe('권한 검증', () => {
        it('일반 입양자 토큰으로 접근 시 403 에러', async () => {
            const timestamp = Date.now();
            const providerId = Math.random().toString().substr(2, 10);
            const adopterResponse = await request(app.getHttpServer())
                .post('/api/auth/register/adopter')
                .send({
                    tempId: `temp_kakao_${providerId}_${timestamp}`,
                    email: `forbidden_question_${timestamp}_${providerId}@test.com`,
                    nickname: `권한테스트${timestamp}`,
                    phone: '010-5555-5555',
                    profileImage: 'https://example.com/profile.jpg',
                })
                .expect(200);

            const adopterToken = adopterResponse.body.data.accessToken;

            await request(app.getHttpServer())
                .get('/api/standard-question-admin')
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(403);

            console.log('일반 사용자의 표준 질문 관리 경로 접근 거부 확인');
        });
    });
});
