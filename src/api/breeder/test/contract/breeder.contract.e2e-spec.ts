import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { cleanupDatabase, createTestingApp } from '../../../../common/test/test-utils';

describe('Breeder Contract E2E', () => {
    let app: INestApplication;
    let breederId: string;
    let breederName: string;

    beforeAll(async () => {
        app = await createTestingApp();

        const timestamp = Date.now();
        breederName = `브리더공개계약${timestamp}`;

        const breederResponse = await request(app.getHttpServer())
            .post('/api/auth/register/breeder')
            .send({
                email: `breeder_contract_public_${timestamp}@test.com`,
                phoneNumber: '010-4444-5555',
                breederName,
                breederLocation: {
                    city: '서울특별시',
                    district: '강남구',
                },
                animal: 'dog',
                breeds: ['포메라니안', '말티즈'],
                plan: 'basic',
                level: 'new',
                agreements: {
                    termsOfService: true,
                    privacyPolicy: true,
                    marketingConsent: false,
                },
            })
            .expect(200);

        breederId = breederResponse.body.data.breederId;
    });

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    it('GET /api/breeder/search keeps the response contract', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/breeder/search')
            .query({
                petType: 'dog',
                cityName: '서울',
                page: 1,
                limit: 10,
            })
            .expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                message: '브리더 검색이 완료되었습니다.',
            }),
        );

        expect(response.body.data).toEqual(
            expect.objectContaining({
                items: expect.any(Array),
                pagination: expect.objectContaining({
                    currentPage: 1,
                    pageSize: 10,
                    totalItems: expect.any(Number),
                    totalPages: expect.any(Number),
                    hasNextPage: expect.any(Boolean),
                    hasPrevPage: expect.any(Boolean),
                }),
            }),
        );

        if (response.body.data.items.length > 0) {
            expect(response.body.data.items[0]).toEqual(
                expect.objectContaining({
                    breederId: expect.any(String),
                    breederName: expect.any(String),
                    location: expect.any(String),
                    specialization: expect.anything(),
                    averageRating: expect.any(Number),
                    totalReviews: expect.any(Number),
                    profilePhotos: expect.any(Array),
                    verificationStatus: expect.any(String),
                    availablePets: expect.any(Number),
                }),
            );
        }
    });

    it('GET /api/breeder/popular keeps the response contract', async () => {
        const response = await request(app.getHttpServer()).get('/api/breeder/popular').expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                message: '인기 브리더 목록이 조회되었습니다.',
                data: expect.any(Array),
            }),
        );
    });

    it('GET /api/breeder/:id keeps the response contract', async () => {
        const response = await request(app.getHttpServer()).get(`/api/breeder/${breederId}`).expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                message: '브리더 프로필이 조회되었습니다.',
            }),
        );

        expect(response.body.data).toEqual(
            expect.objectContaining({
                breederId,
                breederName,
                breederEmail: expect.any(String),
                petType: 'dog',
                breeds: expect.any(Array),
                representativePhotos: expect.any(Array),
                availablePets: expect.any(Array),
                parentPets: expect.any(Array),
                reviews: expect.any(Array),
                reviewStats: expect.objectContaining({
                    totalReviews: expect.any(Number),
                    averageRating: expect.any(Number),
                }),
                createdAt: expect.any(String),
            }),
        );
    });
});
