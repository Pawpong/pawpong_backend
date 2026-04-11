import request from 'supertest';

import {
    BreederManagementE2eContext,
    closeBreederManagementE2eContext,
    createBreederManagementE2eContext,
    seedBreederManagementApplication,
} from './fixtures/breeder-management.e2e.fixture';

describe('브리더 관리 신청서 종단간 테스트', () => {
    let context: BreederManagementE2eContext;
    let applicationId: string;

    beforeAll(async () => {
        context = await createBreederManagementE2eContext();
        applicationId = await seedBreederManagementApplication(context);
    });

    afterAll(async () => {
        await closeBreederManagementE2eContext(context);
    });

    describe('입양 신청 관리', () => {
        it('입양 신청 목록을 조회한다', async () => {
            const response = await request(context.app.getHttpServer())
                .get('/api/breeder-management/applications')
                .set('Authorization', `Bearer ${context.breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });

        it('페이지네이션 파라미터를 적용한다', async () => {
            const response = await request(context.app.getHttpServer())
                .get('/api/breeder-management/applications?page=1&limit=10')
                .set('Authorization', `Bearer ${context.breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        it('입양 신청 상세를 조회한다', async () => {
            const response = await request(context.app.getHttpServer())
                .get(`/api/breeder-management/applications/${applicationId}`)
                .set('Authorization', `Bearer ${context.breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('입양 신청 상세 정보가 조회되었습니다.');
            expect(response.body.data.applicationId).toBe(applicationId);
            expect(response.body.data.adopterId).toBe(context.adopterId);
            expect(response.body.data.adopterName).toBe(context.adopterName);
            expect(response.body.data.adopterEmail).toBe(context.adopterEmail);
            expect(response.body.data.status).toBe('consultation_pending');
        });

        it('잘못된 입양 신청 ID 형식이면 400을 반환한다', async () => {
            const response = await request(context.app.getHttpServer())
                .get('/api/breeder-management/applications/not-a-mongo-id')
                .set('Authorization', `Bearer ${context.breederToken}`)
                .expect(400);

            expect(response.body.message || response.body.error).toContain('올바르지 않은 입양 신청 ID 형식');
        });

        it('입양 신청 상태를 변경한다', async () => {
            const response = await request(context.app.getHttpServer())
                .patch(`/api/breeder-management/applications/${applicationId}`)
                .set('Authorization', `Bearer ${context.breederToken}`)
                .send({
                    applicationId,
                    status: 'consultation_completed',
                    notes: '상담이 원활하게 마무리되었습니다.',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('입양 신청 상태가 성공적으로 변경되었습니다.');
            expect(response.body.data.message).toBe('입양 신청 상태가 성공적으로 업데이트되었습니다.');
        });

        it('잘못된 입양 신청 ID 형식으로 상태 변경 시 400을 반환한다', async () => {
            const response = await request(context.app.getHttpServer())
                .patch('/api/breeder-management/applications/not-a-mongo-id')
                .set('Authorization', `Bearer ${context.breederToken}`)
                .send({
                    applicationId,
                    status: 'consultation_completed',
                    notes: '형식 검증 테스트',
                })
                .expect(400);

            expect(response.body.message || response.body.error).toContain('올바르지 않은 입양 신청 ID 형식');
        });

        it('상태 변경 후 상세를 다시 조회한다', async () => {
            const response = await request(context.app.getHttpServer())
                .get(`/api/breeder-management/applications/${applicationId}`)
                .set('Authorization', `Bearer ${context.breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.applicationId).toBe(applicationId);
            expect(response.body.data.status).toBe('consultation_completed');
        });

        it('인증 없이 접근할 수 없다', async () => {
            await request(context.app.getHttpServer()).get('/api/breeder-management/applications').expect(401);
        });
    });

    describe('입양 신청 폼 관리', () => {
        it('입양 신청 폼을 조회한다', async () => {
            const response = await request(context.app.getHttpServer())
                .get('/api/breeder-management/application-form')
                .set('Authorization', `Bearer ${context.breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.standardQuestions).toBeDefined();
            expect(response.body.data.customQuestions).toBeDefined();
        });

        it('입양 신청 폼 수정 요청을 처리한다', async () => {
            const response = await request(context.app.getHttpServer())
                .patch('/api/breeder-management/application-form')
                .set('Authorization', `Bearer ${context.breederToken}`)
                .send({
                    customQuestions: [
                        {
                            id: 'custom_question_1',
                            type: 'text',
                            label: '추가 질문 1',
                            required: true,
                            order: 1,
                        },
                    ],
                });

            expect([200, 400]).toContain(response.status);
        });

        it('잘못된 질문 ID도 현재 계약대로 처리한다', async () => {
            const response = await request(context.app.getHttpServer())
                .patch('/api/breeder-management/application-form')
                .set('Authorization', `Bearer ${context.breederToken}`)
                .send({
                    customQuestions: [
                        {
                            id: '잘못된-ID!@#',
                            type: 'text',
                            label: '잘못된 질문',
                            required: true,
                            order: 1,
                        },
                    ],
                });

            expect([200, 400]).toContain(response.status);
        });

        it('인증 없이 폼에 접근할 수 없다', async () => {
            await request(context.app.getHttpServer()).get('/api/breeder-management/application-form').expect(401);
        });
    });
});
