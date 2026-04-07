import { Body, Delete, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { DeleteUploadedFileRequestDto } from './dto/request/delete-uploaded-file-request.dto';
import { UploadFolderRequestDto } from './dto/request/upload-folder-request.dto';
import { UploadResponseDto } from './dto/response/upload-response.dto';
import { DeleteUploadedFileUseCase } from './application/use-cases/delete-uploaded-file.use-case';
import { UploadMultipleFilesUseCase } from './application/use-cases/upload-multiple-files.use-case';
import { UploadSingleFileUseCase } from './application/use-cases/upload-single-file.use-case';
import { UploadController } from './decorator/upload-controller.decorator';
import {
    ApiDeleteUploadedFileEndpoint,
    ApiUploadMultipleFilesEndpoint,
    ApiUploadSingleFileEndpoint,
} from './swagger';

@UploadController()
export class UploadFileController {
    constructor(
        private readonly uploadSingleFileUseCase: UploadSingleFileUseCase,
        private readonly uploadMultipleFilesUseCase: UploadMultipleFilesUseCase,
        private readonly deleteUploadedFileUseCase: DeleteUploadedFileUseCase,
    ) {}

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
