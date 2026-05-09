import { Inject, Injectable } from '@nestjs/common';

import { ProfileMapperService } from '../../domain/services/profile-mapper.service';
import { FavoriteBreederCardResponseDto } from '../../dto/response/favorite-breeder-card.dto';
import { PROFILE_READER_PORT, type ProfileReaderPort } from '../ports/profile-reader.port';

export interface FavoriteBreedersPage {
    items: FavoriteBreederCardResponseDto[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

/**
 * GET /v2/profile/me/favorite-breeders — 마이홈 "즐겨찾는 브리더" 탭 페이지네이션.
 */
@Injectable()
export class GetMyFavoriteBreedersUseCase {
    constructor(
        @Inject(PROFILE_READER_PORT)
        private readonly reader: ProfileReaderPort,
        private readonly mapper: ProfileMapperService,
    ) {}

    async execute(adopterId: string, page = 1, pageSize = 10): Promise<FavoriteBreedersPage> {
        const result = await this.reader.listFavoriteBreeders(adopterId, { page, pageSize });
        const items = result.items.map((snapshot) => this.mapper.toFavoriteBreederCardDto(snapshot));
        const totalPages = Math.max(1, Math.ceil(result.totalItems / pageSize));
        return {
            items,
            pagination: {
                currentPage: page,
                pageSize,
                totalItems: result.totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
}
