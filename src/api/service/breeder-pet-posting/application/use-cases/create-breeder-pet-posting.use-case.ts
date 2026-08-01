import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BreederPetPostingMapperService } from '../../domain/services/breeder-pet-posting-mapper.service';
import { BreederPetPostingValidatorService } from '../../domain/services/breeder-pet-posting-validator.service';
import {
    BREEDER_PET_POSTING_PROFILE_PORT,
    type BreederPetPostingProfilePort,
} from '../ports/breeder-pet-posting-profile.port';
import {
    BREEDER_PET_POSTING_WRITER_PORT,
    type BreederPetPostingWriterPort,
} from '../ports/breeder-pet-posting-writer.port';
import type {
    BreederPetPostingCreateCommand,
    BreederPetPostingCreateResult,
} from '../types/breeder-pet-posting-command.type';

/**
 * v2 분양글 작성 use-case.
 *
 * 책임:
 * 1. 브리더 존재 확인 (StrictRolesGuard 로 role 은 이미 검증됨)
 * 2. 도메인 검증 (사진 개수/대표 인덱스, 접종/검사 상태와 records 상호 배타, 부모 정보 중복)
 * 3. command -> persist data 매핑 후 writer port 로 저장
 */
@Injectable()
export class CreateBreederPetPostingUseCase {
    constructor(
        @Inject(BREEDER_PET_POSTING_PROFILE_PORT)
        private readonly profilePort: BreederPetPostingProfilePort,
        @Inject(BREEDER_PET_POSTING_WRITER_PORT)
        private readonly writerPort: BreederPetPostingWriterPort,
        private readonly validator: BreederPetPostingValidatorService,
        private readonly mapper: BreederPetPostingMapperService,
    ) {}

    async execute(userId: string, command: BreederPetPostingCreateCommand): Promise<BreederPetPostingCreateResult> {
        const breeder = await this.profilePort.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        this.validator.validate(command);

        const persistData = this.mapper.toPersistData(breeder.breederId, command);
        const result = await this.writerPort.create(persistData);
        return { petId: result.petId };
    }
}
