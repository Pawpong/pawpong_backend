import { Inject, Injectable } from '@nestjs/common';

import { USER_ADMIN_READER_PORT, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { USER_ADMIN_WRITER_PORT, type UserAdminWriterPort } from '../ports/user-admin-writer.port';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';

@Injectable()
export class DeletePhoneWhitelistUseCase {
    constructor(
        @Inject(USER_ADMIN_READER_PORT)
        private readonly userAdminReader: UserAdminReaderPort,
        @Inject(USER_ADMIN_WRITER_PORT)
        private readonly userAdminWriter: UserAdminWriterPort,
        private readonly userAdminCommandPolicyService: UserAdminCommandPolicyService,
    ) {}

    async execute(id: string): Promise<{ message: string }> {
        this.userAdminCommandPolicyService.assertPhoneWhitelistExists(
            await this.userAdminReader.findPhoneWhitelistById(id),
        );
        await this.userAdminWriter.deletePhoneWhitelist(id);
        return { message: '화이트리스트가 삭제되었습니다.' };
    }
}
