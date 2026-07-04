import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
    USER_PROFILE_UPDATED_EVENT,
    type UserProfileUpdatedEvent,
} from '../../../../common/events/user-profile-updated.event';
import { AUTH_TEMP_UPLOAD_PORT, type AuthTempUploadPort } from '../ports/auth-temp-upload.port';
import {
    AUTH_PROFILE_IMAGE_TARGET_PORT,
    type AuthProfileImageTargetPort,
    type AuthProfileImageOwnerRole,
} from '../ports/auth-profile-image-target.port';
import { AUTH_UPLOAD_FILE_STORE_PORT, type AuthUploadFileStorePort } from '../ports/auth-upload-file-store.port';
import { AuthProfileImageFilePolicyService } from '../../domain/services/auth-profile-image-file-policy.service';

type AuthProfileImageUploadUser = {
    userId: string;
    role: string;
};

type AuthUploadedProfileImage = {
    cdnUrl: string;
    fileName: string;
    size: number;
};

@Injectable()
export class UploadAuthProfileImageUseCase {
    constructor(
        @Inject(AUTH_UPLOAD_FILE_STORE_PORT)
        private readonly authUploadFileStorePort: AuthUploadFileStorePort,
        @Inject(AUTH_PROFILE_IMAGE_TARGET_PORT)
        private readonly authProfileImageTargetPort: AuthProfileImageTargetPort,
        @Inject(AUTH_TEMP_UPLOAD_PORT)
        private readonly authTempUploadPort: AuthTempUploadPort,
        private readonly authProfileImageFilePolicyService: AuthProfileImageFilePolicyService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async execute(
        file: Express.Multer.File,
        user?: AuthProfileImageUploadUser,
        tempId?: string,
    ): Promise<AuthUploadedProfileImage> {
        this.authProfileImageFilePolicyService.validate(file);

        const uploaded = await this.authUploadFileStorePort.upload(file, 'profiles');

        if (user && this.isSupportedRole(user.role)) {
            await this.authProfileImageTargetPort.save(user.userId, user.role, uploaded.fileName);

            // 로그인 유저가 프로필 이미지를 교체하면 커뮤니티 등에 복제된 작성자 snapshot 을 동기화한다.
            // 익명 가입(tempId 만 있는) 업로드는 여기 진입하지 않으므로 이벤트를 발행하지 않는다.
            const payload: UserProfileUpdatedEvent = {
                userId: user.userId,
                profileImageFileName: uploaded.fileName,
            };
            this.eventEmitter.emit(USER_PROFILE_UPDATED_EVENT, payload);
        }

        if (tempId) {
            this.authTempUploadPort.saveProfileImage(tempId, uploaded.fileName);
        }

        return {
            cdnUrl: uploaded.cdnUrl,
            fileName: uploaded.fileName,
            size: file.size,
        };
    }

    private isSupportedRole(role: string): role is AuthProfileImageOwnerRole {
        return role === 'breeder' || role === 'adopter';
    }
}
