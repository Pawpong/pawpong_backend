import { VerificationStatus } from '../../../../../common/enum/user.enum';

import type { BreederManagementFileUrlPort } from '../../../application/ports/breeder-management-file-url.port';
import type { BreederManagementProfilePort } from '../../../application/ports/breeder-management-profile.port';
import type { BreederManagementSettingsPort } from '../../../application/ports/breeder-management-settings.port';
import {
    type BreederManagementVerificationDraftDocument,
    type BreederManagementVerificationDraftStorePort,
} from '../../../application/ports/breeder-management-verification-draft-store.port';
import {
    type BreederManagementVerificationSubmissionNotification,
    type BreederManagementVerificationNotifierPort,
} from '../../../application/ports/breeder-management-verification-notifier.port';
import { BreederManagementVerificationCommandResponseService } from '../../../domain/services/breeder-management-verification-command-response.service';
import { BreederManagementVerificationDocumentPolicyService } from '../../../domain/services/breeder-management-verification-document-policy.service';
import { BreederManagementVerificationNotificationPayloadFactoryService } from '../../../domain/services/breeder-management-verification-notification-payload-factory.service';
import { SubmitBreederManagementVerificationDocumentsUseCase } from '../../../application/use-cases/submit-breeder-management-verification-documents.use-case';

class StubProfilePort {
    breeder: any = {
        _id: 'breeder-id',
        name: '테스트 브리더',
        emailAddress: 'breeder@test.com',
        phoneNumber: '010-1111-2222',
        verification: {
            status: VerificationStatus.PENDING,
            documents: [],
        },
    };

    async findById() {
        return this.breeder;
    }
}

class StubSettingsPort {
    updatedVerification: any;

    async updateVerification(_breederId: string, verification: any): Promise<void> {
        this.updatedVerification = verification;
    }

    async updateApplicationForm(): Promise<any> {
        return null;
    }
}

class StubFileUrlPort {
    generateOne(fileName: string): string {
        return `https://example.com/${fileName}`;
    }

    generateOneSafe(fileName: string | null | undefined): string | undefined {
        return fileName ? this.generateOne(fileName) : undefined;
    }

    generateMany(fileNames: string[]): string[] {
        return fileNames.map((fileName) => this.generateOne(fileName));
    }
}

class StubDraftStore implements BreederManagementVerificationDraftStorePort {
    documents: BreederManagementVerificationDraftDocument[] = [];
    deleted = false;

    async save(_userId: string, documents: BreederManagementVerificationDraftDocument[]): Promise<void> {
        this.documents = documents;
    }

    async get(): Promise<BreederManagementVerificationDraftDocument[]> {
        return [...this.documents];
    }

    async delete(): Promise<void> {
        this.deleted = true;
    }
}

class StubNotifier implements BreederManagementVerificationNotifierPort {
    payload?: BreederManagementVerificationSubmissionNotification;

    async notifySubmission(payload: BreederManagementVerificationSubmissionNotification): Promise<void> {
        this.payload = payload;
    }
}

describe('브리더 관리 인증 문서 제출 유스케이스', () => {
    let profilePort: StubProfilePort;
    let settingsPort: StubSettingsPort;
    let draftStore: StubDraftStore;
    let notifier: StubNotifier;
    let useCase: SubmitBreederManagementVerificationDocumentsUseCase;

    beforeEach(() => {
        profilePort = new StubProfilePort();
        settingsPort = new StubSettingsPort();
        draftStore = new StubDraftStore();
        notifier = new StubNotifier();
        useCase = new SubmitBreederManagementVerificationDocumentsUseCase(
            profilePort as unknown as BreederManagementProfilePort,
            settingsPort as unknown as BreederManagementSettingsPort,
            new StubFileUrlPort() as unknown as BreederManagementFileUrlPort,
            draftStore,
            notifier,
            new BreederManagementVerificationCommandResponseService(),
            new BreederManagementVerificationDocumentPolicyService(),
            new BreederManagementVerificationNotificationPayloadFactoryService(),
        );
    });

    it('신규 제출 시 검증 문서를 저장하고 알림 알림 데이터를 만든다', async () => {
        draftStore.documents = [
            {
                type: 'idCard',
                fileName: 'verification/breeder-id/id-card.pdf',
                originalFileName: '신분증.pdf',
            },
        ];

        const result = await useCase.execute('breeder-id', {
            level: 'new',
            documents: [
                {
                    type: 'idCard',
                    fileName: 'verification/breeder-id/id-card.pdf',
                    originalFileName: '신분증.pdf',
                },
                {
                    type: 'businessLicense',
                    fileName: 'verification/breeder-id/business-license.pdf',
                    originalFileName: '등록증.pdf',
                },
            ],
        });

        expect(result).toEqual({
            message: '입점 서류 제출이 완료되었습니다. 관리자 검토 후 결과를 알려드립니다.',
        });
        expect(settingsPort.updatedVerification.status).toBe(VerificationStatus.REVIEWING);
        expect(settingsPort.updatedVerification.documents).toHaveLength(2);
        expect(notifier.payload?.documents).toHaveLength(2);
        expect(draftStore.deleted).toBe(true);
    });

    it('재제출 시 기존 문서를 유지하면서 새 문서를 병합한다', async () => {
        profilePort.breeder.verification = {
            status: VerificationStatus.REJECTED,
            documents: [
                {
                    type: 'idCard',
                    fileName: 'verification/breeder-id/id-card.pdf',
                    originalFileName: '기존신분증.pdf',
                },
            ],
        };

        const result = await useCase.execute('breeder-id', {
            level: 'new',
            documents: [
                {
                    type: 'idCard',
                    fileName: 'keep-existing-id-card.pdf',
                    originalFileName: '기존신분증.pdf',
                },
                {
                    type: 'businessLicense',
                    fileName: 'verification/breeder-id/business-license.pdf',
                    originalFileName: '등록증.pdf',
                },
            ],
        });

        expect(result.message).toContain('입점 서류 제출이 완료되었습니다');
        expect(settingsPort.updatedVerification.documents).toHaveLength(2);
        expect(settingsPort.updatedVerification.documents[0]).toMatchObject({
            type: 'idCard',
            fileName: 'verification/breeder-id/id-card.pdf',
        });
        expect(settingsPort.updatedVerification.documents[1]).toMatchObject({
            type: 'businessLicense',
            fileName: 'verification/breeder-id/business-license.pdf',
        });
    });
});
