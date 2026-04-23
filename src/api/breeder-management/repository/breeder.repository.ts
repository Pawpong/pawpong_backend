import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { VerificationStatus } from '../../../common/enum/user.enum';

import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import type {
    BreederManagementApplicationFormRecord,
    BreederManagementBreederStatsRecord,
} from '../application/ports/breeder-management-profile.port';
import type { BreederManagementVerificationRecord } from '../application/ports/breeder-management-settings.port';
import type {
    BreederManagementBreederDocumentRecord,
    BreederManagementBreederFilterRecord,
    BreederManagementPaginationRecord,
    BreederManagementVerificationStatusCountRecord,
} from '../types/breeder-management-document.type';

/**
 * Breeder Repository
 * 브리더 엔티티에 대한 데이터 접근 로직만 담당
 *
 * 역할:
 * - 브리더 계정 생성, 조회, 수정
 * - 브리더 인증 정보 관리
 * - 브리더 검색 및 필터링
 * - 브리더 통계 업데이트
 */
@Injectable()
export class BreederRepository {
    constructor(@InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>) {}

    /**
     * 브리더 ID로 기본 정보 조회
     * @param breederId 조회할 브리더 고유 ID
     * @returns 브리더 정보 또는 null
     */
    async findById(breederId: string): Promise<BreederManagementBreederDocumentRecord | null> {
        return this.breederModel
            .findById(breederId)
            .select('-password')
            .lean<BreederManagementBreederDocumentRecord>()
            .exec();
    }

    /**
     * 브리더 ID로 조회 (저장 가능한 문서 반환)
     * @param breederId 조회할 브리더 고유 ID
     * @returns 브리더 문서 (save() 메서드 사용 가능) 또는 null
     */
    async findByIdForUpdate(breederId: string): Promise<BreederDocument | null> {
        return this.breederModel.findById(breederId).select('-password').exec();
    }

    /**
     * 브리더 ID로 전체 데이터 조회 (관리용)
     * @param breederId 조회할 브리더 고유 ID
     * @returns 브리더 전체 정보 또는 null
     */
    async findByIdWithAllData(breederId: string): Promise<BreederManagementBreederDocumentRecord | null> {
        return this.breederModel
            .findById(breederId)
            .select('-password')
            .lean<BreederManagementBreederDocumentRecord>()
            .exec();
    }

    /**
     * 이메일로 브리더 조회 (로그인 시 사용)
     * @param email 조회할 이메일 주소
     * @returns 브리더 정보 (비밀번호 포함) 또는 null
     */
    async findByEmail(email: string): Promise<BreederDocument | null> {
        return this.breederModel.findOne({ emailAddress: email.toLowerCase() }).exec();
    }

    /**
     * 새로운 브리더 계정 생성
     * @param breederData 생성할 브리더 데이터
     * @returns 생성된 브리더 정보
     */
    async create(breederData: Partial<Breeder>): Promise<BreederDocument> {
        const breeder = new this.breederModel({
            ...breederData,
            verification: {
                status: VerificationStatus.PENDING,
                plan: 'basic',
                submittedAt: null,
                documents: [],
            },
            stats: {
                totalApplications: 0,
                completedAdoptions: 0,
                averageRating: 0,
                totalReviews: 0,
                profileViews: 0,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return breeder.save();
    }

    /**
     * 브리더 프로필 정보 업데이트
     * @param breederId 수정할 브리더 ID
     * @param updateData 수정할 데이터
     * @returns 수정된 브리더 정보 또는 null
     */
    async updateProfile(
        breederId: string,
        updateData: Record<string, unknown>,
    ): Promise<BreederManagementBreederDocumentRecord | null> {
        return this.breederModel
            .findByIdAndUpdate(
                breederId,
                {
                    $set: {
                        ...updateData,
                        updatedAt: new Date(),
                    },
                },
                { new: true, runValidators: true },
            )
            .select('-password')
            .lean<BreederManagementBreederDocumentRecord>()
            .exec();
    }

    /**
     * 브리더 인증 정보 업데이트
     * @param breederId 브리더 ID
     * @param verificationData 인증 정보
     */
    async updateVerification(breederId: string, verificationData: BreederManagementVerificationRecord): Promise<void> {
        await this.breederModel
            .findByIdAndUpdate(breederId, {
                $set: {
                    verification: verificationData,
                    updatedAt: new Date(),
                },
            })
            .exec();
    }

    async updateApplicationForm(
        breederId: string,
        applicationForm: BreederManagementApplicationFormRecord[],
    ): Promise<BreederManagementBreederDocumentRecord | null> {
        return this.breederModel
            .findByIdAndUpdate(
                breederId,
                {
                    $set: {
                        applicationForm,
                        updatedAt: new Date(),
                    },
                },
                { new: true, runValidators: true },
            )
            .select('-password')
            .lean<BreederManagementBreederDocumentRecord>()
            .exec();
    }

    /**
     * 완료된 입양 건수 증가
     * @param breederId 브리더 ID
     */
    async incrementCompletedAdoptions(breederId: string): Promise<void> {
        await this.breederModel
            .findByIdAndUpdate(breederId, {
                $inc: { 'stats.completedAdoptions': 1 },
                $set: { updatedAt: new Date() },
            })
            .exec();
    }

    /**
     * 후기 수 증가
     * @param breederId 브리더 ID
     */
    async incrementReviewCount(breederId: string): Promise<void> {
        await this.breederModel
            .findByIdAndUpdate(breederId, {
                $inc: { 'stats.totalReviews': 1 },
                $set: { updatedAt: new Date() },
            })
            .exec();
    }

    /**
     * 후기 통계 업데이트
     * @param breederId 브리더 ID
     * @param totalReviews 총 후기 수
     */
    async updateReviewStats(breederId: string, totalReviews: number): Promise<void> {
        await this.breederModel
            .findByIdAndUpdate(breederId, {
                $set: {
                    'stats.totalReviews': totalReviews,
                    updatedAt: new Date(),
                },
            })
            .exec();
    }

    /**
     * 신고 추가
     * @param breederId 브리더 ID
     * @param reportData 신고 데이터
     */
    async addReport(breederId: string, reportData: Record<string, unknown>): Promise<void> {
        await this.breederModel
            .findByIdAndUpdate(breederId, {
                $push: { reports: reportData },
                $set: { updatedAt: new Date() },
            })
            .exec();
    }

    /**
     * 브리더 검색 (공개 API용)
     * @param filters 검색 필터
     * @param page 페이지 번호
     * @param limit 페이지당 항목 수
     * @returns 페이지네이션된 브리더 목록
     */
    async findWithFilters(
        filters: BreederManagementBreederFilterRecord,
        page: number = 1,
        limit: number = 10,
    ): Promise<{ breeders: BreederManagementBreederDocumentRecord[]; pagination: BreederManagementPaginationRecord }> {
        const query: FilterQuery<BreederDocument> = {
            accountStatus: 'active',
            'verification.status': VerificationStatus.APPROVED,
        };

        // 필터 조건 동적 구성
        if (filters.location) {
            query['profile.location.city'] = new RegExp(filters.location, 'i');
        }
        if (filters.breed) {
            query['profile.specialization'] = new RegExp(filters.breed, 'i');
        }
        if (filters.priceMin || filters.priceMax) {
            const priceQuery: { $gte?: number; $lte?: number } = {};
            if (filters.priceMin) priceQuery.$gte = filters.priceMin;
            if (filters.priceMax) priceQuery.$lte = filters.priceMax;
            query['profile.priceRange.min'] = priceQuery;
        }

        const skip = (page - 1) * limit;

        const [breeders, total] = await Promise.all([
            this.breederModel
                .find(query)
                .select('-password -reports')
                .sort({ 'stats.averageRating': -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean<BreederManagementBreederDocumentRecord[]>()
                .exec(),
            this.breederModel.countDocuments(query).exec(),
        ]);

        return {
            breeders,
            pagination: this.buildPagination(page, limit, total),
        };
    }

    /**
     * 인기 브리더 조회
     * @param limit 조회할 브리더 수
     * @returns 인기 브리더 목록
     */
    async findPopularBreeders(limit: number = 10): Promise<BreederDocument[]> {
        return this.breederModel
            .find({
                accountStatus: 'active',
                'verification.status': VerificationStatus.APPROVED,
                'stats.totalReviews': { $gte: 3 },
            })
            .select('-password -reports')
            .sort({
                'stats.averageRating': -1,
                'stats.totalReviews': -1,
                'stats.completedAdoptions': -1,
            })
            .limit(limit)
            .exec();
    }

    /**
     * 승인 대기 브리더 조회 (관리자용)
     * @param page 페이지 번호
     * @param limit 페이지당 항목 수
     * @returns 페이지네이션된 대기 브리더 목록
     */
    async findPendingVerification(
        page: number = 1,
        limit: number = 10,
    ): Promise<{ breeders: BreederManagementBreederDocumentRecord[]; pagination: BreederManagementPaginationRecord }> {
        const query = { 'verification.status': VerificationStatus.REVIEWING };
        const skip = (page - 1) * limit;

        const [breeders, total] = await Promise.all([
            this.breederModel
                .find(query)
                .select('-password')
                .sort({ 'verification.submittedAt': 1 })
                .skip(skip)
                .limit(limit)
                .lean<BreederManagementBreederDocumentRecord[]>()
                .exec(),
            this.breederModel.countDocuments(query).exec(),
        ]);

        return {
            breeders,
            pagination: this.buildPagination(page, limit, total),
        };
    }

    private buildPagination(page: number, limit: number, totalItems: number): BreederManagementPaginationRecord {
        const totalPages = Math.ceil(totalItems / limit);

        return {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };
    }

    /**
     * 브리더 수 통계 조회 (관리자용)
     * @param filters 필터 조건
     * @returns 브리더 수
     */
    async countBreeders(filters?: FilterQuery<BreederDocument>): Promise<Record<string, number>> {
        const pipeline = [
            { $match: filters || {} },
            {
                $group: {
                    _id: '$verification.status',
                    count: { $sum: 1 },
                },
            },
        ];

        const results = await this.breederModel
            .aggregate<BreederManagementVerificationStatusCountRecord>(pipeline)
            .exec();

        const stats: Record<string, number> = {
            total: 0,
            pending: 0,
            reviewing: 0,
            approved: 0,
            rejected: 0,
        };

        results.forEach((result) => {
            stats[result._id] = result.count;
            stats.total += result.count;
        });

        return stats;
    }

    /**
     * 브리더 프로필 조회수 증가
     * @param breederId 브리더 ID
     */
    async incrementProfileViews(breederId: string): Promise<void> {
        await this.breederModel.findByIdAndUpdate(breederId, { $inc: { 'stats.profileViews': 1 } }).exec();
    }

    /**
     * 디바이스 푸시 토큰 추가 (동일 토큰이 있으면 갱신을 위해 먼저 제거).
     *
     * @param breederId 브리더 ID
     * @param token FCM 디바이스 토큰
     * @param platform 디바이스 플랫폼
     * @param appVersion 선택적 앱 버전 (디버깅용)
     */
    async upsertPushDeviceToken(
        breederId: string,
        token: string,
        platform: 'ios' | 'android',
        appVersion?: string,
    ): Promise<void> {
        await this.breederModel.updateOne({ _id: breederId }, { $pull: { pushDeviceTokens: { token } } }).exec();
        await this.breederModel
            .updateOne(
                { _id: breederId },
                {
                    $push: {
                        pushDeviceTokens: {
                            token,
                            platform,
                            registeredAt: new Date(),
                            appVersion,
                        },
                    },
                },
            )
            .exec();
    }

    /**
     * 디바이스 푸시 토큰 제거 (여러 토큰 일괄 제거 가능).
     *
     * @param breederId 브리더 ID
     * @param tokens 제거할 토큰 목록
     */
    async removePushDeviceTokens(breederId: string, tokens: string[]): Promise<void> {
        if (tokens.length === 0) return;
        await this.breederModel
            .updateOne({ _id: breederId }, { $pull: { pushDeviceTokens: { token: { $in: tokens } } } })
            .exec();
    }

    /**
     * 브리더의 활성 디바이스 푸시 토큰 문자열 목록 조회.
     *
     * @param breederId 브리더 ID
     */
    async findPushDeviceTokens(breederId: string): Promise<string[]> {
        const doc = await this.breederModel
            .findById(breederId)
            .select('pushDeviceTokens')
            .lean<{ pushDeviceTokens?: Array<{ token?: string }> }>()
            .exec();
        const entries = doc?.pushDeviceTokens ?? [];
        const tokens = entries.map((entry) => entry.token).filter((value): value is string => !!value);
        return Array.from(new Set(tokens));
    }

    /**
     * 브리더 통계 일괄 업데이트
     * @param breederId 브리더 ID
     * @param statsData 업데이트할 통계 데이터
     */
    async updateStats(breederId: string, statsData: Partial<BreederManagementBreederStatsRecord>): Promise<void> {
        await this.breederModel
            .findByIdAndUpdate(breederId, {
                $set: {
                    stats: {
                        ...statsData,
                        lastUpdated: new Date(),
                    },
                    updatedAt: new Date(),
                },
            })
            .exec();
    }
}
