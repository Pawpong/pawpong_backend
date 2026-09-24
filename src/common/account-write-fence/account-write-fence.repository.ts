import { randomUUID } from 'node:crypto';
import { Injectable, type OnModuleInit, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import type { AccountWriteActor, AccountWriteFenceStore, AccountWriteLease } from './account-write-fence.port';

type LeaseDocument = Omit<AccountWriteLease, 'leaseId'> & { _id: string };

/** 삭제 접수와 같은 계정 row를 쓰므로 어느 작업이 먼저 시작했는지 트랜잭션으로 직렬화한다. */
@Injectable()
export class AccountWriteFenceRepository implements AccountWriteFenceStore, OnModuleInit {
    private readonly ownerId = randomUUID();
    constructor(@InjectConnection() private readonly connection: Connection) {}
    private leases() {
        return this.connection.db!.collection<LeaseDocument>('account_write_leases');
    }

    /** 시간 경과만으로 진행 중 쓰기를 종료했다고 가정하지 않으므로 TTL 인덱스를 만들지 않는다. */
    async onModuleInit() {
        await this.leases().createIndex({ accountId: 1, role: 1 });
        await this.leases().createIndex({ ownerId: 1, startedAt: 1 });
    }

    /** 활성 계정 확인, 계정 row 쓰기, lease 등록을 하나의 원자적 작업으로 수행한다. */
    async acquire(actor: AccountWriteActor): Promise<AccountWriteLease> {
        if (!Types.ObjectId.isValid(actor.accountId) || !['adopter', 'breeder'].includes(actor.role)) {
            throw new UnauthorizedException('이 계정으로 변경 작업을 진행할 수 없습니다.');
        }
        const lease: AccountWriteLease = {
            ...actor,
            operation: actor.operation.slice(0, 80),
            leaseId: randomUUID(),
            ownerId: this.ownerId,
            startedAt: new Date(),
        };
        const session = await this.connection.startSession();
        try {
            await session.withTransaction(
                async () => {
                    const changed = await this.connection
                        .db!.collection(actor.role === 'adopter' ? 'adopters' : 'breeders')
                        .updateOne(
                            {
                                _id: new Types.ObjectId(actor.accountId),
                                accountStatus: 'active',
                                userRole: actor.role,
                                permanentDeletionRequestedAt: { $exists: false },
                            },
                            { $inc: { _mutationFenceRevision: 1 } },
                            { session },
                        );
                    if (changed.matchedCount !== 1)
                        throw new UnauthorizedException('이 계정으로 변경 작업을 진행할 수 없습니다.');
                    await this.leases().insertOne(
                        {
                            _id: lease.leaseId,
                            accountId: lease.accountId,
                            role: lease.role,
                            ownerId: lease.ownerId,
                            operation: lease.operation,
                            startedAt: lease.startedAt,
                        },
                        { session },
                    );
                },
                { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } },
            );
            return lease;
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;
            throw new ServiceUnavailableException('변경 작업을 안전하게 시작할 수 없습니다. 다시 시도해 주세요.');
        } finally {
            await session.endSession();
        }
    }

    /** 실제 handler가 종료됐을 때만 자신의 lease를 제거한다. 실패하면 durable 기록을 남겨 삭제를 막는다. */
    async release(lease: AccountWriteLease): Promise<void> {
        try {
            await this.leases().deleteOne(
                {
                    _id: lease.leaseId,
                    ownerId: lease.ownerId,
                    accountId: lease.accountId,
                    role: lease.role,
                },
                { writeConcern: { w: 'majority' } },
            );
        } catch {
            throw new ServiceUnavailableException('변경 작업 종료를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
    }
}
