import { Inject, Injectable } from '@nestjs/common';

import { AddPhoneWhitelistRequestDto } from '../../dto/request/phone-whitelist-request.dto';
import { PhoneWhitelistResponseDto } from '../../dto/response/phone-whitelist-response.dto';
import { USER_ADMIN_READER, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { USER_ADMIN_WRITER, type UserAdminWriterPort } from '../ports/user-admin-writer.port';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';
import { UserAdminPresentationService } from '../../domain/services/user-admin-presentation.service';

@Injectable()
export class AddPhoneWhitelistUseCase {
    constructor(
        @Inject(USER_ADMIN_READER)
        private readonly userAdminReader: UserAdminReaderPort,
        @Inject(USER_ADMIN_WRITER)
        private readonly userAdminWriter: UserAdminWriterPort,
        private readonly userAdminCommandPolicyService: UserAdminCommandPolicyService,
        private readonly userAdminPresentationService: UserAdminPresentationService,
    ) {}

    async execute(adminId: string, dto: AddPhoneWhitelistRequestDto): Promise<PhoneWhitelistResponseDto> {
        this.userAdminCommandPolicyService.assertPhoneWhitelistDoesNotExist(
            await this.userAdminReader.findPhoneWhitelistByPhoneNumber(dto.phoneNumber),
        );

        const item = await this.userAdminWriter.createPhoneWhitelist({
            phoneNumber: dto.phoneNumber,
            description: dto.description,
            createdBy: adminId,
        });

        return this.userAdminPresentationService.toPhoneWhitelistResponse(item);
    }
}
