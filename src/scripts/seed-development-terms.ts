import 'reflect-metadata';

import { connect, disconnect, model } from 'mongoose';

import { DEVELOPMENT_TERMS } from '../common/data/terms.data';
import { Terms, TermsSchema } from '../schema/terms.schema';

const SEED_CONFIRMATION_VARIABLE = 'PAWPONG_ALLOW_DEV_TERMS_SEED';

async function seedDevelopmentTerms(): Promise<void> {
    if (process.env[SEED_CONFIRMATION_VARIABLE] !== 'true') {
        throw new Error(`${SEED_CONFIRMATION_VARIABLE}=true 를 명시해야 개발용 약관 시더를 실행할 수 있습니다.`);
    }

    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
        throw new Error('MONGODB_URI가 설정되지 않았습니다.');
    }

    await connect(mongodbUri);

    try {
        const termsModel = model<Terms>(Terms.name, TermsSchema);
        const activatedAt = new Date();

        for (const item of DEVELOPMENT_TERMS) {
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

        console.log(`개발용 활성 약관 ${DEVELOPMENT_TERMS.length}건을 시딩했습니다.`);
    } finally {
        await disconnect();
    }
}

void seedDevelopmentTerms().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
