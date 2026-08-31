import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { VerificationStatus } from '../../../../../../common/enum/user.enum';
import { BreederManagementVerificationDocumentPolicyService } from '../../../domain/services/breeder-management-verification-document-policy.service';

function makeFile(name: string, mimetype = 'application/pdf', size = 1024): Express.Multer.File {
    return {
        originalname: name,
        mimetype,
        size,
    } as Express.Multer.File;
}

function toDrafts(documents: Array<{ type: string; fileName: string; originalFileName?: string }>) {
    return documents.map((document) => ({ ...document }));
}

describe('BreederManagementVerificationDocumentPolicyService', () => {
    const service = new BreederManagementVerificationDocumentPolicyService();

    describe('validateUploadRequest', () => {
        it('files 빈 배열은 예외', () => {
            expect(() => service.validateUploadRequest([], [], 'new')).toThrow(DomainValidationError);
        });
        it('files 수와 types 수 불일치는 예외', () => {
            expect(() => service.validateUploadRequest([makeFile('a.pdf')], [], 'new')).toThrow(DomainValidationError);
        });
        it('개수가 일치하면 통과', () => {
            expect(() => service.validateUploadRequest([makeFile('a.pdf')], ['idCard'], 'new')).not.toThrow();
        });
        it('20MB를 초과하거나 허용되지 않은 형식이면 예외', () => {
            expect(() =>
                service.validateUploadRequest(
                    [makeFile('large.pdf', 'application/pdf', 20 * 1024 * 1024 + 1)],
                    ['idCard'],
                    'new',
                ),
            ).toThrow(/20MB/);
            expect(() =>
                service.validateUploadRequest([makeFile('script.exe', 'application/octet-stream')], ['idCard'], 'new'),
            ).toThrow(/지원되지 않는 형식/);
        });
        it('정규화 후 중복되는 서류 타입이면 예외', () => {
            expect(() =>
                service.validateUploadRequest([makeFile('a.pdf'), makeFile('b.pdf')], ['idCard', 'id_card'], 'new'),
            ).toThrow(/중복된 서류 타입/);
        });
        it('New 등급에서 Elite 전용 서류를 업로드하면 예외', () => {
            expect(() =>
                service.validateUploadRequest([makeFile('contract.pdf')], ['adoptionContractSample'], 'new'),
            ).toThrow(/new 등급에서 제출할 수 없는/);
        });
    });

    describe('buildSubmissionPlan - new 레벨', () => {
        it('필수 서류(idCard, businessLicense)가 있으면 통과', () => {
            const submittedDocuments = [
                { type: 'idCard', fileName: 'verification/id.pdf', originalFileName: 'id.pdf' },
                { type: 'businessLicense', fileName: 'verification/bl.pdf' },
            ];
            const plan = service.buildSubmissionPlan({
                level: 'new',
                submittedDocuments,
                draftDocuments: toDrafts(submittedDocuments),
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
                    draftDocuments: [{ type: 'idCard', fileName: 'verification/id.pdf' }],
                }),
            ).toThrow(DomainValidationError);
        });
    });

    describe('buildSubmissionPlan - elite 레벨', () => {
        it('브리더 인증 서류가 없으면 예외', () => {
            const submittedDocuments = [
                { type: 'idCard', fileName: 'verification/id.pdf' },
                { type: 'businessLicense', fileName: 'verification/bl.pdf' },
                { type: 'contractSample', fileName: 'verification/cs.pdf' },
            ];
            expect(() =>
                service.buildSubmissionPlan({
                    level: 'elite',
                    submittedDocuments,
                    draftDocuments: toDrafts(submittedDocuments),
                }),
            ).toThrow('전문성을 증빙하는 서류');
        });

        it('breederDogCertificate가 있으면 통과', () => {
            const submittedDocuments = [
                { type: 'idCard', fileName: 'verification/id.pdf' },
                { type: 'businessLicense', fileName: 'verification/bl.pdf' },
                { type: 'contractSample', fileName: 'verification/cs.pdf' },
                { type: 'breederDogCertificate', fileName: 'verification/cert.pdf' },
            ];
            const plan = service.buildSubmissionPlan({
                level: 'elite',
                submittedDocuments,
                draftDocuments: toDrafts(submittedDocuments),
            });
            expect(plan.finalDocuments).toHaveLength(4);
        });
    });

    describe('isResubmission 판별', () => {
        it('REJECTED 상태는 재제출로 간주', () => {
            const submittedDocuments = [
                { type: 'idCard', fileName: 'verification/id.pdf' },
                { type: 'businessLicense', fileName: 'verification/bl.pdf' },
            ];
            const plan = service.buildSubmissionPlan({
                level: 'new',
                submittedDocuments,
                draftDocuments: toDrafts(submittedDocuments),
                currentVerification: { status: VerificationStatus.REJECTED },
            });
            expect(plan.isResubmission).toBe(true);
        });
    });

    describe('회원가입 서류와 관리 서류 규격 통합', () => {
        it('pending 상태의 snake_case 회원가입 서류를 Elite 신청에 재사용한다', () => {
            const submittedDocuments = [
                {
                    type: 'adoptionContractSample',
                    fileName: 'verification/breeder-id/contract.pdf',
                },
                {
                    type: 'ticaCfaDocument',
                    fileName: 'verification/breeder-id/tica.pdf',
                },
            ];
            const plan = service.buildSubmissionPlan({
                level: 'elite',
                submittedDocuments,
                draftDocuments: toDrafts(submittedDocuments),
                currentVerification: {
                    status: VerificationStatus.APPROVED,
                    documents: [
                        { type: 'id_card', fileName: 'documents/verification/temp/new/id.pdf' },
                        {
                            type: 'animal_production_license',
                            fileName: 'breeder-documents/license.pdf',
                        },
                    ],
                },
            });

            expect(plan.finalDocuments.map((document) => document.type)).toEqual([
                'id_card',
                'animal_production_license',
                'adoption_contract_sample',
                'breeder_certification',
            ]);
        });

        it('지원하지 않는 서류 타입은 저장 전에 거절한다', () => {
            expect(() =>
                service.buildSubmissionPlan({
                    level: 'new',
                    submittedDocuments: [{ type: 'unknownDocument', fileName: 'verification/unknown.pdf' }],
                    draftDocuments: [],
                }),
            ).toThrow('지원하지 않는 서류 타입');
        });
    });

    describe('업로드 소유권 검증', () => {
        it('재제출 시 기존 문서를 유지', () => {
            const existing = [
                { type: 'idCard', fileName: 'verification/old-id.pdf', uploadedAt: new Date() },
                { type: 'businessLicense', fileName: 'verification/bl.pdf', uploadedAt: new Date() },
            ];
            const plan = service.buildSubmissionPlan({
                level: 'new',
                submittedDocuments: [
                    { type: 'idCard', fileName: 'keep-existing' },
                    { type: 'businessLicense', fileName: 'verification/bl-new.pdf' },
                ],
                draftDocuments: [{ type: 'businessLicense', fileName: 'verification/bl-new.pdf' }],
                currentVerification: { status: VerificationStatus.REJECTED, documents: existing },
            });
            // idCard는 기존 유지, businessLicense는 신규
            expect(plan.finalDocuments.map((d) => d.fileName)).toContain('verification/old-id.pdf');
            expect(plan.finalDocuments.map((d) => d.fileName)).toContain('verification/bl-new.pdf');
        });

        it('현재 사용자의 업로드 초안에 없는 신규 경로는 거절', () => {
            expect(() =>
                service.buildSubmissionPlan({
                    level: 'new',
                    submittedDocuments: [
                        { type: 'idCard', fileName: 'verification/forged-id.pdf' },
                        { type: 'businessLicense', fileName: 'verification/forged-license.pdf' },
                    ],
                    draftDocuments: [],
                }),
            ).toThrow(/업로드가 확인되지 않은 서류/);
        });
    });
});
