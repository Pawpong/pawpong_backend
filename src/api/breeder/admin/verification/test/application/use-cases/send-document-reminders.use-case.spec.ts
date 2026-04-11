import { ForbiddenException } from '@nestjs/common';

import { SendDocumentRemindersUseCase } from '../../../application/use-cases/send-document-reminders.use-case';
import { BreederVerificationAdminActivityLogFactoryService } from '../../../domain/services/breeder-verification-admin-activity-log-factory.service';
import { BreederVerificationAdminCommandResponseService } from '../../../domain/services/breeder-verification-admin-command-response.service';
import { BreederVerificationAdminPolicyService } from '../../../domain/services/breeder-verification-admin-policy.service';

describe('문서 리마인드 발송 유스케이스', () => {
    const reader = {
        findAdminById: jest.fn(),
        findApprovedBreedersMissingDocuments: jest.fn(),
    };
    const writer = {
        appendAdminActivityLog: jest.fn(),
    };
    const notifier = {
        sendDocumentReminder: jest.fn(),
    };
    const useCase = new SendDocumentRemindersUseCase(
        reader as any,
        writer as any,
        notifier as any,
        new BreederVerificationAdminPolicyService(),
        new BreederVerificationAdminActivityLogFactoryService(),
        new BreederVerificationAdminCommandResponseService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('대상 브리더 전체에 문서 리마인드를 발송한다', async () => {
        reader.findAdminById.mockResolvedValue({
            id: 'admin-1',
            name: '관리자',
            permissions: { canManageBreeders: true },
        });
        reader.findApprovedBreedersMissingDocuments.mockResolvedValue([
            { id: 'breeder-1', nickname: '행복브리더', emailAddress: 'one@test.com' },
            { id: 'breeder-2', nickname: '튼튼브리더', emailAddress: undefined },
        ]);

        const result = await useCase.execute('admin-1');

        expect(notifier.sendDocumentReminder).toHaveBeenCalledTimes(2);
        expect(result).toEqual({
            sentCount: 2,
            breederIds: ['breeder-1', 'breeder-2'],
        });
    });

    it('권한이 없으면 예외를 던진다', async () => {
        reader.findAdminById.mockResolvedValue(null);

        await expect(useCase.execute('admin-1')).rejects.toThrow(
            new ForbiddenException('브리더 관리 권한이 없습니다.'),
        );
    });
});
