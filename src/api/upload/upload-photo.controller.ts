import { Body, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { UploadAvailablePetPhotosUseCase } from './application/use-cases/upload-available-pet-photos.use-case';
import { UploadParentPetPhotosUseCase } from './application/use-cases/upload-parent-pet-photos.use-case';
import { UploadRepresentativePhotosUseCase } from './application/use-cases/upload-representative-photos.use-case';
import { ProtectedUploadController } from './decorator/upload-controller.decorator';
import { UploadPhotoReplaceRequestDto } from './dto/request/upload-photo-replace-request.dto';
import { UploadResponseDto } from './dto/response/upload-response.dto';
import {
    ApiUploadAvailablePetPhotosEndpoint,
    ApiUploadParentPetPhotosEndpoint,
    ApiUploadRepresentativePhotosEndpoint,
} from './swagger';

@ProtectedUploadController()
export class UploadPhotoController {
    constructor(
        private readonly uploadRepresentativePhotosUseCase: UploadRepresentativePhotosUseCase,
        private readonly uploadAvailablePetPhotosUseCase: UploadAvailablePetPhotosUseCase,
        private readonly uploadParentPetPhotosUseCase: UploadParentPetPhotosUseCase,
    ) {}

    @Post('representative-photos')
    @ApiUploadRepresentativePhotosEndpoint()
    @UseInterceptors(FilesInterceptor('files', 3))
    async uploadRepresentativePhotos(
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
    ): Promise<ApiResponseDto<UploadResponseDto[]>> {
        const responses = await this.uploadRepresentativePhotosUseCase.execute(files, userId, role);
        return ApiResponseDto.success(responses, '대표 사진이 업로드되고 저장되었습니다.');
    }

    @Post('available-pet-photos/:petId')
    @ApiUploadAvailablePetPhotosEndpoint()
    @UseInterceptors(FilesInterceptor('files', 5))
    async uploadAvailablePetPhotos(
        @Param('petId') petId: string,
        @UploadedFiles() files: Express.Multer.File[],
        @Body() requestDto: UploadPhotoReplaceRequestDto,
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
    ): Promise<ApiResponseDto<UploadResponseDto[]>> {
        const responses = await this.uploadAvailablePetPhotosUseCase.execute(
            petId,
            files || [],
            requestDto.existingPhotos || [],
            userId,
            role,
        );

        return ApiResponseDto.success(responses, '분양 개체 사진이 업로드되고 저장되었습니다.');
    }

    @Post('parent-pet-photos/:petId')
    @ApiUploadParentPetPhotosEndpoint()
    @UseInterceptors(FilesInterceptor('files', 5))
    async uploadParentPetPhotos(
        @Param('petId') petId: string,
        @UploadedFiles() files: Express.Multer.File[],
        @Body() requestDto: UploadPhotoReplaceRequestDto,
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
    ): Promise<ApiResponseDto<UploadResponseDto[]>> {
        const responses = await this.uploadParentPetPhotosUseCase.execute(
            petId,
            files || [],
            requestDto.existingPhotos || [],
            userId,
            role,
        );

        return ApiResponseDto.success(responses, '부모견/묘 사진이 업로드되고 저장되었습니다.');
    }
}
