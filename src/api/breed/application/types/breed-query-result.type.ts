export type BreedCategoryResult = {
    category: string;
    categoryDescription?: string;
    breeds: string[];
};

export type GetBreedsResult = {
    petType: string;
    categories: BreedCategoryResult[];
};
