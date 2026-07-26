import { CommunitySharedModule } from '../shared/community-shared.module';
import { CommunityAuthorSyncListener } from '../application/listeners/community-author-sync.listener';
import { CommunityAuthorSnapshotMongooseAdapter } from '../infrastructure/community-author-snapshot-mongoose.adapter';
import { COMMUNITY_AUTHOR_SNAPSHOT_PORT } from '../application/ports/community-author-snapshot.port';

// 커뮤니티 > 작성자 스냅샷 동기화 슬라이스
// 프로필(닉네임·이미지) 변경 이벤트를 받아 게시글/댓글에 박제된 작성자 정보를 갱신한다.
export const COMMUNITY_AUTHOR_SYNC_MODULE_IMPORTS = [CommunitySharedModule];

export const COMMUNITY_AUTHOR_SYNC_MODULE_PROVIDERS = [
    CommunityAuthorSyncListener,
    CommunityAuthorSnapshotMongooseAdapter,
    { provide: COMMUNITY_AUTHOR_SNAPSHOT_PORT, useExisting: CommunityAuthorSnapshotMongooseAdapter },
];
