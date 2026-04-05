import { Injectable } from '@nestjs/common';

import { SearchBreederRequestDto, BreederSortBy } from '../../dto/request/search-breeder-request.dto';

@Injectable()
export class BreederExploreCriteriaService {
    build(searchDto: SearchBreederRequestDto): {
        filter: Record<string, unknown>;
        sortOrder: Record<string, 1 | -1>;
        page: number;
        limit: number;
        isAdoptionAvailable?: boolean;
    } {
        const {
            petType,
            breeds,
            province,
            city,
            isAdoptionAvailable,
            breederLevel,
            sortBy,
            page = 1,
            limit = 20,
        } = searchDto;

        const filter: Record<string, unknown> = {
            'verification.status': 'approved',
            accountStatus: 'active',
            petType,
            isTestAccount: { $ne: true },
        };

        if (breeds && breeds.length > 0) {
            filter['breeds'] = { $in: breeds };
        }

        if (province && province.length > 0 && city && city.length > 0) {
            filter['$and'] = [
                { 'profile.location.city': { $in: province } },
                { 'profile.location.district': { $in: city } },
            ];
        } else if (province && province.length > 0) {
            filter['profile.location.city'] = { $in: province };
        } else if (city && city.length > 0) {
            filter['profile.location.district'] = { $in: city };
        }

        if (breederLevel && breederLevel.length > 0) {
            filter['verification.level'] = { $in: breederLevel };
        }

        let sortOrder: Record<string, 1 | -1>;
        switch (sortBy) {
            case BreederSortBy.FAVORITE:
                sortOrder = { 'stats.totalFavorites': -1 };
                break;
            case BreederSortBy.REVIEW:
                sortOrder = { 'stats.totalReviews': -1 };
                break;
            case BreederSortBy.PRICE_ASC:
                sortOrder = { 'profile.priceRange.min': 1 };
                break;
            case BreederSortBy.PRICE_DESC:
                sortOrder = { 'profile.priceRange.max': -1 };
                break;
            case BreederSortBy.LATEST:
            default:
                sortOrder = { createdAt: -1 };
                break;
        }

        return {
            filter,
            sortOrder,
            page,
            limit,
            isAdoptionAvailable,
        };
    }
}
