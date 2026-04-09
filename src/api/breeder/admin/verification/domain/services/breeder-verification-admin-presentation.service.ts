import { Inject, Injectable } from '@nestjs/common';

import { BreederDetailResponseDto } from '../../dto/response/breeder-detail-response.dto';
import { BREEDER_VERIFICATION_ADMIN_FILE_URL_PORT } from '../../application/ports/breeder-verification-admin-file-url.port';
import type { BreederVerificationAdminFileUrlPort } from '../../application/ports/breeder-verification-admin-file-url.port';
import {
    BreederVerificationAdminBreederSnapshot,
    BreederVerificationAdminVerificationSnapshot,
} from '../../application/ports/breeder-verification-admin-reader.port';

@Injectable()
export class BreederVerificationAdminDetailPresentationService {
    constructor(
        @Inject(BREEDER_VERIFICATION_ADMIN_FILE_URL_PORT)
        private readonly fileUrlPort: BreederVerificationAdminFileUrlPort,
    ) {}

    toBreederDetailResponse(breeder: BreederVerificationAdminBreederSnapshot): BreederDetailResponseDto {
        return {
            breederId: breeder.id,
            email: breeder.emailAddress,
            nickname: breeder.nickname,
            phone: breeder.phoneNumber,
            businessNumber: undefined,
            businessName: breeder.name || breeder.nickname,
            verificationInfo: {
                verificationStatus: breeder.verification?.status || 'pending',
                subscriptionPlan: breeder.verification?.plan || 'basic',
                level: breeder.verification?.level || 'new',
                submittedAt: this.resolveSubmittedAt(breeder.verification),
                processedAt: breeder.verification?.reviewedAt,
                isSubmittedByEmail: breeder.verification?.submittedByEmail || false,
                documents:
                    breeder.verification?.documents?.map((document) => ({
                        type: document.type,
                        fileName: document.fileName,
                        fileUrl: this.fileUrlPort.generateOne(document.fileName, 60),
                        uploadedAt: document.uploadedAt!,
                    })) || [],
                rejectionReason: breeder.verification?.rejectionReason,
            },
            profileInfo: {
                location: breeder.profile?.location?.city,
                detailedLocation: breeder.profile?.location?.district,
                specialization: breeder.profile?.specialization,
                breeds: breeder.breeds || [],
                description: breeder.profile?.description,
                experienceYears: breeder.profile?.experienceYears,
            },
            createdAt: breeder.createdAt!,
            updatedAt: breeder.updatedAt!,
        };
    }

    private resolveSubmittedAt(verification?: BreederVerificationAdminVerificationSnapshot): Date | undefined {
        if (!verification) {
            return undefined;
        }

        if (verification.submittedAt) {
            return verification.submittedAt;
        }

        const uploadDates = (verification.documents || [])
            .map((document) => document.uploadedAt)
            .filter((date): date is Date => date !== undefined)
            .sort((left, right) => left.getTime() - right.getTime());

        return uploadDates[0];
    }
}
