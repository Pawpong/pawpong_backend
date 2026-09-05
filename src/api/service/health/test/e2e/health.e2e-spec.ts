import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { DatabaseReadinessService } from '../../../../../common/database/database-readiness.service';
import { createTestingApp } from '../../../../../common/testing/test-utils';

interface HealthResponseBody {
    success: boolean;
    code: number;
    timestamp: string;
    data: {
        status: string;
        timestamp: string;
        service: string;
        version: string;
        environment: string;
        uptime: number;
        dependencies?: {
            database: {
                status: string;
                connectionState: string;
                latencyMs: number;
            };
        };
    };
}

const isHealthResponseBody = (value: unknown): value is HealthResponseBody => {
    if (typeof value !== 'object' || value === null) return false;
    if (!('success' in value) || typeof value.success !== 'boolean') return false;
    if (!('code' in value) || typeof value.code !== 'number') return false;
    if (!('timestamp' in value) || typeof value.timestamp !== 'string') return false;
    return 'data' in value && typeof value.data === 'object' && value.data !== null;
};

const readHealthBody = (response: request.Response): HealthResponseBody => {
    const body: unknown = response.body;
    if (!isHealthResponseBody(body)) throw new Error('헬스체크 응답 형식이 올바르지 않습니다.');
    return body;
};

/**
 * 헬스체크 종단간 테스트 (간소화 버전)
 */
describe('헬스체크 종단간 테스트', () => {
    let app: INestApplication;
    let httpServer: Parameters<typeof request>[0];
    let databaseReadinessService: DatabaseReadinessService;

    beforeAll(async () => {
        app = await createTestingApp();
        httpServer = app.getHttpServer() as Parameters<typeof request>[0];
        databaseReadinessService = app.get(DatabaseReadinessService);
    });

    afterAll(async () => {
        await app.close();
    });

    /**
     * 1. 헬스체크 테스트
     */
    describe('헬스체크', () => {
        it('헬스체크 성공', async () => {
            const response = await request(httpServer).get('/api/health').expect(200);
            const body = readHealthBody(response);

            expect(body).toHaveProperty('success', true);
            expect(body).toHaveProperty('code');
            expect(body).toHaveProperty('timestamp');
            expect(body).toHaveProperty('data');
            console.log('헬스체크 성공');
        });

        it('응답 데이터 구조 검증', async () => {
            const response = await request(httpServer).get('/api/health').expect(200);

            const healthData = readHealthBody(response).data;
            expect(healthData).toHaveProperty('status', 'healthy');
            expect(healthData).toHaveProperty('timestamp');
            expect(healthData).toHaveProperty('service', 'Pawpong Backend');
            expect(healthData).toHaveProperty('version', '1.0.0-MVP');
            expect(healthData).toHaveProperty('environment');
            expect(healthData).toHaveProperty('uptime');
            console.log('헬스체크 응답 데이터 구조 검증 완료');
        });

        it('가동 시간이 숫자인지 확인', async () => {
            const response = await request(httpServer).get('/api/health').expect(200);

            const healthData = readHealthBody(response).data;
            expect(typeof healthData.uptime).toBe('number');
            expect(healthData.uptime).toBeGreaterThanOrEqual(0);
            console.log('가동 시간 값 검증 완료');
        });

        it('시각 문자열가 유효한 국제 표준 형식인지 확인', async () => {
            const response = await request(httpServer).get('/api/health').expect(200);

            const healthData = readHealthBody(response).data;
            const timestamp = new Date(healthData.timestamp);
            expect(timestamp.toString()).not.toBe('Invalid Date');
            console.log('시각 문자열 형식 검증 완료');
        });

        it('인증 없이 접근 가능', async () => {
            // Authorization 헤더 없이 요청
            const response = await request(httpServer).get('/api/health').expect(200);

            expect(readHealthBody(response).success).toBe(true);
            console.log('인증 없이 접근 가능 확인');
        });

        it('MongoDB ping을 포함한 readiness를 공개 경로에서 확인할 수 있다', async () => {
            const response = await request(httpServer).get('/api/health/ready').expect(200);
            const body = readHealthBody(response);

            expect(body.success).toBe(true);
            expect(body.data.status).toBe('healthy');
            expect(body.data.dependencies?.database.status).toBe('healthy');
            expect(body.data.dependencies?.database.connectionState).toBe('connected');
            expect(typeof body.data.dependencies?.database.latencyMs).toBe('number');
        });

        it('MongoDB ping 실패 시 readiness는 진단 데이터와 HTTP 503을 반환한다', async () => {
            const readinessSpy = jest.spyOn(databaseReadinessService, 'check').mockResolvedValue({
                status: 'unhealthy',
                connectionState: 'connected',
                latencyMs: 3001,
            });

            try {
                const response = await request(httpServer).get('/api/health/ready').expect(503);
                const body = readHealthBody(response);

                expect(body.success).toBe(false);
                expect(body.code).toBe(503);
                expect(body.data.status).toBe('unhealthy');
                expect(body.data.dependencies?.database.status).toBe('unhealthy');
            } finally {
                readinessSpy.mockRestore();
            }
        });
    });

    /**
     * 2. 응답 형식 검증 테스트
     */
    describe('응답 형식 검증', () => {
        it('표준 경로 응답 형식 확인', async () => {
            const response = await request(httpServer).get('/api/health').expect(200);
            const body = readHealthBody(response);

            expect(body).toHaveProperty('success');
            expect(body).toHaveProperty('code');
            expect(body).toHaveProperty('data');
            expect(body).toHaveProperty('timestamp');
            expect(body.success).toBe(true);
            expect(body.code).toBe(200);
            console.log('표준 경로 응답 형식 검증 완료');
        });

        it('타임스탬프 형식 확인', async () => {
            const response = await request(httpServer).get('/api/health').expect(200);

            const timestamp = readHealthBody(response).timestamp;
            expect(timestamp).toBeDefined();
            expect(new Date(timestamp).toString()).not.toBe('Invalid Date');
            console.log('타임스탬프 형식 검증 완료');
        });
    });
});
