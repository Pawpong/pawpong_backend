import { Inject, Injectable } from '@nestjs/common';

import { PhoneWhitelistListResponseDto } from '../../dto/response/phone-whitelist-response.dto';
import { USER_ADMIN_READER, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { UserAdminPresentationService } from '../../domain/services/user-admin-presentation.service';

@Injectable()
export class GetPhoneWhitelistUseCase {
    constructor(
        @Inject(USER_ADMIN_READER)
        private readonly userAdminReader: UserAdminReaderPort,
        private readonly userAdminPresentationService: UserAdminPresentationService,
    ) {}

    async execute(): Promise<PhoneWhitelistListResponseDto> {
        return this.userAdminPresentationService.toPhoneWhitelistListResponse(await this.userAdminReader.listPhoneWhitelist());
    }
}
