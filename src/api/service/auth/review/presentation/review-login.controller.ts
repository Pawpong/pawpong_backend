import { Body, Controller, Header, HttpCode, Post, Req } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import type { Request } from 'express';
import { ApiResponseDto } from '../../../../../common/dto/response/api-response.dto';
import { nativeAuthClientAddress } from '../../presentation/services/auth-native-client-address';
import { LoginReviewAccountUseCase } from '../application/login-review-account.use-case';

export class ReviewLoginRequestDto {
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    @IsEmail()
    @MaxLength(254)
    emailAddress: string;

    @IsString()
    @MinLength(1)
    @MaxLength(72)
    password: string;
}

@Controller('auth')
export class ReviewLoginController {
    constructor(private readonly login: LoginReviewAccountUseCase) {}

    /** 등록된 심사 계정의 일반 세션만 반환하며 쿠키는 프론트 BFF가 관리한다. */
    @Post('review-login')
    @HttpCode(200)
    @Header('Cache-Control', 'no-store')
    @Header('Pragma', 'no-cache')
    @Header('Referrer-Policy', 'no-referrer')
    async execute(@Body() dto: ReviewLoginRequestDto, @Req() request: Request) {
        const data = await this.login.execute({ ...dto, clientIp: nativeAuthClientAddress(request) });
        return ApiResponseDto.success(data, '로그인되었습니다.');
    }
}
