import { DomainValidationError } from '../../../../../common/error/domain.error';
import { AuthProfileImageFilePolicyService } from '../../../domain/services/auth-profile-image-file-policy.service';

describe('AuthProfileImageFilePolicyService', () => {
    const service = new AuthProfileImageFilePolicyService();

    it('100MB 이하면 통과', () => {
        expect(() => service.validate({ size: 50 * 1024 * 1024 } as any)).not.toThrow();
    });

    it('100MB 초과면 예외', () => {
        expect(() => service.validate({ size: 101 * 1024 * 1024 } as any)).toThrow(DomainValidationError);
    });
});
