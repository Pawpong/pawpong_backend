import { Inject, Injectable } from '@nestjs/common';

import { USER_ADMIN_READER, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { UserAdminPhoneWhitelistPresentationService } from '../../domain/services/user-admin-phone-whitelist-presentation.service';
import type { UserAdminPhoneWhitelistListResult } from '../types/user-admin-result.type';

@Injectable()
export class GetPhoneWhitelistUseCase {
    constructor(
        @Inject(USER_ADMIN_READER)
        private readonly userAdminReader: UserAdminReaderPort,
        private readonly userAdminPhoneWhitelistPresentationService: UserAdminPhoneWhitelistPresentationService,
    ) {}

    async execute(): Promise<UserAdminPhoneWhitelistListResult> {
        return this.userAdminPhoneWhitelistPresentationService.toPhoneWhitelistListResponse(
            await this.userAdminReader.listPhoneWhitelist(),
        );
    }
}
