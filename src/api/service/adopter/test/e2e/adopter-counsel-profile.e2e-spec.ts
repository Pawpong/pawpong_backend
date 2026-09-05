import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { cleanupDatabase, createTestingApp, ensureActiveTerms } from '../../../../../common/testing/test-utils';

/**
 * 입양자 프로필의 상담 사전 정보(조사 양식) 노출 계약.
 *
 * 조사 양식 데이터는 가입 요청으로만 들어오고 어떤 조회 응답에도 없어서,
 * 클라이언트가 "이 사용자가 조사를 완료했는가"를 서버 기준으로 판정할 방법이 없었다.
 * (localStorage 플래그가 유일한 우회였고, bio 로 대체하면 조사와 무관한 소개라 오탐)
 * 여기서는 완료·건너뜀 두 경우가 응답으로 구분되는지 확인한다.
 */
describe('입양자 상담 사전 정보 노출 (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestingApp();
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    /** 필수 약관만 동의한 기본 가입 payload */
    async function buildSignupPayload(withCounsel: boolean): Promise<Record<string, unknown>> {
        const activeTerms = await ensureActiveTerms(app);
        const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const agreed = activeTerms
            .filter((t) => t.isRequired || (withCounsel && t.code === 'counsel_privacy'))
            .map((t) => ({ code: t.code, version: t.version }));

        return {
            tempId: `temp_kakao_${stamp}_${stamp}`,
            email: `counsel_${stamp}@test.com`,
            nickname: `조사테스트${stamp}`.slice(0, 20),
            realName: '조사테스터',
            phone: '010-2222-3333',
            termsAgreements: agreed,
            ...(withCounsel
                ? {
                      counselDefaultProfile: {
                          selfIntroduction: '반려동물과 오래 함께했습니다.',
                          dailyAbsenceHours: '4시간 이하',
                          livingSpaceDescription: '아파트 84제곱미터',
                          counselPrivacyAgreed: true,
                      },
                  }
                : {}),
        };
    }

    async function signupAndFetchProfile(withCounsel: boolean): Promise<Record<string, unknown>> {
        const payload = await buildSignupPayload(withCounsel);

        const signup = await request(app.getHttpServer())
            .post('/api/v2/auth/register/adopter')
            .send(payload)
            .expect(200);

        const token = signup.body.data.accessToken;

        const profile = await request(app.getHttpServer())
            .get('/api/v2/adopter/profile')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        return profile.body.data;
    }

    it('조사 양식을 작성한 사용자는 상담 사전 정보가 응답에 담긴다', async () => {
        const data = await signupAndFetchProfile(true);

        expect(data.counselDefaultProfile).not.toBeNull();
        const counsel = data.counselDefaultProfile as Record<string, unknown>;
        expect(counsel.selfIntroduction).toBe('반려동물과 오래 함께했습니다.');
        expect(counsel.dailyAbsenceHours).toBe('4시간 이하');
        expect(counsel.livingSpaceDescription).toBe('아파트 84제곱미터');
        // 동의 시각은 서버가 찍는다 (클라이언트 값 신뢰하지 않음)
        expect(typeof counsel.counselPrivacyAgreedAt).toBe('string');
    });

    it('조사 양식을 건너뛴 사용자는 null 이라 완료 여부를 구분할 수 있다', async () => {
        const data = await signupAndFetchProfile(false);

        // undefined 가 아니라 null — 필드 자체는 항상 존재해야 클라이언트가 분기할 수 있다
        expect(data).toHaveProperty('counselDefaultProfile');
        expect(data.counselDefaultProfile).toBeNull();
    });
});
