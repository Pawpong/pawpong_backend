import { Body, Delete } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { DeleteMultipleFilesUseCase } from './application/use-cases/delete-multiple-files.use-case';
import { UploadAdminProtectedController } from './decorator/upload-admin-controller.decorator';
import { DeleteFilesRequestDto } from './dto/request/delete-files-request.dto';
import { DeleteFilesResponseDto } from './dto/response/delete-files-response.dto';
import { UploadAdminFileDeleteResponseMessageService } from './domain/services/upload-admin-file-delete-response-message.service';
import { ApiDeleteMultipleFilesAdminEndpoint } from './swagger';

@UploadAdminProtectedController()
export class UploadAdminFilesDeleteController {
    constructor(
        private readonly deleteMultipleFilesUseCase: DeleteMultipleFilesUseCase,
        private readonly uploadAdminFileDeleteResponseMessageService: UploadAdminFileDeleteResponseMessageService,
    ) {}

    @Delete('files')
    @ApiDeleteMultipleFilesAdminEndpoint()
    async deleteMultipleFiles(@Body() data: DeleteFilesRequestDto): Promise<ApiResponseDto<DeleteFilesResponseDto>> {
        const result = await this.deleteMultipleFilesUseCase.execute(data.fileNames);
        return ApiResponseDto.success(result, this.uploadAdminFileDeleteResponseMessageService.filesDeleted());
    }
}
