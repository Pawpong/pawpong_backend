import { Injectable } from '@nestjs/common';

export type BreederLevelValue = 'elite' | 'new';
export type SortOptionValue = 'latest' | 'favorite' | 'review' | 'price_asc' | 'price_desc';
export type DogSizeValue = 'small' | 'medium' | 'large';
export type CatFurLengthValue = 'short' | 'long';

export type FilterOptionItem<T extends string | boolean> = Readonly<{
    value: T;
    label: string;
    description: string;
}>;

export type BreederLevelFilterOption = FilterOptionItem<BreederLevelValue>;
export type SortFilterOption = FilterOptionItem<SortOptionValue>;
export type DogSizeFilterOption = FilterOptionItem<DogSizeValue>;
export type CatFurLengthFilterOption = FilterOptionItem<CatFurLengthValue>;
export type AdoptionStatusFilterOption = FilterOptionItem<boolean>;

export type AllFilterOptionsSnapshot = Readonly<{
    breederLevels: BreederLevelFilterOption[];
    sortOptions: SortFilterOption[];
    dogSizes: DogSizeFilterOption[];
    catFurLengths: CatFurLengthFilterOption[];
    adoptionStatus: AdoptionStatusFilterOption[];
}>;

@Injectable()
export class FilterOptionsCatalogService {
    getAll(): AllFilterOptionsSnapshot {
        return {
            breederLevels: this.getBreederLevels(),
            sortOptions: this.getSortOptions(),
            dogSizes: this.getDogSizes(),
            catFurLengths: this.getCatFurLengths(),
            adoptionStatus: this.getAdoptionStatus(),
        };
    }

    getBreederLevels(): BreederLevelFilterOption[] {
        return [
            {
                value: 'elite',
                label: '엘리트',
                description: '인증된 전문 브리더',
            },
            {
                value: 'new',
                label: '뉴',
                description: '신규 브리더',
            },
        ];
    }

    getSortOptions(): SortFilterOption[] {
        return [
            {
                value: 'latest',
                label: '최신순',
                description: '최근 등록된 브리더순',
            },
            {
                value: 'favorite',
                label: '찜 많은순',
                description: '찜이 많은 브리더순',
            },
            {
                value: 'review',
                label: '후기 많은순',
                description: '후기가 많은 브리더순',
            },
            {
                value: 'price_asc',
                label: '오름차순',
                description: '분양가가 낮은 브리더순',
            },
            {
                value: 'price_desc',
                label: '내림차순',
                description: '분양가가 높은 브리더순',
            },
        ];
    }

    getDogSizes(): DogSizeFilterOption[] {
        return [
            {
                value: 'small',
                label: '소형견',
                description: '10kg 미만',
            },
            {
                value: 'medium',
                label: '중형견',
                description: '10kg ~ 25kg',
            },
            {
                value: 'large',
                label: '대형견',
                description: '25kg 이상',
            },
        ];
    }

    getCatFurLengths(): CatFurLengthFilterOption[] {
        return [
            {
                value: 'short',
                label: '단모',
                description: '짧은 털',
            },
            {
                value: 'long',
                label: '장모',
                description: '긴 털',
            },
        ];
    }

    getAdoptionStatus(): AdoptionStatusFilterOption[] {
        return [
            {
                value: true,
                label: '입양 가능',
                description: '현재 입양 가능한 반려동물이 있는 브리더',
            },
        ];
    }
}
