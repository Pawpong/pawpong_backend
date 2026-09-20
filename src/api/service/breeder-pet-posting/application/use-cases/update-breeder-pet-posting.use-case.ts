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
import type { BreederPetPostingUpdateCommand } from '../types/breeder-pet-posting-command.type';

/**
 * v2 분양글 부분 수정 use-case (브리더 본인 전용).
 *
 * - StrictRolesGuard('breeder') 가 컨트롤러 단에서 role 강제
 * - 본인 글 아니거나 비활성/미존재면 BadRequestException ("해당 분양글을 찾을 수 없습니다.")
 *   → 다른 브리더 소유 정보 누설 방지를 위해 403 대신 400 으로 통일
 *
 * 입력 필드 화이트리스트는 BreederPetPostingUpdateCommand 가 정의한다.
 * petType 은 화이트리스트에서 제외한다 — 브리더 1명 = 1축종이라 글 단위로 바꿀 수 없다.
 *
 * cross-field 검증과 command -> persist 변환은 작성 경로와 같은 도메인 서비스를 쓴다
 * (validator.validateUpdate / mapper.toUpdatePersistData) — 규칙이 두 벌로 갈라지지 않게 한다.
 */
@Injectable()
export class UpdateBreederPetPostingUseCase {
    constructor(
        @Inject(BREEDER_PET_POSTING_PROFILE_PORT)
        private readonly profilePort: BreederPetPostingProfilePort,
        @Inject(BREEDER_PET_POSTING_WRITER_PORT)
        private readonly writerPort: BreederPetPostingWriterPort,
        private readonly validator: BreederPetPostingValidatorService,
        private readonly mapper: BreederPetPostingMapperService,
    ) {}

    async execute(userId: string, petId: string, command: BreederPetPostingUpdateCommand): Promise<{ petId: string }> {
        const breeder = await this.profilePort.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        // class-validator 의 @IsOptional 은 null 도 통과시킨다. null 을 "미제공"으로 정규화해두지 않으면
        // 검증/매핑이 null 을 배열·객체로 다루다 500 이 난다 (예: parentPetSnapshots: null).
        // 값 삭제는 null 이 아니라 빈 배열 / 빈 객체로 표현한다 — DTO 설명과 같은 계약이다.
        const patch = this.withoutNulls(command);

        this.validator.validateUpdate(patch);
        const persistData = this.mapper.toUpdatePersistData(patch);

        // 축종은 브리더 계정에 종속된다. 실제로 바꿀 필드가 있을 때 브리더 값으로 함께 재확정해,
        // petType 이 비어 있던 과거 분양글이 수정 시점에 스스로 복구되게 한다.
        // (빈 patch 는 기존처럼 소유 여부 확인만 하도록 그대로 둔다)
        if (Object.keys(persistData).length > 0 && breeder.petType) {
            persistData.petType = breeder.petType;
        }

        const { changed } = await this.writerPort.updateByOwner(petId, breeder.breederId, persistData);
        if (!changed) {
            throw new BadRequestException('해당 분양글을 찾을 수 없습니다.');
        }

        return { petId };
    }

    private withoutNulls(command: BreederPetPostingUpdateCommand): BreederPetPostingUpdateCommand {
        return Object.fromEntries(
            Object.entries(command).filter(([, value]) => value !== null),
        ) as BreederPetPostingUpdateCommand;
    }
}
