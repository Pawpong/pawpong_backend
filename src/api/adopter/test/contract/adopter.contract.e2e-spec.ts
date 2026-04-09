import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { cleanupDatabase, createTestingApp } from '../../../../common/test/test-utils';

describe('입양자 응답 계약 종단간 테스트', () => {
    let app: INestApplication;
    let adopterToken: string;
    let adopterId: string;
    let adopterNickname: string;
    let breederId: string;
    let breederName: string;

    beforeAll(async () => {
        app = await createTestingApp();

        const timestamp = Date.now();
        const adopterProviderId = Math.random().toString().slice(2, 12);
        adopterNickname = `계약입양자${timestamp}`;
        breederName = `계약브리더${timestamp}`;

        const adopterResponse = await request(app.getHttpServer())
            .post('/api/auth/register/adopter')
            .send({
                tempId: `temp_kakao_${adopterProviderId}_${timestamp}`,
                email: `adopter_contract_${timestamp}@test.com`,
                nickname: adopterNickname,
                phone: '010-1234-5678',
                profileImage: 'https://example.com/adopter-contract.jpg',
            })
            .expect(200);

        adopterToken = adopterResponse.body.data.accessToken;
        adopterId = adopterResponse.body.data.adopterId;

        const breederResponse = await request(app.getHttpServer())
            .post('/api/auth/register/breeder')
            .send({
                email: `breeder_contract_${timestamp}@test.com`,
                phoneNumber: '010-8765-4321',
                breederName,
                breederLocation: {
                    city: '서울특별시',
                    district: '강남구',
                },
                animal: 'dog',
                breeds: ['포메라니안'],
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

    it('응답 계약을 유지한다', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/adopter/profile')
            .set('Authorization', `Bearer ${adopterToken}`)
            .expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                message: '입양자 프로필이 조회되었습니다.',
            }),
        );

        expect(response.body.data).toEqual(
            expect.objectContaining({
                adopterId,
                nickname: adopterNickname,
                emailAddress: expect.any(String),
                phoneNumber: '01012345678',
                accountStatus: 'active',
                authProvider: 'kakao',
                marketingAgreed: false,
                favoriteBreederList: expect.any(Array),
                adoptionApplicationList: expect.any(Array),
                writtenReviewList: expect.any(Array),
                profileImageFileName: expect.any(String),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            }),
        );
    });

    it('응답 계약을 유지한다', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/adopter/application')
            .set('Authorization', `Bearer ${adopterToken}`)
            .send({
                name: '계약테스트신청자',
                phone: '010-1234-5678',
                email: 'contract-applicant@test.com',
                breederId,
                privacyConsent: true,
                selfIntroduction: '계약 테스트용 자기소개입니다.',
                familyMembers: '2명',
                allFamilyConsent: true,
                allergyTestInfo: '이상 없음',
                timeAwayFromHome: '주중 8시간',
                livingSpaceDescription: '아파트',
                previousPetExperience: '강아지 반려 경험 있음',
                canProvideBasicCare: true,
                canAffordMedicalExpenses: true,
                preferredPetDescription: '소형견 선호',
                desiredAdoptionTiming: '즉시',
                additionalNotes: '계약 테스트',
            })
            .expect(201);

        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                message: '입양 신청이 성공적으로 제출되었습니다.',
            }),
        );

        expect(response.body.data).toEqual(
            expect.objectContaining({
                applicationId: expect.any(String),
                breederId,
                breederName,
                status: 'consultation_pending',
                appliedAt: expect.any(String),
                message: '입양 상담 신청이 성공적으로 접수되었습니다. 브리더의 응답을 기다려주세요.',
            }),
        );
    });

    it('응답 계약을 유지한다', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/adopter/applications')
            .set('Authorization', `Bearer ${adopterToken}`)
            .query({ page: 1, limit: 10 })
            .expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                message: '입양 신청 목록이 조회되었습니다.',
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

        expect(response.body.data.items[0]).toEqual(
            expect.objectContaining({
                applicationId: expect.any(String),
                breederId,
                breederName,
                status: 'consultation_pending',
                appliedAt: expect.any(String),
                applicationDate: expect.any(String),
                customResponses: expect.any(Array),
            }),
        );
    });
});
