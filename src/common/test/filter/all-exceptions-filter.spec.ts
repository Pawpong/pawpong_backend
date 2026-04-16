import { BadRequestException } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import {
    DomainAuthenticationError,
    DomainValidationError,
} from '../../../common/error/domain.error';
import { AllExceptionsFilter } from '../../../common/filter/http-exception.filter';

describe('AllExceptionsFilter', () => {
    const createHost = () => {
        const json = jest.fn();
        const status = jest.fn().mockReturnValue({ json });
        const response = { status };
        const request = {
            method: 'GET',
            url: '/api/test',
        };

        return {
            host: {
                switchToHttp: () => ({
                    getResponse: () => response,
                    getRequest: () => request,
                }),
            } as never,
            response,
            status,
            json,
        };
    };

    it('DomainError는 statusCode와 message를 그대로 응답한다', () => {
        const filter = new AllExceptionsFilter();
        const { host, status, json } = createHost();

        filter.catch(new DomainValidationError('유효하지 않은 요청입니다.'), host);

        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                code: 400,
                error: '유효하지 않은 요청입니다.',
            }),
        );
    });

    it('HttpException은 Nest 응답 본문 메시지를 사용한다', () => {
        const filter = new AllExceptionsFilter();
        const { host, status, json } = createHost();

        filter.catch(new BadRequestException(['값이 필요합니다.', '형식이 올바르지 않습니다.']), host);

        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                code: 400,
                error: '값이 필요합니다., 형식이 올바르지 않습니다.',
            }),
        );
    });

    it('일반 Error는 500으로 감싼다', () => {
        const filter = new AllExceptionsFilter();
        const { host, status, json } = createHost();

        filter.catch(new Error('unexpected failure'), host);

        expect(status).toHaveBeenCalledWith(500);
        expect(json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                code: 500,
                error: 'unexpected failure',
            }),
        );
    });

    it('401 도메인 인증 예외도 그대로 응답한다', () => {
        const filter = new AllExceptionsFilter();
        const { host, status, json } = createHost();

        filter.catch(new DomainAuthenticationError('인증 토큰이 필요합니다.'), host);

        expect(status).toHaveBeenCalledWith(401);
        expect(json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                code: 401,
                error: '인증 토큰이 필요합니다.',
            }),
        );
    });
});
