import { Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

import { CustomLoggerService } from '../../common/logger/custom-logger.service';

import { InquiryRepository } from './inquiry.repository';

import {
    InquiryCreateRequestDto,
    InquiryUpdateRequestDto,
    InquiryAnswerCreateRequestDto,
} from './dto/request/inquiry-create-request.dto';
import { InquiryDetailResponseDto } from './dto/response/inquiry-detail-response.dto';
import { InquiryListResponseDto } from './dto/response/inquiry-list-response.dto';
import { CreateInquiryUseCase } from './application/use-cases/create-inquiry.use-case';
import { UpdateInquiryUseCase } from './application/use-cases/update-inquiry.use-case';
import { DeleteInquiryUseCase } from './application/use-cases/delete-inquiry.use-case';
import { CreateInquiryAnswerUseCase } from './application/use-cases/create-inquiry-answer.use-case';
import { GetBreederInquiriesUseCase } from './application/use-cases/get-breeder-inquiries.use-case';
import { GetInquiryDetailUseCase } from './application/use-cases/get-inquiry-detail.use-case';
import { GetInquiryListUseCase } from './application/use-cases/get-inquiry-list.use-case';
import { GetMyInquiriesUseCase } from './application/use-cases/get-my-inquiries.use-case';

/**
 * 문의 서비스
 * 입양자 질문 작성, 브리더 답변, 목록/상세 조회
 * 비즈니스 로직만 담당 - DB 접근은 InquiryRepository에 위임
 */
@Injectable()
export class InquiryService {
    constructor(
        private readonly inquiryRepository: InquiryRepository,
        private readonly logger: CustomLoggerService,
        private readonly getInquiryListUseCase: GetInquiryListUseCase,
        private readonly getInquiryDetailUseCase: GetInquiryDetailUseCase,
        private readonly getMyInquiriesUseCase: GetMyInquiriesUseCase,
        private readonly getBreederInquiriesUseCase: GetBreederInquiriesUseCase,
        private readonly createInquiryUseCase: CreateInquiryUseCase,
        private readonly updateInquiryUseCase: UpdateInquiryUseCase,
        private readonly deleteInquiryUseCase: DeleteInquiryUseCase,
        private readonly createInquiryAnswerUseCase: CreateInquiryAnswerUseCase,
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
        return this.getInquiryListUseCase.execute(page, limit, animalType, sort);
    }

    /**
     * 문의 상세 조회 (조회수 +1)
     * common은 누구나 조회 가능, direct는 작성자 + 대상 브리더만
     */
    async getInquiryDetail(inquiryId: string, userId?: string): Promise<InquiryDetailResponseDto> {
        return this.getInquiryDetailUseCase.execute(inquiryId, userId);
    }

    /**
     * 문의 작성 (입양자만)
     */
    async createInquiry(userId: string, dto: InquiryCreateRequestDto): Promise<{ inquiryId: string }> {
        return this.createInquiryUseCase.execute(userId, dto);
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
        return this.getMyInquiriesUseCase.execute(userId, page, limit, animalType);
    }

    /**
     * 브리더에게 들어온 1:1 질문 목록 조회 (내 답변 페이지)
     * answered=true: 답변 완료, false: 답변 전
     */
    async getBreederInquiries(
        breederId: string,
        answered: boolean,
        page: number = 1,
        limit: number = 15,
    ): Promise<InquiryListResponseDto> {
        return this.getBreederInquiriesUseCase.execute(breederId, answered, page, limit);
    }

    /**
     * 문의 수정 (작성자 본인만)
     * 답변이 달린 문의는 수정 불가
     */
    async updateInquiry(inquiryId: string, userId: string, dto: InquiryUpdateRequestDto): Promise<void> {
        return this.updateInquiryUseCase.execute(inquiryId, userId, dto);
    }

    /**
     * 문의 삭제 (작성자 본인만)
     * 답변이 달린 문의는 삭제 불가
     */
    async deleteInquiry(inquiryId: string, userId: string): Promise<void> {
        return this.deleteInquiryUseCase.execute(inquiryId, userId);
    }

    /**
     * 답변 작성 (브리더만)
     */
    async createAnswer(inquiryId: string, breederId: string, dto: InquiryAnswerCreateRequestDto): Promise<void> {
        return this.createInquiryAnswerUseCase.execute(inquiryId, breederId, dto);
    }
}
