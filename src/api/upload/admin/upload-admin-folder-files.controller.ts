import { Get, Param } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { ListFilesByFolderUseCase } from './application/use-cases/list-files-by-folder.use-case';
import { UploadAdminProtectedController } from './decorator/upload-admin-controller.decorator';
import { StorageListResponseDto } from './dto/response/storage-list-response.dto';
import { ApiListFilesByFolderAdminEndpoint } from './swagger';

@UploadAdminProtectedController()
export class UploadAdminFolderFilesController {
    constructor(private readonly listFilesByFolderUseCase: ListFilesByFolderUseCase) {}

    @Get('files/folder/:folder')
    @ApiListFilesByFolderAdminEndpoint()
    async listFilesByFolder(@Param('folder') folder: string): Promise<ApiResponseDto<StorageListResponseDto>> {
        const result = await this.listFilesByFolderUseCase.execute(folder);
        return ApiResponseDto.success(result, `${folder} 폴더 파일 목록 조회 완료`);
    }
}
