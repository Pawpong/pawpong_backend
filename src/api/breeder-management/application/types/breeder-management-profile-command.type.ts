import { PetType, PriceDisplayType } from '../../../../common/enum/user.enum';

export type BreederManagementLocationUpdateCommand = {
    cityName: string;
    districtName: string;
    detailAddress?: string;
};

export type BreederManagementPriceRangeUpdateCommand = {
    minimumPrice: number;
    maximumPrice: number;
    display?: PriceDisplayType;
};

export type BreederManagementProfileUpdateCommand = {
    profileDescription?: string;
    locationInfo?: BreederManagementLocationUpdateCommand;
    profilePhotos?: string[];
    priceRangeInfo?: BreederManagementPriceRangeUpdateCommand;
    specializationTypes?: PetType[];
    breeds?: string[];
    experienceYears?: number;
    profileImage?: string;
    marketingAgreed?: boolean;
    consultationAgreed?: boolean;
};
