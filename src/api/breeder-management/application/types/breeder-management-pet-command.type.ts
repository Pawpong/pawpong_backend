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

export type BreederManagementAvailablePetParentInfoCommand = {
    mother?: string;
    father?: string;
};

export type BreederManagementAvailablePetCreateCommand = {
    name: string;
    breed: string;
    gender: string;
    birthDate: string;
    price: number;
    description?: string;
    parentInfo?: BreederManagementAvailablePetParentInfoCommand;
    photos?: string[];
};

export type BreederManagementAvailablePetUpdateCommand = Partial<BreederManagementAvailablePetCreateCommand>;
