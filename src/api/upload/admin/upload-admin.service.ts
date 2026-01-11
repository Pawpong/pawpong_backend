import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { StorageService } from '../../../common/storage/storage.service';
import { CustomLoggerService } from '../../../common/logger/custom-logger.service';

import { Banner, BannerDocument } from '../../../schema/banner.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';
import { ParentPet, ParentPetDocument } from '../../../schema/parent-pet.schema';
import { AuthBanner, AuthBannerDocument } from '../../../schema/auth-banner.schema';
import { AvailablePet, AvailablePetDocument } from '../../../schema/available-pet.schema';
import { CounselBanner, CounselBannerDocument } from '../../../schema/counsel-banner.schema';

import { StorageFileResponseDto } from './dto/response/storage-file-response.dto';
import { StorageListResponseDto } from './dto/response/storage-list-response.dto';
import { FileReferenceDto, FileReferenceResponseDto } from './dto/response/file-reference-response.dto';

/**
 * Admin용 스토리지 관리 서비스
 * StorageService를 활용하여 AWS S3 중복 초기화 방지
 */
@Injectable()
export class UploadAdminService {
    constructor(
        private readonly storageService: StorageService,
        private readonly logger: CustomLoggerService,
        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
        @InjectModel(ParentPet.name) private parentPetModel: Model<ParentPetDocument>,
        @InjectModel(AvailablePet.name) private availablePetModel: Model<AvailablePetDocument>,
        @InjectModel(Adopter.name) private adopterModel: Model<AdopterDocument>,
        @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
        @InjectModel(AuthBanner.name) private authBannerModel: Model<AuthBannerDocument>,
        @InjectModel(CounselBanner.name) private counselBannerModel: Model<CounselBannerDocument>,
    ) {}

    /**
     * 버킷 내 전체 파일 목록 조회
     */
    async listAllFiles(prefix?: string): Promise<StorageListResponseDto> {
        this.logger.logStart('listAllFiles', '스토리지 파일 목록 조회 시작', { prefix });

        try {
            const result = await this.storageService.listObjects(prefix, 1000);

            const files: StorageFileResponseDto[] =
                result.Contents?.map((item) => ({
                    key: item.Key || '',
                    size: item.Size || 0,
                    lastModified: item.LastModified || new Date(),
                    url: this.storageService.getCdnUrl(item.Key || ''),
                    folder: this.extractFolder(item.Key || ''),
                })) || [];

            const folderStats = this.calculateFolderStats(files);

            this.logger.logSuccess('listAllFiles', '파일 목록 조회 완료', {
                totalFiles: files.length,
                folders: Object.keys(folderStats).length,
            });

            return {
                files,
                totalFiles: files.length,
                folderStats,
                isTruncated: result.IsTruncated || false,
            };
        } catch (error) {
            this.logger.logError('listAllFiles', '파일 목록 조회 실패', error);
            throw new BadRequestException('파일 목록을 조회할 수 없습니다.');
        }
    }

    /**
     * 특정 폴더의 파일 목록 조회
     */
    async listFilesByFolder(folder: string): Promise<StorageListResponseDto> {
        this.logger.logStart('listFilesByFolder', '폴더별 파일 목록 조회', { folder });

        const prefix = folder.endsWith('/') ? folder : `${folder}/`;

        return this.listAllFiles(prefix);
    }

    /**
     * 파일 삭제
     */
    async deleteFile(fileName: string): Promise<void> {
        this.logger.logStart('deleteFile', '파일 삭제 시작', { fileName });

        if (!fileName) {
            throw new BadRequestException('파일명이 필요합니다.');
        }

        try {
            await this.storageService.deleteFile(fileName);
            this.logger.logSuccess('deleteFile', '파일 삭제 완료', { fileName });
        } catch (error) {
            this.logger.logError('deleteFile', '파일 삭제 실패', error);
            throw new BadRequestException('파일을 삭제할 수 없습니다.');
        }
    }

    /**
     * 다중 파일 삭제
     */
    async deleteMultipleFiles(fileNames: string[]): Promise<{ deletedCount: number; failedFiles: string[] }> {
        this.logger.logStart('deleteMultipleFiles', '다중 파일 삭제 시작', { count: fileNames.length });

        if (!fileNames || fileNames.length === 0) {
            throw new BadRequestException('삭제할 파일이 없습니다.');
        }

        const failedFiles: string[] = [];
        let deletedCount = 0;

        for (const fileName of fileNames) {
            try {
                await this.storageService.deleteFile(fileName);
                deletedCount++;
            } catch (error) {
                this.logger.logWarning('deleteMultipleFiles', `파일 삭제 실패: ${fileName}`, { error });
                failedFiles.push(fileName);
            }
        }

        this.logger.logSuccess('deleteMultipleFiles', '다중 파일 삭제 완료', {
            deletedCount,
            failedCount: failedFiles.length,
        });

        return { deletedCount, failedFiles };
    }

    /**
     * 폴더 전체 삭제
     */
    async deleteFolder(folder: string): Promise<{ deletedCount: number; failedFiles: string[] }> {
        this.logger.logStart('deleteFolder', '폴더 전체 삭제 시작', { folder });

        const { files } = await this.listFilesByFolder(folder);

        if (files.length === 0) {
            throw new BadRequestException('삭제할 파일이 없습니다.');
        }

        const fileNames = files.map((f) => f.key);
        const result = await this.deleteMultipleFiles(fileNames);

        this.logger.logSuccess('deleteFolder', '폴더 삭제 완료', result);

        return result;
    }

    /**
     * 파일 경로에서 폴더명 추출
     */
    private extractFolder(key: string): string {
        const parts = key.split('/');
        return parts.length > 1 ? parts[0] : 'root';
    }

    /**
     * 폴더별 통계 계산
     */
    private calculateFolderStats(
        files: StorageFileResponseDto[],
    ): Record<string, { count: number; totalSize: number }> {
        const stats: Record<string, { count: number; totalSize: number }> = {};

        for (const file of files) {
            const folder = file.folder;
            if (!stats[folder]) {
                stats[folder] = { count: 0, totalSize: 0 };
            }
            stats[folder].count++;
            stats[folder].totalSize += file.size;
        }

        return stats;
    }

    /**
     * 파일들의 DB 참조 여부 확인
     * 스토리지 파일이 실제 DB에서 사용 중인지 확인합니다
     */
    async checkFileReferences(fileKeys: string[]): Promise<FileReferenceResponseDto> {
        this.logger.logStart('checkFileReferences', 'DB 참조 확인 시작', { count: fileKeys.length });

        const files: FileReferenceDto[] = [];
        let referencedCount = 0;
        let orphanedCount = 0;

        for (const fileKey of fileKeys) {
            const references: { collection: string; field: string; count: number }[] = [];

            // 1. Breeder - profileImageFileName
            const breederProfileCount = await this.breederModel.countDocuments({
                profileImageFileName: fileKey,
            });
            if (breederProfileCount > 0) {
                references.push({ collection: 'breeders', field: 'profileImageFileName', count: breederProfileCount });
            }

            // 2. Breeder - profile.representativePhotos
            const breederPhotosCount = await this.breederModel.countDocuments({
                'profile.representativePhotos': fileKey,
            });
            if (breederPhotosCount > 0) {
                references.push({
                    collection: 'breeders',
                    field: 'profile.representativePhotos',
                    count: breederPhotosCount,
                });
            }

            // 3. Breeder - verification.documents.fileName
            const breederDocsCount = await this.breederModel.countDocuments({
                'verification.documents.fileName': fileKey,
            });
            if (breederDocsCount > 0) {
                references.push({
                    collection: 'breeders',
                    field: 'verification.documents',
                    count: breederDocsCount,
                });
            }

            // 4. AvailablePet - photos
            const petPhotosCount = await this.availablePetModel.countDocuments({
                photos: fileKey,
            });
            if (petPhotosCount > 0) {
                references.push({ collection: 'available_pets', field: 'photos', count: petPhotosCount });
            }

            // 5. ParentPet - photoFileName
            const parentPetCount = await this.parentPetModel.countDocuments({
                photoFileName: fileKey,
            });
            if (parentPetCount > 0) {
                references.push({ collection: 'parent_pets', field: 'photoFileName', count: parentPetCount });
            }

            // 6. Adopter - profileImageFileName
            const adopterCount = await this.adopterModel.countDocuments({
                profileImageFileName: fileKey,
            });
            if (adopterCount > 0) {
                references.push({ collection: 'adopters', field: 'profileImageFileName', count: adopterCount });
            }

            // 7. Banner - desktopImageFileName, mobileImageFileName, imageFileName
            const bannerCount = await this.bannerModel.countDocuments({
                $or: [{ desktopImageFileName: fileKey }, { mobileImageFileName: fileKey }, { imageFileName: fileKey }],
            });
            if (bannerCount > 0) {
                references.push({ collection: 'banners', field: 'imageFileName', count: bannerCount });
            }

            // 8. AuthBanner (프로필 배너) - imageFileName
            const authBannerCount = await this.authBannerModel.countDocuments({
                imageFileName: fileKey,
            });
            if (authBannerCount > 0) {
                references.push({ collection: 'auth_banners', field: 'imageFileName', count: authBannerCount });
            }

            // 9. CounselBanner - imageFileName
            const counselBannerCount = await this.counselBannerModel.countDocuments({
                imageFileName: fileKey,
            });
            if (counselBannerCount > 0) {
                references.push({ collection: 'counsel_banners', field: 'imageFileName', count: counselBannerCount });
            }

            const isReferenced = references.length > 0;
            if (isReferenced) {
                referencedCount++;
            } else {
                orphanedCount++;
            }

            files.push({
                fileKey,
                isReferenced,
                references,
            });
        }

        this.logger.logSuccess('checkFileReferences', 'DB 참조 확인 완료', {
            total: fileKeys.length,
            referenced: referencedCount,
            orphaned: orphanedCount,
        });

        return {
            files,
            referencedCount,
            orphanedCount,
        };
    }

    /**
     * 모든 DB에서 사용 중인 파일 목록 조회
     */
    async getAllReferencedFiles(): Promise<string[]> {
        this.logger.logStart('getAllReferencedFiles', 'DB 참조 파일 전체 조회 시작');

        const referencedFiles = new Set<string>();

        // 1. Breeder profileImageFileName
        const breeders = await this.breederModel
            .find({
                $or: [
                    { profileImageFileName: { $exists: true, $nin: [null, ''] } },
                    { 'profile.representativePhotos.0': { $exists: true } },
                    { 'verification.documents.0': { $exists: true } },
                ],
            })
            .select('profileImageFileName profile.representativePhotos verification.documents');

        for (const breeder of breeders) {
            if (breeder.profileImageFileName) {
                referencedFiles.add(breeder.profileImageFileName);
            }
            if (breeder.profile?.representativePhotos) {
                breeder.profile.representativePhotos.forEach((p) => referencedFiles.add(p));
            }
            if (breeder.verification?.documents) {
                breeder.verification.documents.forEach((d) => {
                    if (d.fileName) referencedFiles.add(d.fileName);
                });
            }
        }

        // 2. AvailablePet photos
        const pets = await this.availablePetModel
            .find({
                photos: { $exists: true, $ne: [] },
            })
            .select('photos');

        for (const pet of pets) {
            if (pet.photos) {
                pet.photos.forEach((p) => referencedFiles.add(p));
            }
        }

        // 3. ParentPet photoFileName
        const parentPets = await this.parentPetModel
            .find({
                photoFileName: { $exists: true, $nin: [null, ''] },
            })
            .select('photoFileName');

        for (const pp of parentPets) {
            if (pp.photoFileName) {
                referencedFiles.add(pp.photoFileName);
            }
        }

        // 4. Adopter profileImageFileName
        const adopters = await this.adopterModel
            .find({
                profileImageFileName: { $exists: true, $nin: [null, ''] },
            })
            .select('profileImageFileName');

        for (const adopter of adopters) {
            if (adopter.profileImageFileName) {
                referencedFiles.add(adopter.profileImageFileName);
            }
        }

        // 5. Banners
        const banners = await this.bannerModel.find().select('desktopImageFileName mobileImageFileName imageFileName');

        for (const banner of banners) {
            if (banner.desktopImageFileName) referencedFiles.add(banner.desktopImageFileName);
            if (banner.mobileImageFileName) referencedFiles.add(banner.mobileImageFileName);
            if (banner.imageFileName) referencedFiles.add(banner.imageFileName);
        }

        // 6. AuthBanners
        const authBanners = await this.authBannerModel.find().select('imageFileName');

        for (const ab of authBanners) {
            if (ab.imageFileName) referencedFiles.add(ab.imageFileName);
        }

        // 7. CounselBanners
        const counselBanners = await this.counselBannerModel.find().select('imageFileName');

        for (const cb of counselBanners) {
            if (cb.imageFileName) referencedFiles.add(cb.imageFileName);
        }

        const result = Array.from(referencedFiles);

        this.logger.logSuccess('getAllReferencedFiles', 'DB 참조 파일 조회 완료', {
            totalReferencedFiles: result.length,
        });

        return result;
    }
}
