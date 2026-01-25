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
import { ApiConsumes } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiController, ApiEndpoint } from '../../common/decorator/swagger.decorator';

import { UploadService } from './upload.service';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { UploadResponseDto } from './dto/response/upload-response.dto';

@ApiController('업로드')
@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @Post('representative-photos')
    @UseGuards(JwtAuthGuard)
    @ApiConsumes('multipart/form-data')
    @ApiEndpoint({
        summary: '대표 사진 업로드',
        description: '브리더의 대표 사진을 업로드하고 자동으로 DB에 저장합니다. (최대 3장, 각 5MB)',
        responseType: UploadResponseDto,
        isPublic: false,
    })
    @UseInterceptors(FilesInterceptor('files', 3))
    async uploadRepresentativePhotos(
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser() user: any,
    ): Promise<ApiResponseDto<UploadResponseDto[]>> {
        const responses = await this.uploadService.uploadRepresentativePhotos(files, user);
        return ApiResponseDto.success(responses, '대표 사진이 업로드되고 저장되었습니다.');
    }

    @Post('available-pet-photos/:petId')
    @UseGuards(JwtAuthGuard)
    @ApiConsumes('multipart/form-data')
    @ApiEndpoint({
        summary: '분양 개체 사진 업로드 (다중)',
        description: '분양 개체의 사진을 업로드하고 자동으로 DB에 저장합니다. (최대 4장)',
        responseType: UploadResponseDto,
        isPublic: false,
    })
    @UseInterceptors(FilesInterceptor('files', 4))
    async uploadAvailablePetPhotos(
        @Param('petId') petId: string,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser() user: any,
    ): Promise<ApiResponseDto<UploadResponseDto[]>> {
        const responses = await this.uploadService.uploadAvailablePetPhotosMultiple(petId, files, user);
        return ApiResponseDto.success(responses, '분양 개체 사진이 업로드되고 저장되었습니다.');
    }

    @Post('parent-pet-photos/:petId')
    @UseGuards(JwtAuthGuard)
    @ApiConsumes('multipart/form-data')
    @ApiEndpoint({
        summary: '부모견/묘 사진 업로드 (다중)',
        description: '부모견/묘의 사진을 업로드하고 자동으로 DB에 저장합니다. (최대 4장)',
        responseType: UploadResponseDto,
        isPublic: false,
    })
    @UseInterceptors(FilesInterceptor('files', 4))
    async uploadParentPetPhotos(
        @Param('petId') petId: string,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser() user: any,
    ): Promise<ApiResponseDto<UploadResponseDto[]>> {
        const responses = await this.uploadService.uploadParentPetPhotosMultiple(petId, files, user);
        return ApiResponseDto.success(responses, '부모견/묘 사진이 업로드되고 저장되었습니다.');
    }

    @Post('single')
    @ApiConsumes('multipart/form-data')
    @ApiEndpoint({
        summary: '단일 파일 업로드',
        description: '단일 파일을 Google Cloud Storage에 업로드합니다.',
        responseType: UploadResponseDto,
        isPublic: true,
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadSingle(
        @UploadedFile() file: Express.Multer.File,
        @Body('folder') folder?: string,
    ): Promise<ApiResponseDto<UploadResponseDto>> {
        const response = await this.uploadService.uploadSingle(file, folder);
        return ApiResponseDto.success(response, '파일 업로드 성공');
    }

    @Post('multiple')
    @ApiConsumes('multipart/form-data')
    @ApiEndpoint({
        summary: '다중 파일 업로드',
        description: '다중 파일을 Google Cloud Storage에 업로드합니다. (최대 10개)',
        responseType: UploadResponseDto,
        isPublic: true,
    })
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadMultiple(
        @UploadedFiles() files: Express.Multer.File[],
        @Body('folder') folder?: string,
    ): Promise<ApiResponseDto<UploadResponseDto[]>> {
        const responses = await this.uploadService.uploadMultiple(files, folder);
        return ApiResponseDto.success(responses, `${files.length}개 파일 업로드 성공`);
    }

    @Delete()
    @ApiEndpoint({
        summary: '파일 삭제',
        description: 'Google Cloud Storage에서 파일을 삭제합니다.',
        isPublic: true,
    })
    async deleteFile(@Body('fileName') fileName: string): Promise<ApiResponseDto<null>> {
        await this.uploadService.deleteFile(fileName);
        return ApiResponseDto.success(null, '파일 삭제 성공');
    }
}
