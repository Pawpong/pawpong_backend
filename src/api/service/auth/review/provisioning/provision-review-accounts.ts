import { type Connection, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { isEmail } from 'class-validator';
import { Adopter, AdopterSchema } from '../../../../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../../../../schema/breeder.schema';
import { ReviewCredential, ReviewCredentialSchema } from '../../../../../schema/review-credential.schema';
import { Terms, TermsSchema } from '../../../../../schema/terms.schema';

export type ReviewProvisionAccount = { emailAddress: string; password: string; nickname: string };
export type ReviewProvisionInput = {
    operator: string;
    acceptTerms: true;
    adopter: ReviewProvisionAccount;
    breeder: ReviewProvisionAccount;
};

function object(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid provision input');
    return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, keys: string[]) {
    if (Object.keys(value).length !== keys.length || Object.keys(value).some((key) => !keys.includes(key))) {
        throw new Error('Unexpected provision fields');
    }
}

/** 운영자가 보호된 입력으로 준 두 계정만 허용하며 ID/role/status/hash 주입을 금지한다. */
export function parseReviewProvisionInput(input: unknown): ReviewProvisionInput {
    const value = object(input);
    exactKeys(value, ['operator', 'acceptTerms', 'adopter', 'breeder']);
    if (
        typeof value.operator !== 'string' ||
        !value.operator.trim() ||
        value.operator.length > 128 ||
        value.acceptTerms !== true
    ) {
        throw new Error('Operator and explicit terms acceptance are required');
    }
    const account = (raw: unknown): ReviewProvisionAccount => {
        const record = object(raw);
        exactKeys(record, ['emailAddress', 'password', 'nickname']);
        if (
            typeof record.emailAddress !== 'string' ||
            typeof record.password !== 'string' ||
            typeof record.nickname !== 'string'
        ) {
            throw new Error('Invalid account input');
        }
        const emailAddress = record.emailAddress.trim().toLowerCase();
        const nickname = record.nickname.trim();
        if (!isEmail(emailAddress) || emailAddress.length > 254 || nickname.length < 2 || nickname.length > 30) {
            throw new Error('Invalid account identity');
        }
        if (
            record.password.length < 20 ||
            Buffer.byteLength(record.password, 'utf8') > 72 ||
            /\s/.test(record.password)
        ) {
            throw new Error('Use a unique random password between 20 and 72 UTF-8 bytes');
        }
        return { emailAddress, nickname, password: record.password };
    };
    const adopter = account(value.adopter);
    const breeder = account(value.breeder);
    if (
        adopter.emailAddress === breeder.emailAddress ||
        adopter.nickname === breeder.nickname ||
        adopter.password === breeder.password
    ) {
        throw new Error('The two accounts must have distinct identities and passwords');
    }
    return { operator: value.operator.trim(), acceptTerms: true, adopter, breeder };
}

/** 신규 일반 계정 두 개와 전용 자격 증명만 같은 트랜잭션으로 생성한다. 기존 계정은 절대 갱신하지 않는다. */
export async function provisionReviewAccounts(connection: Connection, input: ReviewProvisionInput) {
    // 함수 직접 호출도 CLI와 동일한 검증 경계를 통과해야 한다.
    const checked = parseReviewProvisionInput(input);
    const adopters = connection.model(Adopter.name, AdopterSchema);
    const breeders = connection.model(Breeder.name, BreederSchema);
    const credentials = connection.model(ReviewCredential.name, ReviewCredentialSchema);
    const terms = connection.model(Terms.name, TermsSchema);
    await credentials.createCollection();
    await credentials.createIndexes();
    const passwordHashes = await Promise.all(
        [checked.adopter, checked.breeder].map((value) => bcrypt.hash(value.password, 12)),
    );
    const ids = { adopter: new Types.ObjectId(), breeder: new Types.ObjectId() };
    const session = await connection.startSession();
    try {
        await session.withTransaction(async () => {
            const identityCollision = {
                $or: [
                    { emailAddress: { $in: [checked.adopter.emailAddress, checked.breeder.emailAddress] } },
                    { nickname: { $in: [checked.adopter.nickname, checked.breeder.nickname] } },
                ],
            };
            if (
                (await credentials.exists({}).session(session)) ||
                (await adopters.exists(identityCollision).session(session)) ||
                (await breeders.exists(identityCollision).session(session))
            )
                throw new Error('Provisioning refused: existing identity or review credentials');

            const activeTerms = await terms.find({ isActive: true, isRequired: true }).session(session).lean().exec();
            if (!['service', 'privacy', 'age_14plus'].every((code) => activeTerms.some((term) => term.code === code))) {
                throw new Error('Provisioning refused: required active terms are incomplete');
            }
            const now = new Date();
            const base = (role: 'adopter' | 'breeder') => ({
                _id: ids[role],
                emailAddress: checked[role].emailAddress,
                nickname: checked[role].nickname,
                userRole: role,
                accountStatus: 'active',
                socialAuthInfo: { authProvider: 'local' },
                termsAgreed: true,
                privacyAgreed: true,
                marketingAgreed: false,
                lastLoginAt: now,
                lastActivityAt: now,
                profileImageFileName: '',
                bio: '포퐁 앱 기능 확인을 위한 테스트 계정입니다.',
            });
            await adopters.create(
                [
                    {
                        ...base('adopter'),
                        realName: '포퐁 테스트 입양자',
                        termsAgreementHistory: activeTerms.map((term) => ({
                            code: term.code,
                            version: term.version,
                            agreedAt: now,
                        })),
                    },
                ],
                { session },
            );
            await breeders.create(
                [
                    {
                        ...base('breeder'),
                        name: checked.breeder.nickname,
                        petType: 'dog',
                        breeds: [],
                        verification: {
                            status: 'approved',
                            plan: 'basic',
                            documents: [],
                            submittedAt: now,
                            reviewedAt: now,
                        },
                        profile: {
                            description: '포퐁 앱 심사용 테스트 브리더입니다. 실제 분양을 진행하지 않습니다.',
                            specialization: ['dog'],
                            location: { city: '', district: '' },
                        },
                        isTestAccount: true,
                        consultationAgreed: false,
                    },
                ],
                { session },
            );
            await credentials.create(
                (['adopter', 'breeder'] as const).map((role, index) => ({
                    emailAddress: checked[role].emailAddress,
                    accountId: ids[role],
                    role,
                    passwordHash: passwordHashes[index],
                    enabled: true,
                    provisionedBy: checked.operator,
                })),
                { session, ordered: true },
            );
        });
        return { created: 2, accountIds: { adopter: String(ids.adopter), breeder: String(ids.breeder) } };
    } finally {
        await session.endSession();
    }
}
