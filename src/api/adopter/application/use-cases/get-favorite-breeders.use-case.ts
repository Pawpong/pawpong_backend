import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { AdopterMapper } from '../../mapper/adopter.mapper';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import { ADOPTER_FILE_URL_PORT } from '../ports/adopter-file-url.port';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import type { AdopterFileUrlPort } from '../ports/adopter-file-url.port';
import type { AdopterProfilePort, FavoriteBreederRecord } from '../ports/adopter-profile.port';
import { AdopterPaginationAssemblerService } from '../../domain/services/adopter-pagination-assembler.service';
import type { AdopterFavoriteBreederResult, AdopterFavoritePageResult } from '../types/adopter-result.type';

@Injectable()
export class GetFavoriteBreedersUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_BREEDER_READER_PORT)
        private readonly adopterBreederReaderPort: AdopterBreederReaderPort,
        @Inject(ADOPTER_FILE_URL_PORT)
        private readonly adopterFileUrlPort: AdopterFileUrlPort,
        private readonly adopterPaginationAssemblerService: AdopterPaginationAssemblerService,
    ) {}

    async execute(
        userId: string,
        page: number = 1,
        limit: number = 10,
        userRole?: string,
    ): Promise<AdopterFavoritePageResult> {
        const adopter = await this.adopterProfilePort.findById(userId, userRole);
        if (!adopter) {
            throw new BadRequestException(userRole === 'breeder' ? '브리더 정보를 찾을 수 없습니다.' : '입양자 정보를 찾을 수 없습니다.');
        }

        const result = await this.adopterProfilePort.findFavoriteList(userId, page, limit, userRole);
        const favoriteListWithDetails = await Promise.all(
            result.favorites.map(async (favorite) => this.toFavoriteDetail(favorite)),
        );

        return this.adopterPaginationAssemblerService.build(favoriteListWithDetails, page, limit, result.total);
    }

    private async toFavoriteDetail(favorite: FavoriteBreederRecord): Promise<AdopterFavoriteBreederResult> {
        try {
            const breeder = await this.adopterBreederReaderPort.findById(favorite.favoriteBreederId);
            const profileImageUrl = breeder?.profileImageFileName
                ? this.adopterFileUrlPort.generateOneSafe(breeder.profileImageFileName) || ''
                : '';
            const representativePhotos = breeder?.profile?.representativePhotos
                ? this.adopterFileUrlPort.generateMany(breeder.profile.representativePhotos)
                : [];

            return AdopterMapper.toFavoriteDetail(
                favorite,
                breeder,
                profileImageUrl,
                representativePhotos,
            );
        } catch {
            return AdopterMapper.toFavoriteDetail(favorite, null, '', []);
        }
    }
}
