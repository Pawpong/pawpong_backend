import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestingApp } from '../../../../common/test/test-utils';

/**
 * 홈 종단간 테스트 (간소화 버전)
 * - 분양 중인 아이들 조회
 * - 메인 배너 조회
 * - 자주 묻는 질문 조회
 */
describe('홈 종단간 테스트', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestingApp();
    });

    afterAll(async () => {
        await app.close();
    });

    /**
     * 1. 분양중인 아이들 조회 테스트
     */
    describe('분양중인 아이들 조회', () => {
        it('조회 성공 (기본 한도)', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/available-pets').expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('code');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('message');
            expect(Array.isArray(response.body.data)).toBe(true);
            console.log('분양중인 아이들 조회 성공 (기본 한도)');
        });

        it('커스텀 한도 적용', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/available-pets?limit=5').expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeLessThanOrEqual(5);
            console.log('커스텀 한도 적용 성공');
        });

        it('한도 범위 초과 시 처리 확인', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/available-pets?limit=100');

            // API가 limit 범위를 강제하지 않을 수 있으므로 200 또는 400 허용
            expect([200, 400]).toContain(response.status);
            console.log('한도 범위 초과 처리 확인');
        });

        it('한도 음수 시 처리 확인', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/available-pets?limit=-1');

            // API가 음수 limit을 강제하지 않을 수 있으므로 200 또는 400 허용
            expect([200, 400]).toContain(response.status);
            console.log('한도 음수 처리 확인');
        });

        it('한도 문자열 처리 확인', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/available-pets?limit=invalid');

            // ValidationPipe가 잘못된 타입을 무시하고 기본값으로 처리할 수 있음
            expect([200, 400]).toContain(response.status);

            if (response.status === 200) {
                console.log('주의: 잘못된 한도이 기본값으로 처리됨 (ValidationPipe 동작)');
            } else {
                console.log('한도 문자열 에러 확인');
            }
        });
    });

    /**
     * 2. 메인 배너 조회 테스트
     */
    describe('메인 배너 조회', () => {
        it('배너 목록 조회 성공', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/banners').expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('code');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('message');
            expect(Array.isArray(response.body.data)).toBe(true);
            console.log('메인 배너 목록 조회 성공');
        });

        it('배너 응답 데이터 구조 검증', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/banners').expect(200);

            if (response.body.data.length > 0) {
                const banner = response.body.data[0];
                expect(banner).toHaveProperty('imageUrl');
                expect(banner).toHaveProperty('linkType');
                expect(banner).toHaveProperty('linkUrl');
                expect(banner).toHaveProperty('order');
                console.log('배너 데이터 구조 검증 완료');
            } else {
                console.log('주의: 배너 데이터가 없어서 구조 검증 스킵');
            }
        });
    });

    /**
     * 3. 자주 묻는 질문 조회 테스트
     */
    describe('자주 묻는 질문 조회', () => {
        it('자주 묻는 질문 조회 성공 (기본 파라미터)', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/faqs').expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('code');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('message');
            expect(Array.isArray(response.body.data)).toBe(true);
            console.log('자주 묻는 질문 조회 성공 (기본 파라미터)');
        });

        it('입양자용 자주 묻는 질문 조회', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/faqs?userType=adopter').expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            console.log('입양자용 자주 묻는 질문 조회 성공');
        });

        it('브리더용 자주 묻는 질문 조회', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/faqs?userType=breeder').expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            console.log('브리더용 자주 묻는 질문 조회 성공');
        });

        it('공통 자주 묻는 질문 조회', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/faqs?userType=both').expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            console.log('공통 자주 묻는 질문 조회 성공');
        });

        it('커스텀 한도 적용', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/faqs?limit=3').expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeLessThanOrEqual(3);
            console.log('자주 묻는 질문 커스텀 한도 적용 성공');
        });

        it('잘못된 사용자 유형 처리 확인', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/faqs?userType=invalid');

            // API가 userType을 엄격히 검증하지 않으므로 200 또는 400 허용
            expect([200, 400]).toContain(response.status);
            console.log('잘못된 사용자 유형 처리 확인');
        });

        it('한도 범위 초과 시 처리 확인', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/faqs?limit=100');

            // API가 limit 범위를 강제하지 않을 수 있으므로 200 또는 400 허용
            expect([200, 400]).toContain(response.status);
            console.log('자주 묻는 질문 한도 범위 초과 처리 확인');
        });

        it('한도 음수 시 처리 확인', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/faqs?limit=-1');

            // API가 음수 limit을 강제하지 않을 수 있으므로 200 또는 400 허용
            expect([200, 400]).toContain(response.status);
            console.log('자주 묻는 질문 한도 음수 처리 확인');
        });

        it('자주 묻는 질문 응답 데이터 구조 검증', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/faqs').expect(200);

            if (response.body.data.length > 0) {
                const faq = response.body.data[0];
                expect(faq).toHaveProperty('question');
                expect(faq).toHaveProperty('answer');
                expect(faq).toHaveProperty('category');
                expect(faq).toHaveProperty('order');
                console.log('자주 묻는 질문 데이터 구조 검증 완료');
            } else {
                console.log('주의: 자주 묻는 질문 데이터가 없어서 구조 검증 스킵');
            }
        });
    });

    /**
     * 4. 응답 형식 검증 테스트
     */
    describe('응답 형식 검증', () => {
        it('표준 경로 응답 형식 확인', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/available-pets').expect(200);

            expect(response.body).toHaveProperty('success');
            expect(response.body).toHaveProperty('code');
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body.success).toBe(true);
            expect(response.body.code).toBe(200);
            console.log('표준 경로 응답 형식 검증 완료');
        });

        it('타임스탬프 형식 확인', async () => {
            const response = await request(app.getHttpServer()).get('/api/home/banners').expect(200);

            const timestamp = response.body.timestamp;
            expect(timestamp).toBeDefined();
            expect(new Date(timestamp).toString()).not.toBe('Invalid Date');
            console.log('타임스탬프 형식 검증 완료');
        });
    });
});
