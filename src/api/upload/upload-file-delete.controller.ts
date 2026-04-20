import { Body, Delete } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { DeleteUploadedFileUseCase } from './application/use-cases/delete-uploaded-file.use-case';
import { UPLOAD_RESPONSE_MESSAGE_EXAMPLES } from './constants/upload-response-messages';
import { UploadController } from './decorator/upload-controller.decorator';
import { DeleteUploadedFileRequestDto } from './dto/request/delete-uploaded-file-request.dto';
import { ApiDeleteUploadedFileEndpoint } from './swagger';

@UploadController()
export class UploadFileDeleteController {
    constructor(private readonly deleteUploadedFileUseCase: DeleteUploadedFileUseCase) {}

    @Delete()
    @ApiDeleteUploadedFileEndpoint()
    async deleteFile(@Body() requestDto: DeleteUploadedFileRequestDto): Promise<ApiResponseDto<null>> {
        await this.deleteUploadedFileUseCase.execute(requestDto.fileName);
        return ApiResponseDto.success(null, UPLOAD_RESPONSE_MESSAGE_EXAMPLES.fileDeleted);
    }
}
