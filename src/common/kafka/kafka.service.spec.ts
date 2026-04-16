import { KafkaService } from './kafka.service';
import { CustomLoggerService } from '../logger/custom-logger.service';
import { NotifyCriticalErrorUseCase } from '../discord/application/use-cases/notify-critical-error.use-case';

describe('KafkaService', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    let kafkaClient: { connect: jest.Mock; close: jest.Mock; emit: jest.Mock };
    let logger: jest.Mocked<Pick<CustomLoggerService, 'logSuccess' | 'warn' | 'logWarning' | 'logDbOperation' | 'logError'>>;
    let notifyCriticalErrorUseCase: jest.Mocked<Pick<NotifyCriticalErrorUseCase, 'execute'>>;

    beforeEach(() => {
        kafkaClient = {
            connect: jest.fn(),
            close: jest.fn(),
            emit: jest.fn(),
        };
        logger = {
            logSuccess: jest.fn(),
            warn: jest.fn(),
            logWarning: jest.fn(),
            logDbOperation: jest.fn(),
            logError: jest.fn(),
        };
        notifyCriticalErrorUseCase = {
            execute: jest.fn().mockResolvedValue({ sent: true }),
        };
    });

    afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv;
    });

    it('운영 환경에서 Kafka 연결 실패 시 critical 에러 알림을 요청해야 한다', async () => {
        process.env.NODE_ENV = 'production';
        kafkaClient.connect.mockRejectedValue(new Error('connect ECONNREFUSED kafka:29092'));

        const service = new KafkaService(
            kafkaClient as any,
            logger as unknown as CustomLoggerService,
            notifyCriticalErrorUseCase as unknown as NotifyCriticalErrorUseCase,
        );

        await service.onModuleInit();

        expect(notifyCriticalErrorUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                severity: 'critical',
                context: 'KafkaService',
                message: expect.stringContaining('Kafka 브로커 연결 실패'),
            }),
        );
    });

    it('개발 환경에서 Kafka 연결 실패 시 Discord 알림을 보내지 않아야 한다', async () => {
        process.env.NODE_ENV = 'development';
        kafkaClient.connect.mockRejectedValue(new Error('connect ECONNREFUSED kafka:29092'));

        const service = new KafkaService(
            kafkaClient as any,
            logger as unknown as CustomLoggerService,
            notifyCriticalErrorUseCase as unknown as NotifyCriticalErrorUseCase,
        );

        await service.onModuleInit();

        expect(notifyCriticalErrorUseCase.execute).not.toHaveBeenCalled();
    });
});
