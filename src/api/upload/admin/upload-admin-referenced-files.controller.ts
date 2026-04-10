import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetAllReferencedFilesUseCase } from './application/use-cases/get-all-referenced-files.use-case';
import { UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from './constants/upload-admin-response-messages';
import { UploadAdminProtectedController } from './decorator/upload-admin-controller.decorator';
import { ApiGetAllReferencedFilesAdminEndpoint } from './swagger';

@UploadAdminProtectedController()
export class UploadAdminReferencedFilesController {
    constructor(private readonly getAllReferencedFilesUseCase: GetAllReferencedFilesUseCase) {}

    @Get('files/referenced')
    @ApiGetAllReferencedFilesAdminEndpoint()
    async getAllReferencedFiles(): Promise<ApiResponseDto<string[]>> {
        const result = await this.getAllReferencedFilesUseCase.execute();
        return ApiResponseDto.success(result, UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.referencedFilesListed);
    }
}
