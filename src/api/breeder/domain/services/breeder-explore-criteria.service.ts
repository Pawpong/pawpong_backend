import { Injectable } from '@nestjs/common';

import { BreederSortBy } from '../../constants/breeder-search.enum';
import type { BreederExploreQuery } from '../../application/types/breeder-search-query.type';

@Injectable()
export class BreederExploreCriteriaService {
    build(searchDto: BreederExploreQuery): {
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
            isTestAccount: { $ne: true },
        };

        // petType은 값이 있을 때만 필터에 추가한다.
        // (undefined를 그대로 넣으면 드라이버가 { petType: null }로 변환해
        //  petType이 설정된 브리더가 전부 제외되어 결과가 0건이 되는 버그가 있었음)
        if (petType) {
            filter['petType'] = petType;
        }

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
