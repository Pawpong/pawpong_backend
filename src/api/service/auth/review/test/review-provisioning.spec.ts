import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose, { type Connection } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Adopter, AdopterSchema } from '../../../../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../../../../schema/breeder.schema';
import { ReviewCredential, ReviewCredentialSchema } from '../../../../../schema/review-credential.schema';
import { Terms, TermsSchema } from '../../../../../schema/terms.schema';
import {
    parseReviewProvisionInput,
    provisionReviewAccounts,
    type ReviewProvisionInput,
} from '../provisioning/provision-review-accounts';

const input: ReviewProvisionInput = {
    operator: 'synthetic-test-operator',
    acceptTerms: true,
    adopter: {
        emailAddress: 'adopter@example.test',
        password: 'synthetic-adopter-credential-1234',
        nickname: '테스트 입양자',
    },
    breeder: {
        emailAddress: 'breeder@example.test',
        password: 'synthetic-breeder-credential-5678',
        nickname: '테스트 브리더',
    },
};

describe('review provisioning input and protected CLI', () => {
    it.each([
        { ...input, role: 'admin' },
        { ...input, acceptTerms: false },
        { ...input, adopter: { ...input.adopter, accountId: 'existing-id' } },
        { ...input, adopter: { ...input.adopter, password: 'short' } },
        { ...input, adopter: { ...input.adopter, password: '가'.repeat(25) } },
        { ...input, breeder: { ...input.breeder, password: input.adopter.password } },
        { ...input, breeder: { ...input.breeder, emailAddress: input.adopter.emailAddress.toUpperCase() } },
    ])('refuses identity injection, implicit consent and weak/ambiguous credentials', (value) => {
        expect(() => parseReviewProvisionInput(value)).toThrow();
    });

    it('dry-run defaults to no database access and never prints credentials', () => {
        const result = spawnSync(
            process.execPath,
            ['-r', 'ts-node/register/transpile-only', 'src/scripts/provision-review-accounts.ts'],
            {
                cwd: path.resolve(__dirname, '../../../../../..'),
                input: JSON.stringify(input),
                encoding: 'utf8',
                env: { ...process.env, MONGODB_URI: 'invalid-uri-must-never-be-opened' },
                timeout: 15000,
            },
        );
        expect(result.status).toBe(0);
        expect(JSON.parse(result.stdout)).toMatchObject({ dryRun: true, databaseAccessed: false, wouldCreate: 2 });
        for (const value of [
            input.adopter.password,
            input.breeder.password,
            input.adopter.emailAddress,
            input.breeder.emailAddress,
        ]) {
            expect(result.stdout + result.stderr).not.toContain(value);
        }
    });

    it('rejects a readable credential file and accepts only owner 0600', () => {
        const directory = mkdtempSync(path.join(tmpdir(), 'pawpong-review-cli-test-'));
        const file = path.join(directory, 'input.json');
        try {
            writeFileSync(file, JSON.stringify(input), { mode: 0o644 });
            const run = () =>
                spawnSync(
                    process.execPath,
                    [
                        '-r',
                        'ts-node/register/transpile-only',
                        'src/scripts/provision-review-accounts.ts',
                        '--input-file',
                        file,
                    ],
                    {
                        cwd: path.resolve(__dirname, '../../../../../..'),
                        encoding: 'utf8',
                        timeout: 15000,
                    },
                );
            expect(run().status).toBe(1);
            chmodSync(file, 0o600);
            const result = run();
            expect(result.status).toBe(0);
            expect(result.stdout + result.stderr).not.toContain(input.adopter.password);
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    });
});

describe('review provisioning transaction (isolated replica set)', () => {
    let mongo: MongoMemoryReplSet;
    let connection: Connection;
    beforeAll(async () => {
        mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
        connection = await mongoose.createConnection(mongo.getUri()).asPromise();
        await connection.model(Adopter.name, AdopterSchema).init();
        await connection.model(Breeder.name, BreederSchema).init();
        await connection.model(ReviewCredential.name, ReviewCredentialSchema).init();
        await connection.model(Terms.name, TermsSchema).init();
    }, 60000);
    beforeEach(async () => {
        for (const model of Object.values(connection.models)) await model.deleteMany({});
        await connection.model(Terms.name).create(
            ['service', 'privacy', 'age_14plus'].map((code) => ({
                code,
                version: 'test-v1',
                title: code,
                body: 'synthetic terms',
                isActive: true,
                isRequired: true,
            })),
        );
    });
    afterAll(async () => {
        await connection?.close();
        await mongo?.stop();
    });

    it('creates exactly two ordinary accounts, an approved hidden breeder and separate password hashes', async () => {
        const result = await provisionReviewAccounts(connection, input);
        expect(result.created).toBe(2);
        const adopter = await connection.model(Adopter.name).findById(result.accountIds.adopter).lean();
        const breeder = await connection.model(Breeder.name).findById(result.accountIds.breeder).lean();
        expect(adopter).toMatchObject({
            userRole: 'adopter',
            accountStatus: 'active',
            socialAuthInfo: { authProvider: 'local' },
        });
        expect(breeder).toMatchObject({
            userRole: 'breeder',
            accountStatus: 'active',
            isTestAccount: true,
            consultationAgreed: false,
            verification: { status: 'approved', plan: 'basic' },
        });
        expect(adopter).not.toHaveProperty('passwordHash');
        expect(breeder).not.toHaveProperty('passwordHash');
        const stored = await connection.model(ReviewCredential.name).find({}).select('+passwordHash').lean();
        expect(stored).toHaveLength(2);
        for (const credential of stored) {
            const role = credential.role as 'adopter' | 'breeder';
            expect(await bcrypt.compare(input[role].password, credential.passwordHash as string)).toBe(true);
            expect(credential.provisionedBy).toBe(input.operator);
        }
        await expect(provisionReviewAccounts(connection, input)).rejects.toThrow('existing identity');
        expect(await connection.model(Adopter.name).countDocuments()).toBe(1);
        expect(await connection.model(Breeder.name).countDocuments()).toBe(1);
    });

    it('refuses collisions with ordinary users without changing any account', async () => {
        await connection.model(Adopter.name).create({
            emailAddress: input.breeder.emailAddress,
            nickname: '기존 사용자',
            userRole: 'adopter',
            refreshToken: 'existing-hash',
        });
        await expect(provisionReviewAccounts(connection, input)).rejects.toThrow('existing identity');
        expect(await connection.model(Breeder.name).countDocuments()).toBe(0);
        expect(await connection.model(ReviewCredential.name).countDocuments()).toBe(0);
        expect(await connection.model(Adopter.name).findOne({}).lean()).toMatchObject({
            refreshToken: 'existing-hash',
        });
    });

    it('rolls back both new accounts when credential insertion fails', async () => {
        const spy = jest
            .spyOn(connection.model(ReviewCredential.name), 'create')
            .mockRejectedValueOnce(new Error('synthetic insert failure'));
        try {
            await expect(provisionReviewAccounts(connection, input)).rejects.toThrow('synthetic insert failure');
            expect(await connection.model(Adopter.name).countDocuments()).toBe(0);
            expect(await connection.model(Breeder.name).countDocuments()).toBe(0);
            expect(await connection.model(ReviewCredential.name).countDocuments()).toBe(0);
        } finally {
            spy.mockRestore();
        }
    });

    it('requires current mandatory terms before provisioning', async () => {
        await connection.model(Terms.name).deleteMany({ code: 'privacy' });
        await expect(provisionReviewAccounts(connection, input)).rejects.toThrow('active terms');
        expect(await connection.model(Adopter.name).countDocuments()).toBe(0);
        expect(await connection.model(Breeder.name).countDocuments()).toBe(0);
    });
});
