import type { Response } from 'express';

import { GetHealthUseCase } from '../../application/use-cases/get-health.use-case';
import { GetReadinessUseCase } from '../../application/use-cases/get-readiness.use-case';
import type { ReadinessResult } from '../../application/types/readiness-result.type';
import { HealthController } from '../../controller/health.controller';

const HEALTHY_READINESS: ReadinessResult = {
    status: 'healthy',
    timestamp: '2026-09-01T00:00:00.000Z',
    service: 'Pawpong Backend',
    version: '1.0.0-MVP',
    environment: 'test',
    uptime: 10,
    dependencies: {
        database: {
            status: 'healthy',
            connectionState: 'connected',
            latencyMs: 5,
        },
    },
};

describe('HealthController readiness', () => {
    const getHealth = jest.fn();
    const getReadiness = jest.fn<Promise<ReadinessResult>, []>();
    const responseStatus = jest.fn();
    const response = { status: responseStatus } as unknown as Response;
    const controller = new HealthController(
        { execute: getHealth } as unknown as GetHealthUseCase,
        { execute: getReadiness } as unknown as GetReadinessUseCase,
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('DB ping 성공 시 HTTP 상태를 변경하지 않고 표준 성공 봉투를 반환한다', async () => {
        getReadiness.mockResolvedValue(HEALTHY_READINESS);

        const result = await controller.getReadiness(response);

        expect(responseStatus).not.toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.code).toBe(200);
        expect(result.data?.dependencies.database.status).toBe('healthy');
    });

    it('DB ping 실패 시 HTTP 503과 진단 데이터를 함께 반환한다', async () => {
        getReadiness.mockResolvedValue({
            ...HEALTHY_READINESS,
            status: 'unhealthy',
            dependencies: {
                database: {
                    status: 'unhealthy',
                    connectionState: 'connected',
                    latencyMs: 3001,
                },
            },
        });

        const result = await controller.getReadiness(response);

        expect(responseStatus).toHaveBeenCalledWith(503);
        expect(result.success).toBe(false);
        expect(result.code).toBe(503);
        expect(result.data?.status).toBe('unhealthy');
        expect(result.error).toBe('데이터베이스 연결을 사용할 수 없습니다.');
    });
});
