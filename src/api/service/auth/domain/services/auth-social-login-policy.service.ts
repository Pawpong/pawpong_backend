import { Injectable } from '@nestjs/common';

import { UserStatus } from '../../../../../common/enum/user.enum';
import { DomainAuthenticationError } from '../../../../../common/error/domain.error';

/**
 * 소셜 로그인 시 계정 상태로 결정되는 다음 단계
 * - allow: 그대로 로그인시킨다
 * - reactivation_required: 탈퇴 계정이므로 복구 동의를 받아야 한다
 */
export type AuthSocialLoginDecision = 'allow' | 'reactivation_required';

@Injectable()
export class AuthSocialLoginPolicyService {
    /**
     * 탈퇴 계정은 차단하지 않고 복구 확인 단계로 보낸다.
     * 정지 계정은 사용자가 스스로 해제할 수 없으므로 그대로 차단한다.
     */
    resolveLoginDecision(accountStatus?: string): AuthSocialLoginDecision {
        if (accountStatus === UserStatus.SUSPENDED) {
            throw new DomainAuthenticationError('정지된 계정입니다. 자세한 내용은 이메일을 확인해주세요.');
        }

        if (accountStatus === UserStatus.DELETED) {
            return 'reactivation_required';
        }

        return 'allow';
    }
}
