import { AuthTempUploadPort, type AuthTempUploadDocument, type AuthTempUploadInfo } from '../../../application/ports/auth-temp-upload.port';
import { AuthUploadFileStorePort, type AuthUploadedStorageFile } from '../../../application/ports/auth-upload-file-store.port';
import { AuthBreederDocumentFilePolicyService } from '../../../domain/services/auth-breeder-document-file-policy.service';
import { AuthBreederDocumentOriginalFileNameService } from '../../../domain/services/auth-breeder-document-original-file-name.service';
import { UploadAuthBreederDocumentsUseCase } from '../../../application/use-cases/upload-auth-breeder-documents.use-case';

class StubAuthUploadFileStorePort extends AuthUploadFileStorePort {
    async upload(file: Express.Multer.File, folder: string): Promise<AuthUploadedStorageFile> {
        return {
            cdnUrl: `https://cdn.test/${folder}/${file.originalname}`,
            fileName: `${folder}/${file.originalname}`,
        };
    }
}

class StubAuthTempUploadPort extends AuthTempUploadPort {
    tempUploads = new Map<string, AuthTempUploadInfo>();

    get(tempId: string): AuthTempUploadInfo | undefined {
        return this.tempUploads.get(tempId);
    }

    saveProfileImage(tempId: string, fileName: string): void {
        const existing = this.tempUploads.get(tempId) || { createdAt: new Date() };
        this.tempUploads.set(tempId, {
            ...existing,
            profileImage: fileName,
            createdAt: existing.createdAt,
        });
    }

    saveDocuments(tempId: string, documents: AuthTempUploadDocument[]): void {
        const existing = this.tempUploads.get(tempId) || { createdAt: new Date() };
        this.tempUploads.set(tempId, {
            ...existing,
            documents,
            createdAt: existing.createdAt,
        });
    }

    delete(tempId: string): void {
        this.tempUploads.delete(tempId);
    }
}

describe('브리더 인증 문서 업로드 유스케이스', () => {
    let tempUploadPort: StubAuthTempUploadPort;
    let useCase: UploadAuthBreederDocumentsUseCase;

    beforeEach(() => {
        tempUploadPort = new StubAuthTempUploadPort();
        useCase = new UploadAuthBreederDocumentsUseCase(
            new StubAuthUploadFileStorePort(),
            tempUploadPort,
            new AuthBreederDocumentFilePolicyService(),
            new AuthBreederDocumentOriginalFileNameService(),
        );
    });

    it('브리더 문서 업로드 응답 계약과 temp 저장 계약을 유지한다', async () => {
        const files = [
            { originalname: '신분증.jpg', size: 1024, mimetype: 'image/jpeg' } as Express.Multer.File,
            { originalname: '등록증.jpg', size: 2048, mimetype: 'image/jpeg' } as Express.Multer.File,
        ];

        const result = await useCase.execute(
            files,
            ['idCard', 'animalProductionLicense'],
            'new',
            'temp-docs',
        );

        expect(result.count).toBe(2);
        expect(result.response.uploadedDocuments).toHaveLength(2);
        expect(result.response.uploadedDocuments[0]).toMatchObject({
            type: 'idCard',
            url: 'https://cdn.test/documents/verification/temp/new/신분증.jpg',
            filename: 'documents/verification/temp/new/신분증.jpg',
            originalFileName: '신분증.jpg',
            size: 1024,
        });
        expect(tempUploadPort.get('temp-docs')?.documents).toEqual([
            {
                fileName: 'documents/verification/temp/new/신분증.jpg',
                originalFileName: '신분증.jpg',
                type: 'idCard',
            },
            {
                fileName: 'documents/verification/temp/new/등록증.jpg',
                originalFileName: '등록증.jpg',
                type: 'animalProductionLicense',
            },
        ]);
    });

    it('파일 개수와 타입 개수가 다르면 기존 오류 계약을 유지한다', async () => {
        await expect(
            useCase.execute(
                [{ originalname: '신분증.jpg', size: 1024, mimetype: 'image/jpeg' } as Express.Multer.File],
                ['idCard', 'animalProductionLicense'],
                'new',
            ),
        ).rejects.toThrow('파일 개수(1)와 서류 타입 개수(2)가 일치하지 않습니다.');
    });
});
