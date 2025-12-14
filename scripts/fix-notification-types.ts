import mongoose from 'mongoose';

/**
 * 알림 타입을 대문자에서 소문자로 마이그레이션하는 스크립트
 *
 * 실행 방법:
 * npx ts-node scripts/fix-notification-types.ts
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pawpong';

const TYPE_MAPPINGS: Record<string, string> = {
    'BREEDER_APPROVED': 'breeder_approved',
    'BREEDER_UNAPPROVED': 'breeder_unapproved',
    'BREEDER_ONBOARDING_INCOMPLETE': 'breeder_onboarding_incomplete',
    'NEW_CONSULT_REQUEST': 'new_consult_request',
    'CONSULT_REQUEST_CONFIRMED': 'consult_request_confirmed',
    'NEW_REVIEW_REGISTERED': 'new_review_registered',
    'CONSULT_COMPLETED': 'consult_completed',
    'NEW_PET_REGISTERED': 'new_pet_registered',
    'DOCUMENT_REMINDER': 'document_reminder',
};

async function fixNotificationTypes() {
    try {
        // MongoDB 연결
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB 연결 성공');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }
        const collection = db.collection('notifications');

        // 대문자 타입을 가진 모든 알림 찾기
        const upperCaseTypes = Object.keys(TYPE_MAPPINGS);
        const notificationsToFix = await collection.find({
            type: { $in: upperCaseTypes }
        }).toArray();

        console.log(`📊 수정할 알림 개수: ${notificationsToFix.length}`);

        if (notificationsToFix.length === 0) {
            console.log('✅ 수정할 알림이 없습니다.');
            return;
        }

        // 각 타입별로 업데이트
        let totalUpdated = 0;
        for (const [oldType, newType] of Object.entries(TYPE_MAPPINGS)) {
            const result = await collection.updateMany(
                { type: oldType },
                { $set: { type: newType } }
            );

            if (result.modifiedCount > 0) {
                console.log(`✅ ${oldType} → ${newType}: ${result.modifiedCount}개 업데이트됨`);
                totalUpdated += result.modifiedCount;
            }
        }

        console.log(`\n✅ 총 ${totalUpdated}개의 알림 타입이 업데이트되었습니다.`);

    } catch (error) {
        console.error('❌ 에러 발생:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('✅ MongoDB 연결 종료');
    }
}

fixNotificationTypes()
    .then(() => {
        console.log('\n✅ 마이그레이션 완료');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ 마이그레이션 실패:', error);
        process.exit(1);
    });
