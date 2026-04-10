export type CreateDistrictCommand = {
    city: string;
    districts: string[];
};

export type UpdateDistrictCommand = {
    city?: string;
    districts?: string[];
};
