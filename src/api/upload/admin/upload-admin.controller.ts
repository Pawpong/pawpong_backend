import { Controller, Get, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { UploadAdminService } from './upload-admin.service';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';

import { StorageListResponseDto } from './dto/response/storage-list-response.dto';
import { DeleteFilesRequestDto } from './dto/request/delete-files-request.dto';
import { DeleteFilesResponseDto } from './dto/response/delete-files-response.dto';

/**
 * Admin용 스토리지 관리 컨트롤러
 */
@ApiTags('스토리지 관리 (Admin)')
@ApiBearerAuth('JWT-Auth')
@Controller('upload-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UploadAdminController {
    constructor(private readonly uploadAdminService: UploadAdminService) {}

    @Get('files')
    @ApiOperation({
        summary: '스토리지 파일 목록 조회',
        description: '스마일서브 버킷 내 모든 파일 목록을 조회합니다.',
    })
    @ApiQuery({
        name: 'prefix',
        required: false,
        description: '조회할 폴더 경로',
        example: 'profiles/',
    })
    @ApiResponse({ status: 200, description: '성공', type: StorageListResponseDto })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    async listFiles(@Query('prefix') prefix?: string): Promise<ApiResponseDto<StorageListResponseDto>> {
        const result = await this.uploadAdminService.listAllFiles(prefix);
        return ApiResponseDto.success(result, '파일 목록 조회 완료');
    }

    @Get('files/folder/:folder')
    @ApiOperation({
        summary: '특정 폴더의 파일 목록 조회',
        description: '특정 폴더 내 파일 목록만 조회합니다.',
    })
    @ApiResponse({ status: 200, description: '성공', type: StorageListResponseDto })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    async listFilesByFolder(@Param('folder') folder: string): Promise<ApiResponseDto<StorageListResponseDto>> {
        const result = await this.uploadAdminService.listFilesByFolder(folder);
        return ApiResponseDto.success(result, `${folder} 폴더 파일 목록 조회 완료`);
    }

    @Delete('file/:fileName(*)')
    @ApiOperation({
        summary: '단일 파일 삭제',
        description: '스토리지에서 단일 파일을 삭제합니다.',
    })
    @ApiResponse({ status: 200, description: '삭제 성공' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    async deleteFile(@Param('fileName') fileName: string): Promise<ApiResponseDto<void>> {
        await this.uploadAdminService.deleteFile(fileName);
        return ApiResponseDto.success(undefined, '파일이 삭제되었습니다.');
    }

    @Delete('files')
    @ApiOperation({
        summary: '다중 파일 삭제',
        description: '여러 파일을 한 번에 삭제합니다.',
    })
    @ApiResponse({ status: 200, description: '삭제 성공', type: DeleteFilesResponseDto })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    async deleteMultipleFiles(@Body() data: DeleteFilesRequestDto): Promise<ApiResponseDto<DeleteFilesResponseDto>> {
        const result = await this.uploadAdminService.deleteMultipleFiles(data.fileNames);
        return ApiResponseDto.success(result, '파일 삭제가 완료되었습니다.');
    }

    @Delete('folder/:folder(*)')
    @ApiOperation({
        summary: '폴더 전체 삭제',
        description: '특정 폴더 내 모든 파일을 삭제합니다.',
    })
    @ApiResponse({ status: 200, description: '삭제 성공', type: DeleteFilesResponseDto })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    async deleteFolder(@Param('folder') folder: string): Promise<ApiResponseDto<DeleteFilesResponseDto>> {
        const result = await this.uploadAdminService.deleteFolder(folder);
        return ApiResponseDto.success(result, `${folder} 폴더가 삭제되었습니다.`);
    }
}
