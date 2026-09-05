import { Module } from '@nestjs/common';
import { COMMUNITY_MODULE_IMPORTS } from './community.module-definition';

/**
 * 커뮤니티 바운디드 컨텍스트
 * - 하위 기능 슬라이스(shared/posts/comments/interactions/author-sync/admin) 조립만 담당
 * - 컨트롤러·프로바이더는 각 슬라이스 모듈이 소유한다
 */
@Module({
    imports: COMMUNITY_MODULE_IMPORTS,
})
export class CommunityModule {}
