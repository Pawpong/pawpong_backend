import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';

import { AdoptionApplicationPersistMapperService } from '../../domain/services/adoption-application-persist-mapper.service';
import { AdoptionApplicationValidatorService } from '../../domain/services/adoption-application-validator.service';
import {
    ADOPTION_APPLICATION_CONTEXT_PORT,
    type AdoptionApplicationContextPort,
} from '../ports/adoption-application-context.port';
import {
    ADOPTION_APPLICATION_WRITER_PORT,
    type AdoptionApplicationWriterPort,
} from '../ports/adoption-application-writer.port';
import type {
    CreateAdoptionApplicationV2Command,
    CreateAdoptionApplicationV2Result,
} from '../types/adoption-application.type';

/**
 * v2 입양 신청 use-case (Figma 122:3).
 *
 * 책임:
 * 1. 입력 정합성 검증 (3개 동의 + 가족 동의 + 입양 계획/가족 구성원 필수)
 * 2. 분양 펫 존재/활성 확인 + 펫에서 breederId 도출
 * 3. 동일 adopter × pet 의 처리 중 신청 중복 차단
 * 4. command + context → persist 변환 후 저장
 */
@Injectable()
export class CreateAdoptionApplicationV2UseCase {
    constructor(
        @Inject(ADOPTION_APPLICATION_CONTEXT_PORT)
        private readonly contextPort: AdoptionApplicationContextPort,
        @Inject(ADOPTION_APPLICATION_WRITER_PORT)
        private readonly writerPort: AdoptionApplicationWriterPort,
        private readonly validator: AdoptionApplicationValidatorService,
        private readonly mapper: AdoptionApplicationPersistMapperService,
    ) {}

    async execute(command: CreateAdoptionApplicationV2Command): Promise<CreateAdoptionApplicationV2Result> {
        this.validator.validate(command);

        const context = await this.contextPort.readContext(command.petId, command.adopterId);
        if (!context) {
            throw new BadRequestException('해당 분양 펫을 찾을 수 없거나 신청할 수 없는 상태입니다.');
        }

        const hasOpenApplication = await this.writerPort.existsOpenApplicationForPet(command.adopterId, command.petId);
        if (hasOpenApplication) {
            throw new ConflictException('이미 처리 중인 상담 신청이 있습니다.');
        }

        const persistData = this.mapper.toPersistData(command, context);
        const { applicationId } = await this.writerPort.create(persistData);
        return { applicationId, status: 'consultation_pending' };
    }
}
