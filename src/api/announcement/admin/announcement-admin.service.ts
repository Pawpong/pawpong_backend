import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CustomLoggerService } from '../../../common/logger/custom-logger.service';

import { Announcement, AnnouncementDocument } from '../../../schema/announcement.schema';

import { PaginationBuilder } from '../../../common/dto/pagination/pagination-builder.dto';
import { PaginationRequestDto } from '../../../common/dto/pagination/pagination-request.dto';
import { AnnouncementCreateRequestDto } from '../dto/request/announcement-create-request.dto';
import { AnnouncementUpdateRequestDto } from '../dto/request/announcement-update-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { AnnouncementResponseDto } from '../dto/response/announcement-response.dto';

/**
 * 공지사항 관리자 서비스
 * 관리자 전용 CRUD 기능 제공
 */
@Injectable()
export class AnnouncementAdminService {
    constructor(
        @InjectModel(Announcement.name)
        private readonly announcementModel: Model<AnnouncementDocument>,
        private readonly logger: CustomLoggerService,
    ) {}

    /**
     * 공지사항 목록 조회 (관리자용 - 비활성화된 것도 포함)
     * @param paginationDto 페이지네이션 요청 DTO
     * @returns 공지사항 목록 및 페이지네이션 정보
     */
    async getAllAnnouncements(
        paginationDto: PaginationRequestDto,
    ): Promise<PaginationResponseDto<AnnouncementResponseDto>> {
        try {
            this.logger.logStart('getAllAnnouncements', '관리자 공지사항 목록 조회 시작', {
                page: paginationDto.page,
                take: paginationDto.take,
            });

            const { page = 1, take = 10 } = paginationDto;
            const skip = (page - 1) * take;

            // 모든 공지사항 조회 (비활성화된 것도 포함)
            const [announcements, totalCount] = await Promise.all([
                this.announcementModel.find().sort({ order: 1, createdAt: -1 }).skip(skip).limit(take).lean().exec(),
                this.announcementModel.countDocuments().exec(),
            ]);

            // DTO 변환
            const items = announcements.map((announcement) => this.toResponseDto(announcement));

            // 페이지네이션 빌더로 응답 생성
            const response = new PaginationBuilder<AnnouncementResponseDto>()
                .setItems(items)
                .setTotalCount(totalCount)
                .setPage(page)
                .setTake(take)
                .build();

            this.logger.logSuccess('getAllAnnouncements', '관리자 공지사항 목록 조회 완료', {
                totalCount,
                itemsCount: items.length,
            });

            return response;
        } catch (error) {
            this.logger.logError('getAllAnnouncements', '관리자 공지사항 목록 조회 실패', error);
            throw new BadRequestException('공지사항 목록을 조회할 수 없습니다.');
        }
    }

    /**
     * 공지사항 생성 (관리자 전용)
     * @param createDto 공지사항 생성 요청 DTO
     * @returns 생성된 공지사항 정보
     */
    async createAnnouncement(createDto: AnnouncementCreateRequestDto): Promise<AnnouncementResponseDto> {
        try {
            this.logger.logStart('createAnnouncement', '공지사항 생성 시작', createDto);

            const newAnnouncement = new this.announcementModel({
                title: createDto.title,
                content: createDto.content,
                isActive: createDto.isActive ?? true,
                order: createDto.order ?? 0,
            });

            const savedAnnouncement = await newAnnouncement.save();
            const response = this.toResponseDto(savedAnnouncement.toObject());

            this.logger.logSuccess('createAnnouncement', '공지사항 생성 완료', {
                announcementId: response.announcementId,
            });

            return response;
        } catch (error) {
            this.logger.logError('createAnnouncement', '공지사항 생성 실패', error);
            throw new BadRequestException('공지사항을 생성할 수 없습니다.');
        }
    }

    /**
     * 공지사항 수정 (관리자 전용)
     * @param announcementId 공지사항 ID
     * @param updateDto 공지사항 수정 요청 DTO
     * @returns 수정된 공지사항 정보
     */
    async updateAnnouncement(
        announcementId: string,
        updateDto: AnnouncementUpdateRequestDto,
    ): Promise<AnnouncementResponseDto> {
        try {
            this.logger.logStart('updateAnnouncement', '공지사항 수정 시작', {
                announcementId,
                ...updateDto,
            });

            if (!Types.ObjectId.isValid(announcementId)) {
                throw new BadRequestException('올바르지 않은 공지사항 ID입니다.');
            }

            const announcement = await this.announcementModel.findById(announcementId).exec();

            if (!announcement) {
                throw new BadRequestException('공지사항을 찾을 수 없습니다.');
            }

            // 변경사항 적용
            if (updateDto.title !== undefined) {
                announcement.title = updateDto.title;
            }
            if (updateDto.content !== undefined) {
                announcement.content = updateDto.content;
            }
            if (updateDto.isActive !== undefined) {
                announcement.isActive = updateDto.isActive;
            }
            if (updateDto.order !== undefined) {
                announcement.order = updateDto.order;
            }

            const updatedAnnouncement = await announcement.save();
            const response = this.toResponseDto(updatedAnnouncement.toObject());

            this.logger.logSuccess('updateAnnouncement', '공지사항 수정 완료', {
                announcementId,
            });

            return response;
        } catch (error) {
            this.logger.logError('updateAnnouncement', '공지사항 수정 실패', error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('공지사항을 수정할 수 없습니다.');
        }
    }

    /**
     * 공지사항 삭제 (관리자 전용)
     * @param announcementId 공지사항 ID
     */
    async deleteAnnouncement(announcementId: string): Promise<void> {
        try {
            this.logger.logStart('deleteAnnouncement', '공지사항 삭제 시작', {
                announcementId,
            });

            if (!Types.ObjectId.isValid(announcementId)) {
                throw new BadRequestException('올바르지 않은 공지사항 ID입니다.');
            }

            const result = await this.announcementModel.findByIdAndDelete(announcementId).exec();

            if (!result) {
                throw new BadRequestException('공지사항을 찾을 수 없습니다.');
            }

            this.logger.logSuccess('deleteAnnouncement', '공지사항 삭제 완료', {
                announcementId,
            });
        } catch (error) {
            this.logger.logError('deleteAnnouncement', '공지사항 삭제 실패', error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('공지사항을 삭제할 수 없습니다.');
        }
    }

    /**
     * Announcement 문서를 ResponseDto로 변환
     * @param announcement Announcement 문서
     * @returns AnnouncementResponseDto
     */
    private toResponseDto(announcement: any): AnnouncementResponseDto {
        return {
            announcementId: announcement._id.toString(),
            title: announcement.title,
            content: announcement.content,
            isActive: announcement.isActive,
            order: announcement.order,
            createdAt: announcement.createdAt,
            updatedAt: announcement.updatedAt,
        };
    }
}
