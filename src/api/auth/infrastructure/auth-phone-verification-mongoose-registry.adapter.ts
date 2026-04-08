import { Injectable } from '@nestjs/common';
import { AuthPhoneVerificationRegistryPort } from '../application/ports/auth-phone-verification-registry.port';
import { AuthPhoneVerificationRepository } from '../repository/auth-phone-verification.repository';

@Injectable()
export class AuthPhoneVerificationMongooseRegistryAdapter implements AuthPhoneVerificationRegistryPort {
    constructor(private readonly authPhoneVerificationRepository: AuthPhoneVerificationRepository) {}

    async isPhoneWhitelisted(phoneNumber: string): Promise<boolean> {
        const whitelist = await this.authPhoneVerificationRepository.isPhoneWhitelisted(phoneNumber);
        return !!whitelist;
    }

    async hasRegisteredPhone(phoneNumber: string): Promise<boolean> {
        return this.authPhoneVerificationRepository.hasRegisteredPhone(phoneNumber);
    }
}
