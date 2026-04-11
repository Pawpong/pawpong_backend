import {
    BreederManagementVerificationDraftStorePort,
    type BreederManagementVerificationDraftDocument,
} from '../../../application/ports/breeder-management-verification-draft-store.port';
import {
    BreederManagementVerificationDocumentStorePort,
    type BreederManagementUploadedVerificationDocument,
} from '../../../application/ports/breeder-management-verification-document-store.port';
import { BreederManagementVerificationDocumentPolicyService } from '../../../domain/services/breeder-management-verification-document-policy.service';
import { BreederManagementVerificationOriginalFileNameService } from '../../../domain/services/breeder-management-verification-original-file-name.service';
import { UploadBreederManagementVerificationDocumentsUseCase } from '../../../application/use-cases/upload-breeder-management-verification-documents.use-case';

class StubProfilePort {
    breeder = { _id: 'breeder-id' };

    async findById() {
        return this.breeder;
    }
}

class StubDocumentStore extends BreederManagementVerificationDocumentStorePort {
    async upload(file: Express.Multer.File): Promise<BreederManagementUploadedVerificationDocument> {
        return {
            fileName: `verification/breeder-id/${file.originalname}`,
            previewUrl: `https://example.com/${file.originalname}`,
        };
    }
}

class StubDraftStore extends BreederManagementVerificationDraftStorePort {
    documents: BreederManagementVerificationDraftDocument[] = [];

    async save(_userId: string, documents: BreederManagementVerificationDraftDocument[]): Promise<void> {
        this.documents = documents;
    }

    async get(): Promise<BreederManagementVerificationDraftDocument[]> {
        return this.documents;
    }

    async delete(): Promise<void> {
        this.documents = [];
    }
}

describe('브리더 관리 인증 문서 업로드 유스케이스', () => {
    let useCase: UploadBreederManagementVerificationDocumentsUseCase;
    let draftStore: StubDraftStore;

    beforeEach(() => {
        draftStore = new StubDraftStore();
        useCase = new UploadBreederManagementVerificationDocumentsUseCase(
            new StubProfilePort() as any,
            new StubDocumentStore(),
            draftStore,
            new BreederManagementVerificationOriginalFileNameService(),
            new BreederManagementVerificationDocumentPolicyService(),
        );
    });

    it('업로드 응답 계약을 유지하고 임시 문서를 저장한다', async () => {
        const files = [
            { originalname: '신분증.pdf', size: 1234 } as Express.Multer.File,
            { originalname: '등록증.pdf', size: 5678 } as Express.Multer.File,
        ];

        const result = await useCase.execute('breeder-id', files, ['idCard', 'businessLicense'], 'new');

        expect(result.count).toBe(2);
        expect(result.level).toBe('new');
        expect(result.documents[0]).toMatchObject({
            type: 'idCard',
            fileName: 'verification/breeder-id/신분증.pdf',
            url: 'https://example.com/신분증.pdf',
            size: 1234,
            originalFileName: '신분증.pdf',
        });
        expect(draftStore.documents).toHaveLength(2);
    });

    it('파일 수와 타입 수가 다르면 실패한다', async () => {
        await expect(
            useCase.execute(
                'breeder-id',
                [{ originalname: '신분증.pdf', size: 1234 } as Express.Multer.File],
                ['idCard', 'businessLicense'],
                'new',
            ),
        ).rejects.toThrow('파일 수와 타입 수가 일치하지 않습니다.');
    });
});
