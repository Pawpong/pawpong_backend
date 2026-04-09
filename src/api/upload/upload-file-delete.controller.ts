import { Body, Delete } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { DeleteUploadedFileUseCase } from './application/use-cases/delete-uploaded-file.use-case';
import { UploadController } from './decorator/upload-controller.decorator';
import { DeleteUploadedFileRequestDto } from './dto/request/delete-uploaded-file-request.dto';
import { UploadFileDeleteResponseMessageService } from './domain/services/upload-file-delete-response-message.service';
import { ApiDeleteUploadedFileEndpoint } from './swagger';

@UploadController()
export class UploadFileDeleteController {
    constructor(
        private readonly deleteUploadedFileUseCase: DeleteUploadedFileUseCase,
        private readonly uploadFileDeleteResponseMessageService: UploadFileDeleteResponseMessageService,
    ) {}

    @Delete()
    @ApiDeleteUploadedFileEndpoint()
    async deleteFile(@Body() requestDto: DeleteUploadedFileRequestDto): Promise<ApiResponseDto<null>> {
        await this.deleteUploadedFileUseCase.execute(requestDto.fileName);
        return ApiResponseDto.success(null, this.uploadFileDeleteResponseMessageService.fileDeleted());
    }
}
