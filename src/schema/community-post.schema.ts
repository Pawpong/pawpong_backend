import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommunityPostDocument = CommunityPost &
    Document & {
        _id: Types.ObjectId;
        createdAt: Date;
        updatedAt: Date;
    };

/**
 * v2 커뮤니티 게시글 (Figma 21:2 / 315:5433).
 *
 * 작성자는 입양자/브리더 둘 다 가능 — authorModel 로 분기.
 * 카테고리는 petType(enum) + category(자유 text, 품종 등) 조합.
 * 카운터(likeCount/commentCount/saveCount/viewCount)는 토글/조회 use-case 가 갱신한다 (이번 slice 는 read-only 라 default 0).
 *
 * 작성자 메타(nickname/profileImageFileName)는 작성 시점에 denormalized 로 임베드 — read 쪽에서 join 비용을 줄인다.
 * 닉네임 변경 시 동기화는 별도 이벤트로 처리(추후).
 */
@Schema({ timestamps: true, collection: 'community_posts' })
export class CommunityPost {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    authorId: Types.ObjectId;

    @Prop({ type: String, enum: ['Adopter', 'Breeder'], required: true })
    authorModel: 'Adopter' | 'Breeder';

    /** 작성 시점 작성자 닉네임 스냅샷 */
    @Prop({ type: String, required: true })
    authorNickname: string;

    /** 작성 시점 작성자 프로필 사진 파일명 스냅샷 (signed URL 은 응답 직전에 발급) */
    @Prop({ type: String })
    authorProfileImageFileName?: string;

    @Prop({ type: String, maxlength: 100 })
    title?: string;

    /**
     * 본문. 발행(published) 글은 도메인 validator 가 비어있지 않음을 강제하지만,
     * 임시저장(draft) 은 미완성 상태 저장을 허용하므로 스키마 레벨에서는 required 로 막지 않는다.
     */
    @Prop({ type: String, required: false, default: '', maxlength: 2000 })
    body: string;

    @Prop({ type: [String], default: [] })
    photos: string[];

    /** 동물 종류 카테고리 (강아지/고양이/도마뱀) */
    @Prop({ type: String, enum: ['dog', 'cat', 'reptile'], index: true })
    petType?: 'dog' | 'cat' | 'reptile';

    /** 자유 카테고리 텍스트 (품종명 등). Figma 사이드바의 "비숑/스핑크스/레오파드" 매칭 */
    @Prop({ type: String, maxlength: 50, index: true })
    category?: string;

    @Prop({ type: Number, default: 0, min: 0 })
    likeCount: number;

    @Prop({ type: Number, default: 0, min: 0 })
    commentCount: number;

    @Prop({ type: Number, default: 0, min: 0 })
    saveCount: number;

    @Prop({ type: Number, default: 0, min: 0 })
    viewCount: number;

    /**
     * 공개 범위 (Figma 글 작성 하단 선택).
     * - public: 전체공개 — 누구나 열람
     * - followers: 팔로워공개 — 작성자 본인 + 작성자를 팔로우한 사용자만 열람
     * - private: 나만보기 — 작성자 본인만 열람
     * 열람 제한은 list/detail use-case 에서 뷰어-작성자 관계로 게이팅한다.
     */
    @Prop({ type: String, enum: ['public', 'followers', 'private'], default: 'public', index: true })
    visibility: 'public' | 'followers' | 'private';

    /**
     * 발행 상태.
     * - published: 피드/상세에 노출되는 정식 게시글
     * - draft: 임시저장 — 작성자 본인에게만, '내 임시저장' 목록에서만 노출
     */
    @Prop({ type: String, enum: ['draft', 'published'], default: 'published', index: true })
    status: 'draft' | 'published';

    /** 소프트 삭제 플래그 */
    @Prop({ type: Boolean, default: true, index: true })
    isActive: boolean;
}

export const CommunityPostSchema = SchemaFactory.createForClass(CommunityPost);

// 목록 정렬 + 필터용 복합 인덱스 (피드는 status=published + isActive=true 가 기본 전제)
CommunityPostSchema.index({ isActive: 1, status: 1, createdAt: -1 });
CommunityPostSchema.index({ isActive: 1, status: 1, petType: 1, createdAt: -1 });
CommunityPostSchema.index({ isActive: 1, status: 1, category: 1, createdAt: -1 });
CommunityPostSchema.index({ isActive: 1, status: 1, likeCount: -1, createdAt: -1 });
CommunityPostSchema.index({ isActive: 1, status: 1, visibility: 1, createdAt: -1 });
// 작성자별(마이홈/임시저장) + 팔로워공개 열람 판정용
CommunityPostSchema.index({ authorId: 1, isActive: 1, status: 1, createdAt: -1 });
