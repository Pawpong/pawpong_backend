export type UploadAdminReferencedBreederDocumentRecord = {
    profileImageFileName?: string;
    profile?: {
        representativePhotos?: string[];
    };
    verification?: {
        documents?: Array<{
            fileName?: string;
        }>;
    };
};

export type UploadAdminReferencedAvailablePetDocumentRecord = {
    photos?: string[];
};

export type UploadAdminReferencedParentPetDocumentRecord = {
    photoFileName?: string;
};

export type UploadAdminReferencedAdopterDocumentRecord = {
    profileImageFileName?: string;
};

export type UploadAdminReferencedBannerDocumentRecord = {
    desktopImageFileName?: string;
    mobileImageFileName?: string;
    imageFileName?: string;
};

export type UploadAdminReferencedSingleImageBannerDocumentRecord = {
    imageFileName?: string;
};
