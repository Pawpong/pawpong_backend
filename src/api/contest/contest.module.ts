import { Module } from '@nestjs/common';

import { CONTEST_MODULE_CONTROLLERS, CONTEST_MODULE_IMPORTS, CONTEST_MODULE_PROVIDERS } from './contest.module-definition';

/**
 * 명예의 전당 / 콘테스트 모듈 (v2)
 * /v2/contest 라우트 — 주간 사진 콘테스트 참여·투표·랭킹·명예의 전당 조회
 */
@Module({
    imports: CONTEST_MODULE_IMPORTS,
    controllers: CONTEST_MODULE_CONTROLLERS,
    providers: CONTEST_MODULE_PROVIDERS,
})
export class ContestModule {}
