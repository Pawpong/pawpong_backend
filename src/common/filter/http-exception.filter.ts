import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

import { ApiResponseDto } from '../dto/response/api-response.dto';
import { DomainError } from '../error/domain.error';
import { NotifyCriticalErrorUseCase } from '../discord/application/use-cases/notify-critical-error.use-case';

type HttpExceptionResponseBody = {
    message?: string | string[];
    error?: string;
};

function getHttpExceptionMessage(exception: HttpException): string {
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
        return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as HttpExceptionResponseBody;
        const rawMessage = responseObj.message ?? responseObj.error;
        return Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage || 'Unknown error';
    }

    return 'Unknown error';
}

/**
 * 모든 예외 필터
 * DomainError, HttpException, 예상치 못한 예외를 ApiResponseDto 형식으로 변환합니다.
 * 5xx 에러는 Discord critical 에러 알림을 전송합니다.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly notifyCriticalErrorUseCase?: NotifyCriticalErrorUseCase) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof DomainError
                ? exception.statusCode
                : exception instanceof HttpException
                    ? exception.getStatus()
                    : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof DomainError
                ? exception.message
                : exception instanceof HttpException
                    ? getHttpExceptionMessage(exception)
                    : exception instanceof Error
                        ? exception.message
                        : 'Internal server error';
        const stack = exception instanceof Error ? exception.stack : undefined;

        this.logger.error(`[${request.method}] ${request.url} - ${status} - ${message}`, stack);
        this.notifyCriticalError(exception, request, status, message);

        response.status(status).json(ApiResponseDto.error(message, status));
    }

    /**
     * 5xx 예외만 Discord critical 에러 알림으로 전달합니다.
     */
    private notifyCriticalError(exception: unknown, request: Request, status: number, message: string): void {
        if (!this.notifyCriticalErrorUseCase || status < 500) {
            return;
        }

        const requestUser = (request as Request & { user?: { userId?: string; sub?: string } }).user;
        const stack = exception instanceof Error ? exception.stack : undefined;

        void this.notifyCriticalErrorUseCase
            .execute({
                severity: 'critical',
                context: AllExceptionsFilter.name,
                message,
                statusCode: status,
                method: request.method,
                path: request.originalUrl ?? request.url,
                stack,
                userId: requestUser?.userId ?? requestUser?.sub,
            })
            .catch((error) => {
                this.logger.error('[notifyCriticalError] Discord 에러 알림 실패', error.stack);
            });
    }
}
