import { Body, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { UploadMultipleFilesUseCase } from './application/use-cases/upload-multiple-files.use-case';
import { UploadController } from './decorator/upload-controller.decorator';
import { UploadFolderRequestDto } from './dto/request/upload-folder-request.dto';
import { UploadResponseDto } from './dto/response/upload-response.dto';
import { UploadFileResponseMessageService } from './domain/services/upload-file-response-message.service';
import { ApiUploadMultipleFilesEndpoint } from './swagger';

@UploadController()
export class UploadMultipleFilesController {
    constructor(
        private readonly uploadMultipleFilesUseCase: UploadMultipleFilesUseCase,
        private readonly uploadFileResponseMessageService: UploadFileResponseMessageService,
    ) {}

    @Post('multiple')
    @ApiUploadMultipleFilesEndpoint()
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadMultiple(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() requestDto: UploadFolderRequestDto,
    ): Promise<ApiResponseDto<UploadResponseDto[]>> {
        const responses = await this.uploadMultipleFilesUseCase.execute(files, requestDto.folder);
        return ApiResponseDto.success(responses, this.uploadFileResponseMessageService.multipleFilesUploaded(files.length));
    }
}
