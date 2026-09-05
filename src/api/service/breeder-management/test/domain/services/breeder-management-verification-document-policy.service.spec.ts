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
        it('빈 파일 목록과 파일·타입 수 불일치를 거절한다', () => {
            expect(() => service.validateUploadRequest([], [])).toThrow(DomainValidationError);
            expect(() => service.validateUploadRequest([makeFile('a.pdf')], [])).toThrow(DomainValidationError);
        });

        it('지원하는 서류는 등급 구분 없이 업로드할 수 있다', () => {
            expect(() =>
                service.validateUploadRequest(
                    [makeFile('id.pdf'), makeFile('contract.pdf'), makeFile('certificate.pdf')],
                    ['idCard', 'adoptionContractSample', 'breederCertification'],
                ),
            ).not.toThrow();
        });

        it('20MB 초과 또는 허용되지 않은 형식을 거절한다', () => {
            expect(() =>
                service.validateUploadRequest(
                    [makeFile('large.pdf', 'application/pdf', 20 * 1024 * 1024 + 1)],
                    ['idCard'],
                ),
            ).toThrow(/20MB/);
            expect(() =>
                service.validateUploadRequest([makeFile('script.exe', 'application/octet-stream')], ['idCard']),
            ).toThrow(/지원되지 않는 형식/);
        });

        it('정규화 후 중복되는 서류 타입을 거절한다', () => {
            expect(() =>
                service.validateUploadRequest([makeFile('a.pdf'), makeFile('b.pdf')], ['idCard', 'id_card']),
            ).toThrow(/중복된 서류 타입/);
        });
    });

    describe('buildSubmissionPlan', () => {
        it('신분증과 동물생산업 등록증이 있으면 신규 심사를 구성한다', () => {
            const submittedDocuments = [
                { type: 'idCard', fileName: 'verification/id.pdf', originalFileName: 'id.pdf' },
                { type: 'businessLicense', fileName: 'verification/license.pdf' },
            ];

            const plan = service.buildSubmissionPlan({
                submittedDocuments,
                draftDocuments: toDrafts(submittedDocuments),
            });

            expect(plan.isResubmission).toBe(false);
            expect(plan.finalDocuments.map((document) => document.type)).toEqual([
                'id_card',
                'animal_production_license',
            ]);
        });

        it('필수 서류가 누락되면 거절한다', () => {
            expect(() =>
                service.buildSubmissionPlan({
                    submittedDocuments: [{ type: 'idCard', fileName: 'verification/id.pdf' }],
                    draftDocuments: [{ type: 'idCard', fileName: 'verification/id.pdf' }],
                }),
            ).toThrow(/필수 서류가 누락/);
        });

        it('계약서와 전문성 증빙은 선택 서류로 함께 보존한다', () => {
            const submittedDocuments = [
                { type: 'idCard', fileName: 'verification/id.pdf' },
                { type: 'businessLicense', fileName: 'verification/license.pdf' },
                { type: 'contractSample', fileName: 'verification/contract.pdf' },
                { type: 'ticaCfaDocument', fileName: 'verification/certificate.pdf' },
            ];

            const plan = service.buildSubmissionPlan({
                submittedDocuments,
                draftDocuments: toDrafts(submittedDocuments),
            });

            expect(plan.finalDocuments.map((document) => document.type)).toEqual([
                'id_card',
                'animal_production_license',
                'adoption_contract_sample',
                'breeder_certification',
            ]);
        });

        it('REJECTED 상태는 재제출로 판정한다', () => {
            const submittedDocuments = [
                { type: 'idCard', fileName: 'verification/id.pdf' },
                { type: 'businessLicense', fileName: 'verification/license.pdf' },
            ];

            const plan = service.buildSubmissionPlan({
                submittedDocuments,
                draftDocuments: toDrafts(submittedDocuments),
                currentVerification: { status: VerificationStatus.REJECTED },
            });

            expect(plan.isResubmission).toBe(true);
        });

        it('회원가입에서 저장한 레거시 경로와 snake_case 타입을 재사용한다', () => {
            const plan = service.buildSubmissionPlan({
                submittedDocuments: [],
                draftDocuments: [],
                currentVerification: {
                    status: VerificationStatus.REJECTED,
                    documents: [
                        { type: 'id_card', fileName: 'documents/verification/temp/id.pdf' },
                        { type: 'animal_production_license', fileName: 'breeder-documents/license.pdf' },
                    ],
                },
            });

            expect(plan.finalDocuments).toHaveLength(2);
        });

        it('지원하지 않는 서류 타입을 저장 전에 거절한다', () => {
            expect(() =>
                service.buildSubmissionPlan({
                    submittedDocuments: [{ type: 'unknownDocument', fileName: 'verification/unknown.pdf' }],
                    draftDocuments: [],
                }),
            ).toThrow('지원하지 않는 서류 타입');
        });

        it('재제출 시 기존 서류를 유지하고 새 서류를 병합한다', () => {
            const plan = service.buildSubmissionPlan({
                submittedDocuments: [
                    { type: 'idCard', fileName: 'keep-existing' },
                    { type: 'businessLicense', fileName: 'verification/license-new.pdf' },
                ],
                draftDocuments: [{ type: 'businessLicense', fileName: 'verification/license-new.pdf' }],
                currentVerification: {
                    status: VerificationStatus.REJECTED,
                    documents: [
                        { type: 'idCard', fileName: 'verification/id-old.pdf', uploadedAt: new Date() },
                        { type: 'businessLicense', fileName: 'verification/license-old.pdf', uploadedAt: new Date() },
                    ],
                },
            });

            expect(plan.finalDocuments.map((document) => document.fileName)).toEqual([
                'verification/id-old.pdf',
                'verification/license-new.pdf',
            ]);
        });

        it('현재 사용자의 업로드 초안에 없는 신규 경로를 거절한다', () => {
            expect(() =>
                service.buildSubmissionPlan({
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
