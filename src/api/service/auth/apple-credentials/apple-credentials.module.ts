import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from '../../../../common/logger/logger.module';
import { AppleCredential, AppleCredentialSchema } from '../../../../schema/apple-credential.schema';
import { AuthAppleIdTokenService } from '../domain/services/auth-apple-id-token.service';
import { APPLE_CREDENTIAL_PORT } from './application/apple-credential.port';
import { AppleCredentialService } from './application/apple-credential.service';
import { AppleTokenCipherService } from './domain/apple-token-cipher.service';
import { AppleTokenClientService } from './infrastructure/apple-token-client.service';
import { AppleCredentialRepository } from './repository/apple-credential.repository';

@Module({
    imports: [
        ConfigModule,
        LoggerModule,
        MongooseModule.forFeature([{ name: AppleCredential.name, schema: AppleCredentialSchema }]),
    ],
    providers: [
        AuthAppleIdTokenService,
        AppleTokenCipherService,
        AppleTokenClientService,
        AppleCredentialService,
        AppleCredentialRepository,
        { provide: APPLE_CREDENTIAL_PORT, useExisting: AppleCredentialRepository },
    ],
    exports: [AppleCredentialService],
})
export class AppleCredentialsModule {}
