import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Connection, Types } from 'mongoose';
import request from 'supertest';
import type { Server } from 'http';
import { randomUUID } from 'crypto';
import { AccountDeletionModule } from '../account-deletion.module';
import { StorageService } from '../../../../common/storage/storage.service';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { AppleCredentialService } from '../../auth/apple-credentials/application/apple-credential.service';
import { AccountDeletionDraftStore } from '../infrastructure/account-deletion-draft.store';
import { ProcessAccountDeletionUseCase } from '../application/use-cases/process-account-deletion.use-case';
import { AdopterSchema } from '../../../../schema/adopter.schema';
import { WinstonModule } from 'nest-winston';
jest.mock('uuid', () => ({ v4: () => 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }));

describe('AccountDeletionModule 실제 DI + HTTP 계약', () => {
    jest.setTimeout(60_000);
    let replica: MongoMemoryReplSet;
    let app: INestApplication;
    const id = new Types.ObjectId();
    beforeAll(async () => {
        replica = await MongoMemoryReplSet.create({ replSet: { count: 1 }, instanceOpts: [{ args: ['--quiet'] }] });
        const module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true }),
                WinstonModule.forRoot({ silent: true, transports: [] }),
                EventEmitterModule.forRoot(),
                MongooseModule.forRoot(replica.getUri()),
                AccountDeletionModule,
            ],
        })
            .overrideProvider(StorageService)
            .useValue({
                getCdnUrl: () => 'https://cdn.test/',
                toFileKey: (key: string) => key,
                listObjects: () => Promise.resolve({ Contents: [] }),
                deleteFile: jest.fn(),
            })
            .overrideProvider(AppleCredentialService)
            .useValue({ revoke: () => Promise.resolve({ status: 'not_applicable' }) })
            .overrideProvider(AccountDeletionDraftStore)
            .useValue({ get: () => Promise.resolve(null), delete: () => Promise.resolve(undefined) })
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (ctx: ExecutionContext) => {
                    ctx.switchToHttp().getRequest<{ user: { userId: string; role: string } }>().user = {
                        userId: String(id),
                        role: 'adopter',
                    };
                    return true;
                },
            })
            .compile();
        app = module.createNestApplication();
        app.setGlobalPrefix('api');
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
        await app.init();
        const connection = app.get<Connection>(getConnectionToken());
        await connection.model('Adopter', AdopterSchema).create({
            _id: id,
            emailAddress: 'module-fixture@example.invalid',
            nickname: 'DI 합성 계정',
            userRole: 'adopter',
            termsAgreed: true,
            privacyAgreed: true,
        });
    });
    afterAll(async () => {
        await app?.close();
        await replica?.stop();
    });
    it('타인 ID 입력·부분 영수증을 거부하고 준비 영수증으로 접수/완료 후 최소 상태만 반환한다', async () => {
        const prepared = { requestId: randomUUID(), receiptToken: 'q'.repeat(43) };
        await request(app.getHttpServer() as Server)
            .post('/api/v2/account-deletion')
            .send({ confirmation: 'DELETE_PERMANENTLY', accountId: String(new Types.ObjectId()) })
            .expect(400);
        await request(app.getHttpServer() as Server)
            .post('/api/v2/account-deletion')
            .send({ confirmation: 'DELETE_PERMANENTLY', requestId: prepared.requestId })
            .expect(400);
        const accepted = await request(app.getHttpServer() as Server)
            .post('/api/v2/account-deletion')
            .send({ confirmation: 'DELETE_PERMANENTLY', ...prepared })
            .expect(202);
        expect((accepted.body as { data: Record<string, unknown> }).data).toMatchObject({
            requestId: prepared.requestId,
            receiptToken: prepared.receiptToken,
            status: 'pending',
        });
        expect(await app.get(ProcessAccountDeletionUseCase).execute(prepared.requestId)).toBe(true);
        const status = await request(app.getHttpServer() as Server)
            .post('/api/v2/account-deletion/status')
            .send(prepared)
            .expect(200);
        expect((status.body as { data: Record<string, unknown> }).data).toMatchObject({
            requestId: prepared.requestId,
            status: 'completed',
        });
        expect((status.body as { data: Record<string, unknown> }).data).not.toHaveProperty('accountId');
        expect((status.body as { data: Record<string, unknown> }).data).not.toHaveProperty('receiptToken');
        await request(app.getHttpServer() as Server)
            .post('/api/v2/account-deletion/status')
            .send({ ...prepared, receiptToken: 's'.repeat(43) })
            .expect(404);
    });
});
