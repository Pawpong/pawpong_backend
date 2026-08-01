import { Inject, Injectable } from '@nestjs/common';

import { USER_ADMIN_READER_PORT, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { UserAdminPhoneWhitelistResultMapperService } from '../../domain/services/user-admin-phone-whitelist-result-mapper.service';
import type { UserAdminPhoneWhitelistListResult } from '../types/user-admin-result.type';

@Injectable()
export class GetPhoneWhitelistUseCase {
    constructor(
        @Inject(USER_ADMIN_READER_PORT)
        private readonly userAdminReader: UserAdminReaderPort,
        private readonly userAdminPhoneWhitelistResultMapperService: UserAdminPhoneWhitelistResultMapperService,
    ) {}

    async execute(): Promise<UserAdminPhoneWhitelistListResult> {
        return this.userAdminPhoneWhitelistResultMapperService.toListResult(
            await this.userAdminReader.listPhoneWhitelist(),
        );
    }
}
