import { Injectable } from '@nestjs/common';

import type { BreederManagementFileUrlPort } from '../../application/ports/breeder-management-file-url.port';
import type { BreederManagementBreederRecord } from '../../application/ports/breeder-management-profile.port';
import type { BreederManagementVerificationDraftDocument } from '../../application/ports/breeder-management-verification-draft-store.port';
import type {
    BreederManagementVerificationNotificationDocument,
    BreederManagementVerificationSubmissionNotification,
} from '../../application/ports/breeder-management-verification-notifier.port';
import type { BreederManagementStoredVerificationDocumentRecord } from '../../application/ports/breeder-management-settings.port';

@Injectable()
export class BreederManagementVerificationNotificationPayloadFactoryService {
    create(params: {
        breeder: BreederManagementBreederRecord;
        level: 'new' | 'elite';
        isResubmission: boolean;
        submittedAt: Date;
        finalDocuments: BreederManagementStoredVerificationDocumentRecord[];
        draftDocuments: BreederManagementVerificationDraftDocument[];
        fileUrlPort: BreederManagementFileUrlPort;
    }): BreederManagementVerificationSubmissionNotification {
        const { breeder, level, isResubmission, submittedAt, finalDocuments, draftDocuments, fileUrlPort } = params;

        return {
            breederId: String(breeder._id),
            breederName: breeder.name || '이름 미설정',
            email: breeder.emailAddress,
            phone: breeder.phoneNumber,
            level,
            isResubmission,
            submittedAt,
            documents: finalDocuments.map((document) =>
                this.toNotificationDocument(document, draftDocuments, fileUrlPort),
            ),
        };
    }

    private toNotificationDocument(
        document: BreederManagementStoredVerificationDocumentRecord,
        draftDocuments: BreederManagementVerificationDraftDocument[],
        fileUrlPort: BreederManagementFileUrlPort,
    ): BreederManagementVerificationNotificationDocument {
        const draftDocument = draftDocuments.find((draft) => draft.fileName === document.fileName);

        return {
            type: document.type,
            url: fileUrlPort.generateOne(document.fileName, 60 * 24 * 7),
            originalFileName:
                draftDocument?.originalFileName ||
                document.originalFileName ||
                document.fileName.split('/').pop(),
        };
    }
}
