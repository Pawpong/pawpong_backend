import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { SubmitAuthBreederDocumentsUseCase } from '../../../application/use-cases/submit-auth-breeder-documents.use-case';
import { AuthBreederDocumentSubmissionService } from '../../../domain/services/auth-breeder-document-submission.service';

describe('브리더 인증 문서 제출 유스케이스', () => {
    const commandPort = {
        findBreederById: jest.fn(),
        updateVerificationDocuments: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new SubmitAuthBreederDocumentsUseCase(
        commandPort as any,
        new AuthBreederDocumentSubmissionService(),
        logger as any,
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('브리더 서류를 검토 중 상태로 저장한다', async () => {
        commandPort.findBreederById.mockResolvedValue({
            _id: { toString: () => 'breeder-1' },
        });

        const result = await useCase.execute('breeder-1', 'elite', {
            idCardUrl: 'id-card-url',
            animalProductionLicenseUrl: 'license-url',
            adoptionContractSampleUrl: 'contract-url',
            breederCertificationUrl: 'cert-url',
        });

        expect(commandPort.updateVerificationDocuments).toHaveBeenCalledWith(
            'breeder-1',
            expect.arrayContaining([
                expect.objectContaining({ type: 'id_card', url: 'id-card-url' }),
                expect.objectContaining({ type: 'animal_production_license', url: 'license-url' }),
                expect.objectContaining({ type: 'adoption_contract_sample', url: 'contract-url' }),
                expect.objectContaining({ type: 'breeder_certification', url: 'cert-url' }),
            ]),
            'elite',
            'reviewing',
            expect.any(Date),
        );
        expect(result).toMatchObject({
            breederId: 'breeder-1',
            verificationStatus: 'reviewing',
            uploadedDocuments: {
                idCard: 'id-card-url',
                animalProductionLicense: 'license-url',
                adoptionContractSample: 'contract-url',
                breederCertification: 'cert-url',
            },
        });
    });

    it('브리더가 없으면 예외를 던진다', async () => {
        commandPort.findBreederById.mockResolvedValue(null);

        await expect(
            useCase.execute('missing', 'new', {
                idCardUrl: 'id-card-url',
                animalProductionLicenseUrl: 'license-url',
            }),
        ).rejects.toThrow(new DomainNotFoundError('브리더를 찾을 수 없습니다.'));
    });
});
