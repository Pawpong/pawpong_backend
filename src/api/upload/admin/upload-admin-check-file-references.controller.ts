import { Body, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { CheckFileReferencesUseCase } from './application/use-cases/check-file-references.use-case';
import { UploadAdminProtectedController } from './decorator/upload-admin-controller.decorator';
import { CheckFileReferencesRequestDto } from './dto/request/check-file-references-request.dto';
import { FileReferenceResponseDto } from './dto/response/file-reference-response.dto';
import { UploadAdminQueryResponseMessageService } from './domain/services/upload-admin-query-response-message.service';
import { ApiCheckFileReferencesAdminEndpoint } from './swagger';

@UploadAdminProtectedController()
export class UploadAdminCheckFileReferencesController {
    constructor(
        private readonly checkFileReferencesUseCase: CheckFileReferencesUseCase,
        private readonly uploadAdminQueryResponseMessageService: UploadAdminQueryResponseMessageService,
    ) {}

    @Post('files/check-references')
    @ApiCheckFileReferencesAdminEndpoint()
    async checkFileReferences(
        @Body() data: CheckFileReferencesRequestDto,
    ): Promise<ApiResponseDto<FileReferenceResponseDto>> {
        const result = await this.checkFileReferencesUseCase.execute(data.fileKeys);
        return ApiResponseDto.success(result, this.uploadAdminQueryResponseMessageService.fileReferencesChecked());
    }
}
