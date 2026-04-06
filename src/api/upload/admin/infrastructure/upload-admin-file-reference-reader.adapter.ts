import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../../schema/adopter.schema';
import { AuthBanner, AuthBannerDocument } from '../../../../schema/auth-banner.schema';
import { AvailablePet, AvailablePetDocument } from '../../../../schema/available-pet.schema';
import { Banner, BannerDocument } from '../../../../schema/banner.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import { CounselBanner, CounselBannerDocument } from '../../../../schema/counsel-banner.schema';
import { ParentPet, ParentPetDocument } from '../../../../schema/parent-pet.schema';
import { UploadAdminFileReferenceSnapshot, UploadAdminReferenceReaderPort } from '../application/ports/upload-admin-reference-reader.port';

@Injectable()
export class UploadAdminFileReferenceReaderAdapter implements UploadAdminReferenceReaderPort {
    constructor(
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        @InjectModel(ParentPet.name) private readonly parentPetModel: Model<ParentPetDocument>,
        @InjectModel(AvailablePet.name) private readonly availablePetModel: Model<AvailablePetDocument>,
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(Banner.name) private readonly bannerModel: Model<BannerDocument>,
        @InjectModel(AuthBanner.name) private readonly authBannerModel: Model<AuthBannerDocument>,
        @InjectModel(CounselBanner.name) private readonly counselBannerModel: Model<CounselBannerDocument>,
    ) {}

    async findReferences(fileKey: string): Promise<UploadAdminFileReferenceSnapshot[]> {
        const references: UploadAdminFileReferenceSnapshot[] = [];

        await this.pushReferenceIfExists(
            references,
            await this.breederModel.countDocuments({ profileImageFileName: fileKey }),
            'breeders',
            'profileImageFileName',
        );
        await this.pushReferenceIfExists(
            references,
            await this.breederModel.countDocuments({ 'profile.representativePhotos': fileKey }),
            'breeders',
            'profile.representativePhotos',
        );
        await this.pushReferenceIfExists(
            references,
            await this.breederModel.countDocuments({ 'verification.documents.fileName': fileKey }),
            'breeders',
            'verification.documents',
        );
        await this.pushReferenceIfExists(
            references,
            await this.availablePetModel.countDocuments({ photos: fileKey }),
            'available_pets',
            'photos',
        );
        await this.pushReferenceIfExists(
            references,
            await this.parentPetModel.countDocuments({ photoFileName: fileKey }),
            'parent_pets',
            'photoFileName',
        );
        await this.pushReferenceIfExists(
            references,
            await this.adopterModel.countDocuments({ profileImageFileName: fileKey }),
            'adopters',
            'profileImageFileName',
        );
        await this.pushReferenceIfExists(
            references,
            await this.bannerModel.countDocuments({
                $or: [{ desktopImageFileName: fileKey }, { mobileImageFileName: fileKey }, { imageFileName: fileKey }],
            }),
            'banners',
            'imageFileName',
        );
        await this.pushReferenceIfExists(
            references,
            await this.authBannerModel.countDocuments({ imageFileName: fileKey }),
            'auth_banners',
            'imageFileName',
        );
        await this.pushReferenceIfExists(
            references,
            await this.counselBannerModel.countDocuments({ imageFileName: fileKey }),
            'counsel_banners',
            'imageFileName',
        );

        return references;
    }

    async readAllReferencedFiles(): Promise<string[]> {
        const referencedFiles = new Set<string>();

        const breeders = await this.breederModel
            .find({
                $or: [
                    { profileImageFileName: { $exists: true, $nin: [null, ''] } },
                    { 'profile.representativePhotos.0': { $exists: true } },
                    { 'verification.documents.0': { $exists: true } },
                ],
            })
            .select('profileImageFileName profile.representativePhotos verification.documents')
            .lean()
            .exec();

        for (const breeder of breeders as any[]) {
            if (breeder.profileImageFileName) {
                referencedFiles.add(breeder.profileImageFileName);
            }
            if (breeder.profile?.representativePhotos) {
                breeder.profile.representativePhotos.forEach((photo: string) => referencedFiles.add(photo));
            }
            if (breeder.verification?.documents) {
                breeder.verification.documents.forEach((document: { fileName?: string }) => {
                    if (document.fileName) {
                        referencedFiles.add(document.fileName);
                    }
                });
            }
        }

        const pets = await this.availablePetModel
            .find({
                photos: { $exists: true, $ne: [] },
            })
            .select('photos')
            .lean()
            .exec();

        for (const pet of pets as any[]) {
            if (pet.photos) {
                pet.photos.forEach((photo: string) => referencedFiles.add(photo));
            }
        }

        const parentPets = await this.parentPetModel
            .find({
                photoFileName: { $exists: true, $nin: [null, ''] },
            })
            .select('photoFileName')
            .lean()
            .exec();

        for (const parentPet of parentPets as any[]) {
            if (parentPet.photoFileName) {
                referencedFiles.add(parentPet.photoFileName);
            }
        }

        const adopters = await this.adopterModel
            .find({
                profileImageFileName: { $exists: true, $nin: [null, ''] },
            })
            .select('profileImageFileName')
            .lean()
            .exec();

        for (const adopter of adopters as any[]) {
            if (adopter.profileImageFileName) {
                referencedFiles.add(adopter.profileImageFileName);
            }
        }

        const banners = await this.bannerModel
            .find()
            .select('desktopImageFileName mobileImageFileName imageFileName')
            .lean()
            .exec();

        for (const banner of banners as any[]) {
            if (banner.desktopImageFileName) referencedFiles.add(banner.desktopImageFileName);
            if (banner.mobileImageFileName) referencedFiles.add(banner.mobileImageFileName);
            if (banner.imageFileName) referencedFiles.add(banner.imageFileName);
        }

        const authBanners = await this.authBannerModel.find().select('imageFileName').lean().exec();

        for (const banner of authBanners as any[]) {
            if (banner.imageFileName) {
                referencedFiles.add(banner.imageFileName);
            }
        }

        const counselBanners = await this.counselBannerModel.find().select('imageFileName').lean().exec();

        for (const banner of counselBanners as any[]) {
            if (banner.imageFileName) {
                referencedFiles.add(banner.imageFileName);
            }
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
