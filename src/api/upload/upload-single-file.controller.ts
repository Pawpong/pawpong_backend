import { Body, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { UploadSingleFileUseCase } from './application/use-cases/upload-single-file.use-case';
import { UPLOAD_RESPONSE_MESSAGE_EXAMPLES } from './constants/upload-response-messages';
import { UploadController } from './decorator/upload-controller.decorator';
import { UploadFolderRequestDto } from './dto/request/upload-folder-request.dto';
import { UploadResponseDto } from './dto/response/upload-response.dto';
import { ApiUploadSingleFileEndpoint } from './swagger';

@UploadController()
export class UploadSingleFileController {
    constructor(private readonly uploadSingleFileUseCase: UploadSingleFileUseCase) {}

    @Post('single')
    @ApiUploadSingleFileEndpoint()
    @UseInterceptors(FileInterceptor('file'))
    async uploadSingle(
        @UploadedFile() file: Express.Multer.File,
        @Body() requestDto: UploadFolderRequestDto,
    ): Promise<ApiResponseDto<UploadResponseDto>> {
        const response = await this.uploadSingleFileUseCase.execute(file, requestDto.folder);
        return ApiResponseDto.success(response, UPLOAD_RESPONSE_MESSAGE_EXAMPLES.singleFileUploaded);
    }
}
