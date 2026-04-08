import { Body, Delete } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { DeleteUploadedFileUseCase } from './application/use-cases/delete-uploaded-file.use-case';
import { UploadController } from './decorator/upload-controller.decorator';
import { DeleteUploadedFileRequestDto } from './dto/request/delete-uploaded-file-request.dto';
import { UploadResponseMessageService } from './domain/services/upload-response-message.service';
import { ApiDeleteUploadedFileEndpoint } from './swagger';

@UploadController()
export class UploadFileDeleteController {
    constructor(
        private readonly deleteUploadedFileUseCase: DeleteUploadedFileUseCase,
        private readonly uploadResponseMessageService: UploadResponseMessageService,
    ) {}

    @Delete()
    @ApiDeleteUploadedFileEndpoint()
    async deleteFile(@Body() requestDto: DeleteUploadedFileRequestDto): Promise<ApiResponseDto<null>> {
        await this.deleteUploadedFileUseCase.execute(requestDto.fileName);
        return ApiResponseDto.success(null, this.uploadResponseMessageService.fileDeleted());
    }
}
