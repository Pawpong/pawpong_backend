import { Inject, Injectable } from '@nestjs/common';

import { USER_ADMIN_READER_PORT, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { USER_ADMIN_WRITER_PORT, type UserAdminWriterPort } from '../ports/user-admin-writer.port';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';
import { UserAdminPhoneWhitelistResultMapperService } from '../../domain/services/user-admin-phone-whitelist-result-mapper.service';
import type { UserAdminPhoneWhitelistUpdateCommand } from '../types/user-admin-command.type';
import type { UserAdminPhoneWhitelistItemResult } from '../types/user-admin-result.type';

@Injectable()
export class UpdatePhoneWhitelistUseCase {
    constructor(
        @Inject(USER_ADMIN_READER_PORT)
        private readonly userAdminReader: UserAdminReaderPort,
        @Inject(USER_ADMIN_WRITER_PORT)
        private readonly userAdminWriter: UserAdminWriterPort,
        private readonly userAdminCommandPolicyService: UserAdminCommandPolicyService,
        private readonly userAdminPhoneWhitelistResultMapperService: UserAdminPhoneWhitelistResultMapperService,
    ) {}

    async execute(id: string, dto: UserAdminPhoneWhitelistUpdateCommand): Promise<UserAdminPhoneWhitelistItemResult> {
        this.userAdminCommandPolicyService.assertPhoneWhitelistExists(
            await this.userAdminReader.findPhoneWhitelistById(id),
        );

        const item = this.userAdminCommandPolicyService.assertPhoneWhitelistExists(
            await this.userAdminWriter.updatePhoneWhitelist(id, {
                description: dto.description,
                isActive: dto.isActive,
            }),
        );

        return this.userAdminPhoneWhitelistResultMapperService.toItemResult(item);
    }
}
