export type BreederManagementParentPetCreateCommand = {
    name: string;
    breed: string;
    gender: string;
    birthDate: string;
    photoFileName?: string;
    description?: string;
    photos?: string[];
};

export type BreederManagementParentPetUpdateCommand = {
    name?: string;
    breed?: string;
    gender?: string;
    birthDate?: string;
    photoFileName?: string;
    description?: string;
    photos?: string[];
};
