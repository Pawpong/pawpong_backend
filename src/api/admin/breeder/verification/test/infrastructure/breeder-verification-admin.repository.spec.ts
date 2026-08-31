import { BreederLevel, VerificationStatus } from '../../../../../../common/enum/user.enum';
import { BreederVerificationAdminRepository } from '../../repository/breeder-verification-admin.repository';

describe('BreederVerificationAdminRepository', () => {
    it('Elite 통계는 구독 플랜이 아니라 승인된 등급을 집계한다', async () => {
        const countDocuments = jest.fn().mockResolvedValue(24);
        const repository = new BreederVerificationAdminRepository({} as never, { countDocuments } as never);

        await expect(repository.countApprovedEliteBreeders()).resolves.toBe(24);
        expect(countDocuments).toHaveBeenCalledWith({
            'verification.status': VerificationStatus.APPROVED,
            'verification.level': BreederLevel.ELITE,
        });
    });
});
