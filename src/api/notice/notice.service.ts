import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CustomLoggerService } from '../../common/logger/custom-logger.service';

import { Notice } from '../../schema/notice.schema';

import { PaginationBuilder } from '../../common/dto/pagination/pagination-builder.dto';
import { PaginationRequestDto } from '../../common/dto/pagination/pagination-request.dto';
import { NoticeCreateRequestDto } from './dto/request/notice-create-request.dto';
import { NoticeUpdateRequestDto } from './dto/request/notice-update-request.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { NoticeResponseDto } from './dto/response/notice-response.dto';

/**
 * 공지사항 서비스
 * 공지사항 CRUD 및 조회 기능 제공
 */
@Injectable()
export class NoticeService {
    constructor(
        @InjectModel(Notice.name) private noticeModel: Model<Notice>,
        private readonly logger: CustomLoggerService,
    ) {}

    /**
     * 공지사항 생성 (관리자 전용)
     */
    async createNotice(
        adminId: string,
        adminName: string,
        createData: NoticeCreateRequestDto,
    ): Promise<NoticeResponseDto> {
        this.logger.logStart('createNotice', '공지사항 생성 시작', { adminId, createData });

        if (!adminId) {
            throw new BadRequestException('관리자 정보가 올바르지 않습니다.');
        }

        try {
            const notice = new this.noticeModel({
                ...createData,
                authorId: adminId,
                authorName: adminName,
                status: createData.status || 'published',
                isPinned: createData.isPinned || false,
                viewCount: 0,
            });

            await notice.save();

            this.logger.logSuccess('createNotice', '공지사항 생성 완료', {
                noticeId: notice._id.toString(),
            });

            return this.toResponseDto(notice);
        } catch (error) {
            this.logger.logError('createNotice', '공지사항 생성', error);
            throw new BadRequestException('공지사항 생성에 실패했습니다.');
        }
    }

    /**
     * 공지사항 목록 조회 (페이지네이션)
     */
    async getNoticeList(
        paginationData: PaginationRequestDto,
        status?: 'published' | 'draft' | 'archived',
    ): Promise<PaginationResponseDto<NoticeResponseDto>> {
        this.logger.logStart('getNoticeList', '공지사항 목록 조회 시작', {
            ...paginationData,
            status,
        });

        const { page = 1, take = 10 } = paginationData;
        const skip = (page - 1) * take;

        // 필터 조건
        const filter: any = {};
        if (status) {
            filter.status = status;
        } else {
            filter.status = 'published'; // 기본적으로 게시된 공지만 조회
        }

        try {
            // 전체 개수 조회
            const totalItems = await this.noticeModel.countDocuments(filter);

            // 공지사항 목록 조회 (고정 공지 우선, 최신순)
            const notices = await this.noticeModel
                .find(filter)
                .sort({ isPinned: -1, createdAt: -1 })
                .skip(skip)
                .limit(take)
                .lean()
                .exec();

            const items = notices.map((notice) => this.toResponseDto(notice));

            this.logger.logSuccess('getNoticeList', '공지사항 목록 조회 완료', {
                totalItems,
                currentPage: page,
            });

            return new PaginationBuilder<NoticeResponseDto>()
                .setItems(items)
                .setPage(page)
                .setTake(take)
                .setTotalCount(totalItems)
                .build();
        } catch (error) {
            this.logger.logError('getNoticeList', '공지사항 목록 조회', error);
            throw new BadRequestException('공지사항 목록 조회에 실패했습니다.');
        }
    }

    /**
     * 공지사항 상세 조회
     */
    async getNoticeDetail(noticeId: string, increaseView: boolean = true): Promise<NoticeResponseDto> {
        this.logger.logStart('getNoticeDetail', '공지사항 상세 조회 시작', { noticeId });

        if (!noticeId) {
            throw new BadRequestException('공지사항 ID가 필요합니다.');
        }

        try {
            const notice = await this.noticeModel.findById(noticeId).lean().exec();

            if (!notice) {
                throw new NotFoundException('공지사항을 찾을 수 없습니다.');
            }

            // 조회수 증가 (관리자가 아닌 일반 사용자 조회 시)
            if (increaseView) {
                await this.noticeModel.findByIdAndUpdate(noticeId, { $inc: { viewCount: 1 } });
            }

            this.logger.logSuccess('getNoticeDetail', '공지사항 상세 조회 완료', { noticeId });

            return this.toResponseDto(notice);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.logError('getNoticeDetail', '공지사항 상세 조회', error);
            throw new BadRequestException('공지사항 조회에 실패했습니다.');
        }
    }

    /**
     * 공지사항 수정 (관리자 전용)
     */
    async updateNotice(
        noticeId: string,
        adminId: string,
        updateData: NoticeUpdateRequestDto,
    ): Promise<NoticeResponseDto> {
        this.logger.logStart('updateNotice', '공지사항 수정 시작', { noticeId, adminId });

        if (!noticeId) {
            throw new BadRequestException('공지사항 ID가 필요합니다.');
        }

        if (!adminId) {
            throw new BadRequestException('관리자 정보가 올바르지 않습니다.');
        }

        try {
            const notice = await this.noticeModel.findById(noticeId).exec();

            if (!notice) {
                throw new NotFoundException('공지사항을 찾을 수 없습니다.');
            }

            // 수정 가능한 필드만 업데이트
            if (updateData.title !== undefined) notice.title = updateData.title;
            if (updateData.content !== undefined) notice.content = updateData.content;
            if (updateData.status !== undefined) notice.status = updateData.status;
            if (updateData.isPinned !== undefined) notice.isPinned = updateData.isPinned;
            if (updateData.publishedAt !== undefined) notice.publishedAt = new Date(updateData.publishedAt);
            if (updateData.expiredAt !== undefined) notice.expiredAt = new Date(updateData.expiredAt);

            await notice.save();

            this.logger.logSuccess('updateNotice', '공지사항 수정 완료', { noticeId });

            return this.toResponseDto(notice);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.logError('updateNotice', '공지사항 수정', error);
            throw new BadRequestException('공지사항 수정에 실패했습니다.');
        }
    }

    /**
     * 공지사항 삭제 (관리자 전용)
     */
    async deleteNotice(noticeId: string, adminId: string): Promise<void> {
        this.logger.logStart('deleteNotice', '공지사항 삭제 시작', { noticeId, adminId });

        if (!noticeId) {
            throw new BadRequestException('공지사항 ID가 필요합니다.');
        }

        if (!adminId) {
            throw new BadRequestException('관리자 정보가 올바르지 않습니다.');
        }

        try {
            const result = await this.noticeModel.findByIdAndDelete(noticeId).exec();

            if (!result) {
                throw new NotFoundException('공지사항을 찾을 수 없습니다.');
            }

            this.logger.logSuccess('deleteNotice', '공지사항 삭제 완료', { noticeId });
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.logError('deleteNotice', '공지사항 삭제', error);
            throw new BadRequestException('공지사항 삭제에 실패했습니다.');
        }
    }

    /**
     * Notice 엔티티를 ResponseDto로 변환
     */
    private toResponseDto(notice: any): NoticeResponseDto {
        return {
            noticeId: notice._id.toString(),
            title: notice.title,
            content: notice.content,
            authorName: notice.authorName,
            status: notice.status,
            isPinned: notice.isPinned,
            viewCount: notice.viewCount || 0,
            publishedAt: notice.publishedAt?.toISOString(),
            expiredAt: notice.expiredAt?.toISOString(),
            createdAt: notice.createdAt.toISOString(),
            updatedAt: notice.updatedAt.toISOString(),
        };
    }
}
