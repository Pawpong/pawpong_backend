import { Injectable } from '@nestjs/common';

import type { AdoptionApplicationContextPort } from '../application/ports/adoption-application-context.port';
import type { AdoptionApplicationContext } from '../application/types/adoption-application.type';
import { AdoptionApplicationRepository } from '../repository/adoption-application.repository';

/**
 * v2 입양 신청 context adapter.
 *
 * 분양 펫 + 입양자 정보를 한 번에 모아 use-case 가 별도 lookup 없이 persist 데이터를 만들 수 있게 한다.
 * 신규 입양 신청은 `status='available'` 인 활성 펫에 대해서만 허용한다 (reserved/adopted 는 신청 불가).
 * findApplicablePet 이 이미 두 조건을 모두 거르므로, 어댑터에서 별도 후처리 가드는 두지 않는다.
 */
@Injectable()
export class AdoptionApplicationContextMongooseAdapter implements AdoptionApplicationContextPort {
    constructor(private readonly repository: AdoptionApplicationRepository) {}

    async readContext(petId: string, adopterId: string): Promise<AdoptionApplicationContext | null> {
        const pet = await this.repository.findApplicablePet(petId);
        if (!pet) return null;

        const adopter = await this.repository.findAdopter(adopterId);

        return {
            breederId: String(pet.breederId),
            petName: pet.name,
            adopterName: adopter?.realName || adopter?.nickname,
            adopterEmail: adopter?.emailAddress,
            adopterPhone: adopter?.phoneNumber,
        };
    }
}
