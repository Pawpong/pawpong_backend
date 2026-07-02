import { NotifyCriticalErrorUseCase } from '../../../application/use-cases/notify-critical-error.use-case';
import { DiscordErrorAlertPolicyService } from '../../../domain/services/discord-error-alert-policy.service';
import { DiscordErrorAlertPort } from '../../../application/ports/discord-error-alert.port';
import { CustomLoggerService } from '../../../../logger/custom-logger.service';

describe('NotifyCriticalErrorUseCase', () => {
    let useCase: NotifyCriticalErrorUseCase;
    let errorAlertPort: jest.Mocked<DiscordErrorAlertPort>;
    let logger: jest.Mocked<Pick<CustomLoggerService, 'logError'>>;
    let originalNodeEnv: string | undefined;

    beforeEach(() => {
        // Use Case는 운영 환경(NODE_ENV=production)에서만 실제 발송하므로,
        // 발송/정책 로직 자체를 검증하기 위해 production 환경을 강제한다.
        originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        errorAlertPort = {
            sendCriticalErrorAlert: jest.fn().mockResolvedValue(undefined),
        };
        logger = {
            logError: jest.fn(),
        };

        useCase = new NotifyCriticalErrorUseCase(
            new DiscordErrorAlertPolicyService(),
            errorAlertPort,
            logger as unknown as CustomLoggerService,
        );
    });

    afterEach(() => {
        // 다른 테스트에 NODE_ENV 변경이 새어나가지 않도록 원복한다.
        if (originalNodeEnv === undefined) {
            delete process.env.NODE_ENV;
        } else {
            process.env.NODE_ENV = originalNodeEnv;
        }
    });

    it('비-운영 환경(NODE_ENV!=production)에서는 발송하지 않고 filtered 처리해야 한다', async () => {
        process.env.NODE_ENV = 'test';

        const result = await useCase.execute({
            severity: 'critical',
            context: 'AllExceptionsFilter',
            message: 'Internal server error',
            statusCode: 500,
        });

        expect(result).toEqual({ sent: false, reason: 'filtered' });
        expect(errorAlertPort.sendCriticalErrorAlert).not.toHaveBeenCalled();
    });

    it('critical 5xx 에러를 Discord 알림 Port로 전달해야 한다', async () => {
        const result = await useCase.execute(
            {
                severity: 'critical',
                context: 'AllExceptionsFilter',
                message: 'Internal server error',
                statusCode: 500,
                method: 'GET',
                path: '/api/test',
            },
            new Date('2026-04-16T00:00:00.000Z'),
        );

        expect(result).toEqual({ sent: true });
        expect(errorAlertPort.sendCriticalErrorAlert).toHaveBeenCalledTimes(1);
        expect(errorAlertPort.sendCriticalErrorAlert).toHaveBeenCalledWith(
            expect.objectContaining({
                context: 'AllExceptionsFilter',
                statusCode: 500,
                timestamp: new Date('2026-04-16T00:00:00.000Z'),
            }),
        );
    });

    it('4xx 에러는 Discord 알림을 보내지 않아야 한다', async () => {
        const result = await useCase.execute({
            severity: 'error',
            context: 'HttpExceptionFilter',
            message: 'Bad Request',
            statusCode: 400,
        });

        expect(result).toEqual({ sent: false, reason: 'filtered' });
        expect(errorAlertPort.sendCriticalErrorAlert).not.toHaveBeenCalled();
    });

    it('같은 에러가 쿨다운 안에 반복되면 한 번만 보내야 한다', async () => {
        const request = {
            severity: 'critical' as const,
            context: 'AllExceptionsFilter',
            message: 'Redis connection failed',
            statusCode: 500,
            method: 'GET',
            path: '/api/test',
        };

        const first = await useCase.execute(request, new Date('2026-04-16T00:00:00.000Z'));
        const second = await useCase.execute(request, new Date('2026-04-16T00:01:00.000Z'));

        expect(first).toEqual({ sent: true });
        expect(second).toEqual({ sent: false, reason: 'cooldown' });
        expect(errorAlertPort.sendCriticalErrorAlert).toHaveBeenCalledTimes(1);
    });
});
