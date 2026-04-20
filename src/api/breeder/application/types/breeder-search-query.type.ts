import { BreederLevel, FurLength, PetSize, PetType } from '../../../../common/enum/user.enum';
import { BreederSortBy, SortCriteria } from '../../constants/breeder-search.enum';

export type BreederSearchQuery = {
    petType?: PetType | string;
    breedName?: string;
    cityName?: string;
    districtName?: string;
    isImmediatelyAvailable?: boolean;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sortCriteria?: SortCriteria | string;
};

export type BreederExploreQuery = {
    petType: PetType | string;
    dogSize?: Array<PetSize | string>;
    catFurLength?: Array<FurLength | string>;
    breeds?: string[];
    province?: string[];
    city?: string[];
    isAdoptionAvailable?: boolean;
    breederLevel?: Array<BreederLevel | string>;
    sortBy?: BreederSortBy | string;
    page?: number;
    limit?: number;
};
