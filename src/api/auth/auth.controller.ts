import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Get,
    Req,
    Res,
    Query,
    UseInterceptors,
    UploadedFiles,
    UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guard/optional-jwt-auth.guard';

import { GetActiveProfileBannersUseCase } from '../breeder-management/admin/application/use-cases/get-active-profile-banners.use-case';
import { CheckSocialUserUseCase } from './application/use-cases/check-social-user.use-case';
import { CheckEmailDuplicateUseCase } from './application/use-cases/check-email-duplicate.use-case';
import { CheckNicknameDuplicateUseCase } from './application/use-cases/check-nickname-duplicate.use-case';
import { CheckBreederNameDuplicateUseCase } from './application/use-cases/check-breeder-name-duplicate.use-case';
import { CompleteSocialRegistrationUseCase } from './application/use-cases/complete-social-registration.use-case';
import { RefreshAuthTokenUseCase } from './application/use-cases/refresh-auth-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RegisterAdopterUseCase } from './application/use-cases/register-adopter.use-case';
import { RegisterBreederUseCase } from './application/use-cases/register-breeder.use-case';
import { ProcessSocialLoginCallbackUseCase } from './application/use-cases/process-social-login-callback.use-case';
import { GetSocialLoginRedirectUrlUseCase } from './application/use-cases/get-social-login-redirect-url.use-case';
import { SendPhoneVerificationCodeUseCase } from './application/use-cases/send-phone-verification-code.use-case';
import { VerifyPhoneVerificationCodeUseCase } from './application/use-cases/verify-phone-verification-code.use-case';
import { UploadAuthProfileImageUseCase } from './application/use-cases/upload-auth-profile-image.use-case';
import { UploadAuthBreederDocumentsUseCase } from './application/use-cases/upload-auth-breeder-documents.use-case';

import { RefreshTokenRequestDto } from './dto/request/refresh-token-request.dto';
import { CheckNicknameRequestDto } from './dto/request/check-nickname-request.dto';
import { CheckEmailRequestDto } from './dto/request/check-email-request.dto';
import { CheckBreederNameRequestDto } from './dto/request/check-breeder-name-request.dto';
import { CheckSocialUserRequestDto } from './dto/request/check-social-user-request.dto';
import { SocialCompleteRequestDto } from './dto/request/social-complete-request.dto';
import { RegisterAdopterRequestDto } from './dto/request/register-adopter-request.dto';
import { RegisterBreederRequestDto } from './dto/request/register-breeder-request.dto';
import { UploadBreederDocumentsRequestDto } from './dto/request/upload-breeder-documents-request.dto';
import { SendVerificationCodeRequestDto, VerifyCodeRequestDto } from './dto/request/phone-verification-request.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { TokenResponseDto } from './dto/response/token-response.dto';
import { LogoutResponseDto } from './dto/response/logout-response.dto';
import { UploadResponseDto } from '../upload/dto/response/upload-response.dto';
import { RegisterAdopterResponseDto } from './dto/response/register-adopter-response.dto';
import { RegisterBreederResponseDto } from './dto/response/register-breeder-response.dto';
import { SocialCheckUserResponseDto } from './dto/response/social-check-user-response.dto';
import { PhoneVerificationResponseDto } from './dto/response/phone-verification-response.dto';
import { VerificationDocumentsResponseDto } from './dto/response/verification-documents-response.dto';
import { ProfileBannerResponseDto } from '../breeder-management/admin/dto/response/profile-banner-response.dto';
import {
    ApiAuthController,
    ApiCheckBreederNameDuplicateEndpoint,
    ApiCheckEmailDuplicateEndpoint,
    ApiCheckNicknameDuplicateEndpoint,
    ApiCheckSocialUserEndpoint,
    ApiCompleteSocialRegistrationEndpoint,
    ApiGetLoginBannersEndpoint,
    ApiGetRegisterBannersEndpoint,
    ApiGoogleCallbackEndpoint,
    ApiGoogleLoginEndpoint,
    ApiKakaoCallbackEndpoint,
    ApiKakaoLoginEndpoint,
    ApiLogoutAuthEndpoint,
    ApiNaverCallbackEndpoint,
    ApiNaverLoginEndpoint,
    ApiRefreshAuthEndpoint,
    ApiRegisterAdopterEndpoint,
    ApiRegisterBreederEndpoint,
    ApiSendPhoneVerificationCodeEndpoint,
    ApiUploadBreederDocumentsEndpoint,
    ApiUploadProfileEndpoint,
    ApiVerifyPhoneVerificationCodeEndpoint,
} from './swagger';

@ApiAuthController()
@Controller('auth')
export class AuthController {
    constructor(
        private readonly getActiveProfileBannersUseCase: GetActiveProfileBannersUseCase,
        private readonly checkSocialUserUseCase: CheckSocialUserUseCase,
        private readonly checkEmailDuplicateUseCase: CheckEmailDuplicateUseCase,
        private readonly checkNicknameDuplicateUseCase: CheckNicknameDuplicateUseCase,
        private readonly checkBreederNameDuplicateUseCase: CheckBreederNameDuplicateUseCase,
        private readonly completeSocialRegistrationUseCase: CompleteSocialRegistrationUseCase,
        private readonly refreshAuthTokenUseCase: RefreshAuthTokenUseCase,
        private readonly logoutUseCase: LogoutUseCase,
        private readonly registerAdopterUseCase: RegisterAdopterUseCase,
        private readonly registerBreederUseCase: RegisterBreederUseCase,
        private readonly processSocialLoginCallbackUseCase: ProcessSocialLoginCallbackUseCase,
        private readonly getSocialLoginRedirectUrlUseCase: GetSocialLoginRedirectUrlUseCase,
        private readonly sendPhoneVerificationCodeUseCase: SendPhoneVerificationCodeUseCase,
        private readonly verifyPhoneVerificationCodeUseCase: VerifyPhoneVerificationCodeUseCase,
        private readonly uploadAuthProfileImageUseCase: UploadAuthProfileImageUseCase,
        private readonly uploadAuthBreederDocumentsUseCase: UploadAuthBreederDocumentsUseCase,
    ) {}

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiRefreshAuthEndpoint()
    async refreshToken(@Body() refreshTokenDto: RefreshTokenRequestDto): Promise<ApiResponseDto<TokenResponseDto>> {
        const result = await this.refreshAuthTokenUseCase.execute(refreshTokenDto);
        return ApiResponseDto.success(result, '토큰이 재발급되었습니다.');
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiLogoutAuthEndpoint()
    async logout(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<ApiResponseDto<LogoutResponseDto>> {
        const response = await this.logoutUseCase.execute(userId, role);

        // HTTP-only 쿠키 삭제 (maxAge: 0으로 설정하여 즉시 만료)
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            // cross-site 요청을 위해 'none' 사용 (프론트: pawpong.kr, 백엔드: dev-api.pawpong.kr)
            sameSite: isProduction ? ('none' as const) : ('lax' as const),
            // 프로덕션 환경에서는 .pawpong.kr 도메인으로 설정하여 서브도메인 간 쿠키 공유
            domain: isProduction ? '.pawpong.kr' : undefined,
            path: '/',
            maxAge: 0,
        };

        res.cookie('accessToken', '', cookieOptions);
        res.cookie('refreshToken', '', cookieOptions);
        res.cookie('userRole', '', { ...cookieOptions, httpOnly: false });

        return ApiResponseDto.success(response, '로그아웃되었습니다.');
    }

    @Post('phone/send-code')
    @HttpCode(HttpStatus.OK)
    @ApiSendPhoneVerificationCodeEndpoint()
    async sendVerificationCode(
        @Body() sendCodeDto: SendVerificationCodeRequestDto,
    ): Promise<ApiResponseDto<PhoneVerificationResponseDto>> {
        const result = await this.sendPhoneVerificationCodeUseCase.execute(sendCodeDto.phone);
        return ApiResponseDto.success(new PhoneVerificationResponseDto(result.success, result.message));
    }

    @Post('phone/verify-code')
    @HttpCode(HttpStatus.OK)
    @ApiVerifyPhoneVerificationCodeEndpoint()
    async verifyCode(
        @Body() verifyCodeDto: VerifyCodeRequestDto,
    ): Promise<ApiResponseDto<PhoneVerificationResponseDto>> {
        const result = await this.verifyPhoneVerificationCodeUseCase.execute(verifyCodeDto.phone, verifyCodeDto.code);
        return ApiResponseDto.success(new PhoneVerificationResponseDto(result.success, result.message));
    }

    @Get('google')
    @ApiGoogleLoginEndpoint()
    async googleLogin(@Req() req, @Res() res: Response) {
        return this.redirectToSocialLogin('google', req, res);
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @ApiGoogleCallbackEndpoint()
    async googleCallback(@Req() req, @Res() res: Response) {
        return this.handleSocialCallback(req, res);
    }

    @Get('naver')
    @ApiNaverLoginEndpoint()
    async naverLogin(@Req() req, @Res() res: Response) {
        return this.redirectToSocialLogin('naver', req, res);
    }

    @Get('naver/callback')
    @UseGuards(AuthGuard('naver'))
    @ApiNaverCallbackEndpoint()
    async naverCallback(@Req() req, @Res() res: Response) {
        return this.handleSocialCallback(req, res);
    }

    @Get('kakao')
    @ApiKakaoLoginEndpoint()
    async kakaoLogin(@Req() req, @Res() res: Response) {
        return this.redirectToSocialLogin('kakao', req, res);
    }

    @Get('kakao/callback')
    @UseGuards(AuthGuard('kakao'))
    @ApiKakaoCallbackEndpoint()
    async kakaoCallback(@Req() req, @Res() res: Response) {
        return this.handleSocialCallback(req, res);
    }

    @Post('social/complete')
    @HttpCode(HttpStatus.OK)
    @ApiCompleteSocialRegistrationEndpoint()
    async completeSocialRegistration(
        @Body() dto: SocialCompleteRequestDto,
    ): Promise<ApiResponseDto<RegisterAdopterResponseDto | RegisterBreederResponseDto>> {
        const result = await this.completeSocialRegistrationUseCase.execute(dto);
        const message =
            dto.role === 'adopter' ? '입양자 회원가입이 완료되었습니다.' : '브리더 회원가입이 완료되었습니다.';
        return ApiResponseDto.success(result, message);
    }

    @Post('check-email')
    @HttpCode(HttpStatus.OK)
    @ApiCheckEmailDuplicateEndpoint()
    async checkEmailDuplicate(@Body() dto: CheckEmailRequestDto): Promise<ApiResponseDto<{ isDuplicate: boolean }>> {
        const isDuplicate = await this.checkEmailDuplicateUseCase.execute(dto.email);
        return ApiResponseDto.success(
            { isDuplicate },
            isDuplicate ? '이미 가입된 이메일입니다.' : '사용 가능한 이메일입니다.',
        );
    }

    @Post('check-nickname')
    @HttpCode(HttpStatus.OK)
    @ApiCheckNicknameDuplicateEndpoint()
    async checkNicknameDuplicate(
        @Body() checkNicknameDto: CheckNicknameRequestDto,
    ): Promise<ApiResponseDto<{ isDuplicate: boolean }>> {
        const isDuplicate = await this.checkNicknameDuplicateUseCase.execute(checkNicknameDto.nickname);
        return ApiResponseDto.success(
            { isDuplicate },
            isDuplicate ? '이미 사용 중인 닉네임입니다.' : '사용 가능한 닉네임입니다.',
        );
    }

    @Post('check-breeder-name')
    @HttpCode(HttpStatus.OK)
    @ApiCheckBreederNameDuplicateEndpoint()
    async checkBreederNameDuplicate(
        @Body() dto: CheckBreederNameRequestDto,
    ): Promise<ApiResponseDto<{ isDuplicate: boolean }>> {
        const isDuplicate = await this.checkBreederNameDuplicateUseCase.execute(dto.breederName);
        return ApiResponseDto.success(
            { isDuplicate },
            isDuplicate ? '이미 사용 중인 상호명입니다.' : '사용 가능한 상호명입니다.',
        );
    }

    @Post('social/check-user')
    @HttpCode(HttpStatus.OK)
    @ApiCheckSocialUserEndpoint()
    async checkSocialUser(
        @Body() dto: CheckSocialUserRequestDto,
    ): Promise<ApiResponseDto<SocialCheckUserResponseDto>> {
        const result = await this.checkSocialUserUseCase.execute(dto.provider, dto.providerId, dto.email);
        return ApiResponseDto.success(result, result.exists ? '가입된 사용자입니다.' : '미가입 사용자입니다.');
    }

    @Post('register/adopter')
    @HttpCode(HttpStatus.OK)
    @ApiRegisterAdopterEndpoint()
    async registerAdopter(@Body() dto: RegisterAdopterRequestDto): Promise<ApiResponseDto<RegisterAdopterResponseDto>> {
        const result = await this.registerAdopterUseCase.execute(dto);
        return ApiResponseDto.success(result, '입양자 회원가입이 완료되었습니다.');
    }

    @Post('register/breeder')
    @HttpCode(HttpStatus.OK)
    @ApiRegisterBreederEndpoint()
    async registerBreeder(@Body() dto: RegisterBreederRequestDto): Promise<ApiResponseDto<RegisterBreederResponseDto>> {
        const result = await this.registerBreederUseCase.execute(dto);
        return ApiResponseDto.success(result, '브리더 회원가입이 완료되었습니다.');
    }

    @Post('upload-breeder-profile')
    @UseGuards(OptionalJwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiUploadProfileEndpoint()
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfile(
        @UploadedFile() file: Express.Multer.File,
        @Query('tempId') tempId?: string,
        @CurrentUser() user?: any,
    ): Promise<ApiResponseDto<UploadResponseDto>> {
        const result = await this.uploadAuthProfileImageUseCase.execute(file, user, tempId);
        const response = new UploadResponseDto(result.cdnUrl, result.fileName, result.size);

        const message = user
            ? '프로필 이미지가 업로드되고 저장되었습니다.'
            : tempId
              ? '프로필 이미지가 업로드되고 임시 저장되었습니다. 회원가입 시 자동으로 적용됩니다.'
              : '프로필 이미지가 업로드되었습니다. 회원가입 시 응답의 filename 필드를 profileImage에 사용하세요.';

        return ApiResponseDto.success(response, message);
    }

    @Get('login-banners')
    @HttpCode(HttpStatus.OK)
    @ApiGetLoginBannersEndpoint()
    async getLoginBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.getActiveProfileBannersUseCase.execute('login');
        return ApiResponseDto.success(banners, '로그인 페이지 배너가 조회되었습니다.');
    }

    @Get('register-banners')
    @HttpCode(HttpStatus.OK)
    @ApiGetRegisterBannersEndpoint()
    async getRegisterBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.getActiveProfileBannersUseCase.execute('signup');
        return ApiResponseDto.success(banners, '회원가입 페이지 배너가 조회되었습니다.');
    }

    @Post('upload-breeder-documents')
    @HttpCode(HttpStatus.OK)
    @ApiUploadBreederDocumentsEndpoint()
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            limits: {
                fileSize: 100 * 1024 * 1024, // 100MB
                files: 10,
            },
        }),
    )
    async uploadBreederDocuments(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() dto: UploadBreederDocumentsRequestDto,
        @Query('tempId') tempId?: string,
    ): Promise<ApiResponseDto<VerificationDocumentsResponseDto>> {
        const result = await this.uploadAuthBreederDocumentsUseCase.execute(files, dto.types, dto.level, tempId);

        const message = tempId
            ? `${dto.level} 레벨 브리더 인증 서류 ${result.count}개가 업로드되고 임시 저장되었습니다. 회원가입 시 자동으로 적용됩니다.`
            : `${dto.level} 레벨 브리더 인증 서류 ${result.count}개가 업로드되었습니다.`;

        return ApiResponseDto.success(result.response, message);
    }

    private redirectToSocialLogin(provider: 'google' | 'naver' | 'kakao', req, res: Response) {
        const redirectUrl = this.getSocialLoginRedirectUrlUseCase.execute(
            provider,
            req.headers.referer,
            req.headers.origin,
            req.query.returnUrl as string | undefined,
        );

        return res.redirect(redirectUrl);
    }

    private async handleSocialCallback(req, res: Response) {
        const originUrl = req.user?.originUrl || '';
        const { redirectUrl, cookies } = await this.processSocialLoginCallbackUseCase.execute(
            req.user,
            originUrl,
            originUrl,
        );

        this.applySocialLoginCookies(res, cookies);

        return res.redirect(redirectUrl);
    }

    private applySocialLoginCookies(
        res: Response,
        cookies?: {
            name: string;
            value: string;
            options: Record<string, any>;
        }[],
    ) {
        if (!cookies) {
            return;
        }

        cookies.forEach((cookie) => {
            res.cookie(cookie.name, cookie.value, cookie.options);
        });
    }
}
