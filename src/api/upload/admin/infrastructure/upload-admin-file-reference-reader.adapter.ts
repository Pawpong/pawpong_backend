import { Injectable } from '@nestjs/common';
import {
    UploadAdminFileReferenceSnapshot,
    UploadAdminReferenceReaderPort,
} from '../application/ports/upload-admin-reference-reader.port';
import { UploadAdminFileReferenceRepository } from '../repository/upload-admin-file-reference.repository';

@Injectable()
export class UploadAdminFileReferenceReaderAdapter implements UploadAdminReferenceReaderPort {
    constructor(private readonly uploadAdminFileReferenceRepository: UploadAdminFileReferenceRepository) {}

    async findReferences(fileKey: string): Promise<UploadAdminFileReferenceSnapshot[]> {
        const references: UploadAdminFileReferenceSnapshot[] = [];

        await this.pushReferenceIfExists(
            references,
            await this.uploadAdminFileReferenceRepository.countBreederProfileImages(fileKey),
            'breeders',
            'profileImageFileName',
        );
        await this.pushReferenceIfExists(
            references,
            await this.uploadAdminFileReferenceRepository.countBreederRepresentativePhotos(fileKey),
            'breeders',
            'profile.representativePhotos',
        );
        await this.pushReferenceIfExists(
            references,
            await this.uploadAdminFileReferenceRepository.countBreederVerificationDocuments(fileKey),
            'breeders',
            'verification.documents',
        );
        await this.pushReferenceIfExists(
            references,
            await this.uploadAdminFileReferenceRepository.countAvailablePetPhotos(fileKey),
            'available_pets',
            'photos',
        );
        await this.pushReferenceIfExists(
            references,
            await this.uploadAdminFileReferenceRepository.countParentPetPhotoFile(fileKey),
            'parent_pets',
            'photoFileName',
        );
        await this.pushReferenceIfExists(
            references,
            await this.uploadAdminFileReferenceRepository.countAdopterProfileImages(fileKey),
            'adopters',
            'profileImageFileName',
        );
        await this.pushReferenceIfExists(
            references,
            await this.uploadAdminFileReferenceRepository.countBannerImages(fileKey),
            'banners',
            'imageFileName',
        );
        await this.pushReferenceIfExists(
            references,
            await this.uploadAdminFileReferenceRepository.countAuthBannerImages(fileKey),
            'auth_banners',
            'imageFileName',
        );
        await this.pushReferenceIfExists(
            references,
            await this.uploadAdminFileReferenceRepository.countCounselBannerImages(fileKey),
            'counsel_banners',
            'imageFileName',
        );

        return references;
    }

    async readAllReferencedFiles(): Promise<string[]> {
        const referencedFiles = new Set<string>();

        const fileGroups = await Promise.all([
            this.uploadAdminFileReferenceRepository.readBreederReferencedFiles(),
            this.uploadAdminFileReferenceRepository.readAvailablePetPhotoFiles(),
            this.uploadAdminFileReferenceRepository.readParentPetPhotoFiles(),
            this.uploadAdminFileReferenceRepository.readAdopterProfileImageFiles(),
            this.uploadAdminFileReferenceRepository.readBannerImageFiles(),
            this.uploadAdminFileReferenceRepository.readAuthBannerImageFiles(),
            this.uploadAdminFileReferenceRepository.readCounselBannerImageFiles(),
        ]);

        for (const files of fileGroups) {
            files.forEach((file) => referencedFiles.add(file));
        }

        return Array.from(referencedFiles);
    }

    private async pushReferenceIfExists(
        references: UploadAdminFileReferenceSnapshot[],
        count: number,
        collection: string,
        field: string,
    ): Promise<void> {
        if (count > 0) {
            references.push({ collection, field, count });
        }
    }
}
