import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { StorageService } from '../../common/storage/storage.service';

import { Breeder, BreederDocument } from '../../schema/breeder.schema';
import { ParentPet, ParentPetDocument } from '../../schema/parent-pet.schema';
import { AvailablePet, AvailablePetDocument } from '../../schema/available-pet.schema';

import { UploadResponseDto } from './dto/response/upload-response.dto';

@Injectable()
export class UploadService {
    // 허용되는 이미지 MIME 타입 (HEIF/HEIC 포함)
    private readonly allowedImageMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/heif',
        'image/heic',
    ];

    // 허용되는 영상 MIME 타입
    private readonly allowedVideoMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

    // 허용되는 미디어 MIME 타입 (이미지 + 영상)
    private readonly allowedMediaMimeTypes = [...this.allowedImageMimeTypes, ...this.allowedVideoMimeTypes];

    // 파일 크기 제한
    private readonly IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
    private readonly VIDEO_MAX_SIZE = 20 * 1024 * 1024; // 20MB

    constructor(
        private readonly storageService: StorageService,

        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
        @InjectModel(AvailablePet.name) private availablePetModel: Model<AvailablePetDocument>,
        @InjectModel(ParentPet.name) private parentPetModel: Model<ParentPetDocument>,
    ) {}

    /**
     * 대표 사진 업로드
     * 브리더의 대표 사진을 업로드하고 자동으로 DB에 저장합니다. (최대 3장, 각 5MB)
     */
    async uploadRepresentativePhotos(files: Express.Multer.File[], user: any): Promise<UploadResponseDto[]> {
        // 파일 존재 여부 검증
        if (!files || files.length === 0) {
            throw new BadRequestException('파일이 업로드되지 않았습니다.');
        }

        // 권한 검증
        if (user.role !== 'breeder') {
            throw new ForbiddenException('브리더만 대표 사진을 업로드할 수 있습니다.');
        }

        // 파일 개수 검증 (최대 3장)
        if (files.length > 3) {
            throw new BadRequestException('대표 사진은 최대 3장까지 업로드 가능합니다.');
        }

        // 각 파일 크기 및 타입 검증
        for (const file of files) {
            this.validateMediaFile(file);
        }

        // 스토리지 업로드
        const results = await this.storageService.uploadMultipleFiles(files, 'representative');
        const fileNames = results.map((r) => r.fileName);

        // DB 업데이트: profile.representativePhotos 배열에 추가
        await this.breederModel.findByIdAndUpdate(user.userId, {
            $set: { 'profile.representativePhotos': fileNames },
        });

        // 응답 DTO 생성
        return results.map((result, index) => new UploadResponseDto(result.cdnUrl, result.fileName, files[index].size));
    }

    /**
     * 분양 개체 사진 다중 업로드
     * 분양 개체의 사진을 업로드하고 자동으로 DB에 저장합니다. (최대 4장)
     * 기존 사진 URL과 새 파일을 함께 받아서 전체 교체합니다.
     */
    async uploadAvailablePetPhotosMultiple(
        petId: string,
        files: Express.Multer.File[],
        existingPhotos: string[],
        user: any,
    ): Promise<UploadResponseDto[]> {
        // 권한 검증
        if (user.role !== 'breeder') {
            throw new ForbiddenException('브리더만 분양 개체 사진을 업로드할 수 있습니다.');
        }

        // 해당 petId가 본인 소유인지 확인
        const pet = await this.availablePetModel.findOne({
            _id: new Types.ObjectId(petId),
            breederId: new Types.ObjectId(user.userId),
        });
        if (!pet) {
            throw new BadRequestException('해당 분양 개체를 찾을 수 없습니다.');
        }

        // 기존 사진 URL에서 파일명 추출 (Signed URL에서 파일 경로만 추출)
        const existingFileNamesFromRequest = existingPhotos
            .map((url) => this.extractFileNameFromUrl(url))
            .filter(Boolean);

        // DB에서 기존 photos 배열 가져오기 (대표사진 보존을 위해)
        const existingFileNamesFromDB = (pet.photos || []).map((fileName: string) => fileName);

        // 요청에서 온 기존 사진과 DB의 기존 사진을 병합
        // DB의 기존 사진을 우선시하여 대표사진(첫 번째)이 보존되도록 함
        const existingFileNames =
            existingFileNamesFromRequest.length > 0
                ? existingFileNamesFromRequest // 프론트엔드에서 명시적으로 보낸 경우
                : existingFileNamesFromDB; // 프론트엔드에서 보내지 않은 경우 DB 값 사용

        // 전체 개수 검증 (기존 + 새 파일 = 최대 4장)
        const totalCount = existingFileNames.length + (files?.length || 0);
        if (totalCount > 4) {
            throw new BadRequestException(`사진은 최대 4장까지 업로드 가능합니다. (현재: ${totalCount}장)`);
        }

        // 새 파일 업로드
        let newFileNames: string[] = [];
        let results: { cdnUrl: string; fileName: string }[] = [];
        if (files && files.length > 0) {
            // 각 파일 크기 및 타입 검증
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // 대표 사진(첫 번째 사진)은 이미지만 허용, 추가 사진은 동영상도 허용
                if (existingFileNames.length === 0 && i === 0) {
                    // 첫 번째 업로드 = 대표 사진 → 이미지만
                    this.validateImageFile(file);
                } else {
                    // 추가 사진 → 이미지/동영상 모두 허용
                    this.validateMediaFile(file);
                }
            }
            results = await this.storageService.uploadMultipleFiles(files, 'pets/available');
            newFileNames = results.map((r) => r.fileName);
        }

        // 기존 파일명 + 새 파일명 합치기
        const allFileNames = [...existingFileNames, ...newFileNames];

        // DB 업데이트: photos 배열 전체 교체 ($set)
        await this.availablePetModel.findByIdAndUpdate(petId, {
            $set: { photos: allFileNames },
        });

        // 새로 업로드한 파일 정보만 반환
        return results.map((result, index) => new UploadResponseDto(result.cdnUrl, result.fileName, files[index].size));
    }

    /**
     * 부모견/묘 사진 다중 업로드
     * 부모견/묘의 사진을 업로드하고 자동으로 DB에 저장합니다. (최대 4장)
     * 기존 사진 URL과 새 파일을 함께 받아서 전체 교체합니다.
     */
    async uploadParentPetPhotosMultiple(
        petId: string,
        files: Express.Multer.File[],
        existingPhotos: string[],
        user: any,
    ): Promise<UploadResponseDto[]> {
        // 권한 검증
        if (user.role !== 'breeder') {
            throw new ForbiddenException('브리더만 부모견/묘 사진을 업로드할 수 있습니다.');
        }

        // 해당 petId가 본인 소유인지 확인
        const pet = await this.parentPetModel.findOne({
            _id: new Types.ObjectId(petId),
            breederId: new Types.ObjectId(user.userId),
        });
        if (!pet) {
            throw new BadRequestException('해당 부모견/묘를 찾을 수 없습니다.');
        }

        // 기존 사진 URL에서 파일명 추출 (Signed URL에서 파일 경로만 추출)
        const existingFileNamesFromRequest = existingPhotos
            .map((url) => this.extractFileNameFromUrl(url))
            .filter(Boolean);

        // DB에서 기존 photos 배열 가져오기 (프론트에서 existingPhotos 누락/불완전 시 보존용)
        const existingFileNamesFromDB = (pet.photos || []).map((fileName: string) => fileName);

        // 요청에서 온 기존 사진과 DB의 기존 사진 병합: 프론트가 명시적으로 보냈으면 사용, 없으면 DB 값 사용
        const existingFileNames =
            existingFileNamesFromRequest.length > 0 ? existingFileNamesFromRequest : existingFileNamesFromDB;

        // 전체 개수 검증 (기존 + 새 파일 = 최대 4장)
        const totalCount = existingFileNames.length + (files?.length || 0);
        if (totalCount > 4) {
            throw new BadRequestException(`사진은 최대 4장까지 업로드 가능합니다. (현재: ${totalCount}장)`);
        }

        // 새 파일 업로드
        let newFileNames: string[] = [];
        let results: { cdnUrl: string; fileName: string }[] = [];
        if (files && files.length > 0) {
            // 각 파일 크기 및 타입 검증
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // 대표 사진(첫 번째 사진)은 이미지만 허용, 추가 사진은 동영상도 허용
                if (existingFileNames.length === 0 && i === 0) {
                    // 첫 번째 업로드 = 대표 사진 → 이미지만
                    this.validateImageFile(file);
                } else {
                    // 추가 사진 → 이미지/동영상 모두 허용
                    this.validateMediaFile(file);
                }
            }
            results = await this.storageService.uploadMultipleFiles(files, 'pets/parent');
            newFileNames = results.map((r) => r.fileName);
        }

        // 기존 파일명 + 새 파일명 합치기
        const allFileNames = [...existingFileNames, ...newFileNames];

        // DB 업데이트: photos 배열 전체 교체 ($set)
        // 첫 번째 사진은 photoFileName에도 저장 (대표사진)
        const updateData: { photos: string[]; photoFileName?: string } = {
            photos: allFileNames,
            ...(allFileNames.length > 0 && { photoFileName: allFileNames[0] }),
        };

        await this.parentPetModel.findByIdAndUpdate(petId, {
            $set: updateData,
        });

        // 새로 업로드한 파일 정보만 반환
        return results.map((result, index) => new UploadResponseDto(result.cdnUrl, result.fileName, files[index].size));
    }

    /**
     * 단일 파일 업로드
     * 단일 파일을 Google Cloud Storage에 업로드합니다.
     */
    async uploadSingle(file: Express.Multer.File, folder?: string): Promise<UploadResponseDto> {
        // 파일 존재 여부 검증
        if (!file) {
            throw new BadRequestException('파일이 없습니다.');
        }

        const result = await this.storageService.uploadFile(file, folder);

        return new UploadResponseDto(result.cdnUrl, result.fileName, file.size);
    }

    /**
     * 다중 파일 업로드
     * 다중 파일을 Google Cloud Storage에 업로드합니다. (최대 10개)
     */
    async uploadMultiple(files: Express.Multer.File[], folder?: string): Promise<UploadResponseDto[]> {
        // 파일 존재 여부 검증
        if (!files || files.length === 0) {
            throw new BadRequestException('파일이 없습니다.');
        }

        const results = await this.storageService.uploadMultipleFiles(files, folder);

        return results.map((result, index) => new UploadResponseDto(result.cdnUrl, result.fileName, files[index].size));
    }

    /**
     * 파일 삭제
     * Google Cloud Storage에서 파일을 삭제합니다.
     */
    async deleteFile(fileName: string): Promise<void> {
        // 파일명 존재 여부 검증
        if (!fileName) {
            throw new BadRequestException('파일명이 없습니다.');
        }

        await this.storageService.deleteFile(fileName);
    }

    /**
     * 미디어 파일 검증 (이미지/영상)
     * 이미지: 최대 5MB, 영상: 최대 20MB
     */
    private validateMediaFile(file: Express.Multer.File): void {
        const isVideo = this.allowedVideoMimeTypes.includes(file.mimetype);
        const isImage = this.allowedImageMimeTypes.includes(file.mimetype);

        if (!isVideo && !isImage) {
            throw new BadRequestException(
                '이미지 또는 영상 파일만 업로드 가능합니다. (jpg, jpeg, png, gif, webp, heif, heic, mp4, mov, avi, webm)',
            );
        }

        if (isVideo && file.size > this.VIDEO_MAX_SIZE) {
            throw new BadRequestException('영상 파일 크기는 20MB를 초과할 수 없습니다.');
        }

        if (isImage && file.size > this.IMAGE_MAX_SIZE) {
            throw new BadRequestException('이미지 파일 크기는 5MB를 초과할 수 없습니다.');
        }
    }

    /**
     * 이미지 파일만 검증 (동영상 차단)
     * 이미지: 최대 5MB
     */
    private validateImageFile(file: Express.Multer.File): void {
        const isImage = this.allowedImageMimeTypes.includes(file.mimetype);

        if (!isImage) {
            throw new BadRequestException(
                '이미지 파일만 업로드 가능합니다. 동영상은 업로드할 수 없습니다. (jpg, jpeg, png, gif, webp, heif, heic)',
            );
        }

        if (file.size > this.IMAGE_MAX_SIZE) {
            throw new BadRequestException('이미지 파일 크기는 5MB를 초과할 수 없습니다.');
        }
    }

    /**
     * Signed URL에서 파일 경로(파일명) 추출
     * URL 형식: https://cdn.pawpong.kr/pets/available/uuid.jpeg?Expires=...
     * 결과: pets/available/uuid.jpeg
     */
    private extractFileNameFromUrl(url: string): string {
        if (!url) return '';

        try {
            // 이미 파일 경로 형식이면 그대로 반환 (예: pets/available/uuid.jpeg)
            if (!url.startsWith('http')) {
                return url;
            }

            const urlObj = new URL(url);
            // pathname은 /pets/available/uuid.jpeg 형식
            // 맨 앞의 / 제거하여 pets/available/uuid.jpeg 형태로 만듦
            const filePath = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
            return filePath || '';
        } catch {
            // URL 파싱 실패 시 원본 반환 (이미 파일명인 경우)
            return url;
        }
    }
}
