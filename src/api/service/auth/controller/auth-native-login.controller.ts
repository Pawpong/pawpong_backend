import { Body, Header, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { AuthPublicController } from '../decorator/auth-public-controller.decorator';
import { StartNativeGoogleLoginUseCase } from '../application/use-cases/start-native-google-login.use-case';
import { ExchangeNativeLoginUseCase } from '../application/use-cases/exchange-native-login.use-case';
import {
    StartNativeGoogleLoginRequestDto,
    ExchangeNativeLoginRequestDto,
} from '../dto/request/native-login-request.dto';
import { ApiStartNativeGoogleLoginEndpoint, ApiExchangeNativeLoginEndpoint } from '../swagger/native-login.swagger';
import { AuthNativeStartLimitGuard } from '../presentation/guards/auth-native-start-limit.guard';

@AuthPublicController()
export class AuthNativeLoginController {
    constructor(
        private readonly startLogin: StartNativeGoogleLoginUseCase,
        private readonly exchangeLogin: ExchangeNativeLoginUseCase,
    ) {}

    /** 브라우저 쿠키에 의존하지 않는 앱 인증 세션을 발급한다. */
    @Post('native/google/start')
    @UseGuards(AuthNativeStartLimitGuard)
    @HttpCode(HttpStatus.OK)
    @Header('Cache-Control', 'no-store')
    @ApiStartNativeGoogleLoginEndpoint()
    async start(@Body() input: StartNativeGoogleLoginRequestDto) {
        return ApiResponseDto.success(await this.startLogin.execute(input));
    }

    /** 교환 결과는 앱의 기존 WebView 쿠키 생성 경로에서 사용한다. */
    @Post('native/exchange')
    @HttpCode(HttpStatus.OK)
    @Header('Cache-Control', 'no-store')
    @ApiExchangeNativeLoginEndpoint()
    async exchange(@Body() input: ExchangeNativeLoginRequestDto) {
        return ApiResponseDto.success(await this.exchangeLogin.execute(input));
    }
}
