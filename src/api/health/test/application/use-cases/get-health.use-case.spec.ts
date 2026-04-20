import { GetHealthUseCase } from '../../../application/use-cases/get-health.use-case';
import { SYSTEM_RUNTIME_READER_PORT, SystemRuntimeReaderPort } from '../../../application/ports/system-runtime-reader.port';

function makeRuntimeReader(overrides: Partial<SystemRuntimeReaderPort> = {}): SystemRuntimeReaderPort {
    return {
        read: () => ({
            timestamp: '2024-01-01T00:00:00.000Z',
            environment: 'test',
            uptime: 12345,
        }),
        ...overrides,
    };
}

describe('헬스체크 유스케이스', () => {
    let useCase: GetHealthUseCase;

    beforeEach(() => {
        useCase = new GetHealthUseCase(makeRuntimeReader());
    });

    it('healthy 상태와 서비스 정보를 반환한다', () => {
        const result = useCase.execute();

        expect(result.status).toBe('healthy');
        expect(result.service).toBe('Pawpong Backend');
        expect(result.version).toBe('1.0.0-MVP');
        expect(result.environment).toBe('test');
        expect(result.timestamp).toBe('2024-01-01T00:00:00.000Z');
        expect(result.uptime).toBe(12345);
    });

    it('런타임 리더에서 읽은 환경 정보를 그대로 반영한다', () => {
        const customReader = makeRuntimeReader({
            read: () => ({
                timestamp: '2024-06-15T12:00:00.000Z',
                environment: 'production',
                uptime: 99999,
            }),
        });
        useCase = new GetHealthUseCase(customReader);

        const result = useCase.execute();

        expect(result.environment).toBe('production');
        expect(result.uptime).toBe(99999);
        expect(result.timestamp).toBe('2024-06-15T12:00:00.000Z');
    });
});
