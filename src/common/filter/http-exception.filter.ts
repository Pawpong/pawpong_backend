import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

import { ApiResponseDto } from '../dto/response/api-response.dto';
import { NotifyCriticalErrorUseCase } from '../discord/application/use-cases/notify-critical-error.use-case';

/**
 * HTTP 예외 필터
 * 모든 HTTP 예외를 ApiResponseDto 형식으로 변환하여 반환합니다.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    constructor(private readonly notifyCriticalErrorUseCase?: NotifyCriticalErrorUseCase) {}

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        // 예외 응답 가져오기
        const exceptionResponse = exception.getResponse();
        let errorMessage: string;

        // 에러 메시지 추출
        if (typeof exceptionResponse === 'string') {
            errorMessage = exceptionResponse;
        } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
            const responseObj = exceptionResponse as any;
            errorMessage = responseObj.message || responseObj.error || 'Unknown error';

            // message가 배열인 경우 (ValidationPipe 에러)
            if (Array.isArray(errorMessage)) {
                errorMessage = errorMessage.join(', ');
            }
        } else {
            errorMessage = 'Unknown error';
        }

        // 에러 로깅
        this.logger.error(`[${request.method}] ${request.url} - ${status} - ${errorMessage}`);
        this.notifyCriticalError(exception, request, status, errorMessage);

        // ApiResponseDto 형식으로 응답
        const errorResponse = ApiResponseDto.error(errorMessage, status);

        response.status(status).json(errorResponse);
    }

    /**
     * 5xx HTTP 예외만 Discord critical 에러 알림으로 전달합니다.
     */
    private notifyCriticalError(exception: HttpException, request: Request, status: number, message: string): void {
        if (!this.notifyCriticalErrorUseCase || status < 500) {
            return;
        }

        const requestUser = (request as Request & { user?: { userId?: string; sub?: string } }).user;

        void this.notifyCriticalErrorUseCase
            .execute({
                severity: 'critical',
                context: HttpExceptionFilter.name,
                message,
                statusCode: status,
                method: request.method,
                path: request.originalUrl ?? request.url,
                stack: exception.stack,
                userId: requestUser?.userId ?? requestUser?.sub,
            })
            .catch((error) => {
                this.logger.error('[notifyCriticalError] Discord 에러 알림 실패', error.stack);
            });
    }
}

/**
 * 모든 예외 필터 (500 에러 등)
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly notifyCriticalErrorUseCase?: NotifyCriticalErrorUseCase) {}

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = exception instanceof Error ? exception.message : 'Internal server error';

        // 에러 로깅
        this.logger.error(`[${request.method}] ${request.url} - ${status} - ${message}`, exception.stack);
        this.notifyCriticalError(exception, request, status, message);

        // ApiResponseDto 형식으로 응답
        const errorResponse = ApiResponseDto.error(message, status);

        response.status(status).json(errorResponse);
    }

    /**
     * 예상하지 못한 5xx 예외를 Discord critical 에러 알림으로 전달합니다.
     */
    private notifyCriticalError(exception: any, request: Request, status: number, message: string): void {
        if (!this.notifyCriticalErrorUseCase || status < 500) {
            return;
        }

        const requestUser = (request as Request & { user?: { userId?: string; sub?: string } }).user;

        void this.notifyCriticalErrorUseCase
            .execute({
                severity: 'critical',
                context: AllExceptionsFilter.name,
                message,
                statusCode: status,
                method: request.method,
                path: request.originalUrl ?? request.url,
                stack: exception instanceof Error ? exception.stack : undefined,
                userId: requestUser?.userId ?? requestUser?.sub,
            })
            .catch((error) => {
                this.logger.error('[notifyCriticalError] Discord 에러 알림 실패', error.stack);
            });
    }
}
