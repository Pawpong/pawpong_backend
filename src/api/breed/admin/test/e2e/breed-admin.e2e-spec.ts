import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Connection } from 'mongoose';
import request from 'supertest';

import { createTestingApp, cleanupCollections } from '../../../../../common/test/test-utils';

/**
 * 품종 관리 Admin 종단간 테스트
 *
 * 테스트 대상:
 * 1. 전체 품종 목록 조회 (GET /api/breeds-admin)
 * 2. 특정 품종 조회 (GET /api/breeds-admin/:id)
 * 3. 품종 생성 (POST /api/breeds-admin)
 * 4. 품종 수정 (PATCH /api/breeds-admin/:id)
 * 5. 품종 삭제 (DELETE /api/breeds-admin/:id)
 */
describe('품종 관리 Admin 종단간 테스트', () => {
    let app: INestApplication;
    let existingBreedId: string;
    let createdBreedId: string;

    beforeAll(async () => {
        app = await createTestingApp();

        const connection = app.get<Connection>(getConnectionToken());
        const breedCollection = connection.collection('breeds');

        await cleanupCollections(app, ['breeds']);

        const result = await breedCollection.insertOne({
            _id: new ObjectId(),
            petType: 'dog',
            category: '소형견',
            categoryDescription: '10kg 미만',
            breeds: ['말티즈', '포메라니안', '치와와'],
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        existingBreedId = result.insertedId.toString();
    }, 30000);

    afterAll(async () => {
        await cleanupCollections(app, ['breeds']);
        await app.close();
    });

    describe('GET /api/breeds-admin', () => {
        it('전체 품종 목록 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/breeds-admin')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            console.log('품종 관리자 목록 조회 완료');
        });

        it('응답 형식 검증', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/breeds-admin')
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('code', 200);
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('timestamp');
            console.log('품종 응답 형식 검증 완료');
        });
    });

    describe('GET /api/breeds-admin/:id', () => {
        it('특정 품종 상세 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/breeds-admin/${existingBreedId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                petType: 'dog',
                category: '소형견',
            });
            console.log('특정 품종 상세 조회 완료');
        });

        it('존재하지 않는 ID 조회 시 에러', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/breeds-admin/000000000000000000000000');

            expect([400, 404]).toContain(response.status);
            console.log('존재하지 않는 품종 ID 에러 확인');
        });
    });

    describe('POST /api/breeds-admin', () => {
        it('품종 생성 성공', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/breeds-admin')
                .send({
                    petType: 'cat',
                    category: '단모종',
                    categoryDescription: '털이 짧은 고양이',
                    breeds: ['아비시니안', '벵골', '러시안블루'],
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();

            if (response.body.data?.id) {
                createdBreedId = response.body.data.id;
            }
            console.log('품종 생성 완료');
        });

        it('필수 필드 누락 시 400', async () => {
            await request(app.getHttpServer())
                .post('/api/breeds-admin')
                .send({ petType: 'dog' })
                .expect(400);
            console.log('품종 필수 필드 누락 400 확인');
        });

        it('잘못된 petType 시 400', async () => {
            await request(app.getHttpServer())
                .post('/api/breeds-admin')
                .send({
                    petType: 'bird',
                    category: '테스트',
                    breeds: ['테스트품종'],
                })
                .expect(400);
            console.log('잘못된 petType 400 확인');
        });

        it('breeds 배열 비어 있으면 400', async () => {
            await request(app.getHttpServer())
                .post('/api/breeds-admin')
                .send({
                    petType: 'dog',
                    category: '테스트',
                    breeds: [],
                })
                .expect(400);
            console.log('빈 breeds 배열 400 확인');
        });
    });

    describe('PATCH /api/breeds-admin/:id', () => {
        it('품종 수정 성공', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/api/breeds-admin/${existingBreedId}`)
                .send({
                    categoryDescription: '수정된 설명 - 7kg 미만',
                    breeds: ['말티즈', '포메라니안', '치와와', '비숑프리제'],
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('품종 수정 완료');
        });

        it('존재하지 않는 ID 수정 시 에러', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/breeds-admin/000000000000000000000000')
                .send({ categoryDescription: '수정 테스트' });

            expect([400, 404]).toContain(response.status);
            console.log('존재하지 않는 품종 수정 에러 확인');
        });
    });

    describe('DELETE /api/breeds-admin/:id', () => {
        it('품종 삭제 성공', async () => {
            if (!createdBreedId) {
                // createdBreedId가 없으면 existingBreedId 사용
                const response = await request(app.getHttpServer())
                    .delete(`/api/breeds-admin/${existingBreedId}`)
                    .expect(200);

                expect(response.body.success).toBe(true);
                console.log('품종 삭제 완료 (existingBreedId 사용)');
                return;
            }

            const response = await request(app.getHttpServer())
                .delete(`/api/breeds-admin/${createdBreedId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('품종 삭제 완료');
        });

        it('존재하지 않는 ID 삭제 시 에러', async () => {
            const response = await request(app.getHttpServer())
                .delete('/api/breeds-admin/000000000000000000000000');

            expect([400, 404]).toContain(response.status);
            console.log('존재하지 않는 품종 삭제 에러 확인');
        });
    });
});
