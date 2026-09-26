import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { CommunityPost, CommunityPostDocument } from '../../../../schema/community-post.schema';
import type {
    CommunityHallOfFameCandidate,
    CommunityHallOfFamePostReaderPort,
} from '../application/ports/community-hall-of-fame-post-reader.port';

@Injectable()
export class CommunityHallOfFamePostReaderMongooseAdapter implements CommunityHallOfFamePostReaderPort {
    constructor(@InjectModel(CommunityPost.name) private readonly postModel: Model<CommunityPostDocument>) {}

    async findTopPosts(startDate: Date, endDate: Date, limit: number): Promise<CommunityHallOfFameCandidate[]> {
        const filter: FilterQuery<CommunityPostDocument> = {
            createdAt: { $gte: startDate, $lt: endDate },
            isActive: true,
            // 커뮤니티 목록(community.repository)과 같은 기준을 써야 한다.
            // 'published' 로 못 박으면 status 가 없는 마이그레이션 전 레거시 글이 빠져
            // 목록엔 보이는데 명예의 전당엔 안 뜨는 글이 생긴다.
            status: { $ne: 'draft' },
            // visibility 도 같은 이유로 'public' 을 못 박지 않는다.
            // 레거시 글에는 visibility 필드 자체가 없어 'public' 으로 좁히면 통째로 빠진다.
            // community.repository 의 열람 범위 필터와 같은 기준($nin)을 쓴다.
            visibility: { $nin: ['followers', 'private'] },
        };

        const docs = await this.postModel
            .find(filter)
            // 좋아요 우선. 가중합이 아니라 동점일 때만 다음 기준으로 넘어간다.
            .sort({ likeCount: -1, commentCount: -1, saveCount: -1, createdAt: 1 })
            .limit(limit)
            .lean<CommunityPostDocument[]>()
            .exec();

        return docs.map((doc) => ({
            postId: doc._id.toString(),
            likeCount: doc.likeCount ?? 0,
            commentCount: doc.commentCount ?? 0,
            saveCount: doc.saveCount ?? 0,
            photos: doc.photos ?? [],
            body: doc.body ?? '',
            authorId: doc.authorId.toString(),
            authorModel: doc.authorModel,
            authorNickname: doc.authorNickname,
            authorProfileImageFileName: doc.authorProfileImageFileName ?? null,
        }));
    }
}
