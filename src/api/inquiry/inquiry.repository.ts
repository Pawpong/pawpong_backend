import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Inquiry, InquiryDocument } from '../../schema/inquiry.schema';
import { Adopter } from '../../schema/adopter.schema';
import { Breeder } from '../../schema/breeder.schema';

/**
 * 문의 데이터 접근 계층 Repository
 *
 * 역할:
 * - 문의(Inquiry), 답변(Answer) 관련 모든 MongoDB 데이터 조작 담당
 * - 비즈니스 로직과 데이터 접근 로직의 완전한 분리
 * - 복잡한 쿼리 최적화 및 성능 개선
 *
 * 설계 원칙:
 * - 단일 책임 원칙: 오직 데이터 접근만 담당
 * - Service는 비즈니스 로직에만 집중
 * - try/catch로 DB 오류를 명확한 에러로 변환
 */
@Injectable()
export class InquiryRepository {
    constructor(
        @InjectModel(Inquiry.name) private readonly inquiryModel: Model<InquiryDocument>,
        @InjectModel(Adopter.name) private readonly adopterModel: Model<Adopter>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<Breeder>,
    ) {}

    /**
     * 공개 문의 목록 조회 (common 타입만, 무한스크롤용)
     * limit + 1개를 조회해 hasMore 판단은 Service에서 처리
     *
     * @param filter MongoDB 필터 조건
     * @param sortOption 정렬 조건
     * @param skip 건너뛸 문서 수
     * @param limit 가져올 문서 수 (+1 포함)
     */
    async findPublicList(
        filter: Record<string, any>,
        sortOption: Record<string, any>,
        skip: number,
        limit: number,
    ): Promise<any[]> {
        try {
            return await this.inquiryModel.find(filter).sort(sortOption).skip(skip).limit(limit).lean().exec();
        } catch (error) {
            throw new Error(`문의 목록 조회 실패: ${error.message}`);
        }
    }

    /**
     * 특정 작성자의 문의 목록 조회 (내 질문 목록)
     * common + direct 모두 포함, 최신순 정렬
     *
     * @param filter MongoDB 필터 조건 (authorId 포함)
     * @param skip 건너뛸 문서 수
     * @param limit 가져올 문서 수 (+1 포함)
     */
    async findByAuthor(filter: Record<string, any>, skip: number, limit: number): Promise<any[]> {
        try {
            return await this.inquiryModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec();
        } catch (error) {
            throw new Error(`내 문의 목록 조회 실패: ${error.message}`);
        }
    }

    /**
     * 문의 ID로 단일 문의 조회 (lean, 읽기 전용)
     *
     * @param inquiryId 문의 고유 ID
     * @returns 문의 데이터 또는 null
     */
    async findById(inquiryId: string): Promise<any | null> {
        try {
            return await this.inquiryModel.findById(inquiryId).lean().exec();
        } catch (error) {
            throw new Error(`문의 조회 실패: ${error.message}`);
        }
    }

    /**
     * 문의 ID로 Mongoose Document 조회 (수정/삭제용)
     *
     * @param inquiryId 문의 고유 ID
     * @returns InquiryDocument 또는 null
     */
    async findDocumentById(inquiryId: string): Promise<InquiryDocument | null> {
        try {
            return await this.inquiryModel.findById(inquiryId).exec();
        } catch (error) {
            throw new Error(`문의 문서 조회 실패: ${error.message}`);
        }
    }

    /**
     * 새 문의 생성 및 저장
     *
     * @param data 문의 생성 데이터
     * @returns 저장된 InquiryDocument
     */
    async create(data: {
        authorId: Types.ObjectId;
        authorNickname: string;
        title: string;
        content: string;
        type: 'common' | 'direct';
        animalType: 'dog' | 'cat';
        targetBreederId?: Types.ObjectId;
        imageUrls: string[];
        viewCount: number;
        answers: any[];
        status: string;
    }): Promise<InquiryDocument> {
        try {
            const inquiry = new this.inquiryModel(data);
            return await inquiry.save();
        } catch (error) {
            throw new Error(`문의 생성 실패: ${error.message}`);
        }
    }

    /**
     * 문의 내용 수정 ($set 방식)
     *
     * @param inquiryId 수정할 문의 ID
     * @param updateData 수정할 필드 데이터
     */
    async update(inquiryId: string, updateData: Record<string, any>): Promise<void> {
        try {
            await this.inquiryModel.findByIdAndUpdate(inquiryId, { $set: updateData }).exec();
        } catch (error) {
            throw new Error(`문의 수정 실패: ${error.message}`);
        }
    }

    /**
     * 문의 하드 삭제
     *
     * @param inquiryId 삭제할 문의 ID
     */
    async delete(inquiryId: string): Promise<void> {
        try {
            await this.inquiryModel.findByIdAndDelete(inquiryId).exec();
        } catch (error) {
            throw new Error(`문의 삭제 실패: ${error.message}`);
        }
    }

    /**
     * 문의 조회수 1 증가 (비동기, 실패해도 무시)
     *
     * @param inquiryId 조회수를 증가할 문의 ID
     */
    incrementViewCount(inquiryId: string): void {
        this.inquiryModel
            .findByIdAndUpdate(inquiryId, { $inc: { viewCount: 1 } })
            .exec()
            .catch(() => {});
    }

    /**
     * 문의에 답변 추가 및 최신 답변 시간 캐시 갱신
     *
     * @param inquiryId 대상 문의 ID
     * @param answerData 추가할 답변 데이터
     * @param now 답변 작성 시각
     */
    async pushAnswer(
        inquiryId: string,
        answerData: {
            _id: Types.ObjectId;
            breederId: Types.ObjectId;
            breederName: string;
            profileImageUrl?: string;
            content: string;
            answeredAt: Date;
        },
        now: Date,
    ): Promise<void> {
        try {
            await this.inquiryModel
                .findByIdAndUpdate(inquiryId, {
                    $push: { answers: answerData },
                    $set: { latestAnsweredAt: now },
                })
                .exec();
        } catch (error) {
            throw new Error(`답변 추가 실패: ${error.message}`);
        }
    }

    /**
     * 입양자 닉네임 조회 (문의 작성 시 사용)
     *
     * @param userId 입양자 ID
     * @returns nickname 또는 null
     */
    async findAdopterNickname(userId: string): Promise<{ nickname: string } | null> {
        try {
            return (await this.adopterModel.findById(userId).select('nickname').lean().exec()) as {
                nickname: string;
            } | null;
        } catch (error) {
            throw new Error(`입양자 닉네임 조회 실패: ${error.message}`);
        }
    }

    /**
     * 브리더 존재 여부 확인 (1:1 질문 대상 검증용)
     *
     * @param breederId 확인할 브리더 ID
     * @returns 브리더 _id 또는 null
     */
    async findBreederById(breederId: string): Promise<{ _id: any } | null> {
        try {
            return (await this.breederModel.findById(breederId).select('_id').lean().exec()) as { _id: any } | null;
        } catch (error) {
            throw new Error(`브리더 조회 실패: ${error.message}`);
        }
    }

    /**
     * 브리더 답변용 정보 조회 (이름, 프로필 이미지)
     *
     * @param breederId 브리더 ID
     * @returns name, profileImageFileName 또는 null
     */
    async findBreederInfo(breederId: string): Promise<{ name: string; profileImageFileName?: string } | null> {
        try {
            return (await this.breederModel.findById(breederId).select('name profileImageFileName').lean().exec()) as {
                name: string;
                profileImageFileName?: string;
            } | null;
        } catch (error) {
            throw new Error(`브리더 정보 조회 실패: ${error.message}`);
        }
    }
}
