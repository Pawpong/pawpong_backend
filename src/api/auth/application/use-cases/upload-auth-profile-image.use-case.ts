import { Injectable } from '@nestjs/common';

import { AuthTempUploadPort } from '../ports/auth-temp-upload.port';
import {
    AuthProfileImageTargetPort,
    type AuthProfileImageOwnerRole,
} from '../ports/auth-profile-image-target.port';
import { AuthUploadFileStorePort } from '../ports/auth-upload-file-store.port';
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
        private readonly authUploadFileStorePort: AuthUploadFileStorePort,
        private readonly authProfileImageTargetPort: AuthProfileImageTargetPort,
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
