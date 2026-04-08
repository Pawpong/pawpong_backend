import { Delete, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { DeleteFolderUseCase } from './application/use-cases/delete-folder.use-case';
import { UploadAdminProtectedController } from './decorator/upload-admin-controller.decorator';
import { DeleteFilesResponseDto } from './dto/response/delete-files-response.dto';
import { ApiDeleteFolderAdminEndpoint } from './swagger';

@UploadAdminProtectedController()
export class UploadAdminFolderDeleteController {
    constructor(private readonly deleteFolderUseCase: DeleteFolderUseCase) {}

    @Delete('folder')
    @ApiDeleteFolderAdminEndpoint()
    async deleteFolder(@Query('folder') folder: string): Promise<ApiResponseDto<DeleteFilesResponseDto>> {
        const result = await this.deleteFolderUseCase.execute(folder);
        return ApiResponseDto.success(result, `${folder} 폴더가 삭제되었습니다.`);
    }
}
