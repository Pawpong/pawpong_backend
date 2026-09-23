import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_TOKEN_PORT, type AuthTokenPort } from '../../application/ports/auth-token.port';
import {
    REVIEW_ACCOUNT_PORT,
    REVIEW_LOGIN_LIMIT_PORT,
    REVIEW_PASSWORD_PORT,
    type ReviewAccountPort,
    type ReviewLoginLimitPort,
    type ReviewPasswordPort,
} from './review-login.port';

export const REVIEW_LOGIN_FAILED = '이메일 또는 비밀번호를 확인해 주세요.';

@Injectable()
export class LoginReviewAccountUseCase {
    constructor(
        @Inject(REVIEW_ACCOUNT_PORT) private readonly accounts: ReviewAccountPort,
        @Inject(REVIEW_PASSWORD_PORT) private readonly passwords: ReviewPasswordPort,
        @Inject(REVIEW_LOGIN_LIMIT_PORT) private readonly limits: ReviewLoginLimitPort,
        @Inject(AUTH_TOKEN_PORT) private readonly tokens: AuthTokenPort,
    ) {}

    /** 전용 자격 증명과 현재 서비스 계정 상태를 확인한 뒤 일반 서비스 세션을 발급한다. */
    async execute(command: { emailAddress: string; password: string; clientIp: string }) {
        const emailAddress = command.emailAddress.trim().toLowerCase();
        if (!(await this.limits.allow(command.clientIp, emailAddress))) {
            throw new HttpException('잠시 후 다시 시도해 주세요.', HttpStatus.TOO_MANY_REQUESTS);
        }

        const credential = await this.accounts.findCredential(emailAddress);
        // 없는 이메일에도 같은 비용의 bcrypt 비교를 수행한다. disabled 여부도 비교 이후 확인한다.
        const validPassword = await this.passwords.verify(command.password, credential?.passwordHash ?? null);
        if (
            !validPassword ||
            !credential?.enabled ||
            credential.emailAddress !== emailAddress ||
            !['adopter', 'breeder'].includes(credential.role)
        ) {
            throw new UnauthorizedException(REVIEW_LOGIN_FAILED);
        }
        const account = await this.accounts.findActiveAccount(credential);
        if (!account) throw new UnauthorizedException(REVIEW_LOGIN_FAILED);

        const tokens = this.tokens.generateTokens(account.id, account.emailAddress, account.role);
        const refreshTokenHash = await this.tokens.hashRefreshToken(tokens.refreshToken);
        // 발급 도중 탈퇴/정지/승인 취소가 발생하면 조건부 저장이 거절되어 토큰을 반환하지 않는다.
        if (!(await this.accounts.saveSession(credential, refreshTokenHash))) {
            throw new UnauthorizedException(REVIEW_LOGIN_FAILED);
        }
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.accessTokenExpiresIn,
            user: {
                userId: account.id,
                email: account.emailAddress,
                role: account.role,
                nickname: account.nickname,
            },
        };
    }
}
