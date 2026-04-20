import { Injectable, Logger } from '@nestjs/common';

import type { BreederManagementFileUrlPort } from '../../application/ports/breeder-management-file-url.port';
import type { BreederManagementBreederRecord } from '../../application/ports/breeder-management-profile.port';
import type { BreederManagementVerificationStatusResult } from '../../application/types/breeder-management-result.type';

@Injectable()
export class BreederManagementVerificationStatusAssemblerService {
    private readonly logger = new Logger(BreederManagementVerificationStatusAssemblerService.name);

    toResponse(
        breeder: BreederManagementBreederRecord,
        fileUrlPort: BreederManagementFileUrlPort,
    ): BreederManagementVerificationStatusResult {
        const verification = breeder.verification;

        this.logger.log(
            `[toResponse] breederId: ${String(breeder._id)}, documents count: ${verification?.documents?.length || 0}`,
        );

        const documents =
            verification?.documents
                ?.map((doc) => {
                    const isValidFileName =
                        doc.fileName &&
                        (doc.fileName.startsWith('verification/') ||
                            doc.fileName.startsWith('documents/verification/'));

                    if (!isValidFileName) {
                        this.logger.warn(
                            `Invalid verification fileName detected - type: ${doc.type}, fileName: ${doc.fileName}`,
                        );
                        return null;
                    }

                    return {
                        type: doc.type,
                        fileName: doc.fileName,
                        url: fileUrlPort.generateOne(doc.fileName, 60),
                        originalFileName: doc.originalFileName,
                        uploadedAt: doc.uploadedAt,
                    };
                })
                .filter((doc): doc is NonNullable<typeof doc> => doc !== null) || [];

        return {
            status: verification?.status || 'pending',
            plan: verification?.plan,
            level: verification?.level,
            submittedAt: verification?.submittedAt,
            reviewedAt: verification?.reviewedAt,
            documents,
            rejectionReason: verification?.rejectionReason,
            submittedByEmail: verification?.submittedByEmail || false,
        };
    }
}
