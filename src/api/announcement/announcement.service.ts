import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CustomLoggerService } from '../../common/logger/custom-logger.service';

import { Announcement, AnnouncementDocument } from '../../schema/announcement.schema';

import { PaginationRequestDto } from '../../common/dto/pagination/pagination-request.dto';
import { PaginationBuilder } from '../../common/dto/pagination/pagination-builder.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { AnnouncementResponseDto } from './dto/response/announcement-response.dto';

/**
 * 공지사항 서비스 (공개 API용)
 * 활성화된 공지사항만 조회 가능
 */
@Injectable()
export class AnnouncementService {
    constructor(
        @InjectModel(Announcement.name)
        private readonly announcementModel: Model<AnnouncementDocument>,
        private readonly logger: CustomLoggerService,
    ) {}

    /**
     * 활성화된 공지사항 목록 조회 (페이지네이션)
     * @param paginationDto 페이지네이션 요청 DTO
     * @returns 공지사항 목록 및 페이지네이션 정보
     */
    async getActiveAnnouncements(
        paginationDto: PaginationRequestDto,
    ): Promise<PaginationResponseDto<AnnouncementResponseDto>> {
        try {
            this.logger.logStart('getActiveAnnouncements', '활성화된 공지사항 목록 조회 시작', {
                page: paginationDto.page,
                take: paginationDto.limit,
            });

            const { page = 1, limit = 10 } = paginationDto;
            const skip = (page - 1) * limit;

            // 활성화된 공지사항만 조회, 정렬 순서대로
            const [announcements, totalCount] = await Promise.all([
                this.announcementModel
                    .find({ isActive: true })
                    .sort({ order: 1, createdAt: -1 }) // 정렬 순서 우선, 그 다음 최신순
                    .skip(skip)
                    .limit(limit)
                    .lean()
                    .exec(),
                this.announcementModel.countDocuments({ isActive: true }).exec(),
            ]);

            // DTO 변환
            const items = announcements.map((announcement) => this.toResponseDto(announcement));

            // 페이지네이션 빌더로 응답 생성
            const response = new PaginationBuilder<AnnouncementResponseDto>()
                .setItems(items)
                .setTotalCount(totalCount)
                .setPage(page)
                .setLimit(limit)
                .build();

            this.logger.logSuccess('getActiveAnnouncements', '공지사항 목록 조회 완료', {
                totalCount,
                itemsCount: items.length,
            });

            return response;
        } catch (error) {
            this.logger.logError('getActiveAnnouncements', '공지사항 목록 조회 실패', error);
            throw new BadRequestException('공지사항 목록을 조회할 수 없습니다.');
        }
    }

    /**
     * 특정 공지사항 상세 조회
     * @param announcementId 공지사항 ID
     * @returns 공지사항 상세 정보
     */
    async getAnnouncementById(announcementId: string): Promise<AnnouncementResponseDto> {
        try {
            this.logger.logStart('getAnnouncementById', '공지사항 상세 조회 시작', {
                announcementId,
            });

            if (!Types.ObjectId.isValid(announcementId)) {
                throw new BadRequestException('올바르지 않은 공지사항 ID입니다.');
            }

            const announcement = await this.announcementModel
                .findOne({
                    _id: announcementId,
                    isActive: true, // 활성화된 것만 조회
                })
                .lean()
                .exec();

            if (!announcement) {
                throw new BadRequestException('공지사항을 찾을 수 없습니다.');
            }

            const response = this.toResponseDto(announcement);

            this.logger.logSuccess('getAnnouncementById', '공지사항 상세 조회 완료', {
                announcementId,
            });

            return response;
        } catch (error) {
            this.logger.logError('getAnnouncementById', '공지사항 상세 조회 실패', error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('공지사항을 조회할 수 없습니다.');
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
