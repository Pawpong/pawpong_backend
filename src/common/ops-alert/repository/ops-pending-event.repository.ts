import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { OpsPendingEventRecord } from '../../../schema/ops-pending-event.schema';

/**
 * 운영 대기 이벤트 저장소.
 *
 * 최초 전송과 리마인드 모두 lease 토큰으로 한 건씩 집어가므로,
 * 인스턴스가 여러 대여도 같은 알림이 두 번 나가지 않는다.
 */
@Injectable()
export class OpsPendingEventRepository {
    constructor(
        @InjectModel(OpsPendingEventRecord.name)
        private readonly model: Model<OpsPendingEventRecord>,
    ) {}

    /**
     * 접수 적재. 같은 원본의 열린 접수는 하나만 남는다.
     *
     * 확인 후 생성으로 나누면 이벤트 경로와 재동기화가 동시에 돌 때 같은 건이 두 번 등록된다.
     * upsert 한 번으로 처리하고, 경합으로 unique 인덱스에 걸리면 이미 등록된 것으로 본다.
     */
    async insert(record: {
        eventId: string;
        kind: string;
        referenceId: string;
        summary: string;
        details: Array<{ name: string; value: string }>;
        adminPath: string;
        environment: string;
    }): Promise<boolean> {
        try {
            const result = await this.model
                .findOneAndUpdate(
                    {
                        // 환경까지 키에 넣는다. 로컬과 dev 가 같은 DB 를 쓰므로 환경을 빼면 서로의 적재를 막는다.
                        environment: record.environment,
                        kind: record.kind,
                        referenceId: record.referenceId,
                        isResolved: false,
                    },
                    { $setOnInsert: record },
                    { upsert: true, new: false },
                )
                .lean()
                .exec();

            // 기존 문서가 없었으면(null) 이번 호출이 새로 만든 것이다
            return result === null;
        } catch (error) {
            if (this.isDuplicateKeyError(error)) return false;
            throw error;
        }
    }

    /** unique 인덱스 경합인지 (동시에 같은 건을 적재한 경우) */
    private isDuplicateKeyError(error: unknown): boolean {
        return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
    }

    /** 최초 전송 대상 한 건을 집는다 */
    claimForDelivery(environment: string, leaseToken: string) {
        return this.model
            .findOneAndUpdate(
                { deliveryStatus: 'pending', environment, nextAttemptAt: { $lte: new Date() } },
                { $set: { leaseToken, nextAttemptAt: new Date(Date.now() + 60_000) }, $inc: { attempts: 1 } },
                { new: true, sort: { nextAttemptAt: 1 } },
            )
            .lean()
            .exec();
    }

    /** 리마인드 대상 한 건을 집는다 (처리 전 + 예정 시각 경과) */
    claimForReminder(environment: string, leaseToken: string, now: Date) {
        return this.model
            .findOneAndUpdate(
                {
                    environment,
                    deliveryStatus: 'delivered',
                    isResolved: false,
                    nextRemindAt: { $ne: null, $lte: now },
                },
                // 전송에 실패해도 곧바로 다시 집히지 않도록 예정 시각을 잠시 미뤄둔다
                { $set: { leaseToken, nextRemindAt: new Date(now.getTime() + 60_000) } },
                { new: true, sort: { nextRemindAt: 1 } },
            )
            .lean()
            .exec();
    }

    /** 최초 전송 성공 — 첫 리마인드 예정 시각을 같이 심는다 */
    async markDelivered(eventId: string, leaseToken: string, deliveredAt: Date, nextRemindAt: Date): Promise<void> {
        await this.model
            .updateOne(
                { eventId, leaseToken },
                {
                    $set: { deliveryStatus: 'delivered', deliveredAt, nextRemindAt },
                    $unset: { leaseToken: 1 },
                },
            )
            .exec();
    }

    /** 리마인드 전송 성공 — 횟수를 올리고 다음 예정 시각을 잡는다 (상한이면 비운다) */
    async markReminded(eventId: string, leaseToken: string, nextRemindAt?: Date): Promise<void> {
        await this.model
            .updateOne(
                { eventId, leaseToken },
                {
                    $inc: { remindCount: 1 },
                    ...(nextRemindAt
                        ? { $set: { nextRemindAt }, $unset: { leaseToken: 1 } }
                        : { $unset: { leaseToken: 1, nextRemindAt: 1 } }),
                },
            )
            .exec();
    }

    /** 전송 실패 — 지수 백오프로 재시도 시각을 미룬다 */
    async retryDelivery(eventId: string, leaseToken: string, attempts: number): Promise<void> {
        const delay = Math.min(3_600_000, 15_000 * 2 ** Math.min(attempts, 8));
        await this.model
            .updateOne(
                { eventId, leaseToken },
                { $set: { nextAttemptAt: new Date(Date.now() + delay) }, $unset: { leaseToken: 1 } },
            )
            .exec();
    }

    /** 리마인드 전송 실패 — 다음 주기에 다시 시도한다 */
    async retryReminder(eventId: string, leaseToken: string, nextRemindAt: Date): Promise<void> {
        await this.model
            .updateOne({ eventId, leaseToken }, { $set: { nextRemindAt }, $unset: { leaseToken: 1 } })
            .exec();
    }

    /** 아직 닫히지 않은 건들의 referenceId (재동기화에서 누락 접수를 찾을 때 쓴다) */
    async findOpenReferenceIds(kind: string, environment: string): Promise<string[]> {
        const rows = await this.model.find({ kind, environment, isResolved: false }, { referenceId: 1 }).lean().exec();

        return rows.map((row) => row.referenceId);
    }

    /**
     * 되짚어볼 열린 건들.
     *
     * 오래 확인되지 않은 것부터 집는다. 생성순으로 고정해서 집으면 건수가 한도를 넘었을 때
     * 뒤쪽 건들이 영영 검사되지 않는다(확인하지 않으면 닫히지도 않아 계속 앞자리를 차지한다).
     */
    async findOpenEventsToCheck(
        environment: string,
        limit: number,
    ): Promise<Array<{ eventId: string; kind: string; referenceId: string }>> {
        return this.model
            .find({ environment, isResolved: false }, { eventId: 1, kind: 1, referenceId: 1 })
            .sort({ lastCheckedAt: 1, createdAt: 1 })
            .limit(limit)
            .lean()
            .exec();
    }

    /** 원본을 확인한 시각을 남겨 다음 주기에는 다른 건이 앞자리로 오게 한다 */
    async markChecked(eventIds: string[], checkedAt: Date): Promise<void> {
        if (eventIds.length === 0) return;

        await this.model.updateMany({ eventId: { $in: eventIds } }, { $set: { lastCheckedAt: checkedAt } }).exec();
    }

    /**
     * 관리자 처리 완료 — 아직 안 끝난 같은 원본 건을 닫고 리마인드를 멈춘다.
     * 자기 환경의 건만 닫는다. 다른 환경(로컬 등)의 대기 상태를 대신 정리하면 그 환경에서 알림이 사라진다.
     */
    async resolve(
        environment: string,
        kind: string,
        referenceId: string,
        resolution: string,
        resolvedAt: Date,
    ): Promise<number> {
        const result = await this.model
            .updateMany(
                { environment, kind, referenceId, isResolved: false },
                { $set: { isResolved: true, resolvedAt, resolution }, $unset: { nextRemindAt: 1 } },
            )
            .exec();

        return result.modifiedCount;
    }
}
