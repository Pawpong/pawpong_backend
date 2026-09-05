import { GetReadinessUseCase } from '../../../application/use-cases/get-readiness.use-case';
import type { DatabaseReadinessReaderPort } from '../../../application/ports/database-readiness-reader.port';
import type { SystemRuntimeReaderPort } from '../../../application/ports/system-runtime-reader.port';

describe('준비 상태 조회 유스케이스', () => {
    const runtimeReader: SystemRuntimeReaderPort = {
        read: () => ({
            timestamp: '2026-09-01T00:00:00.000Z',
            environment: 'test',
            uptime: 42,
        }),
    };

    it('MongoDB ping 성공 시 healthy와 의존성 상태를 반환한다', async () => {
        const databaseReader: DatabaseReadinessReaderPort = {
            read: jest.fn().mockResolvedValue({
                status: 'healthy',
                connectionState: 'connected',
                latencyMs: 8,
            }),
        };
        const useCase = new GetReadinessUseCase(runtimeReader, databaseReader);

        const result = await useCase.execute();

        expect(result.status).toBe('healthy');
        expect(result.dependencies.database.status).toBe('healthy');
        expect(result.dependencies.database.latencyMs).toBe(8);
    });

    it('드라이버가 connected여도 ping 실패 결과면 unhealthy를 반환한다', async () => {
        const databaseReader: DatabaseReadinessReaderPort = {
            read: jest.fn().mockResolvedValue({
                status: 'unhealthy',
                connectionState: 'connected',
                latencyMs: 3000,
            }),
        };
        const useCase = new GetReadinessUseCase(runtimeReader, databaseReader);

        const result = await useCase.execute();

        expect(result.status).toBe('unhealthy');
        expect(result.dependencies.database.connectionState).toBe('connected');
    });
});
