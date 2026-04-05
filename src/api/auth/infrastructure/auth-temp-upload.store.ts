import { Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../common/logger/custom-logger.service';
import {
    type AuthTempUploadDocument,
    type AuthTempUploadInfo,
    type AuthTempUploadPort,
} from '../application/ports/auth-temp-upload.port';

@Injectable()
export class AuthTempUploadStore implements AuthTempUploadPort {
    private readonly tempUploads = new Map<string, AuthTempUploadInfo>();

    constructor(private readonly logger: CustomLoggerService) {
        const cleanupTimer = setInterval(() => this.cleanupOldTempUploads(), 60 * 60 * 1000);
        cleanupTimer.unref?.();
    }

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

    private cleanupOldTempUploads(): void {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        let deletedCount = 0;

        for (const [tempId, info] of this.tempUploads.entries()) {
            if (info.createdAt < oneHourAgo) {
                this.tempUploads.delete(tempId);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            this.logger.log(`[AuthTempUploadStore] ${deletedCount}개의 오래된 임시 업로드 데이터를 삭제했습니다.`);
        }
    }
}
