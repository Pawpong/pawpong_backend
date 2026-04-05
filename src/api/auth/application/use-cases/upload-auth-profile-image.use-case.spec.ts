import { AuthProfileImageTargetPort, type AuthProfileImageOwnerRole } from '../ports/auth-profile-image-target.port';
import { AuthTempUploadPort, type AuthTempUploadDocument, type AuthTempUploadInfo } from '../ports/auth-temp-upload.port';
import { AuthUploadFileStorePort, type AuthUploadedStorageFile } from '../ports/auth-upload-file-store.port';
import { AuthProfileImageFilePolicyService } from '../../domain/services/auth-profile-image-file-policy.service';
import { UploadAuthProfileImageUseCase } from './upload-auth-profile-image.use-case';

class StubAuthUploadFileStorePort extends AuthUploadFileStorePort {
    async upload(file: Express.Multer.File, folder: string): Promise<AuthUploadedStorageFile> {
        return {
            cdnUrl: `https://cdn.test/${folder}/${file.originalname}`,
            fileName: `${folder}/${file.originalname}`,
        };
    }
}

class StubAuthProfileImageTargetPort extends AuthProfileImageTargetPort {
    saved: { userId: string; role: AuthProfileImageOwnerRole; fileName: string } | null = null;

    async save(userId: string, role: AuthProfileImageOwnerRole, fileName: string): Promise<void> {
        this.saved = { userId, role, fileName };
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

describe('UploadAuthProfileImageUseCase', () => {
    let targetPort: StubAuthProfileImageTargetPort;
    let tempUploadPort: StubAuthTempUploadPort;
    let useCase: UploadAuthProfileImageUseCase;

    beforeEach(() => {
        targetPort = new StubAuthProfileImageTargetPort();
        tempUploadPort = new StubAuthTempUploadPort();
        useCase = new UploadAuthProfileImageUseCase(
            new StubAuthUploadFileStorePort(),
            targetPort,
            tempUploadPort,
            new AuthProfileImageFilePolicyService(),
        );
    });

    it('로그인 사용자와 tempId가 함께 있으면 저장 계약을 모두 유지한다', async () => {
        const file = {
            originalname: 'profile.jpg',
            size: 1024,
        } as Express.Multer.File;

        const result = await useCase.execute(file, { userId: 'user-id', role: 'adopter' }, 'temp-1');

        expect(result).toEqual({
            cdnUrl: 'https://cdn.test/profiles/profile.jpg',
            fileName: 'profiles/profile.jpg',
            size: 1024,
        });
        expect(targetPort.saved).toEqual({
            userId: 'user-id',
            role: 'adopter',
            fileName: 'profiles/profile.jpg',
        });
        expect(tempUploadPort.get('temp-1')).toMatchObject({
            profileImage: 'profiles/profile.jpg',
        });
    });

    it('100MB를 초과하면 기존 오류 계약을 유지한다', async () => {
        await expect(
            useCase.execute({
                originalname: 'oversized.jpg',
                size: 101 * 1024 * 1024,
            } as Express.Multer.File),
        ).rejects.toThrow('파일 크기는 100MB를 초과할 수 없습니다.');
    });
});
