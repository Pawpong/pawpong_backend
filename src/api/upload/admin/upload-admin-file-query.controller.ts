import { Get, Param, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { ListAllFilesUseCase } from './application/use-cases/list-all-files.use-case';
import { ListFilesByFolderUseCase } from './application/use-cases/list-files-by-folder.use-case';
import { UploadAdminProtectedController } from './decorator/upload-admin-controller.decorator';
import { StorageListResponseDto } from './dto/response/storage-list-response.dto';
import { ApiListFilesAdminEndpoint, ApiListFilesByFolderAdminEndpoint } from './swagger';

@UploadAdminProtectedController()
export class UploadAdminFileQueryController {
    constructor(
        private readonly listAllFilesUseCase: ListAllFilesUseCase,
        private readonly listFilesByFolderUseCase: ListFilesByFolderUseCase,
    ) {}

    @Get('files')
    @ApiListFilesAdminEndpoint()
    async listFiles(@Query('prefix') prefix?: string): Promise<ApiResponseDto<StorageListResponseDto>> {
        const result = await this.listAllFilesUseCase.execute(prefix);
        return ApiResponseDto.success(result, '파일 목록 조회 완료');
    }

    @Get('files/folder/:folder')
    @ApiListFilesByFolderAdminEndpoint()
    async listFilesByFolder(@Param('folder') folder: string): Promise<ApiResponseDto<StorageListResponseDto>> {
        const result = await this.listFilesByFolderUseCase.execute(folder);
        return ApiResponseDto.success(result, `${folder} 폴더 파일 목록 조회 완료`);
    }
}
