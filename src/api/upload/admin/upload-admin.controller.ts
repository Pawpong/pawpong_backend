import { Controller, Get, Delete, Post, Body, Query, Param, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { ListAllFilesUseCase } from './application/use-cases/list-all-files.use-case';
import { ListFilesByFolderUseCase } from './application/use-cases/list-files-by-folder.use-case';
import { DeleteFileUseCase } from './application/use-cases/delete-file.use-case';
import { DeleteMultipleFilesUseCase } from './application/use-cases/delete-multiple-files.use-case';
import { DeleteFolderUseCase } from './application/use-cases/delete-folder.use-case';
import { CheckFileReferencesUseCase } from './application/use-cases/check-file-references.use-case';
import { GetAllReferencedFilesUseCase } from './application/use-cases/get-all-referenced-files.use-case';
import { CheckFileReferencesRequestDto } from './dto/request/check-file-references-request.dto';
import { DeleteFilesRequestDto } from './dto/request/delete-files-request.dto';
import { DeleteFilesResponseDto } from './dto/response/delete-files-response.dto';
import { StorageListResponseDto } from './dto/response/storage-list-response.dto';
import { FileReferenceResponseDto } from './dto/response/file-reference-response.dto';
import {
    ApiCheckFileReferencesAdminEndpoint,
    ApiDeleteFileAdminEndpoint,
    ApiDeleteFolderAdminEndpoint,
    ApiDeleteMultipleFilesAdminEndpoint,
    ApiGetAllReferencedFilesAdminEndpoint,
    ApiListFilesAdminEndpoint,
    ApiListFilesByFolderAdminEndpoint,
    ApiUploadAdminController,
} from './swagger';

/**
 * Admin용 스토리지 관리 컨트롤러
 */
@ApiUploadAdminController()
@Controller('upload-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UploadAdminController {
    constructor(
        private readonly listAllFilesUseCase: ListAllFilesUseCase,
        private readonly listFilesByFolderUseCase: ListFilesByFolderUseCase,
        private readonly deleteFileUseCase: DeleteFileUseCase,
        private readonly deleteMultipleFilesUseCase: DeleteMultipleFilesUseCase,
        private readonly deleteFolderUseCase: DeleteFolderUseCase,
        private readonly checkFileReferencesUseCase: CheckFileReferencesUseCase,
        private readonly getAllReferencedFilesUseCase: GetAllReferencedFilesUseCase,
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
