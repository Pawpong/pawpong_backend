import 'reflect-metadata';

import { connect, disconnect, model } from 'mongoose';

import { PUBLISHED_TERMS } from '../common/data/published-terms.data';
import { Terms, TermsSchema } from '../schema/terms.schema';

const SEED_CONFIRMATION_VARIABLE = 'PAWPONG_ALLOW_TERMS_SEED';

/**
 * 실제 서비스 약관을 MONGODB_URI 가 가리키는 DB에 발행한다.
 * 개발용 더미 약관(seed-development-terms.ts)과 달리, 프론트 온보딩에 이미 승인되어
 * 노출 중인 전문(published-terms.data.ts)을 그대로 심는다 — 어느 DB에 심을지는
 * 실행 시점의 MONGODB_URI 로 결정되므로, 운영 DB에 실행할 때는 반드시 운영
 * MONGODB_URI 인지 재확인한다.
 */
async function seedPublishedTerms(): Promise<void> {
    if (process.env[SEED_CONFIRMATION_VARIABLE] !== 'true') {
        throw new Error(`${SEED_CONFIRMATION_VARIABLE}=true 를 명시해야 약관 시더를 실행할 수 있습니다.`);
    }

    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
        throw new Error('MONGODB_URI가 설정되지 않았습니다.');
    }

    await connect(mongodbUri);

    try {
        const termsModel = model<Terms>(Terms.name, TermsSchema);
        const activatedAt = new Date();

        for (const item of PUBLISHED_TERMS) {
            await termsModel.updateMany({ code: item.code, isActive: true }, { $set: { isActive: false } }).exec();
            await termsModel
                .updateOne(
                    { code: item.code, version: item.version },
                    {
                        $set: {
                            title: item.title,
                            body: item.body,
                            isRequired: item.isRequired,
                            isActive: true,
                            activatedAt,
                        },
                    },
                    { upsert: true },
                )
                .exec();
        }

        console.log(`약관 ${PUBLISHED_TERMS.length}건을 발행했습니다. (MONGODB_URI: ${mongodbUri})`);
    } finally {
        await disconnect();
    }
}

void seedPublishedTerms().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
