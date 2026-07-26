import request from 'supertest';

import {
    BreederManagementE2eContext,
    closeBreederManagementE2eContext,
    createBreederManagementE2eContext,
} from '../fixtures/breeder-management.e2e.fixture';

describe('브리더 관리 부모 개체 종단간 테스트', () => {
    let context: BreederManagementE2eContext;

    beforeAll(async () => {
        context = await createBreederManagementE2eContext();
    });

    afterAll(async () => {
        await closeBreederManagementE2eContext(context);
    });

    describe('부모견 관리', () => {
        it('부모견을 등록, 수정, 삭제한다', async () => {
            const createResponse = await request(context.app.getHttpServer())
                .post('/api/v2/breeder-management/parent-pets')
                .set('Authorization', `Bearer ${context.breederToken}`)
                .send({
                    name: '테스트 부모견',
                    breed: '포메라니안',
                    gender: 'male',
                    birthDate: '2020-01-01',
                    photoFileName: 'parent-pet-test.jpg',
                    description: '건강한 부모견입니다',
                })
                .expect(200);

            const parentPetId = createResponse.body.data.petId;
            expect(parentPetId).toBeDefined();

            await request(context.app.getHttpServer())
                .patch(`/api/v2/breeder-management/parent-pets/${parentPetId}`)
                .set('Authorization', `Bearer ${context.breederToken}`)
                .send({
                    name: '수정된 부모견',
                    description: '업데이트된 설명',
                })
                .expect(200);

            await request(context.app.getHttpServer())
                .delete(`/api/v2/breeder-management/parent-pets/${parentPetId}`)
                .set('Authorization', `Bearer ${context.breederToken}`)
                .expect(200);
        });

        it('개체 관리 경로는 인증 없이 접근할 수 없다', async () => {
            await request(context.app.getHttpServer())
                .post('/api/v2/breeder-management/parent-pets')
                .send({
                    name: '테스트 부모견',
                    breed: '포메라니안',
                    gender: 'female',
                    birthDate: '2020-01-01',
                })
                .expect(401);
        });
    });

    describe('내 후기 조회', () => {
        it('내 후기 목록을 조회한다', async () => {
            const response = await request(context.app.getHttpServer())
                .get('/api/v2/breeder-management/my-reviews')
                .set('Authorization', `Bearer ${context.breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });

        it('필터와 페이지네이션이 있는 내 후기 목록을 조회한다', async () => {
            const response = await request(context.app.getHttpServer())
                .get('/api/v2/breeder-management/my-reviews?page=1&limit=10&visibility=public')
                .set('Authorization', `Bearer ${context.breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });
});
