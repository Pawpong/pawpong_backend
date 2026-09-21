import { CustomLoggerService } from '../../../logger/custom-logger.service';
import { OpsPendingStoreMigrator } from '../../infrastructure/ops-pending-store.migrator';

describe('OpsPendingStoreMigrator', () => {
    let model: {
        updateMany: jest.Mock;
        aggregate: jest.Mock;
        createIndexes: jest.Mock;
        schema: { indexes: jest.Mock };
        collection: { indexes: jest.Mock; dropIndex: jest.Mock };
    };
    let logger: { logSuccess: jest.Mock; logWarning: jest.Mock; logError: jest.Mock };

    const execResult = (modifiedCount: number) => ({ exec: jest.fn().mockResolvedValue({ modifiedCount }) });

    const buildMigrator = () => new OpsPendingStoreMigrator(model as never, logger as unknown as CustomLoggerService);

    beforeEach(() => {
        model = {
            updateMany: jest.fn().mockReturnValue(execResult(0)),
            aggregate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
            createIndexes: jest.fn().mockResolvedValue(undefined),
            schema: {
                indexes: jest.fn().mockReturnValue([
                    [
                        { environment: 1, kind: 1, referenceId: 1 },
                        { unique: true, partialFilterExpression: { isResolved: false } },
                    ],
                    [{ kind: 1, referenceId: 1 }, {}],
                ]),
            },
            collection: {
                indexes: jest.fn().mockResolvedValue([
                    { name: '_id_', key: { _id: 1 } },
                    {
                        name: 'environment_1_kind_1_referenceId_1',
                        key: { environment: 1, kind: 1, referenceId: 1 },
                        unique: true,
                        partialFilterExpression: { isResolved: false },
                    },
                    { name: 'kind_1_referenceId_1', key: { kind: 1, referenceId: 1 } },
                ]),
                dropIndex: jest.fn().mockResolvedValue(undefined),
            },
        };
        logger = { logSuccess: jest.fn(), logWarning: jest.fn(), logError: jest.fn() };
    });

    it('isResolved 가 없는 예전 문서를 resolvedAt 유무로 채운다', async () => {
        // 백필하지 않으면 그 문서들은 조회에 잡히지 않아 리마인드도 종료도 되지 않는다
        await buildMigrator().onModuleInit();

        expect(model.updateMany).toHaveBeenCalledWith(
            { isResolved: { $exists: false }, resolvedAt: { $exists: true } },
            { $set: { isResolved: true } },
        );
        expect(model.updateMany).toHaveBeenCalledWith(
            { isResolved: { $exists: false }, resolvedAt: { $exists: false } },
            { $set: { isResolved: false } },
        );
    });

    it('같은 원본으로 열린 문서가 여럿이면 가장 오래된 하나만 남긴다', async () => {
        // 유니크 인덱스가 없던 시절의 중복이 남아 있으면 인덱스를 만들 수 없다
        model.aggregate.mockReturnValue({
            exec: jest.fn().mockResolvedValue([{ _id: {}, eventIds: ['keep-1', 'stale-1', 'stale-2'] }]),
        });
        model.updateMany.mockReturnValue(execResult(2));

        await buildMigrator().onModuleInit();

        expect(model.updateMany).toHaveBeenCalledWith(
            { eventId: { $in: ['stale-1', 'stale-2'] } },
            expect.objectContaining({
                $set: expect.objectContaining({ isResolved: true, resolution: '중복 접수 정리' }) as unknown,
            }),
        );
    });

    it('보정이 실패하면 인덱스는 건드리지 않는다', async () => {
        // 데이터가 정리되지 않은 채 syncIndexes 를 돌리면 옛 인덱스만 지워지고
        // 새 유니크 인덱스는 만들어지지 않아 보호가 더 약해진다
        model.updateMany.mockReturnValue({ exec: jest.fn().mockRejectedValue(new Error('db down')) });

        await expect(buildMigrator().onModuleInit()).resolves.toBeUndefined();

        expect(logger.logError).toHaveBeenCalled();
        expect(model.createIndexes).not.toHaveBeenCalled();
    });

    it('열린 중복이 남아 있으면 인덱스를 건드리지 않는다', async () => {
        // 중복이 남은 채 syncIndexes 를 돌리면 옛 인덱스만 지워지고 새 유니크 인덱스는 실패한다
        model.aggregate
            .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue([]) }) // 중복 정리 단계
            .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue([{ _id: {} }]) }); // 사후 확인 단계

        await buildMigrator().onModuleInit();

        expect(model.createIndexes).not.toHaveBeenCalled();
        expect(logger.logWarning).toHaveBeenCalled();
    });

    it('인덱스를 만든 뒤에 스키마에 없는 인덱스를 지운다', async () => {
        // 지우기를 먼저 하면 생성이 실패했을 때 인덱스가 하나도 없는 상태로 남는다
        model.collection.indexes.mockResolvedValue([
            { name: '_id_', key: { _id: 1 } },
            {
                name: 'environment_1_kind_1_referenceId_1',
                key: { environment: 1, kind: 1, referenceId: 1 },
                unique: true,
                partialFilterExpression: { isResolved: false },
            },
            { name: 'legacy_1', key: { legacy: 1 } },
        ]);

        await buildMigrator().onModuleInit();

        expect(model.createIndexes).toHaveBeenCalled();
        expect(model.collection.dropIndex).toHaveBeenCalledWith('legacy_1');
        expect(logger.logSuccess).toHaveBeenCalledWith('opsPendingStoreMigrate', expect.any(String), {
            dropped: ['legacy_1'],
        });
    });

    it('인덱스 생성이 실패하면 기존 인덱스를 지우지 않는다', async () => {
        model.createIndexes.mockRejectedValue(new Error('duplicate key'));

        await buildMigrator().onModuleInit();

        expect(model.collection.dropIndex).not.toHaveBeenCalled();
        expect(logger.logError).toHaveBeenCalled();
    });

    it('옵션이 다른 옛 인덱스만 교체하고 멀쩡한 인덱스는 건드리지 않는다', async () => {
        // 키가 같다는 이유로 전부 지우면 환경별 유니크 인덱스가 잠시 사라져 중복 방지가 끊긴다
        const conflict = Object.assign(new Error('IndexOptionsConflict'), { code: 85 });
        model.createIndexes.mockRejectedValueOnce(conflict).mockResolvedValueOnce(undefined);
        model.collection.indexes.mockResolvedValue([
            { name: '_id_', key: { _id: 1 } },
            // 스키마와 같은 옵션 — 그대로 둬야 한다
            {
                name: 'environment_1_kind_1_referenceId_1',
                key: { environment: 1, kind: 1, referenceId: 1 },
                unique: true,
                partialFilterExpression: { isResolved: false },
            },
            // 예전 유니크 인덱스 — 스키마는 일반 인덱스라 교체 대상이다
            { name: 'kind_1_referenceId_1', key: { kind: 1, referenceId: 1 }, unique: true },
        ]);

        await buildMigrator().onModuleInit();

        expect(model.collection.dropIndex).toHaveBeenCalledWith('kind_1_referenceId_1');
        expect(model.collection.dropIndex).not.toHaveBeenCalledWith('environment_1_kind_1_referenceId_1');
        expect(model.createIndexes).toHaveBeenCalledTimes(2);
    });
});
