import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AlimtalkTemplate, AlimtalkTemplateDocument } from '../../../schema/alimtalk-template.schema';
import { AlimtalkService } from '../alimtalk.service';

import { TemplateUpdateRequestDto } from './dto/request/template-update-request.dto';
import { TemplateListResponseDto, TemplateListItemDto } from './dto/response/template-list-response.dto';
import { TemplateDetailResponseDto } from './dto/response/template-detail-response.dto';

/**
 * 알림톡 템플릿 관리 Admin 서비스
 *
 * 관리자가 알림톡 템플릿을 조회/수정할 수 있는 기능을 제공합니다.
 */
@Injectable()
export class AlimtalkAdminService {
    private readonly logger = new Logger(AlimtalkAdminService.name);

    constructor(
        @InjectModel(AlimtalkTemplate.name)
        private readonly alimtalkTemplateModel: Model<AlimtalkTemplateDocument>,
        private readonly alimtalkService: AlimtalkService,
    ) {}

    /**
     * 전체 알림톡 템플릿 목록 조회
     */
    async getTemplates(): Promise<TemplateListResponseDto> {
        try {
            const templates = await this.alimtalkTemplateModel.find().sort({ createdAt: -1 }).lean().exec();

            const templateList: TemplateListItemDto[] = templates.map((template: any) => ({
                templateCode: template.templateCode,
                templateId: template.templateId,
                name: template.name,
                description: template.description,
                requiredVariables: template.requiredVariables,
                fallbackToSms: template.fallbackToSms,
                isActive: template.isActive,
                reviewStatus: template.reviewStatus,
                memo: template.memo,
                buttons: template.buttons,
                createdAt: template.createdAt ? new Date(template.createdAt).toISOString() : new Date().toISOString(),
                updatedAt: template.updatedAt ? new Date(template.updatedAt).toISOString() : new Date().toISOString(),
            }));

            return {
                templates: templateList,
                totalCount: templateList.length,
            };
        } catch (error) {
            this.logger.error(`[getTemplates] 템플릿 목록 조회 실패: ${error.message}`);
            throw new BadRequestException('템플릿 목록 조회에 실패했습니다.');
        }
    }

    /**
     * 특정 알림톡 템플릿 상세 조회
     */
    async getTemplateByCode(templateCode: string): Promise<TemplateDetailResponseDto> {
        try {
            const template: any = await this.alimtalkTemplateModel.findOne({ templateCode }).lean().exec();

            if (!template) {
                throw new BadRequestException(`템플릿을 찾을 수 없습니다: ${templateCode}`);
            }

            return {
                templateCode: template.templateCode,
                templateId: template.templateId,
                name: template.name,
                description: template.description,
                requiredVariables: template.requiredVariables,
                fallbackToSms: template.fallbackToSms,
                isActive: template.isActive,
                reviewStatus: template.reviewStatus,
                memo: template.memo,
                buttons: template.buttons,
                createdAt: template.createdAt ? new Date(template.createdAt).toISOString() : new Date().toISOString(),
                updatedAt: template.updatedAt ? new Date(template.updatedAt).toISOString() : new Date().toISOString(),
            };
        } catch (error) {
            this.logger.error(`[getTemplateByCode] 템플릿 조회 실패: ${error.message}`);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('템플릿 조회에 실패했습니다.');
        }
    }

    /**
     * 알림톡 템플릿 수정
     */
    async updateTemplate(
        templateCode: string,
        updateData: TemplateUpdateRequestDto,
    ): Promise<TemplateDetailResponseDto> {
        try {
            // 템플릿 존재 여부 확인
            const existingTemplate = await this.alimtalkTemplateModel.findOne({ templateCode }).exec();

            if (!existingTemplate) {
                throw new BadRequestException(`템플릿을 찾을 수 없습니다: ${templateCode}`);
            }

            // 템플릿 업데이트
            const updatedTemplate: any = await this.alimtalkTemplateModel
                .findOneAndUpdate({ templateCode }, { $set: updateData }, { new: true })
                .lean()
                .exec();

            if (!updatedTemplate) {
                throw new BadRequestException('템플릿 업데이트에 실패했습니다.');
            }

            this.logger.log(`[updateTemplate] 템플릿 업데이트 성공: ${templateCode}`);

            // 템플릿 캐시 갱신
            await this.alimtalkService.refreshTemplateCache();

            return {
                templateCode: updatedTemplate.templateCode,
                templateId: updatedTemplate.templateId,
                name: updatedTemplate.name,
                description: updatedTemplate.description,
                requiredVariables: updatedTemplate.requiredVariables,
                fallbackToSms: updatedTemplate.fallbackToSms,
                isActive: updatedTemplate.isActive,
                reviewStatus: updatedTemplate.reviewStatus,
                memo: updatedTemplate.memo,
                buttons: updatedTemplate.buttons,
                createdAt: updatedTemplate.createdAt
                    ? new Date(updatedTemplate.createdAt).toISOString()
                    : new Date().toISOString(),
                updatedAt: updatedTemplate.updatedAt
                    ? new Date(updatedTemplate.updatedAt).toISOString()
                    : new Date().toISOString(),
            };
        } catch (error) {
            this.logger.error(`[updateTemplate] 템플릿 업데이트 실패: ${error.message}`);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('템플릿 업데이트에 실패했습니다.');
        }
    }

    /**
     * 알림톡 템플릿 캐시 수동 갱신
     */
    async refreshCache(): Promise<{ success: boolean; message: string }> {
        try {
            await this.alimtalkService.refreshTemplateCache();
            this.logger.log('[refreshCache] 템플릿 캐시 갱신 완료');

            return {
                success: true,
                message: '템플릿 캐시가 성공적으로 갱신되었습니다.',
            };
        } catch (error) {
            this.logger.error(`[refreshCache] 템플릿 캐시 갱신 실패: ${error.message}`);
            throw new BadRequestException('템플릿 캐시 갱신에 실패했습니다.');
        }
    }
}
