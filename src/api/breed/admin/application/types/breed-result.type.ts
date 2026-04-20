export type BreedAdminItemResult = {
    id: string;
    petType: string;
    category: string;
    categoryDescription?: string;
    breeds: string[];
    createdAt: Date;
    updatedAt: Date;
};
