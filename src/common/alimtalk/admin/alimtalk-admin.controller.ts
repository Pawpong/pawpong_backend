import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { ApiResponseDto } from '../../dto/response/api-response.dto';
import { CreateAlimtalkTemplateUseCase } from './application/use-cases/create-alimtalk-template.use-case';
import { DeleteAlimtalkTemplateUseCase } from './application/use-cases/delete-alimtalk-template.use-case';
import { GetAlimtalkTemplateByCodeUseCase } from './application/use-cases/get-alimtalk-template-by-code.use-case';
import { GetAlimtalkTemplatesUseCase } from './application/use-cases/get-alimtalk-templates.use-case';
import { RefreshAlimtalkTemplateCacheUseCase } from './application/use-cases/refresh-alimtalk-template-cache.use-case';
import { UpdateAlimtalkTemplateUseCase } from './application/use-cases/update-alimtalk-template.use-case';
import { ALIMTALK_ADMIN_RESPONSE_MESSAGES } from './constants/alimtalk-admin-response-messages';
import { AlimtalkAdminProtectedController } from './decorator/alimtalk-admin-controller.decorator';
import { TemplateCreateRequestDto } from './dto/request/template-create-request.dto';
import { TemplateUpdateRequestDto } from './dto/request/template-update-request.dto';
import { TemplateActionResponseDto } from './dto/response/template-action-response.dto';
import { TemplateDetailResponseDto } from './dto/response/template-detail-response.dto';
import { TemplateListResponseDto } from './dto/response/template-list-response.dto';
import {
    ApiCreateAlimtalkTemplateEndpoint,
    ApiDeleteAlimtalkTemplateEndpoint,
    ApiGetAlimtalkTemplateByCodeEndpoint,
    ApiGetAlimtalkTemplatesEndpoint,
    ApiRefreshAlimtalkTemplateCacheEndpoint,
    ApiUpdateAlimtalkTemplateEndpoint,
} from './swagger';

@AlimtalkAdminProtectedController()
export class AlimtalkAdminController {
    constructor(
        private readonly getAlimtalkTemplatesUseCase: GetAlimtalkTemplatesUseCase,
        private readonly getAlimtalkTemplateByCodeUseCase: GetAlimtalkTemplateByCodeUseCase,
        private readonly updateAlimtalkTemplateUseCase: UpdateAlimtalkTemplateUseCase,
        private readonly createAlimtalkTemplateUseCase: CreateAlimtalkTemplateUseCase,
        private readonly deleteAlimtalkTemplateUseCase: DeleteAlimtalkTemplateUseCase,
        private readonly refreshAlimtalkTemplateCacheUseCase: RefreshAlimtalkTemplateCacheUseCase,
    ) {}

    @Get('templates')
    @ApiGetAlimtalkTemplatesEndpoint()
    async getTemplates(): Promise<ApiResponseDto<TemplateListResponseDto>> {
        const data = await this.getAlimtalkTemplatesUseCase.execute();
        return ApiResponseDto.success(data, ALIMTALK_ADMIN_RESPONSE_MESSAGES.templateListRetrieved);
    }

    @Get('templates/:templateCode')
    @ApiGetAlimtalkTemplateByCodeEndpoint()
    async getTemplateByCode(
        @Param('templateCode') templateCode: string,
    ): Promise<ApiResponseDto<TemplateDetailResponseDto>> {
        const data = await this.getAlimtalkTemplateByCodeUseCase.execute(templateCode);
        return ApiResponseDto.success(data, ALIMTALK_ADMIN_RESPONSE_MESSAGES.templateDetailRetrieved);
    }

    @Put('templates/:templateCode')
    @ApiUpdateAlimtalkTemplateEndpoint()
    async updateTemplate(
        @Param('templateCode') templateCode: string,
        @Body() updateData: TemplateUpdateRequestDto,
    ): Promise<ApiResponseDto<TemplateDetailResponseDto>> {
        const data = await this.updateAlimtalkTemplateUseCase.execute(templateCode, updateData);
        return ApiResponseDto.success(data, ALIMTALK_ADMIN_RESPONSE_MESSAGES.templateUpdated);
    }

    @Post('templates')
    @ApiCreateAlimtalkTemplateEndpoint()
    async createTemplate(
        @Body() createData: TemplateCreateRequestDto,
    ): Promise<ApiResponseDto<TemplateDetailResponseDto>> {
        const data = await this.createAlimtalkTemplateUseCase.execute(createData);
        return ApiResponseDto.success(data, ALIMTALK_ADMIN_RESPONSE_MESSAGES.templateCreated);
    }

    @Delete('templates/:templateCode')
    @ApiDeleteAlimtalkTemplateEndpoint()
    async deleteTemplate(
        @Param('templateCode') templateCode: string,
    ): Promise<ApiResponseDto<TemplateActionResponseDto>> {
        const data = await this.deleteAlimtalkTemplateUseCase.execute(templateCode);
        return ApiResponseDto.success(data, ALIMTALK_ADMIN_RESPONSE_MESSAGES.templateDeleted);
    }

    @Post('templates/refresh-cache')
    @ApiRefreshAlimtalkTemplateCacheEndpoint()
    async refreshCache(): Promise<ApiResponseDto<TemplateActionResponseDto>> {
        const data = await this.refreshAlimtalkTemplateCacheUseCase.execute();
        return ApiResponseDto.success(data, ALIMTALK_ADMIN_RESPONSE_MESSAGES.cacheRefreshed);
    }
}
