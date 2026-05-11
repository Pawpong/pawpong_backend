import { Injectable } from '@nestjs/common';

import type { AdoptionApplicationContextPort } from '../application/ports/adoption-application-context.port';
import type { AdoptionApplicationContext } from '../application/types/adoption-application.type';
import { AdoptionApplicationRepository } from '../repository/adoption-application.repository';

/**
 * v2 입양 신청 context adapter.
 *
 * 분양 펫 + 입양자 정보를 한 번에 모아 use-case 가 별도 lookup 없이 persist 데이터를 만들 수 있게 한다.
 * 펫이 isActive=false 거나 status=adopted 라면 신청 불가 → null 반환.
 */
@Injectable()
export class AdoptionApplicationContextMongooseAdapter implements AdoptionApplicationContextPort {
    constructor(private readonly repository: AdoptionApplicationRepository) {}

    async readContext(petId: string, adopterId: string): Promise<AdoptionApplicationContext | null> {
        const pet = await this.repository.findActivePet(petId);
        if (!pet) return null;
        if (pet.status === 'adopted') return null;

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
