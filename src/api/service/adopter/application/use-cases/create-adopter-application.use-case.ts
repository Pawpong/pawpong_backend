import { Inject, Injectable } from '@nestjs/common';

import { DomainConflictError, DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { ApplicationStatus } from '../../../../../common/enum/user.enum';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import type { AdopterProfilePort, AdopterProfileRecord } from '../ports/adopter-profile.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import type { AdopterBreederRecord } from '../../types/adopter-breeder.type';
import { ADOPTER_PET_READER_PORT, type AdopterPetReaderPort } from '../ports/adopter-pet-reader.port';
import {
    ADOPTER_APPLICATION_COMMAND_PORT,
    type AdopterApplicationCommandPort,
} from '../ports/adopter-application-command.port';
import {
    ADOPTER_APPLICATION_NOTIFIER_PORT,
    type AdopterApplicationNotifierPort,
} from '../ports/adopter-application-notifier.port';
import { AdopterApplicationCreateResultMapperService } from '../../domain/services/adopter-application-create-result-mapper.service';
import { AdopterApplicationCustomAnswerBuilderService } from '../../domain/services/adopter-application-custom-answer-builder.service';
import { AdopterApplicationStandardAnswerBuilderService } from '../../domain/services/adopter-application-standard-answer-builder.service';
import type { AdopterApplicationCreateCommand } from '../types/adopter-application-command.type';
import type { AdopterApplicationCreateResult } from '../types/adopter-result.type';

@Injectable()
export class CreateAdopterApplicationUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_BREEDER_READER_PORT)
        private readonly adopterBreederReaderPort: AdopterBreederReaderPort,
        @Inject(ADOPTER_PET_READER_PORT)
        private readonly adopterPetReaderPort: AdopterPetReaderPort,
        @Inject(ADOPTER_APPLICATION_COMMAND_PORT)
        private readonly adopterApplicationCommandPort: AdopterApplicationCommandPort,
        @Inject(ADOPTER_APPLICATION_NOTIFIER_PORT)
        private readonly adopterApplicationNotifierPort: AdopterApplicationNotifierPort,
        private readonly adopterApplicationCreateResultMapperService: AdopterApplicationCreateResultMapperService,
        private readonly adopterApplicationCustomAnswerBuilderService: AdopterApplicationCustomAnswerBuilderService,
        private readonly adopterApplicationStandardAnswerBuilderService: AdopterApplicationStandardAnswerBuilderService,
    ) {}

    async execute(
        userId: string,
        dto: AdopterApplicationCreateCommand,
        userRole?: string,
    ): Promise<AdopterApplicationCreateResult> {
        const applicant = await this.loadApplicant(userId, userRole);
        const contact = this.resolveApplicantContact(dto, applicant);

        if (!dto.privacyConsent) {
            throw new DomainValidationError('개인정보 수집 및 이용에 동의해야 신청이 가능합니다.');
        }

        const breeder = await this.adopterBreederReaderPort.findById(dto.breederId);
        if (!breeder) {
            throw new DomainNotFoundError('해당 브리더를 찾을 수 없습니다.');
        }

        const pet = await this.readRequestedPet(dto.petId, dto.breederId);

        const existingPendingApplication = await this.adopterApplicationCommandPort.findPendingByAdopterAndBreeder(
            userId,
            dto.breederId,
        );
        if (existingPendingApplication) {
            throw new DomainConflictError('해당 브리더에게 이미 대기 중인 상담 신청이 있습니다.');
        }

        const standardResponses = this.adopterApplicationStandardAnswerBuilderService.build(dto);
        const customResponses = this.adopterApplicationCustomAnswerBuilderService.build(
            dto,
            breeder.applicationForm || [],
        );

        const savedApplication = await this.adopterApplicationCommandPort.create({
            breederId: dto.breederId,
            adopterId: userId,
            adopterName: contact.name,
            adopterEmail: contact.email,
            adopterPhone: contact.phone,
            petId: pet ? dto.petId : undefined,
            petName: pet?.name,
            status: ApplicationStatus.CONSULTATION_PENDING,
            standardResponses,
            customResponses,
            appliedAt: new Date(),
        });

        await this.adopterApplicationNotifierPort.notifyBreederOfNewApplication(breeder);

        const breederDisplayName = breeder.name || breeder.nickname || '브리더';
        await this.adopterApplicationNotifierPort.notifyApplicantApplicationConfirmed({
            applicantId: userId,
            applicantRole: userRole || 'adopter',
            applicantName: contact.name,
            applicantEmail: contact.email,
            breederName: breederDisplayName,
        });

        return this.adopterApplicationCreateResultMapperService.toResult(
            savedApplication,
            breederDisplayName,
            pet?.name,
        );
    }

    private async loadApplicant(
        userId: string,
        userRole?: string,
    ): Promise<AdopterProfileRecord | AdopterBreederRecord> {
        if (userRole === 'breeder') {
            const breeder = await this.adopterBreederReaderPort.findById(userId);
            if (!breeder) {
                throw new DomainNotFoundError('브리더 정보를 찾을 수 없습니다.');
            }
            return breeder;
        }

        const adopter = await this.adopterProfilePort.findById(userId);
        if (!adopter) {
            throw new DomainNotFoundError('입양자 정보를 찾을 수 없습니다.');
        }
        return adopter;
    }

    /**
     * 신청자 연락처 결정 — 요청 값이 있으면 우선하고, 없으면 로그인 프로필에서 보강한다.
     * (신청 폼이 이름/휴대폰/이메일을 받지 않는 경우 인증된 사용자 정보로 채운다)
     */
    private resolveApplicantContact(
        dto: AdopterApplicationCreateCommand,
        applicant: AdopterProfileRecord | AdopterBreederRecord,
    ): { name: string; email: string; phone: string } {
        const profileName = 'name' in applicant ? applicant.name : undefined;
        return {
            name: dto.name || profileName || applicant.nickname || '',
            email: dto.email || applicant.emailAddress || '',
            phone: dto.phone || applicant.phoneNumber || '',
        };
    }

    private async readRequestedPet(petId: string | undefined, breederId: string) {
        if (!petId) {
            return null;
        }

        const pet = await this.adopterPetReaderPort.findByIdAndBreeder(petId, breederId);
        if (!pet) {
            throw new DomainNotFoundError('해당 반려동물을 찾을 수 없습니다.');
        }

        if (pet.status !== 'available') {
            throw new DomainValidationError('현재 분양 신청이 불가능한 반려동물입니다.');
        }

        return pet;
    }
}
