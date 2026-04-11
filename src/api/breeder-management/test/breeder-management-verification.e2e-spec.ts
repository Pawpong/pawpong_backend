import request from 'supertest';

import {
    BreederManagementE2eContext,
    closeBreederManagementE2eContext,
    createBreederManagementE2eContext,
} from './fixtures/breeder-management.e2e.fixture';

describe('브리더 관리 인증 종단간 테스트', () => {
    let context: BreederManagementE2eContext;
    let uploadedDocuments: Array<{ type: string; fileName: string; originalFileName?: string }> = [];

    beforeAll(async () => {
        context = await createBreederManagementE2eContext();
    });

    afterAll(async () => {
        await closeBreederManagementE2eContext(context);
    });

    it('인증 상태를 조회한다', async () => {
        const response = await request(context.app.getHttpServer())
            .get('/api/breeder-management/verification')
            .set('Authorization', `Bearer ${context.breederToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
    });

    it('인증 신청 요청을 처리한다', async () => {
        const response = await request(context.app.getHttpServer())
            .post('/api/breeder-management/verification')
            .set('Authorization', `Bearer ${context.breederToken}`)
            .send({
                documents: ['document1.pdf', 'document2.pdf'],
                businessNumber: '123-45-67890',
            });

        expect([200, 400]).toContain(response.status);
    });

    it('인증 서류 업로드 응답 계약을 유지한다', async () => {
        const response = await request(context.app.getHttpServer())
            .post('/api/breeder-management/verification/upload')
            .set('Authorization', `Bearer ${context.breederToken}`)
            .field('types', JSON.stringify(['idCard', 'businessLicense']))
            .field('level', 'new')
            .attach('files', context.verificationUploadTestFileBuffer, context.verificationUploadTestFileName)
            .attach('files', context.verificationUploadTestFileBuffer, context.verificationUploadTestFileName)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('new 레벨 브리더 인증 서류 2개가 업로드되었습니다.');
        expect(response.body.data.count).toBe(2);
        expect(response.body.data.documents).toHaveLength(2);
        uploadedDocuments = response.body.data.documents;
    });

    it('인증 서류 제출 응답 계약을 유지한다', async () => {
        const response = await request(context.app.getHttpServer())
            .post('/api/breeder-management/verification/submit')
            .set('Authorization', `Bearer ${context.breederToken}`)
            .send({
                level: 'new',
                documents: uploadedDocuments.map((document) => ({
                    type: document.type,
                    fileName: document.fileName,
                    originalFileName: document.originalFileName,
                })),
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('입점 서류 제출이 완료되었습니다.');
        expect(response.body.data).toEqual({
            message: '입점 서류 제출이 완료되었습니다. 관리자 검토 후 결과를 알려드립니다.',
        });
    });

    it('인증 경로는 인증 없이 접근할 수 없다', async () => {
        await request(context.app.getHttpServer()).get('/api/breeder-management/verification').expect(401);
    });
});
