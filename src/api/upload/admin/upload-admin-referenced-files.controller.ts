import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetAllReferencedFilesUseCase } from './application/use-cases/get-all-referenced-files.use-case';
import { UploadAdminProtectedController } from './decorator/upload-admin-controller.decorator';
import { UploadAdminReferenceQueryResponseMessageService } from './domain/services/upload-admin-reference-query-response-message.service';
import { ApiGetAllReferencedFilesAdminEndpoint } from './swagger';

@UploadAdminProtectedController()
export class UploadAdminReferencedFilesController {
    constructor(
        private readonly getAllReferencedFilesUseCase: GetAllReferencedFilesUseCase,
        private readonly uploadAdminReferenceQueryResponseMessageService: UploadAdminReferenceQueryResponseMessageService,
    ) {}

    @Get('files/referenced')
    @ApiGetAllReferencedFilesAdminEndpoint()
    async getAllReferencedFiles(): Promise<ApiResponseDto<string[]>> {
        const result = await this.getAllReferencedFilesUseCase.execute();
        return ApiResponseDto.success(result, this.uploadAdminReferenceQueryResponseMessageService.referencedFilesListed());
    }
}
