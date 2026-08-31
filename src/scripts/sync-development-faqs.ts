import 'reflect-metadata';

import { connect, disconnect, model, type Types } from 'mongoose';

import { faqData } from '../common/data/faq.data';
import { Faq, FaqSchema } from '../schema/faq.schema';

const FAQ_SYNC_CONFIRMATION_VARIABLE = 'PAWPONG_ALLOW_DEV_FAQ_SYNC';

async function syncDevelopmentFaqs(): Promise<void> {
    if (process.env[FAQ_SYNC_CONFIRMATION_VARIABLE] !== 'true') {
        throw new Error(`${FAQ_SYNC_CONFIRMATION_VARIABLE}=true 를 명시해야 개발 FAQ 동기화를 실행할 수 있습니다.`);
    }

    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
        throw new Error('MONGODB_URI가 설정되지 않았습니다.');
    }

    await connect(mongodbUri);

    try {
        const faqModel = model<Faq>(Faq.name, FaqSchema);
        const activeIds: Types.ObjectId[] = [];

        for (const item of faqData) {
            const synced = await faqModel
                .findOneAndUpdate(
                    { question: item.question, userType: item.userType },
                    { $set: item },
                    { upsert: true, new: true, setDefaultsOnInsert: true },
                )
                .exec();

            activeIds.push(synced._id);
        }

        const deactivated = await faqModel
            .updateMany({ _id: { $nin: activeIds }, isActive: { $ne: false } }, { $set: { isActive: false } })
            .exec();

        const adopterCount = faqData.filter((faq) => faq.userType === 'adopter').length;
        const breederCount = faqData.filter((faq) => faq.userType === 'breeder').length;
        console.log(
            `개발 FAQ ${faqData.length}건을 동기화했습니다. (입양자 ${adopterCount}, 브리더 ${breederCount}, 기존 비활성화 ${deactivated.modifiedCount})`,
        );
    } finally {
        await disconnect();
    }
}

void syncDevelopmentFaqs().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
