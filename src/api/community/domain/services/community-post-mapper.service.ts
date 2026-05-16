import { Inject, Injectable } from '@nestjs/common';

import { COMMUNITY_ASSET_URL_PORT, type CommunityAssetUrlPort } from '../../application/ports/community-asset-url.port';
import type { CommunityPostCommentSnapshot, CommunityPostSnapshot } from '../../application/types/community-post.type';
import type { CommunityPostCommentResponseDto } from '../../dto/response/community-post-comment.dto';
import type { CommunityPostCardResponseDto } from '../../dto/response/community-post-card.dto';
import type { CommunityPostDetailResponseDto } from '../../dto/response/community-post-detail.dto';

/**
 * v2 커뮤니티 — snapshot → 응답 DTO 매퍼.
 *
 * 사진은 AssetUrlPort 추상화로 signed URL 변환 (도메인이 StorageService 직접 의존 금지).
 */
@Injectable()
export class CommunityPostMapperService {
    constructor(
        @Inject(COMMUNITY_ASSET_URL_PORT)
        private readonly assetUrl: CommunityAssetUrlPort,
    ) {}

    toCard(snapshot: CommunityPostSnapshot): CommunityPostCardResponseDto {
        const photoUrls = snapshot.photos
            .map((fileName) => this.assetUrl.toSignedUrl(fileName))
            .filter((url): url is string => !!url);
        return {
            postId: snapshot.postId,
            authorId: snapshot.authorId,
            authorModel: snapshot.authorModel,
            authorNickname: snapshot.authorNickname,
            authorProfileImageUrl: this.assetUrl.toSignedUrl(snapshot.authorProfileImageFileName),
            title: snapshot.title,
            bodyExcerpt: this.excerpt(snapshot.body, 120),
            primaryPhotoUrl: photoUrls[0],
            photoUrls,
            petType: snapshot.petType,
            category: snapshot.category,
            likeCount: snapshot.likeCount,
            commentCount: snapshot.commentCount,
            saveCount: snapshot.saveCount,
            createdAt: snapshot.createdAt.toISOString(),
        };
    }

    toDetail(
        snapshot: CommunityPostSnapshot,
        comments: CommunityPostCommentResponseDto[],
    ): CommunityPostDetailResponseDto {
        const photoUrls = snapshot.photos
            .map((fileName) => this.assetUrl.toSignedUrl(fileName))
            .filter((url): url is string => !!url);
        return {
            postId: snapshot.postId,
            authorId: snapshot.authorId,
            authorModel: snapshot.authorModel,
            authorNickname: snapshot.authorNickname,
            authorProfileImageUrl: this.assetUrl.toSignedUrl(snapshot.authorProfileImageFileName),
            title: snapshot.title,
            body: snapshot.body,
            photoUrls,
            petType: snapshot.petType,
            category: snapshot.category,
            likeCount: snapshot.likeCount,
            commentCount: snapshot.commentCount,
            saveCount: snapshot.saveCount,
            viewCount: snapshot.viewCount,
            createdAt: snapshot.createdAt.toISOString(),
            commentPreview: comments,
        };
    }

    toComment(snapshot: CommunityPostCommentSnapshot): CommunityPostCommentResponseDto {
        return {
            commentId: snapshot.commentId,
            postId: snapshot.postId,
            authorId: snapshot.authorId,
            authorModel: snapshot.authorModel,
            authorNickname: snapshot.authorNickname,
            authorProfileImageUrl: this.assetUrl.toSignedUrl(snapshot.authorProfileImageFileName),
            parentCommentId: snapshot.parentCommentId,
            body: snapshot.body,
            likeCount: snapshot.likeCount,
            createdAt: snapshot.createdAt.toISOString(),
        };
    }

    private excerpt(body: string, max: number): string {
        if (body.length <= max) return body;
        return body.slice(0, max).trimEnd() + '…';
    }
}
