import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ADOPTER_ACCOUNT_COMMAND_PORT, type AdopterAccountCommandPort } from '../ports/adopter-account-command.port';
import type { AdopterAccountDeleteCommand } from '../types/adopter-account-command.type';
import type { AdopterAccountDeleteResult } from '../types/adopter-result.type';
import { ADOPTER_RESPONSE_PAYLOAD_MESSAGES } from '../../constants/adopter-response-messages';

@Injectable()
export class DeleteAdopterAccountUseCase {
    constructor(
        @Inject(ADOPTER_ACCOUNT_COMMAND_PORT)
        private readonly adopterAccountCommandPort: AdopterAccountCommandPort,
    ) {}

    async execute(userId: string, deleteData: AdopterAccountDeleteCommand): Promise<AdopterAccountDeleteResult> {
        const adopter = await this.adopterAccountCommandPort.findAdopterById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        if (adopter.accountStatus === 'deleted') {
            throw new BadRequestException('이미 탈퇴한 계정입니다.');
        }

        if (deleteData.reason === 'other' && !deleteData.otherReason) {
            throw new BadRequestException('기타 사유를 입력해주세요.');
        }

        try {
            const deletedAt = new Date();
            const command = {
                userId,
                deletedAt,
                reason: deleteData.reason,
                otherReason: deleteData.otherReason,
            };

            await this.adopterAccountCommandPort.softDeleteAdopter(command);
            await this.adopterAccountCommandPort.notifyAdopterWithdrawal(command, adopter);

            return {
                adopterId: userId,
                deletedAt: deletedAt.toISOString(),
                message: ADOPTER_RESPONSE_PAYLOAD_MESSAGES.accountDeleted,
            };
        } catch (error) {
            throw new BadRequestException('회원 탈퇴 처리 중 오류가 발생했습니다.');
        }
    }
}
