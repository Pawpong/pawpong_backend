import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import {
    ADOPTER_APPLICATION_COMMAND_PORT,
    type AdopterApplicationCommandPort,
} from '../ports/adopter-application-command.port';
import { AdopterApplicationCreateResultMapperService } from '../../domain/services/adopter-application-create-result-mapper.service';
import { AdopterApplicationCustomAnswerBuilderService } from '../../domain/services/adopter-application-custom-answer-builder.service';
import { AdopterApplicationStandardAnswerBuilderService } from '../../domain/services/adopter-application-standard-answer-builder.service';
import type { AdopterApplicationCreateCommand } from '../types/adopter-application-command.type';
import type { AdopterApplicationCreateResult } from '../types/adopter-result.type';

/** 수정 요청 DTO — breederId/petId 는 수정 범위 밖이라 command 조립 시 채워 넣는다 */
export type AdopterApplicationUpdateInput = Omit<AdopterApplicationCreateCommand, 'breederId' | 'petId'>;

@Injectable()
export class UpdateAdopterApplicationUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_BREEDER_READER_PORT)
        private readonly adopterBreederReaderPort: AdopterBreederReaderPort,
        @Inject(ADOPTER_APPLICATION_COMMAND_PORT)
        private readonly adopterApplicationCommandPort: AdopterApplicationCommandPort,
        private readonly adopterApplicationCreateResultMapperService: AdopterApplicationCreateResultMapperService,
        private readonly adopterApplicationCustomAnswerBuilderService: AdopterApplicationCustomAnswerBuilderService,
        private readonly adopterApplicationStandardAnswerBuilderService: AdopterApplicationStandardAnswerBuilderService,
    ) {}

    async execute(
        userId: string,
        applicationId: string,
        dto: AdopterApplicationUpdateInput,
        userRole?: string,
    ): Promise<AdopterApplicationCreateResult> {
        const application = await this.adopterApplicationCommandPort.findByIdAndAdopter(applicationId, userId);
        if (!application) {
            throw new DomainNotFoundError('해당 입양 신청을 찾을 수 없습니다.');
        }

        // 브리더가 상담을 시작한 뒤에 답변이 바뀌면 이미 진행 중인 상담과 어긋나므로
        // 대기 상태일 때만 전체 재작성을 허용한다.
        if (application.status !== 'consultation_pending') {
            throw new DomainValidationError('상담 대기 상태인 신청서만 수정할 수 있습니다.');
        }

        const breederId = application.breederId.toString();
        const breeder = await this.adopterBreederReaderPort.findById(breederId);
        if (!breeder) {
            throw new DomainNotFoundError('해당 브리더를 찾을 수 없습니다.');
        }

        const contact = await this.resolveApplicantContact(userId, dto, userRole);

        const standardResponses = this.adopterApplicationStandardAnswerBuilderService.build({
            ...dto,
            breederId,
        });
        const customResponses = this.adopterApplicationCustomAnswerBuilderService.build(
            { ...dto, breederId },
            breeder.applicationForm || [],
        );

        const updatedApplication = await this.adopterApplicationCommandPort.updateContent(applicationId, {
            adopterName: contact.name,
            adopterEmail: contact.email,
            adopterPhone: contact.phone,
            standardResponses,
            customResponses,
        });

        const breederDisplayName = breeder.name || breeder.nickname || '브리더';

        return this.adopterApplicationCreateResultMapperService.toUpdateResult(updatedApplication, breederDisplayName);
    }

    private async resolveApplicantContact(
        userId: string,
        dto: AdopterApplicationUpdateInput,
        userRole?: string,
    ): Promise<{ name: string; email: string; phone: string }> {
        // 브리더 계정도 신청을 수정할 수 있어, role을 넘겨야 브리더 컬렉션에서도 조회한다.
        const applicant = userRole
            ? await this.adopterProfilePort.findById(userId, userRole)
            : await this.adopterProfilePort.findById(userId);
        if (!applicant) {
            throw new DomainNotFoundError('회원 정보를 찾을 수 없습니다.');
        }

        const profileName = 'name' in applicant ? applicant.name : undefined;
        return {
            name: dto.name || profileName || applicant.nickname || '',
            email: dto.email || applicant.emailAddress || '',
            phone: dto.phone || applicant.phoneNumber || '',
        };
    }
}
