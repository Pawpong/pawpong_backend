import { Inject, Injectable } from '@nestjs/common';

import { USER_ADMIN_READER, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { USER_ADMIN_WRITER, type UserAdminWriterPort } from '../ports/user-admin-writer.port';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';
import { UserAdminPhoneWhitelistPresentationService } from '../../domain/services/user-admin-phone-whitelist-presentation.service';
import type { UserAdminPhoneWhitelistCreateCommand } from '../types/user-admin-command.type';
import type { UserAdminPhoneWhitelistItemResult } from '../types/user-admin-result.type';

@Injectable()
export class AddPhoneWhitelistUseCase {
    constructor(
        @Inject(USER_ADMIN_READER)
        private readonly userAdminReader: UserAdminReaderPort,
        @Inject(USER_ADMIN_WRITER)
        private readonly userAdminWriter: UserAdminWriterPort,
        private readonly userAdminCommandPolicyService: UserAdminCommandPolicyService,
        private readonly userAdminPhoneWhitelistPresentationService: UserAdminPhoneWhitelistPresentationService,
    ) {}

    async execute(adminId: string, dto: UserAdminPhoneWhitelistCreateCommand): Promise<UserAdminPhoneWhitelistItemResult> {
        this.userAdminCommandPolicyService.assertPhoneWhitelistDoesNotExist(
            await this.userAdminReader.findPhoneWhitelistByPhoneNumber(dto.phoneNumber),
        );

        const item = await this.userAdminWriter.createPhoneWhitelist({
            phoneNumber: dto.phoneNumber,
            description: dto.description,
            createdBy: adminId,
        });

        return this.userAdminPhoneWhitelistPresentationService.toPhoneWhitelistResponse(item);
    }
}
