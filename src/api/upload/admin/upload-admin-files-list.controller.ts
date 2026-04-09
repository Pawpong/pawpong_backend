import { Get, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { ListAllFilesUseCase } from './application/use-cases/list-all-files.use-case';
import { UploadAdminProtectedController } from './decorator/upload-admin-controller.decorator';
import { StorageListResponseDto } from './dto/response/storage-list-response.dto';
import { UploadAdminQueryResponseMessageService } from './domain/services/upload-admin-query-response-message.service';
import { ApiListFilesAdminEndpoint } from './swagger';

@UploadAdminProtectedController()
export class UploadAdminFilesListController {
    constructor(
        private readonly listAllFilesUseCase: ListAllFilesUseCase,
        private readonly uploadAdminQueryResponseMessageService: UploadAdminQueryResponseMessageService,
    ) {}

    @Get('files')
    @ApiListFilesAdminEndpoint()
    async listFiles(@Query('prefix') prefix?: string): Promise<ApiResponseDto<StorageListResponseDto>> {
        const result = await this.listAllFilesUseCase.execute(prefix);
        return ApiResponseDto.success(result, this.uploadAdminQueryResponseMessageService.filesListed());
    }
}
