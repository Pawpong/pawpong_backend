import { Inject, Injectable } from '@nestjs/common';

import { USER_ADMIN_READER_PORT, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';
import { UserAdminAdminProfileMapperService } from '../../domain/services/user-admin-admin-profile-mapper.service';
import type { UserAdminAdminProfileResult } from '../types/user-admin-result.type';

@Injectable()
export class GetAdminProfileUseCase {
    constructor(
        @Inject(USER_ADMIN_READER_PORT)
        private readonly userAdminReader: UserAdminReaderPort,
        private readonly userAdminCommandPolicyService: UserAdminCommandPolicyService,
        private readonly userAdminAdminProfileMapperService: UserAdminAdminProfileMapperService,
    ) {}

    async execute(adminId: string): Promise<UserAdminAdminProfileResult> {
        const admin = this.userAdminCommandPolicyService.assertAdminExists(await this.userAdminReader.findAdminById(adminId));
        return this.userAdminAdminProfileMapperService.toResult(admin);
    }
}
