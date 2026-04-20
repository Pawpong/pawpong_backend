import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { DomainConflictError, DomainError, DomainNotFoundError } from '../../../common/error/domain.error';
import { AlimtalkTemplate, AlimtalkTemplateDocument } from '../../../schema/alimtalk-template.schema';
import { getErrorMessage } from '../../utils/error.util';
import { AlimtalkService } from '../alimtalk.service';

import { TemplateUpdateRequestDto } from './dto/request/template-update-request.dto';
import { TemplateCreateRequestDto } from './dto/request/template-create-request.dto';
import { TemplateListResponseDto, TemplateListItemDto } from './dto/response/template-list-response.dto';
import { TemplateDetailResponseDto } from './dto/response/template-detail-response.dto';

type AlimtalkTemplateRecord = Pick<
    AlimtalkTemplate,
    | 'templateCode'
    | 'templateId'
    | 'name'
    | 'description'
    | 'requiredVariables'
    | 'fallbackToSms'
    | 'isActive'
    | 'reviewStatus'
    | 'memo'
    | 'buttons'
> & {
    createdAt?: Date | string;
    updatedAt?: Date | string;
};

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

    private toIsoString(value?: Date | string): string {
        return value ? new Date(value).toISOString() : new Date().toISOString();
    }

    private toTemplateListItem(template: AlimtalkTemplateRecord): TemplateListItemDto {
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
            createdAt: this.toIsoString(template.createdAt),
            updatedAt: this.toIsoString(template.updatedAt),
        };
    }

    private toTemplateDetail(template: AlimtalkTemplateRecord): TemplateDetailResponseDto {
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
            createdAt: this.toIsoString(template.createdAt),
            updatedAt: this.toIsoString(template.updatedAt),
        };
    }

    private rethrowUnexpectedError(action: string, error: unknown): never {
        if (error instanceof DomainError) {
            throw error;
        }

        this.logger.error(`[${action}] ${getErrorMessage(error)}`);
        throw error;
    }

    /**
     * 전체 알림톡 템플릿 목록 조회
     */
    async getTemplates(): Promise<TemplateListResponseDto> {
        try {
            const templates = await this.alimtalkTemplateModel
                .find()
                .sort({ createdAt: -1 })
                .lean<AlimtalkTemplateRecord[]>()
                .exec();

            const templateList = templates.map((template) => this.toTemplateListItem(template));

            return {
                templates: templateList,
                totalCount: templateList.length,
            };
        } catch (error) {
            this.rethrowUnexpectedError('getTemplates', error);
        }
    }

    /**
     * 특정 알림톡 템플릿 상세 조회
     */
    async getTemplateByCode(templateCode: string): Promise<TemplateDetailResponseDto> {
        try {
            const template = await this.alimtalkTemplateModel
                .findOne({ templateCode })
                .lean<AlimtalkTemplateRecord | null>()
                .exec();

            if (!template) {
                throw new DomainNotFoundError(`템플릿을 찾을 수 없습니다: ${templateCode}`);
            }

            return this.toTemplateDetail(template);
        } catch (error) {
            this.rethrowUnexpectedError('getTemplateByCode', error);
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
            const updatedTemplate = await this.alimtalkTemplateModel
                .findOneAndUpdate({ templateCode }, { $set: updateData }, { new: true })
                .lean<AlimtalkTemplateRecord | null>()
                .exec();

            if (!updatedTemplate) {
                throw new DomainNotFoundError(`템플릿을 찾을 수 없습니다: ${templateCode}`);
            }

            this.logger.log(`[updateTemplate] 템플릿 업데이트 성공: ${templateCode}`);

            await this.alimtalkService.refreshTemplateCache();

            return this.toTemplateDetail(updatedTemplate);
        } catch (error) {
            this.rethrowUnexpectedError('updateTemplate', error);
        }
    }

    /**
     * 알림톡 템플릿 생성
     */
    async createTemplate(createData: TemplateCreateRequestDto): Promise<TemplateDetailResponseDto> {
        try {
            const existingTemplate = await this.alimtalkTemplateModel
                .findOne({ templateCode: createData.templateCode })
                .exec();

            if (existingTemplate) {
                throw new DomainConflictError(`이미 존재하는 템플릿 코드입니다: ${createData.templateCode}`);
            }

            const newTemplate = await this.alimtalkTemplateModel.create({
                ...createData,
                fallbackToSms: createData.fallbackToSms ?? true,
                isActive: createData.isActive ?? true,
                reviewStatus: createData.reviewStatus ?? 'approved',
                buttons: createData.buttons ?? [],
            });

            this.logger.log(`[createTemplate] 템플릿 생성 성공: ${createData.templateCode}`);

            await this.alimtalkService.refreshTemplateCache();

            const template = newTemplate.toObject<AlimtalkTemplateRecord>();

            return this.toTemplateDetail(template);
        } catch (error) {
            this.rethrowUnexpectedError('createTemplate', error);
        }
    }

    /**
     * 알림톡 템플릿 삭제 (물리적 삭제)
     */
    async deleteTemplate(templateCode: string): Promise<{ success: boolean; message: string }> {
        try {
            const template = await this.alimtalkTemplateModel.findOne({ templateCode }).exec();

            if (!template) {
                throw new DomainNotFoundError(`템플릿을 찾을 수 없습니다: ${templateCode}`);
            }

            await this.alimtalkTemplateModel.deleteOne({ templateCode }).exec();

            this.logger.log(`[deleteTemplate] 템플릿 삭제 성공: ${templateCode}`);

            await this.alimtalkService.refreshTemplateCache();

            return {
                success: true,
                message: `템플릿이 삭제되었습니다: ${templateCode}`,
            };
        } catch (error) {
            this.rethrowUnexpectedError('deleteTemplate', error);
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
            this.rethrowUnexpectedError('refreshCache', error);
        }
    }
}
