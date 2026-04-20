import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { cleanupDatabase, createTestingApp } from '../../../../common/test/test-utils';

describe('브리더 관리 응답 계약 종단간 테스트', () => {
    let app: INestApplication;
    let breederToken: string;
    let breederId: string;
    let breederName: string;

    beforeAll(async () => {
        app = await createTestingApp();

        const timestamp = Date.now();
        breederName = `브리더관리계약${timestamp}`;

        const breederResponse = await request(app.getHttpServer())
            .post('/api/auth/register/breeder')
            .send({
                email: `breeder_management_contract_${timestamp}@test.com`,
                phoneNumber: '010-9999-8888',
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

        breederToken = breederResponse.body.data.accessToken;
        breederId = breederResponse.body.data.breederId;
    });

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    it('응답 계약을 유지한다', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/breeder-management/dashboard')
            .set('Authorization', `Bearer ${breederToken}`)
            .expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                message: '대시보드 정보가 조회되었습니다.',
            }),
        );

        expect(response.body.data).toEqual(
            expect.objectContaining({
                profileInfo: expect.objectContaining({
                    verificationInfo: expect.objectContaining({
                        verificationStatus: expect.any(String),
                        subscriptionPlan: expect.any(String),
                    }),
                }),
                statisticsInfo: expect.objectContaining({
                    totalApplicationCount: expect.any(Number),
                    pendingApplicationCount: expect.any(Number),
                    completedAdoptionCount: expect.any(Number),
                    averageRating: expect.any(Number),
                    totalReviewCount: expect.any(Number),
                    profileViewCount: expect.any(Number),
                }),
                recentApplicationList: expect.any(Array),
                availablePetCount: expect.any(Number),
            }),
        );
    });

    it('응답 계약을 유지한다', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/breeder-management/profile')
            .set('Authorization', `Bearer ${breederToken}`)
            .expect(200);

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
                breederPhone: '01099998888',
                accountStatus: 'active',
                petType: 'dog',
                marketingAgreed: false,
                breeds: expect.any(Array),
                verificationInfo: expect.any(Object),
                profileInfo: expect.any(Object),
                parentPetInfo: expect.any(Array),
                availablePetInfo: expect.any(Array),
            }),
        );
    });

    it('응답 계약을 유지한다', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/breeder-management/verification')
            .set('Authorization', `Bearer ${breederToken}`)
            .expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                message: '인증 상태가 조회되었습니다.',
            }),
        );

        expect(response.body.data).toEqual(
            expect.objectContaining({
                status: expect.any(String),
                submittedByEmail: expect.any(Boolean),
                documents: expect.any(Array),
            }),
        );
    });
});
