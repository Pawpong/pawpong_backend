import { VerificationStatus } from '../../../../../../common/enum/user.enum';

import { RequestBreederManagementLevelChangeUseCase } from '../../../application/use-cases/request-breeder-management-level-change.use-case';
import { BreederManagementVerificationCommandResultMapperService } from '../../../domain/services/breeder-management-verification-command-result-mapper.service';
import { BreederManagementVerificationDocumentPolicyService } from '../../../domain/services/breeder-management-verification-document-policy.service';
import { BreederManagementVerificationNotificationPayloadFactoryService } from '../../../domain/services/breeder-management-verification-notification-payload-factory.service';

describe('브리더 등급 변경 신청 유스케이스', () => {
    const profilePort = { findById: jest.fn() };
    const settingsPort = { requestLevelChange: jest.fn() };
    const fileUrlPort = { generateOne: (fileName: string) => `https://cdn.test/${fileName}` };
    const draftStore = { get: jest.fn(), delete: jest.fn() };
    const notifier = { notifySubmission: jest.fn() };

    const useCase = new RequestBreederManagementLevelChangeUseCase(
        profilePort as any,
        settingsPort as any,
        fileUrlPort as any,
        draftStore as any,
        notifier as any,
        new BreederManagementVerificationCommandResultMapperService(),
        new BreederManagementVerificationDocumentPolicyService(),
        new BreederManagementVerificationNotificationPayloadFactoryService(),
    );

    const approvedNewBreeder = {
        _id: 'breeder-1',
        name: '포퐁 브리더',
        emailAddress: 'breeder@test.com',
        verification: {
            status: VerificationStatus.APPROVED,
            level: 'new',
            documents: [
                { type: 'id_card', fileName: 'documents/verification/temp/new/id.pdf' },
                {
                    type: 'animal_production_license',
                    fileName: 'documents/verification/temp/new/license.pdf',
                },
            ],
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        profilePort.findById.mockResolvedValue(structuredClone(approvedNewBreeder));
        draftStore.get.mockResolvedValue([
            { type: 'adoptionContractSample', fileName: 'verification/breeder-1/contract.pdf' },
            { type: 'breederCertification', fileName: 'verification/breeder-1/certificate.pdf' },
        ]);
    });

    it('기존 승인 문서와 추가 서류를 병합해 Elite 심사를 요청한다', async () => {
        const result = await useCase.execute('breeder-1', {
            requestedLevel: 'elite',
            documents: [
                {
                    type: 'adoptionContractSample',
                    fileName: 'verification/breeder-1/contract.pdf',
                },
                {
                    type: 'breederCertification',
                    fileName: 'verification/breeder-1/certificate.pdf',
                },
            ],
        });

        expect(settingsPort.requestLevelChange).toHaveBeenCalledWith(
            'breeder-1',
            expect.objectContaining({
                previousLevel: 'new',
                requestedLevel: 'elite',
                documents: expect.arrayContaining([
                    expect.objectContaining({ type: 'id_card' }),
                    expect.objectContaining({ type: 'animal_production_license' }),
                    expect.objectContaining({ type: 'adoption_contract_sample' }),
                    expect.objectContaining({ type: 'breeder_certification' }),
                ]),
            }),
        );
        expect(notifier.notifySubmission).toHaveBeenCalledWith(
            expect.objectContaining({ submissionKind: 'level_change', level: 'elite' }),
        );
        expect(draftStore.delete).toHaveBeenCalledWith('breeder-1');
        expect(result.message).toContain('Elite 등급 변경 신청이 접수되었습니다');
    });

    it.each([
        ['승인 전', { ...approvedNewBreeder, verification: { status: VerificationStatus.REVIEWING, level: 'new' } }],
        [
            '이미 Elite',
            { ...approvedNewBreeder, verification: { status: VerificationStatus.APPROVED, level: 'elite' } },
        ],
        [
            '심사 중',
            {
                ...approvedNewBreeder,
                verification: {
                    ...approvedNewBreeder.verification,
                    isLevelChangeRequested: true,
                },
            },
        ],
    ])('%s 상태에서는 중복/잘못된 신청을 막는다', async (_label, breeder) => {
        profilePort.findById.mockResolvedValue(breeder);

        await expect(
            useCase.execute('breeder-1', {
                requestedLevel: 'elite',
                documents: [],
            }),
        ).rejects.toBeDefined();
        expect(settingsPort.requestLevelChange).not.toHaveBeenCalled();
    });
});
