import { Injectable } from '@nestjs/common';

import { BreederVerificationResponseDto } from '../../dto/response/breeder-verification-response.dto';
import {
    BreederVerificationAdminBreederSnapshot,
    BreederVerificationAdminVerificationSnapshot,
} from '../../application/ports/breeder-verification-admin-reader.port';
import { BreederPaginationAssemblerService } from '../../../../domain/services/breeder-pagination-assembler.service';

@Injectable()
export class BreederVerificationAdminListPresentationService {
    constructor(private readonly breederPaginationAssemblerService: BreederPaginationAssemblerService) {}

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
        return this.breederPaginationAssemblerService.build(items, page, limit, total);
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
