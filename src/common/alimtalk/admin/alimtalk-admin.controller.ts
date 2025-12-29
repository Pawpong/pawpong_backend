import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { Roles } from '../../../common/decorator/roles.decorator';

import { AlimtalkAdminService } from './alimtalk-admin.service';
import { TemplateUpdateRequestDto } from './dto/request/template-update-request.dto';
import { TemplateCreateRequestDto } from './dto/request/template-create-request.dto';
import { TemplateListResponseDto } from './dto/response/template-list-response.dto';
import { TemplateDetailResponseDto } from './dto/response/template-detail-response.dto';

import { ApiResponseDto } from '../../dto/response/api-response.dto';

/**
 * 알림톡 템플릿 관리 Admin 컨트롤러
 *
 * 관리자가 알림톡 템플릿을 조회/수정할 수 있는 API를 제공합니다.
 *
 * @tag alimtalk-admin
 */
@ApiTags('alimtalk-admin')
@ApiBearerAuth('JWT-Auth')
@Controller('alimtalk-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AlimtalkAdminController {
    constructor(private readonly alimtalkAdminService: AlimtalkAdminService) {}

    /**
     * 전체 알림톡 템플릿 목록 조회
     *
     * @returns 템플릿 목록 및 총 개수
     */
    @Get('templates')
    @ApiOperation({
        summary: '알림톡 템플릿 목록 조회',
        description: '등록된 모든 알림톡 템플릿 목록을 조회합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '템플릿 목록 조회 성공',
        type: TemplateListResponseDto,
    })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    @ApiResponse({ status: 403, description: '권한 없음 (관리자 전용)' })
    async getTemplates(): Promise<ApiResponseDto<TemplateListResponseDto>> {
        const data = await this.alimtalkAdminService.getTemplates();
        return {
            success: true,
            code: 200,
            data,
            message: '알림톡 템플릿 목록 조회 성공',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * 특정 알림톡 템플릿 상세 조회
     *
     * @param templateCode 템플릿 코드 (예: 'VERIFICATION_CODE')
     * @returns 템플릿 상세 정보
     */
    @Get('templates/:templateCode')
    @ApiOperation({
        summary: '알림톡 템플릿 상세 조회',
        description: '특정 템플릿의 상세 정보를 조회합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '템플릿 상세 조회 성공',
        type: TemplateDetailResponseDto,
    })
    @ApiResponse({ status: 400, description: '잘못된 요청 또는 템플릿을 찾을 수 없음' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    @ApiResponse({ status: 403, description: '권한 없음 (관리자 전용)' })
    async getTemplateByCode(
        @Param('templateCode') templateCode: string,
    ): Promise<ApiResponseDto<TemplateDetailResponseDto>> {
        const data = await this.alimtalkAdminService.getTemplateByCode(templateCode);
        return {
            success: true,
            code: 200,
            data,
            message: '알림톡 템플릿 상세 조회 성공',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * 알림톡 템플릿 수정
     *
     * @param templateCode 템플릿 코드
     * @param updateData 수정할 데이터
     * @returns 수정된 템플릿 정보
     */
    @Put('templates/:templateCode')
    @ApiOperation({
        summary: '알림톡 템플릿 수정',
        description: '특정 템플릿의 정보를 수정합니다. 수정 후 자동으로 캐시가 갱신됩니다.',
    })
    @ApiResponse({
        status: 200,
        description: '템플릿 수정 성공',
        type: TemplateDetailResponseDto,
    })
    @ApiResponse({ status: 400, description: '잘못된 요청 또는 템플릿을 찾을 수 없음' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    @ApiResponse({ status: 403, description: '권한 없음 (관리자 전용)' })
    async updateTemplate(
        @Param('templateCode') templateCode: string,
        @Body() updateData: TemplateUpdateRequestDto,
    ): Promise<ApiResponseDto<TemplateDetailResponseDto>> {
        const data = await this.alimtalkAdminService.updateTemplate(templateCode, updateData);
        return {
            success: true,
            code: 200,
            data,
            message: '알림톡 템플릿 수정 성공',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * 알림톡 템플릿 생성
     *
     * @param createData 생성할 템플릿 데이터
     * @returns 생성된 템플릿 정보
     */
    @Post('templates')
    @ApiOperation({
        summary: '알림톡 템플릿 생성',
        description: 'CoolSMS에서 검수 받은 새 템플릿을 등록합니다. 생성 후 자동으로 캐시가 갱신됩니다.',
    })
    @ApiResponse({
        status: 200,
        description: '템플릿 생성 성공',
        type: TemplateDetailResponseDto,
    })
    @ApiResponse({ status: 400, description: '잘못된 요청 또는 중복된 템플릿 코드' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    @ApiResponse({ status: 403, description: '권한 없음 (관리자 전용)' })
    async createTemplate(@Body() createData: TemplateCreateRequestDto): Promise<ApiResponseDto<TemplateDetailResponseDto>> {
        const data = await this.alimtalkAdminService.createTemplate(createData);
        return {
            success: true,
            code: 200,
            data,
            message: '알림톡 템플릿 생성 성공',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * 알림톡 템플릿 삭제
     *
     * @param templateCode 삭제할 템플릿 코드
     * @returns 삭제 결과
     */
    @Delete('templates/:templateCode')
    @ApiOperation({
        summary: '알림톡 템플릿 삭제',
        description: '특정 템플릿을 완전히 삭제합니다. 삭제 후 자동으로 캐시가 갱신됩니다.',
    })
    @ApiResponse({
        status: 200,
        description: '템플릿 삭제 성공',
    })
    @ApiResponse({ status: 400, description: '잘못된 요청 또는 템플릿을 찾을 수 없음' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    @ApiResponse({ status: 403, description: '권한 없음 (관리자 전용)' })
    async deleteTemplate(
        @Param('templateCode') templateCode: string,
    ): Promise<ApiResponseDto<{ success: boolean; message: string }>> {
        const data = await this.alimtalkAdminService.deleteTemplate(templateCode);
        return {
            success: true,
            code: 200,
            data,
            message: '알림톡 템플릿 삭제 성공',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * 알림톡 템플릿 캐시 수동 갱신
     *
     * @returns 캐시 갱신 결과
     */
    @Post('templates/refresh-cache')
    @ApiOperation({
        summary: '알림톡 템플릿 캐시 갱신',
        description: 'DB의 템플릿 정보를 메모리 캐시에 다시 로드합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '캐시 갱신 성공',
    })
    @ApiResponse({ status: 400, description: '캐시 갱신 실패' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    @ApiResponse({ status: 403, description: '권한 없음 (관리자 전용)' })
    async refreshCache(): Promise<ApiResponseDto<{ success: boolean; message: string }>> {
        const data = await this.alimtalkAdminService.refreshCache();
        return {
            success: true,
            code: 200,
            data,
            message: '알림톡 템플릿 캐시 갱신 성공',
            timestamp: new Date().toISOString(),
        };
    }
}
