import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CustomLoggerService } from '../../../common/logger/custom-logger.service';

import { AppVersion } from '../../../schema/app-version.schema';

import { AppVersionCreateRequestDto } from '../dto/request/app-version-create-request.dto';
import { AppVersionUpdateRequestDto } from '../dto/request/app-version-update-request.dto';
import { AppVersionResponseDto } from '../dto/response/app-version-response.dto';
import { PaginationBuilder } from '../../../common/dto/pagination/pagination-builder.dto';
import { PaginationRequestDto } from '../../../common/dto/pagination/pagination-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';

/**
 * 앱 버전 관리 서비스 (관리자 전용)
 * 앱 강제/권장 업데이트 버전 정보 CRUD
 */
@Injectable()
export class AppVersionAdminService {
    constructor(
        @InjectModel(AppVersion.name) private appVersionModel: Model<AppVersion>,
        private readonly logger: CustomLoggerService,
    ) {}

    /**
     * 앱 버전 생성 (관리자 전용)
     */
    async createAppVersion(adminId: string, createData: AppVersionCreateRequestDto): Promise<AppVersionResponseDto> {
        this.logger.logStart('createAppVersion', '앱 버전 생성 시작', { adminId, platform: createData.platform });

        if (!adminId) {
            throw new BadRequestException('관리자 정보가 올바르지 않습니다.');
        }

        try {
            const appVersion = new this.appVersionModel({
                ...createData,
                isActive: createData.isActive ?? true,
            });

            await appVersion.save();

            this.logger.logSuccess('createAppVersion', '앱 버전 생성 완료', {
                appVersionId: appVersion._id.toString(),
                platform: createData.platform,
                latestVersion: createData.latestVersion,
            });

            return this.toResponseDto(appVersion);
        } catch (error) {
            this.logger.logError('createAppVersion', '앱 버전 생성', error);
            throw new BadRequestException('앱 버전 생성에 실패했습니다.');
        }
    }

    /**
     * 앱 버전 목록 조회 (관리자 전용)
     */
    async getAppVersionList(paginationData: PaginationRequestDto): Promise<PaginationResponseDto<AppVersionResponseDto>> {
        this.logger.logStart('getAppVersionList', '앱 버전 목록 조회 시작', paginationData);

        const { page = 1, limit = 10 } = paginationData;
        const skip = (page - 1) * limit;

        try {
            const totalItems = await this.appVersionModel.countDocuments();

            const versions = await this.appVersionModel
                .find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec();

            const items = versions.map((v) => this.toResponseDto(v));

            this.logger.logSuccess('getAppVersionList', '앱 버전 목록 조회 완료', {
                totalItems,
                currentPage: page,
            });

            return new PaginationBuilder<AppVersionResponseDto>()
                .setItems(items)
                .setPage(page)
                .setLimit(limit)
                .setTotalCount(totalItems)
                .build();
        } catch (error) {
            this.logger.logError('getAppVersionList', '앱 버전 목록 조회', error);
            throw new BadRequestException('앱 버전 목록 조회에 실패했습니다.');
        }
    }

    /**
     * 앱 버전 수정 (관리자 전용)
     */
    async updateAppVersion(
        appVersionId: string,
        adminId: string,
        updateData: AppVersionUpdateRequestDto,
    ): Promise<AppVersionResponseDto> {
        this.logger.logStart('updateAppVersion', '앱 버전 수정 시작', { appVersionId, adminId });

        if (!appVersionId) {
            throw new BadRequestException('앱 버전 ID가 필요합니다.');
        }

        if (!adminId) {
            throw new BadRequestException('관리자 정보가 올바르지 않습니다.');
        }

        try {
            const appVersion = await this.appVersionModel.findById(appVersionId).exec();

            if (!appVersion) {
                throw new NotFoundException('앱 버전 정보를 찾을 수 없습니다.');
            }

            // 수정 가능한 필드만 업데이트
            if (updateData.latestVersion !== undefined) appVersion.latestVersion = updateData.latestVersion;
            if (updateData.minRequiredVersion !== undefined) appVersion.minRequiredVersion = updateData.minRequiredVersion;
            if (updateData.forceUpdateMessage !== undefined) appVersion.forceUpdateMessage = updateData.forceUpdateMessage;
            if (updateData.recommendUpdateMessage !== undefined)
                appVersion.recommendUpdateMessage = updateData.recommendUpdateMessage;
            if (updateData.iosStoreUrl !== undefined) appVersion.iosStoreUrl = updateData.iosStoreUrl;
            if (updateData.androidStoreUrl !== undefined) appVersion.androidStoreUrl = updateData.androidStoreUrl;
            if (updateData.isActive !== undefined) appVersion.isActive = updateData.isActive;

            await appVersion.save();

            this.logger.logSuccess('updateAppVersion', '앱 버전 수정 완료', { appVersionId });

            return this.toResponseDto(appVersion);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.logError('updateAppVersion', '앱 버전 수정', error);
            throw new BadRequestException('앱 버전 수정에 실패했습니다.');
        }
    }

    /**
     * 앱 버전 삭제 (관리자 전용)
     */
    async deleteAppVersion(appVersionId: string, adminId: string): Promise<void> {
        this.logger.logStart('deleteAppVersion', '앱 버전 삭제 시작', { appVersionId, adminId });

        if (!appVersionId) {
            throw new BadRequestException('앱 버전 ID가 필요합니다.');
        }

        if (!adminId) {
            throw new BadRequestException('관리자 정보가 올바르지 않습니다.');
        }

        try {
            const result = await this.appVersionModel.findByIdAndDelete(appVersionId).exec();

            if (!result) {
                throw new NotFoundException('앱 버전 정보를 찾을 수 없습니다.');
            }

            this.logger.logSuccess('deleteAppVersion', '앱 버전 삭제 완료', { appVersionId });
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.logError('deleteAppVersion', '앱 버전 삭제', error);
            throw new BadRequestException('앱 버전 삭제에 실패했습니다.');
        }
    }

    /**
     * AppVersion 엔티티를 ResponseDto로 변환
     */
    private toResponseDto(v: any): AppVersionResponseDto {
        return {
            appVersionId: v._id.toString(),
            platform: v.platform,
            latestVersion: v.latestVersion,
            minRequiredVersion: v.minRequiredVersion,
            forceUpdateMessage: v.forceUpdateMessage,
            recommendUpdateMessage: v.recommendUpdateMessage,
            iosStoreUrl: v.iosStoreUrl,
            androidStoreUrl: v.androidStoreUrl,
            isActive: v.isActive,
            createdAt: v.createdAt.toISOString(),
            updatedAt: v.updatedAt.toISOString(),
        };
    }
}
