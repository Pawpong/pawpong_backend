import { DomainValidationError } from '../../../../../common/error/domain.error';
import { VerificationStatus } from '../../../../../common/enum/user.enum';
import { BreederManagementVerificationDocumentPolicyService } from '../../../domain/services/breeder-management-verification-document-policy.service';

describe('BreederManagementVerificationDocumentPolicyService', () => {
    const service = new BreederManagementVerificationDocumentPolicyService();

    describe('validateUploadRequest', () => {
        it('files 빈 배열은 예외', () => {
            expect(() => service.validateUploadRequest([], [])).toThrow(DomainValidationError);
        });
        it('files 수와 types 수 불일치는 예외', () => {
            expect(() => service.validateUploadRequest([{ originalname: 'a' } as any], [])).toThrow(
                DomainValidationError,
            );
        });
        it('개수가 일치하면 통과', () => {
            expect(() => service.validateUploadRequest([{ originalname: 'a' } as any], ['idCard'])).not.toThrow();
        });
    });

    describe('buildSubmissionPlan - new 레벨', () => {
        it('필수 서류(idCard, businessLicense)가 있으면 통과', () => {
            const plan = service.buildSubmissionPlan({
                level: 'new',
                submittedDocuments: [
                    { type: 'idCard', fileName: 'verification/id.pdf', originalFileName: 'id.pdf' },
                    { type: 'businessLicense', fileName: 'verification/bl.pdf' },
                ],
                draftDocuments: [],
                currentVerification: undefined,
            });
            expect(plan.isResubmission).toBe(false);
            expect(plan.finalDocuments).toHaveLength(2);
        });

        it('필수 서류 누락 시 예외', () => {
            expect(() =>
                service.buildSubmissionPlan({
                    level: 'new',
                    submittedDocuments: [{ type: 'idCard', fileName: 'verification/id.pdf' }],
                    draftDocuments: [],
                }),
            ).toThrow(DomainValidationError);
        });
    });

    describe('buildSubmissionPlan - elite 레벨', () => {
        it('브리더 인증 서류가 없으면 예외', () => {
            expect(() =>
                service.buildSubmissionPlan({
                    level: 'elite',
                    submittedDocuments: [
                        { type: 'idCard', fileName: 'verification/id.pdf' },
                        { type: 'businessLicense', fileName: 'verification/bl.pdf' },
                        { type: 'contractSample', fileName: 'verification/cs.pdf' },
                    ],
                    draftDocuments: [],
                }),
            ).toThrow('브리더 인증 서류');
        });

        it('breederDogCertificate가 있으면 통과', () => {
            const plan = service.buildSubmissionPlan({
                level: 'elite',
                submittedDocuments: [
                    { type: 'idCard', fileName: 'verification/id.pdf' },
                    { type: 'businessLicense', fileName: 'verification/bl.pdf' },
                    { type: 'contractSample', fileName: 'verification/cs.pdf' },
                    { type: 'breederDogCertificate', fileName: 'verification/cert.pdf' },
                ],
                draftDocuments: [],
            });
            expect(plan.finalDocuments).toHaveLength(4);
        });
    });

    describe('isResubmission 판별', () => {
        it('REJECTED 상태는 재제출로 간주', () => {
            const plan = service.buildSubmissionPlan({
                level: 'new',
                submittedDocuments: [
                    { type: 'idCard', fileName: 'verification/id.pdf' },
                    { type: 'businessLicense', fileName: 'verification/bl.pdf' },
                ],
                draftDocuments: [],
                currentVerification: { status: VerificationStatus.REJECTED },
            });
            expect(plan.isResubmission).toBe(true);
        });
    });

    describe('fileName이 verification/ prefix가 아니면 신규 문서로 저장하지 않음', () => {
        it('재제출 시 기존 문서를 유지', () => {
            const existing = [
                { type: 'idCard', fileName: 'verification/old-id.pdf', uploadedAt: new Date() },
                { type: 'businessLicense', fileName: 'verification/bl.pdf', uploadedAt: new Date() },
            ];
            const plan = service.buildSubmissionPlan({
                level: 'new',
                submittedDocuments: [
                    { type: 'idCard', fileName: 'keep-existing' }, // invalid path → 기존 유지
                    { type: 'businessLicense', fileName: 'verification/bl-new.pdf' },
                ],
                draftDocuments: [],
                currentVerification: { status: VerificationStatus.REJECTED, documents: existing as any },
            });
            // idCard는 기존 유지, businessLicense는 신규
            expect(plan.finalDocuments.map((d) => d.fileName)).toContain('verification/old-id.pdf');
            expect(plan.finalDocuments.map((d) => d.fileName)).toContain('verification/bl-new.pdf');
        });
    });
});
