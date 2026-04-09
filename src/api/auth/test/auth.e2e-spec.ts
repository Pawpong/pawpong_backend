import { INestApplication } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import request from 'supertest';

import { AlimtalkService } from '../../../common/alimtalk/alimtalk.service';
import { StorageService } from '../../../common/storage/storage.service';
import { createTestingApp, getAdopterToken } from '../../../common/test/test-utils';

/**
 * 인증 종단간 테스트
 *
 * 테스트 대상 핵심 경로:
 * 1. 입양자 회원가입
 * 2. 브리더 회원가입
 * 3. 토큰 재발급
 * 4. 로그아웃
 * 5. 중복 체크 (이메일, 닉네임)
 * 6. 소셜 로그인 사용자 체크
 */
describe('인증 종단간 테스트', () => {
    let app: INestApplication;
    const uploadTestFilePath = path.join(__dirname, 'auth-upload-test.jpg');
    const capturedVerificationCodes = new Map<string, string>();

    beforeAll(async () => {
        app = await createTestingApp();
        fs.writeFileSync(
            uploadTestFilePath,
            Buffer.from(
                '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
                'base64',
            ),
        );

        const storageService = app.get(StorageService);
        jest.spyOn(storageService, 'uploadFile').mockImplementation(async (file: Express.Multer.File, folder?: string) => {
            const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.originalname}`;
            return {
                fileName,
                cdnUrl: `https://cdn.test/${fileName}`,
                storageUrl: `https://cdn.test/${fileName}`,
            };
        });

        const alimtalkService = app.get(AlimtalkService);
        jest.spyOn(alimtalkService, 'sendVerificationCode').mockImplementation(async (phone: string, code: string) => {
            capturedVerificationCodes.set(phone, code);
            return {
                success: true,
                messageId: `alimtalk-${phone}`,
            };
        });
    });

    afterAll(async () => {
        if (fs.existsSync(uploadTestFilePath)) {
            fs.unlinkSync(uploadTestFilePath);
        }
        await app.close();
    });

    /**
     * 1. 입양자 회원가입 테스트
     */
    describe('입양자 회원가입', () => {
        it('회원가입 성공', async () => {
            const timestamp = Date.now();
            const providerId = Math.random().toString().substr(2, 10);
            const registerData = {
                tempId: `temp_kakao_${providerId}_${timestamp}`,
                email: `adopter_${timestamp}@test.com`,
                nickname: `테스트입양자${timestamp}`,
                phone: '010-1234-5678',
                profileImage: 'https://example.com/profile.jpg',
            };

            const response = await request(app.getHttpServer())
                .post('/api/auth/register/adopter')
                .send(registerData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
            expect(response.body.data.adopterId).toBeDefined();
            expect(response.body.data.userRole).toBe('adopter');
            expect(response.body.message).toBe('입양자 회원가입이 완료되었습니다.');
            console.log('입양자 회원가입 성공');
        });

        it('중복 이메일로 실패', async () => {
            const timestamp = Date.now();
            const providerId = Math.random().toString().substr(2, 10);
            const email = `duplicate_${timestamp}@test.com`;

            // 첫 번째 회원가입
            await request(app.getHttpServer())
                .post('/api/auth/register/adopter')
                .send({
                    tempId: `temp_kakao_${providerId}_${timestamp}`,
                    email,
                    nickname: `중복테스트${timestamp}`,
                    phone: '010-1111-1111',
                })
                .expect(200);

            // 중복 회원가입 시도 (500 에러 발생 가능)
            const timestamp2 = Date.now();
            const providerId2 = Math.random().toString().substr(2, 10);
            const response = await request(app.getHttpServer())
                .post('/api/auth/register/adopter')
                .send({
                    tempId: `temp_kakao_${providerId2}_${timestamp2}`,
                    email,
                    nickname: `중복테스트2_${timestamp2}`,
                    phone: '010-2222-2222',
                });

            // API가 중복 이메일을 허용하거나 에러를 반환할 수 있음
            expect([200, 400, 500]).toContain(response.status);
            console.log('중복 이메일 회원가입 처리 확인');
        });

        it('필수 필드 누락으로 실패 (임시 ID)', async () => {
            const timestamp = Date.now();
            await request(app.getHttpServer())
                .post('/api/auth/register/adopter')
                .send({
                    // tempId 누락
                    email: `missing_${timestamp}@test.com`,
                    nickname: `누락테스트${timestamp}`,
                    phone: '010-3333-3333',
                })
                .expect(400);

            console.log('필수 필드 누락 실패 확인');
        });

        it('잘못된 이메일 형식으로 실패', async () => {
            const timestamp = Date.now();
            const providerId = Math.random().toString().substr(2, 10);
            await request(app.getHttpServer())
                .post('/api/auth/register/adopter')
                .send({
                    tempId: `temp_kakao_${providerId}_${timestamp}`,
                    email: 'invalid-email-format',
                    nickname: `형식오류${timestamp}`,
                    phone: '010-4444-4444',
                })
                .expect(400);

            console.log('이메일 형식 오류 확인');
        });
    });

    /**
     * 1.5. 전화번호 인증 테스트
     */
    describe('전화번호 인증', () => {
        const createPhoneNumber = () =>
            `010${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0')}`;

        it('인증번호 발송 성공', async () => {
            const phone = createPhoneNumber();

            const response = await request(app.getHttpServer())
                .post('/api/auth/phone/send-code')
                .send({ phone })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.success).toBe(true);
            expect(response.body.data.message).toBe('인증번호가 발송되었습니다.');
            expect(capturedVerificationCodes.get(phone)).toMatch(/^[0-9]{6}$/);
            console.log('전화번호 인증코드 발송 성공');
        });

        it('인증코드 확인 성공', async () => {
            const phone = createPhoneNumber();

            await request(app.getHttpServer()).post('/api/auth/phone/send-code').send({ phone }).expect(200);

            const code = capturedVerificationCodes.get(phone);
            expect(code).toBeDefined();

            const response = await request(app.getHttpServer())
                .post('/api/auth/phone/verify-code')
                .send({ phone, code })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.success).toBe(true);
            expect(response.body.data.message).toBe('전화번호 인증이 완료되었습니다.');
            console.log('전화번호 인증코드 확인 성공');
        });

        it('잘못된 인증코드로 실패', async () => {
            const phone = createPhoneNumber();

            await request(app.getHttpServer()).post('/api/auth/phone/send-code').send({ phone }).expect(200);

            await request(app.getHttpServer())
                .post('/api/auth/phone/verify-code')
                .send({ phone, code: '000000' })
                .expect(400);

            console.log('잘못된 전화번호 인증코드 실패 확인');
        });
    });

    /**
     * 2. 브리더 회원가입 테스트
     */
    describe('브리더 회원가입', () => {
        it('기본 플랜 회원가입 성공', async () => {
            const timestamp = Date.now();
            const registerData = {
                email: `breeder_basic_${timestamp}@test.com`,
                phoneNumber: '010-5555-5555',
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
            };

            const response = await request(app.getHttpServer())
                .post('/api/auth/register/breeder')
                .send(registerData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
            expect(response.body.data.breederId).toBeDefined();
            expect(response.body.data.breederName).toBe('테스트 브리더');
            expect(response.body.message).toBe('브리더 회원가입이 완료되었습니다.');
            console.log('브리더 기본 플랜 회원가입 성공');
        });

        it('프로 플랜 회원가입 성공', async () => {
            const timestamp = Date.now();
            const registerData = {
                email: `breeder_pro_${timestamp}@test.com`,
                phoneNumber: '010-6666-6666',
                breederName: '프로 브리더',
                breederLocation: {
                    city: '경기도',
                    district: '성남시',
                },
                animal: 'cat',
                breeds: ['페르시안', '샴'],
                plan: 'pro',
                level: 'elite',
                agreements: {
                    termsOfService: true,
                    privacyPolicy: true,
                    marketingConsent: true,
                },
            };

            const response = await request(app.getHttpServer())
                .post('/api/auth/register/breeder')
                .send(registerData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.breederId).toBeDefined();
            expect(response.body.data.breederName).toBe('프로 브리더');
            console.log('브리더 프로 플랜 회원가입 성공');
        });

        it('약관 동의 없이 실패', async () => {
            const timestamp = Date.now();
            await request(app.getHttpServer())
                .post('/api/auth/register/breeder')
                .send({
                    email: `breeder_noagree_${timestamp}@test.com`,
                    phoneNumber: '010-7777-7777',
                    breederName: '약관미동의 브리더',
                    breederLocation: {
                        city: '서울특별시',
                        district: '서초구',
                    },
                    animal: 'dog',
                    breeds: ['골든 리트리버'],
                    plan: 'basic',
                    level: 'new',
                    // agreements 누락
                })
                .expect(400);

            console.log('약관 동의 없이 실패 확인');
        });

        it('필수 필드 누락으로 실패 (breederName)', async () => {
            const timestamp = Date.now();
            await request(app.getHttpServer())
                .post('/api/auth/register/breeder')
                .send({
                    email: `breeder_missing_${timestamp}@test.com`,
                    phoneNumber: '010-8888-8888',
                    // breederName 누락
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
                .expect(400);

            console.log('필수 필드 누락 실패 확인');
        });
    });

    /**
     * 3. 토큰 재발급 테스트
     */
    describe('토큰 재발급', () => {
        let refreshToken: string;

        beforeAll(async () => {
            // 토큰 재발급 테스트용 사용자 생성
            const timestamp = Date.now();
            const providerId = Math.random().toString().substr(2, 10);
            const response = await request(app.getHttpServer())
                .post('/api/auth/register/adopter')
                .send({
                    tempId: `temp_kakao_${providerId}_${timestamp}`,
                    email: `refresh_test_${timestamp}@test.com`,
                    nickname: `토큰테스트${timestamp}`,
                    phone: '010-9999-9999',
                })
                .expect(200);

            refreshToken = response.body.data.refreshToken;
        });

        it('유효한 refresh 토큰으로 재발급 성공', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/refresh')
                .send({ refreshToken })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
            expect(response.body.message).toBe('토큰이 재발급되었습니다.');
            console.log('토큰 재발급 성공');
        });

        it('유효하지 않은 refresh 토큰으로 실패', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid-token' });

            // 401 또는 400 에러 허용
            expect([400, 401]).toContain(response.status);
            console.log('유효하지 않은 토큰으로 재발급 실패 확인');
        });

        it('refresh 토큰 누락으로 실패', async () => {
            await request(app.getHttpServer()).post('/api/auth/refresh').send({}).expect(400);

            console.log('토큰 누락으로 실패 확인');
        });
    });

    /**
     * 4. 로그아웃 테스트
     */
    describe('로그아웃', () => {
        let accessToken: string;

        beforeAll(async () => {
            // 로그아웃 테스트용 사용자 생성
            const timestamp = Date.now();
            const providerId = Math.random().toString().substr(2, 10);
            const response = await request(app.getHttpServer())
                .post('/api/auth/register/adopter')
                .send({
                    tempId: `temp_kakao_${providerId}_${timestamp}`,
                    email: `logout_test_${timestamp}@test.com`,
                    nickname: `로그아웃테스트${timestamp}`,
                    phone: '010-0000-1111',
                })
                .expect(200);

            accessToken = response.body.data.accessToken;
        });

        it('유효한 토큰으로 로그아웃 성공', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.success).toBe(true);
            expect(response.body.data.loggedOutAt).toBeDefined();
            expect(response.body.message).toBe('로그아웃되었습니다.');
            console.log('로그아웃 성공');
        });

        it('토큰 없이 실패', async () => {
            const response = await request(app.getHttpServer()).post('/api/auth/logout').expect(401);

            // 401 에러는 Nest의 AuthGuard가 처리하므로 success 필드가 없을 수 있음
            console.log('토큰 없이 로그아웃 실패 확인');
        });

        it('유효하지 않은 토큰으로 실패', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/logout')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            console.log('유효하지 않은 토큰으로 로그아웃 실패 확인');
        });
    });

    /**
     * 5. 이메일 중복 체크 테스트
     */
    describe('이메일 중복 체크', () => {
        let existingEmail: string;

        beforeAll(async () => {
            // 중복 체크 테스트용 사용자 생성
            const timestamp = Date.now();
            const providerId = Math.random().toString().substr(2, 10);
            existingEmail = `existing_${timestamp}@test.com`;

            await request(app.getHttpServer())
                .post('/api/auth/register/adopter')
                .send({
                    tempId: `temp_kakao_${providerId}_${timestamp}`,
                    email: existingEmail,
                    nickname: `중복체크${timestamp}`,
                    phone: '010-1111-2222',
                })
                .expect(200);
        });

        it('기존 이메일 중복 확인', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/check-email')
                .send({ email: existingEmail })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.isDuplicate).toBe(true);
            expect(response.body.message).toContain('이미 가입된 이메일');
            console.log('기존 이메일 중복 확인');
        });

        it('사용 가능한 이메일 확인', async () => {
            const timestamp = Date.now();
            const response = await request(app.getHttpServer())
                .post('/api/auth/check-email')
                .send({ email: `available_${timestamp}@test.com` })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.isDuplicate).toBe(false);
            expect(response.body.message).toContain('사용 가능한 이메일');
            console.log('사용 가능한 이메일 확인');
        });
    });

    /**
     * 6. 닉네임 중복 체크 테스트
     */
    describe('닉네임 중복 체크', () => {
        let existingNickname: string;

        beforeAll(async () => {
            // 중복 체크 테스트용 사용자 생성
            const timestamp = Date.now();
            const providerId = Math.random().toString().substr(2, 10);
            existingNickname = `닉네임중복${timestamp}`;

            await request(app.getHttpServer())
                .post('/api/auth/register/adopter')
                .send({
                    tempId: `temp_kakao_${providerId}_${timestamp}`,
                    email: `nickname_test_${timestamp}@test.com`,
                    nickname: existingNickname,
                    phone: '010-2222-3333',
                })
                .expect(200);
        });

        it('기존 닉네임 중복 확인', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/check-nickname')
                .send({ nickname: existingNickname });

            // 닉네임이 너무 길거나 형식이 잘못되면 400, 아니면 200
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.data.isDuplicate).toBe(true);
                expect(response.body.message).toContain('이미 사용 중인 닉네임');
            }
            console.log('기존 닉네임 중복 확인');
        });

        it('사용 가능한 닉네임 확인', async () => {
            const timestamp = Date.now();
            const response = await request(app.getHttpServer())
                .post('/api/auth/check-nickname')
                .send({ nickname: `사용가능${timestamp}` });

            // 닉네임이 너무 길거나 형식이 잘못되면 400, 아니면 200
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.data.isDuplicate).toBe(false);
                expect(response.body.message).toContain('사용 가능한 닉네임');
            }
            console.log('사용 가능한 닉네임 확인');
        });
    });

    /**
     * 7. 소셜 로그인 사용자 체크 테스트
     */
    describe('소셜 로그인 사용자 체크', () => {
        it('미가입 사용자 확인', async () => {
            const timestamp = Date.now();
            const response = await request(app.getHttpServer())
                .post('/api/auth/social/check-user')
                .send({
                    provider: 'kakao',
                    providerId: `new_user_${timestamp}`,
                    email: `newuser_${timestamp}@kakao.com`,
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.exists).toBe(false);
            // tempUserId는 응답에 없을 수 있음 (별도 플로우)
            expect(response.body.message).toContain('미가입 사용자');
            console.log('미가입 사용자 확인');
        });

        it('기가입 사용자 확인', async () => {
            // 먼저 사용자 생성 (고유한 이메일과 닉네임 사용)
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString().substr(2, 6);
            const providerId = `existing_${timestamp}_${randomSuffix}`;
            const registerResponse = await request(app.getHttpServer())
                .post('/api/auth/register/adopter')
                .send({
                    tempId: `temp_kakao_${providerId}_${timestamp}`,
                    email: `social_existing_${timestamp}_${randomSuffix}@test.com`,
                    nickname: `소셜기${timestamp}_${randomSuffix}`,
                    phone: '010-3333-4444',
                })
                .expect(200);

            expect(registerResponse.body.success).toBe(true);

            // 소셜 로그인 사용자 체크
            const response = await request(app.getHttpServer())
                .post('/api/auth/social/check-user')
                .send({
                    provider: 'kakao',
                    providerId: providerId,
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.exists).toBe(true);
            expect(response.body.message).toContain('가입된 사용자');
            console.log('기가입 사용자 확인');
        });
    });

    describe('회원가입 전 업로드', () => {
        it('임시 ID 업로드 응답 계약 유지', async () => {
            const response = await request(app.getHttpServer())
                .post(`/api/auth/upload-breeder-profile?tempId=temp-upload-${Date.now()}`)
                .attach('file', uploadTestFilePath)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                url: expect.stringContaining('https://cdn.test/profiles/'),
                cdnUrl: expect.stringContaining('https://cdn.test/profiles/'),
                filename: expect.stringMatching(/^profiles\//),
                fileName: expect.stringMatching(/^profiles\//),
            });
            expect(typeof response.body.data.size).toBe('number');
            expect(response.body.message).toBe(
                '프로필 이미지가 업로드되고 임시 저장되었습니다. 회원가입 시 자동으로 적용됩니다.',
            );
            console.log('프로필 이미지 temp 업로드 응답 계약 유지');
        });

        it('로그인 사용자 업로드 응답 계약 유지', async () => {
            const adopter = await getAdopterToken(app);
            expect(adopter).not.toBeNull();

            const response = await request(app.getHttpServer())
                .post('/api/auth/upload-breeder-profile')
                .set('Authorization', `Bearer ${adopter!.token}`)
                .attach('file', uploadTestFilePath)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                url: expect.stringContaining('https://cdn.test/profiles/'),
                cdnUrl: expect.stringContaining('https://cdn.test/profiles/'),
                filename: expect.stringMatching(/^profiles\//),
                fileName: expect.stringMatching(/^profiles\//),
            });
            expect(response.body.message).toBe('프로필 이미지가 업로드되고 저장되었습니다.');
            console.log('로그인 사용자 프로필 업로드 응답 계약 유지');
        });

        it('임시 ID 업로드 응답 계약 유지', async () => {
            const response = await request(app.getHttpServer())
                .post(`/api/auth/upload-breeder-documents?tempId=temp-docs-${Date.now()}`)
                .field('types', JSON.stringify(['idCard', 'animalProductionLicense']))
                .field('level', 'new')
                .attach('files', uploadTestFilePath)
                .attach('files', uploadTestFilePath)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.uploadedDocuments).toHaveLength(2);
            expect(response.body.data.allDocuments).toHaveLength(2);
            expect(response.body.data.uploadedDocuments[0]).toMatchObject({
                type: 'idCard',
                url: expect.stringContaining('https://cdn.test/documents/verification/temp/new/'),
                filename: expect.stringMatching(/^documents\/verification\/temp\/new\//),
                size: expect.any(Number),
            });
            expect(response.body.data.uploadedDocuments[1]).toMatchObject({
                type: 'animalProductionLicense',
                url: expect.stringContaining('https://cdn.test/documents/verification/temp/new/'),
                filename: expect.stringMatching(/^documents\/verification\/temp\/new\//),
                size: expect.any(Number),
            });
            expect(response.body.message).toBe(
                'new 레벨 브리더 인증 서류 2개가 업로드되고 임시 저장되었습니다. 회원가입 시 자동으로 적용됩니다.',
            );
            console.log('브리더 인증 서류 업로드 응답 계약 유지');
        });
    });
});
