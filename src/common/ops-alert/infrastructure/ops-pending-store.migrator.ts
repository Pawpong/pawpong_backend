import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { OpsPendingEventRecord } from '../../../schema/ops-pending-event.schema';
import { CustomLoggerService } from '../../logger/custom-logger.service';

/**
 * 운영 대기 저장소를 현재 스키마에 맞춘다. 부팅할 때마다 실행되며 여러 번 돌려도 결과가 같다.
 *
 * 1. isResolved 백필
 *    예전 문서에는 이 필드가 없다. 지금 모든 조회가 `isResolved: false` 로 열린 건을 찾는데,
 *    MongoDB 동등 비교는 필드가 없는 문서를 잡지 못한다. 백필하지 않으면 그 문서들은
 *    리마인드도 종료도 되지 않고, 유니크 인덱스에도 잡히지 않아 같은 건이 새로 또 등록된다.
 *
 * 2. 열린 중복 정리
 *    유니크 인덱스가 없던 시절에 같은 (환경, 종류, 원본) 으로 열린 문서가 여러 개 생겼을 수 있다.
 *    가장 먼저 만들어진 하나만 남기고 나머지를 닫아야 인덱스를 만들 수 있다.
 *
 * 3. 인덱스 동기화
 *    mongoose 는 인덱스를 만들기만 하고 지우지 않는다. 예전 유니크 인덱스가 남으면 환경을
 *    구분하지 못해, 로컬이 만든 레코드가 dev 서버의 적재를 막는다(둘은 같은 DB 를 쓴다).
 */
@Injectable()
export class OpsPendingStoreMigrator implements OnModuleInit {
    /** "아직 처리되지 않은 건" — 백필 전후 두 형태를 모두 포함한다 */
    private static readonly OPEN_MATCHER = {
        $or: [{ isResolved: false }, { isResolved: { $exists: false }, resolvedAt: { $exists: false } }],
    };

    constructor(
        @InjectModel(OpsPendingEventRecord.name)
        private readonly model: Model<OpsPendingEventRecord>,
        private readonly logger: CustomLoggerService,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.migrate();
    }

    /** 실패해도 부팅을 막지 않는다. 다만 남은 위험이 보이도록 로그를 남긴다 */
    async migrate(): Promise<void> {
        try {
            // 중복 정리가 먼저다. 백필을 먼저 하면 같은 원본의 열린 문서 여러 개가 한꺼번에
            // isResolved: false 가 되면서 유니크 인덱스에 걸려 백필 자체가 중간에 멈춘다.
            const deduplicated = await this.closeDuplicateOpenEvents();
            const backfilled = await this.backfillIsResolved();

            if (backfilled > 0 || deduplicated > 0) {
                this.logger.logSuccess('opsPendingStoreMigrate', '운영 대기 저장소 보정', {
                    backfilled,
                    deduplicated,
                });
            }
        } catch (error) {
            // 데이터가 정리되지 않은 상태에서 인덱스를 건드리면 안 된다.
            // syncIndexes 는 옛 인덱스를 먼저 지우는데, 중복이 남아 있으면 새 유니크 인덱스는 만들어지지 않는다.
            // 결과적으로 보호가 있던 자리마저 비고 조회도 느려진다. 다음 부팅에서 다시 시도한다.
            this.logger.logError(
                'opsPendingStoreMigrate',
                '운영 대기 저장소 보정 실패 - 인덱스는 건드리지 않고 다음 부팅에 다시 시도합니다',
                error,
            );
            return;
        }

        // 보정이 끝났다고 데이터가 깨끗하다는 보장은 아니다(한 번에 정리되지 않은 중복 등).
        // 인덱스를 지우기 전에 실제 상태를 확인한다.
        if (await this.hasOpenDuplicates()) {
            this.logger.logWarning(
                'opsPendingStoreMigrate',
                '같은 원본으로 열린 접수가 남아 있어 인덱스를 건드리지 않습니다. 다음 부팅에 다시 시도합니다.',
            );
            return;
        }

        await this.syncIndexes();
    }

    /** 유니크 인덱스를 만들 수 없는 상태인지 (같은 원본으로 열린 문서가 남아 있는지) */
    private async hasOpenDuplicates(): Promise<boolean> {
        try {
            const duplicates = await this.model
                .aggregate<{ _id: unknown }>([
                    { $match: OpsPendingStoreMigrator.OPEN_MATCHER },
                    {
                        $group: {
                            _id: { environment: '$environment', kind: '$kind', referenceId: '$referenceId' },
                            count: { $sum: 1 },
                        },
                    },
                    { $match: { count: { $gt: 1 } } },
                    { $limit: 1 },
                ])
                .exec();

            return duplicates.length > 0;
        } catch {
            // 확인할 수 없으면 건드리지 않는 쪽을 택한다
            return true;
        }
    }

    /** isResolved 가 없는 예전 문서를 resolvedAt 유무로 채운다 */
    private async backfillIsResolved(): Promise<number> {
        const closed = await this.model
            .updateMany(
                { isResolved: { $exists: false }, resolvedAt: { $exists: true } },
                { $set: { isResolved: true } },
            )
            .exec();

        const open = await this.model
            .updateMany(
                { isResolved: { $exists: false }, resolvedAt: { $exists: false } },
                { $set: { isResolved: false } },
            )
            .exec();

        return closed.modifiedCount + open.modifiedCount;
    }

    /**
     * 같은 원본으로 열린 문서가 여럿이면 가장 먼저 만들어진 하나만 남긴다.
     * 백필 전에 돌기 때문에 "열린 건"은 두 가지 형태를 모두 본다 — isResolved: false 와, 필드가 아직 없는 예전 문서.
     */
    private async closeDuplicateOpenEvents(): Promise<number> {
        const duplicateGroups = await this.model
            .aggregate<{ _id: unknown; eventIds: string[] }>([
                { $match: OpsPendingStoreMigrator.OPEN_MATCHER },
                { $sort: { createdAt: 1 } },
                {
                    $group: {
                        _id: { environment: '$environment', kind: '$kind', referenceId: '$referenceId' },
                        eventIds: { $push: '$eventId' },
                    },
                },
                { $match: { 'eventIds.1': { $exists: true } } },
            ])
            .exec();

        if (duplicateGroups.length === 0) return 0;

        // 첫 건(가장 오래된 것)만 남기고 나머지를 닫는다 — 접수 시각과 리마인드 이력이 살아 있는 쪽이다
        const staleEventIds = duplicateGroups.flatMap((group) => group.eventIds.slice(1));

        const result = await this.model
            .updateMany(
                { eventId: { $in: staleEventIds } },
                { $set: { isResolved: true, resolvedAt: new Date(), resolution: '중복 접수 정리' } },
            )
            .exec();

        return result.modifiedCount;
    }

    /**
     * 인덱스를 스키마에 맞춘다. 반드시 "만들고 나서 지우는" 순서로 한다.
     *
     * mongoose 의 syncIndexes 는 스키마에 없는 인덱스를 먼저 지우고 새로 만든다. 그 사이에 생성이
     * 실패하면(중복 데이터, 일시적 오류) 인덱스가 하나도 없는 상태로 남아 조회가 느려지고
     * 중복 방지도 사라진다. 그래서 생성이 끝난 뒤에만 남는 인덱스를 지운다.
     */
    private async syncIndexes(): Promise<void> {
        try {
            await this.createSchemaIndexes();
        } catch (error) {
            // 만들지 못했으면 기존 인덱스라도 그대로 두는 편이 낫다.
            this.logger.logError(
                'opsPendingStoreMigrate',
                '운영 대기 인덱스 생성 실패 - 기존 인덱스를 유지하고 다음 부팅에 다시 시도합니다',
                error,
            );
            return;
        }

        await this.dropUnknownIndexes();
    }

    /** 스키마가 요구하는 인덱스를 만든다. 같은 키에 옵션만 다른 옛 인덱스가 있으면 그것만 교체한다 */
    private async createSchemaIndexes(): Promise<void> {
        try {
            await this.model.createIndexes();
        } catch (error) {
            if (!this.isIndexOptionsConflict(error)) throw error;

            // 같은 키로 옵션이 다른 인덱스(예: 예전 유니크 인덱스)가 있으면 그 인덱스만 지우고 다시 만든다.
            // 이때만 삭제가 앞서며, 바로 뒤이어 같은 키를 만들기 때문에 비는 구간이 사실상 없다.
            const conflicting = await this.findConflictingIndexNames();
            for (const name of conflicting) {
                await this.model.collection.dropIndex(name);
                this.logger.logWarning('opsPendingStoreMigrate', `옵션이 다른 옛 인덱스 교체: ${name}`);
            }

            await this.model.createIndexes();
        }
    }

    /** 스키마에 없는 인덱스를 지운다 (생성이 모두 끝난 뒤에만 호출한다) */
    private async dropUnknownIndexes(): Promise<void> {
        try {
            const schemaKeys = new Set(this.getSchemaIndexKeys());
            const existing = await this.model.collection.indexes();

            const dropped: string[] = [];
            for (const index of existing) {
                if (index.name === '_id_') continue;
                if (schemaKeys.has(JSON.stringify(index.key))) continue;

                await this.model.collection.dropIndex(index.name as string);
                dropped.push(index.name as string);
            }

            if (dropped.length > 0) {
                this.logger.logSuccess('opsPendingStoreMigrate', '운영 대기 인덱스 정리', { dropped });
            }
        } catch (error) {
            // 필요한 인덱스는 이미 만들어진 뒤라 기능에는 문제가 없다. 다음 부팅에 다시 시도한다.
            this.logger.logError('opsPendingStoreMigrate', '사용하지 않는 인덱스 정리 실패', error);
        }
    }

    /** 스키마가 선언한 인덱스 키 목록 */
    private getSchemaIndexKeys(): string[] {
        return this.model.schema.indexes().map(([key]) => JSON.stringify(key));
    }

    /**
     * 스키마와 키는 같은데 옵션이 다른 인덱스 이름만 고른다.
     *
     * 키가 같다는 이유로 전부 지우면 멀쩡한 인덱스(예: 환경별 유니크 인덱스)까지 잠시 사라진다.
     * 실제로 다시 만들어야 하는 것만 골라야 보호가 끊기지 않는다.
     */
    private async findConflictingIndexNames(): Promise<string[]> {
        const schemaOptionsByKey = new Map(
            this.model.schema.indexes().map(([key, options]) => [JSON.stringify(key), options ?? {}]),
        );
        const existing = await this.model.collection.indexes();

        return existing
            .filter((index) => {
                if (index.name === '_id_') return false;

                const schemaOptions = schemaOptionsByKey.get(JSON.stringify(index.key));
                // 스키마에 없는 키는 여기서 건드리지 않는다 (생성이 끝난 뒤 정리 단계에서 처리한다)
                if (!schemaOptions) return false;

                return this.hasDifferentOptions(index, schemaOptions);
            })
            .map((index) => index.name as string);
    }

    /** 실제 인덱스와 스키마 선언의 옵션이 다른지 (다르면 같은 키로는 만들 수 없다) */
    private hasDifferentOptions(
        existing: {
            unique?: boolean;
            sparse?: boolean;
            expireAfterSeconds?: number;
            partialFilterExpression?: unknown;
        },
        schemaOptions: Record<string, unknown>,
    ): boolean {
        if (Boolean(existing.unique) !== Boolean(schemaOptions.unique)) return true;
        if (Boolean(existing.sparse) !== Boolean(schemaOptions.sparse)) return true;
        if (existing.expireAfterSeconds !== (schemaOptions.expireAfterSeconds as number | undefined)) return true;

        return (
            JSON.stringify(existing.partialFilterExpression ?? null) !==
            JSON.stringify(schemaOptions.partialFilterExpression ?? null)
        );
    }

    /** 같은 키에 다른 옵션으로 인덱스가 이미 있을 때 MongoDB 가 주는 오류인지 */
    private isIndexOptionsConflict(error: unknown): boolean {
        if (typeof error !== 'object' || error === null) return false;

        const code = (error as { code?: number }).code;
        // 85: IndexOptionsConflict, 86: IndexKeySpecsConflict
        return code === 85 || code === 86;
    }
}
