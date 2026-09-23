import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose, { type Connection, Types } from 'mongoose';
import { firstValueFrom, from, of } from 'rxjs';
import { AccountWriteFenceRepository } from '../account-write-fence.repository';
import { AccountWriteFenceService } from '../account-write-fence.service';
import { AccountWriteFenceInterceptor } from '../account-write-fence.interceptor';
import type { AccountWriteActor } from '../account-write-fence.port';

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<T>((yes, no) => {
        resolve = yes;
        reject = no;
    });
    return { promise, resolve, reject };
}

describe('durable account mutation fence (real isolated Mongo transactions)', () => {
    let mongo: MongoMemoryReplSet;
    let connection: Connection;
    let repository: AccountWriteFenceRepository;
    let service: AccountWriteFenceService;
    let actor: AccountWriteActor;
    const leases = () => connection.db!.collection('account_write_leases');
    const accounts = () => connection.db!.collection('adopters');

    beforeAll(async () => {
        mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
        connection = await mongoose.createConnection(mongo.getUri()).asPromise();
        await connection.db!.createCollection('adopters');
        await connection.db!.createCollection('breeders');
        repository = new AccountWriteFenceRepository(connection);
        await repository.onModuleInit();
        service = new AccountWriteFenceService(repository);
    }, 60000);
    beforeEach(async () => {
        await accounts().deleteMany({});
        await connection.db!.collection('breeders').deleteMany({});
        await leases().deleteMany({});
        const id = new Types.ObjectId();
        actor = { accountId: String(id), role: 'adopter', operation: 'test:write' };
        await accounts().insertOne({ _id: id, userRole: 'adopter', accountStatus: 'active' });
    });
    afterAll(async () => {
        await connection?.close();
        await mongo?.stop();
    });

    // 삭제 접수의 계정 row 갱신과 동일한 잠금 경계를 독립적으로 재현한다.
    async function requestDeletion() {
        const session = await connection.startSession();
        try {
            await session.withTransaction(async () => {
                const result = await accounts().updateOne(
                    { _id: new Types.ObjectId(actor.accountId), accountStatus: 'active' },
                    {
                        $set: { accountStatus: 'deleted', permanentDeletionRequestedAt: new Date() },
                    },
                    { session },
                );
                expect(result.matchedCount).toBe(1);
            });
        } finally {
            await session.endSession();
        }
    }

    it('keeps deletion blocked while an existing mutation runs and refuses starts after deletion lock', async () => {
        const started = deferred<void>();
        const finish = deferred<string>();
        const mutation = service.runWithLease(actor, () => {
            started.resolve();
            return finish.promise;
        });
        await started.promise;
        await requestDeletion();
        expect(await leases().countDocuments({ accountId: actor.accountId, role: actor.role })).toBe(1);
        await expect(service.runWithLease(actor, () => Promise.resolve('must not run'))).rejects.toBeInstanceOf(
            UnauthorizedException,
        );
        finish.resolve('done');
        await expect(mutation).resolves.toBe('done');
        expect(await leases().countDocuments()).toBe(0);
    });

    it('holds both participants until an incoming chat write completes while the recipient requests deletion', async () => {
        const receiverId = new Types.ObjectId();
        const receiver: AccountWriteActor = {
            accountId: String(receiverId),
            role: 'breeder',
            operation: 'chat:receive_message',
        };
        const receivers = connection.db!.collection('breeders');
        await receivers.insertOne({ _id: receiverId, userRole: 'breeder', accountStatus: 'active' });
        const started = deferred<void>();
        const finish = deferred<string>();
        const send = service.runWithLease(actor, () =>
            service.runWithLease(receiver, () => {
                started.resolve();
                return finish.promise;
            }),
        );
        await started.promise;
        await receivers.updateOne(
            { _id: receiverId },
            { $set: { accountStatus: 'deleted', permanentDeletionRequestedAt: new Date() } },
        );
        expect(await leases().countDocuments({ accountId: receiver.accountId, role: receiver.role })).toBe(1);
        await expect(service.runWithLease(receiver, () => Promise.resolve('late receive'))).rejects.toBeInstanceOf(
            UnauthorizedException,
        );
        finish.resolve('saved');
        await expect(send).resolves.toBe('saved');
        expect(await leases().countDocuments()).toBe(0);
    });

    it('serializes concurrent mutation starts against deletion and preserves every winning writer lease', async () => {
        const requests = Array.from({ length: 12 }, () => repository.acquire(actor));
        const outcomes = await Promise.allSettled([...requests, requestDeletion()]);
        expect(outcomes[12].status).toBe('fulfilled');
        const winners = outcomes.slice(0, 12).filter((result) => result.status === 'fulfilled');
        expect(await leases().countDocuments()).toBe(winners.length);
        expect(await accounts().findOne({ _id: new Types.ObjectId(actor.accountId) })).toMatchObject({
            accountStatus: 'deleted',
        });
        await expect(repository.acquire(actor)).rejects.toBeInstanceOf(UnauthorizedException);
        for (const result of await Promise.allSettled(requests))
            if (result.status === 'fulfilled') await repository.release(result.value);
        expect(await leases().countDocuments()).toBe(0);
    });

    it.each(['suspended', 'deleted', 'missing'])('never invokes a mutation for a %s account', async (status) => {
        if (status === 'missing') await accounts().deleteMany({});
        else await accounts().updateOne({}, { $set: { accountStatus: status } });
        const callback = jest.fn(() => Promise.resolve('no'));
        await expect(service.runWithLease(actor, callback)).rejects.toBeInstanceOf(UnauthorizedException);
        expect(callback).not.toHaveBeenCalled();
        expect(await leases().countDocuments()).toBe(0);
    });

    it('rejects an active account with a permanent deletion marker or mismatched role', async () => {
        await accounts().updateOne({}, { $set: { permanentDeletionRequestedAt: new Date() } });
        await expect(repository.acquire(actor)).rejects.toBeInstanceOf(UnauthorizedException);
        await accounts().updateOne({}, { $unset: { permanentDeletionRequestedAt: '' }, $set: { userRole: 'admin' } });
        await expect(repository.acquire(actor)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('releases only after a rejected handler settles and does not delete another owner lease', async () => {
        const started = deferred<void>();
        const finish = deferred<string>();
        const running = service.runWithLease(actor, () => {
            started.resolve();
            return finish.promise;
        });
        const outcome = expect(running).rejects.toThrow('synthetic operation error');
        await started.promise;
        expect(await leases().countDocuments()).toBe(1);
        finish.reject(new Error('synthetic operation error'));
        await outcome;
        expect(await leases().countDocuments()).toBe(0);
        const lease = await repository.acquire(actor);
        await repository.release({ ...lease, ownerId: 'another-process' });
        expect(await leases().countDocuments()).toBe(1);
        await repository.release(lease);
    });

    it('retains abandoned leases regardless of age and declares no TTL expiry', async () => {
        await repository.acquire(actor);
        await leases().updateMany({}, { $set: { startedAt: new Date('2000-01-01') } });
        await requestDeletion();
        expect(await leases().countDocuments({ accountId: actor.accountId, role: actor.role })).toBe(1);
        expect((await leases().indexes()).every((index) => index.expireAfterSeconds === undefined)).toBe(true);
    });

    it('client unsubscribe does not release a lease while the async HTTP handler is still running', async () => {
        const interceptor = new AccountWriteFenceInterceptor(service);
        const started = deferred<void>();
        const finish = deferred<string>();
        const context = {
            getType: () => 'http',
            switchToHttp: () => ({
                getRequest: () => ({
                    method: 'POST',
                    originalUrl: '/api/v2/community/posts',
                    user: { userId: actor.accountId, role: actor.role },
                }),
            }),
        } as unknown as ExecutionContext;
        const finishedRelease = deferred<void>();
        const original = new AccountWriteFenceRepository(connection);
        const spy = jest.spyOn(repository, 'release').mockImplementationOnce(async (lease) => {
            await original.release(lease);
            finishedRelease.resolve();
        });
        try {
            const subscription = interceptor
                .intercept(context, {
                    handle: () => {
                        started.resolve();
                        return from(finish.promise);
                    },
                })
                .subscribe();
            await started.promise;
            subscription.unsubscribe();
            await requestDeletion();
            expect(await leases().countDocuments()).toBe(1);
            finish.resolve('actual handler completed');
            await finishedRelease.promise;
            expect(await leases().countDocuments()).toBe(0);
        } finally {
            spy.mockRestore();
        }
    });

    it('does not exempt similar account-deletion path prefixes from mutation fencing', async () => {
        const interceptor = new AccountWriteFenceInterceptor(service);
        await requestDeletion();
        const handle = jest.fn(() => of('must not run'));
        const context = {
            getType: () => 'http',
            switchToHttp: () => ({
                getRequest: () => ({
                    method: 'PATCH',
                    originalUrl: '/api/v2/account-deletion-settings',
                    user: { userId: actor.accountId, role: actor.role },
                }),
            }),
        } as unknown as ExecutionContext;
        await expect(firstValueFrom(interceptor.intercept(context, { handle }))).rejects.toBeInstanceOf(
            UnauthorizedException,
        );
        expect(handle).not.toHaveBeenCalled();
    });

    it.each([
        { method: 'GET', url: '/api/v2/community/posts', user: { userId: 'id', role: 'adopter' } },
        { method: 'POST', url: '/api/v2/account-deletion', user: { userId: 'id', role: 'adopter' } },
        { method: 'POST', url: '/api/v2/account-deletion/status' },
        { method: 'POST', url: '/v2/account-deletion/', user: { userId: 'id', role: 'breeder' } },
        { method: 'POST', url: '/api/v2/account-deletion/status?ignored=yes', user: { userId: 'id', role: 'breeder' } },
        {
            method: 'POST',
            url: '/api/v2/account-deletion',
            originalUrl: '/api/v2/account-deletion?ignored=yes',
            user: { userId: 'id', role: 'adopter' },
        },
        { method: 'POST', url: '/api/v2/auth/register/adopter' },
        { method: 'POST', url: '/api/breeder-admin/approve', user: { userId: 'id', role: 'admin' } },
    ])('leaves non-service-mutations unchanged: $method $url', async (value) => {
        const interceptor = new AccountWriteFenceInterceptor(service);
        const context = {
            getType: () => 'http',
            switchToHttp: () => ({ getRequest: () => value }),
        } as unknown as ExecutionContext;
        expect(await firstValueFrom(interceptor.intercept(context, { handle: () => of('unchanged') }))).toBe(
            'unchanged',
        );
        expect(await leases().countDocuments()).toBe(0);
    });
});
