import { Inject, Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../../../common/dto/pagination/pagination-builder.dto';
import { BreederLevel } from '../../../../../../common/enum/user.enum';
import { BreederDetailResponseDto } from '../../dto/response/breeder-detail-response.dto';
import { BreederLevelChangeResponseDto } from '../../dto/response/breeder-level-change-response.dto';
import { BreederStatsResponseDto } from '../../dto/response/breeder-stats-response.dto';
import { BreederVerificationResponseDto } from '../../dto/response/breeder-verification-response.dto';
import { BREEDER_VERIFICATION_ADMIN_FILE_URL_PORT } from '../../application/ports/breeder-verification-admin-file-url.port';
import type { BreederVerificationAdminFileUrlPort } from '../../application/ports/breeder-verification-admin-file-url.port';
import {
    BreederVerificationAdminBreederSnapshot,
    BreederVerificationAdminDocumentSnapshot,
    BreederVerificationAdminListResultSnapshot,
    BreederVerificationAdminStatsSnapshot,
    BreederVerificationAdminVerificationSnapshot,
} from '../../application/ports/breeder-verification-admin-reader.port';

@Injectable()
export class BreederVerificationAdminPresentationService {
    constructor(
        @Inject(BREEDER_VERIFICATION_ADMIN_FILE_URL_PORT)
        private readonly fileUrlPort: BreederVerificationAdminFileUrlPort,
    ) {}

    toLevelChangeRequestResponse(breeder: BreederVerificationAdminBreederSnapshot): BreederVerificationResponseDto {
        const levelChangeRequest = breeder.verification?.levelChangeRequest;

        return {
            breederId: breeder.id,
            breederName: breeder.nickname,
            emailAddress: breeder.emailAddress,
            phoneNumber: breeder.phoneNumber,
            accountStatus: breeder.accountStatus || 'active',
            isTestAccount: breeder.isTestAccount || false,
            verificationInfo: {
                verificationStatus: 'reviewing',
                subscriptionPlan: breeder.verification?.plan || 'basic',
                level: levelChangeRequest?.requestedLevel || breeder.verification?.level || 'new',
                submittedAt: levelChangeRequest?.requestedAt || this.resolveSubmittedAt(breeder.verification),
                isSubmittedByEmail: breeder.verification?.submittedByEmail || false,
                previousLevel: levelChangeRequest?.previousLevel,
                isLevelChange: true,
            },
            profileInfo: breeder.profile,
            createdAt: breeder.createdAt!,
        };
    }

    toPendingBreederResponse(breeder: BreederVerificationAdminBreederSnapshot): BreederVerificationResponseDto {
        return {
            breederId: breeder.id,
            breederName: breeder.nickname,
            emailAddress: breeder.emailAddress,
            phoneNumber: breeder.phoneNumber,
            accountStatus: breeder.accountStatus || 'active',
            verificationInfo: {
                verificationStatus: breeder.verification?.status || 'pending',
                subscriptionPlan: breeder.verification?.plan || 'basic',
                level: breeder.verification?.level || 'new',
                submittedAt: this.resolveSubmittedAt(breeder.verification),
                isSubmittedByEmail: breeder.verification?.submittedByEmail || false,
            },
            profileInfo: breeder.profile,
            createdAt: breeder.createdAt!,
        };
    }

    toBreederResponse(breeder: BreederVerificationAdminBreederSnapshot): BreederVerificationResponseDto {
        return {
            breederId: breeder.id,
            breederName: breeder.nickname,
            emailAddress: breeder.emailAddress,
            phoneNumber: breeder.phoneNumber,
            accountStatus: breeder.accountStatus || 'active',
            isTestAccount: breeder.isTestAccount || false,
            verificationInfo: {
                verificationStatus: breeder.verification?.status || 'pending',
                subscriptionPlan: breeder.verification?.plan || 'basic',
                level: breeder.verification?.level || 'new',
                submittedAt: this.resolveSubmittedAt(breeder.verification),
                isSubmittedByEmail: breeder.verification?.submittedByEmail || false,
            },
            profileInfo: breeder.profile,
            createdAt: breeder.createdAt!,
        };
    }

    toPaginatedResponse<T>(items: T[], page: number, limit: number, total: number) {
        return new PaginationBuilder<T>().setItems(items).setPage(page).setLimit(limit).setTotalCount(total).build();
    }

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

    toBreederStatsResponse(stats: BreederVerificationAdminStatsSnapshot): BreederStatsResponseDto {
        return {
            totalApproved: stats.totalApproved,
            eliteCount: stats.eliteCount,
            newCount: stats.totalApproved - stats.eliteCount,
        };
    }

    toLevelChangeResponse(
        breeder: BreederVerificationAdminBreederSnapshot,
        previousLevel: string,
        newLevel: string,
        changedAt: Date,
        changedBy: string,
    ): BreederLevelChangeResponseDto {
        return {
            breederId: breeder.id,
            breederName: breeder.nickname,
            previousLevel,
            newLevel,
            changedAt,
            changedBy,
        };
    }

    toDocumentReminderResponse(sentCount: number, breederIds: string[]): { sentCount: number; breederIds: string[] } {
        return {
            sentCount,
            breederIds,
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
