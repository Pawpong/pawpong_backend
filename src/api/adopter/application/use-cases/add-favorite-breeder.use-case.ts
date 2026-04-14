import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';

import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import { AdopterFavoritePolicyService } from '../../domain/services/adopter-favorite-policy.service';
import { AdopterFavoriteRecordMapperService } from '../../domain/services/adopter-favorite-record-mapper.service';
import type { AdopterFavoriteAddCommand } from '../types/adopter-favorite-command.type';
import type { AdopterFavoriteCommandResult } from '../types/adopter-result.type';

@Injectable()
export class AddFavoriteBreederUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_BREEDER_READER_PORT)
        private readonly adopterBreederReaderPort: AdopterBreederReaderPort,
        private readonly adopterFavoritePolicyService: AdopterFavoritePolicyService,
        private readonly adopterFavoriteRecordMapperService: AdopterFavoriteRecordMapperService,
    ) {}

    async execute(
        userId: string,
        addFavoriteDto: AdopterFavoriteAddCommand,
        userRole?: string,
    ): Promise<AdopterFavoriteCommandResult> {
        const adopter = await this.adopterProfilePort.findById(userId, userRole);
        if (!adopter) {
            throw new BadRequestException(userRole === 'breeder' ? '브리더 정보를 찾을 수 없습니다.' : '입양자 정보를 찾을 수 없습니다.');
        }

        const targetBreeder = await this.adopterBreederReaderPort.findById(addFavoriteDto.breederId);
        if (!targetBreeder) {
            throw new BadRequestException('해당 브리더를 찾을 수 없습니다.');
        }

        try {
            this.adopterFavoritePolicyService.ensureCanAdd(adopter.favoriteBreederList || [], addFavoriteDto.breederId);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw error;
        }

        const favorite = this.adopterFavoriteRecordMapperService.toRecord(addFavoriteDto.breederId, targetBreeder);
        await this.adopterProfilePort.addFavoriteBreeder(userId, favorite, userRole);

        return { message: '브리더를 즐겨찾기에 추가했습니다.' };
    }
}
