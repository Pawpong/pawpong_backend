/**
 * 탈퇴 계정 복구(reactivation) 성공 경로를 프론트에서 검증하기 위한 테스트 픽스처 스크립트.
 *
 * 실행:
 *   pnpm token:reactivation            # 테스트용 탈퇴 계정 생성 + 복구 토큰/URL 출력
 *   pnpm token:reactivation --cleanup  # 이 스크립트가 만든 테스트 계정 전부 삭제
 *
 * 주의: MONGODB_URI 가 가리키는 DB(현재 공유 dev 클러스터)에 테스트 계정을 1건 생성한다.
 *       실제 사용자 데이터는 건드리지 않으며, --cleanup 으로 완전히 되돌릴 수 있다.
 */
import { connect, connection, Schema } from 'mongoose';
import * as jwt from 'jsonwebtoken';

/** 이 스크립트가 만든 픽스처만 식별하기 위한 접두사 */
const FIXTURE_EMAIL_PREFIX = 'reactivation-test+';
const FIXTURE_EMAIL_DOMAIN = '@pawpong.test';
const FIXTURE_NICKNAME_PREFIX = '복구테스트';
const REACTIVATION_TOKEN_EXPIRES_IN_SECONDS = 600;
const FRONTEND_BASE_URL = process.env.FRONTEND_URL_LOCAL || 'http://localhost:3000';

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`${key} 환경변수가 필요합니다. (node --env-file=.env 로 실행했는지 확인)`);
    }
    return value;
}

async function main() {
    const isCleanup = process.argv.includes('--cleanup');

    await connect(requireEnv('MONGODB_URI'));
    // 스키마 검증을 우회해 픽스처만 다루기 위해 strict:false 로 최소 모델을 만든다.
    const adopterModel = connection.model('AdopterFixture', new Schema({}, { strict: false }), 'adopters');

    const fixtureFilter = { emailAddress: { $regex: `^${FIXTURE_EMAIL_PREFIX.replace('+', '\\+')}` } };

    if (isCleanup) {
        const { deletedCount } = await adopterModel.deleteMany(fixtureFilter).exec();
        console.log(`\n테스트 계정 ${deletedCount}건을 삭제했습니다.\n`);
        await connection.close();
        return;
    }

    const stamp = Date.now();
    const deletedAt = new Date();
    const providerUserId = `reactivation-test-${stamp}`;

    const created = await adopterModel.create({
        emailAddress: `${FIXTURE_EMAIL_PREFIX}${stamp}${FIXTURE_EMAIL_DOMAIN}`,
        nickname: `${FIXTURE_NICKNAME_PREFIX}${stamp}`.slice(0, 20),
        userRole: 'adopter',
        // 복구 대상이 되려면 탈퇴 상태여야 한다 (assertReactivatable)
        accountStatus: 'deleted',
        deletedAt,
        deleteReason: 'other',
        deleteReasonDetail: '복구 플로우 테스트용 계정',
        socialAuthInfo: {
            authProvider: 'kakao',
            providerUserId,
            providerEmail: `${FIXTURE_EMAIL_PREFIX}${stamp}${FIXTURE_EMAIL_DOMAIN}`,
        },
        termsAgreed: true,
        privacyAgreed: true,
        marketingAgreed: false,
        favoriteBreederList: [],
        submittedReportList: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const userId = String(created._id);

    // AuthJwtTokenAdapter.generateReactivationToken 과 동일한 페이로드로 서명한다.
    const reactivationToken = jwt.sign(
        { sub: userId, role: 'adopter', type: 'reactivation' },
        requireEnv('JWT_SECRET'),
        {
            expiresIn: REACTIVATION_TOKEN_EXPIRES_IN_SECONDS,
        },
    );

    const params = new URLSearchParams({
        type: 'deleted_account',
        message: '탈퇴한 계정입니다. 복구 후 이용하시겠습니까?',
        reactivationToken,
        expiresIn: String(REACTIVATION_TOKEN_EXPIRES_IN_SECONDS),
        role: 'adopter',
        email: String(created.get('emailAddress')),
        name: String(created.get('nickname')),
        deletedAt: deletedAt.toISOString(),
    });

    console.log('\n=== 복구 테스트 계정 생성 완료 ===');
    console.log(`userId       : ${userId}`);
    console.log(`email        : ${String(created.get('emailAddress'))}`);
    console.log(`nickname     : ${String(created.get('nickname'))}`);
    console.log(`유효시간     : ${REACTIVATION_TOKEN_EXPIRES_IN_SECONDS}초 (10분)`);
    console.log('\n--- reactivationToken ---');
    console.log(reactivationToken);
    console.log('\n--- 프론트 테스트 URL ---');
    console.log(`${FRONTEND_BASE_URL}/login?${params.toString()}`);
    console.log('\n--- 정리 ---');
    console.log('pnpm token:reactivation --cleanup\n');

    await connection.close();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
