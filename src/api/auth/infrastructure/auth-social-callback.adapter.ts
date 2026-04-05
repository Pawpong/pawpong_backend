import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CustomLoggerService } from '../../../common/logger/custom-logger.service';

import { AuthAdopterRepository } from '../repository/auth-adopter.repository';
import { AuthBreederRepository } from '../repository/auth-breeder.repository';
import { AuthTokenService } from '../services/auth-token.service';
import {
    AuthSocialCallbackPort,
    type AuthSocialAuthenticatedUser,
    type AuthSocialCallbackLoginResult,
    type AuthSocialCallbackProfile,
} from '../application/ports/auth-social-callback.port';

@Injectable()
export class AuthSocialCallbackAdapter implements AuthSocialCallbackPort {
    constructor(
        private readonly authAdopterRepository: AuthAdopterRepository,
        private readonly authBreederRepository: AuthBreederRepository,
        private readonly configService: ConfigService,
        private readonly logger: CustomLoggerService,
        private readonly authTokenService: AuthTokenService,
    ) {}

    resolveFrontendUrl(referer?: string, origin?: string): string {
        const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
        const isLocalEnv = nodeEnv === 'development';
        const refererStr = referer || origin || '';

        if (refererStr.includes('dev.pawpong.kr')) {
            return 'https://dev.pawpong.kr';
        }

        if (refererStr.includes('pawpong.kr') && !refererStr.includes('local.pawpong.kr')) {
            return 'https://pawpong.kr';
        }

        if (refererStr.includes('localhost') || refererStr.includes('127.0.0.1')) {
            try {
                const url = new URL(refererStr);
                return `${url.protocol}//${url.host}`;
            } catch {
                return 'http://localhost:3000';
            }
        }

        if (refererStr.includes('local.pawpong.kr')) {
            return 'http://local.pawpong.kr:3000';
        }

        if (isLocalEnv) {
            return this.configService.get<string>('FRONTEND_URL_LOCAL') || 'http://localhost:3000';
        }

        return this.configService.get<string>('FRONTEND_URL_PROD') || 'https://pawpong.kr';
    }

    resolveCookieOptions() {
        const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

        return {
            isProduction,
            cookieOptions: {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? ('none' as const) : ('lax' as const),
                domain: isProduction ? '.pawpong.kr' : undefined,
                path: '/',
            },
        };
    }

    async handleSocialLogin(profile: AuthSocialCallbackProfile): Promise<AuthSocialCallbackLoginResult> {
        this.logger.log(
            `[handleSocialLogin] 소셜 로그인 요청 - provider: ${profile.provider}, providerId: ${profile.providerId}, email: ${profile.email}`,
        );

        const adopter = await this.authAdopterRepository.findBySocialAuth(profile.provider, profile.providerId);
        this.logger.log(
            `[handleSocialLogin] Adopter 조회 결과: ${adopter ? '찾음 - ' + adopter.emailAddress : '없음'}`,
        );

        if (!adopter) {
            const adopterByEmail = await this.authAdopterRepository.findByEmail(profile.email);
            if (adopterByEmail) {
                this.logger.log(
                    `[handleSocialLogin] ⚠️ 이메일로 Adopter 찾음: ${adopterByEmail.emailAddress}, socialAuthInfo: ${JSON.stringify(adopterByEmail.socialAuthInfo || 'null')}`,
                );
            }
        }

        if (adopter) {
            if (adopter.accountStatus === 'deleted') {
                this.logger.log(`[handleSocialLogin] 탈퇴한 Adopter 로그인 시도: ${adopter.emailAddress}`);
                throw new UnauthorizedException('탈퇴한 계정으로는 로그인할 수 없습니다.');
            }

            if (adopter.accountStatus === 'suspended') {
                this.logger.log(`[handleSocialLogin] 정지된 Adopter 로그인 시도: ${adopter.emailAddress}`);
                throw new UnauthorizedException('정지된 계정입니다. 자세한 내용은 이메일을 확인해주세요.');
            }

            this.logger.log(`[handleSocialLogin] 기존 Adopter 로그인 성공: ${adopter.emailAddress}`);
            return {
                needsAdditionalInfo: false,
                user: {
                    userId: adopter._id.toString(),
                    email: adopter.emailAddress,
                    name: adopter.nickname,
                    role: 'adopter',
                    profileImage: adopter.profileImageFileName,
                },
            };
        }

        const breeder = await this.authBreederRepository.findBySocialAuth(profile.provider, profile.providerId);
        this.logger.log(
            `[handleSocialLogin] Breeder 조회 결과: ${breeder ? '찾음 - ' + breeder.emailAddress : '없음'}`,
        );

        if (breeder) {
            if (breeder.accountStatus === 'deleted') {
                this.logger.log(`[handleSocialLogin] 탈퇴한 Breeder 로그인 시도: ${breeder.emailAddress}`);
                throw new UnauthorizedException('탈퇴한 계정으로는 로그인할 수 없습니다.');
            }

            if (breeder.accountStatus === 'suspended') {
                this.logger.log(`[handleSocialLogin] 정지된 Breeder 로그인 시도: ${breeder.emailAddress}`);
                throw new UnauthorizedException('정지된 계정입니다. 자세한 내용은 이메일을 확인해주세요.');
            }

            this.logger.log(`[handleSocialLogin] 기존 Breeder 로그인 성공: ${breeder.emailAddress}`);
            return {
                needsAdditionalInfo: false,
                user: {
                    userId: breeder._id.toString(),
                    email: breeder.emailAddress,
                    name: breeder.name,
                    role: 'breeder',
                    profileImage: breeder.profileImageFileName,
                },
            };
        }

        const tempUserId = `temp_${profile.provider}_${profile.providerId}_${Date.now()}`;
        this.logger.log(
            `[handleSocialLogin] 신규 사용자 tempId 생성: ${tempUserId} (프로필 이미지는 사용자가 직접 업로드)`,
        );

        return {
            needsAdditionalInfo: true,
            tempUserId,
        };
    }

    async generateSocialLoginTokens(user: AuthSocialAuthenticatedUser) {
        const tokens = this.authTokenService.generateTokens(user.userId, user.email, user.role);
        const hashedRefreshToken = await this.authTokenService.hashRefreshToken(tokens.refreshToken);

        if (user.role === 'adopter') {
            await this.authAdopterRepository.update(user.userId, {
                refreshToken: hashedRefreshToken,
                lastActivityAt: new Date(),
            });
        } else if (user.role === 'breeder') {
            await this.authBreederRepository.update(user.userId, {
                refreshToken: hashedRefreshToken,
                lastLoginAt: new Date(),
            });
        }

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            accessTokenExpiresIn: tokens.accessTokenExpiresIn,
            refreshTokenExpiresIn: tokens.refreshTokenExpiresIn,
            userInfo: {
                userId: user.userId,
                email: user.email,
                name: user.name,
                profileImage: user.profileImage,
            },
        };
    }
}
