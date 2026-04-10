import { Delete, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { DeleteFileUseCase } from './application/use-cases/delete-file.use-case';
import { UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from './constants/upload-admin-response-messages';
import { UploadAdminProtectedController } from './decorator/upload-admin-controller.decorator';
import { ApiDeleteFileAdminEndpoint } from './swagger';

@UploadAdminProtectedController()
export class UploadAdminFileDeleteController {
    constructor(private readonly deleteFileUseCase: DeleteFileUseCase) {}

    @Delete('file')
    @ApiDeleteFileAdminEndpoint()
    async deleteFile(@Query('fileName') fileName: string): Promise<ApiResponseDto<void>> {
        await this.deleteFileUseCase.execute(fileName);
        return ApiResponseDto.success(undefined, UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.fileDeleted);
    }
}
