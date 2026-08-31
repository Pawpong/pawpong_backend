import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AI_IMAGE_AGENT_HEALTH_PORT } from '../../application/ports/ai-image-agent-health.port';
import type { AiImageAgentHealthPort } from '../../application/ports/ai-image-agent-health.port';
import { cleanupDatabase, createTestingApp, getAdminToken } from '../../../../../common/testing/test-utils';

/**
 * AI Agent 상태 조회 계약 검증.
 *
 * 실제 gRPC 를 띄우지 않고 Port 를 대역으로 교체한다.
 * 여기서 확인하려는 것은 에이전트 응답이 아니라, 에이전트가 죽었을 때도
 * 어드민이 500 이 아닌 '상태'를 받는다는 계약이다.
 */
describe('AI Agent 상태 조회 (e2e)', () => {
    let app: INestApplication;
    let adminToken: string;
    const agentHealthPortStub: AiImageAgentHealthPort = {
        checkHealth: jest.fn(),
    };

    beforeAll(async () => {
        app = await createTestingApp([{ provide: AI_IMAGE_AGENT_HEALTH_PORT, useValue: agentHealthPortStub }]);
        adminToken = (await getAdminToken(app)) || '';
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상 상태를 그대로 반환한다', async () => {
        (agentHealthPortStub.checkHealth as jest.Mock).mockResolvedValue({
            status: 'SERVING',
            isReachable: true,
            version: '1.0.0',
            inFlightJobs: 2,
            kafkaConnected: true,
            openaiConfigured: true,
            errorMessage: null,
        });

        const response = await request(app.getHttpServer())
            .get('/api/ai-image-admin/agent/health')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('SERVING');
        expect(response.body.data.inFlightJobs).toBe(2);
        expect(response.body.data.kafkaConnected).toBe(true);
    });

    it('에이전트에 닿지 못해도 503 이 아니라 200 + UNREACHABLE 로 알린다', async () => {
        (agentHealthPortStub.checkHealth as jest.Mock).mockResolvedValue({
            status: 'UNREACHABLE',
            isReachable: false,
            version: null,
            inFlightJobs: 0,
            kafkaConnected: false,
            openaiConfigured: false,
            errorMessage: 'Timeout has occurred',
        });

        const response = await request(app.getHttpServer())
            .get('/api/ai-image-admin/agent/health')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.data.status).toBe('UNREACHABLE');
        expect(response.body.data.isReachable).toBe(false);
        expect(response.body.data.errorMessage).toBe('Timeout has occurred');
    });

    it('키가 빠진 DEGRADED 상태도 사유가 드러난다', async () => {
        (agentHealthPortStub.checkHealth as jest.Mock).mockResolvedValue({
            status: 'DEGRADED',
            isReachable: true,
            version: '1.0.0',
            inFlightJobs: 0,
            kafkaConnected: true,
            openaiConfigured: false,
            errorMessage: null,
        });

        const response = await request(app.getHttpServer())
            .get('/api/ai-image-admin/agent/health')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.data.status).toBe('DEGRADED');
        expect(response.body.data.openaiConfigured).toBe(false);
    });

    it('인증 없이 조회하면 401', async () => {
        await request(app.getHttpServer()).get('/api/ai-image-admin/agent/health').expect(401);

        expect(agentHealthPortStub.checkHealth).not.toHaveBeenCalled();
    });
});
