import { Body, Get, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { CheckFileReferencesUseCase } from './application/use-cases/check-file-references.use-case';
import { GetAllReferencedFilesUseCase } from './application/use-cases/get-all-referenced-files.use-case';
import { UploadAdminProtectedController } from './decorator/upload-admin-controller.decorator';
import { CheckFileReferencesRequestDto } from './dto/request/check-file-references-request.dto';
import { FileReferenceResponseDto } from './dto/response/file-reference-response.dto';
import {
    ApiCheckFileReferencesAdminEndpoint,
    ApiGetAllReferencedFilesAdminEndpoint,
} from './swagger';

@UploadAdminProtectedController()
export class UploadAdminReferenceController {
    constructor(
        private readonly checkFileReferencesUseCase: CheckFileReferencesUseCase,
        private readonly getAllReferencedFilesUseCase: GetAllReferencedFilesUseCase,
    ) {}

    @Post('files/check-references')
    @ApiCheckFileReferencesAdminEndpoint()
    async checkFileReferences(
        @Body() data: CheckFileReferencesRequestDto,
    ): Promise<ApiResponseDto<FileReferenceResponseDto>> {
        const result = await this.checkFileReferencesUseCase.execute(data.fileKeys);
        return ApiResponseDto.success(result, 'DB 참조 확인 완료');
    }

    @Get('files/referenced')
    @ApiGetAllReferencedFilesAdminEndpoint()
    async getAllReferencedFiles(): Promise<ApiResponseDto<string[]>> {
        const result = await this.getAllReferencedFilesUseCase.execute();
        return ApiResponseDto.success(result, 'DB 참조 파일 목록 조회 완료');
    }
}
