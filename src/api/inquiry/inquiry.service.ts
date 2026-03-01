import { Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

import { StorageService } from '../../common/storage/storage.service';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';

import { InquiryRepository } from './inquiry.repository';

import {
    InquiryCreateRequestDto,
    InquiryUpdateRequestDto,
    InquiryAnswerCreateRequestDto,
} from './dto/request/inquiry-create-request.dto';
import { InquiryDetailResponseDto, InquiryAnswerDto } from './dto/response/inquiry-detail-response.dto';
import { InquiryListResponseDto, InquiryListItemDto, LatestAnswerDto } from './dto/response/inquiry-list-response.dto';

/**
 * 문의 서비스
 * 입양자 질문 작성, 브리더 답변, 목록/상세 조회
 * 비즈니스 로직만 담당 - DB 접근은 InquiryRepository에 위임
 */
@Injectable()
export class InquiryService {
    constructor(
        private readonly inquiryRepository: InquiryRepository,
        private readonly storageService: StorageService,
        private readonly logger: CustomLoggerService,
    ) {}

    /**
     * 문의 목록 조회 (공통 질문만, 무한스크롤)
     * common 타입만 공개, direct는 목록에 노출되지 않음
     */
    async getInquiryList(
        page: number = 1,
        limit: number = 15,
        animalType?: 'dog' | 'cat',
        sort: string = 'latest_answer',
    ): Promise<InquiryListResponseDto> {
        this.logger.logStart('getInquiryList', '문의 목록 조회', { page, limit, animalType, sort });

        const skip = (page - 1) * limit;

        // 공통 질문만 조회 (direct는 목록에 노출 안 됨)
        const filter: any = { type: 'common', status: 'active' };
        if (animalType) {
            filter.animalType = animalType;
        }

        // 정렬 옵션
        let sortOption: any = {};
        switch (sort) {
            case 'latest_answer':
                sortOption = { latestAnsweredAt: -1, createdAt: -1 };
                break;
            case 'most_viewed':
                sortOption = { viewCount: -1, createdAt: -1 };
                break;
            case 'latest':
            default:
                sortOption = { createdAt: -1 };
                break;
        }

        const items = await this.inquiryRepository.findPublicList(filter, sortOption, skip, limit + 1);

        const hasMore = items.length > limit;
        const pagedItems = hasMore ? items.slice(0, limit) : items;

        const data: InquiryListItemDto[] = pagedItems.map((inquiry) => {
            // 최신 답변 추출
            let latestAnswer: LatestAnswerDto | undefined;
            if (inquiry.answers && inquiry.answers.length > 0) {
                const latest = inquiry.answers[inquiry.answers.length - 1];
                latestAnswer = {
                    breederName: latest.breederName,
                    answeredAt: this.formatAnsweredAt(latest.answeredAt),
                    content: latest.content,
                    profileImageUrl: latest.profileImageUrl
                        ? this.storageService.generateSignedUrl(latest.profileImageUrl, 60)
                        : undefined,
                };
            }

            return {
                id: inquiry._id.toString(),
                title: inquiry.title,
                content: inquiry.content,
                type: inquiry.type,
                animalType: inquiry.animalType,
                viewCount: inquiry.viewCount,
                answerCount: inquiry.answers?.length || 0,
                latestAnswer,
                createdAt: this.formatDate(inquiry.createdAt),
            };
        });

        this.logger.logSuccess('getInquiryList', '문의 목록 조회 완료', { count: data.length, hasMore });

        return { data, hasMore };
    }

    /**
     * 문의 상세 조회 (조회수 +1)
     * common은 누구나 조회 가능, direct는 작성자 + 대상 브리더만
     */
    async getInquiryDetail(inquiryId: string, userId?: string): Promise<InquiryDetailResponseDto> {
        this.logger.logStart('getInquiryDetail', '문의 상세 조회', { inquiryId });

        if (!inquiryId) {
            throw new BadRequestException('문의 ID가 필요합니다.');
        }

        const inquiry = await this.inquiryRepository.findById(inquiryId);
        if (!inquiry) {
            throw new BadRequestException('해당 문의를 찾을 수 없습니다.');
        }

        // direct 질문 열람 권한 확인
        if (inquiry.type === 'direct') {
            const authorId = inquiry.authorId.toString();
            const targetBreederId = inquiry.targetBreederId?.toString();

            if (userId !== authorId && userId !== targetBreederId) {
                throw new BadRequestException('해당 문의에 대한 열람 권한이 없습니다.');
            }
        }

        // 조회수 증가 (비동기, 실패해도 응답에 영향 없음)
        this.inquiryRepository.incrementViewCount(inquiryId);

        // 답변 변환
        const answers: InquiryAnswerDto[] = (inquiry.answers || []).map((answer) => ({
            breederName: answer.breederName,
            answeredAt: this.formatAnsweredAt(answer.answeredAt),
            content: answer.content,
            profileImageUrl: answer.profileImageUrl
                ? this.storageService.generateSignedUrl(answer.profileImageUrl, 60)
                : undefined,
        }));

        // 이미지 URL 변환
        const imageUrls = (inquiry.imageUrls || [])
            .filter((url) => url && url.trim() !== '')
            .map((url) => this.storageService.generateSignedUrl(url, 60));

        this.logger.logSuccess('getInquiryDetail', '문의 상세 조회 완료', { inquiryId });

        return {
            id: inquiry._id.toString(),
            title: inquiry.title,
            content: inquiry.content,
            type: inquiry.type,
            animalType: inquiry.animalType,
            viewCount: inquiry.viewCount + 1, // 증가 반영
            answerCount: inquiry.answers?.length || 0,
            createdAt: this.formatDetailDate(inquiry.createdAt),
            authorNickname: inquiry.authorNickname,
            imageUrls,
            answers,
        };
    }

    /**
     * 문의 작성 (입양자만)
     */
    async createInquiry(userId: string, dto: InquiryCreateRequestDto): Promise<{ inquiryId: string }> {
        this.logger.logStart('createInquiry', '문의 작성', { userId, type: dto.type });

        if (!userId) {
            throw new BadRequestException('사용자 정보가 올바르지 않습니다.');
        }

        // 작성자 닉네임 조회
        const adopter = await this.inquiryRepository.findAdopterNickname(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        // direct 질문인 경우 대상 브리더 확인
        if (dto.type === 'direct') {
            if (!dto.targetBreederId) {
                throw new BadRequestException('1:1 질문은 대상 브리더를 지정해야 합니다.');
            }
            const breeder = await this.inquiryRepository.findBreederById(dto.targetBreederId);
            if (!breeder) {
                throw new BadRequestException('대상 브리더를 찾을 수 없습니다.');
            }
        }

        const inquiry = await this.inquiryRepository.create({
            authorId: new Types.ObjectId(userId),
            authorNickname: adopter.nickname,
            title: dto.title,
            content: dto.content,
            type: dto.type,
            animalType: dto.animalType,
            targetBreederId: dto.targetBreederId ? new Types.ObjectId(dto.targetBreederId) : undefined,
            imageUrls: dto.imageUrls || [],
            viewCount: 0,
            answers: [],
            status: 'active',
        });

        this.logger.logSuccess('createInquiry', '문의 작성 완료', { inquiryId: inquiry._id.toString() });

        return { inquiryId: inquiry._id.toString() };
    }

    /**
     * 내 질문 목록 조회 (입양자 본인 작성 질문)
     * common + direct 모두 포함, 최신순 정렬
     */
    async getMyInquiries(
        userId: string,
        page: number = 1,
        limit: number = 15,
        animalType?: 'dog' | 'cat',
    ): Promise<InquiryListResponseDto> {
        this.logger.logStart('getMyInquiries', '내 질문 목록 조회', { userId, page, limit, animalType });

        const skip = (page - 1) * limit;

        const filter: any = { authorId: new Types.ObjectId(userId) };
        if (animalType) {
            filter.animalType = animalType;
        }

        const items = await this.inquiryRepository.findByAuthor(filter, skip, limit + 1);

        const hasMore = items.length > limit;
        const pagedItems = hasMore ? items.slice(0, limit) : items;

        const data: InquiryListItemDto[] = pagedItems.map((inquiry) => {
            let latestAnswer: LatestAnswerDto | undefined;
            if (inquiry.answers && inquiry.answers.length > 0) {
                const latest = inquiry.answers[inquiry.answers.length - 1];
                latestAnswer = {
                    breederName: latest.breederName,
                    answeredAt: this.formatAnsweredAt(latest.answeredAt),
                    content: latest.content,
                    profileImageUrl: latest.profileImageUrl
                        ? this.storageService.generateSignedUrl(latest.profileImageUrl, 60)
                        : undefined,
                };
            }

            return {
                id: inquiry._id.toString(),
                title: inquiry.title,
                content: inquiry.content,
                type: inquiry.type,
                animalType: inquiry.animalType,
                viewCount: inquiry.viewCount,
                answerCount: inquiry.answers?.length || 0,
                latestAnswer,
                createdAt: this.formatDate(inquiry.createdAt),
            };
        });

        this.logger.logSuccess('getMyInquiries', '내 질문 목록 조회 완료', { count: data.length, hasMore });

        return { data, hasMore };
    }

    /**
     * 문의 수정 (작성자 본인만)
     * 답변이 달린 문의는 수정 불가
     */
    async updateInquiry(inquiryId: string, userId: string, dto: InquiryUpdateRequestDto): Promise<void> {
        this.logger.logStart('updateInquiry', '문의 수정', { inquiryId, userId });

        const inquiry = await this.inquiryRepository.findDocumentById(inquiryId);
        if (!inquiry) {
            throw new BadRequestException('해당 문의를 찾을 수 없습니다.');
        }

        // 작성자 본인만 수정 가능
        if (inquiry.authorId.toString() !== userId) {
            throw new BadRequestException('본인이 작성한 문의만 수정할 수 있습니다.');
        }

        // 답변이 달린 문의는 수정 불가
        if (inquiry.answers && inquiry.answers.length > 0) {
            throw new BadRequestException('답변이 달린 문의는 수정할 수 없습니다.');
        }

        const updateData: any = {};
        if (dto.title !== undefined) updateData.title = dto.title;
        if (dto.content !== undefined) updateData.content = dto.content;
        if (dto.imageUrls !== undefined) updateData.imageUrls = dto.imageUrls;

        await this.inquiryRepository.update(inquiryId, updateData);

        this.logger.logSuccess('updateInquiry', '문의 수정 완료', { inquiryId });
    }

    /**
     * 문의 삭제 (작성자 본인만)
     * 답변이 달린 문의는 삭제 불가
     */
    async deleteInquiry(inquiryId: string, userId: string): Promise<void> {
        this.logger.logStart('deleteInquiry', '문의 삭제', { inquiryId, userId });

        const inquiry = await this.inquiryRepository.findDocumentById(inquiryId);
        if (!inquiry) {
            throw new BadRequestException('해당 문의를 찾을 수 없습니다.');
        }

        // 작성자 본인만 삭제 가능
        if (inquiry.authorId.toString() !== userId) {
            throw new BadRequestException('본인이 작성한 문의만 삭제할 수 있습니다.');
        }

        // 답변이 달린 문의는 삭제 불가
        if (inquiry.answers && inquiry.answers.length > 0) {
            throw new BadRequestException('답변이 달린 문의는 삭제할 수 없습니다.');
        }

        await this.inquiryRepository.delete(inquiryId);

        this.logger.logSuccess('deleteInquiry', '문의 삭제 완료', { inquiryId });
    }

    /**
     * 답변 작성 (브리더만)
     */
    async createAnswer(inquiryId: string, breederId: string, dto: InquiryAnswerCreateRequestDto): Promise<void> {
        this.logger.logStart('createAnswer', '답변 작성', { inquiryId, breederId });

        if (!inquiryId || !breederId) {
            throw new BadRequestException('필수 정보가 누락되었습니다.');
        }

        const inquiry = await this.inquiryRepository.findDocumentById(inquiryId);
        if (!inquiry) {
            throw new BadRequestException('해당 문의를 찾을 수 없습니다.');
        }

        if (inquiry.status === 'closed') {
            throw new BadRequestException('종료된 문의에는 답변할 수 없습니다.');
        }

        // direct 질문인 경우 대상 브리더만 답변 가능
        if (inquiry.type === 'direct' && inquiry.targetBreederId?.toString() !== breederId) {
            throw new BadRequestException('해당 문의에 답변할 권한이 없습니다.');
        }

        // 브리더 정보 조회
        const breeder = await this.inquiryRepository.findBreederInfo(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const now = new Date();

        await this.inquiryRepository.pushAnswer(
            inquiryId,
            {
                _id: new Types.ObjectId(),
                breederId: new Types.ObjectId(breederId),
                breederName: breeder.name,
                profileImageUrl: breeder.profileImageFileName || undefined,
                content: dto.content,
                answeredAt: now,
            },
            now,
        );

        this.logger.logSuccess('createAnswer', '답변 작성 완료', { inquiryId, breederId });
    }

    /**
     * 날짜 포맷 (목록용): 2025-06-10
     */
    private formatDate(date: Date): string {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 날짜 포맷 (상세용): 2025. 02. 15.
     */
    private formatDetailDate(date: Date): string {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}. ${month}. ${day}.`;
    }

    /**
     * 답변 시간 포맷: 2025. 06. 15. 답변 작성
     */
    private formatAnsweredAt(date: Date): string {
        return `${this.formatDetailDate(date)} 답변 작성`;
    }
}
