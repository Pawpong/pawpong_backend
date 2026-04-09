import { Body, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { UploadAvailablePetPhotosUseCase } from './application/use-cases/upload-available-pet-photos.use-case';
import { ProtectedUploadController } from './decorator/upload-controller.decorator';
import { UploadPhotoReplaceRequestDto } from './dto/request/upload-photo-replace-request.dto';
import { UploadResponseDto } from './dto/response/upload-response.dto';
import { UploadPhotoResponseMessageService } from './domain/services/upload-photo-response-message.service';
import { ApiUploadAvailablePetPhotosEndpoint } from './swagger';

@ProtectedUploadController()
export class UploadAvailablePetPhotoController {
    constructor(
        private readonly uploadAvailablePetPhotosUseCase: UploadAvailablePetPhotosUseCase,
        private readonly uploadPhotoResponseMessageService: UploadPhotoResponseMessageService,
    ) {}

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

        return ApiResponseDto.success(responses, this.uploadPhotoResponseMessageService.availablePetPhotosUploaded());
    }
}
