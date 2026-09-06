import type { ExecutionContext } from '@nestjs/common';
import type { Server } from 'http';
import type { RequestWithUser } from '../../../../../common/types/authenticated-request-user.type';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createConnection, Connection } from 'mongoose';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { HomeAdminSupportController } from '../../controller/home-admin-support.controller';
import { ManageSupportUseCase } from '../../application/use-cases/manage-support.use-case';
import { SUPPORT_MANAGEMENT_PORT } from '../../application/ports/support-management.port';
import { SupportManagementRepository } from '../../repository/support-management.repository';
import { SupportEventRecord, SupportEventSchema } from '../../../../../schema/support-event.schema';
import { SupportEventRepository } from '../../../../service/home/repository/support-event.repository';
import { JwtAuthGuard } from '../../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../../common/guard/roles.guard';

describe('고객지원 관리자 계약과 원자적 이력', () => {
    let app: INestApplication;
    let mongo: MongoMemoryServer;
    let db: Connection;
    let repository: SupportManagementRepository;
    let outbox: SupportEventRepository;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        db = await createConnection(mongo.getUri()).asPromise();
        const model = db.model(SupportEventRecord.name, SupportEventSchema);
        await model.init();
        repository = new SupportManagementRepository(model);
        outbox = new SupportEventRepository(model);
        const module = await Test.createTestingModule({
            controllers: [HomeAdminSupportController],
            providers: [
                ManageSupportUseCase,
                RolesGuard,
                { provide: SUPPORT_MANAGEMENT_PORT, useValue: repository },
                { provide: ConfigService, useValue: { get: () => 'production' } },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest<RequestWithUser>();
                    if (!req.headers['x-test-role']) throw new UnauthorizedException();
                    req.user = {
                        userId: 'operator-1',
                        role: String(req.headers['x-test-role']),
                        email: 'test@example.com',
                    };
                    return true;
                },
            })
            .compile();
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
        await app.init();
    });
    afterAll(async () => {
        await app?.close();
        await db?.close();
        await mongo?.stop();
    });
    beforeEach(async () => {
        await db.model<SupportEventRecord>(SupportEventRecord.name).deleteMany({});
    });
    const seed = async (env = 'production') => {
        const id = randomUUID();
        await outbox.insert({ eventId: id, kind: 'feedback', userType: 'adopter', message: 'test' }, env);
        return id;
    };
    it('미인증·일반 사용자 접근을 차단한다', async () => {
        await request(app.getHttpServer() as Server).get('/home-admin/support').expect(401);
        await request(app.getHttpServer() as Server).get('/home-admin/support').set('x-test-role', 'adopter').expect(403);
    });
    it('환경을 분리하고 접수번호 검색을 지원한다', async () => {
        const id = await seed();
        await seed('development');
        const r = await request(app.getHttpServer() as Server)
            .get('/home-admin/support')
            .query({ receiptId: id })
            .set('x-test-role', 'admin')
            .expect(200);
        expect((r.body as { data: { total: number } }).data.total).toBe(1);
        expect((r.body as { data: { items: { eventId: string }[] } }).data.items[0].eventId).toBe(id);
    });
    it('동시 수정 하나만 성공하고 기존 전송 워커는 새 상태를 완료 처리하지 못한다', async () => {
        const id = await seed();
        await outbox.claim('production', 'old-worker');
        const results = await Promise.all([
            repository.update('production', id, 'operator-1', { revision: 0, status: 'in_progress', assignment: 'me' }),
            repository.update('production', id, 'operator-2', { revision: 0, status: 'in_progress', assignment: 'me' }),
        ]);
        expect(results.filter(Boolean)).toHaveLength(1);
        await outbox.delivered(id, 'old-worker');
        const record = await db.model<SupportEventRecord>(SupportEventRecord.name).findOne({ eventId: id });
        expect(record?.history).toHaveLength(1);
        expect(record?.revision).toBe(1);
        expect(record?.deliveryStatus).toBe('pending');
    });
    it('해결 메모·revision 검증과 재개 이력을 저장한다', async () => {
        const id = await seed();
        const patch = (body: object) =>
            request(app.getHttpServer() as Server)
                .patch('/home-admin/support/' + id)
                .set('x-test-role', 'admin')
                .send(body);
        await patch({ revision: 0, status: 'resolved' }).expect(400);
        const result = await patch({
            revision: 0,
            status: 'resolved',
            assignment: 'me',
            note: '수정 배포 확인함',
        }).expect(200);
        expect((result.body as { data: { assigneeId: string } }).data.assigneeId).toBe('operator-1');
        await patch({ revision: 0, status: 'open' }).expect(409);
        const reopened = await patch({ revision: 1, status: 'open', note: '재현되어 재개함' }).expect(200);
        expect((reopened.body as { data: { history: unknown[] } }).data.history).toHaveLength(2);
    });
});
