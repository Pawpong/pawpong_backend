import { Get, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { ListAllFilesUseCase } from './application/use-cases/list-all-files.use-case';
import { UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from './constants/upload-admin-response-messages';
import { UploadAdminProtectedController } from './decorator/upload-admin-controller.decorator';
import { StorageListResponseDto } from './dto/response/storage-list-response.dto';
import { ApiListFilesAdminEndpoint } from './swagger';

@UploadAdminProtectedController()
export class UploadAdminFilesListController {
    constructor(private readonly listAllFilesUseCase: ListAllFilesUseCase) {}

    @Get('files')
    @ApiListFilesAdminEndpoint()
    async listFiles(@Query('prefix') prefix?: string): Promise<ApiResponseDto<StorageListResponseDto>> {
        const result = await this.listAllFilesUseCase.execute(prefix);
        return ApiResponseDto.success(result, UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.filesListed);
    }
}
