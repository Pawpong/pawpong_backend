import { Injectable } from '@nestjs/common';

import { DomainAuthenticationError } from '../../../../common/error/domain.error';

@Injectable()
export class AuthSocialLoginPolicyService {
    assertLoginAllowed(accountStatus?: string): void {
        if (accountStatus === 'deleted') {
            throw new DomainAuthenticationError('탈퇴한 계정으로는 로그인할 수 없습니다.');
        }

        if (accountStatus === 'suspended') {
            throw new DomainAuthenticationError('정지된 계정입니다. 자세한 내용은 이메일을 확인해주세요.');
        }
    }
}
