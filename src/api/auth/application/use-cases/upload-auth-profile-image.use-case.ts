import { Inject, Injectable } from '@nestjs/common';

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
