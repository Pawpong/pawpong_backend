import { Inject, Injectable } from '@nestjs/common';

import { COMMUNITY_ASSET_URL_PORT, type CommunityAssetUrlPort } from '../../application/ports/community-asset-url.port';
import type { CommunityHallOfFameCandidate } from '../../application/ports/community-hall-of-fame-post-reader.port';
import type {
    CommunityHallOfFameSnapshot,
    CommunityHallOfFameWinnerSnapshot,
} from '../../application/ports/community-hall-of-fame.port';
import type { CommunityHallOfFameResult } from '../../application/types/community-hall-of-fame-result.type';

const BODY_EXCERPT_LENGTH = 120;

@Injectable()
export class CommunityHallOfFameMapperService {
    constructor(@Inject(COMMUNITY_ASSET_URL_PORT) private readonly assetUrl: CommunityAssetUrlPort) {}

    /**
     * 집계 후보를 저장용 스냅샷으로 바꾼다.
     * 표시에 쓰는 값을 복사해 두어 원본 글이 지워지거나 작성자가 탈퇴해도 회차 기록이 남는다.
     */
    toWinnerSnapshots(candidates: CommunityHallOfFameCandidate[]): CommunityHallOfFameWinnerSnapshot[] {
        return candidates.map((candidate, position) => ({
            rank: position + 1,
            postId: candidate.postId,
            likeCount: candidate.likeCount,
            commentCount: candidate.commentCount,
            saveCount: candidate.saveCount,
            photoFileName: candidate.photos[0] ?? null,
            bodyExcerpt: this.excerpt(candidate.body),
            authorId: candidate.authorId,
            authorModel: candidate.authorModel,
            authorNickname: candidate.authorNickname,
            authorProfileImageFileName: candidate.authorProfileImageFileName,
        }));
    }

    toResult(snapshot: CommunityHallOfFameSnapshot): CommunityHallOfFameResult {
        return {
            periodKey: snapshot.periodKey,
            startDate: snapshot.startDate.toISOString(),
            endDate: snapshot.endDate.toISOString(),
            state: snapshot.state,
            refreshedAt: snapshot.refreshedAt.toISOString(),
            winners: snapshot.winners.map((winner) => ({
                rank: winner.rank,
                postId: winner.postId,
                likeCount: winner.likeCount,
                commentCount: winner.commentCount,
                saveCount: winner.saveCount,
                photoUrl: this.assetUrl.toSignedUrl(winner.photoFileName) ?? null,
                bodyExcerpt: winner.bodyExcerpt,
                author: {
                    userId: winner.authorId,
                    authorModel: winner.authorModel,
                    nickname: winner.authorNickname,
                    profileImageUrl: this.assetUrl.toSignedUrl(winner.authorProfileImageFileName) ?? null,
                },
            })),
        };
    }

    /** 아직 집계되지 않은 회차도 빈 회차로 응답해 프론트가 분기하지 않게 한다. */
    toEmptyResult(period: { periodKey: string; startDate: Date; endDate: Date }): CommunityHallOfFameResult {
        return {
            periodKey: period.periodKey,
            startDate: period.startDate.toISOString(),
            endDate: period.endDate.toISOString(),
            state: 'open',
            refreshedAt: new Date(0).toISOString(),
            winners: [],
        };
    }

    private excerpt(body: string): string {
        const normalized = body.replace(/\s+/g, ' ').trim();
        return normalized.length > BODY_EXCERPT_LENGTH ? `${normalized.slice(0, BODY_EXCERPT_LENGTH)}...` : normalized;
    }
}
