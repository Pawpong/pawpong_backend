import {
    Controller,
    Post,
    Delete,
    UseInterceptors,
    UseGuards,
    UploadedFile,
    UploadedFiles,
    Body,
    Param,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { DeleteUploadedFileRequestDto } from './dto/request/delete-uploaded-file-request.dto';
import { UploadFolderRequestDto } from './dto/request/upload-folder-request.dto';
import { UploadPhotoReplaceRequestDto } from './dto/request/upload-photo-replace-request.dto';
import { UploadResponseDto } from './dto/response/upload-response.dto';
import {
    ApiDeleteUploadedFileEndpoint,
    ApiUploadAvailablePetPhotosEndpoint,
    ApiUploadController,
    ApiUploadMultipleFilesEndpoint,
    ApiUploadParentPetPhotosEndpoint,
    ApiUploadRepresentativePhotosEndpoint,
    ApiUploadSingleFileEndpoint,
} from './swagger';

import { UploadRepresentativePhotosUseCase } from './application/use-cases/upload-representative-photos.use-case';
import { UploadAvailablePetPhotosUseCase } from './application/use-cases/upload-available-pet-photos.use-case';
import { UploadParentPetPhotosUseCase } from './application/use-cases/upload-parent-pet-photos.use-case';
import { UploadSingleFileUseCase } from './application/use-cases/upload-single-file.use-case';
import { UploadMultipleFilesUseCase } from './application/use-cases/upload-multiple-files.use-case';
import { DeleteUploadedFileUseCase } from './application/use-cases/delete-uploaded-file.use-case';

@ApiUploadController()
@Controller('upload')
export class UploadController {
    constructor(
        private readonly uploadRepresentativePhotosUseCase: UploadRepresentativePhotosUseCase,
        private readonly uploadAvailablePetPhotosUseCase: UploadAvailablePetPhotosUseCase,
        private readonly uploadParentPetPhotosUseCase: UploadParentPetPhotosUseCase,
        private readonly uploadSingleFileUseCase: UploadSingleFileUseCase,
        private readonly uploadMultipleFilesUseCase: UploadMultipleFilesUseCase,
        private readonly deleteUploadedFileUseCase: DeleteUploadedFileUseCase,
    ) {}

    @Post('representative-photos')
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
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

    @Post('single')
    @ApiUploadSingleFileEndpoint()
    @UseInterceptors(FileInterceptor('file'))
    async uploadSingle(
        @UploadedFile() file: Express.Multer.File,
        @Body() requestDto: UploadFolderRequestDto,
    ): Promise<ApiResponseDto<UploadResponseDto>> {
        const response = await this.uploadSingleFileUseCase.execute(file, requestDto.folder);
        return ApiResponseDto.success(response, '파일 업로드 성공');
    }

    @Post('multiple')
    @ApiUploadMultipleFilesEndpoint()
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadMultiple(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() requestDto: UploadFolderRequestDto,
    ): Promise<ApiResponseDto<UploadResponseDto[]>> {
        const responses = await this.uploadMultipleFilesUseCase.execute(files, requestDto.folder);
        return ApiResponseDto.success(responses, `${files.length}개 파일 업로드 성공`);
    }

    @Delete()
    @ApiDeleteUploadedFileEndpoint()
    async deleteFile(@Body() requestDto: DeleteUploadedFileRequestDto): Promise<ApiResponseDto<null>> {
        await this.deleteUploadedFileUseCase.execute(requestDto.fileName);
        return ApiResponseDto.success(null, '파일 삭제 성공');
    }
}
