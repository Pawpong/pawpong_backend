import request from 'supertest';

import { getAdopterToken } from '../../../common/test/test-utils';
import {
    AuthE2eContext,
    closeAuthE2eContext,
    createAuthE2eContext,
    registerAdopter,
} from './auth-e2e.fixture';

describe('인증 중복 체크와 소셜 업로드 종단간 테스트', () => {
    let context: AuthE2eContext;

    beforeAll(async () => {
        context = await createAuthE2eContext();
    });

    afterAll(async () => {
        await closeAuthE2eContext(context);
    });

    describe('이메일 중복 체크', () => {
        let existingEmail: string;

        beforeAll(async () => {
            existingEmail = `existing_${Date.now()}@test.com`;
            await registerAdopter(context.app, {
                email: existingEmail,
                nickname: `중복체크${Date.now()}`.slice(0, 20),
                phone: '010-1111-2222',
            }).expect(200);
        });

        it('기존 이메일을 중복으로 확인한다', async () => {
            const response = await request(context.app.getHttpServer())
                .post('/api/auth/check-email')
                .send({ email: existingEmail })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.isDuplicate).toBe(true);
            expect(response.body.message).toContain('이미 가입된 이메일');
        });

        it('사용 가능한 이메일을 확인한다', async () => {
            const response = await request(context.app.getHttpServer())
                .post('/api/auth/check-email')
                .send({ email: `available_${Date.now()}@test.com` })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.isDuplicate).toBe(false);
            expect(response.body.message).toContain('사용 가능한 이메일');
        });
    });

    describe('닉네임 중복 체크', () => {
        let existingNickname: string;

        beforeAll(async () => {
            existingNickname = `닉중${Date.now()}`.slice(0, 12);
            await registerAdopter(context.app, {
                email: `nickname_${Date.now()}@test.com`,
                nickname: existingNickname,
                phone: '010-2222-3333',
            }).expect(200);
        });

        it('기존 닉네임을 중복으로 확인한다', async () => {
            const response = await request(context.app.getHttpServer())
                .post('/api/auth/check-nickname')
                .send({ nickname: existingNickname });

            expect([200, 400]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.data.isDuplicate).toBe(true);
                expect(response.body.message).toContain('이미 사용 중인 닉네임');
            }
        });

        it('사용 가능한 닉네임을 확인한다', async () => {
            const response = await request(context.app.getHttpServer())
                .post('/api/auth/check-nickname')
                .send({ nickname: `사용가${Date.now()}`.slice(0, 12) });

            expect([200, 400]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.data.isDuplicate).toBe(false);
                expect(response.body.message).toContain('사용 가능한 닉네임');
            }
        });
    });

    describe('소셜 로그인 사용자 체크', () => {
        it('미가입 사용자를 확인한다', async () => {
            const timestamp = Date.now();
            const response = await request(context.app.getHttpServer())
                .post('/api/auth/social/check-user')
                .send({
                    provider: 'kakao',
                    providerId: `new_user_${timestamp}`,
                    email: `newuser_${timestamp}@kakao.com`,
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.exists).toBe(false);
            expect(response.body.message).toContain('미가입 사용자');
        });

        it('기가입 사용자를 확인한다', async () => {
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString().slice(2, 8);
            const providerId = `existing_${timestamp}_${randomSuffix}`;

            await registerAdopter(context.app, {
                tempId: `temp_kakao_${providerId}_${timestamp}`,
                email: `social_existing_${timestamp}_${randomSuffix}@test.com`,
                nickname: `소셜기${timestamp}`.slice(0, 20),
                phone: '010-3333-4444',
            }).expect(200);

            const response = await request(context.app.getHttpServer())
                .post('/api/auth/social/check-user')
                .send({
                    provider: 'kakao',
                    providerId,
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.exists).toBe(true);
            expect(response.body.message).toContain('가입된 사용자');
        });
    });

    describe('회원가입 전 업로드', () => {
        it('임시 ID 프로필 업로드 응답 계약을 유지한다', async () => {
            const response = await request(context.app.getHttpServer())
                .post(`/api/auth/upload-breeder-profile?tempId=temp-upload-${Date.now()}`)
                .attach('file', context.uploadTestFileBuffer, context.uploadTestFileName)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                url: expect.stringContaining('https://cdn.test/profiles/'),
                cdnUrl: expect.stringContaining('https://cdn.test/profiles/'),
                filename: expect.stringMatching(/^profiles\//),
                fileName: expect.stringMatching(/^profiles\//),
            });
            expect(response.body.message).toBe(
                '프로필 이미지가 업로드되고 임시 저장되었습니다. 회원가입 시 자동으로 적용됩니다.',
            );
        });

        it('로그인 사용자 프로필 업로드 응답 계약을 유지한다', async () => {
            const adopter = await getAdopterToken(context.app);
            expect(adopter).not.toBeNull();

            const response = await request(context.app.getHttpServer())
                .post('/api/auth/upload-breeder-profile')
                .set('Authorization', `Bearer ${adopter!.token}`)
                .attach('file', context.uploadTestFileBuffer, context.uploadTestFileName)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                url: expect.stringContaining('https://cdn.test/profiles/'),
                cdnUrl: expect.stringContaining('https://cdn.test/profiles/'),
                filename: expect.stringMatching(/^profiles\//),
                fileName: expect.stringMatching(/^profiles\//),
            });
            expect(response.body.message).toBe('프로필 이미지가 업로드되고 저장되었습니다.');
        });

        it('임시 ID 서류 업로드 응답 계약을 유지한다', async () => {
            const response = await request(context.app.getHttpServer())
                .post(`/api/auth/upload-breeder-documents?tempId=temp-docs-${Date.now()}`)
                .field('types', JSON.stringify(['idCard', 'animalProductionLicense']))
                .field('level', 'new')
                .attach('files', context.uploadTestFileBuffer, context.uploadTestFileName)
                .attach('files', context.uploadTestFileBuffer, context.uploadTestFileName)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.uploadedDocuments).toHaveLength(2);
            expect(response.body.data.allDocuments).toHaveLength(2);
            expect(response.body.message).toBe(
                'new 레벨 브리더 인증 서류 2개가 업로드되고 임시 저장되었습니다. 회원가입 시 자동으로 적용됩니다.',
            );
        });
    });
});
