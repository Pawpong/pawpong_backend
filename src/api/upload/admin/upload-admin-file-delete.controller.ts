import { Delete, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { DeleteFileUseCase } from './application/use-cases/delete-file.use-case';
import { UploadAdminProtectedController } from './decorator/upload-admin-controller.decorator';
import { UploadAdminResponseMessageService } from './domain/services/upload-admin-response-message.service';
import { ApiDeleteFileAdminEndpoint } from './swagger';

@UploadAdminProtectedController()
export class UploadAdminFileDeleteController {
    constructor(
        private readonly deleteFileUseCase: DeleteFileUseCase,
        private readonly uploadAdminResponseMessageService: UploadAdminResponseMessageService,
    ) {}

    @Delete('file')
    @ApiDeleteFileAdminEndpoint()
    async deleteFile(@Query('fileName') fileName: string): Promise<ApiResponseDto<void>> {
        await this.deleteFileUseCase.execute(fileName);
        return ApiResponseDto.success(undefined, this.uploadAdminResponseMessageService.fileDeleted());
    }
}
