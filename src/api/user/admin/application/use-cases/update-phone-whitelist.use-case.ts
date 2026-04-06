import { Inject, Injectable } from '@nestjs/common';

import { UpdatePhoneWhitelistRequestDto } from '../../dto/request/phone-whitelist-request.dto';
import { PhoneWhitelistResponseDto } from '../../dto/response/phone-whitelist-response.dto';
import { USER_ADMIN_READER, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { USER_ADMIN_WRITER, type UserAdminWriterPort } from '../ports/user-admin-writer.port';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';
import { UserAdminPresentationService } from '../../domain/services/user-admin-presentation.service';

@Injectable()
export class UpdatePhoneWhitelistUseCase {
    constructor(
        @Inject(USER_ADMIN_READER)
        private readonly userAdminReader: UserAdminReaderPort,
        @Inject(USER_ADMIN_WRITER)
        private readonly userAdminWriter: UserAdminWriterPort,
        private readonly userAdminCommandPolicyService: UserAdminCommandPolicyService,
        private readonly userAdminPresentationService: UserAdminPresentationService,
    ) {}

    async execute(id: string, dto: UpdatePhoneWhitelistRequestDto): Promise<PhoneWhitelistResponseDto> {
        this.userAdminCommandPolicyService.assertPhoneWhitelistExists(await this.userAdminReader.findPhoneWhitelistById(id));

        const item = this.userAdminCommandPolicyService.assertPhoneWhitelistExists(
            await this.userAdminWriter.updatePhoneWhitelist(id, {
                description: dto.description,
                isActive: dto.isActive,
            }),
        );

        return this.userAdminPresentationService.toPhoneWhitelistResponse(item);
    }
}
