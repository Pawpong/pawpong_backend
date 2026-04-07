import { Body, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { UploadParentPetPhotosUseCase } from './application/use-cases/upload-parent-pet-photos.use-case';
import { ProtectedUploadController } from './decorator/upload-controller.decorator';
import { UploadPhotoReplaceRequestDto } from './dto/request/upload-photo-replace-request.dto';
import { UploadResponseDto } from './dto/response/upload-response.dto';
import { ApiUploadParentPetPhotosEndpoint } from './swagger';

@ProtectedUploadController()
export class UploadParentPetPhotoController {
    constructor(private readonly uploadParentPetPhotosUseCase: UploadParentPetPhotosUseCase) {}

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
