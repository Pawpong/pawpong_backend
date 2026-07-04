import type {
    AuthProfileImageOwnerRole,
    AuthProfileImageTargetPort,
} from '../../../application/ports/auth-profile-image-target.port';
import type {
    AuthTempUploadDocument,
    AuthTempUploadInfo,
    AuthTempUploadPort,
} from '../../../application/ports/auth-temp-upload.port';
import type {
    AuthUploadFileStorePort,
    AuthUploadedStorageFile,
} from '../../../application/ports/auth-upload-file-store.port';
import { AuthProfileImageFilePolicyService } from '../../../domain/services/auth-profile-image-file-policy.service';
import { UploadAuthProfileImageUseCase } from '../../../application/use-cases/upload-auth-profile-image.use-case';
import { USER_PROFILE_UPDATED_EVENT } from '../../../../../common/events/user-profile-updated.event';

class StubAuthUploadFileStorePort implements AuthUploadFileStorePort {
    async upload(file: Express.Multer.File, folder: string): Promise<AuthUploadedStorageFile> {
        return {
            cdnUrl: `https://cdn.test/${folder}/${file.originalname}`,
            fileName: `${folder}/${file.originalname}`,
        };
    }
}

class StubAuthProfileImageTargetPort implements AuthProfileImageTargetPort {
    saved: { userId: string; role: AuthProfileImageOwnerRole; fileName: string } | null = null;

    async save(userId: string, role: AuthProfileImageOwnerRole, fileName: string): Promise<void> {
        this.saved = { userId, role, fileName };
    }
}

class StubAuthTempUploadPort implements AuthTempUploadPort {
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

describe('인증 프로필 이미지 업로드 유스케이스', () => {
    let targetPort: StubAuthProfileImageTargetPort;
    let tempUploadPort: StubAuthTempUploadPort;
    let eventEmitter: { emit: jest.Mock };
    let useCase: UploadAuthProfileImageUseCase;

    beforeEach(() => {
        targetPort = new StubAuthProfileImageTargetPort();
        tempUploadPort = new StubAuthTempUploadPort();
        eventEmitter = { emit: jest.fn() };
        useCase = new UploadAuthProfileImageUseCase(
            new StubAuthUploadFileStorePort(),
            targetPort,
            tempUploadPort,
            new AuthProfileImageFilePolicyService(),
            eventEmitter as any,
        );
    });

    it('로그인 사용자와 임시 ID가 함께 있으면 저장 계약을 모두 유지한다', async () => {
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
        // 로그인 유저의 이미지 교체는 커뮤니티 작성자 snapshot 동기화 이벤트를 발행한다.
        expect(eventEmitter.emit).toHaveBeenCalledWith(USER_PROFILE_UPDATED_EVENT, {
            userId: 'user-id',
            profileImageFileName: 'profiles/profile.jpg',
        });
    });

    it('임시 ID만 있는 회원가입 업로드는 동기화 이벤트를 발행하지 않는다', async () => {
        const file = {
            originalname: 'profile.jpg',
            size: 1024,
        } as Express.Multer.File;

        await useCase.execute(file, undefined, 'temp-1');

        // 가입 전 임시 업로드는 유저 문서를 바꾸지 않으므로 이벤트 발행 대상이 아니다.
        expect(targetPort.saved).toBeNull();
        expect(eventEmitter.emit).not.toHaveBeenCalled();
        expect(tempUploadPort.get('temp-1')).toMatchObject({
            profileImage: 'profiles/profile.jpg',
        });
    });

    it('지원하지 않는 role 은 저장과 이벤트를 모두 건너뛴다', async () => {
        const file = {
            originalname: 'profile.jpg',
            size: 1024,
        } as Express.Multer.File;

        await useCase.execute(file, { userId: 'admin-id', role: 'admin' });

        expect(targetPort.saved).toBeNull();
        expect(eventEmitter.emit).not.toHaveBeenCalled();
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
