import type { Server } from 'node:http';
import { type INestApplication, ValidationPipe, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose, { type Connection, type Model } from 'mongoose';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { Adopter, AdopterSchema } from '../../../../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../../../../schema/breeder.schema';
import { ReviewCredential, ReviewCredentialSchema } from '../../../../../schema/review-credential.schema';
import { HttpExceptionFilter } from '../../../../../common/filter/http-exception.filter';
import { AuthJwtTokenAdapter } from '../../infrastructure/auth-jwt-token.adapter';
import { AUTH_TOKEN_PORT } from '../../application/ports/auth-token.port';
import { ReviewLoginController } from '../presentation/review-login.controller';
import { LoginReviewAccountUseCase, REVIEW_LOGIN_FAILED } from '../application/login-review-account.use-case';
import { REVIEW_ACCOUNT_PORT, REVIEW_LOGIN_LIMIT_PORT, REVIEW_PASSWORD_PORT } from '../application/review-login.port';
import { ReviewPasswordAdapter } from '../infrastructure/review-password.adapter';
import { ReviewAccountRepository } from '../repository/review-account.repository';

describe('review login HTTP and real account boundary', () => {
    let mongo: MongoMemoryReplSet;
    let connection: Connection;
    let app: INestApplication;
    let adopters: Model<Adopter>;
    let breeders: Model<Breeder>;
    let credentials: Model<ReviewCredential>;
    let repository: ReviewAccountRepository;
    let hash: string;
    const password = 'synthetic-review-password-123456';
    const email = 'review-adopter@example.test';
    const jwt = new JwtService({ secret: 'test-only-jwt-secret-not-used-outside-tests' });
    const limit = { allow: jest.fn().mockResolvedValue(true) };

    beforeAll(async () => {
        mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
        connection = await mongoose.createConnection(mongo.getUri()).asPromise();
        adopters = connection.model<Adopter>(Adopter.name, AdopterSchema);
        breeders = connection.model<Breeder>(Breeder.name, BreederSchema);
        credentials = connection.model<ReviewCredential>(ReviewCredential.name, ReviewCredentialSchema);
        await Promise.all([adopters.init(), breeders.init(), credentials.init()]);
        hash = await bcrypt.hash(password, 12);
        repository = new ReviewAccountRepository(credentials, adopters, breeders);
        const module = await Test.createTestingModule({
            controllers: [ReviewLoginController],
            providers: [
                LoginReviewAccountUseCase,
                { provide: REVIEW_ACCOUNT_PORT, useValue: repository },
                { provide: REVIEW_PASSWORD_PORT, useClass: ReviewPasswordAdapter },
                { provide: REVIEW_LOGIN_LIMIT_PORT, useValue: limit },
                {
                    provide: AUTH_TOKEN_PORT,
                    useValue: new AuthJwtTokenAdapter(jwt, { get: () => undefined } as unknown as ConfigService),
                },
            ],
        }).compile();
        app = module.createNestApplication();
        app.setGlobalPrefix('api');
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
        app.useGlobalFilters(new HttpExceptionFilter());
        await app.init();
        // Supertest가 요청마다 같은 서버를 열고 닫으면 병렬 테스트의 임시 포트와 경쟁한다.
        await app.listen(0, '127.0.0.1');
    }, 60000);

    beforeEach(async () => {
        await Promise.all([adopters.deleteMany({}), breeders.deleteMany({}), credentials.deleteMany({})]);
        limit.allow.mockReset().mockResolvedValue(true);
    });

    afterAll(async () => {
        await app?.close();
        await connection?.close();
        await mongo?.stop();
    });

    async function create(role: 'adopter' | 'breeder' = 'adopter', overrides: Record<string, unknown> = {}) {
        const base = {
            emailAddress: email,
            nickname: '심사 테스트',
            userRole: role,
            accountStatus: 'active',
            socialAuthInfo: { authProvider: 'local' },
        };
        const actor =
            role === 'adopter'
                ? await adopters.create({ ...base, ...overrides })
                : await breeders.create({
                      ...base,
                      name: '테스트 브리더',
                      petType: 'dog',
                      verification: { status: 'approved', plan: 'basic' },
                      profile: { specialization: ['dog'] },
                      isTestAccount: true,
                      ...overrides,
                  });
        await credentials.create({
            emailAddress: email,
            accountId: actor._id,
            role,
            passwordHash: hash,
            enabled: true,
            provisionedBy: 'test',
        });
        return actor;
    }
    const login = (body: Record<string, unknown> = { emailAddress: email, password }) =>
        request(app.getHttpServer() as Server)
            .post('/api/auth/review-login')
            .send(body);

    it.each(['adopter', 'breeder'] as const)(
        'issues ordinary %s JWT and a hashed refresh session without credential fields',
        async (role) => {
            const account = await create(role);
            const response = await login({ emailAddress: `  ${email.toUpperCase()}  `, password }).expect(200);
            expect(response.headers['cache-control']).toBe('no-store');
            expect(response.headers['set-cookie']).toBeUndefined();
            expect(response.body).toMatchObject({
                success: true,
                code: 200,
                data: { expiresIn: 86400, user: { userId: String(account._id), email, role } },
            });
            const tokens = (response.body as { data: { accessToken: string; refreshToken: string } }).data;
            expect(jwt.verify(tokens.accessToken)).toMatchObject({ sub: String(account._id), role, email });
            expect(jwt.verify(tokens.refreshToken)).toMatchObject({ sub: String(account._id), role, type: 'refresh' });
            const stored =
                role === 'adopter' ? await adopters.findById(account._id) : await breeders.findById(account._id);
            expect(await bcrypt.compare(tokens.refreshToken, stored!.refreshToken!)).toBe(true);
            expect(stored!.passwordHash).toBeUndefined();
            expect(JSON.stringify(response.body)).not.toMatch(/password|enabled|isTestAccount|provisionedBy/);
            expect(JSON.stringify(response.body)).not.toContain(hash);
            expect(limit.allow).toHaveBeenCalledWith(expect.any(String), email);
            // Logout clears the ordinary stored refresh hash; credentials can still authenticate again.
            if (role === 'adopter') await adopters.updateOne({ _id: account._id }, { $unset: { refreshToken: 1 } });
            else await breeders.updateOne({ _id: account._id }, { $unset: { refreshToken: 1 } });
            await login().expect(200);
        },
    );

    it.each(['suspended', 'deleted'])(
        'rejects %s accounts even with valid review credentials',
        async (accountStatus) => {
            await create('adopter', { accountStatus });
            const result = await login().expect(401);
            expect((result.body as { error: string }).error).toBe(REVIEW_LOGIN_FAILED);
        },
    );

    it.each([
        { verification: { status: 'pending', plan: 'basic' } },
        { verification: { status: 'rejected', plan: 'basic' } },
        { isTestAccount: false },
        { accountStatus: 'suspended' },
    ])('rejects non-approved/visible/inactive breeders (%j)', async (overrides) => {
        await create('breeder', overrides);
        expect(((await login().expect(401)).body as { error: string }).error).toBe(REVIEW_LOGIN_FAILED);
    });

    it.each([
        'unknown',
        'wrong-password',
        'disabled',
        'missing-account',
        'social-account',
        'role-mismatch',
        'email-mismatch',
    ])('returns the same failure for %s', async (mode) => {
        const account = await create();
        if (mode === 'disabled') await credentials.updateOne({}, { enabled: false });
        if (mode === 'missing-account') await adopters.deleteMany({});
        if (mode === 'social-account')
            await adopters.updateOne({ _id: account._id }, { 'socialAuthInfo.authProvider': 'google' });
        if (mode === 'role-mismatch') await adopters.updateOne({ _id: account._id }, { userRole: 'admin' });
        if (mode === 'email-mismatch')
            await adopters.updateOne({ _id: account._id }, { emailAddress: 'other@example.test' });
        const response = await login({
            emailAddress: mode === 'unknown' ? 'unknown@example.test' : email,
            password: mode === 'wrong-password' ? 'wrong' : password,
        }).expect(401);
        expect((response.body as { error: string }).error).toBe(REVIEW_LOGIN_FAILED);
        expect(JSON.stringify(response.body)).not.toContain(password);
    });

    it('never accepts an ordinary account passwordHash without dedicated credentials', async () => {
        await adopters.create({
            emailAddress: email,
            nickname: 'ordinary',
            userRole: 'adopter',
            accountStatus: 'active',
            passwordHash: hash,
        });
        await login().expect(401);
    });

    it('rejects request role/id injection and malformed credential types at the DTO boundary', async () => {
        await create();
        for (const body of [
            { emailAddress: email, password, role: 'admin' },
            { emailAddress: { $ne: null }, password },
            { emailAddress: email, password: { $ne: null } },
            { emailAddress: email, password: 'a'.repeat(73) },
        ]) {
            await login(body).expect(400);
        }
        expect(limit.allow).not.toHaveBeenCalled();
    });

    it('does not return issued tokens when the account becomes suspended before session persistence', async () => {
        const account = await create();
        const original = new ReviewAccountRepository(credentials, adopters, breeders);
        const spy = jest.spyOn(repository, 'saveSession').mockImplementationOnce(async (credential, refresh) => {
            await adopters.updateOne({ _id: account._id }, { accountStatus: 'suspended' });
            return original.saveSession(credential, refresh);
        });
        try {
            await login().expect(401);
            expect((await adopters.findById(account._id))!.refreshToken).toBeUndefined();
        } finally {
            spy.mockRestore();
        }
    });

    it('denies rate-limited and unavailable shared storage without authenticating', async () => {
        await create();
        limit.allow.mockResolvedValueOnce(false);
        await login().expect(429);
        limit.allow.mockRejectedValueOnce(
            new ServiceUnavailableException('로그인을 잠시 사용할 수 없습니다. 다시 시도해 주세요.'),
        );
        await login().expect(503);
        expect((await adopters.findOne({ emailAddress: email }))!.refreshToken).toBeUndefined();
    });

    it('excludes credential hash from default reads and document serialization', async () => {
        await create();
        expect((await credentials.findOne({}).lean())!.passwordHash).toBeUndefined();
        const selected = await credentials.findOne({}).select('+passwordHash');
        expect(selected!.passwordHash).toBe(hash);
        expect(selected!.toJSON().passwordHash).toBeUndefined();
        expect(selected!.toObject().passwordHash).toBeUndefined();
    });
});
