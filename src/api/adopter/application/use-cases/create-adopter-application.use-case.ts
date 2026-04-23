import { Inject, Injectable } from '@nestjs/common';

import { DomainConflictError, DomainNotFoundError, DomainValidationError } from '../../../../common/error/domain.error';
import { ApplicationStatus } from '../../../../common/enum/user.enum';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
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
        await this.ensureApplicantExists(userId, userRole);

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
            adopterName: dto.name,
            adopterEmail: dto.email,
            adopterPhone: dto.phone,
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
            applicantName: dto.name,
            applicantEmail: dto.email,
            breederName: breederDisplayName,
        });

        return this.adopterApplicationCreateResultMapperService.toResult(
            savedApplication,
            breederDisplayName,
            pet?.name,
        );
    }

    private async ensureApplicantExists(userId: string, userRole?: string): Promise<void> {
        if (userRole === 'breeder') {
            const breeder = await this.adopterBreederReaderPort.findById(userId);
            if (!breeder) {
                throw new DomainNotFoundError('브리더 정보를 찾을 수 없습니다.');
            }
            return;
        }

        const adopter = await this.adopterProfilePort.findById(userId);
        if (!adopter) {
            throw new DomainNotFoundError('입양자 정보를 찾을 수 없습니다.');
        }
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
