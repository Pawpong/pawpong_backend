import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Adopter } from '../../../../../schema/adopter.schema';
import { Breeder } from '../../../../../schema/breeder.schema';
import { ReviewCredential } from '../../../../../schema/review-credential.schema';
import type { ReviewAccountPort, ReviewCredentialRecord } from '../application/review-login.port';

/** 일반 계정의 passwordHash는 읽지 않는다. 전용 컬렉션의 명시적 accountId+role만 신뢰한다. */
@Injectable()
export class ReviewAccountRepository implements ReviewAccountPort {
    constructor(
        @InjectModel(ReviewCredential.name) private readonly credentials: Model<ReviewCredential>,
        @InjectModel(Adopter.name) private readonly adopters: Model<Adopter>,
        @InjectModel(Breeder.name) private readonly breeders: Model<Breeder>,
    ) {}

    /** 자격 증명 조회 실패는 원문 쿼리/해시를 포함하지 않는 고정 오류로 전달한다. */
    async findCredential(emailAddress: string): Promise<ReviewCredentialRecord | null> {
        return this.safe(async () => {
            const record = await this.credentials.findOne({ emailAddress }).select('+passwordHash').lean().exec();
            if (!record) return null;
            return {
                id: String(record._id),
                emailAddress: record.emailAddress,
                accountId: String(record.accountId),
                role: record.role,
                passwordHash: record.passwordHash,
                enabled: record.enabled,
            };
        });
    }

    private accountFilter(credential: ReviewCredentialRecord) {
        return {
            _id: new Types.ObjectId(credential.accountId),
            emailAddress: credential.emailAddress,
            userRole: credential.role,
            accountStatus: 'active',
            'socialAuthInfo.authProvider': 'local',
            ...(credential.role === 'breeder' ? { 'verification.status': 'approved', isTestAccount: true } : {}),
        };
    }

    /** 현재 상태가 정상인 입양자 또는 승인된 테스트 브리더만 조회한다. */
    async findActiveAccount(credential: ReviewCredentialRecord) {
        return this.safe(async () => {
            if (!Types.ObjectId.isValid(credential.accountId)) return null;
            const filter = this.accountFilter(credential);
            const record =
                credential.role === 'adopter'
                    ? await this.adopters.findOne(filter).select('emailAddress nickname').lean().exec()
                    : await this.breeders.findOne(filter).select('emailAddress nickname').lean().exec();
            if (!record) return null;
            return {
                id: String(record._id),
                emailAddress: record.emailAddress,
                nickname: record.nickname,
                role: credential.role,
            };
        });
    }

    /** 기존 서비스 refreshToken 필드에 동일한 토큰 해시를 조건부 저장한다. */
    async saveSession(credential: ReviewCredentialRecord, refreshTokenHash: string): Promise<boolean> {
        return this.safe(async () => {
            if (
                !(await this.credentials.exists({
                    _id: credential.id,
                    enabled: true,
                    accountId: credential.accountId,
                    role: credential.role,
                }))
            )
                return false;
            const filter = this.accountFilter(credential);
            const update = { $set: { refreshToken: refreshTokenHash, lastLoginAt: new Date() } };
            const result =
                credential.role === 'adopter'
                    ? await this.adopters.updateOne(filter, update).exec()
                    : await this.breeders.updateOne(filter, update).exec();
            return result.matchedCount === 1;
        });
    }

    private async safe<T>(operation: () => Promise<T>): Promise<T> {
        try {
            return await operation();
        } catch {
            throw new ServiceUnavailableException('로그인을 잠시 사용할 수 없습니다. 다시 시도해 주세요.');
        }
    }
}
