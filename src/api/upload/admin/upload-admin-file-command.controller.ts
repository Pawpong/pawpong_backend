import { Body, Delete, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { DeleteFileUseCase } from './application/use-cases/delete-file.use-case';
import { DeleteFolderUseCase } from './application/use-cases/delete-folder.use-case';
import { DeleteMultipleFilesUseCase } from './application/use-cases/delete-multiple-files.use-case';
import { UploadAdminProtectedController } from './decorator/upload-admin-controller.decorator';
import { DeleteFilesRequestDto } from './dto/request/delete-files-request.dto';
import { DeleteFilesResponseDto } from './dto/response/delete-files-response.dto';
import {
    ApiDeleteFileAdminEndpoint,
    ApiDeleteFolderAdminEndpoint,
    ApiDeleteMultipleFilesAdminEndpoint,
} from './swagger';

@UploadAdminProtectedController()
export class UploadAdminFileCommandController {
    constructor(
        private readonly deleteFileUseCase: DeleteFileUseCase,
        private readonly deleteMultipleFilesUseCase: DeleteMultipleFilesUseCase,
        private readonly deleteFolderUseCase: DeleteFolderUseCase,
    ) {}

    @Delete('file')
    @ApiDeleteFileAdminEndpoint()
    async deleteFile(@Query('fileName') fileName: string): Promise<ApiResponseDto<void>> {
        await this.deleteFileUseCase.execute(fileName);
        return ApiResponseDto.success(undefined, '파일이 삭제되었습니다.');
    }

    @Delete('files')
    @ApiDeleteMultipleFilesAdminEndpoint()
    async deleteMultipleFiles(@Body() data: DeleteFilesRequestDto): Promise<ApiResponseDto<DeleteFilesResponseDto>> {
        const result = await this.deleteMultipleFilesUseCase.execute(data.fileNames);
        return ApiResponseDto.success(result, '파일 삭제가 완료되었습니다.');
    }

    @Delete('folder')
    @ApiDeleteFolderAdminEndpoint()
    async deleteFolder(@Query('folder') folder: string): Promise<ApiResponseDto<DeleteFilesResponseDto>> {
        const result = await this.deleteFolderUseCase.execute(folder);
        return ApiResponseDto.success(result, `${folder} 폴더가 삭제되었습니다.`);
    }
}
