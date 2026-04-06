import { Inject, Injectable } from '@nestjs/common';

import { USER_ADMIN_READER, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';
import { UserAdminPresentationService } from '../../domain/services/user-admin-presentation.service';

@Injectable()
export class GetAdminProfileUseCase {
    constructor(
        @Inject(USER_ADMIN_READER)
        private readonly userAdminReader: UserAdminReaderPort,
        private readonly userAdminCommandPolicyService: UserAdminCommandPolicyService,
        private readonly userAdminPresentationService: UserAdminPresentationService,
    ) {}

    async execute(adminId: string): Promise<any> {
        const admin = this.userAdminCommandPolicyService.assertAdminExists(await this.userAdminReader.findAdminById(adminId));
        return this.userAdminPresentationService.toAdminProfileResponse(admin);
    }
}
