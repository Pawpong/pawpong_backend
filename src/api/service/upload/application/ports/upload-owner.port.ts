export const UPLOAD_OWNER_PORT = Symbol('UPLOAD_OWNER_PORT');

export interface UploadPhotoTarget {
    readonly photoPaths: string[];
}

export interface UploadOwnerPort {
    replaceRepresentativePhotos(breederId: string, photoPaths: string[]): Promise<void>;
    findOwnedAvailablePet(petId: string, breederId: string): Promise<UploadPhotoTarget | null>;
    replaceAvailablePetPhotos(petId: string, breederId: string, photoPaths: string[]): Promise<void>;
    findOwnedParentPet(petId: string, breederId: string): Promise<UploadPhotoTarget | null>;
    replaceParentPetPhotos(petId: string, breederId: string, photoPaths: string[]): Promise<void>;
}
