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

@Injectable()
export class UploadAdminFileReferenceRepository {
    constructor(
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        @InjectModel(ParentPet.name) private readonly parentPetModel: Model<ParentPetDocument>,
        @InjectModel(AvailablePet.name) private readonly availablePetModel: Model<AvailablePetDocument>,
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(Banner.name) private readonly bannerModel: Model<BannerDocument>,
        @InjectModel(AuthBanner.name) private readonly authBannerModel: Model<AuthBannerDocument>,
        @InjectModel(CounselBanner.name) private readonly counselBannerModel: Model<CounselBannerDocument>,
    ) {}

    countBreederProfileImages(fileKey: string): Promise<number> {
        return this.breederModel.countDocuments({ profileImageFileName: fileKey });
    }

    countBreederRepresentativePhotos(fileKey: string): Promise<number> {
        return this.breederModel.countDocuments({ 'profile.representativePhotos': fileKey });
    }

    countBreederVerificationDocuments(fileKey: string): Promise<number> {
        return this.breederModel.countDocuments({ 'verification.documents.fileName': fileKey });
    }

    countAvailablePetPhotos(fileKey: string): Promise<number> {
        return this.availablePetModel.countDocuments({ photos: fileKey });
    }

    countParentPetPhotoFile(fileKey: string): Promise<number> {
        return this.parentPetModel.countDocuments({ photoFileName: fileKey });
    }

    countAdopterProfileImages(fileKey: string): Promise<number> {
        return this.adopterModel.countDocuments({ profileImageFileName: fileKey });
    }

    countBannerImages(fileKey: string): Promise<number> {
        return this.bannerModel.countDocuments({
            $or: [{ desktopImageFileName: fileKey }, { mobileImageFileName: fileKey }, { imageFileName: fileKey }],
        });
    }

    countAuthBannerImages(fileKey: string): Promise<number> {
        return this.authBannerModel.countDocuments({ imageFileName: fileKey });
    }

    countCounselBannerImages(fileKey: string): Promise<number> {
        return this.counselBannerModel.countDocuments({ imageFileName: fileKey });
    }

    async readBreederReferencedFiles(): Promise<string[]> {
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

        const files = new Set<string>();
        for (const breeder of breeders as any[]) {
            if (breeder.profileImageFileName) {
                files.add(breeder.profileImageFileName);
            }
            if (breeder.profile?.representativePhotos) {
                breeder.profile.representativePhotos.forEach((photo: string) => files.add(photo));
            }
            if (breeder.verification?.documents) {
                breeder.verification.documents.forEach((document: { fileName?: string }) => {
                    if (document.fileName) {
                        files.add(document.fileName);
                    }
                });
            }
        }

        return Array.from(files);
    }

    async readAvailablePetPhotoFiles(): Promise<string[]> {
        const pets = await this.availablePetModel.find({ photos: { $exists: true, $ne: [] } }).select('photos').lean().exec();
        return pets.flatMap((pet: any) => pet.photos || []);
    }

    async readParentPetPhotoFiles(): Promise<string[]> {
        const parentPets = await this.parentPetModel
            .find({ photoFileName: { $exists: true, $nin: [null, ''] } })
            .select('photoFileName')
            .lean()
            .exec();

        return parentPets.flatMap((parentPet: any) => (parentPet.photoFileName ? [parentPet.photoFileName] : []));
    }

    async readAdopterProfileImageFiles(): Promise<string[]> {
        const adopters = await this.adopterModel
            .find({ profileImageFileName: { $exists: true, $nin: [null, ''] } })
            .select('profileImageFileName')
            .lean()
            .exec();

        return adopters.flatMap((adopter: any) => (adopter.profileImageFileName ? [adopter.profileImageFileName] : []));
    }

    async readBannerImageFiles(): Promise<string[]> {
        const banners = await this.bannerModel
            .find()
            .select('desktopImageFileName mobileImageFileName imageFileName')
            .lean()
            .exec();

        const files = new Set<string>();
        for (const banner of banners as any[]) {
            if (banner.desktopImageFileName) files.add(banner.desktopImageFileName);
            if (banner.mobileImageFileName) files.add(banner.mobileImageFileName);
            if (banner.imageFileName) files.add(banner.imageFileName);
        }

        return Array.from(files);
    }

    async readAuthBannerImageFiles(): Promise<string[]> {
        const banners = await this.authBannerModel.find().select('imageFileName').lean().exec();
        return banners.flatMap((banner: any) => (banner.imageFileName ? [banner.imageFileName] : []));
    }

    async readCounselBannerImageFiles(): Promise<string[]> {
        const banners = await this.counselBannerModel.find().select('imageFileName').lean().exec();
        return banners.flatMap((banner: any) => (banner.imageFileName ? [banner.imageFileName] : []));
    }
}
