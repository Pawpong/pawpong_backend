import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';

import { FavoriteAddRequestDto } from '../../dto/request/favorite-add-request.dto';
import { AdopterMapper } from '../../mapper/adopter.mapper';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import { AdopterFavoritePolicyService } from '../../domain/services/adopter-favorite-policy.service';

@Injectable()
export class AddFavoriteBreederUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_BREEDER_READER_PORT)
        private readonly adopterBreederReaderPort: AdopterBreederReaderPort,
        private readonly adopterFavoritePolicyService: AdopterFavoritePolicyService,
    ) {}

    async execute(userId: string, addFavoriteDto: FavoriteAddRequestDto): Promise<any> {
        const adopter = await this.adopterProfilePort.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
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

        const favorite = AdopterMapper.toFavoriteBreeder(addFavoriteDto.breederId, targetBreeder);
        await this.adopterProfilePort.addFavoriteBreeder(userId, favorite);

        return { message: '브리더를 즐겨찾기에 추가했습니다.' };
    }
}
