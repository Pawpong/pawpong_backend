export type HomeObjectIdLike = {
    toString(): string;
};

export type HomeAvailablePetBreederDocumentRecord = {
    _id: HomeObjectIdLike;
    name?: string;
    profile?: {
        location?: {
            city?: string;
            district?: string;
        };
    };
};

export type HomeAvailablePetDocumentRecord = {
    _id: HomeObjectIdLike;
    name: string;
    breed: string;
    price?: number;
    photos?: string[];
    birthDate?: Date | null;
    breederId?: HomeAvailablePetBreederDocumentRecord;
};
