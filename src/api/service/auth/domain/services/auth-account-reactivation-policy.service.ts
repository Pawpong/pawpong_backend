import { Injectable } from '@nestjs/common';

import { UserStatus } from '../../../../../common/enum/user.enum';
import { DomainAuthenticationError, DomainNotFoundError } from '../../../../../common/error/domain.error';
import type { AuthReactivationAccount } from '../../application/ports/auth-account-reactivation.port';

// accountStatus 는 영속 계층에서 문자열로 올라오므로 enum 값을 문자열로 고정해 비교한다.
const DELETED_STATUS: string = UserStatus.DELETED;
const SUSPENDED_STATUS: string = UserStatus.SUSPENDED;

@Injectable()
export class AuthAccountReactivationPolicyService {
    assertAccount(account: AuthReactivationAccount | null): asserts account is AuthReactivationAccount {
        if (!account) {
            throw new DomainNotFoundError('복구할 계정을 찾을 수 없습니다.');
        }
    }

    /**
     * 복구 대상이 실제로 탈퇴 상태인지 확인한다.
     * 정지 계정은 사용자가 스스로 풀 수 없고, 활성 계정은 복구할 것이 없다.
     */
    assertReactivatable(accountStatus: string): void {
        if (accountStatus === SUSPENDED_STATUS) {
            throw new DomainAuthenticationError('정지된 계정입니다. 자세한 내용은 이메일을 확인해주세요.');
        }

        if (accountStatus !== DELETED_STATUS) {
            throw new DomainAuthenticationError('탈퇴 상태가 아닌 계정입니다.');
        }
    }

    throwExpiredReactivationToken(): never {
        throw new DomainAuthenticationError('복구 요청이 만료되었습니다. 다시 로그인해주세요.');
    }

    throwMalformedReactivationToken(): never {
        throw new DomainAuthenticationError('유효하지 않은 복구 토큰입니다.');
    }
}
