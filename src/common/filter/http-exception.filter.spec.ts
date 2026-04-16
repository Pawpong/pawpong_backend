import { ArgumentsHost, BadRequestException, InternalServerErrorException } from '@nestjs/common';

import { AllExceptionsFilter, HttpExceptionFilter } from './http-exception.filter';
import { NotifyCriticalErrorUseCase } from '../discord/application/use-cases/notify-critical-error.use-case';

describe('HttpExceptionFilter Discord 알림', () => {
    let notifyCriticalErrorUseCase: jest.Mocked<Pick<NotifyCriticalErrorUseCase, 'execute'>>;

    beforeEach(() => {
        notifyCriticalErrorUseCase = {
            execute: jest.fn().mockResolvedValue({ sent: true }),
        };
    });

    it('HttpException 5xx는 critical 에러 알림 use-case로 전달해야 한다', () => {
        const filter = new HttpExceptionFilter(notifyCriticalErrorUseCase as unknown as NotifyCriticalErrorUseCase);
        const host = createHttpArgumentsHost();

        filter.catch(new InternalServerErrorException('서버 오류'), host);

        expect(notifyCriticalErrorUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                severity: 'critical',
                context: 'HttpExceptionFilter',
                statusCode: 500,
                method: 'GET',
                path: '/api/test',
            }),
        );
    });

    it('HttpException 4xx는 critical 에러 알림을 보내지 않아야 한다', () => {
        const filter = new HttpExceptionFilter(notifyCriticalErrorUseCase as unknown as NotifyCriticalErrorUseCase);
        const host = createHttpArgumentsHost();

        filter.catch(new BadRequestException('잘못된 요청'), host);

        expect(notifyCriticalErrorUseCase.execute).not.toHaveBeenCalled();
    });
});

describe('AllExceptionsFilter Discord 알림', () => {
    it('예상하지 못한 예외는 critical 에러 알림 use-case로 전달해야 한다', () => {
        const notifyCriticalErrorUseCase = {
            execute: jest.fn().mockResolvedValue({ sent: true }),
        };
        const filter = new AllExceptionsFilter(notifyCriticalErrorUseCase as unknown as NotifyCriticalErrorUseCase);
        const host = createHttpArgumentsHost();

        filter.catch(new Error('DB connection failed'), host);

        expect(notifyCriticalErrorUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                severity: 'critical',
                context: 'AllExceptionsFilter',
                message: 'DB connection failed',
                statusCode: 500,
                method: 'GET',
                path: '/api/test',
            }),
        );
    });
});

/**
 * ExceptionFilter 단위 테스트용 HTTP ArgumentsHost Mock을 생성합니다.
 */
function createHttpArgumentsHost(): ArgumentsHost {
    const request = {
        method: 'GET',
        url: '/api/test',
        originalUrl: '/api/test',
        user: { userId: 'user-1' },
    };
    const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };

    return {
        switchToHttp: () => ({
            getRequest: () => request,
            getResponse: () => response,
            getNext: jest.fn(),
        }),
        getArgByIndex: jest.fn(),
        getArgs: jest.fn(),
        getClass: jest.fn(),
        getHandler: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
    } as unknown as ArgumentsHost;
}
