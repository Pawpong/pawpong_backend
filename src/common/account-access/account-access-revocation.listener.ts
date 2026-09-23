import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ACCOUNT_ACCESS_REVOKED, type AccountAccessRevokedEvent } from './account-access-revoked.event';
import { AccountAccessRepository } from './repository/account-access.repository';

@Injectable()
export class AccountAccessRevocationListener {
    constructor(private readonly repository: AccountAccessRepository) {}

    /** 정리 실패를 숨기지 않아 탈퇴·정지 요청이 성공으로 먼저 끝나지 않게 한다. */
    @OnEvent(ACCOUNT_ACCESS_REVOKED, { suppressErrors: false })
    async revoke(event: AccountAccessRevokedEvent): Promise<void> {
        await this.repository.revoke(event);
    }
}
