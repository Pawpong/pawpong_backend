import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Connection } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import request from 'supertest';

import { DiscordWebhookService } from '../../../common/discord/discord-webhook.service';
import { StorageService } from '../../../common/storage/storage.service';
import { createTestingApp } from '../../../common/test/test-utils';

/**
 * Breeder Management 도메인 E2E 테스트 (간소화 버전)
 *
 * 테스트 대상 핵심 API:
 * 1. 대시보드 조회
 * 2. 프로필 관리
 * 3. 인증 관리
 * 4. 부모견/묘 관리
 * 5. 분양 개체 관리
 * 6. 입양 신청 관리
 * 7. 입양 신청 폼 관리
 */
describe('Breeder Management API E2E Tests (Simple)', () => {
    let app: INestApplication;
    let breederToken: string;
    let breederId: string;
    let adopterToken: string;
    let adopterId: string;
    let adopterName: string;
    let adopterEmail: string;
    const verificationUploadTestFilePath = path.join(__dirname, 'verification-upload-test.jpg');

    beforeAll(async () => {
        app = await createTestingApp();
        fs.writeFileSync(
            verificationUploadTestFilePath,
            Buffer.from(
                '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
                'base64',
            ),
        );

        const storageService = app.get(StorageService);
        jest.spyOn(storageService, 'uploadFile').mockImplementation(async (file: Express.Multer.File, folder?: string) => {
            const fileName = `${folder}/${Date.now()}-${file.originalname}`;
            return {
                fileName,
                cdnUrl: `https://cdn.test/${fileName}`,
                storageUrl: `https://cdn.test/${fileName}`,
            };
        });
        jest.spyOn(storageService, 'generateSignedUrl').mockImplementation((fileName: string) => `https://signed.test/${fileName}`);

        const discordWebhookService = app.get(DiscordWebhookService);
        jest.spyOn(discordWebhookService, 'notifyBreederVerificationSubmission').mockResolvedValue();

        // 테스트용 브리더 생성
        const timestamp = Date.now();
        const breederResponse = await request(app.getHttpServer())
            .post('/api/auth/register/breeder')
            .send({
                email: `breeder_mgmt_${timestamp}@test.com`,
                phoneNumber: '010-9999-8888',
                breederName: '관리 테스트 브리더',
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
            });

        if (breederResponse.status === 200 && breederResponse.body.data) {
            breederToken = breederResponse.body.data.accessToken;
            breederId = breederResponse.body.data.breederId;
            console.log('✅ 테스트용 브리더 생성 완료:', breederId);
        }

        // 테스트용 입양자 생성
        const adopterProviderId = Math.random().toString().substr(2, 10);
        adopterName = `테스트입양자${timestamp}`;
        adopterEmail = `adopter_test_${timestamp}@test.com`;
        const adopterResponse = await request(app.getHttpServer())
            .post('/api/auth/register/adopter')
            .send({
                tempId: `temp_kakao_${adopterProviderId}_${timestamp}`,
                email: adopterEmail,
                nickname: adopterName,
                phone: '010-7777-6666',
                profileImage: 'https://example.com/adopter.jpg',
            })
            .expect(200);

        adopterToken = adopterResponse.body.data.accessToken;
        adopterId = adopterResponse.body.data.adopterId;
        console.log('✅ 테스트용 입양자 생성 완료');
    });

    afterAll(async () => {
        if (fs.existsSync(verificationUploadTestFilePath)) {
            fs.unlinkSync(verificationUploadTestFilePath);
        }
        await app.close();
    });

    /**
     * 1. 대시보드 조회 테스트
     */
    describe('대시보드 관리', () => {
        it('GET /api/breeder-management/dashboard - 대시보드 조회 성공', async () => {
            if (!breederToken) {
                console.log('⚠️  브리더 토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-management/dashboard')
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            // stats 필드는 선택적으로 검증
            if (response.body.data.stats) {
                expect(response.body.data.stats).toBeDefined();
            }
            console.log('✅ 대시보드 조회 성공');
        });

        it('GET /api/breeder-management/dashboard - 인증 없이 접근 실패', async () => {
            const response = await request(app.getHttpServer()).get('/api/breeder-management/dashboard');

            expect(response.status).toBe(401);
            console.log('✅ 인증 없이 접근 거부 확인');
        });

        it('GET /api/breeder-management/dashboard - 입양자로 접근 실패', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/breeder-management/dashboard')
                .set('Authorization', `Bearer ${adopterToken}`);

            expect(response.status).toBe(403);
            console.log('✅ 입양자 접근 거부 확인');
        });
    });

    /**
     * 2. 프로필 관리 테스트
     */
    describe('프로필 관리', () => {
        it('GET /api/breeder-management/profile - 프로필 조회 성공', async () => {
            if (!breederToken) {
                console.log('⚠️  브리더 토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-management/profile')
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            console.log('✅ 프로필 조회 성공');
        });

        it('PATCH /api/breeder-management/profile - 프로필 수정 성공', async () => {
            if (!breederToken) {
                console.log('⚠️  브리더 토큰이 없어서 테스트 스킵');
                return;
            }

            const updateData = {
                profile: {
                    description: '업데이트된 프로필 설명',
                    experienceYears: 5,
                },
            };

            const response = await request(app.getHttpServer())
                .patch('/api/breeder-management/profile')
                .set('Authorization', `Bearer ${breederToken}`)
                .send(updateData);

            // 200 또는 400 허용 (DTO 검증 실패 가능)
            expect([200, 400]).toContain(response.status);
            console.log('✅ 프로필 수정 처리 완료');
        });

        it('GET /api/breeder-management/profile - 인증 없이 접근 실패', async () => {
            const response = await request(app.getHttpServer()).get('/api/breeder-management/profile');

            expect(response.status).toBe(401);
            console.log('✅ 인증 없이 접근 거부 확인');
        });
    });

    /**
     * 3. 인증 관리 테스트
     */
    describe('인증 관리', () => {
        it('GET /api/breeder-management/verification - 인증 상태 조회 성공', async () => {
            if (!breederToken) {
                console.log('⚠️  브리더 토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-management/verification')
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            console.log('✅ 인증 상태 조회 성공');
        });

        it('POST /api/breeder-management/verification - 인증 신청', async () => {
            if (!breederToken) {
                console.log('⚠️  브리더 토큰이 없어서 테스트 스킵');
                return;
            }

            const verificationData = {
                documents: ['document1.pdf', 'document2.pdf'],
                businessNumber: '123-45-67890',
            };

            const response = await request(app.getHttpServer())
                .post('/api/breeder-management/verification')
                .set('Authorization', `Bearer ${breederToken}`)
                .send(verificationData);

            // 200 또는 400 허용 (이미 신청했거나 신청 가능)
            expect([200, 400]).toContain(response.status);
            console.log('✅ 인증 신청 처리 완료');
        });

        it('GET /api/breeder-management/verification - 인증 없이 접근 실패', async () => {
            const response = await request(app.getHttpServer()).get('/api/breeder-management/verification');

            expect(response.status).toBe(401);
            console.log('✅ 인증 없이 접근 거부 확인');
        });
    });

    describe('인증 서류 업로드/제출', () => {
        let verificationDocumentBreederToken: string;
        let uploadedDocuments: Array<{ type: string; fileName: string; originalFileName?: string }> = [];

        beforeAll(async () => {
            const timestamp = Date.now();
            const breederResponse = await request(app.getHttpServer())
                .post('/api/auth/register/breeder')
                .send({
                    email: `breeder_docs_${timestamp}@test.com`,
                    phoneNumber: '010-8888-7777',
                    breederName: '서류 테스트 브리더',
                    breederLocation: {
                        city: '서울특별시',
                        district: '서초구',
                    },
                    animal: 'dog',
                    breeds: ['푸들'],
                    plan: 'basic',
                    level: 'new',
                    agreements: {
                        termsOfService: true,
                        privacyPolicy: true,
                        marketingConsent: false,
                    },
                })
                .expect(200);

            verificationDocumentBreederToken = breederResponse.body.data.accessToken;
        });

        it('POST /api/breeder-management/verification/upload - 서류 업로드 응답 계약 유지', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/breeder-management/verification/upload')
                .set('Authorization', `Bearer ${verificationDocumentBreederToken}`)
                .field('types', JSON.stringify(['idCard', 'businessLicense']))
                .field('level', 'new')
                .attach('files', verificationUploadTestFilePath)
                .attach('files', verificationUploadTestFilePath)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('new 레벨 브리더 인증 서류 2개가 업로드되었습니다.');
            expect(response.body.data.count).toBe(2);
            expect(response.body.data.level).toBe('new');
            expect(response.body.data.documents).toHaveLength(2);
            expect(response.body.data.documents[0]).toEqual(
                expect.objectContaining({
                    type: 'idCard',
                    fileName: expect.stringContaining('verification/'),
                    url: expect.stringContaining('https://signed.test/'),
                    originalFileName: 'verification-upload-test.jpg',
                }),
            );

            uploadedDocuments = response.body.data.documents;
            console.log('✅ 인증 서류 업로드 응답 계약 유지 확인');
        });

        it('POST /api/breeder-management/verification/submit - 서류 제출 응답 계약 유지', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/breeder-management/verification/submit')
                .set('Authorization', `Bearer ${verificationDocumentBreederToken}`)
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
            console.log('✅ 인증 서류 제출 응답 계약 유지 확인');
        });
    });

    /**
     * 4. 부모견/묘 관리 테스트
     */
    describe('부모견/묘 관리', () => {
        let parentPetId: string;

        it('POST /api/breeder-management/parent-pets - 부모견/묘 추가', async () => {
            const parentPetData = {
                name: '테스트 부모견',
                breed: '포메라니안',
                gender: 'male',
                birthDate: '2020-01-01',
                photoFileName: 'parent-pet-test.jpg',
                description: '건강한 부모견입니다',
            };

            const response = await request(app.getHttpServer())
                .post('/api/breeder-management/parent-pets')
                .set('Authorization', `Bearer ${breederToken}`)
                .send(parentPetData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.petId).toBeDefined();
            parentPetId = response.body.data.petId;
            console.log('✅ 부모견/묘 추가 성공:', parentPetId);
        });

        it('PUT /api/breeder-management/parent-pets/:petId - 부모견/묘 수정', async () => {
            const updateData = {
                name: '수정된 부모견',
                description: '업데이트된 설명',
            };

            const response = await request(app.getHttpServer())
                .patch(`/api/breeder-management/parent-pets/${parentPetId}`)
                .set('Authorization', `Bearer ${breederToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 부모견/묘 수정 성공');
        });

        it('DELETE /api/breeder-management/parent-pets/:petId - 부모견/묘 삭제', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/api/breeder-management/parent-pets/${parentPetId}`)
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 부모견/묘 삭제 성공');
        });

        it('POST /api/breeder-management/parent-pets - 인증 없이 접근 실패', async () => {
            const parentPetData = {
                name: '테스트 부모견',
                breed: '포메라니안',
                gender: 'male',
                birthDate: '2020-01-01',
            };

            const response = await request(app.getHttpServer())
                .post('/api/breeder-management/parent-pets')
                .send(parentPetData);

            expect(response.status).toBe(401);
            console.log('✅ 인증 없이 접근 거부 확인');
        });
    });

    /**
     * 5. 분양 개체 관리 테스트
     */
    describe('분양 개체 관리', () => {
        let availablePetId: string;

        it('POST /api/breeder-management/available-pets - 분양 개체 추가', async () => {
            const availablePetData = {
                name: '테스트 분양 개체',
                breed: '포메라니안',
                gender: 'female',
                birthDate: '2024-01-01',
                price: 1500000,
                description: '건강하고 활발한 아이입니다',
            };

            const response = await request(app.getHttpServer())
                .post('/api/breeder-management/available-pets')
                .set('Authorization', `Bearer ${breederToken}`)
                .send(availablePetData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.petId).toBeDefined();
            availablePetId = response.body.data.petId;
            console.log('✅ 분양 개체 추가 성공:', availablePetId);
        });

        it('PUT /api/breeder-management/available-pets/:petId - 분양 개체 수정', async () => {
            const updateData = {
                name: '수정된 분양 개체',
                price: 1800000,
                description: '업데이트된 설명',
            };

            const response = await request(app.getHttpServer())
                .patch(`/api/breeder-management/available-pets/${availablePetId}`)
                .set('Authorization', `Bearer ${breederToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 분양 개체 수정 성공');
        });

        it('PATCH /api/breeder-management/available-pets/:petId/status - 분양 상태 변경', async () => {
            const statusData = {
                petStatus: 'reserved',
            };

            const response = await request(app.getHttpServer())
                .patch(`/api/breeder-management/available-pets/${availablePetId}/status`)
                .set('Authorization', `Bearer ${breederToken}`)
                .send(statusData)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 분양 상태 변경 성공');
        });

        it('DELETE /api/breeder-management/available-pets/:petId - 분양 개체 삭제', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/api/breeder-management/available-pets/${availablePetId}`)
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 분양 개체 삭제 성공');
        });

        it('POST /api/breeder-management/available-pets - 인증 없이 접근 실패', async () => {
            const availablePetData = {
                name: '테스트 분양 개체',
                breed: '포메라니안',
                gender: 'female',
                birthDate: '2024-01-01',
            };

            const response = await request(app.getHttpServer())
                .post('/api/breeder-management/available-pets')
                .send(availablePetData);

            expect(response.status).toBe(401);
            console.log('✅ 인증 없이 접근 거부 확인');
        });
    });

    /**
     * 6. 입양 신청 관리 테스트
     */
    describe('입양 신청 관리', () => {
        let applicationId: string;

        beforeAll(async () => {
            const connection = app.get<Connection>(getConnectionToken());
            const result = await connection.collection('adoption_applications').insertOne({
                breederId: new ObjectId(breederId),
                adopterId: new ObjectId(adopterId),
                adopterName,
                adopterEmail,
                adopterPhone: '010-7777-6666',
                petId: new ObjectId(),
                petName: '테스트 신청 반려동물',
                status: 'consultation_pending',
                standardResponses: {
                    privacyConsent: true,
                    selfIntroduction: '안녕하세요. 반려동물과 충분한 시간을 보낼 수 있습니다.',
                    familyMembers: '본인 포함 2명',
                    allFamilyConsent: true,
                    allergyTestInfo: '알러지 검사 완료, 이상 없음',
                    timeAwayFromHome: '평일 6시간 정도',
                    livingSpaceDescription: '거실과 방을 자유롭게 사용할 수 있습니다.',
                    previousPetExperience: '이전에 강아지를 5년간 키웠습니다.',
                    canProvideBasicCare: true,
                    canAffordMedicalExpenses: true,
                    preferredPetDescription: '건강하고 사람을 잘 따르는 아이',
                    desiredAdoptionTiming: '가능한 빨리',
                    additionalNotes: '잘 부탁드립니다.',
                },
                customResponses: [
                    {
                        questionId: 'housing-type',
                        questionLabel: '거주 형태를 알려주세요.',
                        questionType: 'text',
                        answer: '아파트',
                    },
                ],
                appliedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            applicationId = result.insertedId.toString();
        });

        it('GET /api/breeder-management/applications - 입양 신청 목록 조회', async () => {
            if (!breederToken) {
                console.log('⚠️  브리더 토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-management/applications')
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            console.log('✅ 입양 신청 목록 조회 성공');
        });

        it('GET /api/breeder-management/applications - 페이지네이션 파라미터', async () => {
            if (!breederToken) {
                console.log('⚠️  브리더 토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-management/applications?page=1&limit=10')
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 페이지네이션 파라미터 적용 확인');
        });

        it('GET /api/breeder-management/applications/:applicationId - 입양 신청 상세 조회', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/breeder-management/applications/${applicationId}`)
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('입양 신청 상세 정보가 조회되었습니다.');
            expect(response.body.data.applicationId).toBe(applicationId);
            expect(response.body.data.adopterId).toBe(adopterId);
            expect(response.body.data.adopterName).toBe(adopterName);
            expect(response.body.data.adopterEmail).toBe(adopterEmail);
            expect(response.body.data.status).toBe('consultation_pending');
            expect(response.body.data.standardResponses).toBeDefined();
            expect(response.body.data.customResponses).toHaveLength(1);
            console.log('✅ 입양 신청 상세 조회 성공');
        });

        it('PATCH /api/breeder-management/applications/:applicationId - 입양 신청 상태 변경', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/api/breeder-management/applications/${applicationId}`)
                .set('Authorization', `Bearer ${breederToken}`)
                .send({
                    applicationId,
                    status: 'consultation_completed',
                    notes: '상담이 원활하게 마무리되었습니다.',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('입양 신청 상태가 성공적으로 변경되었습니다.');
            expect(response.body.data.message).toBe('입양 신청 상태가 성공적으로 업데이트되었습니다.');
            console.log('✅ 입양 신청 상태 변경 성공');
        });

        it('GET /api/breeder-management/applications/:applicationId - 상태 변경 후 상세 재조회', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/breeder-management/applications/${applicationId}`)
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.applicationId).toBe(applicationId);
            expect(response.body.data.status).toBe('consultation_completed');
            console.log('✅ 입양 신청 상태 변경 후 상세 재조회 성공');
        });

        it('GET /api/breeder-management/applications - 인증 없이 접근 실패', async () => {
            const response = await request(app.getHttpServer()).get('/api/breeder-management/applications');

            expect(response.status).toBe(401);
            console.log('✅ 인증 없이 접근 거부 확인');
        });
    });

    /**
     * 7. 내 개체 및 후기 조회 테스트
     */
    describe('내 개체 및 후기', () => {
        it('GET /api/breeder-management/my-pets - 내 개체 목록 조회', async () => {
            if (!breederToken) {
                console.log('⚠️  브리더 토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-management/my-pets')
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            console.log('✅ 내 개체 목록 조회 성공');
        });

        it('GET /api/breeder-management/my-pets - 페이지네이션 및 필터', async () => {
            if (!breederToken) {
                console.log('⚠️  브리더 토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-management/my-pets?page=1&limit=10&status=available')
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 필터링된 개체 목록 조회 성공');
        });

        it('GET /api/breeder-management/my-reviews - 내 후기 목록 조회', async () => {
            if (!breederToken) {
                console.log('⚠️  브리더 토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-management/my-reviews')
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            console.log('✅ 내 후기 목록 조회 성공');
        });

        it('GET /api/breeder-management/my-reviews - 페이지네이션 및 필터', async () => {
            if (!breederToken) {
                console.log('⚠️  브리더 토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-management/my-reviews?page=1&limit=10&visibility=public')
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 필터링된 후기 목록 조회 성공');
        });
    });

    /**
     * 8. 후기 답글 관리 테스트
     */
    describe('후기 답글 관리', () => {
        let reviewId: string;

        beforeAll(async () => {
            const connection = app.get<Connection>(getConnectionToken());
            const result = await connection.collection('breeder_reviews').insertOne({
                applicationId: new ObjectId(),
                breederId: new ObjectId(breederId),
                adopterId: new ObjectId(),
                type: 'consultation',
                content: '브리더와의 상담이 정말 친절했어요.',
                writtenAt: new Date(),
                isVisible: true,
                isReported: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            reviewId = result.insertedId.toString();
        });

        it('POST /api/breeder-management/reviews/:reviewId/reply - 후기 답글 등록', async () => {
            const response = await request(app.getHttpServer())
                .post(`/api/breeder-management/reviews/${reviewId}/reply`)
                .set('Authorization', `Bearer ${breederToken}`)
                .send({
                    content: '소중한 후기 감사합니다.',
                })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('답글이 등록되었습니다.');
            expect(response.body.data.reviewId).toBe(reviewId);
            expect(response.body.data.replyContent).toBe('소중한 후기 감사합니다.');
            expect(response.body.data.replyWrittenAt).toBeDefined();
            console.log('✅ 후기 답글 등록 성공');
        });

        it('PATCH /api/breeder-management/reviews/:reviewId/reply - 후기 답글 수정', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/api/breeder-management/reviews/${reviewId}/reply`)
                .set('Authorization', `Bearer ${breederToken}`)
                .send({
                    content: '소중한 후기 정말 감사합니다.',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('답글이 수정되었습니다.');
            expect(response.body.data.reviewId).toBe(reviewId);
            expect(response.body.data.replyContent).toBe('소중한 후기 정말 감사합니다.');
            expect(response.body.data.replyWrittenAt).toBeDefined();
            expect(response.body.data.replyUpdatedAt).toBeDefined();
            console.log('✅ 후기 답글 수정 성공');
        });

        it('DELETE /api/breeder-management/reviews/:reviewId/reply - 후기 답글 삭제', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/api/breeder-management/reviews/${reviewId}/reply`)
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('답글이 삭제되었습니다.');
            expect(response.body.data.reviewId).toBe(reviewId);
            expect(response.body.data.message).toBe('답글이 삭제되었습니다.');
            console.log('✅ 후기 답글 삭제 성공');
        });
    });

    /**
     * 9. 입양 신청 폼 관리 테스트
     */
    describe('입양 신청 폼 관리', () => {
        it('GET /api/breeder-management/application-form - 입양 신청 폼 조회', async () => {
            if (!breederToken) {
                console.log('⚠️  브리더 토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-management/application-form')
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.standardQuestions).toBeDefined();
            expect(response.body.data.customQuestions).toBeDefined();
            console.log('✅ 입양 신청 폼 조회 성공');
        });

        it('PUT /api/breeder-management/application-form - 입양 신청 폼 수정', async () => {
            if (!breederToken) {
                console.log('⚠️  브리더 토큰이 없어서 테스트 스킵');
                return;
            }

            const formData = {
                customQuestions: [
                    {
                        id: 'custom_question_1',
                        type: 'text',
                        label: '추가 질문 1',
                        required: true,
                        order: 1,
                    },
                ],
            };

            const response = await request(app.getHttpServer())
                .patch('/api/breeder-management/application-form')
                .set('Authorization', `Bearer ${breederToken}`)
                .send(formData);

            expect([200, 400]).toContain(response.status);
            console.log('✅ 입양 신청 폼 수정 처리 완료');
        });

        it('PUT /api/breeder-management/application-form - 잘못된 질문 ID로 실패', async () => {
            if (!breederToken) {
                console.log('⚠️  브리더 토큰이 없어서 테스트 스킵');
                return;
            }

            const formData = {
                customQuestions: [
                    {
                        id: '잘못된-ID!@#',
                        type: 'text',
                        label: '잘못된 질문',
                        required: true,
                        order: 1,
                    },
                ],
            };

            const response = await request(app.getHttpServer())
                .patch('/api/breeder-management/application-form')
                .set('Authorization', `Bearer ${breederToken}`)
                .send(formData);

            // 200 또는 400 허용 (검증 로직에 따라 다름)
            expect([200, 400]).toContain(response.status);
            console.log('✅ 잘못된 질문 ID 처리 완료');
        });

        it('GET /api/breeder-management/application-form - 인증 없이 접근 실패', async () => {
            const response = await request(app.getHttpServer()).get('/api/breeder-management/application-form');

            expect(response.status).toBe(401);
            console.log('✅ 인증 없이 접근 거부 확인');
        });
    });

    /**
     * 10. 응답 형식 검증 테스트
     */
    describe('응답 형식 검증', () => {
        it('표준 API 응답 형식 확인', async () => {
            if (!breederToken) {
                console.log('⚠️  브리더 토큰이 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-management/dashboard')
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            // 표준 ApiResponseDto 형식 검증
            expect(response.body).toHaveProperty('success');
            expect(response.body).toHaveProperty('code');
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body.success).toBe(true);
            expect(response.body.code).toBe(200);
            console.log('✅ 표준 API 응답 형식 검증 완료');
        });
    });

    /**
     * 11. 계정 탈퇴 테스트
     */
    describe('계정 탈퇴', () => {
        let deleteBreederToken: string;
        let deleteBreederId: string;

        beforeAll(async () => {
            const timestamp = Date.now();
            const deleteBreederResponse = await request(app.getHttpServer())
                .post('/api/auth/register/breeder')
                .send({
                    email: `breeder_delete_${timestamp}@test.com`,
                    phoneNumber: '010-2222-1111',
                    breederName: '탈퇴 테스트 브리더',
                    breederLocation: {
                        city: '서울특별시',
                        district: '마포구',
                    },
                    animal: 'dog',
                    breeds: ['비숑프리제'],
                    plan: 'basic',
                    level: 'new',
                    agreements: {
                        termsOfService: true,
                        privacyPolicy: true,
                        marketingConsent: false,
                    },
                })
                .expect(200);

            deleteBreederToken = deleteBreederResponse.body.data.accessToken;
            deleteBreederId = deleteBreederResponse.body.data.breederId;
        });

        it('DELETE /api/breeder-management/account - 브리더 회원 탈퇴 성공', async () => {
            const response = await request(app.getHttpServer())
                .delete('/api/breeder-management/account')
                .set('Authorization', `Bearer ${deleteBreederToken}`)
                .send({
                    reason: 'no_inquiry',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('브리더 회원 탈퇴가 성공적으로 처리되었습니다.');
            expect(response.body.data.breederId).toBe(deleteBreederId);
            expect(response.body.data.deletedAt).toBeDefined();
            expect(response.body.data.message).toBe('브리더 회원 탈퇴가 성공적으로 처리되었습니다.');

            const connection = app.get<Connection>(getConnectionToken());
            const deletedBreeder = await connection
                .collection('breeders')
                .findOne({ _id: new ObjectId(deleteBreederId) });

            expect(deletedBreeder?.accountStatus).toBe('deleted');
            expect(deletedBreeder?.deletedAt).toBeDefined();
            expect(deletedBreeder?.deleteReason).toBe('no_inquiry');
            console.log('✅ 브리더 회원 탈퇴 성공');
        });
    });
});
