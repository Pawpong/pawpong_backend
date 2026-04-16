import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import request from 'supertest';

import { createTestingApp, cleanupDatabase, seedAdmin } from '../../../../common/test/test-utils';
import { LOKI_QUERY_PORT } from '../application/ports/loki-query.port';
import { LogCategorizerService } from '../domain/services/log-categorizer.service';
import type { SystemHealthResponseDto } from '../dto/response/system-health-response.dto';

/**
 * Platform Admin — 시스템 헬스 E2E 테스트
 *
 * LokiQueryAdapter는 실제 Loki 서버가 없으므로 Mock으로 대체합니다.
 * 분류 로직은 LogCategorizerService 유닛 테스트에서 별도 검증합니다.
 *
 * 테스트 대상 API:
 * GET /api/platform-admin/system-health
 */
describe('Platform Admin — System Health E2E', () => {
    let app: INestApplication;
    let dbConnection: Connection;
    let adminToken: string;

    /** Loki Port Mock — 실제 Loki 없이 고정 데이터 반환 */
    const mockLokiQueryPort = {
        queryErrorsAndWarnings: jest.fn(),
        isAvailable: jest.fn().mockResolvedValue(true),
    };

    beforeAll(async () => {
        app = await createTestingApp([
            {
                provide: LOKI_QUERY_PORT,
                useValue: mockLokiQueryPort,
            },
        ]);

        dbConnection = app.get<Connection>(getConnectionToken());

        const adminPassword = 'admin1234';
        const { email } = await seedAdmin(app, adminPassword);

        const loginResponse = await request(app.getHttpServer())
            .post('/api/auth-admin/login')
            .send({ email, password: adminPassword })
            .expect(200);

        adminToken = loginResponse.body.data.accessToken;
    });

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─────────────────────────────────────────────
    // 1. 인증/권한 검증
    // ─────────────────────────────────────────────

    describe('인증 및 권한', () => {
        it('토큰 없이 요청 시 401을 반환해야 한다', async () => {
            await request(app.getHttpServer()).get('/api/platform-admin/system-health').expect(401);
        });

        it('관리자 토큰으로 요청 시 200을 반환해야 한다', async () => {
            mockLokiQueryPort.queryErrorsAndWarnings.mockResolvedValue([]);

            await request(app.getHttpServer())
                .get('/api/platform-admin/system-health')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
        });
    });

    // ─────────────────────────────────────────────
    // 2. 응답 구조 검증
    // ─────────────────────────────────────────────

    describe('응답 구조', () => {
        it('로그가 없을 때 healthy 상태를 반환해야 한다', async () => {
            mockLokiQueryPort.queryErrorsAndWarnings.mockResolvedValue([]);

            const res = await request(app.getHttpServer())
                .get('/api/platform-admin/system-health')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            const { data } = res.body;
            expect(data.overallStatus).toBe('healthy');
            expect(data.issueGroups).toHaveLength(0);
            expect(data.summary).toEqual({ critical: 0, warning: 0, info: 0 });
            expect(data.services.kafka.status).toBe('healthy');
            expect(data.services.redis.status).toBe('healthy');
            expect(data.services.api.status).toBe('healthy');
        });

        it('응답에 필수 필드가 모두 포함되어야 한다', async () => {
            mockLokiQueryPort.queryErrorsAndWarnings.mockResolvedValue([]);

            const res = await request(app.getHttpServer())
                .get('/api/platform-admin/system-health')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            const { data } = res.body;
            expect(data).toHaveProperty('overallStatus');
            expect(data).toHaveProperty('asOf');
            expect(data).toHaveProperty('period');
            expect(data).toHaveProperty('services');
            expect(data).toHaveProperty('summary');
            expect(data).toHaveProperty('issueGroups');
            expect(data.period).toHaveProperty('from');
            expect(data.period).toHaveProperty('to');
        });
    });

    // ─────────────────────────────────────────────
    // 3. 이슈 분류 검증
    // ─────────────────────────────────────────────

    describe('이슈 분류', () => {
        it('Kafka 에러가 있을 때 infrastructure 그룹이 생성되어야 한다', async () => {
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

            mockLokiQueryPort.queryErrorsAndWarnings.mockResolvedValue([
                {
                    timestamp: twoHoursAgo,
                    level: 'error',
                    context: 'ServerKafka',
                    message: 'ERROR [Connection] connect ECONNREFUSED kafka:29092',
                    deployment: 'green',
                },
            ]);

            const res = await request(app.getHttpServer())
                .get('/api/platform-admin/system-health')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            const { data } = res.body;
            const kafkaGroup = data.issueGroups.find((g: any) => g.category === 'infrastructure');
            expect(kafkaGroup).toBeDefined();
            expect(kafkaGroup.title).toBe('채팅 서버 (Kafka) 연결 오류');
            expect(kafkaGroup.isResolved).toBe(true); // 2시간 전 = 해결됨
            expect(data.services.kafka.status).toBe('warning'); // 1시간 초과 = warning
        });

        it('비-API 경로 404는 security_probe로 분류되어야 한다', async () => {
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

            mockLokiQueryPort.queryErrorsAndWarnings.mockResolvedValue([
                {
                    timestamp: tenMinutesAgo,
                    level: 'error',
                    context: 'HttpExceptionFilter',
                    message: '[GET] /autodiscover/autodiscover.json?@zdi/Powershell - 404',
                    deployment: 'green',
                },
            ]);

            const res = await request(app.getHttpServer())
                .get('/api/platform-admin/system-health')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            const { data } = res.body;
            const probeGroup = data.issueGroups.find((g: any) => g.category === 'security_probe');
            expect(probeGroup).toBeDefined();
            expect(probeGroup.severity).toBe('info');
        });

        it('Kafka 에러가 최근 1시간 이내면 kafka status가 error여야 한다', async () => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

            mockLokiQueryPort.queryErrorsAndWarnings.mockResolvedValue([
                {
                    timestamp: fiveMinutesAgo,
                    level: 'error',
                    context: 'ServerKafka',
                    message: 'ERROR [Connection] connect ECONNREFUSED kafka:29092',
                    deployment: 'green',
                },
            ]);

            const res = await request(app.getHttpServer())
                .get('/api/platform-admin/system-health')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            const { data } = res.body;
            expect(data.services.kafka.status).toBe('error');
            expect(data.overallStatus).toBe('critical');
        });

        it('Redis(IoRedis) 에러가 최근 1시간 이내면 redis status가 error여야 한다', async () => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

            mockLokiQueryPort.queryErrorsAndWarnings.mockResolvedValue([
                {
                    timestamp: fiveMinutesAgo,
                    level: 'error',
                    context: 'IoRedis',
                    message: 'connect ECONNREFUSED redis:6379',
                    deployment: 'green',
                },
            ]);

            const res = await request(app.getHttpServer())
                .get('/api/platform-admin/system-health')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            const { data } = res.body as unknown as { data: SystemHealthResponseDto };
            expect(data.services.redis.status).toBe('error');
            expect(data.overallStatus).toBe('critical');
        });

        it('Kafka와 Redis 에러가 동시에 있으면 각각 독립적으로 추적되어야 한다', async () => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

            mockLokiQueryPort.queryErrorsAndWarnings.mockResolvedValue([
                {
                    timestamp: fiveMinutesAgo,
                    level: 'error',
                    context: 'ServerKafka',
                    message: 'ERROR [Connection] connect ECONNREFUSED kafka:29092',
                    deployment: 'green',
                },
                {
                    timestamp: fiveMinutesAgo,
                    level: 'error',
                    context: 'IoRedis',
                    message: 'connect ECONNREFUSED redis:6379',
                    deployment: 'green',
                },
            ]);

            const res = await request(app.getHttpServer())
                .get('/api/platform-admin/system-health')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            const { data } = res.body as unknown as { data: SystemHealthResponseDto };
            expect(data.issueGroups).toHaveLength(2);
            expect(data.services.kafka.status).toBe('error');
            expect(data.services.redis.status).toBe('error');
            expect(data.overallStatus).toBe('critical');
        });
    });

    // ─────────────────────────────────────────────
    // 4. 쿼리 파라미터 검증
    // ─────────────────────────────────────────────

    describe('쿼리 파라미터', () => {
        it('periodHours=48로 요청하면 period.from이 48시간 전이어야 한다', async () => {
            mockLokiQueryPort.queryErrorsAndWarnings.mockResolvedValue([]);

            const before = Date.now();
            const res = await request(app.getHttpServer())
                .get('/api/platform-admin/system-health?periodHours=48')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            const after = Date.now();

            const from = new Date(res.body.data.period.from).getTime();
            const expected48hAgo = before - 48 * 60 * 60 * 1000;

            // 요청 전후 시간 사이에 있어야 함 (오차 허용 1초)
            expect(from).toBeGreaterThanOrEqual(expected48hAgo - 1000);
            expect(from).toBeLessThanOrEqual(after - 47 * 60 * 60 * 1000);
        });

        it('periodHours가 169 이상이면 400을 반환해야 한다', async () => {
            await request(app.getHttpServer())
                .get('/api/platform-admin/system-health?periodHours=169')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(400);
        });

        it('periodHours=168 요청 시 Loki 쿼리 limit이 1000보다 커야 한다', async () => {
            mockLokiQueryPort.queryErrorsAndWarnings.mockResolvedValue([]);

            await request(app.getHttpServer())
                .get('/api/platform-admin/system-health?periodHours=168')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            const calls = mockLokiQueryPort.queryErrorsAndWarnings.mock.calls as Array<Array<{ limit: number }>>;
            expect(calls[0][0].limit).toBeGreaterThan(1000);
        });
    });
});

// ─────────────────────────────────────────────
// LogCategorizerService 유닛 테스트
// (순수 도메인 로직 — 외부 의존성 없음)
// ─────────────────────────────────────────────

describe('LogCategorizerService — 단위 테스트', () => {
    let service: LogCategorizerService;

    beforeEach(() => {
        service = new LogCategorizerService();
    });

    const makeEntry = (overrides: Partial<Parameters<typeof service.categorize>[0][0]> = {}) => ({
        timestamp: new Date().toISOString(),
        level: 'error',
        context: 'ServerKafka',
        message: 'connect ECONNREFUSED kafka:29092',
        deployment: 'green',
        ...overrides,
    });

    it('로그가 없으면 overallStatus가 healthy여야 한다', () => {
        const result = service.categorize([]);
        expect(result.overallStatus).toBe('healthy');
        expect(result.issueGroups).toHaveLength(0);
    });

    it('ServerKafka 에러는 infrastructure로 분류되어야 한다', () => {
        const result = service.categorize([makeEntry()]);
        expect(result.issueGroups[0].category).toBe('infrastructure');
    });

    it('/api/ 없는 경로의 HttpExceptionFilter 에러는 security_probe여야 한다', () => {
        const result = service.categorize([
            makeEntry({
                context: 'HttpExceptionFilter',
                message: '[GET] /autodiscover/autodiscover.json - 404',
            }),
        ]);
        expect(result.issueGroups[0].category).toBe('security_probe');
        expect(result.issueGroups[0].severity).toBe('info');
    });

    it('/api/ 경로의 HttpExceptionFilter 에러는 api_error여야 한다', () => {
        const result = service.categorize([
            makeEntry({
                context: 'HttpExceptionFilter',
                message: '[GET] /api/breeder/123 - 500',
            }),
        ]);
        expect(result.issueGroups[0].category).toBe('api_error');
    });

    it('30분 이상 지난 에러는 isResolved가 true여야 한다', () => {
        const fortyMinutesAgo = new Date(Date.now() - 40 * 60 * 1000).toISOString();
        const result = service.categorize([makeEntry({ timestamp: fortyMinutesAgo })]);
        expect(result.issueGroups[0].isResolved).toBe(true);
    });

    it('30분 이내 에러는 isResolved가 false여야 한다', () => {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const result = service.categorize([makeEntry({ timestamp: tenMinutesAgo })]);
        expect(result.issueGroups[0].isResolved).toBe(false);
    });

    it('같은 카테고리의 여러 에러는 하나의 그룹으로 묶여야 한다', () => {
        const entries = [
            makeEntry({ timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() }),
            makeEntry({ timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() }),
            makeEntry({ timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() }),
        ];
        const result = service.categorize(entries);
        expect(result.issueGroups).toHaveLength(1);
        expect(result.issueGroups[0].count).toBe(3);
    });

    it('미해결 infrastructure 에러가 있으면 overallStatus가 critical이어야 한다', () => {
        const recent = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const result = service.categorize([makeEntry({ timestamp: recent })]);
        expect(result.overallStatus).toBe('critical');
    });

    // ── Redis 분류 ──────────────────────────────────

    it('IoRedis 에러는 infrastructure로 분류되어야 한다', () => {
        const result = service.categorize([
            makeEntry({ context: 'IoRedis', message: 'connect ECONNREFUSED redis:6379' }),
        ]);
        expect(result.issueGroups[0].category).toBe('infrastructure');
    });

    it('Redis 에러의 groupKey는 infrastructure:Redis여야 한다', () => {
        const result = service.categorize([
            makeEntry({ context: 'IoRedis', message: 'connect ECONNREFUSED redis:6379' }),
        ]);
        expect(result.issueGroups[0].groupKey).toBe('infrastructure:Redis');
    });

    it('최근 1시간 이내 Redis 에러가 있으면 services.redis.status가 error여야 한다', () => {
        const recent = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const result = service.categorize([
            makeEntry({ context: 'IoRedis', message: 'connect ECONNREFUSED redis:6379', timestamp: recent }),
        ]);
        expect(result.services.redis.status).toBe('error');
    });

    it('1시간 이상 경과한 Redis 에러는 services.redis.status가 warning이어야 한다', () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        const result = service.categorize([
            makeEntry({ context: 'IoRedis', message: 'connect ECONNREFUSED redis:6379', timestamp: twoHoursAgo }),
        ]);
        expect(result.services.redis.status).toBe('warning');
    });

    it('Kafka와 Redis 에러가 동시에 있으면 2개의 독립 그룹이어야 한다', () => {
        const recent = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const result = service.categorize([
            makeEntry({ context: 'ServerKafka', message: 'ECONNREFUSED kafka:29092', timestamp: recent }),
            makeEntry({ context: 'IoRedis', message: 'ECONNREFUSED redis:6379', timestamp: recent }),
        ]);
        expect(result.issueGroups).toHaveLength(2);
        expect(result.services.kafka.status).toBe('error');
        expect(result.services.redis.status).toBe('error');
        expect(result.overallStatus).toBe('critical');
    });
});
