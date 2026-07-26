export type CreateBreedCommand = {
    petType: string;
    category: string;
    categoryDescription?: string;
    breeds: string[];
};

export type UpdateBreedCommand = {
    category?: string;
    categoryDescription?: string;
    breeds?: string[];
};
