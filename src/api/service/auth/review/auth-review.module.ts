import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewCredential, ReviewCredentialSchema } from '../../../../schema/review-credential.schema';
import { AuthSharedModule } from '../shared/auth-shared.module';
import { LoginReviewAccountUseCase } from './application/login-review-account.use-case';
import { REVIEW_ACCOUNT_PORT, REVIEW_LOGIN_LIMIT_PORT, REVIEW_PASSWORD_PORT } from './application/review-login.port';
import { ReviewLoginLimitAdapter } from './infrastructure/review-login-limit.adapter';
import { ReviewPasswordAdapter } from './infrastructure/review-password.adapter';
import { ReviewLoginController } from './presentation/review-login.controller';
import { ReviewAccountRepository } from './repository/review-account.repository';

/** 심사 자격 증명만 별도 보관하며 로그인 이후에는 기존 서비스 인증을 그대로 사용한다. */
@Module({
    imports: [
        AuthSharedModule,
        ConfigModule,
        MongooseModule.forFeature([{ name: ReviewCredential.name, schema: ReviewCredentialSchema }]),
    ],
    controllers: [ReviewLoginController],
    providers: [
        LoginReviewAccountUseCase,
        ReviewAccountRepository,
        ReviewPasswordAdapter,
        ReviewLoginLimitAdapter,
        { provide: REVIEW_ACCOUNT_PORT, useExisting: ReviewAccountRepository },
        { provide: REVIEW_PASSWORD_PORT, useExisting: ReviewPasswordAdapter },
        { provide: REVIEW_LOGIN_LIMIT_PORT, useExisting: ReviewLoginLimitAdapter },
    ],
})
export class AuthReviewModule {}
