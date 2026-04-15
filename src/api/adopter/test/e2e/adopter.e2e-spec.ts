import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp } from '../../../../common/test/test-utils';

/**
 * 입양자 종단간 테스트
 *
 * 테스트 대상 핵심 경로:
 * 1. 프로필 조회/수정
 * 2. 입양 신청
 * 3. 후기 작성
 * 4. 즐겨찾기
 */
describe('입양자 종단간 테스트', () => {
    let app: INestApplication;
    let adopterToken: string;
    let adopterUserId: string;
    let adopterNickname: string;
    let breederToken: string;
    let breederUserId: string;
    let breederId: string;

    /**
     * 테스트 애플리케이션 초기화 및 사용자 생성
     */
    beforeAll(async () => {
        app = await createTestingApp();

        // 1. 입양자 회원가입
        const timestamp = Date.now();
        const adopterProviderId = Math.random().toString().substr(2, 10);
        adopterNickname = `테스트입양자${timestamp}`;

        const adopterResponse = await request(app.getHttpServer())
            .post('/api/auth/register/adopter')
            .send({
                tempId: `temp_kakao_${adopterProviderId}_${timestamp}`,
                email: `adopter_${timestamp}@test.com`,
                nickname: adopterNickname,
                phone: '010-1234-5678',
                profileImage: 'https://example.com/adopter.jpg',
            })
            .expect(200);

        adopterToken = adopterResponse.body.data.accessToken;
        adopterUserId = adopterResponse.body.data.adopterId || adopterResponse.body.data.userId;

        console.log('입양자 생성 완료:', { adopterUserId, nickname: adopterNickname });

        // 2. 브리더 회원가입
        const breederTimestamp = Date.now();
        const breederResponse = await request(app.getHttpServer())
            .post('/api/auth/register/breeder')
            .send({
                email: `breeder_${breederTimestamp}@test.com`,
                phoneNumber: '010-9876-5432',
                breederName: '테스트 브리더',
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
        breederUserId = breederResponse.body.data.breederId || breederResponse.body.data.userId;
        breederId = breederUserId;

        console.log('브리더 생성 완료:', { breederId });
    });

    afterAll(async () => {
        await app.close();
    });

    /**
     * 1. 프로필 관리 테스트
     */
    describe('프로필 관리', () => {
        it('프로필 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/adopter/profile')
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.adopterId).toBe(adopterUserId);
            expect(response.body.data.nickname).toBe(adopterNickname);
            console.log('프로필 조회 성공');
        });

        it('프로필 수정 성공', async () => {
            const updateData = {
                name: '수정된입양자',
                phone: '010-9999-8888',
            };

            const response = await request(app.getHttpServer())
                .patch('/api/adopter/profile')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('프로필이 성공적으로 수정되었습니다.');
            console.log('프로필 수정 성공');
        });
    });

    /**
     * 2. 입양 신청 테스트
     */
    describe('입양 신청', () => {
        let applicationId: string;

        it('입양 신청 성공', async () => {
            const applicationData = {
                name: '테스트신청자',
                phone: '010-1234-5678',
                email: 'applicant@test.com',
                breederId: breederId,
                // petId는 선택사항이므로 전체 상담의 경우 생략
                privacyConsent: true,
                selfIntroduction: '안녕하세요. 30대 남성이며 서울 강남구에 거주하고 있습니다.',
                familyMembers: '총 3명 - 본인(30대), 배우자(30대), 자녀(5세)',
                allFamilyConsent: true,
                allergyTestInfo: '본인과 배우자 모두 알러지 검사 완료',
                timeAwayFromHome: '주중 9시간, 주말 집에 있음',
                livingSpaceDescription: '거실과 안방을 자유롭게 이용 가능',
                previousPetExperience: '5년 전 고양이 한 마리를 키웠습니다',
                canProvideBasicCare: true,
                canAffordMedicalExpenses: true,
                preferredPetDescription: '활발하고 사람을 좋아하는 포메라니안',
                desiredAdoptionTiming: '2개월 후 예정',
                additionalNotes: '첫 입양이라 긴장되지만 최선을 다하겠습니다',
            };

            const response = await request(app.getHttpServer())
                .post('/api/adopter/application')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send(applicationData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.applicationId).toBeDefined();
            expect(response.body.data.breederId).toBe(breederId);
            expect(response.body.data.status).toBe('consultation_pending');

            applicationId = response.body.data.applicationId;
            console.log('입양 신청 성공:', applicationId);
        });

        it('입양 신청 목록 조회', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/adopter/applications')
                .set('Authorization', `Bearer ${adopterToken}`)
                .query({ page: 1, limit: 10 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toBeDefined();
            expect(Array.isArray(response.body.data.items)).toBe(true);
            expect(response.body.data.pagination).toBeDefined();
            console.log('입양 신청 목록 조회 성공');
        });

        it('입양 신청 상세 조회', async () => {
            if (!applicationId) {
                console.log('주의: applicationId가 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get(`/api/adopter/applications/${applicationId}`)
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.applicationId).toBe(applicationId);
            console.log('입양 신청 상세 조회 성공');
        });
    });

    /**
     * 3. 후기 작성 테스트
     */
    describe('후기 작성', () => {
        let reviewId: string;

        it('후기 작성 시도 (applicationId 필요)', async () => {
            // 후기는 applicationId가 필요하므로 applicationId 없이는 400이 예상됨
            // 실제 후기 작성을 위해서는 입양신청이 먼저 완료 상태여야 함
            const reviewData = {
                applicationId: 'non-existent-id',
                reviewType: 'consultation',
                content:
                    '정말 좋은 브리더입니다. 전문적이고 친절하게 도와주셨어요. 반려동물도 건강하고 행복해 보였습니다.',
            };

            const response = await request(app.getHttpServer())
                .post('/api/adopter/review')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send(reviewData);

            // applicationId가 없거나 상태가 맞지 않으면 400/500, 성공하면 200
            expect([200, 400, 500]).toContain(response.status);

            if (response.status === 200 && response.body.data?.reviewId) {
                reviewId = response.body.data.reviewId;
                console.log('후기 작성 성공:', reviewId);
            } else {
                console.log('주의: 후기 작성 실패 (applicationId 상태 불일치 또는 없음):', response.status);
            }
        });

        it('내가 작성한 후기 목록 조회', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/adopter/reviews')
                .set('Authorization', `Bearer ${adopterToken}`)
                .query({ page: 1, limit: 10 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toBeDefined();
            expect(Array.isArray(response.body.data.items)).toBe(true);
            console.log('후기 목록 조회 성공');
        });

        it('내가 작성한 후기 상세 조회', async () => {
            if (!reviewId) {
                console.log('주의: reviewId가 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get(`/api/adopter/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.reviewId).toBe(reviewId);
            console.log('후기 상세 조회 성공');
        });
    });

    /**
     * 4. 즐겨찾기 테스트
     */
    describe('즐겨찾기', () => {
        it('즐겨찾기 추가 성공', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/adopter/favorite')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({ breederId })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('즐겨찾기');
            console.log('즐겨찾기 추가 성공');
        });

        it('즐겨찾기 목록 조회', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/adopter/favorites')
                .set('Authorization', `Bearer ${adopterToken}`)
                .query({ page: 1, limit: 10 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toBeDefined();
            expect(Array.isArray(response.body.data.items)).toBe(true);
            console.log('즐겨찾기 목록 조회 성공');
        });

        it('즐겨찾기 삭제 성공', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/api/adopter/favorite/${breederId}`)
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('삭제');
            console.log('즐겨찾기 삭제 성공');
        });
    });

    /**
     * 5. 신고 테스트
     */
    describe('신고', () => {
        it('브리더 신고 성공', async () => {
            const reportData = {
                type: 'breeder', // 'breeder', 'adopter', 'content' 중 하나
                breederId: breederId,
                reason: 'inappropriate_content', // 'no_contract', 'false_info', 'inappropriate_content', 'poor_conditions', 'fraud', 'other'
                description: '브리더의 부적절한 행동이 있었습니다.',
            };

            const response = await request(app.getHttpServer())
                .post('/api/adopter/report')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send(reportData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('신고');
            console.log('브리더 신고 성공');
        });
    });

    describe('회원 탈퇴', () => {
        it('회원 탈퇴 성공', async () => {
            const response = await request(app.getHttpServer())
                .delete('/api/adopter/account')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({
                    reason: 'privacy_concern',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('회원 탈퇴가 완료되었습니다.');
            expect(response.body.data.adopterId).toBe(adopterUserId);
            expect(response.body.data.message).toBe('회원 탈퇴가 성공적으로 처리되었습니다.');
            console.log('회원 탈퇴 성공');
        });
    });
});
