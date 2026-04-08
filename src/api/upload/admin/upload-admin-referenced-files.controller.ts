import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetAllReferencedFilesUseCase } from './application/use-cases/get-all-referenced-files.use-case';
import { UploadAdminProtectedController } from './decorator/upload-admin-controller.decorator';
import { ApiGetAllReferencedFilesAdminEndpoint } from './swagger';

@UploadAdminProtectedController()
export class UploadAdminReferencedFilesController {
    constructor(private readonly getAllReferencedFilesUseCase: GetAllReferencedFilesUseCase) {}

    @Get('files/referenced')
    @ApiGetAllReferencedFilesAdminEndpoint()
    async getAllReferencedFiles(): Promise<ApiResponseDto<string[]>> {
        const result = await this.getAllReferencedFilesUseCase.execute();
        return ApiResponseDto.success(result, 'DB 참조 파일 목록 조회 완료');
    }
}
