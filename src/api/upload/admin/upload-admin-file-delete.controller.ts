import { Delete, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { DeleteFileUseCase } from './application/use-cases/delete-file.use-case';
import { UploadAdminProtectedController } from './decorator/upload-admin-controller.decorator';
import { ApiDeleteFileAdminEndpoint } from './swagger';

@UploadAdminProtectedController()
export class UploadAdminFileDeleteController {
    constructor(private readonly deleteFileUseCase: DeleteFileUseCase) {}

    @Delete('file')
    @ApiDeleteFileAdminEndpoint()
    async deleteFile(@Query('fileName') fileName: string): Promise<ApiResponseDto<void>> {
        await this.deleteFileUseCase.execute(fileName);
        return ApiResponseDto.success(undefined, '파일이 삭제되었습니다.');
    }
}
