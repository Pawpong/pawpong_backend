import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * 프로필 배너 스키마
 * 관리자 프로필 화면 좌측 배너 정보
 */
@Schema({ collection: 'auth_banners', timestamps: true })
export class AuthBanner {
    /**
     * 배너 이미지 파일명
     * @example "profile-banners/uuid.png"
     */
    @Prop({ required: true })
    imageFileName: string;

    /**
     * 배너 타입 (로그인 페이지 또는 회원가입 페이지)
     * login: 로그인 페이지 배너
     * signup: 회원가입 페이지 배너
     * @example "login"
     */
    @Prop({ enum: ['login', 'signup'], required: true, default: 'login' })
    bannerType: string;

    /**
     * 링크 타입 (선택)
     * internal: 서비스 내부 링크
     * external: 외부 웹 링크
     * @example "internal"
     */
    @Prop({ enum: ['internal', 'external'] })
    linkType?: string;

    /**
     * 링크 URL (선택)
     * @example "/breeders/management"
     */
    @Prop()
    linkUrl?: string;

    /**
     * 정렬 순서 (낮을수록 먼저 표시)
     * @example 1
     */
    @Prop({ required: true, default: 0 })
    order: number;

    /**
     * 활성화 여부
     * @example true
     */
    @Prop({ default: true })
    isActive: boolean;

    /**
     * 배너 제목 (선택, 관리용)
     * @example "브리더 관리 바로가기"
     */
    @Prop()
    title?: string;

    /**
     * 배너 설명 (선택, 관리용)
     * @example "브리더 승인 및 관리"
     */
    @Prop()
    description?: string;
}

export type AuthBannerDocument = AuthBanner & Document;
export const AuthBannerSchema = SchemaFactory.createForClass(AuthBanner);

// 인덱스 생성
AuthBannerSchema.index({ bannerType: 1, isActive: 1, order: 1 });
