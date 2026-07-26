import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';

import { CommunityPost, CommunityPostDocument } from '../../../../schema/community-post.schema';
import { CommunityPostComment, CommunityPostCommentDocument } from '../../../../schema/community-post-comment.schema';
import type { CommunityPostCommentListQuery, CommunityPostListQuery } from '../application/types/community-post.type';
import type {
    CommunityPostCreatePersistData,
    CommunityPostUpdateCommand,
} from '../application/types/community-post-write.type';

/**
 * v2 커뮤니티 — Mongoose 직접 접근 캡슐화.
 * adapter 는 본 repository 만 사용한다.
 */
@Injectable()
export class CommunityRepository {
    constructor(
        @InjectModel(CommunityPost.name)
        private readonly postModel: Model<CommunityPostDocument>,
        @InjectModel(CommunityPostComment.name)
        private readonly commentModel: Model<CommunityPostCommentDocument>,
    ) {}

    async listPosts(query: CommunityPostListQuery): Promise<{ docs: CommunityPostDocument[]; totalItems: number }> {
        const filter: FilterQuery<CommunityPost> = { isActive: true };
        if (query.petType) filter.petType = query.petType;
        if (query.category && query.category.trim().length > 0) filter.category = query.category.trim();
        if (query.authorId && Types.ObjectId.isValid(query.authorId)) {
            filter.authorId = new Types.ObjectId(query.authorId);
        }

        const status = query.status ?? 'published';

        if (status === 'draft') {
            // 임시저장은 오직 작성자 본인만 조회할 수 있다. viewer 가 없으면 결과 없음.
            if (!query.viewerId || !Types.ObjectId.isValid(query.viewerId)) {
                return { docs: [], totalItems: 0 };
            }
            filter.status = 'draft';
            filter.authorId = new Types.ObjectId(query.viewerId);
        } else {
            // published 피드: status 미기재(마이그레이션 전) 레거시 글도 발행 글로 취급하기 위해 draft 만 제외.
            filter.status = { $ne: 'draft' };
            this.applyVisibilityFilter(filter, query);
        }

        const sort: Record<string, 1 | -1> =
            query.sort === 'popular' ? { likeCount: -1, createdAt: -1 } : { createdAt: -1 };

        const [docs, totalItems] = await Promise.all([
            this.postModel
                .find(filter)
                .sort(sort)
                .skip(query.skip)
                .limit(query.limit)
                .lean<CommunityPostDocument[]>()
                .exec(),
            this.postModel.countDocuments(filter).exec(),
        ]);

        return { docs, totalItems };
    }

    /**
     * 발행 글 피드에 뷰어 기준 열람 제한($or)을 적용한다.
     * - 비로그인: 전체공개만
     * - 로그인: 전체공개 + (팔로우한 작성자의 팔로워공개) + (본인 글 전부)
     */
    private applyVisibilityFilter(filter: FilterQuery<CommunityPost>, query: CommunityPostListQuery): void {
        // 제한 공개(팔로워공개/나만보기) 가 아닌 글 = 전체공개 + 레거시(visibility 미기재) 글.
        const openVisibility: FilterQuery<CommunityPost> = { visibility: { $nin: ['followers', 'private'] } };

        if (!query.viewerId || !Types.ObjectId.isValid(query.viewerId)) {
            filter.visibility = { $nin: ['followers', 'private'] };
            return;
        }
        const viewerObjectId = new Types.ObjectId(query.viewerId);
        const followeeObjectIds = (query.viewerFolloweeIds ?? [])
            .filter((id) => Types.ObjectId.isValid(id))
            .map((id) => new Types.ObjectId(id));

        filter.$or = [
            openVisibility,
            { visibility: 'followers', authorId: { $in: followeeObjectIds } },
            { authorId: viewerObjectId },
        ];
    }

    async findPostById(postId: string): Promise<CommunityPostDocument | null> {
        if (!Types.ObjectId.isValid(postId)) return null;
        return this.postModel
            .findOne({ _id: new Types.ObjectId(postId), isActive: true })
            .lean<CommunityPostDocument>()
            .exec();
    }

    async findPostsByIds(postIds: string[]): Promise<CommunityPostDocument[]> {
        const objectIds = postIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
        if (objectIds.length === 0) return [];
        // 저장 목록은 발행 글만 노출 (임시저장 방어). 레거시(status 미기재) 글은 발행으로 취급.
        return this.postModel
            .find({ _id: { $in: objectIds }, isActive: true, status: { $ne: 'draft' } })
            .lean<CommunityPostDocument[]>()
            .exec();
    }

    /**
     * 게시글 존재 + isActive 만 확인 (전체 도큐먼트 가져오지 않음).
     * 댓글 페이지네이션처럼 후속 페이지에서 가볍게 확인용.
     */
    async existsActivePost(postId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(postId)) return false;
        const found = await this.postModel.exists({ _id: new Types.ObjectId(postId), isActive: true });
        return Boolean(found);
    }

    async createPost(data: CommunityPostCreatePersistData): Promise<{ _id: string }> {
        const created = await this.postModel.create({
            ...data,
            authorId: new Types.ObjectId(data.authorId),
        });
        return { _id: String(created._id) };
    }

    async updatePostByAuthor(
        postId: string,
        authorId: string,
        patch: CommunityPostUpdateCommand,
    ): Promise<{ changed: boolean }> {
        if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(authorId)) {
            return { changed: false };
        }
        const $set: UpdateQuery<CommunityPost>['$set'] = {};
        if (patch.title !== undefined) $set.title = patch.title;
        if (patch.body !== undefined) $set.body = patch.body;
        if (patch.photos !== undefined) $set.photos = patch.photos;
        if (patch.petType !== undefined) $set.petType = patch.petType;
        if (patch.category !== undefined) $set.category = patch.category;
        if (patch.visibility !== undefined) $set.visibility = patch.visibility;
        if (patch.status !== undefined) $set.status = patch.status;

        if (Object.keys($set).length === 0) {
            return { changed: false };
        }

        const result = await this.postModel.updateOne(
            { _id: new Types.ObjectId(postId), authorId: new Types.ObjectId(authorId), isActive: true },
            { $set },
        );
        return { changed: result.modifiedCount > 0 };
    }

    async softDeletePostByAuthor(postId: string, authorId: string): Promise<{ changed: boolean }> {
        if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(authorId)) {
            return { changed: false };
        }
        const result = await this.postModel.updateOne(
            { _id: new Types.ObjectId(postId), authorId: new Types.ObjectId(authorId), isActive: true },
            { $set: { isActive: false } },
        );
        return { changed: result.modifiedCount > 0 };
    }

    async listComments(
        query: CommunityPostCommentListQuery,
    ): Promise<{ docs: CommunityPostCommentDocument[]; totalItems: number }> {
        if (!Types.ObjectId.isValid(query.postId)) {
            return { docs: [], totalItems: 0 };
        }
        const filter: FilterQuery<CommunityPostComment> = {
            postId: new Types.ObjectId(query.postId),
            isActive: true,
        };

        const [docs, totalItems] = await Promise.all([
            this.commentModel
                .find(filter)
                .sort({ createdAt: 1 })
                .skip(query.skip)
                .limit(query.limit)
                .lean<CommunityPostCommentDocument[]>()
                .exec(),
            this.commentModel.countDocuments(filter).exec(),
        ]);

        return { docs, totalItems };
    }

    async incrementViewCount(postId: string): Promise<void> {
        if (!Types.ObjectId.isValid(postId)) return;
        await this.postModel.updateOne({ _id: new Types.ObjectId(postId), isActive: true }, { $inc: { viewCount: 1 } });
    }

    /**
     * 작성자 denormalized snapshot(닉네임/프로필 이미지) 일괄 동기화.
     * 프로필 변경 시 해당 작성자의 모든 게시글·댓글 스냅샷을 최신 값으로 맞춘다.
     * 제공된 필드만 갱신한다.
     */
    async syncAuthorSnapshots(
        authorId: string,
        patch: { nickname?: string; profileImageFileName?: string },
    ): Promise<{ postsModified: number; commentsModified: number }> {
        if (!Types.ObjectId.isValid(authorId)) {
            return { postsModified: 0, commentsModified: 0 };
        }
        const $set: Record<string, string> = {};
        if (patch.nickname !== undefined) $set.authorNickname = patch.nickname;
        if (patch.profileImageFileName !== undefined) $set.authorProfileImageFileName = patch.profileImageFileName;
        if (Object.keys($set).length === 0) {
            return { postsModified: 0, commentsModified: 0 };
        }

        const authorObjectId = new Types.ObjectId(authorId);
        const [posts, comments] = await Promise.all([
            this.postModel.updateMany({ authorId: authorObjectId }, { $set }),
            this.commentModel.updateMany({ authorId: authorObjectId }, { $set }),
        ]);
        return { postsModified: posts.modifiedCount, commentsModified: comments.modifiedCount };
    }

    // ── 댓글 write ──────────────────────────────────────────

    async createComment(data: {
        postId: string;
        authorId: string;
        authorModel: 'Adopter' | 'Breeder';
        authorNickname: string;
        authorProfileImageFileName?: string;
        body: string;
        parentCommentId?: string;
    }): Promise<{ _id: string }> {
        const created = await this.commentModel.create({
            postId: new Types.ObjectId(data.postId),
            authorId: new Types.ObjectId(data.authorId),
            authorModel: data.authorModel,
            authorNickname: data.authorNickname,
            authorProfileImageFileName: data.authorProfileImageFileName,
            body: data.body,
            parentCommentId: data.parentCommentId ? new Types.ObjectId(data.parentCommentId) : null,
        });
        // 게시글 commentCount 동기화
        await this.postModel.updateOne({ _id: new Types.ObjectId(data.postId) }, { $inc: { commentCount: 1 } });
        return { _id: String(created._id) };
    }

    async updateCommentByAuthor(commentId: string, authorId: string, body: string): Promise<{ changed: boolean }> {
        if (!Types.ObjectId.isValid(commentId) || !Types.ObjectId.isValid(authorId)) {
            return { changed: false };
        }
        const result = await this.commentModel.updateOne(
            { _id: new Types.ObjectId(commentId), authorId: new Types.ObjectId(authorId), isActive: true },
            { $set: { body } },
        );
        return { changed: result.modifiedCount > 0 };
    }

    async softDeleteCommentByAuthor(commentId: string, authorId: string): Promise<{ changed: boolean }> {
        if (!Types.ObjectId.isValid(commentId) || !Types.ObjectId.isValid(authorId)) {
            return { changed: false };
        }
        const comment = await this.commentModel
            .findOne({
                _id: new Types.ObjectId(commentId),
                authorId: new Types.ObjectId(authorId),
                isActive: true,
            })
            .lean<CommunityPostCommentDocument>();

        if (!comment) return { changed: false };

        await this.commentModel.updateOne({ _id: new Types.ObjectId(commentId) }, { $set: { isActive: false } });
        // 게시글 commentCount 동기화
        await this.postModel.updateOne(
            { _id: comment.postId, commentCount: { $gt: 0 } },
            { $inc: { commentCount: -1 } },
        );
        return { changed: true };
    }

    async findCommentById(commentId: string): Promise<CommunityPostCommentDocument | null> {
        if (!Types.ObjectId.isValid(commentId)) return null;
        return this.commentModel.findById(new Types.ObjectId(commentId)).lean<CommunityPostCommentDocument>().exec();
    }
}
