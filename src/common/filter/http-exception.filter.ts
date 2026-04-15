import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

import { ApiResponseDto } from '../dto/response/api-response.dto';
import { DomainError } from '../error/domain.error';

type HttpExceptionResponseBody = {
    message?: string | string[];
    error?: string;
};

/**
 * HTTP 예외 필터
 * 모든 HTTP 예외를 ApiResponseDto 형식으로 변환하여 반환합니다.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

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
            const responseObj = exceptionResponse as HttpExceptionResponseBody;
            const rawMessage = responseObj.message ?? responseObj.error;
            errorMessage = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage || 'Unknown error';

        } else {
            errorMessage = 'Unknown error';
        }

        // 에러 로깅
        this.logger.error(`[${request.method}] ${request.url} - ${status} - ${errorMessage}`);

        // ApiResponseDto 형식으로 응답
        const errorResponse = ApiResponseDto.error(errorMessage, status);

        response.status(status).json(errorResponse);
    }
}

/**
 * 도메인 예외 필터
 * DomainError를 ApiResponseDto 형식으로 변환하여 반환합니다.
 */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(DomainExceptionFilter.name);

    catch(exception: DomainError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        this.logger.error(`[${request.method}] ${request.url} - ${exception.statusCode} - ${exception.message}`);

        response.status(exception.statusCode).json(ApiResponseDto.error(exception.message, exception.statusCode));
    }
}

/**
 * 모든 예외 필터 (500 에러 등)
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = exception instanceof DomainError
            ? exception.statusCode
            : exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = exception instanceof Error ? exception.message : 'Internal server error';
        const stack = exception instanceof Error ? exception.stack : undefined;

        // 에러 로깅
        this.logger.error(`[${request.method}] ${request.url} - ${status} - ${message}`, stack);

        // ApiResponseDto 형식으로 응답
        const errorResponse = ApiResponseDto.error(message, status);

        response.status(status).json(errorResponse);
    }
}
