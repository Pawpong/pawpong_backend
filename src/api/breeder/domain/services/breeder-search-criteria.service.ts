import { Injectable } from '@nestjs/common';

import { PetType } from '../../../../common/enum/user.enum';
import { BreederSearchRequestDto } from '../../dto/request/breeder-search-request.dto';

@Injectable()
export class BreederSearchCriteriaService {
    build(searchDto: BreederSearchRequestDto): {
        filter: Record<string, unknown>;
        sortOrder: Record<string, 1 | -1>;
    } {
        const filter: Record<string, unknown> = {
            'verification.status': 'approved',
            status: 'active',
        };

        if (searchDto.petType) {
            filter['profile.specialization'] = searchDto.petType as PetType;
        }

        if (searchDto.cityName) {
            filter['profile.location.city'] = searchDto.cityName;
        }

        if (searchDto.districtName) {
            filter['profile.location.district'] = searchDto.districtName;
        }

        if (searchDto.isImmediatelyAvailable) {
            filter['availablePets.status'] = 'available';
        }

        if (searchDto.breedName) {
            filter['availablePets.breed'] = new RegExp(searchDto.breedName, 'i');
        }

        if (searchDto.minPrice !== undefined || searchDto.maxPrice !== undefined) {
            const priceFilter: Record<string, number> = {};
            if (searchDto.minPrice !== undefined) {
                priceFilter.$gte = searchDto.minPrice;
            }
            if (searchDto.maxPrice !== undefined) {
                priceFilter.$lte = searchDto.maxPrice;
            }
            filter['profile.priceRange.min'] = priceFilter;
        }

        let sortOrder: Record<string, 1 | -1> = { 'stats.averageRating': -1 };
        switch (searchDto.sortCriteria) {
            case 'experience':
                sortOrder = { 'profile.experienceYears': -1 };
                break;
            case 'recent':
                sortOrder = { createdAt: -1 };
                break;
            case 'applications':
                sortOrder = { 'stats.totalApplications': -1 };
                break;
        }

        return { filter, sortOrder };
    }
}
