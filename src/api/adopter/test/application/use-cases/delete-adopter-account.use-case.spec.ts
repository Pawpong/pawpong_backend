import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { DeleteAdopterAccountUseCase } from '../../../application/use-cases/delete-adopter-account.use-case';
import { ADOPTER_RESPONSE_PAYLOAD_MESSAGES } from '../../../constants/adopter-response-messages';

describe('입양자 계정 탈퇴 유스케이스', () => {
    const adopterAccountCommandPort = {
        findAdopterById: jest.fn(),
        softDeleteAdopter: jest.fn(),
        notifyAdopterWithdrawal: jest.fn(),
    };

    const useCase = new DeleteAdopterAccountUseCase(adopterAccountCommandPort as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 회원 탈퇴를 처리한다', async () => {
        adopterAccountCommandPort.findAdopterById.mockResolvedValue({
            accountStatus: 'active',
        });
        adopterAccountCommandPort.softDeleteAdopter.mockResolvedValue(undefined);
        adopterAccountCommandPort.notifyAdopterWithdrawal.mockResolvedValue(undefined);

        const result = await useCase.execute('user-1', { reason: 'already_adopted', otherReason: undefined });

        expect(result.adopterId).toBe('user-1');
        expect(result.message).toBe(ADOPTER_RESPONSE_PAYLOAD_MESSAGES.accountDeleted);
        expect(adopterAccountCommandPort.softDeleteAdopter).toHaveBeenCalled();
    });

    it('입양자 정보가 없으면 DomainNotFoundError를 던진다', async () => {
        adopterAccountCommandPort.findAdopterById.mockResolvedValue(null);

        await expect(useCase.execute('user-1', { reason: 'already_adopted' })).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('user-1', { reason: 'already_adopted' })).rejects.toThrow(
            '입양자 정보를 찾을 수 없습니다.',
        );
    });

    it('이미 탈퇴한 계정이면 DomainValidationError를 던진다', async () => {
        adopterAccountCommandPort.findAdopterById.mockResolvedValue({
            accountStatus: 'deleted',
        });

        await expect(useCase.execute('user-1', { reason: 'already_adopted' })).rejects.toThrow(DomainValidationError);
        await expect(useCase.execute('user-1', { reason: 'already_adopted' })).rejects.toThrow(
            '이미 탈퇴한 계정입니다.',
        );
    });

    it("reason이 'other'이고 otherReason이 없으면 DomainValidationError를 던진다", async () => {
        adopterAccountCommandPort.findAdopterById.mockResolvedValue({
            accountStatus: 'active',
        });

        await expect(useCase.execute('user-1', { reason: 'other', otherReason: undefined })).rejects.toThrow(
            DomainValidationError,
        );
        await expect(useCase.execute('user-1', { reason: 'other' })).rejects.toThrow('기타 사유를 입력해주세요.');
    });

    it("reason이 'other'이고 otherReason이 있으면 정상 처리한다", async () => {
        adopterAccountCommandPort.findAdopterById.mockResolvedValue({
            accountStatus: 'active',
        });
        adopterAccountCommandPort.softDeleteAdopter.mockResolvedValue(undefined);
        adopterAccountCommandPort.notifyAdopterWithdrawal.mockResolvedValue(undefined);

        const result = await useCase.execute('user-1', { reason: 'other', otherReason: '직접 입력한 이유' });

        expect(result.adopterId).toBe('user-1');
        expect(adopterAccountCommandPort.softDeleteAdopter).toHaveBeenCalledWith(
            expect.objectContaining({ reason: 'other', otherReason: '직접 입력한 이유' }),
        );
    });

    it('탈퇴 처리 중 오류 발생 시 원본 오류를 전파한다', async () => {
        adopterAccountCommandPort.findAdopterById.mockResolvedValue({
            accountStatus: 'active',
        });
        adopterAccountCommandPort.softDeleteAdopter.mockRejectedValue(new Error('DB 오류'));

        await expect(useCase.execute('user-1', { reason: 'already_adopted' })).rejects.toThrow('DB 오류');
    });
});
